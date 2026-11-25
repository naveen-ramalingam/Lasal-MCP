using System;
using System.IO;
using System.Linq;
using ClosedXML.Excel;
using LASAL.HMI.Converter.Assets;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Logic;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Reporting;
using LASAL.HMI.Converter.Target.VISUDesigner;
using LASAL.HMI.Converter.Validation;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Xunit;

namespace LASAL.HMI.Converter.UnitTests;

public class UnitTests
{
    [Fact]
    public void IntermediateModel_SerializationAndSchemaValidation_Works()
    {
        var model = CreateSampleModel();
        var json = IntermediateSchemaValidator.Serialize(model);
        var roundTrip = IntermediateSchemaValidator.Deserialize(json);

        var validation = IntermediateSchemaValidator.Validate(roundTrip);
        Assert.True(validation.IsValid, string.Join("; ", validation.Errors));
        Assert.Equal("SampleUnitTest", roundTrip.ProjectMetadata.ProjectName);
        Assert.Single(roundTrip.Screens);
        Assert.Equal(2, roundTrip.Screens[0].Controls.Count);
    }

    [Theory]
    [InlineData((ushort)0x0000, "#000000")]
    [InlineData((ushort)0xFFFF, "#FFFFFF")]
    [InlineData((ushort)0xF800, "#FF0000")]
    [InlineData((ushort)0x07E0, "#00FF00")]
    [InlineData((ushort)0x001F, "#0000FF")]
    public void Rgb565ToCssHex_ConvertsExactColorChannels(ushort rgb565, string expectedHex)
    {
        var hex = AssetMigrationService.ConvertRgb565ToCssHex(rgb565);
        Assert.Equal(expectedHex, hex);
    }

    [Fact]
    public void ConvertBmpToTransparentPng_TurnsMagicPinkPixelsTransparent()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "unit_bmp_" + Guid.NewGuid().ToString("N")[..8]);
        Directory.CreateDirectory(tempDir);
        try
        {
            var bmpPath = Path.Combine(tempDir, "test_icon.bmp");
            var pngPath = Path.Combine(tempDir, "test_icon.png");

            using (var bmp = new Image<Rgba32>(4, 4))
            {
                bmp[0, 0] = new Rgba32(255, 0, 255, 255); // Magic Pink
                bmp[1, 0] = new Rgba32(10, 20, 30, 255);  // Opaque pixel
                bmp.SaveAsBmp(bmpPath);
            }

            AssetMigrationService.ConvertBmpToTransparentPng(bmpPath, pngPath, new Rgba32(255, 0, 255, 255));

            Assert.True(File.Exists(pngPath));
            using var outPng = Image.Load<Rgba32>(pngPath);
            Assert.Equal(0, outPng[0, 0].A);
            Assert.Equal(255, outPng[1, 0].A);
            Assert.Equal(10, outPng[1, 0].R);
        }
        finally
        {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void LogicMigrationService_TranslatesFunctionBlocksAndValidatesJs()
    {
        var model = CreateSampleModel();
        var svc = new LogicMigrationService();
        var artifacts = svc.GenerateLogicArtifacts(model);

        Assert.Empty(artifacts.ValidationErrors);
        Assert.True(artifacts.CodeModules.ContainsKey("MigratedLogic.js"));
        var js = artifacts.CodeModules["MigratedLogic.js"];
        Assert.Contains("StartPumpFb", js);
        Assert.Contains("this.writeDatapoint(\"Pump1.Cmd\"", js);
    }

    [Fact]
    public void ReportGenerator_WritesHtmlJsonCsvAndExcelReports()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "unit_rpt_" + Guid.NewGuid().ToString("N")[..8]);
        Directory.CreateDirectory(tempDir);
        try
        {
            var model = CreateSampleModel();
            var env = new SoftwareEnvironmentReport
            {
                LasalScreenInstalled = true,
                LasalScreenVersion = "01.01.197",
                VisuDesignerInstalled = true,
                VisuDesignerVersion = "01.04.006.2890"
            };
            var visu = new VisuGenerationResult
            {
                Success = true,
                DashboardCount = 1,
                LvpFilePath = Path.Combine(tempDir, "SampleUnitTest.lvp")
            };
            var val = new ValidationSummaryReport
            {
                Passed = true,
                DefaultViewValid = true,
                AverageVisualSimilarityPercent = 99.5
            };
            val.ScreenComparisons.Add(new ScreenValidationResult
            {
                ScreenName = "MainScreen",
                SourceControlCount = 2,
                TargetControlCount = 2,
                TargetFileExists = true,
                VisualSimilarityPercent = 99.5
            });

            var files = new ConversionReportGenerator().GenerateAllReports(model, env, visu, val, tempDir, TimeSpan.FromSeconds(2.5));

            Assert.True(File.Exists(files.HtmlReportPath));
            Assert.True(File.Exists(files.JsonReportPath));
            Assert.True(File.Exists(files.CsvReportPath));
            Assert.True(File.Exists(files.ExcelReportPath));

            var html = File.ReadAllText(files.HtmlReportPath);
            Assert.Contains("17. Engineering Traceability", html);

            using var wb = new XLWorkbook(files.ExcelReportPath);
            Assert.True(wb.Worksheets.Contains("Summary"));
            Assert.True(wb.Worksheets.Contains("Controls Mapping"));
        }
        finally
        {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    private static HmiIntermediateModel CreateSampleModel()
    {
        return new HmiIntermediateModel
        {
            ProjectMetadata = new ProjectMetadataModel
            {
                ProjectName = "SampleUnitTest",
                SourceLprPath = @"C:\Dummy\LSE.lpr",
                ResolutionWidth = 800,
                ResolutionHeight = 480,
                StartScreenName = "MainScreen"
            },
            Datapoints =
            {
                new DatapointModel { Id = "Pump1.Cmd", SymbolPath = "Pump1.Cmd", ServerName = "Cmd", ObjectName = "Pump1" }
            },
            FunctionBlocks =
            {
                new FunctionBlockModel
                {
                    Id = "StartPumpFb",
                    Name = "StartPumpFb",
                    Steps =
                    {
                        new FunctionBlockStepModel
                        {
                            Opcode = "SetValue",
                            Output1DatapointId = "Pump1.Cmd",
                            Input2Constant = 1
                        }
                    }
                }
            },
            Screens =
            {
                new ScreenModel
                {
                    Id = "MainScreen",
                    Name = "MainScreen",
                    Width = 800,
                    Height = 480,
                    Controls =
                    {
                        new HmiControlModel { Id = "c1", Name = "LblTitle", SourceType = "StaticText", X = 20, Y = 20, Width = 200, Height = 30 },
                        new HmiControlModel { Id = "c2", Name = "BtnStart", SourceType = "PushButton", X = 20, Y = 70, Width = 120, Height = 45, DatapointId = "Pump1.Cmd" }
                    }
                }
            }
        };
    }
}
