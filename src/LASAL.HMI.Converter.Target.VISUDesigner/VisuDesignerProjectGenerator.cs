using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using LASAL.HMI.Converter.Assets;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Logic;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.PythonBridge;

namespace LASAL.HMI.Converter.Target.VISUDesigner;

/// <summary>
/// Generates a native, editable SIGMATEK LASAL VISUDesigner (.lvp) project from an
/// <see cref="HmiIntermediateModel"/> using the verified hybrid architecture:
///   1. Official VISUDesigner.exe --script (sigmatek.lasal.lvd) project scaffolding
///   2. Direct tab-indented UTF-8 JSON database authoring matching VISUDesigner 01.04.006 schemas
///   3. Official lvd synchronization (ValidateAndSynchronizeTextLists, UpdateComponentProperties,
///      SynchronizeLogicElements, UpdatePropertyValues, SaveProject, PublishProject)
/// </summary>
public sealed class VisuDesignerProjectGenerator
{
    private readonly VisuDesignerPythonBridge _pythonBridge = new();
    private readonly AssetMigrationService _assetService = new();
    private readonly LogicMigrationService _logicService = new();
    private readonly ObjectMappingRegistry _mappingRegistry;

    public VisuDesignerProjectGenerator(ObjectMappingRegistry? mappingRegistry = null)
    {
        _mappingRegistry = mappingRegistry ?? new ObjectMappingRegistry();
    }

    public async Task<VisuGenerationResult> GenerateProjectAsync(
        HmiIntermediateModel model,
        string sourceProjectDir,
        string targetOutputDir,
        VisuGenerationOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(model);
        options ??= new VisuGenerationOptions();

        Directory.CreateDirectory(targetOutputDir);
        var safeProjName = SanitizeFileName(model.ProjectMetadata.ProjectName);
        var projectDir = Path.Combine(targetOutputDir, safeProjName);
        var lvpPath = Path.Combine(projectDir, $"{safeProjName}.lvp");

        if (Directory.Exists(projectDir) && options.OverwriteTarget)
        {
            Directory.Delete(projectDir, recursive: true);
        }

        _mappingRegistry.ApplyMappingsToModel(model);

        var env = new SoftwareEnvironmentDetector().Detect();
        var result = new VisuGenerationResult
        {
            ProjectDirectory = projectDir,
            LvpFilePath = lvpPath
        };

        var primaryLang = NormalizeVisuLangCode(model.Languages.FirstOrDefault()?.Bcp47Code ?? "en");
        var extraLangs = model.Languages
            .Select(l => NormalizeVisuLangCode(l.Bcp47Code))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        if (!extraLangs.Contains("en")) extraLangs.Add("en");
        if (!extraLangs.Contains(primaryLang)) extraLangs.Insert(0, primaryLang);

        // Step 1: Prepare converted assets in temporary export folder (with LS0003.MPC exact transparency + 1:1 SVG vectorization)
        var convertedAssetsStagingDir = Path.Combine(targetOutputDir, "_converted_assets");
        var exportedAssetFiles = _assetService.ExportAssetsToTargetResources(
            sourceProjectDir,
            convertedAssetsStagingDir,
            model,
            options.ConvertBmpTransparencyToPng,
            options.SvgOptions);

        // Step 2: Initialize native VISUDesigner project via VISUDesigner.exe --script
        // Note: lvd.CreateProject requires numeric dimension strings (without 'px') and creates projectDir itself.
        if (env.VisuDesignerInstalled)
        {
            ConverterLogger.Info($"Creating native VISUDesigner project '{lvpPath}' ({model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight})...");
            var wStr = model.ProjectMetadata.ResolutionWidth.ToString(CultureInfo.InvariantCulture);
            var hStr = model.ProjectMetadata.ResolutionHeight.ToString(CultureInfo.InvariantCulture);

            var initSb = new StringBuilder();
            initSb.AppendLine($"prj = lvd.CreateProject({PyStr(lvpPath)}, {PyStr(wStr)}, {PyStr(hStr)}, 'Deep Blue Theme', {PyStr(primaryLang)})");
            initSb.AppendLine("if prj is None:");
            initSb.AppendLine($"    prj = lvd.CreateProject({PyStr(lvpPath)}, {PyStr(wStr)}, {PyStr(hStr)}, '', '')");
            initSb.AppendLine("_record('CreateProject', prj is not None)");
            foreach (var lang in extraLangs)
            {
                initSb.AppendLine("try:");
                initSb.AppendLine($"    lvd.AddLanguages(prj, [lvd.Language({PyStr(lang)})])");
                initSb.AppendLine("except Exception:");
                initSb.AppendLine("    pass");
            }
            if (exportedAssetFiles.Count > 0 && exportedAssetFiles.Count <= 250)
            {
                var itemsPy = string.Join(", ", exportedAssetFiles.Select(p => $"lvd.MediaItem(lvd.MEDIA_IMAGE, {PyStr(p)})"));
                initSb.AppendLine("try:");
                initSb.AppendLine($"    lvd.AddMediaItems(prj, [{itemsPy}])");
                initSb.AppendLine("    _record('AddMediaItems', True)");
                initSb.AppendLine("except Exception as e:");
                initSb.AppendLine("    _result['steps'].append({'step': 'AddMediaItems', 'ok': False, 'err': str(e)})");
            }
            initSb.AppendLine("lvd.SaveProject(prj)");
            initSb.AppendLine("lvd.CloseProject(prj)");

            var initRes = await _pythonBridge.ExecuteScriptAsync(initSb.ToString(), targetOutputDir, TimeSpan.FromSeconds(120), cancellationToken)
                .ConfigureAwait(false);
            if (!initRes.Success)
            {
                result.Warnings.Add($"VISUDesigner CreateProject script warning: {initRes.ErrorMessage}");
            }
        }

        Directory.CreateDirectory(projectDir);
        // Ensure all converted assets are also guaranteed present in Resources\Images
        if (exportedAssetFiles.Count > 0)
        {
            var resImagesDir = Path.Combine(projectDir, "Resources", "Images");
            Directory.CreateDirectory(resImagesDir);
            foreach (var srcImg in exportedAssetFiles)
            {
                var destImg = Path.Combine(resImagesDir, Path.GetFileName(srcImg));
                if (!File.Exists(destImg) && File.Exists(srcImg))
                {
                    File.Copy(srcImg, destImg, overwrite: true);
                }
            }
        }

        // Read fileEntryVersions from generated .lvp (or create fallback .lvp if VISUDesigner isn't installed)
        var versions = EnsureLvpAndReadVersions(lvpPath, safeProjName);

        // Clean temporary asset staging folder now that MediaItems are imported
        if (Directory.Exists(convertedAssetsStagingDir))
        {
            try { Directory.Delete(convertedAssetsStagingDir, recursive: true); } catch { }
        }

        // Build lookup indices for cross-references
        var colorLookup = WriteColorPaletteAndBuildLookup(projectDir, model, versions.ColorPaletteVersion);
        var fontLookup = WriteFontStylesAndBuildLookup(projectDir, model, versions.FontStylesVersion);
        var textLookup = WriteLocalizationAndBuildLookup(projectDir, model, extraLangs, versions.TextListVersion);
        var mediaLookup = BuildMediaLookup(projectDir);
        var stationDatapointGuids = WriteStationsAndDatapoints(projectDir, model, versions.StationsVersion, versions.DatapointVersion);
        var fbLookup = WriteLogicAndFunctionBlocks(projectDir, model, stationDatapointGuids, versions.FunctionBlockVersion);
        var schemeLookup = WriteSchemesAndBuildLookup(projectDir, model, colorLookup, mediaLookup, textLookup, stationDatapointGuids, versions);
        WriteUnitsAndAlarmsAndMenus(projectDir, model, textLookup, stationDatapointGuids, versions);

        // Write ControlTemplates (reusable LSE objects)
        var usedControlIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var templateLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var obj in model.ReusableObjects)
        {
            var tmplId = WriteControlTemplateFile(projectDir, obj, versions.ControlTemplateVersion, colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, stationDatapointGuids, usedControlIds);
            templateLookup[obj.Name] = tmplId;
        }

        // Write GlobalDashboard
        var globalDashEntries = new List<(string Name, string Guid)>();
        if (model.GlobalScreen != null)
        {
            var gsName = "GlobalDashboard0";
            var gsId = WriteDashboardFile(
                Path.Combine(projectDir, "GlobalDashboards", $"{gsName}.json"),
                "globalDashboard",
                gsName,
                0,
                model.GlobalScreen,
                versions.GlobalDashboardVersion,
                colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, templateLookup, stationDatapointGuids, usedControlIds);
            globalDashEntries.Add((gsName, gsId));
        }

        // Write Dashboards (Screens)
        var dashboardEntries = new List<(string Name, string Guid, bool IsStart)>();
        for (var i = 0; i < model.Screens.Count; i++)
        {
            var scr = model.Screens[i];
            var dashName = SanitizeComponentName(scr.Name, $"Dashboard{i}");
            var isStart = i == 0 || string.Equals(scr.Name, model.ProjectMetadata.StartScreenName, StringComparison.OrdinalIgnoreCase);
            var dashId = WriteDashboardFile(
                Path.Combine(projectDir, "Dashboards", $"{dashName}.json"),
                "dashboard",
                dashName,
                i,
                scr,
                versions.DashboardVersion,
                colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, templateLookup, stationDatapointGuids, usedControlIds);
            dashboardEntries.Add((dashName, dashId, isStart));
        }

