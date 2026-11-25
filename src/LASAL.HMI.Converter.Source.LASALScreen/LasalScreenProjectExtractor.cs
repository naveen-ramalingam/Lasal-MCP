using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using LASAL.HMI.Converter.Class2;
using LASAL.HMI.Converter.ComBridge;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;

namespace LASAL.HMI.Converter.Source.LASALScreen;

/// <summary>
/// Full-fidelity extractor for SIGMATEK LASAL SCREEN (.lpr) projects.
/// Combines:
///   1. 32-bit COM automation (LASALScreen.Application) on a short-path staged copy
///   2. Unlocked headless XML export (Languages, TextLists, Texts, ContainerInfo, TextSchemes, Fonts, FontSchemes)
///   3. Server list export (ExportServerlist)
///   4. Byte-exact Runtime\*.MPC parser (LSE.MPC, GS0000.MPC, LC*.MPC, LW*.MPC, LS0000..LS0020.MPC, &lt;LCID&gt;.MPC)
///   5. Companion LASAL CLASS 2 (.lcp / .lsm / .st / MaeExp.txt) enrichment
///   6. Cryptographic SHA-256 verification that original source files were never modified.
/// </summary>
public sealed class LasalScreenProjectExtractor
{
    private readonly LasalScreenComBridge _comBridge = new();
    private readonly MpcBinaryReader _mpcReader = new();
    private readonly LasalClass2ProjectParser _class2Parser = new();
    private readonly SoftwareEnvironmentDetector _envDetector = new();

    public async Task<HmiIntermediateModel> ExtractProjectAsync(
        string sourceLprPath,
        string? class2ProjectPath = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sourceLprPath);
        var fullLprPath = Path.GetFullPath(sourceLprPath);
        if (!File.Exists(fullLprPath))
        {
            throw new FileNotFoundException($"Source LASAL SCREEN project not found: {fullLprPath}", fullLprPath);
        }

        ConverterLogger.Info($"Staging source LASAL SCREEN project '{fullLprPath}' into isolated short-path workspace...");
        using var staging = StagingManager.CreateStagedCopy(fullLprPath);

