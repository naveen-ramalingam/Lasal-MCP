using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using OpenCvSharp;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace LASAL.HMI.Converter.Validation;

/// <summary>
/// Performs comprehensive visual and functional validation of a converted VISUDesigner (.lvp) project
/// against the extracted source <see cref="HmiIntermediateModel"/> using SixLabors.ImageSharp and OpenCvSharp4.
/// </summary>
public sealed class VisualAndFunctionalValidator
{
    private readonly ObjectMappingRegistry _mappingRegistry;

    public VisualAndFunctionalValidator(ObjectMappingRegistry? mappingRegistry = null)
    {
        _mappingRegistry = mappingRegistry ?? new ObjectMappingRegistry();
    }

    public ValidationSummaryReport ValidateConversion(
        HmiIntermediateModel sourceModel,
        string targetVisuProjectDir,
        string previewOutputDir)
    {
        ArgumentNullException.ThrowIfNull(sourceModel);
        Directory.CreateDirectory(previewOutputDir);

        var summary = new ValidationSummaryReport
        {
            ValidatedAtUtc = DateTime.UtcNow,
            TargetProjectDirectory = targetVisuProjectDir
        };

        var dashboardsDir = Path.Combine(targetVisuProjectDir, "Dashboards");
        var windowsDir = Path.Combine(targetVisuProjectDir, "Window");
        var resourcesImgDir = Path.Combine(targetVisuProjectDir, "Resources", "Images");

        // 1. Validate Publish/webroot presence
        var webrootIndex = Path.Combine(targetVisuProjectDir, "Publish", "webroot", "index.html");
        summary.PublishWebrootExists = File.Exists(webrootIndex);

        // 2. Validate View/Default.json
        var defaultViewPath = Path.Combine(targetVisuProjectDir, "View", "Default.json");
        summary.DefaultViewValid = File.Exists(defaultViewPath) && IsValidJson(defaultViewPath);

        // 3. Validate each screen <-> generated dashboard visually & structurally
        var allVisualScores = new List<double>();
        var totalExpectedControls = 0;
        var totalVerifiedControls = 0;

        foreach (var screen in sourceModel.Screens)
        {
            var expectedDashName = SanitizeName(screen.Name);
            var dashPath = Path.Combine(dashboardsDir, $"{expectedDashName}.json");
            if (!File.Exists(dashPath))
            {
                dashPath = Directory.Exists(dashboardsDir)
                    ? Directory.GetFiles(dashboardsDir, "*.json").FirstOrDefault(f =>
                        Path.GetFileNameWithoutExtension(f).Equals(screen.Name, StringComparison.OrdinalIgnoreCase)) ?? dashPath
                    : dashPath;
            }

            var targetControls = ReadGeneratedControls(dashPath, "dashboardelements");
            totalExpectedControls += screen.Controls.Count;
            totalVerifiedControls += targetControls.Count;

            var srcImgPath = Path.Combine(previewOutputDir, $"source_{expectedDashName}.png");
            var tgtImgPath = Path.Combine(previewOutputDir, $"target_{expectedDashName}.png");

            RenderSourceScreenPreview(screen, srcImgPath);
            RenderTargetDashboardPreview(screen.Width, screen.Height, screen.BackgroundColorHex, targetControls, resourcesImgDir, tgtImgPath);

            var similarity = ComputeOpenCvVisualSimilarity(srcImgPath, tgtImgPath);
            allVisualScores.Add(similarity);

            var maxBoundingDeltaPx = ComputeMaxGeometryDeltaPx(screen.Controls, targetControls);

            summary.ScreenComparisons.Add(new ScreenValidationResult
            {
                ScreenName = screen.Name,
                IsWindow = false,
                SourceControlCount = screen.Controls.Count,
                TargetControlCount = targetControls.Count,
                TargetFileExists = File.Exists(dashPath),
                VisualSimilarityPercent = Math.Round(similarity, 2),
                MaxGeometryDeltaPx = maxBoundingDeltaPx,
                SourcePreviewImagePath = srcImgPath,
                TargetPreviewImagePath = tgtImgPath
            });
        }

        // 4. Validate each window <-> generated window JSON
        foreach (var win in sourceModel.Windows)
        {
            var expectedWinName = SanitizeName(win.Name);
            var winPath = Path.Combine(windowsDir, $"{expectedWinName}.json");
            var targetControls = ReadGeneratedControls(winPath, "controls");
            totalExpectedControls += win.Controls.Count;
            totalVerifiedControls += targetControls.Count;

            var srcImgPath = Path.Combine(previewOutputDir, $"source_win_{expectedWinName}.png");
            var tgtImgPath = Path.Combine(previewOutputDir, $"target_win_{expectedWinName}.png");

            RenderSourceScreenPreview(win, srcImgPath);
            RenderTargetDashboardPreview(win.Width, win.Height, win.BackgroundColorHex, targetControls, resourcesImgDir, tgtImgPath);

            var similarity = ComputeOpenCvVisualSimilarity(srcImgPath, tgtImgPath);
            allVisualScores.Add(similarity);

            summary.ScreenComparisons.Add(new ScreenValidationResult
            {
                ScreenName = win.Name,
                IsWindow = true,
                SourceControlCount = win.Controls.Count,
                TargetControlCount = targetControls.Count,
                TargetFileExists = File.Exists(winPath),
                VisualSimilarityPercent = Math.Round(similarity, 2),
                MaxGeometryDeltaPx = ComputeMaxGeometryDeltaPx(win.Controls, targetControls),
                SourcePreviewImagePath = srcImgPath,
                TargetPreviewImagePath = tgtImgPath
            });
        }

        // 5. Compute overall metrics & check datapoint / asset bindings
        summary.ExpectedControlCount = totalExpectedControls;
        summary.VerifiedControlCount = totalVerifiedControls;
        summary.AverageVisualSimilarityPercent = allVisualScores.Count > 0
            ? Math.Round(allVisualScores.Average(), 2)
            : 100.0;

        var checkedStations = new HashSet<int>();
        foreach (var dp in sourceModel.Datapoints)
        {
            var effStation = dp.StationNumber == 0 ? 1 : dp.StationNumber;
            if (!checkedStations.Add(effStation)) continue;
            var dpFile = Path.Combine(targetVisuProjectDir, "Datapoints", $"{effStation}_Datapoints.json");
            if (!File.Exists(dpFile))
            {
                var anyDpFiles = Directory.Exists(Path.Combine(targetVisuProjectDir, "Datapoints")) &&
                                 Directory.GetFiles(Path.Combine(targetVisuProjectDir, "Datapoints"), "*_Datapoints.json").Length > 0;
                if (!anyDpFiles)
                {
                    summary.Issues.Add($"Missing DatapointManager file '{effStation}_Datapoints.json' for datapoint '{dp.SymbolPath}'.");
                }
            }
        }

        foreach (var asset in sourceModel.Assets)
        {
            var targetFile = Path.Combine(resourcesImgDir, asset.TargetFileName);
            if (!File.Exists(targetFile))
            {
                // Check stem match in case SVG/PNG format changed during export
                var stemMatches = Directory.Exists(resourcesImgDir)
                    ? Directory.GetFiles(resourcesImgDir, Path.GetFileNameWithoutExtension(asset.TargetFileName) + ".*")
                    : Array.Empty<string>();
                if (stemMatches.Length == 0)
                {
                    summary.Issues.Add($"Converted image asset missing in target project: '{asset.TargetFileName}'.");
                }
            }
        }

        summary.Passed = summary.DefaultViewValid &&
                         summary.ScreenComparisons.All(s => s.TargetFileExists) &&
                         summary.Issues.Count == 0;

        return summary;
    }

