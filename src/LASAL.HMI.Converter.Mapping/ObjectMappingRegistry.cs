using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using LASAL.HMI.Converter.Models;

namespace LASAL.HMI.Converter.Mapping;

/// <summary>
/// Configurable mapping registry translating all LASAL SCREEN element types and custom UDC/_MyIO patterns
/// into native SIGMATEK LASAL VISUDesigner (v01.04.006) controls (sig-control-* / sig-composite-container).
/// Supports user customization, JSON export/import of mapping templates, and per-control diagnostics.
/// </summary>
public sealed class ObjectMappingRegistry
{
    private readonly Dictionary<string, ControlMappingRule> _rules = new(StringComparer.OrdinalIgnoreCase);

    public IReadOnlyCollection<ControlMappingRule> Rules => _rules.Values;

    public ObjectMappingRegistry()
    {
        RegisterDefaultRules();
    }

    public void RegisterDefaultRules()
    {
        _rules.Clear();

        AddRule(new ControlMappingRule(
            SourceType: "StaticText",
            TargetVisuControlId: "sig-control-text",
            Category: "Text & Labels",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Static text label bound to a localized TextList entry or literal string (sig-control-text)."));

        AddRule(new ControlMappingRule(
            SourceType: "DynamicText",
            TargetVisuControlId: "sig-control-text",
            Category: "Text & Labels",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Dynamic text label switching localized entries via a TextScheme and PLC Datapoint."));

        AddRule(new ControlMappingRule(
            SourceType: "NumericDisplay",
            TargetVisuControlId: "sig-control-output",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Read-only numeric value display with engineering unit and format (sig-control-output)."));

        AddRule(new ControlMappingRule(
            SourceType: "NumericInput",
            TargetVisuControlId: "sig-control-numeric-input",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Editable numeric input field with min/max limit validation, unit, keyboard, and access level."));

        AddRule(new ControlMappingRule(
            SourceType: "StringDisplay",
            TargetVisuControlId: "sig-control-output",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Read-only ASCII/Unicode string display bound to a String/StringRAM server."));

        AddRule(new ControlMappingRule(
            SourceType: "StringInput",
            TargetVisuControlId: "sig-control-input",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Editable ASCII/Unicode string input bound to a String/StringRAM server."));

        AddRule(new ControlMappingRule(
            SourceType: "PushButton",
            TargetVisuControlId: "sig-control-button",
            Category: "Buttons & Switches",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Momentary push button, screen/window navigation button, or FunctionBlock trigger."));

        AddRule(new ControlMappingRule(
            SourceType: "ToggleButton",
            TargetVisuControlId: "sig-control-toggle-button",
            Category: "Buttons & Switches",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Latching toggle button switching bound datapoint between OFF and ON values."));

        AddRule(new ControlMappingRule(
            SourceType: "ToggleSwitch",
            TargetVisuControlId: "sig-control-switch-button2",
            Category: "Buttons & Switches",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Two-state industrial rocker/slide toggle switch."));

        AddRule(new ControlMappingRule(
            SourceType: "RadioButton",
            TargetVisuControlId: "sig-control-radio-button",
            Category: "Buttons & Switches",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Radio selector button writing its constant SetVal to a shared selector datapoint."));

        AddRule(new ControlMappingRule(
            SourceType: "Checkbox",
            TargetVisuControlId: "sig-control-checkbox",
            Category: "Buttons & Switches",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Boolean checkbox control bound to a 0/1 datapoint."));

        AddRule(new ControlMappingRule(
            SourceType: "Bar",
            TargetVisuControlId: "sig-control-bar-straight",
            Category: "Indicators & Gauges",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Level indicator bar with min/max range, color limits, and fill color (sig-control-bar-straight)."));

        AddRule(new ControlMappingRule(
            SourceType: "ProgressBar",
            TargetVisuControlId: "sig-control-progress-bar-basic",
            Category: "Indicators & Gauges",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Horizontal progress bar indicator with value/unit overlay."));

        AddRule(new ControlMappingRule(
            SourceType: "Slider",
            TargetVisuControlId: "sig-control-slider",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Interactive touch slider writing analog value to bound datapoint."));

        AddRule(new ControlMappingRule(
            SourceType: "Gauge",
            TargetVisuControlId: "sig-control-gauge2",
            Category: "Indicators & Gauges",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Radial analog gauge indicator (sig-control-gauge2)."));

        AddRule(new ControlMappingRule(
            SourceType: "StaticImage",
            TargetVisuControlId: "sig-control-image",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Static PNG/JPG/BMP graphic converted from LASAL Image Pool."));

        AddRule(new ControlMappingRule(
            SourceType: "SvgImage",
            TargetVisuControlId: "sig-control-svg-container",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Scalable Vector Graphic (SVG) control."));

        AddRule(new ControlMappingRule(
            SourceType: "DynamicImage",
            TargetVisuControlId: "sig-control-image",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Dynamic multi-state graphic driven by a MediaScheme and PLC datapoint."));

        AddRule(new ControlMappingRule(
            SourceType: "MotionGraphic",
            TargetVisuControlId: "sig-composite-container",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Dynamic X/Y position animated graphic via sig-composite-container dpLeft/dpTop."));

        AddRule(new ControlMappingRule(
            SourceType: "Rectangle",
            TargetVisuControlId: "sig-control-rectangle",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Rectangular panel, background frame, or bevel box."));

        AddRule(new ControlMappingRule(
            SourceType: "Circle",
            TargetVisuControlId: "sig-control-ellipse",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Circular/elliptical shape or status LED lamp (sig-control-ellipse)."));

        AddRule(new ControlMappingRule(
            SourceType: "Line",
            TargetVisuControlId: "sig-control-line-simple",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Two-point vector line separator or connector."));

        AddRule(new ControlMappingRule(
            SourceType: "Polygon",
            TargetVisuControlId: "sig-control-svg-container",
            Category: "Graphics & Shapes",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Multi-vertex polygon/polyline rendered via SVG vector path inside sig-control-svg-container."));

        AddRule(new ControlMappingRule(
            SourceType: "Enumeration",
            TargetVisuControlId: "sig-control-enum",
            Category: "Inputs & Outputs",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Dropdown enum/menu selector (sig-control-enum / sig-control-menu-input)."));

        AddRule(new ControlMappingRule(
            SourceType: "DateDisplay",
            TargetVisuControlId: "sig-control-output",
            Category: "System & Diagnostics",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Date display with DD.MM.YYYY format bound to DATE_LSE server."));

        AddRule(new ControlMappingRule(
            SourceType: "TimeDisplay",
            TargetVisuControlId: "sig-control-output",
            Category: "System & Diagnostics",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Time display with hh:mm:ss format bound to TIME_LSE server."));

        AddRule(new ControlMappingRule(
            SourceType: "AlarmDisplay",
            TargetVisuControlId: "sig-control-alarmlist2",
            Category: "System & Diagnostics",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Active/historical alarm table (sig-control-alarmlist2)."));

        AddRule(new ControlMappingRule(
            SourceType: "TrendChart",
            TargetVisuControlId: "sig-control-trend",
            Category: "Charts & Lists",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Real-time trend chart (sig-control-trend)."));

        AddRule(new ControlMappingRule(
            SourceType: "ScrollArea",
            TargetVisuControlId: "sig-control-listview",
            Category: "Charts & Lists",
            SupportLevel: MappingSupportLevel.Partial,
            Description: "Scrollable list/table (sig-control-listview). Geometry migrated; custom ST Line() drawing flagged for review."));

        AddRule(new ControlMappingRule(
            SourceType: "Carousel",
            TargetVisuControlId: "sig-control-carousel",
            Category: "Containers & Templates",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Swipeable carousel container hosting overloaded ControlTemplates (sig-control-carousel)."));

        AddRule(new ControlMappingRule(
            SourceType: "ObjectInstance",
            TargetVisuControlId: "sig-composite-container",
            Category: "Containers & Templates",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Placed reusable ControlTemplate (.lse) with overloaded instance datapoints (sig-composite-container)."));

        AddRule(new ControlMappingRule(
            SourceType: "UdcInstance",
            TargetVisuControlId: "sig-control-bar-straight",
            Category: "Containers & Templates",
            SupportLevel: MappingSupportLevel.Full,
            Description: "User Defined Component (UDC / AS_THEURGE) mapped with parameterized datasources and colors."));

        AddRule(new ControlMappingRule(
            SourceType: "PdfViewer",
            TargetVisuControlId: "sig-control-mediacontainer",
            Category: "System & Diagnostics",
            SupportLevel: MappingSupportLevel.Full,
            Description: "Embedded media/PDF viewer container (sig-control-mediacontainer)."));

        AddRule(new ControlMappingRule(
            SourceType: "CustomMyIo",
            TargetVisuControlId: "sig-control-rectangle",
            Category: "Containers & Templates",
            SupportLevel: MappingSupportLevel.Partial,
            Description: "Custom PLC _MyIO freehand pixel widget. Bounding box and JS stub generated; custom ST Draw() flagged for review."));
    }

    public void AddRule(ControlMappingRule rule)
    {
        ArgumentNullException.ThrowIfNull(rule);
        _rules[rule.SourceType] = rule;
    }

    public ControlMappingRule ResolveRule(HmiControlModel control, IReadOnlyList<CustomPlcUiClassModel>? customClasses = null)
    {
        ArgumentNullException.ThrowIfNull(control);

        if (!string.IsNullOrWhiteSpace(control.VirtualObjectName) && customClasses != null)
        {
            var matchedClass = customClasses.FirstOrDefault(c =>
                string.Equals(c.ClassName, control.VirtualObjectName, StringComparison.OrdinalIgnoreCase) ||
                c.ObjectInstanceNames.Contains(control.VirtualObjectName, StringComparer.OrdinalIgnoreCase));

            if (matchedClass != null)
            {
                switch (matchedClass.InferredPattern)
                {
                    case "ColorBarUdc":
                        return _rules["Bar"];
                    case "AnalogGauge":
                        return _rules["Gauge"];
                    case "ScrollTable":
                    case "DragDropScrollList":
                        return _rules["ScrollArea"];
                    case "DynamicCarousel":
                        return _rules["Carousel"];
                    case "ImageSchemeAnimator":
                        return _rules["DynamicImage"];
                }
            }
        }

        if (_rules.TryGetValue(control.SourceType, out var rule))
        {
            return rule;
        }

        return _rules["StaticText"];
    }

    public void ApplyMappingsToModel(HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (model.GlobalScreen != null)
        {
            ApplyToControls(model.GlobalScreen.Controls, model.CustomPlcUiClasses);
        }

        foreach (var screen in model.Screens)
        {
            ApplyToControls(screen.Controls, model.CustomPlcUiClasses);
        }

        foreach (var win in model.Windows)
        {
            ApplyToControls(win.Controls, model.CustomPlcUiClasses);
        }

        foreach (var obj in model.ReusableObjects)
        {
            ApplyToControls(obj.Controls, model.CustomPlcUiClasses);
        }
    }

    private void ApplyToControls(List<HmiControlModel> controls, List<CustomPlcUiClassModel> customClasses)
    {
        foreach (var ctrl in controls)
        {
            if (string.IsNullOrWhiteSpace(ctrl.TargetVisuType) || ctrl.TargetVisuType.Contains('.'))
            {
                var rule = ResolveRule(ctrl, customClasses);
                ctrl.TargetVisuType = rule.TargetVisuControlId;
            }
        }
    }

    public void SaveRulesToFile(string filePath)
    {
        var list = _rules.Values.OrderBy(r => r.SourceType, StringComparer.OrdinalIgnoreCase).ToList();
        var json = JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(filePath, json);
    }

    public void LoadRulesFromFile(string filePath)
    {
        var json = File.ReadAllText(filePath);
        var list = JsonSerializer.Deserialize<List<ControlMappingRule>>(json);
        if (list != null)
        {
            foreach (var r in list)
            {
                _rules[r.SourceType] = r;
            }
        }
    }
}

public enum MappingSupportLevel
{
    Full,
    Partial,
    Unsupported
}

public sealed record ControlMappingRule(
    [property: JsonPropertyName("sourceType")] string SourceType,
    [property: JsonPropertyName("targetVisuControlId")] string TargetVisuControlId,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("supportLevel")] MappingSupportLevel SupportLevel,
    [property: JsonPropertyName("description")] string Description);