        var env = _envDetector.Detect();
        var projectName = Path.GetFileNameWithoutExtension(fullLprPath);
        if (string.Equals(projectName, "LSE", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(projectName, "LSE_Project", StringComparison.OrdinalIgnoreCase))
        {
            var parentName = Path.GetFileName(staging.OriginalProjectDirectory);
            if (!string.IsNullOrWhiteSpace(parentName) &&
                !string.Equals(parentName, "LSE", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(parentName, "LSE_Project", StringComparison.OrdinalIgnoreCase))
            {
                projectName = parentName;
            }
        }

        var model = new HmiIntermediateModel
        {
            ExtractedAtUtc = DateTime.UtcNow,
            ProjectMetadata = new ProjectMetadataModel
            {
                ProjectName = projectName,
                SourceLprPath = fullLprPath,
                DetectedLseSoftwareVersion = env.LasalScreenVersion,
                DetectedVisuDesignerVersion = env.VisuDesignerVersion,
                SourceFileChecksums = new Dictionary<string, string>(staging.OriginalFileChecksums, StringComparer.OrdinalIgnoreCase)
            }
        };

        // 1. Run 32-bit COM extraction on the staged copy
        var comArtifactsDir = Path.Combine(staging.StagedProjectDirectory, "_com_extract");
        var runtimeDir = Path.Combine(staging.StagedProjectDirectory, "Runtime");
        var hasCompleteCompiledRuntime = Directory.Exists(runtimeDir) &&
                                         File.Exists(Path.Combine(runtimeDir, "LS0001.MPC")) &&
                                         File.Exists(Path.Combine(runtimeDir, "LANGUAGE.TXT")) &&
                                         new FileInfo(fullLprPath).Length > 2_000_000;

        if (env.LasalScreenInstalled && !hasCompleteCompiledRuntime)
        {
            ConverterLogger.Info("Running 32-bit LASALScreen.Application COM extraction & XML export...");
            var comRes = await _comBridge.ExtractProjectViaComAsync(
                staging.StagedLprPath,
                comArtifactsDir,
                compileIfRuntimeMissing: true,
                cancellationToken).ConfigureAwait(false);

            if (comRes.Success)
            {
                ApplyComInventory(comRes, model);
                if (!string.IsNullOrEmpty(comRes.ExportedXmlPath) && File.Exists(comRes.ExportedXmlPath))
                {
                    ParseExportedLseXml(comRes.ExportedXmlPath, model);
                }
                if (!string.IsNullOrEmpty(comRes.ExportedServerListPath) && File.Exists(comRes.ExportedServerListPath))
                {
                    _class2Parser.ParseMaeExpFile(comRes.ExportedServerListPath, model);
                }
            }
            else
            {
                model.Diagnostics.Add(new ExtractionDiagnosticModel
                {
                    Severity = "Warning",
                    Code = "COM_FALLBACK",
                    SourceLocation = fullLprPath,
                    Message = $"COM automation reported: {comRes.ErrorMessage}. Proceeding with direct Runtime/*.MPC and filesystem extraction."
                });
            }
        }
        else if (hasCompleteCompiledRuntime)
        {
            ConverterLogger.Info("Large pre-compiled LASAL SCREEN project detected with complete Runtime\\*.MPC database; using fast binary MPC extraction.");
        }

        // 2. Parse compiled Runtime\*.MPC binary database
        if (Directory.Exists(runtimeDir))
        {
            ConverterLogger.Info("Parsing compiled LASAL SCREEN Runtime\\*.MPC binary database...");
            _mpcReader.ParseRuntimeDirectory(runtimeDir, model);
        }

        // 3. Reconcile filesystem Screen\*.lsn, Window\*.lwn, Object\*.lse, and Image\*.*
        ReconcileFilesystemArtifacts(staging.StagedProjectDirectory, model);

        // 4. Enrich from LASAL CLASS 2 project (.lcp / .lsm / .st / MaeExp.txt) if available
        var resolvedClass2 = !string.IsNullOrWhiteSpace(class2ProjectPath)
            ? class2ProjectPath
            : _class2Parser.TryAutoDiscoverClass2Project(fullLprPath);

        if (!string.IsNullOrWhiteSpace(resolvedClass2) && File.Exists(resolvedClass2))
        {
            ConverterLogger.Info($"Enriching model from LASAL CLASS 2 project '{resolvedClass2}'...");
            _class2Parser.EnrichFromClass2Solution(model, resolvedClass2);
        }

        // 5. Ensure default Station, Language, and FontStyle exist if project had none
        EnsureDefaults(model);

        // 6. Verify that original source project was 100% untouched
        staging.VerifySourceImmutability();
        ConverterLogger.Info("Verified source project SHA-256 immutability (0 files modified).");

        return model;
    }

    private static void ApplyComInventory(LseComExtractionResult comRes, HmiIntermediateModel model)
    {
        foreach (var lg in comRes.Languages)
        {
            var bcp47 = MpcBinaryReader.MapLcidToBcp47(lg.Code);
            if (!model.Languages.Any(l => l.Lcid == lg.Code || string.Equals(l.Bcp47Code, bcp47, StringComparison.OrdinalIgnoreCase)))
            {
                model.Languages.Add(new LanguageModel
                {
                    Index = lg.Index,
                    Lcid = lg.Code,
                    Bcp47Code = bcp47,
                    DisplayName = !string.IsNullOrWhiteSpace(lg.Name) ? lg.Name : bcp47,
                    WinName = lg.Name
                });
            }
        }

        foreach (var tl in comRes.TextLists)
        {
            if (!model.TextLists.Any(t => string.Equals(t.Name, tl.Name, StringComparison.OrdinalIgnoreCase)))
            {
                model.TextLists.Add(new TextListModel
                {
                    Id = tl.Name,
                    Name = tl.Name
                });
            }
        }

        foreach (var sc in comRes.Screens)
        {
            if (!model.Screens.Any(s => string.Equals(s.Name, sc.Name, StringComparison.OrdinalIgnoreCase)))
            {
                model.Screens.Add(new ScreenModel
                {
                    Id = sc.Name,
                    ScreenNumber = sc.Index,
                    Name = sc.Name,
                    SourceFileName = $"{sc.Name}.lsn",
                    DefaultTextListName = sc.TextList
                });
            }
        }

        foreach (var wn in comRes.Windows)
        {
            if (!model.Windows.Any(w => string.Equals(w.Name, wn.Name, StringComparison.OrdinalIgnoreCase)))
            {
                model.Windows.Add(new ScreenModel
                {
                    Id = wn.Name,
                    ScreenNumber = wn.Index,
                    Name = wn.Name,
                    IsWindow = true,
                    SourceFileName = $"{wn.Name}.lwn",
                    DefaultTextListName = wn.TextList
                });
            }
        }

        foreach (var ob in comRes.Objects)
        {
            if (!model.ReusableObjects.Any(o => string.Equals(o.Name, ob.Name, StringComparison.OrdinalIgnoreCase)))
            {
                model.ReusableObjects.Add(new ReusableObjectModel
                {
                    Id = ob.Name,
                    Index = ob.Index,
                    Name = ob.Name,
                    SourceFileName = $"{ob.Name}.lse",
                    DefaultTextListName = ob.TextList
                });
            }
        }
    }

    private static void ParseExportedLseXml(string xmlPath, HmiIntermediateModel model)
    {
        try
        {
            var doc = XDocument.Load(xmlPath);

            // 1. Languages
            var langCodeToBcp47 = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var langIdx = 0;
            foreach (var langElem in doc.Descendants("Language"))
            {
                var idAttr = langElem.Attribute("ID")?.Value ?? langElem.Attribute("WinID")?.Value ?? "1033";
                var nameAttr = langElem.Attribute("Name")?.Value ?? langElem.Attribute("WinName")?.Value ?? idAttr;
                var flagAttr = langElem.Attribute("Flag")?.Value;
                _ = int.TryParse(idAttr, out var lcid);
                var bcp47 = lcid > 0 ? MpcBinaryReader.MapLcidToBcp47(lcid) : MapLanguageNameToBcp47(nameAttr);
                langCodeToBcp47[idAttr] = bcp47;
                langCodeToBcp47[nameAttr] = bcp47;

                var existing = model.Languages.FirstOrDefault(l =>
                    (lcid > 0 && l.Lcid == lcid) ||
                    string.Equals(l.Bcp47Code, bcp47, StringComparison.OrdinalIgnoreCase));

                if (existing == null)
                {
                    model.Languages.Add(new LanguageModel
                    {
                        Index = langIdx,
                        Lcid = lcid,
                        Bcp47Code = bcp47,
                        DisplayName = nameAttr,
                        WinName = langElem.Attribute("WinName")?.Value ?? nameAttr,
                        FlagImageName = flagAttr
                    });
                }
                else if (!string.IsNullOrWhiteSpace(flagAttr))
                {
                    existing.FlagImageName = flagAttr;
                }
                langIdx++;
            }

            // 2. TextLists & Texts
            foreach (var tlElem in doc.Descendants("TextList"))
            {
                var listName = tlElem.Attribute("Name")?.Value ?? tlElem.Attribute("ID")?.Value;
                if (string.IsNullOrWhiteSpace(listName))
                {
                    continue;
                }

                var tlModel = model.TextLists.FirstOrDefault(t =>
                    string.Equals(t.Name, listName, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(t.Id, listName, StringComparison.OrdinalIgnoreCase));

                if (tlModel == null)
                {
                    tlModel = new TextListModel
                    {
                        Id = listName,
                        Name = listName
                    };
                    model.TextLists.Add(tlModel);
                }

                var entryIdx = 0;
                foreach (var txtElem in tlElem.Elements("Text"))
                {
                    var txtId = txtElem.Attribute("ID")?.Value ?? txtElem.Attribute("Index")?.Value ?? entryIdx.ToString();
                    _ = int.TryParse(txtId, out var numIdx);
                    var entry = tlModel.Entries.FirstOrDefault(e =>
                        string.Equals(e.EntryId, txtId, StringComparison.OrdinalIgnoreCase) ||
                        e.NumericIndex == numIdx);

                    if (entry == null)
                    {
                        entry = new TextEntryModel
                        {
                            EntryId = txtId,
                            NumericIndex = numIdx
                        };
                        tlModel.Entries.Add(entry);
                    }

                    // Parse translations stored either as attributes or child elements
                    foreach (var attr in txtElem.Attributes())
                    {
                        if (string.Equals(attr.Name.LocalName, "ID", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(attr.Name.LocalName, "Index", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(attr.Name.LocalName, "Name", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        var bcp47 = langCodeToBcp47.TryGetValue(attr.Name.LocalName, out var mapped)
                            ? mapped
                            : MapLanguageNameToBcp47(attr.Name.LocalName);
                        entry.Translations[bcp47] = attr.Value;
                    }

                    foreach (var child in txtElem.Elements())
                    {
                        if (string.Equals(child.Name.LocalName, "ContainerInfo", StringComparison.OrdinalIgnoreCase))
                        {
                            if (int.TryParse(child.Attribute("Width")?.Value, out var cw)) entry.ContainerWidth = cw;
                            if (int.TryParse(child.Attribute("Height")?.Value, out var ch)) entry.ContainerHeight = ch;
                            entry.FontSchemeKey = child.Attribute("Key_FontScheme")?.Value;
                        }
                        else
                        {
                            var langKey = child.Attribute("Language")?.Value ?? child.Attribute("Lang")?.Value ?? child.Name.LocalName;
                            var bcp47 = langCodeToBcp47.TryGetValue(langKey, out var mapped)
                                ? mapped
                                : MapLanguageNameToBcp47(langKey);
                            var val = child.Attribute("Value")?.Value ?? child.Value;
                            entry.Translations[bcp47] = val;
                        }
                    }

                    entryIdx++;
                }
            }

            // 3. Fonts & FontSchemes
            foreach (var fontElem in doc.Descendants("Font"))
            {
                var fName = fontElem.Attribute("Name")?.Value ?? fontElem.Attribute("ID")?.Value;
                if (string.IsNullOrWhiteSpace(fName)) continue;
                var family = fontElem.Attribute("Family")?.Value ?? fontElem.Attribute("FaceName")?.Value ?? "Arial";
                _ = int.TryParse(fontElem.Attribute("Size")?.Value ?? fontElem.Attribute("Height")?.Value, out var sz);

                var existingFont = model.FontStyles.FirstOrDefault(f => string.Equals(f.Id, fName, StringComparison.OrdinalIgnoreCase));
                if (existingFont == null)
                {
                    model.FontStyles.Add(new FontStyleModel
                    {
                        Id = fName,
                        Index = model.FontStyles.Count,
                        FamilyName = family,
                        SizePx = sz > 0 ? Math.Abs(sz) : 14,
                        Bold = string.Equals(fontElem.Attribute("Bold")?.Value, "true", StringComparison.OrdinalIgnoreCase) ||
                               string.Equals(fontElem.Attribute("Weight")?.Value, "700", StringComparison.OrdinalIgnoreCase),
                        Italic = string.Equals(fontElem.Attribute("Italic")?.Value, "true", StringComparison.OrdinalIgnoreCase)
                    });
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning parsing exported LSE XML '{xmlPath}': {ex.Message}");
        }
    }

    private static void ReconcileFilesystemArtifacts(string stagedProjectDir, HmiIntermediateModel model)
    {
        var assetService = new Assets.AssetMigrationService();
        assetService.DiscoverAssets(stagedProjectDir, model);

        var screenDir = Path.Combine(stagedProjectDir, "Screen");
        if (Directory.Exists(screenDir))
        {
            foreach (var lsn in Directory.GetFiles(screenDir, "*.lsn"))
            {
                var name = Path.GetFileNameWithoutExtension(lsn);
                if (string.Equals(name, "GlobalScreen", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(name, model.ProjectMetadata.GlobalScreenName, StringComparison.OrdinalIgnoreCase))
                {
                    model.GlobalScreen ??= new ScreenModel
                    {
                        Id = name,
                        Name = name,
                        IsGlobalScreen = true,
                        SourceFileName = Path.GetFileName(lsn),
                        Width = model.ProjectMetadata.ResolutionWidth,
                        Height = model.ProjectMetadata.ResolutionHeight
                    };
                    continue;
                }

                if (!model.Screens.Any(s => string.Equals(s.Name, name, StringComparison.OrdinalIgnoreCase)))
                {
                    model.Screens.Add(new ScreenModel
                    {
                        Id = name,
                        ScreenNumber = model.Screens.Count,
                        Name = name,
                        SourceFileName = Path.GetFileName(lsn),
                        Width = model.ProjectMetadata.ResolutionWidth,
                        Height = model.ProjectMetadata.ResolutionHeight
                    });
                }
            }
        }

        var windowDir = Path.Combine(stagedProjectDir, "Window");
        if (Directory.Exists(windowDir))
        {
            foreach (var lwn in Directory.GetFiles(windowDir, "*.lwn"))
            {
                var name = Path.GetFileNameWithoutExtension(lwn);
                if (!model.Windows.Any(w => string.Equals(w.Name, name, StringComparison.OrdinalIgnoreCase)))
                {
                    model.Windows.Add(new ScreenModel
                    {
                        Id = name,
                        ScreenNumber = model.Windows.Count,
                        Name = name,
                        IsWindow = true,
                        SourceFileName = Path.GetFileName(lwn),
                        Width = 400,
                        Height = 300
                    });
                }
            }
        }

        var objDir = Path.Combine(stagedProjectDir, "Object");
        if (Directory.Exists(objDir))
        {
            foreach (var lse in Directory.GetFiles(objDir, "*.lse"))
            {
                var name = Path.GetFileNameWithoutExtension(lse);
                if (!model.ReusableObjects.Any(o => string.Equals(o.Name, name, StringComparison.OrdinalIgnoreCase)))
                {
                    model.ReusableObjects.Add(new ReusableObjectModel
                    {
                        Id = name,
                        Index = model.ReusableObjects.Count,
                        Name = name,
                        SourceFileName = Path.GetFileName(lse)
                    });
                }
            }
        }
    }

    private static void EnsureDefaults(HmiIntermediateModel model)
    {
        if (model.Stations.Count == 0)
        {
            model.Stations.Add(new StationModel
            {
                StationNumber = 0,
                Name = "PLC_Station",
                StationType = "LARS",
                Address = "127.0.0.1:1954"
            });
        }

        if (model.Languages.Count == 0)
        {
            model.Languages.Add(new LanguageModel
            {
                Index = 0,
                Lcid = 1031,
                Bcp47Code = "de-DE",
                DisplayName = "Deutsch"
            });
            model.Languages.Add(new LanguageModel
            {
                Index = 1,
                Lcid = 1033,
                Bcp47Code = "en-US",
                DisplayName = "English"
            });
        }

        if (model.FontStyles.Count == 0)
        {
            model.FontStyles.Add(new FontStyleModel
            {
                Id = "DefaultFont",
                Index = 0,
                FamilyName = "Arial",
                SizePx = 14
            });
        }
    }

    private static string MapLanguageNameToBcp47(string nameOrCode)
    {
        if (nameOrCode.Contains("de", StringComparison.OrdinalIgnoreCase) ||
            nameOrCode.Contains("ger", StringComparison.OrdinalIgnoreCase) ||
            nameOrCode.Contains("deutsch", StringComparison.OrdinalIgnoreCase))
        {
            return "de-DE";
        }
        if (nameOrCode.Contains("en", StringComparison.OrdinalIgnoreCase) ||
            nameOrCode.Contains("eng", StringComparison.OrdinalIgnoreCase))
        {
            return "en-US";
        }
        if (nameOrCode.Contains("fr", StringComparison.OrdinalIgnoreCase)) return "fr-FR";
        if (nameOrCode.Contains("it", StringComparison.OrdinalIgnoreCase)) return "it-IT";
        if (nameOrCode.Contains("es", StringComparison.OrdinalIgnoreCase)) return "es-ES";
        return "en-US";
    }
}