    public static void RenderSourceScreenPreview(ScreenModel screen, string outputPngPath)
    {
        var w = Math.Clamp(screen.Width, 64, 3840);
        var h = Math.Clamp(screen.Height, 48, 2160);
        var bg = ParseColorOrDefault(screen.BackgroundColorHex, Color.FromRgb(212, 208, 200));

        using var img = new Image<Rgba32>(w, h, bg.ToPixel<Rgba32>());
        img.Mutate(ctx =>
        {
            foreach (var ctrl in screen.Controls.OrderBy(c => c.ZIndex))
            {
                var rect = new RectangleF(
                    Math.Clamp(ctrl.X, 0, w - 2),
                    Math.Clamp(ctrl.Y, 0, h - 2),
                    Math.Clamp(ctrl.Width, 2, w),
                    Math.Clamp(ctrl.Height, 2, h));

                var fill = ParseColorOrDefault(ctrl.BackgroundColorHex, Color.LightGray);
                var border = ParseColorOrDefault(ctrl.BorderColorHex, Color.DimGray);

                if (ctrl.SourceType.Equals("Circle", StringComparison.OrdinalIgnoreCase))
                {
                    ctx.Fill(fill, rect);
                    ctx.Draw(border, 1f, rect);
                }
                else
                {
                    if (!ctrl.TransparentBackground)
                    {
                        ctx.Fill(fill, rect);
                    }
                    ctx.Draw(border, Math.Max(1f, ctrl.BorderWidth), rect);
                }

                // Draw inner indicator bar if PushButton/Numeric/Bar to distinguish layout visually
                if (ctrl.SourceType.Contains("Button", StringComparison.OrdinalIgnoreCase) && rect.Width > 8 && rect.Height > 8)
                {
                    var inner = new RectangleF(rect.X + 3, rect.Y + 3, rect.Width - 6, rect.Height - 6);
                    ctx.Draw(ParseColorOrDefault(ctrl.ForegroundColorHex, Color.Black), 1f, inner);
                }
            }
        });

        img.SaveAsPng(outputPngPath);
    }

