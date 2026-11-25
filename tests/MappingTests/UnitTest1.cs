using System;
using System.IO;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using Xunit;

namespace LASAL.HMI.Converter.MappingTests;

public class MappingTests
{
    [Theory]
    [InlineData("StaticText", "sig-control-text")]
    [InlineData("DynamicText", "sig-control-text")]
    [InlineData("NumericDisplay", "sig-control-output")]
    [InlineData("NumericInput", "sig-control-numeric-input")]
    [InlineData("StringDisplay", "sig-control-output")]
    [InlineData("StringInput", "sig-control-input")]
    [InlineData("PushButton", "sig-control-button")]
    [InlineData("ToggleButton", "sig-control-toggle-button")]
    [InlineData("ToggleSwitch", "sig-control-switch-button2")]
    [InlineData("RadioButton", "sig-control-radio-button")]
    [InlineData("Checkbox", "sig-control-checkbox")]
    [InlineData("Bar", "sig-control-bar-straight")]
    [InlineData("Slider", "sig-control-slider")]
    [InlineData("Gauge", "sig-control-gauge2")]
    [InlineData("StaticImage", "sig-control-image")]
    [InlineData("SvgImage", "sig-control-svg-container")]
    [InlineData("DynamicImage", "sig-control-image")]
    [InlineData("MotionGraphic", "sig-composite-container")]
    [InlineData("Rectangle", "sig-control-rectangle")]
    [InlineData("Circle", "sig-control-ellipse")]
    [InlineData("Line", "sig-control-line-simple")]
    [InlineData("Polygon", "sig-control-svg-container")]
    [InlineData("Enumeration", "sig-control-enum")]
    [InlineData("AlarmDisplay", "sig-control-alarmlist2")]
    [InlineData("TrendChart", "sig-control-trend")]
    [InlineData("ScrollArea", "sig-control-listview")]
    [InlineData("Carousel", "sig-control-carousel")]
    [InlineData("ObjectInstance", "sig-composite-container")]
    [InlineData("PdfViewer", "sig-control-mediacontainer")]
    public void MappingRegistry_ResolvesAllStandardLseTypesToNativeVisuControls(string sourceType, string expectedVisuId)
    {
        var registry = new ObjectMappingRegistry();
        var rule = registry.ResolveRule(new HmiControlModel { SourceType = sourceType });
        Assert.Equal(expectedVisuId, rule.TargetVisuControlId);
    }

    [Fact]
    public void MappingRegistry_RefinesCustomMyIoByInferredPattern()
    {
        var registry = new ObjectMappingRegistry();
        var customClasses = new[]
        {
            new CustomPlcUiClassModel
            {
                ClassName = "MyColorBar",
                BaseClassName = "_MyIO",
                InferredPattern = "ColorBarUdc"
            }
        };
        var ctrl = new HmiControlModel
        {
            SourceType = "CustomMyIo",
            VirtualObjectName = "MyColorBar"
        };

        var rule = registry.ResolveRule(ctrl, customClasses);
        Assert.Equal("sig-control-bar-straight", rule.TargetVisuControlId);
    }

    [Fact]
    public void LayoutScaler_ScalesCoordinatesAndFontsProportionally()
    {
        var model = new HmiIntermediateModel
        {
            ProjectMetadata = new ProjectMetadataModel { ProjectName = "ScaleTest", ResolutionWidth = 800, ResolutionHeight = 480 },
            FontStyles = { new FontStyleModel { Id = "F1", SizePx = 16 } },
            Screens =
            {
                new ScreenModel
                {
                    Name = "Scr1",
                    Width = 800,
                    Height = 480,
                    Controls = { new HmiControlModel { Name = "Btn1", X = 100, Y = 120, Width = 200, Height = 60 } }
                }
            }
        };

        LayoutScaler.ScaleModelResolution(model, 1600, 960, preserveAspectRatio: false);

        Assert.Equal(1600, model.ProjectMetadata.ResolutionWidth);
        Assert.Equal(960, model.ProjectMetadata.ResolutionHeight);
        Assert.Equal(32, model.FontStyles[0].SizePx);
        var ctrl = model.Screens[0].Controls[0];
        Assert.Equal(200, ctrl.X);
        Assert.Equal(240, ctrl.Y);
        Assert.Equal(400, ctrl.Width);
        Assert.Equal(120, ctrl.Height);
    }

    [Fact]
    public void MappingRegistry_CanSaveAndReloadCustomRules()
    {
        var file = Path.Combine(Path.GetTempPath(), $"rules_{Guid.NewGuid():N}.json");
        try
        {
            var registry = new ObjectMappingRegistry();
            registry.AddRule(new ControlMappingRule("PushButton", "sig-control-image-button", "Buttons", MappingSupportLevel.Full, "Custom override"));
            registry.SaveRulesToFile(file);

            var reloaded = new ObjectMappingRegistry();
            reloaded.LoadRulesFromFile(file);
            var resolved = reloaded.ResolveRule(new HmiControlModel { SourceType = "PushButton" });
            Assert.Equal("sig-control-image-button", resolved.TargetVisuControlId);
        }
        finally
        {
            if (File.Exists(file)) File.Delete(file);
        }
    }
}
