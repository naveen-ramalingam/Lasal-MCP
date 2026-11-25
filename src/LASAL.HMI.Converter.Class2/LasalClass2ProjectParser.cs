using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;

namespace LASAL.HMI.Converter.Class2;

/// <summary>
/// Parses SIGMATEK LASAL CLASS 2 (.lcp, .lcn, .lsm, .lss, .st) and MaeExp.txt server export files
/// to enrich datapoints, stations, initial values, and custom PLC UI classes (_MyIO, _Global, _ScrollArea2, _Screen).
/// </summary>
public sealed class LasalClass2ProjectParser
{
    private static readonly HashSet<string> KnownUiBaseClasses = new(StringComparer.OrdinalIgnoreCase)
    {
        "_MyIO",
        "_ScrollArea",
        "_ScrollArea2",
        "_Screen",
        "_Global",
        "_AlarmDisplay",
        "_HotAlarm"
    };

    /// <summary>
    /// Searches parent and sibling directories of the .lpr file for an associated LASAL CLASS 2 (.lcp or .lsm) project.
    /// </summary>
    public string? TryAutoDiscoverClass2Project(string lprFilePath)
    {
        try
        {
            var dir = Path.GetDirectoryName(Path.GetFullPath(lprFilePath));
            for (var depth = 0; depth < 4 && !string.IsNullOrEmpty(dir); depth++)
            {
                var lsmFiles = Directory.GetFiles(dir, "*.lsm", SearchOption.TopDirectoryOnly);
                if (lsmFiles.Length > 0)
                {
                    return lsmFiles[0];
                }

                // Only search subdirectories if we are inside a project/Stations folder, not at repository root containing reference/examples
                var subSearchOption = (File.Exists(Path.Combine(dir, "LASAL.HMI.Converter.sln")) || Directory.Exists(Path.Combine(dir, "reference")))
                    ? SearchOption.TopDirectoryOnly
                    : SearchOption.AllDirectories;

                var lcpFiles = Directory.GetFiles(dir, "*.lcp", subSearchOption);
                if (lcpFiles.Length > 0)
                {
                    // Prefer PLC station (e.g., Control/PLC) or first available .lcp
                    var preferred = lcpFiles.FirstOrDefault(f =>
                        !f.Contains("Terminal", StringComparison.OrdinalIgnoreCase)) ?? lcpFiles[0];
                    return preferred;
                }

                dir = Path.GetDirectoryName(dir);
            }
        }
        catch
        {
            // Ignore discovery traversal errors
        }
        return null;
    }

    /// <summary>
    /// Enriches the intermediate model with LASAL CLASS 2 stations, server metadata, and custom _MyIO/_Global/_ScrollArea2/_Screen classes.
    /// </summary>
    public void EnrichFromClass2Solution(HmiIntermediateModel model, string class2Path)
    {
        ArgumentNullException.ThrowIfNull(model);
        if (string.IsNullOrWhiteSpace(class2Path) || !File.Exists(class2Path))
        {
            return;
        }

        var fullPath = Path.GetFullPath(class2Path);
        model.ProjectMetadata.SourceClass2ProjectPath = fullPath;
        var rootDir = Path.GetDirectoryName(fullPath) ?? string.Empty;

        // If a .lsm Station Manager file was given, walk the solution root
        var lcpFiles = fullPath.EndsWith(".lcp", StringComparison.OrdinalIgnoreCase)
            ? Directory.GetFiles(Path.GetDirectoryName(rootDir) ?? rootDir, "*.lcp", SearchOption.AllDirectories)
            : Directory.GetFiles(rootDir, "*.lcp", SearchOption.AllDirectories);

        if (lcpFiles.Length == 0 && fullPath.EndsWith(".lcp", StringComparison.OrdinalIgnoreCase))
        {
            lcpFiles = new[] { fullPath };
        }

        var objectClassMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var serverInitValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var lcp in lcpFiles)
        {
            var lcpDir = Path.GetDirectoryName(lcp) ?? string.Empty;

            // Parse any MaeExp.txt in the station folder
            foreach (var maeFile in Directory.GetFiles(lcpDir, "*MaeExp*.txt", SearchOption.AllDirectories))
            {
                ParseMaeExpFile(maeFile, model);
            }

            // Parse .lcn network files for object instances and initial values
            foreach (var lcnFile in Directory.GetFiles(lcpDir, "*.lcn", SearchOption.AllDirectories))
            {
                ParseLcnNetworkFile(lcnFile, objectClassMap, serverInitValues);
            }

            // Parse .st Structured Text class files for server types and custom UI base classes
            foreach (var stFile in Directory.GetFiles(lcpDir, "*.st", SearchOption.AllDirectories))
            {
                ParseStructuredTextClassFile(stFile, objectClassMap, model);
            }
        }

