using System;
using System.IO;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Target.VISUDesigner;
using Xunit;

namespace LASAL.HMI.Converter.VisuDesignerTests;

public class VisuDesignerTests
{
    [Fact]
    public void EnvironmentDetector_FindsInstalledVisuDesignerAndNativeControls()
    {
        var env = new SoftwareEnvironmentDetector().Detect();
        Assert.True(env.VisuDesignerInstalled);
        Assert.True(env.InstalledVisuControls.Count >= 25);
        Assert.Contains("sig-control-button", env.InstalledVisuControls);
        Assert.Contains("sig-control-output", env.InstalledVisuControls);
    }

    [Fact]
    public async Task Generator_CreatesSyncsAndPublishesNativeVisuDesignerProject()
    {
        var env = new SoftwareEnvironmentDetector().Detect();
        if (!env.VisuDesignerInstalled) return;

        var tempOut = Path.Combine(Path.GetTempPath(), "visu_test_" + Guid.NewGuid().ToString("N")[..6]);
        Directory.CreateDirectory(tempOut);
        try
        {
            var model = new HmiIntermediateModel
            {
                ProjectMetadata = new ProjectMetadataModel
                {
                    ProjectName = "TestGeneratedVisu",
                    ResolutionWidth = 800,
                    ResolutionHeight = 480,
                    StartScreenName = "MainDash"
                },
                Languages = { new LanguageModel { Bcp47Code = "en-US", DisplayName = "English", Lcid = 1033 } },
                TextLists =
                {
                    new TextListModel
                    {
                        Id = "ProjectText",
                        Name = "ProjectText",
                        Entries = { new TextEntryModel { EntryId = "0", NumericIndex = 0, Translations = { ["en"] = "Start Pump" } } }
                    }
                },
                Datapoints =
                {
                    new DatapointModel { Id = "Pump1.Cmd", SymbolPath = "Pump1.Cmd", ObjectName = "Pump1", ServerName = "Cmd", StationNumber = 0 }
                },
                Screens =
                {
                    new ScreenModel
                    {
                        Id = "MainDash",
                        Name = "MainDash",
                        Width = 800,
                        Height = 480,
                        Controls =
                        {
                            new HmiControlModel { Id = "c1", Name = "StartBtn", SourceType = "PushButton", X = 50, Y = 50, Width = 140, Height = 50, TextListId = "ProjectText", TextEntryId = "0", DatapointId = "Pump1.Cmd" }
                        }
                    }
                }
            };

            var gen = new VisuDesignerProjectGenerator();
            var res = await gen.GenerateProjectAsync(model, tempOut, tempOut, new VisuGenerationOptions { PublishWebroot = true });

            Assert.True(res.Success);
            Assert.True(File.Exists(res.LvpFilePath));
            Assert.True(File.Exists(Path.Combine(res.ProjectDirectory, "Dashboards", "MainDash.json")));
            Assert.True(File.Exists(Path.Combine(res.ProjectDirectory, "View", "Default.json")));
            Assert.NotNull(res.PublishedWebrootDirectory);
            Assert.True(File.Exists(Path.Combine(res.PublishedWebrootDirectory!, "index.html")));
        }
        finally
        {
            try { Directory.Delete(tempOut, recursive: true); } catch { }
        }
    }
}
