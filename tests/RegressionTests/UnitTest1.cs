using System;
using System.IO;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Source.LASALScreen;
using Xunit;

namespace LASAL.HMI.Converter.RegressionTests;

public class RegressionTests
{
    [Fact]
    public async Task SourceProjectFiles_RemainBitForBitUnchangedAfterExtraction()
    {
        var sampleLpr = @"C:\SigmaControl\examples\SampleSource\4_PumpControlSchemeSolution\Stations\Terminal\LSE\LSE.lpr";
        Assert.True(File.Exists(sampleLpr));

        var srcDir = Path.GetDirectoryName(sampleLpr)!;
        var beforeChecksums = StagingManager.ComputeDirectoryChecksums(srcDir);

        var extractor = new LasalScreenProjectExtractor();
        var model1 = await extractor.ExtractProjectAsync(sampleLpr);
        var model2 = await extractor.ExtractProjectAsync(sampleLpr);

        var afterChecksums = StagingManager.ComputeDirectoryChecksums(srcDir);
        Assert.Equal(beforeChecksums.Count, afterChecksums.Count);
        foreach (var kvp in beforeChecksums)
        {
            Assert.Equal(kvp.Value, afterChecksums[kvp.Key]);
        }

        // Verify deterministic structural extraction
        Assert.Equal(model1.Screens.Count, model2.Screens.Count);
        Assert.Equal(model1.Datapoints.Count, model2.Datapoints.Count);
        Assert.Equal(model1.TextLists.Count, model2.TextLists.Count);
        Assert.Equal(model1.Schemes.Count, model2.Schemes.Count);
        Assert.Equal(model1.Assets.Count, model2.Assets.Count);
    }
}