        // Apply discovered class names and initial values to existing datapoints
        foreach (var dp in model.Datapoints)
        {
            if (string.IsNullOrEmpty(dp.ClassName) &&
                !string.IsNullOrEmpty(dp.ObjectName) &&
                objectClassMap.TryGetValue(dp.ObjectName, out var clsName))
            {
                dp.ClassName = clsName;
            }

            if (string.IsNullOrEmpty(dp.InitialValue) &&
                serverInitValues.TryGetValue(dp.SymbolPath, out var initVal))
            {
                dp.InitialValue = initVal;
            }
        }
    }

    /// <summary>
    /// Parses a LASAL MaeExp.txt (or ExportServerlist output) file and merges discovered servers into the model.
    /// </summary>
    public void ParseMaeExpFile(string filePath, HmiIntermediateModel model)
    {
        if (!File.Exists(filePath))
        {
            return;
        }

        try
        {
            var lines = File.ReadAllLines(filePath, Encoding.Latin1);
            var existingBySymbol = model.Datapoints.ToDictionary(d => d.SymbolPath, StringComparer.OrdinalIgnoreCase);
            var currentObject = string.Empty;
            var currentClass = string.Empty;

            foreach (var rawLine in lines)
            {
                var line = rawLine.Trim();
                if (string.IsNullOrEmpty(line) || line.StartsWith("//") || line.StartsWith(";"))
                {
                    continue;
                }

                // Match object header or server row in MaeExp.txt / LSE server export
                // Common patterns:
                //   OBJECT "Pump1" : "PumpClass" ...
                //   "Pump1.ActFlow" BINARY STATION=1 ...
                var objMatch = Regex.Match(line, @"OBJECT\s+""?(?<obj>[A-Za-z0-9_]+)""?\s*:\s*""?(?<cls>[A-Za-z0-9_]+)""?", RegexOptions.IgnoreCase);
                if (objMatch.Success)
                {
                    currentObject = objMatch.Groups["obj"].Value;
                    currentClass = objMatch.Groups["cls"].Value;
                    continue;
                }

                var srvMatch = Regex.Match(line, @"^""?(?<sym>[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)""?\s+(?<type>BINARY|STRING|TIME_LSE|DATE_LSE|BIT|MERKER)", RegexOptions.IgnoreCase);
                if (srvMatch.Success)
                {
                    var symbol = srvMatch.Groups["sym"].Value;
                    var varType = srvMatch.Groups["type"].Value.ToUpperInvariant();
                    if (!existingBySymbol.TryGetValue(symbol, out var dp))
                    {
                        var parts = symbol.Split('.');
                        dp = new DatapointModel
                        {
                            Id = symbol,
                            VarNo = model.Datapoints.Count,
                            SymbolPath = symbol,
                            ObjectName = parts.Length > 1 ? string.Join(".", parts[..^1]) : currentObject,
                            ServerName = parts[^1],
                            ClassName = currentClass,
                            LseVarType = varType,
                            PlcDataType = varType == "STRING" ? "STRING" : "DINT",
                            VisuDataType = varType == "STRING" ? "STRING" : "INT"
                        };
                        model.Datapoints.Add(dp);
                        existingBySymbol[symbol] = dp;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning parsing MaeExp file '{filePath}': {ex.Message}");
        }
    }

    private static void ParseLcnNetworkFile(
        string lcnFilePath,
        Dictionary<string, string> objectClassMap,
        Dictionary<string, string> serverInitValues)
    {
        try
        {
            var doc = XDocument.Load(lcnFilePath);
            foreach (var objElem in doc.Descendants("Object"))
            {
                var objName = objElem.Attribute("Name")?.Value;
                var clsName = objElem.Attribute("Class")?.Value;
                if (!string.IsNullOrWhiteSpace(objName) && !string.IsNullOrWhiteSpace(clsName))
                {
                    objectClassMap[objName] = clsName;

                    foreach (var ch in objElem.Elements("Channels").Elements("Server"))
                    {
                        var srvName = ch.Attribute("Name")?.Value;
                        var initVal = ch.Attribute("Value")?.Value;
                        if (!string.IsNullOrWhiteSpace(srvName) && !string.IsNullOrWhiteSpace(initVal))
                        {
                            serverInitValues[$"{objName}.{srvName}"] = initVal;
                        }
                    }
                }
            }
        }
        catch
        {
            // Ignore malformed XML
        }
    }

    private static void ParseStructuredTextClassFile(
        string stFilePath,
        Dictionary<string, string> objectClassMap,
        HmiIntermediateModel model)
    {
        try
        {
            var content = File.ReadAllText(stFilePath, Encoding.Latin1);
            var classFileName = Path.GetFileNameWithoutExtension(stFilePath);

            // Detect inheritance: ": _MyIO", ": _ScrollArea2", ": _Screen", ": _Global"
            string? detectedBase = null;
            foreach (var baseCls in KnownUiBaseClasses)
            {
                if (Regex.IsMatch(content, $@"\b{Regex.Escape(baseCls)}\b", RegexOptions.IgnoreCase) &&
                    (content.Contains($"{baseCls}::", StringComparison.OrdinalIgnoreCase) ||
                     content.Contains($"\"_base\"=\"{baseCls}\"", StringComparison.OrdinalIgnoreCase) ||
                     content.Contains($"Base=\"{baseCls}\"", StringComparison.OrdinalIgnoreCase) ||
                     Regex.IsMatch(content, $@"FUNCTION\s+VIRTUAL\s+GLOBAL\s+(?:IF_WindowRun|IF_Recalculate|Draw|GetData|GetEvent|Line|S_Start)\b", RegexOptions.IgnoreCase)))
                {
                    detectedBase = baseCls;
                    break;
                }
            }

            if (detectedBase == null)
            {
                return;
            }

            if (model.CustomPlcUiClasses.Any(c => string.Equals(c.ClassName, classFileName, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            var methods = new List<string>();
            foreach (Match m in Regex.Matches(content, @"FUNCTION\s+(?:VIRTUAL\s+)?GLOBAL\s+[A-Za-z0-9_]+::(?<m>[A-Za-z0-9_]+)", RegexOptions.IgnoreCase))
            {
                var methodName = m.Groups["m"].Value;
                if (!methods.Contains(methodName, StringComparer.OrdinalIgnoreCase))
                {
                    methods.Add(methodName);
                }
            }

            var instances = objectClassMap
                .Where(kvp => string.Equals(kvp.Value, classFileName, StringComparison.OrdinalIgnoreCase))
                .Select(kvp => kvp.Key)
                .ToList();

            var pattern = InferWidgetPattern(classFileName, detectedBase, content);

            model.CustomPlcUiClasses.Add(new CustomPlcUiClassModel
            {
                ClassName = classFileName,
                BaseClassName = detectedBase,
                ObjectInstanceNames = instances,
                SourceFilePath = stFilePath,
                OverriddenMethods = methods,
                InferredPattern = pattern,
                ExtractedStructuredTextCode = content.Length > 12000 ? content[..12000] : content
            });
        }
        catch
        {
            // Ignore read errors
        }
    }

    private static string InferWidgetPattern(string className, string baseClass, string stCode)
    {
        if (string.Equals(baseClass, "_ScrollArea2", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(baseClass, "_ScrollArea", StringComparison.OrdinalIgnoreCase))
        {
            if (stCode.Contains("DragDropArea", StringComparison.OrdinalIgnoreCase) ||
                className.Contains("Icon", StringComparison.OrdinalIgnoreCase))
            {
                return "DragDropScrollList";
            }
            return "ScrollTable";
        }

        if (string.Equals(baseClass, "_Screen", StringComparison.OrdinalIgnoreCase) ||
            stCode.Contains("add_carousel", StringComparison.OrdinalIgnoreCase))
        {
            return "DynamicCarousel";
        }

        if (string.Equals(baseClass, "_Global", StringComparison.OrdinalIgnoreCase))
        {
            return "GlobalHook";
        }

        if (stCode.Contains("pio^.theurge", StringComparison.OrdinalIgnoreCase) ||
            className.Contains("ColorBar", StringComparison.OrdinalIgnoreCase))
        {
            return "ColorBarUdc";
        }

        if (className.Contains("Indicator", StringComparison.OrdinalIgnoreCase) ||
            (stCode.Contains("sin(", StringComparison.OrdinalIgnoreCase) && stCode.Contains("cos(", StringComparison.OrdinalIgnoreCase)))
        {
            return "AnalogGauge";
        }

        if (stCode.Contains("NewDoScheme", StringComparison.OrdinalIgnoreCase) &&
            stCode.Contains("IMAGESCHEME", StringComparison.OrdinalIgnoreCase))
        {
            return "ImageSchemeAnimator";
        }

        if (stCode.Contains("_EVENT_HIDMOVE", StringComparison.OrdinalIgnoreCase))
        {
            return "TouchInteractiveMyIo";
        }

        return "CustomDrawingMyIo";
    }
}
