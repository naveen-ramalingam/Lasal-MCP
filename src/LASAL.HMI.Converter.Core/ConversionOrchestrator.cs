using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Assets;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Reporting;
using LASAL.HMI.Converter.Source.LASALScreen;
using LASAL.HMI.Converter.Target.VISUDesigner;
using LASAL.HMI.Converter.Validation;

namespace LASAL.HMI.Converter.Core;

/// <summary>
/// Orchestrates the complete end-to-end HMI migration pipeline:
///   Stage 1: Environment Detection &amp; Immutable Source Staging
///   Stage 2: LASAL SCREEN Extraction (COM + XML + Runtime\*.MPC + Filesystem + CLASS 2)
///   Stage 3: Intermediate Representation Serialization &amp; Schema Validation
///   Stage 4: Coordinate Scaling &amp; Control Mapping Resolution
///   Stage 5: Native VISUDesigner Project Generation &amp; lvd Synchronization / Publishing
///   Stage 6: OpenCV/ImageSharp Visual &amp; Structural Validation
///   Stage 7: Multi-Format Report Generation (HTML, JSON, CSV, Excel)
/// </summary>
public sealed class ConversionOrchestrator
{
    public ObjectMappingRegistry MappingRegistry { get; }

    public ConversionOrchestrator(ObjectMappingRegistry? mappingRegistry = null)
    {
        MappingRegistry = mappingRegistry ?? new ObjectMappingRegistry();
    }

    public async Task<ConversionPipelineResult> RunConversionAsync(
        ConversionRequest request,
        IProgress<ConversionProgressUpdate>? progress = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var sw = Stopwatch.StartNew();

        var env = new SoftwareEnvironmentDetector().Detect();
        Report(progress, 5, "Detecting installed SIGMATEK software versions & staging source project...");

        var extractor = new LasalScreenProjectExtractor();
        Report(progress, 15, "Extracting LASAL SCREEN project (COM, XML, Runtime/*.MPC, CLASS 2)...");
        var model = await extractor.ExtractProjectAsync(
            request.SourceLprPath,
            request.Class2ProjectPath,
            cancellationToken).ConfigureAwait(false);

        Report(progress, 35, "Validating Intermediate Representation (IR) schema...");
        var schemaCheck = IntermediateSchemaValidator.Validate(model);
        if (!schemaCheck.IsValid)
        {
            throw new InvalidOperationException("Intermediate schema validation failed: " + string.Join("; ", schemaCheck.Errors));
        }

        if (request.TargetWidth.HasValue && request.TargetHeight.HasValue &&
            request.TargetWidth.Value > 0 && request.TargetHeight.Value > 0)
        {
            Report(progress, 45, $"Scaling resolution from {model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight} to {request.TargetWidth}x{request.TargetHeight}...");
            LayoutScaler.ScaleModelResolution(
                model,
                request.TargetWidth.Value,
                request.TargetHeight.Value,
                request.PreserveAspectRatio);
        }

        Report(progress, 52, "Applying configurable LASAL SCREEN -> VISUDesigner mapping rules...");
        MappingRegistry.ApplyMappingsToModel(model);

        Directory.CreateDirectory(request.TargetOutputDirectory);
        var irPath = Path.Combine(request.TargetOutputDirectory, "intermediate_model.json");
        IntermediateSchemaValidator.SaveToFile(model, irPath);

        Report(progress, 62, "Generating native VISUDesigner (.lvp) project & publishing webroot...");
        var generator = new VisuDesignerProjectGenerator(MappingRegistry);
        var sourceDir = Path.GetDirectoryName(Path.GetFullPath(request.SourceLprPath))
            ?? throw new InvalidOperationException("Invalid source .lpr directory");

        var visuResult = await generator.GenerateProjectAsync(
            model,
            sourceDir,
            request.TargetOutputDirectory,
            new VisuGenerationOptions
            {
                OverwriteTarget = request.OverwriteTarget,
                ConvertBmpTransparencyToPng = request.ConvertBmpTransparencyToPng,
                PublishWebroot = request.PublishWebroot,
                SvgOptions = request.ConvertImagesToSvg
                    ? new SvgConversionOptions
                    {
                        Enabled = true,
                        Mode = request.SvgConversionMode,
                        AiProvider = request.AiSvgProvider,
                        AiApiKey = request.AiSvgApiKey,
                        AiModel = request.AiSvgModel
                    }
                    : null
            },
            cancellationToken).ConfigureAwait(false);

        Report(progress, 82, "Running OpenCV visual comparison & structural validation...");
        var previewsDir = Path.Combine(request.TargetOutputDirectory, "_validation_previews");
        var validator = new VisualAndFunctionalValidator(MappingRegistry);
        var validation = validator.ValidateConversion(model, visuResult.ProjectDirectory, previewsDir);

        Report(progress, 92, "Generating 17-section Conversion Reports (HTML, JSON, CSV, Excel)...");
        var reportsDir = Path.Combine(request.TargetOutputDirectory, "_reports");
        sw.Stop();
        var reporter = new ConversionReportGenerator(MappingRegistry);
        var reportFiles = reporter.GenerateAllReports(model, env, visuResult, validation, reportsDir, sw.Elapsed);

        Report(progress, 100, "Conversion pipeline completed successfully.");

        return new ConversionPipelineResult
        {
            Success = visuResult.Success && schemaCheck.IsValid,
            Environment = env,
            IntermediateModel = model,
            IntermediateJsonPath = irPath,
            VisuResult = visuResult,
            ValidationResult = validation,
            ReportFiles = reportFiles,
            Duration = sw.Elapsed
        };
    }

    private static void Report(IProgress<ConversionProgressUpdate>? progress, int percent, string message)
    {
        ConverterLogger.Info($"[{percent}%] {message}");
        progress?.Report(new ConversionProgressUpdate(percent, message));
    }
}

public sealed class ConversionRequest
{
    public string SourceLprPath { get; set; } = string.Empty;
    public string? Class2ProjectPath { get; set; }
    public string TargetOutputDirectory { get; set; } = string.Empty;
    public int? TargetWidth { get; set; }
    public int? TargetHeight { get; set; }
    public bool PreserveAspectRatio { get; set; }
    public bool OverwriteTarget { get; set; } = true;
    public bool ConvertBmpTransparencyToPng { get; set; } = true;
    public bool PublishWebroot { get; set; } = true;
    public bool ConvertImagesToSvg { get; set; } = true;
    public string SvgConversionMode { get; set; } = "Hybrid";
    public string? AiSvgProvider { get; set; }
    public string? AiSvgApiKey { get; set; }
    public string? AiSvgModel { get; set; }
}

public sealed record ConversionProgressUpdate(int PercentComplete, string StageDescription);

public sealed class ConversionPipelineResult
{
    public bool Success { get; set; }
    public SoftwareEnvironmentReport Environment { get; set; } = new();
    public HmiIntermediateModel IntermediateModel { get; set; } = new();
    public string IntermediateJsonPath { get; set; } = string.Empty;
    public VisuGenerationResult VisuResult { get; set; } = new();
    public ValidationSummaryReport ValidationResult { get; set; } = new();
    public GeneratedReportFiles? ReportFiles { get; set; }
    public TimeSpan Duration { get; set; }
}