        if (dashboardEntries.Count == 0)
        {
            // Keep default Dashboard0 created by VISUDesigner if screen list was empty
            var defaultDashPath = Path.Combine(projectDir, "Dashboards", "Dashboard0.json");
            if (File.Exists(defaultDashPath))
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(defaultDashPath));
                var dtId = doc.RootElement.TryGetProperty("designTimeId", out var p) ? p.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
                dashboardEntries.Add(("Dashboard0", dtId, true));
            }
        }
        else
        {
            // Remove unused default Dashboard0 if the project had named screens that didn't reuse Dashboard0
            var defaultDash = Path.Combine(projectDir, "Dashboards", "Dashboard0.json");
            if (File.Exists(defaultDash) && !dashboardEntries.Any(d => string.Equals(d.Name, "Dashboard0", StringComparison.OrdinalIgnoreCase)))
            {
                File.Delete(defaultDash);
            }
        }

        // Ensure exactly one start dashboard
        if (dashboardEntries.Count > 0 && !dashboardEntries.Any(d => d.IsStart))
        {
            dashboardEntries[0] = (dashboardEntries[0].Name, dashboardEntries[0].Guid, true);
        }

        // Write Windows
        var windowEntries = new List<(string Name, string Guid)>();
        for (var i = 0; i < model.Windows.Count; i++)
        {
            var win = model.Windows[i];
            var winName = SanitizeComponentName(win.Name, $"Window{i}");
            var winId = WriteDashboardFile(
                Path.Combine(projectDir, "Window", $"{winName}.json"),
                "window",
                winName,
                i,
                win,
                versions.WindowVersion,
                colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, templateLookup, stationDatapointGuids, usedControlIds);
            windowEntries.Add((winName, winId));
        }

        // Copy any required SIGMATEK Libs controls (e.g. sig-control-line-simple, sig-control-ellipse, etc.) into Runtime
        EnsureUsedControlsInstalled(projectDir, env, usedControlIds);

        // Update View\Default.json with all dashboards, global dashboards, and windows
        UpdateDefaultViewFile(
            projectDir,
            model.ProjectMetadata.ResolutionWidth,
            model.ProjectMetadata.ResolutionHeight,
            versions.ViewVersion,
            dashboardEntries,
            globalDashEntries,
            windowEntries,
            colorLookup,
            fontLookup);

        // Step 3: Run VISUDesigner synchronization, validation, SaveProject, and PublishProject
        if (env.VisuDesignerInstalled)
        {
            ConverterLogger.Info("Synchronizing VISUDesigner SQLite index, logic elements, text lists, and publishing project...");
            var syncSb = new StringBuilder();
            syncSb.AppendLine($"prj = lvd.LoadProject({PyStr(lvpPath)})");
            syncSb.AppendLine("_record('LoadProject', prj is not None)");
            syncSb.AppendLine("try:");
            syncSb.AppendLine("    _record('ValidateAndSynchronizeTextLists', lvd.ValidateAndSynchronizeTextLists(prj))");
            syncSb.AppendLine("except Exception as e:");
            syncSb.AppendLine("    _result['steps'].append({'step': 'ValidateAndSynchronizeTextLists', 'ok': False, 'err': str(e)})");
            syncSb.AppendLine("try:");
            syncSb.AppendLine("    _record('UpdateComponentProperties', lvd.UpdateComponentProperties(prj))");
            syncSb.AppendLine("except Exception as e:");
            syncSb.AppendLine("    _result['steps'].append({'step': 'UpdateComponentProperties', 'ok': False, 'err': str(e)})");
            syncSb.AppendLine("try:");
            syncSb.AppendLine("    _record('SynchronizeLogicElements', lvd.SynchronizeLogicElements(prj))");
            syncSb.AppendLine("except Exception as e:");
            syncSb.AppendLine("    _result['steps'].append({'step': 'SynchronizeLogicElements', 'ok': False, 'err': str(e)})");
            syncSb.AppendLine("try:");
            syncSb.AppendLine("    _record('UpdatePropertyValues', lvd.UpdatePropertyValues(prj))");
            syncSb.AppendLine("except Exception as e:");
            syncSb.AppendLine("    _result['steps'].append({'step': 'UpdatePropertyValues', 'ok': False, 'err': str(e)})");
            syncSb.AppendLine("_record('SaveProject', lvd.SaveProject(prj))");

            if (options.PublishWebroot)
            {
                syncSb.AppendLine("ok_pub = lvd.PublishProject(prj, False)");
                syncSb.AppendLine("_record('PublishProject', ok_pub)");
            }

            syncSb.AppendLine("lvd.CloseProject(prj)");

            var syncRes = await _pythonBridge.ExecuteScriptAsync(syncSb.ToString(), targetOutputDir, TimeSpan.FromSeconds(180), cancellationToken)
                .ConfigureAwait(false);

            result.SynchronizationSucceeded = syncRes.Success;
            if (!syncRes.Success)
            {
                result.Warnings.Add($"VISUDesigner synchronization notice: {syncRes.ErrorMessage}");
            }
        }

        // Check published webroot output
        var publishCandidates = new[]
        {
            Path.Combine(projectDir, "Publish", "webroot", "index.html"),
            Path.Combine(projectDir, "Publish", "index.html"),
            Path.Combine(projectDir, "webroot", "index.html")
        };
        var foundWebroot = publishCandidates.FirstOrDefault(File.Exists);
        if (foundWebroot == null && options.PublishWebroot)
        {
            // Fallback: Assemble self-contained HTML5/JS webroot bundle directly from the project's Runtime + generated JSON views
            var fallbackWebrootDir = Path.Combine(projectDir, "Publish", "webroot");
            TryAssembleFallbackWebroot(projectDir, fallbackWebrootDir);
            if (File.Exists(Path.Combine(fallbackWebrootDir, "index.html")))
            {
                foundWebroot = Path.Combine(fallbackWebrootDir, "index.html");
            }
        }
        if (foundWebroot != null)
        {
            result.PublishedWebrootDirectory = Path.GetDirectoryName(foundWebroot);
        }

        result.DashboardCount = dashboardEntries.Count;
        result.WindowCount = windowEntries.Count;
        result.ControlCount = model.Screens.Sum(s => s.Controls.Count) + model.Windows.Sum(w => w.Controls.Count);
        result.Success = File.Exists(lvpPath) && Directory.Exists(Path.Combine(projectDir, "Dashboards"));
        return result;
    }

    private FileVersionInfoBlock EnsureLvpAndReadVersions(string lvpPath, string projectName)
    {
        if (File.Exists(lvpPath))
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(lvpPath));
                if (doc.RootElement.TryGetProperty("fileEntryVersions", out var fev))
                {
                    return new FileVersionInfoBlock
                    {
                        DashboardVersion = GetStr(fev, "dashboardVersion", "0.0.96"),
                        GlobalDashboardVersion = GetStr(fev, "globalDashboardVersion", "0.0.96"),
                        WindowVersion = GetStr(fev, "windowVersion", "0.0.96"),
                        ControlTemplateVersion = GetStr(fev, "controlTemplateVersion", "0.0.96"),
                        StationsVersion = GetStr(fev, "stationsVersion", "0.0.97"),
                        DatapointVersion = GetStr(fev, "datapointVersion", "0.0.98"),
                        TextListVersion = GetStr(fev, "textListVersion", "0.0.96"),
                        ViewVersion = GetStr(fev, "viewVersion", "0.0.96"),
                        FunctionBlockVersion = GetStr(fev, "functionBlockVersion", "0.0.97"),
                        ColorPaletteVersion = GetStr(fev, "colorPaletteVersion", "0.0.96"),
                        FontStylesVersion = GetStr(fev, "fontStylesVersion", "0.0.96"),
                        UnitDefinitionsVersion = GetStr(fev, "unitDefinitionsVersion", "0.0.96"),
                        AlarmVersion = GetStr(fev, "alarmVersion", "0.0.96"),
                        MenuVersion = GetStr(fev, "menuVersion", "0.0.96"),
                        SchemeVersion = GetStr(fev, "colorSchemeVersion", "0.0.96")
                    };
                }
            }
            catch
            {
                // Fall through to default structure
            }
        }

        var v = new FileVersionInfoBlock();
        var fallbackLvp = new Dictionary<string, object?>
        {
            ["type"] = "ProjectMeta",
            ["name"] = projectName,
            ["id"] = Guid.NewGuid().ToString(),
            ["version"] = "1.0.11",
            ["versionDatabase"] = "0.0.71",
            ["minVersion"] = "1.0.5",
            ["bitCollectionMode"] = 1,
            ["privilegeBitCollectionMode"] = 0,
            ["fileEntryVersions"] = new Dictionary<string, string>
            {
                ["type"] = "FileVersions",
                ["dashboardVersion"] = v.DashboardVersion,
                ["stationsVersion"] = v.StationsVersion,
                ["datapointVersion"] = v.DatapointVersion,
                ["textListVersion"] = v.TextListVersion,
                ["viewVersion"] = v.ViewVersion,
                ["functionBlockVersion"] = v.FunctionBlockVersion,
                ["colorPaletteVersion"] = v.ColorPaletteVersion,
                ["fontStylesVersion"] = v.FontStylesVersion,
                ["controlTemplateVersion"] = v.ControlTemplateVersion,
                ["windowVersion"] = v.WindowVersion,
                ["globalDashboardVersion"] = v.GlobalDashboardVersion,
                ["unitDefinitionsVersion"] = v.UnitDefinitionsVersion,
                ["alarmVersion"] = v.AlarmVersion,
                ["menuVersion"] = v.MenuVersion
            }
        };
        WriteTabIndentedJson(lvpPath, fallbackLvp);
        return v;
    }

    private Dictionary<string, (string PaletteRef, string Guid)> WriteColorPaletteAndBuildLookup(
        string projectDir,
        HmiIntermediateModel model,
        string version)
    {
        var lookup = new Dictionary<string, (string PaletteRef, string Guid)>(StringComparer.OrdinalIgnoreCase);
        var resDir = Path.Combine(projectDir, "Resources");
        Directory.CreateDirectory(resDir);

        // Read existing _SigmatekDefaultColors / DefaultColors palettes if present
        foreach (var colorFile in Directory.GetFiles(resDir, "*.colors"))
        {
            try
            {
                var paletteName = Path.GetFileNameWithoutExtension(colorFile);
                using var doc = JsonDocument.Parse(File.ReadAllText(colorFile));
                if (doc.RootElement.TryGetProperty("colors", out var colorsArr))
                {
                    foreach (var c in colorsArr.EnumerateArray())
                    {
                        var cname = c.TryGetProperty("name", out var np) ? np.GetString() : null;
                        var cid = c.TryGetProperty("id", out var ip) ? ip.GetString() : null;
                        var chex = c.TryGetProperty("color", out var cp) ? cp.GetString() : null;
                        if (!string.IsNullOrEmpty(cname) && !string.IsNullOrEmpty(cid) && !string.IsNullOrEmpty(chex))
                        {
                            lookup[chex] = ($"{paletteName}:{cname}", cid);
                        }
                    }
                }
            }
            catch { }
        }

        // Collect all unique hex colors used across screens, controls, and source palette
        var uniqueHexes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var entry in model.ColorPalette)
        {
            if (!string.IsNullOrWhiteSpace(entry.CssHex)) uniqueHexes.Add(entry.CssHex.ToUpperInvariant());
        }
        foreach (var scr in model.Screens.Concat(model.Windows))
        {
            uniqueHexes.Add(scr.BackgroundColorHex.ToUpperInvariant());
            foreach (var c in scr.Controls)
            {
                uniqueHexes.Add(c.ForegroundColorHex.ToUpperInvariant());
                uniqueHexes.Add(c.BackgroundColorHex.ToUpperInvariant());
                uniqueHexes.Add(c.BorderColorHex.ToUpperInvariant());
            }
        }

        var migratedItems = new List<Dictionary<string, object?>>();
        var colorIdx = 0;
        foreach (var hex in uniqueHexes.OrderBy(h => h))
        {
            var id = Guid.NewGuid().ToString();
            var name = $"MigratedColor_{colorIdx:D3}";
            migratedItems.Add(new Dictionary<string, object?>
            {
                ["type"] = "ColorItem",
                ["id"] = id,
                ["name"] = name,
                ["color"] = hex
            });
            lookup[hex] = ($"MigratedColors:{name}", id);
            colorIdx++;
        }

        var paletteDoc = new Dictionary<string, object?>
        {
            ["type"] = "ColorPalette",
            ["version"] = version,
            ["id"] = Guid.NewGuid().ToString(),
            ["name"] = "MigratedColors",
            ["colors"] = migratedItems
        };
        WriteTabIndentedJson(Path.Combine(resDir, "MigratedColors.colors"), paletteDoc);
        return lookup;
    }

    private static Dictionary<string, string> WriteFontStylesAndBuildLookup(
        string projectDir,
        HmiIntermediateModel model,
        string version)
    {
        var lookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var dir = Path.Combine(projectDir, "FontStyles");
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, "FontStyles.json");

        var styles = new List<Dictionary<string, object?>>();
        var defaultFontFamilyRefId = Guid.NewGuid().ToString();

        if (File.Exists(path))
        {
            try
            {
                var existing = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(File.ReadAllText(path));
                if (existing != null && existing.TryGetValue("fontStyles", out var fsElem) && fsElem.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in fsElem.EnumerateArray())
                    {
                        var dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(item.GetRawText());
                        if (dict != null)
                        {
                            styles.Add(dict);
                            var name = item.TryGetProperty("name", out var np) ? np.GetString() : null;
                            var id = item.TryGetProperty("designTimeId", out var dp) ? dp.GetString() : null;
                            if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(id))
                            {
                                lookup[name] = id;
                            }
                            if (item.TryGetProperty("fontFamily", out var ff) && ff.TryGetProperty("refId", out var rf))
                            {
                                defaultFontFamilyRefId = rf.GetString() ?? defaultFontFamilyRefId;
                            }
                        }
                    }
                }
            }
            catch { }
        }

        foreach (var f in model.FontStyles)
        {
            var safeName = SanitizeComponentName(f.Id, $"Font_{f.Index}");
            if (lookup.ContainsKey(safeName))
            {
                lookup[f.Id] = lookup[safeName];
                continue;
            }

            var dtId = Guid.NewGuid().ToString();
            styles.Add(new Dictionary<string, object?>
            {
                ["type"] = "FontStyle",
                ["designTimeId"] = dtId,
                ["name"] = safeName,
                ["size"] = f.SizePx > 0 ? f.SizePx : 14,
                ["fontFamily"] = new Dictionary<string, object?>
                {
                    ["value"] = "Resources\\Fonts\\roboto-regular.ttf",
                    ["typeId"] = 15,
                    ["propTypeId"] = 1,
                    ["refId"] = defaultFontFamilyRefId
                },
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            });
            lookup[safeName] = dtId;
            lookup[f.Id] = dtId;
        }

        var root = new Dictionary<string, object?>
        {
            ["type"] = "fontStyleManager",
            ["version"] = version,
            ["fontStyles"] = styles
        };
        WriteTabIndentedJson(path, root);
        return lookup;
    }

    private static Dictionary<string, (string ListName, string AliasName, string EntryGuid)> WriteLocalizationAndBuildLookup(
        string projectDir,
        HmiIntermediateModel model,
        List<string> visuLangs,
        string version)
    {
        var lookup = new Dictionary<string, (string ListName, string AliasName, string EntryGuid)>(StringComparer.OrdinalIgnoreCase);
        var locDir = Path.Combine(projectDir, "Localization");
        Directory.CreateDirectory(locDir);

        foreach (var tl in model.TextLists)
        {
            var safeListName = SanitizeComponentName(tl.Name, tl.Id);
            // Protect VISUDesigner's built-in SystemTexts / VariableTexts dictionaries used by Alert/Confirm/Prompt windows
            if (string.Equals(safeListName, "SystemTexts", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(safeListName, "VariableTexts", StringComparison.OrdinalIgnoreCase))
            {
                safeListName = "LSE_" + safeListName;
            }
            var listGuid = Guid.NewGuid().ToString();

            // Pre-assign stable entry GUIDs across all languages
            var entryGuids = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var entry in tl.Entries)
            {
                var eGuid = Guid.NewGuid().ToString();
                var aliasName = $"Text_{entry.NumericIndex}";
                entryGuids[entry.EntryId] = eGuid;
                lookup[$"{tl.Id}:{entry.EntryId}"] = (safeListName, aliasName, eGuid);
                lookup[$"{tl.Name}:{entry.EntryId}"] = (safeListName, aliasName, eGuid);
                lookup[$"{tl.Id}:{entry.NumericIndex}"] = (safeListName, aliasName, eGuid);
            }

            foreach (var lang in visuLangs)
            {
                var langDir = Path.Combine(locDir, lang);
                if (!Directory.Exists(langDir))
                {
                    Directory.CreateDirectory(langDir);
                    var seedDir = Directory.GetDirectories(locDir)
                        .FirstOrDefault(d => File.Exists(Path.Combine(d, "SystemTexts.json")));
                    if (seedDir != null)
                    {
                        foreach (var sysFile in new[] { "SystemTexts.json", "VariableTexts.json", "langInfo.lang" })
                        {
                            var srcSys = Path.Combine(seedDir, sysFile);
                            var dstSys = Path.Combine(langDir, sysFile);
                            if (File.Exists(srcSys) && !File.Exists(dstSys))
                            {
                                File.Copy(srcSys, dstSys, overwrite: false);
                            }
                        }
                    }
                }
                var jsonPath = Path.Combine(langDir, $"{safeListName}.json");

                var textItems = new List<Dictionary<string, object?>>();
                foreach (var entry in tl.Entries)
                {
                    var textVal = ResolveEntryTranslationForLang(entry, lang);
                    textItems.Add(new Dictionary<string, object?>
                    {
                        ["type"] = "textElement",
                        ["id"] = entryGuids[entry.EntryId],
                        ["aliasName"] = $"Text_{entry.NumericIndex}",
                        ["text"] = textVal
                    });
                }

                var doc = new Dictionary<string, object?>
                {
                    ["type"] = "textList",
                    ["version"] = version,
                    ["id"] = listGuid,
                    ["name"] = safeListName,
                    ["texts"] = textItems,
                    ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision", ["revisionNr"] = "1.0" }
                };
                WriteTabIndentedJson(jsonPath, doc);
            }
        }

        return lookup;
    }

    private static Dictionary<string, (string FileName, string MediaId)> BuildMediaLookup(string projectDir)
    {
        var lookup = new Dictionary<string, (string FileName, string MediaId)>(StringComparer.OrdinalIgnoreCase);
        var imagesDir = Path.Combine(projectDir, "Resources", "Images");
        if (!Directory.Exists(imagesDir))
        {
            return lookup;
        }

        var collPath = Path.Combine(imagesDir, "imagesCollection.json");
        var mediaItemsList = new List<Dictionary<string, object?>>();
        var collectionVersion = "0.0.96";
        if (File.Exists(collPath))
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(collPath));
                if (doc.RootElement.TryGetProperty("version", out var vp) && vp.ValueKind == JsonValueKind.String)
                {
                    collectionVersion = vp.GetString() ?? collectionVersion;
                }
                if (doc.RootElement.TryGetProperty("mediaItems", out var arr))
                {
                    foreach (var item in arr.EnumerateArray())
                    {
                        var name = item.TryGetProperty("name", out var np) ? np.GetString() : null;
                        var id = item.TryGetProperty("id", out var ip) ? ip.GetString() : null;
                        if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(id))
                        {
                            lookup[name] = (name, id);
                            lookup[Path.GetFileNameWithoutExtension(name)] = (name, id);
                            mediaItemsList.Add(new Dictionary<string, object?>
                            {
                                ["type"] = "MediaItem",
                                ["id"] = id,
                                ["name"] = name,
                                ["path"] = "Resources\\Images",
                                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
                            });
                        }
                    }
                }
            }
            catch { }
        }

        var addedNewMedia = false;
        foreach (var file in Directory.GetFiles(imagesDir).OrderBy(f => f, StringComparer.OrdinalIgnoreCase))
        {
            var fn = Path.GetFileName(file);
            if (fn.EndsWith(".json", StringComparison.OrdinalIgnoreCase)) continue;
            if (!lookup.ContainsKey(fn))
            {
                var id = Guid.NewGuid().ToString();
                lookup[fn] = (fn, id);
                lookup[Path.GetFileNameWithoutExtension(fn)] = (fn, id);
                mediaItemsList.Add(new Dictionary<string, object?>
                {
                    ["type"] = "MediaItem",
                    ["id"] = id,
                    ["name"] = fn,
                    ["path"] = "Resources\\Images",
                    ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
                });
                addedNewMedia = true;
            }
        }

        if (addedNewMedia || !File.Exists(collPath))
        {
            WriteTabIndentedJson(collPath, new Dictionary<string, object?>
            {
                ["type"] = "MediaImageCollection",
                ["version"] = collectionVersion,
                ["name"] = "MediaImageCollection",
                ["mediaItems"] = mediaItemsList
            });
        }

        return lookup;
    }

    private static Dictionary<string, (string PublishName, string Guid)> WriteStationsAndDatapoints(
        string projectDir,
        HmiIntermediateModel model,
        string stationVer,
        string datapointVer)
    {
        var dpGuidLookup = new Dictionary<string, (string PublishName, string Guid)>(StringComparer.OrdinalIgnoreCase);

        static int EffectiveStation(int raw) => raw == 0 ? 1 : raw;

        static (string VisuType, string RefId) ResolvePrimitiveType(string? rawType)
        {
            var upper = (rawType ?? "DINT").Trim().ToUpperInvariant();
            return upper switch
            {
                "UDINT" or "HEX" or "BINARY" => ("UDINT", "a1e89330-9b3b-42a4-a249-4a72a2a1f36a"),
                "DATE_LSL" or "DATE" => ("DATE_LSL", "69bed677-a74e-445d-beab-4117654aae8b"),
                "TIME_LSL" or "TIME" => ("TIME_LSL", "6c21b427-cd9e-420f-8902-1917aed5bb7e"),
                _ => ("DINT", "65579062-bd8f-4c7a-a7ff-b1cd0632d65e")
            };
        }

        // Gather existing datapoints and synthesize any missing control/alarm bindings so Publish never sees unresolved links
        // For massive enterprise PLC server lists (>5,000 servers), emit only referenced datapoints + their parent objects into VISUDesigner SQLite index
        var allDatapoints = new List<DatapointModel>();
        if (model.Datapoints.Count > 5000)
        {
            var referencedSymbols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            void MarkReferenced(string? sym)
            {
                if (string.IsNullOrWhiteSpace(sym)) return;
                var clean = sym.Contains(':') ? sym[(sym.IndexOf(':') + 1)..] : sym;
                referencedSymbols.Add(clean);
                var parts = clean.Split('.');
                for (var p = 1; p < parts.Length; p++)
                {
                    referencedSymbols.Add(string.Join(".", parts[..p]));
                }
            }

            foreach (var scr in model.Screens.Concat(model.Windows))
            {
                foreach (var c in scr.Controls)
                {
                    MarkReferenced(c.DatapointId);
                    MarkReferenced(c.OverloadDatapointPrefix);
                    foreach (var u in c.UdcDatapointIds) MarkReferenced(u);
                    foreach (var ev in c.Events) MarkReferenced(ev.TargetDatapointId);
                }
            }
            if (model.GlobalScreen != null)
            {
                foreach (var c in model.GlobalScreen.Controls)
                {
                    MarkReferenced(c.DatapointId);
                    MarkReferenced(c.OverloadDatapointPrefix);
                    foreach (var u in c.UdcDatapointIds) MarkReferenced(u);
                    foreach (var ev in c.Events) MarkReferenced(ev.TargetDatapointId);
                }
            }
            foreach (var obj in model.ReusableObjects)
            {
                foreach (var c in obj.Controls)
                {
                    MarkReferenced(c.DatapointId);
                    MarkReferenced(c.OverloadDatapointPrefix);
                    foreach (var u in c.UdcDatapointIds) MarkReferenced(u);
                    foreach (var ev in c.Events) MarkReferenced(ev.TargetDatapointId);
                }
            }
            foreach (var a in model.Alarms)
            {
                MarkReferenced(a.DatapointId);
                foreach (var p in a.ParameterDatapointIds) MarkReferenced(p);
            }
            foreach (var fb in model.FunctionBlocks)
            {
                foreach (var st in fb.Steps)
                {
                    MarkReferenced(st.Input1DatapointId);
                    MarkReferenced(st.Input2DatapointId);
                    MarkReferenced(st.Output1DatapointId);
                }
            }
            foreach (var sch in model.Schemes)
            {
                foreach (var en in sch.Entries)
                {
                    MarkReferenced(en.CompareDatapointId);
                    if (sch.SchemeType.Equals("Server", StringComparison.OrdinalIgnoreCase))
                    {
                        MarkReferenced(en.ResultValue);
                    }
                }
            }

            foreach (var dp in model.Datapoints)
            {
                if (referencedSymbols.Contains(dp.SymbolPath) || referencedSymbols.Contains(dp.Id))
                {
                    allDatapoints.Add(dp);
                }
            }
            if (allDatapoints.Count == 0 && model.Datapoints.Count > 0)
            {
                allDatapoints.AddRange(model.Datapoints.Take(1000));
            }
        }
        else
        {
            allDatapoints.AddRange(model.Datapoints);
        }

        var knownKeys = new HashSet<string>(
            allDatapoints.SelectMany(d => new[] { d.Id, d.SymbolPath }).Where(k => !string.IsNullOrWhiteSpace(k)),
            StringComparer.OrdinalIgnoreCase);

        void EnsureControlDatapoint(string? rawRef)
        {
            if (string.IsNullOrWhiteSpace(rawRef)) return;
            var cleaned = rawRef.Contains(':') ? rawRef[(rawRef.IndexOf(':') + 1)..] : rawRef;
            if (string.IsNullOrWhiteSpace(cleaned) || knownKeys.Contains(rawRef) || knownKeys.Contains(cleaned)) return;
            var dotIdx = cleaned.IndexOf('.');
            var obj = dotIdx > 0 ? cleaned[..dotIdx] : "GlobalVars";
            var svr = dotIdx > 0 ? cleaned[(dotIdx + 1)..] : cleaned;
            var stNum = 1;
            if (rawRef.Contains(':') && int.TryParse(rawRef[..rawRef.IndexOf(':')], out var parsedSt) && parsedSt > 0)
            {
                stNum = parsedSt;
            }
            allDatapoints.Add(new DatapointModel
            {
                Id = cleaned,
                SymbolPath = $"{obj}.{svr}",
                ObjectName = obj,
                ServerName = svr,
                StationNumber = stNum,
                VisuDataType = "DINT"
            });
            knownKeys.Add(rawRef);
            knownKeys.Add(cleaned);
        }

        var allScreens = model.Screens.Concat(model.Windows).ToList();
        if (model.GlobalScreen != null) allScreens.Add(model.GlobalScreen);
        foreach (var scr in allScreens)
        {
            foreach (var c in scr.Controls)
            {
                EnsureControlDatapoint(c.DatapointId);
            }
        }
        foreach (var obj in model.ReusableObjects)
        {
            foreach (var c in obj.Controls)
            {
                EnsureControlDatapoint(c.DatapointId);
            }
        }

        var effectiveStationIds = model.Stations
            .Select(s => EffectiveStation(s.StationNumber))
            .Concat(allDatapoints.Select(d => EffectiveStation(d.StationNumber)))
            .Distinct()
            .OrderBy(id => id)
            .ToList();
        if (effectiveStationIds.Count == 0) effectiveStationIds.Add(1);

        var stationsDir = Path.Combine(projectDir, "Stations");
        Directory.CreateDirectory(stationsDir);

        // Station0 (INTERN) is reserved; PLC datapoints reside on stationId >= 1 ("GLOBAL")
        var stationObjs = new List<Dictionary<string, object?>>
        {
            new()
            {
                ["type"] = "station",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["name"] = "Station0",
                ["connection"] = "INTERN",
                ["isRequired"] = false,
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            }
        };

        foreach (var stId in effectiveStationIds)
        {
            var srcStation = model.Stations.FirstOrDefault(s => EffectiveStation(s.StationNumber) == stId);
            var sName = srcStation != null ? SanitizeComponentName(srcStation.Name, $"Station_{stId}") : $"Station_{stId}";
            if (string.Equals(sName, "Station0", StringComparison.OrdinalIgnoreCase)) sName = $"Station_{stId}";
            stationObjs.Add(new Dictionary<string, object?>
            {
                ["type"] = "station",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["name"] = sName,
                ["stationId"] = stId,
                ["connection"] = "GLOBAL",
                ["isRequired"] = false,
                ["useRelativeImportFilePath"] = true,
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            });
        }

        WriteTabIndentedJson(Path.Combine(stationsDir, "Stations.json"), new Dictionary<string, object?>
        {
            ["type"] = "StationManager",
            ["version"] = stationVer,
            ["stations"] = stationObjs
        });

        var dpDir = Path.Combine(projectDir, "Datapoints");
        Directory.CreateDirectory(dpDir);

        foreach (var group in allDatapoints.GroupBy(d => EffectiveStation(d.StationNumber)))
        {
            var stId = group.Key;
            var dtList = new List<Dictionary<string, object?>>();
            var dpList = new List<Dictionary<string, object?>>();

            // Group servers by parent ObjectName matching native VISUDesigner DataTypeManager/DatapointManager tree
            var byObject = group.GroupBy(d =>
            {
                if (!string.IsNullOrWhiteSpace(d.ObjectName)) return SanitizeComponentName(d.ObjectName, "GlobalVars");
                var dot = d.SymbolPath.IndexOf('.');
                return dot > 0 ? SanitizeComponentName(d.SymbolPath[..dot], "GlobalVars") : "GlobalVars";
            }, StringComparer.OrdinalIgnoreCase);

            foreach (var objGroup in byObject)
            {
                var objName = objGroup.Key;
                var clsName = $"{objName}_Cls";
                var clsDtId = Guid.NewGuid().ToString();
                var clsGuid = Guid.NewGuid().ToString();
                var objGuid = Guid.NewGuid().ToString();
                var dpParentId = Guid.NewGuid().ToString();

                var dtChildren = new List<Dictionary<string, object?>>();
                var dpChildren = new List<Dictionary<string, object?>>();
                var seenServers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var dp in objGroup)
                {
                    var rawSvr = !string.IsNullOrWhiteSpace(dp.ServerName)
                        ? dp.ServerName
                        : (dp.SymbolPath.Contains('.') ? dp.SymbolPath[(dp.SymbolPath.IndexOf('.') + 1)..] : dp.SymbolPath);
                    var svrName = SanitizeComponentName(rawSvr.Replace('.', '_'), "ClassSvr");
                    if (!seenServers.Add(svrName)) continue;

                    var (primName, primRef) = ResolvePrimitiveType(dp.VisuDataType);
                    var svrDtId = Guid.NewGuid().ToString();
                    var svrGuid = Guid.NewGuid().ToString();
                    var dpChildId = Guid.NewGuid().ToString();

                    dtChildren.Add(new Dictionary<string, object?>
                    {
                        ["type"] = "datatype",
                        ["designTimeId"] = svrDtId,
                        ["name"] = svrName,
                        ["stationId"] = stId,
                        ["guid"] = svrGuid,
                        ["typeId"] = 1,
                        ["datatype"] = new Dictionary<string, object?>
                        {
                            ["value"] = primName,
                            ["typeId"] = 8,
                            ["propTypeId"] = 1,
                            ["refId"] = primRef
                        },
                        ["children"] = Array.Empty<object>()
                    });

                    var childNode = new Dictionary<string, object?>
                    {
                        ["type"] = "datapoint",
                        ["designTimeId"] = dpChildId,
                        ["name"] = svrName,
                        ["guid"] = svrGuid,
                        ["typeId"] = 1,
                        ["stationId"] = stId,
                        ["datatype"] = new Dictionary<string, object?>
                        {
                            ["value"] = primName,
                            ["typeId"] = 8,
                            ["propTypeId"] = 1,
                            ["refId"] = primRef
                        },
                        ["children"] = Array.Empty<object>()
                    };
                    if (dp.WriteProtected) childNode["writeProtected"] = true;
                    dpChildren.Add(childNode);

                    var pubName = $"{stId}:{objName}.{svrName}";
                    dpGuidLookup[dp.Id] = (pubName, dpChildId);
                    dpGuidLookup[dp.SymbolPath] = (pubName, dpChildId);
                    dpGuidLookup[$"{dp.StationNumber}:{dp.SymbolPath}"] = (pubName, dpChildId);
                    dpGuidLookup[$"{objName}.{svrName}"] = (pubName, dpChildId);
                    dpGuidLookup[pubName] = (pubName, dpChildId);
                }

                dtList.Add(new Dictionary<string, object?>
                {
                    ["type"] = "datatype",
                    ["designTimeId"] = clsDtId,
                    ["name"] = clsName,
                    ["stationId"] = stId,
                    ["guid"] = clsGuid,
                    ["datatype"] = new Dictionary<string, object?>
                    {
                        ["value"] = "DINT",
                        ["typeId"] = 8,
                        ["propTypeId"] = 1,
                        ["refId"] = "65579062-bd8f-4c7a-a7ff-b1cd0632d65e"
                    },
                    ["size"] = 52,
                    ["children"] = dtChildren
                });

                dpList.Add(new Dictionary<string, object?>
                {
                    ["type"] = "datapoint",
                    ["designTimeId"] = dpParentId,
                    ["name"] = objName,
                    ["guid"] = objGuid,
                    ["stationId"] = stId,
                    ["datatype"] = new Dictionary<string, object?>
                    {
                        ["value"] = $"{stId}:{clsName}",
                        ["typeId"] = 8,
                        ["propTypeId"] = 1,
                        ["refId"] = clsDtId
                    },
                    ["children"] = dpChildren
                });

                dpGuidLookup[objName] = ($"{stId}:{objName}", dpParentId);
            }

            WriteTabIndentedJson(Path.Combine(dpDir, $"{stId}_DataTypes.json"), new Dictionary<string, object?>
            {
                ["type"] = "DataTypeManager",
                ["version"] = datapointVer,
                ["stationId"] = stId,
                ["datatypes"] = dtList,
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            });

            WriteTabIndentedJson(Path.Combine(dpDir, $"{stId}_Datapoints.json"), new Dictionary<string, object?>
            {
                ["type"] = "DatapointManager",
                ["version"] = datapointVer,
                ["stationId"] = stId,
                ["datapoints"] = dpList,
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            });
        }

        return dpGuidLookup;
    }

    private Dictionary<string, string> WriteLogicAndFunctionBlocks(
        string projectDir,
        HmiIntermediateModel model,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        string fbVersion)
    {
        var fbLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var logicArtifacts = _logicService.GenerateLogicArtifacts(model);

        var codeDir = Path.Combine(projectDir, "CodeModules");
        Directory.CreateDirectory(codeDir);
        foreach (var (fileName, jsCode) in logicArtifacts.CodeModules)
        {
            File.WriteAllText(Path.Combine(codeDir, fileName), jsCode, new UTF8Encoding(false));
        }

        var fbDir = Path.Combine(projectDir, "Functionblocks");
        Directory.CreateDirectory(fbDir);

        foreach (var fb in model.FunctionBlocks)
        {
            var rawGuid = Guid.NewGuid().ToString();
            var blockId = "_" + rawGuid.Replace("-", "");
            var safeName = SanitizeComponentName(fb.Name, $"Functionblock_{fb.Index}");
            fbLookup[fb.Id] = rawGuid;
            fbLookup[fb.Name] = rawGuid;
            fbLookup[safeName] = rawGuid;

            var artifact = logicArtifacts.FunctionBlocks.FirstOrDefault(a => string.Equals(a.Name, safeName, StringComparison.OrdinalIgnoreCase));
            var fbJson = new Dictionary<string, object?>
            {
                ["type"] = "Functionblock",
                ["version"] = "0.0.4",
                ["name"] = safeName,
                ["id"] = blockId,
                ["xml"] = $"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"fub_root\" id=\"{blockId}\" deletable=\"false\" movable=\"false\" x=\"0\" y=\"0\"></block></xml>",
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            };
            WriteTabIndentedJson(Path.Combine(fbDir, $"{safeName}.json"), fbJson);

            var jsBody = artifact?.JavaScriptBody ?? "    return true;\n";
            var fbJs = $$"""
class _{{blockId}} extends window.functionBlockBase {
    constructor() {
        super('{{blockId}}');
    }

    async _execute() {
        if (window.LasalMigratedLogic && typeof window.LasalMigratedLogic.{{safeName}} === 'function') {
            return window.LasalMigratedLogic.{{safeName}}();
        }
{{jsBody}}
    }
}
window.functionBlocks._{{blockId}} = _{{blockId}};
""";
            File.WriteAllText(Path.Combine(fbDir, $"{safeName}.js"), fbJs, new UTF8Encoding(false));
        }

        return fbLookup;
    }

    private static Dictionary<string, (string Folder, string Guid)> WriteSchemesAndBuildLookup(
        string projectDir,
        HmiIntermediateModel model,
        Dictionary<string, (string PaletteRef, string Guid)> colorLookup,
        Dictionary<string, (string FileName, string MediaId)> mediaLookup,
        Dictionary<string, (string ListName, string AliasName, string EntryGuid)> textLookup,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        FileVersionInfoBlock versions)
    {
        var lookup = new Dictionary<string, (string Folder, string Guid)>(StringComparer.OrdinalIgnoreCase);
        var schemesRoot = Path.Combine(projectDir, "Schemes");

        var byFolder = new Dictionary<string, (string FileName, string CollectionType, string SchemeKind, int SchemeTypeId, List<SchemeModel> Items)>
        {
            ["ColorSchemes"] = ("ColorScheme.json", "ColorSchemeCollection", "Color", 18, model.Schemes.Where(s => s.SchemeType.Equals("Color", StringComparison.OrdinalIgnoreCase)).ToList()),
            ["MediaSchemes"] = ("MediaScheme.json", "MediaSchemeCollection", "Media", 29, model.Schemes.Where(s => s.SchemeType.Equals("Image", StringComparison.OrdinalIgnoreCase)).ToList()),
            ["TextSchemes"] = ("TextScheme.json", "TextSchemeCollection", "Text", 16, model.Schemes.Where(s => s.SchemeType.Equals("Text", StringComparison.OrdinalIgnoreCase)).ToList()),
            ["UnitSchemes"] = ("UnitScheme.json", "UnitSchemeCollection", "Unit", 20, model.Schemes.Where(s => s.SchemeType.Equals("Unit", StringComparison.OrdinalIgnoreCase)).ToList()),
            ["StateSchemes"] = ("StateScheme.json", "StateSchemeCollection", "State", 21, model.Schemes.Where(s => s.SchemeType.Equals("State", StringComparison.OrdinalIgnoreCase)).ToList()),
            ["DatapointSchemes"] = ("DatapointScheme.json", "DatapointSchemeCollection", "Datapoint", 19, model.Schemes.Where(s => s.SchemeType.Equals("Server", StringComparison.OrdinalIgnoreCase)).ToList())
        };

        foreach (var (folder, spec) in byFolder)
        {
            if (spec.Items.Count == 0) continue;
            var folderPath = Path.Combine(schemesRoot, folder);
            Directory.CreateDirectory(folderPath);

            var schemeObjs = new List<Dictionary<string, object?>>();
            foreach (var s in spec.Items)
            {
                var safeName = SanitizeComponentName(s.Name, s.Id);
                var dtId = Guid.NewGuid().ToString();
                lookup[$"{s.SchemeType}:{s.Id}"] = (folder, dtId);
                lookup[s.Id] = (folder, dtId);
                lookup[s.Name] = (folder, dtId);

                var entries = new List<Dictionary<string, object?>>();
                foreach (var e in s.Entries)
                {
                    var opInt = e.Operator switch
                    {
                        "<" => 0,
                        "<=" => 1,
                        "=" or "==" => 2,
                        ">=" => 3,
                        ">" => 4,
                        "<>" or "!=" => 5,
                        _ => 2
                    };

                    var entryObj = new Dictionary<string, object?>
                    {
                        ["type"] = "SchemeEntry",
                        ["designTimeId"] = Guid.NewGuid().ToString(),
                        ["operator"] = opInt
                    };

                    entryObj["compareValue"] = new Dictionary<string, object?>
                    {
                        ["value"] = e.CompareValue.ToString(CultureInfo.InvariantCulture),
                        ["typeId"] = 4,
                        ["propTypeId"] = 1
                    };

                    // Also support numeric text list references like "1009:0" (listIdx = 1009 - 1000 = 9) emitted by LS0014.MPC TextSchemes
                    var resolvedTextKey = e.ResultValue;
                    if (!string.IsNullOrEmpty(resolvedTextKey) && !textLookup.ContainsKey(resolvedTextKey))
                    {
                        var colonIdx = resolvedTextKey.IndexOf(':');
                        if (colonIdx > 0 &&
                            int.TryParse(resolvedTextKey[..colonIdx], out var rawListNo) &&
                            rawListNo >= 1000)
                        {
                            var candidateKey = $"TextList_{rawListNo - 1000}:{resolvedTextKey[(colonIdx + 1)..]}";
                            if (textLookup.ContainsKey(candidateKey))
                            {
                                resolvedTextKey = candidateKey;
                            }
                        }
                    }

                    // Populate setValue ONLY when the target resource reference resolves cleanly
                    if (spec.SchemeKind == "Text" && !string.IsNullOrEmpty(resolvedTextKey) && textLookup.TryGetValue(resolvedTextKey, out var tHit))
                    {
                        entryObj["setValue"] = new Dictionary<string, object?>
                        {
                            ["value"] = $"{tHit.ListName}:{tHit.AliasName}",
                            ["typeId"] = 5,
                            ["propTypeId"] = 1,
                            ["refId"] = tHit.EntryGuid
                        };
                    }
                    else if (spec.SchemeKind == "Media" &&
                             (mediaLookup.TryGetValue(e.ResultValue, out var mHit) ||
                              mediaLookup.TryGetValue(Path.GetFileNameWithoutExtension(e.ResultValue), out mHit)))
                    {
                        entryObj["setValue"] = new Dictionary<string, object?>
                        {
                            ["value"] = $"Resources\\Images\\{mHit.FileName}",
                            ["typeId"] = 15,
                            ["propTypeId"] = 1,
                            ["refId"] = mHit.MediaId
                        };
                    }
                    else if (spec.SchemeKind == "Color" && colorLookup.TryGetValue(e.ResultValue, out var cHit))
                    {
                        entryObj["setValue"] = new Dictionary<string, object?>
                        {
                            ["value"] = cHit.PaletteRef,
                            ["typeId"] = 9,
                            ["propTypeId"] = 2,
                            ["refId"] = cHit.Guid
                        };
                    }

                    if (entryObj.ContainsKey("setValue"))
                    {
                        entries.Add(entryObj);
                    }
                }

                schemeObjs.Add(new Dictionary<string, object?>
                {
                    ["type"] = "Scheme",
                    ["designTimeId"] = dtId,
                    ["name"] = safeName,
                    ["schemeId"] = spec.SchemeTypeId,
                    ["schemeEntries"] = entries,
                    ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
                });
            }

            WriteTabIndentedJson(Path.Combine(folderPath, spec.FileName), new Dictionary<string, object?>
            {
                ["type"] = spec.CollectionType,
                ["version"] = versions.SchemeVersion,
                ["schemes"] = schemeObjs
            });
        }

        return lookup;
    }

    private static void WriteUnitsAndAlarmsAndMenus(
        string projectDir,
        HmiIntermediateModel model,
        Dictionary<string, (string ListName, string AliasName, string EntryGuid)> textLookup,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        FileVersionInfoBlock versions)
    {
        if (model.Units.Count > 0)
        {
            var unitsDir = Path.Combine(projectDir, "Units");
            Directory.CreateDirectory(unitsDir);
            var unitObjs = model.Units.Select(u => new Dictionary<string, object?>
            {
                ["type"] = "Unit",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["name"] = SanitizeComponentName(u.Name, u.Id),
                ["comment"] = u.Symbol,
                ["decimals"] = u.DecimalPlaces,
                ["hasFixedDecimalPoint"] = u.DecimalPlaces > 0,
                ["formula"] = u.FormulaNumber,
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            }).ToList();

            WriteTabIndentedJson(Path.Combine(unitsDir, "UnitDefinitions.json"), new Dictionary<string, object?>
            {
                ["type"] = "UnitDefinitions",
                ["version"] = versions.UnitDefinitionsVersion,
                ["Units"] = unitObjs
            });
        }

        if (model.Alarms.Count > 0)
        {
            var alarmsDir = Path.Combine(projectDir, "Alarms");
            Directory.CreateDirectory(alarmsDir);
            var alarmObjs = new List<Dictionary<string, object?>>
            {
                new()
                {
                    ["type"] = "Alarm",
                    ["designTimeId"] = Guid.NewGuid().ToString(),
                    ["name"] = "Default",
                    ["isDefault"] = true,
                    ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
                }
            };

            foreach (var a in model.Alarms)
            {
                alarmObjs.Add(new Dictionary<string, object?>
                {
                    ["type"] = "Alarm",
                    ["designTimeId"] = Guid.NewGuid().ToString(),
                    ["name"] = SanitizeComponentName(a.Id, $"Alarm_{a.AlarmNumber}"),
                    ["alarmNumber"] = a.AlarmNumber,
                    ["group"] = a.Group,
                    ["severity"] = a.Severity,
                    ["datapoint"] = a.DatapointId,
                    ["activeColor"] = a.ActiveBackgroundColorHex,
                    ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
                });
            }

            WriteTabIndentedJson(Path.Combine(alarmsDir, "Alarm.json"), new Dictionary<string, object?>
            {
                ["type"] = "AlarmManager",
                ["version"] = versions.AlarmVersion,
                ["alarms"] = alarmObjs
            });
        }

        if (model.Menus.Count > 0)
        {
            var menuDir = Path.Combine(projectDir, "Menu");
            Directory.CreateDirectory(menuDir);
            var menuObjs = model.Menus.Select(m => new Dictionary<string, object?>
            {
                ["type"] = "menu",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["name"] = SanitizeComponentName(m.Name, m.Id),
                ["controlId"] = "sig-control-menu",
                ["children"] = m.Items.Select((it, idx) => new Dictionary<string, object?>
                {
                    ["type"] = "menuItem",
                    ["name"] = $"Item_{it.Value}_{idx}",
                    ["designTimeId"] = Guid.NewGuid().ToString()
                }).ToList(),
                ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" }
            }).ToList();

            WriteTabIndentedJson(Path.Combine(menuDir, "Menu.json"), new Dictionary<string, object?>
            {
                ["type"] = "menus",
                ["version"] = versions.MenuVersion,
                ["menus"] = menuObjs
            });
        }
    }

    private string WriteControlTemplateFile(
        string projectDir,
        ReusableObjectModel obj,
        string version,
        Dictionary<string, (string PaletteRef, string Guid)> colorLookup,
        Dictionary<string, string> fontLookup,
        Dictionary<string, (string ListName, string AliasName, string EntryGuid)> textLookup,
        Dictionary<string, (string FileName, string MediaId)> mediaLookup,
        Dictionary<string, string> fbLookup,
        Dictionary<string, (string Folder, string Guid)> schemeLookup,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        HashSet<string> usedControlIds)
    {
        var dir = Path.Combine(projectDir, "ControlTemplate");
        Directory.CreateDirectory(dir);
        var safeName = SanitizeComponentName(obj.Name, obj.Id);
        var dtId = Guid.NewGuid().ToString();
        var elements = obj.Controls.Select((c, idx) => BuildVisuControlJson(
            c, idx, colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, null, dpLookup, usedControlIds)).ToList();

        var doc = new Dictionary<string, object?>
        {
            ["type"] = "controlTemplate",
            ["version"] = version,
            ["gridWidth"] = "10px",
            ["gridHeight"] = "10px",
            ["gridColor"] = "#000000",
            ["gridStyle"] = "dotgrid",
            ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" },
            ["designTimeId"] = dtId,
            ["name"] = safeName,
            ["instanceId"] = NewInstanceId("design_"),
            ["controlId"] = "sig-dashboard",
            ["properties"] = BuildDashboardRootProperties(obj.Width, obj.Height),
            ["dashboardelements"] = elements
        };

        WriteTabIndentedJson(Path.Combine(dir, $"{safeName}.json"), doc);
        return dtId;
    }

    private string WriteDashboardFile(
        string filePath,
        string rootType,
        string name,
        int uniqueIndex,
        ScreenModel screen,
        string version,
        Dictionary<string, (string PaletteRef, string Guid)> colorLookup,
        Dictionary<string, string> fontLookup,
        Dictionary<string, (string ListName, string AliasName, string EntryGuid)> textLookup,
        Dictionary<string, (string FileName, string MediaId)> mediaLookup,
        Dictionary<string, string> fbLookup,
        Dictionary<string, (string Folder, string Guid)> schemeLookup,
        Dictionary<string, string> templateLookup,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        HashSet<string> usedControlIds)
    {
        var dtId = Guid.NewGuid().ToString();
        var elements = screen.Controls.Select((c, idx) => BuildVisuControlJson(
            c, idx, colorLookup, fontLookup, textLookup, mediaLookup, fbLookup, schemeLookup, templateLookup, dpLookup, usedControlIds)).ToList();

        // In VISUDesigner 01.04: Dashboards & GlobalDashboards use "dashboardelements", Window uses "controls"!
        var elementsJsonKey = string.Equals(rootType, "window", StringComparison.OrdinalIgnoreCase)
            ? "controls"
            : "dashboardelements";

        var doc = new Dictionary<string, object?>
        {
            ["type"] = rootType,
            ["version"] = version,
            ["gridWidth"] = "10px",
            ["gridHeight"] = "10px",
            ["gridColor"] = "#000000",
            ["gridStyle"] = "dotgrid",
            ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" },
            ["designTimeId"] = dtId,
            ["name"] = name,
            ["instanceId"] = NewInstanceId("design_"),
            ["controlId"] = rootType == "window" ? "sig-window-container" : "sig-dashboard",
            ["properties"] = BuildDashboardRootProperties(screen.Width, screen.Height),
            [elementsJsonKey] = elements
        };

        if (string.Equals(rootType, "window", StringComparison.OrdinalIgnoreCase))
        {
            doc["windowIndex"] = uniqueIndex;
        }
        else
        {
            doc["navigationIndex"] = uniqueIndex;
        }

        WriteTabIndentedJson(filePath, doc);
        return dtId;
    }

    private static List<Dictionary<string, object?>> BuildDashboardRootProperties(int width, int height)
    {
        return new List<Dictionary<string, object?>>
        {
            MakeProp("position", "absolute", 0, 2),
            MakeProp("top", "0px", 0, 2),
            MakeProp("left", "0px", 0, 2),
            MakeProp("height", $"{Math.Max(100, height)}px", 0, 2),
            MakeProp("width", $"{Math.Max(100, width)}px", 0, 2),
            MakeProp("overflow", "visible", 0, 2),
            MakeProp("background", "transparent", 0, 2)
        };
    }

    private Dictionary<string, object?> BuildVisuControlJson(
        HmiControlModel ctrl,
        int index,
        Dictionary<string, (string PaletteRef, string Guid)> colorLookup,
        Dictionary<string, string> fontLookup,
        Dictionary<string, (string ListName, string AliasName, string EntryGuid)> textLookup,
        Dictionary<string, (string FileName, string MediaId)> mediaLookup,
        Dictionary<string, string> fbLookup,
        Dictionary<string, (string Folder, string Guid)> schemeLookup,
        Dictionary<string, string>? templateLookup,
        Dictionary<string, (string PublishName, string Guid)> dpLookup,
        HashSet<string>? usedControlIds = null)
    {
        var visuControlId = string.IsNullOrWhiteSpace(ctrl.TargetVisuType) || ctrl.TargetVisuType.Contains('.')
            ? _mappingRegistry.ResolveRule(ctrl).TargetVisuControlId
            : ctrl.TargetVisuType;
        usedControlIds?.Add(visuControlId);

        var props = new List<Dictionary<string, object?>>
        {
            MakeProp("--theme-sig-element-left", $"{ctrl.X}px", 17, 2),
            MakeProp("--theme-sig-element-top", $"{ctrl.Y}px", 17, 2),
            MakeProp("--theme-sig-element-width", $"{Math.Max(4, ctrl.Width)}px", 17, 2),
            MakeProp("--theme-sig-element-height", $"{Math.Max(4, ctrl.Height)}px", 17, 2),
            MakeProp("rotation", 0.0, 17, 12),
            MakeProp("--theme-sig-element-zindex", $"{100 + ctrl.ZIndex}", 0, 2)
        };

        // Bind font if resolved
        if (!string.IsNullOrEmpty(ctrl.FontStyleId) && fontLookup.TryGetValue(ctrl.FontStyleId, out var fontGuid))
        {
            props.Add(MakeProp("elementMainFont", ctrl.FontStyleId, 26, 6, fontGuid));
        }

        // Bind text property depending on target control type
        var textPropName = visuControlId switch
        {
            "sig-control-button" => "sigbtntext",
            "sig-control-toggle-button" => "btntext",
            "sig-control-image-button" => "btntext",
            _ => "sigtext"
        };

        if (!string.IsNullOrEmpty(ctrl.TextListId) && !string.IsNullOrEmpty(ctrl.TextEntryId) &&
            textLookup.TryGetValue($"{ctrl.TextListId}:{ctrl.TextEntryId}", out var textRef))
        {
            props.Add(MakeProp(textPropName, $"{textRef.ListName}:{textRef.AliasName}", 5, 1, textRef.EntryGuid));
        }
        else if (!string.IsNullOrEmpty(ctrl.StaticTextFallback) &&
                 (visuControlId == "sig-control-text" || visuControlId.Contains("button")))
        {
            props.Add(MakeProp(visuControlId == "sig-control-text" ? "previewtext" : textPropName, ctrl.StaticTextFallback, 0, 1));
        }

        // Bind Datapoint property (strictly referencing verified DatapointManager entries)
        if (!string.IsNullOrEmpty(ctrl.DatapointId))
        {
            var rawKey = ctrl.DatapointId;
            var strippedKey = rawKey.Contains(':') ? rawKey[(rawKey.IndexOf(':') + 1)..] : rawKey;
            if (dpLookup.TryGetValue(rawKey, out var dpRef) || dpLookup.TryGetValue(strippedKey, out dpRef))
            {
                var dpPropName = visuControlId == "sig-control-toggle-button" ? "actvalue" : "value";
                props.Add(MakeProp(dpPropName, dpRef.PublishName, 4, 1, dpRef.Guid));
            }
        }

        // Bind Colors (prefer dynamic ColorScheme if present; make image controls transparent so transparent PNG/SVG layers cleanly)
        if (!string.IsNullOrEmpty(ctrl.ColorSchemeId) &&
            (schemeLookup.TryGetValue($"Color:{ctrl.ColorSchemeId}", out var colSch) || schemeLookup.TryGetValue(ctrl.ColorSchemeId, out colSch)) &&
            colSch.Folder == "ColorSchemes")
        {
            props.Add(MakeProp($"--theme-{visuControlId}-background-color", SanitizeComponentName(ctrl.ColorSchemeId, ctrl.ColorSchemeId), 18, 2, colSch.Guid));
        }
        else if (visuControlId == "sig-control-image" || ctrl.TransparentBackground)
        {
            props.Add(MakeProp($"--theme-{visuControlId}-background-color", "transparent", 0, 2));
        }
        else if (colorLookup.TryGetValue(ctrl.BackgroundColorHex, out var bgPalette))
        {
            props.Add(MakeProp($"--theme-{visuControlId}-background-color", bgPalette.PaletteRef, 9, 2, bgPalette.Guid));
        }
        else
        {
            props.Add(MakeProp($"--theme-{visuControlId}-background-color", ctrl.BackgroundColorHex, 0, 2));
        }

        if (colorLookup.TryGetValue(ctrl.ForegroundColorHex, out var fgPalette))
        {
            props.Add(MakeProp($"--theme-{visuControlId}-color", fgPalette.PaletteRef, 9, 2, fgPalette.Guid));
        }

        // Bind Media Image or Dynamic MediaScheme (typeId=29, propTypeId=2) + Pressed Image for buttons
        var imgProp = visuControlId == "sig-control-image"
            ? "--theme-sig-control-image-background-image"
            : $"--theme-{visuControlId}-background-image";

        if (!string.IsNullOrEmpty(ctrl.ImageSchemeId) &&
            (schemeLookup.TryGetValue($"Image:{ctrl.ImageSchemeId}", out var mediaSch) || schemeLookup.TryGetValue(ctrl.ImageSchemeId, out mediaSch)) &&
            mediaSch.Folder == "MediaSchemes")
        {
            props.Add(MakeProp(imgProp, SanitizeComponentName(ctrl.ImageSchemeId, ctrl.ImageSchemeId), 29, 2, mediaSch.Guid));
            if (visuControlId == "sig-control-image")
            {
                props.Add(MakeProp("--theme-sig-control-image-background-size", "100% 100%", 0, 2));
            }
        }
        else if (!string.IsNullOrEmpty(ctrl.ImageAssetId) &&
                 (mediaLookup.TryGetValue(ctrl.ImageAssetId, out var mediaRef) ||
                  mediaLookup.TryGetValue(Path.GetFileNameWithoutExtension(ctrl.ImageAssetId), out mediaRef)))
        {
            props.Add(MakeProp(imgProp, $"Resources\\Images\\{mediaRef.FileName}", 15, 2, mediaRef.MediaId));
            if (visuControlId == "sig-control-image")
            {
                props.Add(MakeProp("--theme-sig-control-image-background-size", "100% 100%", 0, 2));
            }
        }

        if (!string.IsNullOrEmpty(ctrl.PressedImageAssetId) &&
            visuControlId == "sig-control-button" &&
            (mediaLookup.TryGetValue(ctrl.PressedImageAssetId, out var pressedMediaRef) ||
             mediaLookup.TryGetValue(Path.GetFileNameWithoutExtension(ctrl.PressedImageAssetId), out pressedMediaRef)))
        {
            props.Add(MakeProp("--theme-sig-control-button-pressed-background-image", $"Resources\\Images\\{pressedMediaRef.FileName}", 15, 2, pressedMediaRef.MediaId));
        }

        // Bind Composite Template for ObjectInstance
        if (visuControlId == "sig-composite-container" &&
            !string.IsNullOrEmpty(ctrl.ReferencedObjectName) &&
            templateLookup != null &&
            templateLookup.TryGetValue(ctrl.ReferencedObjectName, out var tmplGuid))
        {
            props.Add(MakeProp("sigcompositectrl", SanitizeComponentName(ctrl.ReferencedObjectName, "Template"), 23, 5, tmplGuid));
            if (!string.IsNullOrEmpty(ctrl.OverloadDatapointPrefix))
            {
                var ovKey = ctrl.OverloadDatapointPrefix.Contains(':')
                    ? ctrl.OverloadDatapointPrefix[(ctrl.OverloadDatapointPrefix.IndexOf(':') + 1)..]
                    : ctrl.OverloadDatapointPrefix;
                if (dpLookup.TryGetValue(ovKey, out var ovRef))
                {
                    props.Add(MakeProp("sigoverloadcontent", ovRef.PublishName, 4, 7, ovRef.Guid));
                }
            }
        }

        // Bind Button FunctionBlock events
        foreach (var evt in ctrl.Events)
        {
            if (evt.ActionType == "ExecuteFunctionBlock" &&
                !string.IsNullOrEmpty(evt.FunctionBlockId) &&
                fbLookup.TryGetValue(evt.FunctionBlockId, out var fbGuid))
            {
                var evProp = evt.Trigger == "OnRelease"
                    ? $"{visuControlId}-mouseup"
                    : $"{visuControlId}-tap";
                props.Add(MakeProp(evProp, evt.FunctionBlockId, 1, 3, fbGuid));
            }
        }

        var safeCtrlName = SanitizeComponentName(ctrl.Name, $"Ctrl_{index}");
        return new Dictionary<string, object?>
        {
            ["type"] = "control",
            ["designTimeId"] = Guid.NewGuid().ToString(),
            ["name"] = $"{safeCtrlName}_{index}",
            ["instanceId"] = NewInstanceId("lvd"),
            ["controlId"] = visuControlId,
            ["properties"] = props
        };
    }

    private static void EnsureUsedControlsInstalled(
        string projectDir,
        SoftwareEnvironmentReport env,
        HashSet<string> usedControlIds)
    {
        var vdRoot = !string.IsNullOrWhiteSpace(env.VisuDesignerExecutablePath)
            ? Path.GetDirectoryName(env.VisuDesignerExecutablePath)
            : null;
        if (string.IsNullOrEmpty(vdRoot)) return;
        var libsSigRoot = Path.Combine(vdRoot, "Libs", "sigmatek");
        if (!Directory.Exists(libsSigRoot)) return;

        var expanded = new HashSet<string>(usedControlIds, StringComparer.OrdinalIgnoreCase);
        var queue = new Queue<string>(expanded);
        while (queue.Count > 0)
        {
            var ctrlId = queue.Dequeue();
            if (string.Equals(ctrlId, "sig-composite-container", StringComparison.OrdinalIgnoreCase) &&
                expanded.Add("sig-composite-control"))
            {
                queue.Enqueue("sig-composite-control");
            }

            var manifestPath = Path.Combine(libsSigRoot, ctrlId, $"{ctrlId}.json");
            if (!File.Exists(manifestPath)) continue;
            var manifestText = File.ReadAllText(manifestPath);
            try
            {
                using var doc = JsonDocument.Parse(manifestText, new JsonDocumentOptions
                {
                    AllowTrailingCommas = true,
                    CommentHandling = JsonCommentHandling.Skip
                });
                if (doc.RootElement.TryGetProperty("dependencies", out var deps) && deps.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in deps.EnumerateObject())
                    {
                        if (prop.Name.StartsWith("sig-", StringComparison.OrdinalIgnoreCase) &&
                            Directory.Exists(Path.Combine(libsSigRoot, prop.Name)) &&
                            expanded.Add(prop.Name))
                        {
                            queue.Enqueue(prop.Name);
                        }
                    }
                }
                if (doc.RootElement.TryGetProperty("resources", out var res) && res.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in res.EnumerateArray())
                    {
                        if (item.TryGetProperty("designerAction", out var da) &&
                            string.Equals(da.GetString(), "componentDependency", StringComparison.OrdinalIgnoreCase) &&
                            item.TryGetProperty("path", out var p))
                        {
                            var depId = p.GetString();
                            if (!string.IsNullOrWhiteSpace(depId) &&
                                Directory.Exists(Path.Combine(libsSigRoot, depId)) &&
                                expanded.Add(depId))
                            {
                                queue.Enqueue(depId);
                            }
                        }
                    }
                }
            }
            catch
            {
                // Fallback: extract any referenced sig-* folder names directly if JSON has non-standard syntax
                foreach (System.Text.RegularExpressions.Match m in System.Text.RegularExpressions.Regex.Matches(manifestText, @"sig-[a-z0-9\-]+", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                {
                    var depId = m.Value;
                    if (Directory.Exists(Path.Combine(libsSigRoot, depId)) && expanded.Add(depId))
                    {
                        queue.Enqueue(depId);
                    }
                }
            }
        }

        var targets = new[]
        {
            Path.Combine(projectDir, "Runtime", "DesignerRuntime", "res", "components", "user"),
            Path.Combine(projectDir, "Runtime", "Runtime", "res", "components", "user")
        };

        foreach (var targetRoot in targets)
        {
            Directory.CreateDirectory(targetRoot);
            foreach (var ctrlId in expanded)
            {
                var srcDir = Path.Combine(libsSigRoot, ctrlId);
                var dstDir = Path.Combine(targetRoot, ctrlId);
                if (!Directory.Exists(srcDir) || Directory.Exists(dstDir)) continue;
                CopyDirectoryRecursive(srcDir, dstDir);
            }
        }
    }

    private static void CopyDirectoryRecursive(string sourceDir, string destDir)
    {
        Directory.CreateDirectory(destDir);
        foreach (var file in Directory.GetFiles(sourceDir))
        {
            File.Copy(file, Path.Combine(destDir, Path.GetFileName(file)), overwrite: true);
        }
        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            CopyDirectoryRecursive(subDir, Path.Combine(destDir, Path.GetFileName(subDir)));
        }
    }

    private static void TryAssembleFallbackWebroot(string projectDir, string webrootDir)
    {
        try
        {
            var runtimeSrc = Path.Combine(projectDir, "Runtime", "Runtime");
            Directory.CreateDirectory(webrootDir);
            if (Directory.Exists(runtimeSrc))
            {
                CopyDirectoryRecursive(runtimeSrc, webrootDir);
            }
            var resImages = Path.Combine(projectDir, "Resources", "Images");
            if (Directory.Exists(resImages))
            {
                CopyDirectoryRecursive(resImages, Path.Combine(webrootDir, "Resources", "Images"));
            }
            var codeModules = Path.Combine(projectDir, "CodeModules");
            if (Directory.Exists(codeModules))
            {
                CopyDirectoryRecursive(codeModules, Path.Combine(webrootDir, "CodeModules"));
            }
            var indexHtml = Path.Combine(webrootDir, "index.html");
            if (!File.Exists(indexHtml))
            {
                File.WriteAllText(indexHtml, "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>VISUDesigner Published HMI</title></head><body><div id=\"sig-visu-root\"></div><script src=\"CodeModules/MigratedLogic.js\"></script></body></html>", new UTF8Encoding(false));
            }
        }
        catch
        {
            // Non-fatal fallback
        }
    }

    private static void UpdateDefaultViewFile(
        string projectDir,
        int width,
        int height,
        string viewVersion,
        List<(string Name, string Guid, bool IsStart)> dashboards,
        List<(string Name, string Guid)> globalDashboards,
        List<(string Name, string Guid)> windows,
        Dictionary<string, (string PaletteRef, string Guid)> colorLookup,
        Dictionary<string, string> fontLookup)
    {
        var viewDir = Path.Combine(projectDir, "View");
        Directory.CreateDirectory(viewDir);
        var viewPath = Path.Combine(viewDir, "Default.json");

        var bgColorProp = colorLookup.Values.FirstOrDefault();
        var defaultFontGuid = fontLookup.Values.FirstOrDefault() ?? Guid.NewGuid().ToString();

        var viewDoc = new Dictionary<string, object?>
        {
            ["type"] = "view",
            ["version"] = viewVersion,
            ["designTimeId"] = Guid.NewGuid().ToString(),
            ["name"] = "Default",
            ["revision"] = new Dictionary<string, object?> { ["type"] = "Revision" },
            ["width"] = $"{width}px",
            ["height"] = $"{height}px",
            ["default"] = true,
            ["isActive"] = true,
            ["backgroundColor"] = new Dictionary<string, object?>
            {
                ["value"] = bgColorProp.PaletteRef ?? "_SigmatekDefaultColors:DeepBlueTheme_BackgroundColor",
                ["typeId"] = 9,
                ["propTypeId"] = 2,
                ["refId"] = bgColorProp.Guid ?? Guid.NewGuid().ToString()
            },
            ["defaultFontStyle"] = new Dictionary<string, object?>
            {
                ["value"] = "Default",
                ["typeId"] = 26,
                ["propTypeId"] = 1,
                ["refId"] = defaultFontGuid
            },
            ["windowViewEntries"] = windows.Select(w => new Dictionary<string, object?>
            {
                ["type"] = "viewEntry",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["typeId"] = 4,
                ["value"] = new Dictionary<string, object?>
                {
                    ["value"] = w.Name,
                    ["typeId"] = 31,
                    ["propTypeId"] = 1,
                    ["refId"] = w.Guid
                }
            }).ToList(),
            ["keyboardViewEntries"] = Array.Empty<object>(),
            ["dashboardViewEntries"] = dashboards.Select(d => new Dictionary<string, object?>
            {
                ["type"] = "viewEntry",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["isStartDashboard"] = d.IsStart,
                ["typeId"] = 2,
                ["value"] = new Dictionary<string, object?>
                {
                    ["value"] = d.Name,
                    ["typeId"] = 12,
                    ["propTypeId"] = 1,
                    ["refId"] = d.Guid
                }
            }).ToList(),
            ["globalDashboardViewEntries"] = globalDashboards.Select(g => new Dictionary<string, object?>
            {
                ["type"] = "viewEntry",
                ["designTimeId"] = Guid.NewGuid().ToString(),
                ["typeId"] = 3,
                ["value"] = new Dictionary<string, object?>
                {
                    ["value"] = g.Name,
                    ["typeId"] = 40,
                    ["propTypeId"] = 1,
                    ["refId"] = g.Guid
                }
            }).ToList(),
            ["systemWindowViewEntries"] = Array.Empty<object>()
        };

        WriteTabIndentedJson(viewPath, viewDoc);
    }

    private static Dictionary<string, object?> MakeProp(
        string name,
        object? value,
        int typeId,
        int propTypeId,
        string? refId = null)
    {
        var dict = new Dictionary<string, object?>
        {
            ["name"] = name,
            ["value"] = value,
            ["typeId"] = typeId,
            ["propTypeId"] = propTypeId
        };
        if (!string.IsNullOrEmpty(refId))
        {
            dict["refId"] = refId;
        }
        return dict;
    }

    private static void WriteTabIndentedJson(string path, object data)
    {
        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir))
        {
            Directory.CreateDirectory(dir);
        }
        var raw = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });
        // Convert 2-space JsonSerializer indentation to VISUDesigner tab indentation
        var lines = raw.Replace("\r\n", "\n").Split('\n');
        var sb = new StringBuilder(raw.Length);
        foreach (var line in lines)
        {
            var spaces = 0;
            while (spaces < line.Length && line[spaces] == ' ') spaces++;
            var tabs = spaces / 2;
            sb.Append('\t', tabs);
            sb.AppendLine(line[spaces..]);
        }
        File.WriteAllText(path, sb.ToString().TrimEnd('\r', '\n'), new UTF8Encoding(false));
    }

    private static string ResolveEntryTranslationForLang(TextEntryModel entry, string visuLang)
    {
        if (entry.Translations.TryGetValue(visuLang, out var exact)) return exact;
        foreach (var kvp in entry.Translations)
        {
            if (kvp.Key.StartsWith(visuLang, StringComparison.OrdinalIgnoreCase))
            {
                return kvp.Value;
            }
        }
        return entry.Translations.Values.FirstOrDefault() ?? entry.EntryId;
    }

    private static string NormalizeVisuLangCode(string bcp47)
    {
        if (string.IsNullOrWhiteSpace(bcp47)) return "en";
        var dash = bcp47.IndexOf('-');
        return dash > 0 ? bcp47[..dash].ToLowerInvariant() : bcp47.ToLowerInvariant();
    }

    private static string NewInstanceId(string prefix)
    {
        return prefix + Guid.NewGuid().ToString("N");
    }

    private static string SanitizeFileName(string raw)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var sb = new StringBuilder();
        foreach (var ch in raw)
        {
            sb.Append(invalid.Contains(ch) ? '_' : ch);
        }
        var s = sb.ToString().Trim();
        return string.IsNullOrEmpty(s) ? "MigratedVisuProject" : s;
    }

    private static string SanitizeComponentName(string raw, string fallback)
    {
        if (string.IsNullOrWhiteSpace(raw)) return fallback;
        var sb = new StringBuilder();
        foreach (var ch in raw)
        {
            if (char.IsLetterOrDigit(ch) || ch == '_' || ch == '-') sb.Append(ch);
            else if (ch == ' ') sb.Append('_');
        }
        var s = sb.ToString().Trim('_');
        if (string.IsNullOrEmpty(s)) return fallback;
        if (char.IsDigit(s[0])) s = "C_" + s;
        return s;
    }

    private static string PyStr(string value)
    {
        return "'" + value.Replace("\\", "\\\\").Replace("'", "\\'") + "'";
    }

    private static string GetStr(JsonElement elem, string prop, string fallback)
    {
        return elem.TryGetProperty(prop, out var p) && p.ValueKind == JsonValueKind.String
            ? p.GetString() ?? fallback
            : fallback;
    }

    private sealed class FileVersionInfoBlock
    {
        public string DashboardVersion { get; set; } = "0.0.96";
        public string GlobalDashboardVersion { get; set; } = "0.0.96";
        public string WindowVersion { get; set; } = "0.0.96";
        public string ControlTemplateVersion { get; set; } = "0.0.96";
        public string StationsVersion { get; set; } = "0.0.97";
        public string DatapointVersion { get; set; } = "0.0.98";
        public string TextListVersion { get; set; } = "0.0.96";
        public string ViewVersion { get; set; } = "0.0.96";
        public string FunctionBlockVersion { get; set; } = "0.0.97";
        public string ColorPaletteVersion { get; set; } = "0.0.96";
        public string FontStylesVersion { get; set; } = "0.0.96";
        public string UnitDefinitionsVersion { get; set; } = "0.0.96";
        public string AlarmVersion { get; set; } = "0.0.96";
        public string MenuVersion { get; set; } = "0.0.96";
        public string SchemeVersion { get; set; } = "0.0.96";
    }
}

public sealed class VisuGenerationOptions
{
    public bool OverwriteTarget { get; set; } = true;
    public bool ConvertBmpTransparencyToPng { get; set; } = true;
    public bool PublishWebroot { get; set; } = true;
    public SvgConversionOptions? SvgOptions { get; set; } = new SvgConversionOptions { Enabled = true, Mode = "Hybrid" };
}

public sealed class VisuGenerationResult
{
    public bool Success { get; set; }
    public string ProjectDirectory { get; set; } = string.Empty;
    public string LvpFilePath { get; set; } = string.Empty;
    public string? PublishedWebrootDirectory { get; set; }
    public bool SynchronizationSucceeded { get; set; }
    public int DashboardCount { get; set; }
    public int WindowCount { get; set; }
    public int ControlCount { get; set; }
    public List<string> Warnings { get; } = new();
}
