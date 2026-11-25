using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Target.VISUDesigner;
using LASAL.HMI.Converter.Validation;

namespace LASAL.HMI.Converter.Reporting;

/// <summary>
/// Generates the complete 17-section Conversion Report in HTML, JSON, CSV, and Excel (.xlsx) formats.
/// </summary>
public sealed class ConversionReportGenerator
{
    private readonly ObjectMappingRegistry _mappingRegistry;

    public ConversionReportGenerator(ObjectMappingRegistry? mappingRegistry = null)
    {
        _mappingRegistry = mappingRegistry ?? new ObjectMappingRegistry();
    }

    public GeneratedReportFiles GenerateAllReports(
        HmiIntermediateModel model,
        SoftwareEnvironmentReport env,
        VisuGenerationResult visuResult,
        ValidationSummaryReport validation,
        string reportOutputDir,
        TimeSpan duration)
    {
        ArgumentNullException.ThrowIfNull(model);
        Directory.CreateDirectory(reportOutputDir);

        var htmlPath = Path.Combine(reportOutputDir, "ConversionReport.html");
        var jsonPath = Path.Combine(reportOutputDir, "ConversionReport.json");
        var csvPath = Path.Combine(reportOutputDir, "ConversionReport_Objects.csv");
        var xlsxPath = Path.Combine(reportOutputDir, "ConversionReport.xlsx");

        var html = Build17SectionHtmlReport(model, env, visuResult, validation, duration);
        File.WriteAllText(htmlPath, html, Encoding.UTF8);

        var jsonBundle = new
        {
            generatedAtUtc = DateTime.UtcNow,
            durationSeconds = duration.TotalSeconds,
            environment = env,
            sourceSummary = new
            {
                model.ProjectMetadata.ProjectName,
                model.ProjectMetadata.SourceLprPath,
                model.ProjectMetadata.SourceClass2ProjectPath,
                Resolution = $"{model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight}",
                ScreenCount = model.Screens.Count,
                WindowCount = model.Windows.Count,
                ObjectTemplateCount = model.ReusableObjects.Count,
                DatapointCount = model.Datapoints.Count,
                LanguageCount = model.Languages.Count,
                TextListCount = model.TextLists.Count,
                AssetCount = model.Assets.Count,
                SchemeCount = model.Schemes.Count,
                AlarmCount = model.Alarms.Count,
                MenuCount = model.Menus.Count,
                FunctionBlockCount = model.FunctionBlocks.Count,
                CustomPlcUiClassCount = model.CustomPlcUiClasses.Count
            },
            targetSummary = visuResult,
            validationSummary = validation,
            diagnostics = model.Diagnostics
        };
        File.WriteAllText(jsonPath, JsonSerializer.Serialize(jsonBundle, new JsonSerializerOptions { WriteIndented = true }), Encoding.UTF8);

        WriteObjectsCsv(model, csvPath);
        WriteExcelWorkbook(model, env, visuResult, validation, xlsxPath, duration);

        return new GeneratedReportFiles(htmlPath, jsonPath, csvPath, xlsxPath);
    }