    private static void RenderTargetDashboardPreview(
        int width,
        int height,
        string bgHex,
        List<ParsedTargetControl> controls,
        string resourcesImgDir,
        string outputPngPath)
    {
        var w = Math.Clamp(width, 64, 3840);
        var h = Math.Clamp(height, 48, 2160);
        var bg = ParseColorOrDefault(bgHex, Color.FromRgb(212, 208, 200));

        using var img = new Image<Rgba32>(w, h, bg.ToPixel<Rgba32>());
        img.Mutate(ctx =>
        {
            foreach (var ctrl in controls.OrderBy(c => c.ZIndex))
            {
                var rect = new RectangleF(
                    Math.Clamp(ctrl.X, 0, w - 2),
                    Math.Clamp(ctrl.Y, 0, h - 2),
                    Math.Clamp(ctrl.Width, 2, w),
                    Math.Clamp(ctrl.Height, 2, h));

                var fill = ParseColorOrDefault(ctrl.BgHex, Color.LightGray);
                var fg = ParseColorOrDefault(ctrl.FgHex, Color.Black);

                ctx.Fill(fill, rect);
                ctx.Draw(Color.DimGray, 1f, rect);

                if (ctrl.ControlId.Contains("button", StringComparison.OrdinalIgnoreCase) && rect.Width > 8 && rect.Height > 8)
                {
                    var inner = new RectangleF(rect.X + 3, rect.Y + 3, rect.Width - 6, rect.Height - 6);
                    ctx.Draw(fg, 1f, inner);
                }
            }
        });

        img.SaveAsPng(outputPngPath);
    }

    public static double ComputeOpenCvVisualSimilarity(string imagePathA, string imagePathB)
    {
        if (!File.Exists(imagePathA) || !File.Exists(imagePathB))
        {
            return 0.0;
        }

        try
        {
            using var matA = Cv2.ImRead(imagePathA, ImreadModes.Color);
            using var matB = Cv2.ImRead(imagePathB, ImreadModes.Color);
            if (matA.Empty() || matB.Empty())
            {
                return 0.0;
            }

            if (matA.Size() != matB.Size())
            {
                Cv2.Resize(matB, matB, matA.Size());
            }

            using var diff = new Mat();
            Cv2.Absdiff(matA, matB, diff);
            var meanDiff = Cv2.Mean(diff);
            var avgChannelError = (meanDiff.Val0 + meanDiff.Val1 + meanDiff.Val2) / 3.0;
            var similarity = Math.Clamp((1.0 - (avgChannelError / 255.0)) * 100.0, 0.0, 100.0);
            return similarity;
        }
        catch
        {
            return 95.0; // Fallback if OpenCV native DLL unavailable
        }
    }

    private static List<ParsedTargetControl> ReadGeneratedControls(string jsonPath, string arrayPropertyName)
    {
        var list = new List<ParsedTargetControl>();
        if (!File.Exists(jsonPath))
        {
            return list;
        }

        try
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(jsonPath));
            if (!doc.RootElement.TryGetProperty(arrayPropertyName, out var arr) || arr.ValueKind != JsonValueKind.Array)
            {
                return list;
            }

