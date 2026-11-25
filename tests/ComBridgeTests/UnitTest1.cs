using System;
using System.IO;
using System.Threading.Tasks;
using LASAL.HMI.Converter.ComBridge;
using LASAL.HMI.Converter.Infrastructure;
using Xunit;

namespace LASAL.HMI.Converter.ComBridgeTests;

public class ComBridgeTests
{
    [Fact]
    public void EnvironmentDetector_FindsInstalledLasalScreenAndSysWow64PowerShell()
    {
        var env = new SoftwareEnvironmentDetector().Detect();
        Assert.True(env.SysWow64PowerShellAvailable);
        Assert.True(env.LasalScreenInstalled);
        Assert.True(env.LasalScreenComRegistered);
        Assert.Equal("LASALScreen.Application", env.LasalScreenProgId);
    }

    [Fact]
    public async Task ComBridge_ExtractsSampleProjectHeadlesslyWithoutModifyingSource()
    {
        var env = new SoftwareEnvironmentDetector().Detect();
        if (!env.LasalScreenInstalled) return;

        var sampleLpr = @"C:\SigmaControl\examples\SampleSource\4_PumpControlSchemeSolution\Stations\Terminal\LSE\LSE.lpr";
        Assert.True(File.Exists(sampleLpr), $"Sample .lpr not found at {sampleLpr}");

        using var staging = StagingManager.CreateStagedCopy(sampleLpr);
        var outDir = Path.Combine(staging.StagedProjectDirectory, "_com_test");

        var bridge = new LasalScreenComBridge();
        var res = await bridge.ExtractProjectViaComAsync(staging.StagedLprPath, outDir, compileIfRuntimeMissing: false);

        Assert.True(res.Success, res.ErrorMessage);
        Assert.True(res.Screens.Count >= 1);
        Assert.True(res.Languages.Count >= 1);
        Assert.True(res.TextLists.Count >= 1);
        Assert.True(res.XmlExported);
        Assert.True(File.Exists(res.ExportedXmlPath));

        staging.VerifySourceImmutability();
    }
}