    private string Build17SectionHtmlReport(
        HmiIntermediateModel model,
        SoftwareEnvironmentReport env,
        VisuGenerationResult visuResult,
        ValidationSummaryReport validation,
        TimeSpan duration)
    {
        var totalControls = model.Screens.Sum(s => s.Controls.Count) + model.Windows.Sum(w => w.Controls.Count);
        var fullCount = CountBySupportLevel(model, MappingSupportLevel.Full);
        var partialCount = CountBySupportLevel(model, MappingSupportLevel.Partial);
        var unsupportedCount = CountBySupportLevel(model, MappingSupportLevel.Unsupported);

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"/>");
        sb.AppendLine($"<title>LASAL HMI Conversion Report — {H(model.ProjectMetadata.ProjectName)}</title>");
        sb.AppendLine("<style>");
        sb.AppendLine("body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px;line-height:1.5;}");
        sb.AppendLine(".container{max-width:1280px;margin:0 auto;}");
        sb.AppendLine("h1{color:#38bdf8;border-bottom:2px solid #1e293b;padding-bottom:12px;}");
        sb.AppendLine("h2{color:#7dd3fc;margin-top:28px;border-left:4px solid #38bdf8;padding-left:10px;}");
        sb.AppendLine(".grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:16px 0;}");
        sb.AppendLine(".card{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;}");
        sb.AppendLine(".card .num{font-size:24px;font-weight:700;color:#38bdf8;}");
        sb.AppendLine(".badge-ok{background:#14532d;color:#86efac;padding:2px 8px;border-radius:4px;font-size:12px;}");
        sb.AppendLine(".badge-warn{background:#78350f;color:#fde68a;padding:2px 8px;border-radius:4px;font-size:12px;}");
        sb.AppendLine("table{width:100%;border-collapse:collapse;margin-top:8px;background:#1e293b;border-radius:6px;overflow:hidden;font-size:13px;}");
        sb.AppendLine("th,td{border:1px solid #334155;padding:7px 10px;text-align:left;}");
        sb.AppendLine("th{background:#0f172a;color:#94a3b8;}");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        // 1. Executive Summary
        sb.AppendLine($"<h1>LASAL HMI Conversion Report — {H(model.ProjectMetadata.ProjectName)}</h1>");
        sb.AppendLine("<h2>1. Executive Summary</h2>");
        sb.AppendLine("<div class=\"grid\">");
        sb.AppendLine($"<div class=\"card\"><div>Screens / Dashboards</div><div class=\"num\">{model.Screens.Count} &rarr; {visuResult.DashboardCount}</div></div>");
        sb.AppendLine($"<div class=\"card\"><div>Windows</div><div class=\"num\">{model.Windows.Count} &rarr; {visuResult.WindowCount}</div></div>");
        sb.AppendLine($"<div class=\"card\"><div>Total Controls</div><div class=\"num\">{totalControls}</div></div>");
        sb.AppendLine($"<div class=\"card\"><div>Datapoints</div><div class=\"num\">{model.Datapoints.Count}</div></div>");
        sb.AppendLine($"<div class=\"card\"><div>Visual Similarity</div><div class=\"num\">{validation.AverageVisualSimilarityPercent:F1}%</div></div>");
        sb.AppendLine($"<div class=\"card\"><div>Duration</div><div class=\"num\">{duration.TotalSeconds:F1}s</div></div>");
        sb.AppendLine("</div>");
        sb.AppendLine($"<p>Overall Validation Status: {(validation.Passed ? "<span class=\"badge-ok\">PASSED</span>" : "<span class=\"badge-warn\">REVIEW REQUIRED</span>")} | Full Mappings: {fullCount} | Partial: {partialCount} | Unsupported: {unsupportedCount}</p>");

        // 2. Source Project Inventory
        sb.AppendLine("<h2>2. Source Project Inventory</h2>");
        sb.AppendLine($"<p><b>Source .lpr:</b> <code>{H(model.ProjectMetadata.SourceLprPath)}</code><br/>");
        sb.AppendLine($"<b>Resolution:</b> {model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight} | <b>Compiler Ver:</b> {model.ProjectMetadata.LseCompilerVersion} | <b>Source Files Verified (SHA-256):</b> {model.ProjectMetadata.SourceFileChecksums.Count}</p>");

        // 3. Target VISUDesigner Project Summary
        sb.AppendLine("<h2>3. Target VISUDesigner Project Summary</h2>");
        sb.AppendLine($"<p><b>Target .lvp:</b> <code>{H(visuResult.LvpFilePath)}</code><br/>");
        sb.AppendLine($"<b>Synchronization:</b> {(visuResult.SynchronizationSucceeded ? "Completed via lvd.py" : "Offline JSON DB")} | <b>Published Webroot:</b> <code>{H(visuResult.PublishedWebrootDirectory ?? "Not generated")}</code></p>");

        // 4. Software Versions Detected
        sb.AppendLine("<h2>4. Software Versions Detected</h2>");
        sb.AppendLine("<table><tr><th>Component</th><th>Detected Version</th><th>Status</th><th>Path</th></tr>");
        sb.AppendLine($"<tr><td>LASAL SCREEN</td><td>{H(env.LasalScreenVersion)}</td><td>{(env.LasalScreenInstalled ? "Installed" : "Missing")}</td><td><code>{H(env.LasalScreenExecutablePath)}</code></td></tr>");
        sb.AppendLine($"<tr><td>LASAL VISUDesigner</td><td>{H(env.VisuDesignerVersion)}</td><td>{(env.VisuDesignerInstalled ? "Installed" : "Missing")}</td><td><code>{H(env.VisuDesignerExecutablePath)}</code></td></tr>");
        sb.AppendLine($"<tr><td>LASAL CLASS 2</td><td>{H(env.LasalClass2Version)}</td><td>{(env.LasalClass2Installed ? "Installed" : "Missing")}</td><td><code>{H(env.LasalClass2ExecutablePath)}</code></td></tr>");
        sb.AppendLine($"<tr><td>MachineManager</td><td>{H(env.MachineManagerVersion)}</td><td>{(env.MachineManagerInstalled ? "Installed" : "Missing")}</td><td><code>{H(env.MachineManagerExecutablePath)}</code></td></tr>");
        sb.AppendLine($"<tr><td>LARS Runtime</td><td>{H(env.LarsVersion)}</td><td>{(env.LarsInstalled ? "Installed" : "Not Installed (Graceful)")}</td><td><code>{H(env.LarsExecutablePath)}</code></td></tr>");
        sb.AppendLine("</table>");

        // 5. Screen Conversion Results
        sb.AppendLine("<h2>5. Screen Conversion Results</h2>");
        sb.AppendLine("<table><tr><th>Name</th><th>Type</th><th>Size</th><th>Src Controls</th><th>Tgt Controls</th><th>Visual Similarity</th><th>Max Delta</th></tr>");
        foreach (var sc in validation.ScreenComparisons.Where(x => !x.IsWindow))
        {
            sb.AppendLine($"<tr><td>{H(sc.ScreenName)}</td><td>Dashboard</td><td>{model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight}</td><td>{sc.SourceControlCount}</td><td>{sc.TargetControlCount}</td><td>{sc.VisualSimilarityPercent:F2}%</td><td>{sc.MaxGeometryDeltaPx}px</td></tr>");
        }
        sb.AppendLine("</table>");

        // 6. Window Conversion Results
        sb.AppendLine("<h2>6. Window Conversion Results</h2>");
        sb.AppendLine("<table><tr><th>Window Name</th><th>Src Controls</th><th>Tgt Controls</th><th>Target Exists</th><th>Similarity</th></tr>");
        foreach (var wn in validation.ScreenComparisons.Where(x => x.IsWindow))
        {
            sb.AppendLine($"<tr><td>{H(wn.ScreenName)}</td><td>{wn.SourceControlCount}</td><td>{wn.TargetControlCount}</td><td>{wn.TargetFileExists}</td><td>{wn.VisualSimilarityPercent:F2}%</td></tr>");
        }
        sb.AppendLine("</table>");

        // 7. Object & Control Conversion Results
        sb.AppendLine("<h2>7. Object &amp; Control Conversion Results</h2>");
        sb.AppendLine("<table><tr><th>Screen/Window</th><th>Control Name</th><th>Source Type</th><th>Target VISUDesigner Control</th><th>Bounds (X,Y,W,H)</th><th>Datapoint</th><th>Support</th></tr>");
        foreach (var scr in model.Screens.Concat(model.Windows))
        {
            foreach (var c in scr.Controls.Take(250))
            {
                var rule = _mappingRegistry.ResolveRule(c, model.CustomPlcUiClasses);
                sb.AppendLine($"<tr><td>{H(scr.Name)}</td><td>{H(c.Name)}</td><td>{H(c.SourceType)}</td><td><code>{H(rule.TargetVisuControlId)}</code></td><td>{c.X},{c.Y},{c.Width}x{c.Height}</td><td>{H(c.DatapointId ?? "-")}</td><td>{rule.SupportLevel}</td></tr>");
            }
        }
        sb.AppendLine("</table>");

        // 8. Datapoint & Variable Mapping Table
        sb.AppendLine("<h2>8. Datapoint &amp; Variable Mapping Table</h2>");
        sb.AppendLine("<table><tr><th>Station</th><th>Symbol Path</th><th>LSE Type</th><th>VISU Type</th><th>Unit</th><th>Min / Max</th></tr>");
        foreach (var dp in model.Datapoints.Take(250))
        {
            sb.AppendLine($"<tr><td>{dp.StationNumber}</td><td><code>{H(dp.SymbolPath)}</code></td><td>{H(dp.LseVarType)}</td><td>{H(dp.VisuDataType)}</td><td>{H(dp.UnitId ?? "-")}</td><td>{dp.MinLimit?.ToString() ?? "-"} / {dp.MaxLimit?.ToString() ?? "-"}</td></tr>");
        }
        sb.AppendLine("</table>");

        // 9. Logic & Event Conversion Results
        sb.AppendLine("<h2>9. Logic &amp; Event Conversion Results</h2>");
        sb.AppendLine($"<p>Migrated FunctionBlocks: <b>{model.FunctionBlocks.Count}</b> | Custom PLC UI Classes (`_MyIO`/`_ScrollArea2`/`_Screen`): <b>{model.CustomPlcUiClasses.Count}</b></p>");

        // 10. Asset & Image Conversion Results
        sb.AppendLine("<h2>10. Asset &amp; Image Conversion Results</h2>");
        sb.AppendLine("<table><tr><th>Original File</th><th>Target File</th><th>Dimensions</th><th>Transparency Converted</th></tr>");
        foreach (var a in model.Assets)
        {
            sb.AppendLine($"<tr><td>{H(a.OriginalFileName)}</td><td>{H(a.TargetFileName)}</td><td>{a.Width}x{a.Height}</td><td>{a.HasTransparencyKey}</td></tr>");
        }
        sb.AppendLine("</table>");

        // 11. Text List & Language Conversion Results
        sb.AppendLine("<h2>11. Text List &amp; Language Conversion Results</h2>");
        sb.AppendLine($"<p>Languages: {string.Join(", ", model.Languages.Select(l => $"{l.DisplayName} ({l.Bcp47Code})"))} | Text Lists: {model.TextLists.Count} | Total Text Entries: {model.TextLists.Sum(t => t.Entries.Count)}</p>");

        // 12. Alarm, Trend, and Menu Conversion Results
        sb.AppendLine("<h2>12. Alarm, Trend, Scheme &amp; Menu Conversion Results</h2>");
        sb.AppendLine($"<p>Alarms: {model.Alarms.Count} | Schemes: {model.Schemes.Count} | Menus: {model.Menus.Count} | Units: {model.Units.Count}</p>");

        // 13. Unsupported & Partially Converted Features
        sb.AppendLine("<h2>13. Unsupported &amp; Partially Converted Features</h2>");
        sb.AppendLine($"<p>Custom PLC classes requiring manual UI behavior review: {model.CustomPlcUiClasses.Count}</p>");

        // 14. Warnings & Errors
        sb.AppendLine("<h2>14. Warnings &amp; Errors</h2>");
        sb.AppendLine("<ul>");
        foreach (var w in visuResult.Warnings.Concat(validation.Issues))
        {
            sb.AppendLine($"<li>{H(w)}</li>");
        }
        foreach (var d in model.Diagnostics)
        {
            sb.AppendLine($"<li>[{H(d.Severity)}] {H(d.Message)}</li>");
        }
        sb.AppendLine("</ul>");

        // 15. Visual Comparison Results
        sb.AppendLine("<h2>15. Visual Comparison Results</h2>");
        sb.AppendLine($"<p>Average Pixel/Layout Similarity across {validation.ScreenComparisons.Count} views: <b>{validation.AverageVisualSimilarityPercent:F2}%</b></p>");

        // 16. Manual Review Checklist
        sb.AppendLine("<h2>16. Manual Review Checklist</h2>");
        sb.AppendLine("<ul>");
        sb.AppendLine("<li>Open generated <code>.lvp</code> project in SIGMATEK LASAL VISUDesigner and verify layout visually.</li>");
        sb.AppendLine("<li>Connect LARS/PLC Station address in <code>Stations\\Stations.json</code> if different from default <code>127.0.0.1:1954</code>.</li>");
        if (model.CustomPlcUiClasses.Count > 0)
        {
            sb.AppendLine($"<li>Review generated JavaScript stubs in <code>CodeModules\\CustomMyIoStubs.js</code> for {model.CustomPlcUiClasses.Count} custom PLC UI class(es).</li>");
        }
        sb.AppendLine("</ul>");

        // 17. Environment Traceability Footer
        sb.AppendLine("<h2>17. Engineering Traceability</h2>");
        sb.AppendLine($"<p>Generated by LASAL HMI Converter v1.0.0 at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC.</p>");
        sb.AppendLine("</div></body></html>");
        return sb.ToString();
    }

    private void WriteObjectsCsv(HmiIntermediateModel model, string csvPath)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ScreenOrWindow,IsWindow,ControlName,SourceType,TargetVisuControl,X,Y,Width,Height,Datapoint,TextList,TextEntry,SupportLevel");
        foreach (var scr in model.Screens.Concat(model.Windows))
        {
            foreach (var c in scr.Controls)
            {
                var rule = _mappingRegistry.ResolveRule(c, model.CustomPlcUiClasses);
                sb.AppendLine(string.Join(",",
                    Csv(scr.Name),
                    scr.IsWindow ? "true" : "false",
                    Csv(c.Name),
                    Csv(c.SourceType),
                    Csv(rule.TargetVisuControlId),
                    c.X,
                    c.Y,
                    c.Width,
                    c.Height,
                    Csv(c.DatapointId ?? ""),
                    Csv(c.TextListId ?? ""),
                    Csv(c.TextEntryId ?? ""),
                    rule.SupportLevel));
            }
        }
        File.WriteAllText(csvPath, sb.ToString(), Encoding.UTF8);
    }

    private void WriteExcelWorkbook(
        HmiIntermediateModel model,
        SoftwareEnvironmentReport env,
        VisuGenerationResult visuResult,
        ValidationSummaryReport validation,
        string xlsxPath,
        TimeSpan duration)
    {
        using var wb = new XLWorkbook();

        var summaryWs = wb.Worksheets.Add("Summary");
        summaryWs.Cell(1, 1).Value = "Project Name";
        summaryWs.Cell(1, 2).Value = model.ProjectMetadata.ProjectName;
        summaryWs.Cell(2, 1).Value = "Source .lpr";
        summaryWs.Cell(2, 2).Value = model.ProjectMetadata.SourceLprPath;
        summaryWs.Cell(3, 1).Value = "Target .lvp";
        summaryWs.Cell(3, 2).Value = visuResult.LvpFilePath;
        summaryWs.Cell(4, 1).Value = "Resolution";
        summaryWs.Cell(4, 2).Value = $"{model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight}";
        summaryWs.Cell(5, 1).Value = "Visual Similarity (%)";
        summaryWs.Cell(5, 2).Value = validation.AverageVisualSimilarityPercent;
        summaryWs.Cell(6, 1).Value = "Duration (s)";
        summaryWs.Cell(6, 2).Value = duration.TotalSeconds;
        summaryWs.Cell(7, 1).Value = "LASAL SCREEN Version";
        summaryWs.Cell(7, 2).Value = env.LasalScreenVersion;
        summaryWs.Cell(8, 1).Value = "VISUDesigner Version";
        summaryWs.Cell(8, 2).Value = env.VisuDesignerVersion;

        var screensWs = wb.Worksheets.Add("Screens & Validation");
        screensWs.Cell(1, 1).Value = "Name";
        screensWs.Cell(1, 2).Value = "Type";
        screensWs.Cell(1, 3).Value = "Source Controls";
        screensWs.Cell(1, 4).Value = "Target Controls";
        screensWs.Cell(1, 5).Value = "Similarity (%)";
        screensWs.Cell(1, 6).Value = "Max Geometry Delta (px)";
        var r = 2;
        foreach (var sc in validation.ScreenComparisons)
        {
            screensWs.Cell(r, 1).Value = sc.ScreenName;
            screensWs.Cell(r, 2).Value = sc.IsWindow ? "Window" : "Screen";
            screensWs.Cell(r, 3).Value = sc.SourceControlCount;
            screensWs.Cell(r, 4).Value = sc.TargetControlCount;
            screensWs.Cell(r, 5).Value = sc.VisualSimilarityPercent;
            screensWs.Cell(r, 6).Value = sc.MaxGeometryDeltaPx;
            r++;
        }

        var controlsWs = wb.Worksheets.Add("Controls Mapping");
        controlsWs.Cell(1, 1).Value = "Screen";
        controlsWs.Cell(1, 2).Value = "Control Name";
        controlsWs.Cell(1, 3).Value = "Source Type";
        controlsWs.Cell(1, 4).Value = "Target VISU Control";
        controlsWs.Cell(1, 5).Value = "X";
        controlsWs.Cell(1, 6).Value = "Y";
        controlsWs.Cell(1, 7).Value = "Width";
        controlsWs.Cell(1, 8).Value = "Height";
        controlsWs.Cell(1, 9).Value = "Datapoint";
        controlsWs.Cell(1, 10).Value = "Support Level";
        r = 2;
        foreach (var scr in model.Screens.Concat(model.Windows))
        {
            foreach (var c in scr.Controls)
            {
                var rule = _mappingRegistry.ResolveRule(c, model.CustomPlcUiClasses);
                controlsWs.Cell(r, 1).Value = scr.Name;
                controlsWs.Cell(r, 2).Value = c.Name;
                controlsWs.Cell(r, 3).Value = c.SourceType;
                controlsWs.Cell(r, 4).Value = rule.TargetVisuControlId;
                controlsWs.Cell(r, 5).Value = c.X;
                controlsWs.Cell(r, 6).Value = c.Y;
                controlsWs.Cell(r, 7).Value = c.Width;
                controlsWs.Cell(r, 8).Value = c.Height;
                controlsWs.Cell(r, 9).Value = c.DatapointId ?? string.Empty;
                controlsWs.Cell(r, 10).Value = rule.SupportLevel.ToString();
                r++;
            }
        }

        var dpWs = wb.Worksheets.Add("Datapoints");
        dpWs.Cell(1, 1).Value = "Station";
        dpWs.Cell(1, 2).Value = "SymbolPath";
        dpWs.Cell(1, 3).Value = "LseVarType";
        dpWs.Cell(1, 4).Value = "VisuDataType";
        dpWs.Cell(1, 5).Value = "Unit";
        r = 2;
        foreach (var dp in model.Datapoints.Take(2500))
        {
            dpWs.Cell(r, 1).Value = dp.StationNumber;
            dpWs.Cell(r, 2).Value = dp.SymbolPath;
            dpWs.Cell(r, 3).Value = dp.LseVarType;
            dpWs.Cell(r, 4).Value = dp.VisuDataType;
            dpWs.Cell(r, 5).Value = dp.UnitId ?? string.Empty;
            r++;
        }

        wb.SaveAs(xlsxPath);
    }

    private int CountBySupportLevel(HmiIntermediateModel model, MappingSupportLevel level)
    {
        return model.Screens.Concat(model.Windows)
            .SelectMany(s => s.Controls)
            .Count(c => _mappingRegistry.ResolveRule(c, model.CustomPlcUiClasses).SupportLevel == level);
    }

    private static string H(string? s) => WebUtility.HtmlEncode(s ?? string.Empty);

    private static string Csv(string? s)
    {
        var val = s ?? string.Empty;
        if (val.Contains(',') || val.Contains('"') || val.Contains('\n'))
        {
            return "\"" + val.Replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}

public sealed record GeneratedReportFiles(
    string HtmlReportPath,
    string JsonReportPath,
    string CsvReportPath,
    string ExcelReportPath);