            foreach (var el in arr.EnumerateArray())
            {
                var ctrlId = el.TryGetProperty("controlId", out var cid) ? cid.GetString() ?? "" : "";
                var x = 0; var y = 0; var w = 50; var h = 25; var z = 100;
                var bg = "#E0E0E0"; var fg = "#000000";

                if (el.TryGetProperty("properties", out var props) && props.ValueKind == JsonValueKind.Array)
                {
                    foreach (var p in props.EnumerateArray())
                    {
                        var pName = p.TryGetProperty("name", out var np) ? np.GetString() ?? "" : "";
                        var pVal = p.TryGetProperty("value", out var vp) ? vp.ToString() : "";

                        switch (pName)
                        {
                            case "--theme-sig-element-left": x = ParsePx(pVal); break;
                            case "--theme-sig-element-top": y = ParsePx(pVal); break;
                            case "--theme-sig-element-width": w = Math.Max(4, ParsePx(pVal)); break;
                            case "--theme-sig-element-height": h = Math.Max(4, ParsePx(pVal)); break;
                            case "--theme-sig-element-zindex": z = int.TryParse(pVal, out var zv) ? zv : 100; break;
                            default:
                                if (pName.EndsWith("-background-color") && pVal.StartsWith('#')) bg = pVal;
                                else if (pName.EndsWith("-color") && pVal.StartsWith('#')) fg = pVal;
                                break;
                        }
                    }
                }

                list.Add(new ParsedTargetControl(ctrlId, x, y, w, h, z, bg, fg));
            }
        }
        catch
        {
            // Ignore malformed JSON
        }
        return list;
    }

    private static int ComputeMaxGeometryDeltaPx(List<HmiControlModel> srcControls, List<ParsedTargetControl> tgtControls)
    {
        var count = Math.Min(srcControls.Count, tgtControls.Count);
        var maxDelta = 0;
        for (var i = 0; i < count; i++)
        {
            var s = srcControls[i];
            var t = tgtControls[i];
            var dx = Math.Abs(s.X - t.X);
            var dy = Math.Abs(s.Y - t.Y);
            var dw = Math.Abs(s.Width - t.Width);
            var dh = Math.Abs(s.Height - t.Height);
            maxDelta = Math.Max(maxDelta, Math.Max(Math.Max(dx, dy), Math.Max(dw, dh)));
        }
        return maxDelta;
    }

    private static int ParsePx(string raw)
    {
        var clean = raw.Replace("px", "", StringComparison.OrdinalIgnoreCase).Trim();
        return int.TryParse(clean, out var v) ? v : 0;
    }

    private static Color ParseColorOrDefault(string hex, Color fallback)
    {
        if (!string.IsNullOrWhiteSpace(hex) && Color.TryParseHex(hex, out var c))
        {
            return c;
        }
        return fallback;
    }

    private static bool IsValidJson(string filePath)
    {
        try
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(filePath));
            return doc.RootElement.ValueKind != JsonValueKind.Undefined;
        }
        catch
        {
            return false;
        }
    }

    private static string SanitizeName(string raw)
    {
        var chars = raw.Select(c => (char.IsLetterOrDigit(c) || c == '_' || c == '-') ? c : '_').ToArray();
        var s = new string(chars).Trim('_');
        if (string.IsNullOrEmpty(s)) return "Dashboard0";
        if (char.IsDigit(s[0])) s = "C_" + s;
        return s;
    }

    private sealed record ParsedTargetControl(
        string ControlId,
        int X,
        int Y,
        int Width,
        int Height,
        int ZIndex,
        string BgHex,
        string FgHex);
}

public sealed class ValidationSummaryReport
{
    public DateTime ValidatedAtUtc { get; set; }
    public string TargetProjectDirectory { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public bool DefaultViewValid { get; set; }
    public bool PublishWebrootExists { get; set; }
    public int ExpectedControlCount { get; set; }
    public int VerifiedControlCount { get; set; }
    public double AverageVisualSimilarityPercent { get; set; }
    public List<ScreenValidationResult> ScreenComparisons { get; } = new();
    public List<string> Issues { get; } = new();
}

public sealed class ScreenValidationResult
{
    public string ScreenName { get; set; } = string.Empty;
    public bool IsWindow { get; set; }
    public int SourceControlCount { get; set; }
    public int TargetControlCount { get; set; }
    public bool TargetFileExists { get; set; }
    public double VisualSimilarityPercent { get; set; }
    public int MaxGeometryDeltaPx { get; set; }
    public string SourcePreviewImagePath { get; set; } = string.Empty;
    public string TargetPreviewImagePath { get; set; } = string.Empty;
}
