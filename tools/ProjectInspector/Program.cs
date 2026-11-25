using System;
using System.IO;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Core;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Source.LASALScreen;

namespace LASAL.HMI.Converter.ProjectInspector;

internal static class Program
{
    private static async Task<int> Main(string[] args)
    {
        if (args.Length == 0 || !File.Exists(args[0]))
        {
            Console.WriteLine("Usage: LASAL.HMI.Converter.ProjectInspector <path-to-LSE.lpr> [output-ir.json] [--convert <target-output-dir>] [--svg-mode Hybrid|VTracer|AI|None] [--ai-provider Gemini|OpenAI] [--ai-model <model>]");
            return 1;
        }

        string? convertDir = null;
        string? irOutPath = null;
        var svgMode = "Hybrid";
        string? aiProvider = null;
        string? aiModel = null;
        for (var i = 1; i < args.Length; i++)
        {
            if (string.Equals(args[i], "--convert", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                convertDir = args[++i];
            }
            else if (string.Equals(args[i], "--svg-mode", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                svgMode = args[++i];
            }
            else if (string.Equals(args[i], "--ai-provider", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                aiProvider = args[++i];
            }
            else if (string.Equals(args[i], "--ai-model", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                aiModel = args[++i];
            }
            else if (irOutPath == null)
            {
                irOutPath = args[i];
            }
        }

        if (!string.IsNullOrWhiteSpace(convertDir))
        {
            var orchestrator = new ConversionOrchestrator();
            var progress = new Progress<ConversionProgressUpdate>(u =>
                Console.WriteLine($"[{u.PercentComplete,3}%] {u.StageDescription}"));

            var res = await orchestrator.RunConversionAsync(new ConversionRequest
            {
                SourceLprPath = args[0],
                TargetOutputDirectory = convertDir,
                OverwriteTarget = true,
                ConvertBmpTransparencyToPng = true,
                PublishWebroot = true,
                ConvertImagesToSvg = !string.Equals(svgMode, "None", StringComparison.OrdinalIgnoreCase),
                SvgConversionMode = svgMode,
                AiSvgProvider = aiProvider,
                AiSvgModel = aiModel
            }, progress);

            var model = res.IntermediateModel;
            Console.WriteLine($"Project      : {model.ProjectMetadata.ProjectName} ({model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight})");
            Console.WriteLine($"Screens      : {model.Screens.Count} -> {res.VisuResult.DashboardCount} Dashboards");
            Console.WriteLine($"Windows      : {model.Windows.Count} -> {res.VisuResult.WindowCount} Windows");
            Console.WriteLine($"Objects      : {model.ReusableObjects.Count}");
            Console.WriteLine($"Datapoints   : {model.Datapoints.Count}");
            Console.WriteLine($"Languages    : {model.Languages.Count}");
            Console.WriteLine($"TextLists    : {model.TextLists.Count}");
            Console.WriteLine($"Assets       : {model.Assets.Count}");
            Console.WriteLine($"Schemes      : {model.Schemes.Count}");
            Console.WriteLine($"Alarms       : {model.Alarms.Count}");
            Console.WriteLine($"FuncBlocks   : {model.FunctionBlocks.Count}");
            Console.WriteLine($"Target .lvp  : {res.VisuResult.LvpFilePath}");
            Console.WriteLine($"Webroot      : {res.VisuResult.PublishedWebrootDirectory ?? "N/A"}");
            Console.WriteLine($"Validation   : {(res.ValidationResult.Passed ? "PASSED" : "REVIEW REQUIRED")} (Similarity: {res.ValidationResult.AverageVisualSimilarityPercent:F2}%)");
            if (res.ReportFiles != null)
            {
                Console.WriteLine($"HTML Report  : {res.ReportFiles.HtmlReportPath}");
                Console.WriteLine($"Excel Report : {res.ReportFiles.ExcelReportPath}");
            }
            return res.Success ? 0 : 2;
        }

        var extractor = new LasalScreenProjectExtractor();
        var extracted = await extractor.ExtractProjectAsync(args[0]);

        Console.WriteLine($"Project      : {extracted.ProjectMetadata.ProjectName} ({extracted.ProjectMetadata.ResolutionWidth}x{extracted.ProjectMetadata.ResolutionHeight})");
        Console.WriteLine($"Screens      : {extracted.Screens.Count}");
        Console.WriteLine($"Windows      : {extracted.Windows.Count}");
        Console.WriteLine($"Objects      : {extracted.ReusableObjects.Count}");
        Console.WriteLine($"Datapoints   : {extracted.Datapoints.Count}");
        Console.WriteLine($"Languages    : {extracted.Languages.Count}");
        Console.WriteLine($"TextLists    : {extracted.TextLists.Count}");
        Console.WriteLine($"Assets       : {extracted.Assets.Count}");
        Console.WriteLine($"Schemes      : {extracted.Schemes.Count}");
        Console.WriteLine($"Alarms       : {extracted.Alarms.Count}");
        Console.WriteLine($"FuncBlocks   : {extracted.FunctionBlocks.Count}");

        if (!string.IsNullOrWhiteSpace(irOutPath))
        {
            IntermediateSchemaValidator.SaveToFile(extracted, irOutPath);
            Console.WriteLine($"Saved IR JSON to: {irOutPath}");
        }

        return 0;
    }
}
