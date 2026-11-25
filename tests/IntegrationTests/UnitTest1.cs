using System.IO;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Core;
using Xunit;

namespace LASAL.HMI.Converter.IntegrationTests;

public class IntegrationTests
{
    [Theory]
    [InlineData("2_PumpControlSolution", @"C:\SigmaControl\examples\SampleSource\2_PumpControlSolution\Stations\Terminal\LSE\LSE.lpr")]
    [InlineData("4_PumpControlSchemeSolution", @"C:\SigmaControl\examples\SampleSource\4_PumpControlSchemeSolution\Stations\Terminal\LSE\LSE.lpr")]
    [InlineData("5_ClassInputOutputSolution", @"C:\SigmaControl\examples\SampleSource\5_ClassInputOutputSolution\Stations\Terminal\LSE\LSE.lpr")]
    [InlineData("LASALScreenAdvancedSolution", @"C:\SigmaControl\examples\SampleSource\LASALScreenAdvancedSolution\LASALScreenAdvancedSolution\LASALScreenAdvacnedSolution\Stations\Terminal\LSE\LSE.lpr")]
    public async Task EndToEndConversion_ConvertsRealTrainingProjectsToPublishedVisuDesigner(string outputFolderName, string sampleLprPath)
    {
        Assert.True(File.Exists(sampleLprPath), $"Sample project missing: {sampleLprPath}");

        var outputDir = Path.Combine(@"C:\SigmaControl\examples\ExpectedOutput", outputFolderName);
        var orchestrator = new ConversionOrchestrator();
        var result = await orchestrator.RunConversionAsync(new ConversionRequest
        {
            SourceLprPath = sampleLprPath,
            TargetOutputDirectory = outputDir,
            OverwriteTarget = true,
            ConvertBmpTransparencyToPng = true,
            PublishWebroot = true
        });

        Assert.True(result.Success);
        Assert.True(File.Exists(result.IntermediateJsonPath));
        Assert.True(File.Exists(result.VisuResult.LvpFilePath));
        Assert.True(result.IntermediateModel.Screens.Count >= 1);
        Assert.True(result.ValidationResult.DefaultViewValid);
        Assert.True(result.ValidationResult.PublishWebrootExists);
        Assert.True(result.ValidationResult.AverageVisualSimilarityPercent > 50.0);
        Assert.NotNull(result.ReportFiles);
        Assert.True(File.Exists(result.ReportFiles!.HtmlReportPath));
        Assert.True(File.Exists(result.ReportFiles!.ExcelReportPath));
    }
}
