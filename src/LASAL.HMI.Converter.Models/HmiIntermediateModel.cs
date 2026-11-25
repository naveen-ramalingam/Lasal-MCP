using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace LASAL.HMI.Converter.Models;

/// <summary>
/// Versioned Intermediate Representation (IR) of a SIGMATEK LASAL SCREEN + CLASS 2 HMI project
/// ready for transformation into a native SIGMATEK LASAL VISUDesigner (.lvp) project.
/// </summary>
public sealed class HmiIntermediateModel
{
    public const string CurrentSchemaVersion = "1.0.0";

    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = CurrentSchemaVersion;

    [JsonPropertyName("extractedAtUtc")]
    public DateTime ExtractedAtUtc { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("projectMetadata")]
    public ProjectMetadataModel ProjectMetadata { get; set; } = new();

    [JsonPropertyName("stations")]
    public List<StationModel> Stations { get; set; } = new();

    [JsonPropertyName("datapoints")]
    public List<DatapointModel> Datapoints { get; set; } = new();

    [JsonPropertyName("languages")]
    public List<LanguageModel> Languages { get; set; } = new();

    [JsonPropertyName("textLists")]
    public List<TextListModel> TextLists { get; set; } = new();

    [JsonPropertyName("colorPalette")]
    public List<ColorPaletteEntryModel> ColorPalette { get; set; } = new();

    [JsonPropertyName("fontStyles")]
    public List<FontStyleModel> FontStyles { get; set; } = new();

    [JsonPropertyName("units")]
    public List<UnitModel> Units { get; set; } = new();

    [JsonPropertyName("assets")]
    public List<AssetModel> Assets { get; set; } = new();

    [JsonPropertyName("schemes")]
    public List<SchemeModel> Schemes { get; set; } = new();

    [JsonPropertyName("alarms")]
    public List<AlarmModel> Alarms { get; set; } = new();

    [JsonPropertyName("menus")]
    public List<MenuModel> Menus { get; set; } = new();

    [JsonPropertyName("functionBlocks")]
    public List<FunctionBlockModel> FunctionBlocks { get; set; } = new();

    [JsonPropertyName("globalScreen")]
    public ScreenModel? GlobalScreen { get; set; }

    [JsonPropertyName("screens")]
    public List<ScreenModel> Screens { get; set; } = new();

    [JsonPropertyName("windows")]
    public List<ScreenModel> Windows { get; set; } = new();

    [JsonPropertyName("reusableObjects")]
    public List<ReusableObjectModel> ReusableObjects { get; set; } = new();

    [JsonPropertyName("customPlcUiClasses")]
    public List<CustomPlcUiClassModel> CustomPlcUiClasses { get; set; } = new();

    [JsonPropertyName("diagnostics")]
    public List<ExtractionDiagnosticModel> Diagnostics { get; set; } = new();
}

public sealed class ProjectMetadataModel
{
    [JsonPropertyName("projectName")]
    public string ProjectName { get; set; } = string.Empty;

    [JsonPropertyName("sourceLprPath")]
    public string SourceLprPath { get; set; } = string.Empty;

    [JsonPropertyName("sourceClass2ProjectPath")]
    public string? SourceClass2ProjectPath { get; set; }

    [JsonPropertyName("lseCompilerVersion")]
    public int LseCompilerVersion { get; set; } = 60;

    [JsonPropertyName("detectedLseSoftwareVersion")]
    public string DetectedLseSoftwareVersion { get; set; } = "01.01.197";

    [JsonPropertyName("detectedVisuDesignerVersion")]
    public string DetectedVisuDesignerVersion { get; set; } = "01.04.006.2890";

    [JsonPropertyName("resolutionWidth")]
    public int ResolutionWidth { get; set; } = 800;

    [JsonPropertyName("resolutionHeight")]
    public int ResolutionHeight { get; set; } = 480;

    [JsonPropertyName("startScreenNumber")]
    public int StartScreenNumber { get; set; } = 0;

    [JsonPropertyName("startScreenName")]
    public string StartScreenName { get; set; } = string.Empty;

    [JsonPropertyName("globalScreenName")]
    public string? GlobalScreenName { get; set; }

    [JsonPropertyName("sourceFileChecksums")]
    public Dictionary<string, string> SourceFileChecksums { get; set; } = new();
}

public sealed class StationModel
{
    [JsonPropertyName("stationNumber")]
    public int StationNumber { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = "PLC_Station";

    [JsonPropertyName("stationType")]
    public string StationType { get; set; } = "LARS";

    [JsonPropertyName("address")]
    public string Address { get; set; } = "127.0.0.1:1954";

    [JsonPropertyName("plcProjectPath")]
    public string? PlcProjectPath { get; set; }
}

public sealed class DatapointModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("varNo")]
    public int VarNo { get; set; }

    [JsonPropertyName("symbolPath")]
    public string SymbolPath { get; set; } = string.Empty;

    [JsonPropertyName("className")]
    public string ClassName { get; set; } = string.Empty;

    [JsonPropertyName("objectName")]
    public string ObjectName { get; set; } = string.Empty;

    [JsonPropertyName("serverName")]
    public string ServerName { get; set; } = string.Empty;

    [JsonPropertyName("stationNumber")]
    public int StationNumber { get; set; }

    [JsonPropertyName("stationName")]
    public string StationName { get; set; } = "PLC_Station";

    [JsonPropertyName("lseVarType")]
    public string LseVarType { get; set; } = "BINARY";

    [JsonPropertyName("plcDataType")]
    public string PlcDataType { get; set; } = "DINT";

    [JsonPropertyName("visuDataType")]
    public string VisuDataType { get; set; } = "INT";

    [JsonPropertyName("refreshTimeMs")]
    public int RefreshTimeMs { get; set; } = 250;

    [JsonPropertyName("writeProtected")]
    public bool WriteProtected { get; set; }

    [JsonPropertyName("accessLevel")]
    public int AccessLevel { get; set; }

    [JsonPropertyName("minLimit")]
    public double? MinLimit { get; set; }

    [JsonPropertyName("maxLimit")]
    public double? MaxLimit { get; set; }

    [JsonPropertyName("minLimitDatapointId")]
    public string? MinLimitDatapointId { get; set; }

    [JsonPropertyName("maxLimitDatapointId")]
    public string? MaxLimitDatapointId { get; set; }

    [JsonPropertyName("unitId")]
    public string? UnitId { get; set; }

    [JsonPropertyName("unitSchemeId")]
    public string? UnitSchemeId { get; set; }

    [JsonPropertyName("initialValue")]
    public string? InitialValue { get; set; }

    [JsonPropertyName("crc32")]
    public uint Crc32 { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

public sealed class LanguageModel
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("lcid")]
    public int Lcid { get; set; }

    [JsonPropertyName("bcp47Code")]
    public string Bcp47Code { get; set; } = "en-US";

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = "English";

    [JsonPropertyName("winName")]
    public string WinName { get; set; } = "English (United States)";

    [JsonPropertyName("flagImageName")]
    public string? FlagImageName { get; set; }
}

public sealed class TextListModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("entries")]
    public List<TextEntryModel> Entries { get; set; } = new();
}

public sealed class TextEntryModel
{
    [JsonPropertyName("entryId")]
    public string EntryId { get; set; } = string.Empty;

    [JsonPropertyName("numericIndex")]
    public int NumericIndex { get; set; }

    [JsonPropertyName("translations")]
    public Dictionary<string, string> Translations { get; set; } = new();

    [JsonPropertyName("containerWidth")]
    public int? ContainerWidth { get; set; }

    [JsonPropertyName("containerHeight")]
    public int? ContainerHeight { get; set; }

    [JsonPropertyName("fontSchemeKey")]
    public string? FontSchemeKey { get; set; }
}

public sealed class ColorPaletteEntryModel
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("rgb565")]
    public ushort Rgb565 { get; set; }

    [JsonPropertyName("cssHex")]
    public string CssHex { get; set; } = "#000000";

    [JsonPropertyName("isTransparent")]
    public bool IsTransparent { get; set; }
}

public sealed class FontStyleModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("familyName")]
    public string FamilyName { get; set; } = "Arial";

    [JsonPropertyName("sizePx")]
    public int SizePx { get; set; } = 14;

    [JsonPropertyName("bold")]
    public bool Bold { get; set; }

    [JsonPropertyName("italic")]
    public bool Italic { get; set; }

    [JsonPropertyName("underline")]
    public bool Underline { get; set; }
}

public sealed class UnitModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = string.Empty;

    [JsonPropertyName("formulaNumber")]
    public int FormulaNumber { get; set; }

    [JsonPropertyName("scaleFactor")]
    public double ScaleFactor { get; set; } = 1.0;

    [JsonPropertyName("offset")]
    public double Offset { get; set; } = 0.0;

    [JsonPropertyName("decimalPlaces")]
    public int DecimalPlaces { get; set; }
}

public sealed class AssetModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("originalFileName")]
    public string OriginalFileName { get; set; } = string.Empty;

    [JsonPropertyName("originalRelativePath")]
    public string OriginalRelativePath { get; set; } = string.Empty;

    [JsonPropertyName("targetFileName")]
    public string TargetFileName { get; set; } = string.Empty;

    [JsonPropertyName("format")]
    public string Format { get; set; } = "PNG";

    [JsonPropertyName("width")]
    public int Width { get; set; }

    [JsonPropertyName("height")]
    public int Height { get; set; }

    [JsonPropertyName("hasTransparencyKey")]
    public bool HasTransparencyKey { get; set; }

    [JsonPropertyName("transparencyKeyCssHex")]
    public string? TransparencyKeyCssHex { get; set; }

    [JsonPropertyName("mpcImageIndex")]
    public int? MpcImageIndex { get; set; }

    [JsonPropertyName("mpcTransparentRgb565")]
    public ushort? MpcTransparentRgb565 { get; set; }

    [JsonPropertyName("mpcStateFlags")]
    public ushort? MpcStateFlags { get; set; }

    [JsonPropertyName("conversionMode")]
    public string ConversionMode { get; set; } = "PNG";
}

public sealed class SchemeModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Image, Text, Color, Font, Object, Unit, Server (Value).
    /// </summary>
    [JsonPropertyName("schemeType")]
    public string SchemeType { get; set; } = "Image";

    [JsonPropertyName("defaultValue")]
    public string DefaultValue { get; set; } = string.Empty;

    [JsonPropertyName("entries")]
    public List<SchemeEntryModel> Entries { get; set; } = new();
}

public sealed class SchemeEntryModel
{
    [JsonPropertyName("operator")]
    public string Operator { get; set; } = "==";

    [JsonPropertyName("compareValue")]
    public double CompareValue { get; set; }

    [JsonPropertyName("compareDatapointId")]
    public string? CompareDatapointId { get; set; }

    [JsonPropertyName("resultValue")]
    public string ResultValue { get; set; } = string.Empty;

    [JsonPropertyName("secondaryColorHex")]
    public string? SecondaryColorHex { get; set; }
}

public sealed class AlarmModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("alarmNumber")]
    public int AlarmNumber { get; set; }

    [JsonPropertyName("group")]
    public int Group { get; set; }

    [JsonPropertyName("severity")]
    public string Severity { get; set; } = "Error";

    [JsonPropertyName("datapointId")]
    public string DatapointId { get; set; } = string.Empty;

    [JsonPropertyName("textListId")]
    public string TextListId { get; set; } = "AlarmText";

    [JsonPropertyName("textEntryId")]
    public string TextEntryId { get; set; } = "0";

    [JsonPropertyName("parameterDatapointIds")]
    public List<string> ParameterDatapointIds { get; set; } = new();

    [JsonPropertyName("requiresConfirmation")]
    public bool RequiresConfirmation { get; set; } = true;

    [JsonPropertyName("activeTextColorHex")]
    public string ActiveTextColorHex { get; set; } = "#FFFFFF";

    [JsonPropertyName("activeBackgroundColorHex")]
    public string ActiveBackgroundColorHex { get; set; } = "#CC0000";
}

public sealed class MenuModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("items")]
    public List<MenuItemModel> Items { get; set; } = new();
}

public sealed class MenuItemModel
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("textListId")]
    public string TextListId { get; set; } = string.Empty;

    [JsonPropertyName("textEntryId")]
    public string TextEntryId { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public int Value { get; set; }

    [JsonPropertyName("targetScreenNumber")]
    public int? TargetScreenNumber { get; set; }
}

public sealed class FunctionBlockModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("steps")]
    public List<FunctionBlockStepModel> Steps { get; set; } = new();
}

public sealed class FunctionBlockStepModel
{
    [JsonPropertyName("opcode")]
    public string Opcode { get; set; } = "LseMirr";

    [JsonPropertyName("input1DatapointId")]
    public string? Input1DatapointId { get; set; }

    [JsonPropertyName("input1Constant")]
    public double? Input1Constant { get; set; }

    [JsonPropertyName("input2DatapointId")]
    public string? Input2DatapointId { get; set; }

    [JsonPropertyName("input2Constant")]
    public double? Input2Constant { get; set; }

    [JsonPropertyName("output1DatapointId")]
    public string? Output1DatapointId { get; set; }

    [JsonPropertyName("output2DatapointId")]
    public string? Output2DatapointId { get; set; }

    [JsonPropertyName("commandCode")]
    public string? CommandCode { get; set; }

    [JsonPropertyName("commandArg")]
    public int? CommandArg { get; set; }
}

public sealed class ScreenModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("screenNumber")]
    public int ScreenNumber { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("isWindow")]
    public bool IsWindow { get; set; }

    [JsonPropertyName("isGlobalScreen")]
    public bool IsGlobalScreen { get; set; }

    [JsonPropertyName("sourceFileName")]
    public string SourceFileName { get; set; } = string.Empty;

    [JsonPropertyName("mpcFileName")]
    public string? MpcFileName { get; set; }

    [JsonPropertyName("width")]
    public int Width { get; set; } = 800;

    [JsonPropertyName("height")]
    public int Height { get; set; } = 480;

    [JsonPropertyName("backgroundColorHex")]
    public string BackgroundColorHex { get; set; } = "#D4D0C8";

    [JsonPropertyName("defaultTextListName")]
    public string? DefaultTextListName { get; set; }

    [JsonPropertyName("includeGlobalScreen")]
    public bool IncludeGlobalScreen { get; set; } = true;

    [JsonPropertyName("controls")]
    public List<HmiControlModel> Controls { get; set; } = new();
}

public sealed class ReusableObjectModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("sourceFileName")]
    public string SourceFileName { get; set; } = string.Empty;

    [JsonPropertyName("width")]
    public int Width { get; set; } = 200;

    [JsonPropertyName("height")]
    public int Height { get; set; } = 100;

    [JsonPropertyName("defaultTextListName")]
    public string? DefaultTextListName { get; set; }

    [JsonPropertyName("controls")]
    public List<HmiControlModel> Controls { get; set; } = new();
}

public sealed class HmiControlModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Source LASAL SCREEN control type:
    /// StaticText, DynamicText, NumericDisplay, NumericInput, StringDisplay, StringInput,
    /// PushButton, ToggleButton, RadioButton, Checkbox, Bar, Slider, Gauge,
    /// StaticImage, DynamicImage, Rectangle, Circle, Line, Polygon,
    /// Enumeration, DateDisplay, TimeDisplay, AlarmDisplay, TrendChart,
    /// ScrollArea, Carousel, ObjectInstance, UdcInstance, PdfViewer, CustomMyIo.
    /// </summary>
    [JsonPropertyName("sourceType")]
    public string SourceType { get; set; } = "StaticText";

    /// <summary>
    /// Target VISUDesigner control ID (e.g., sigmatek.label.simple, sigmatek.button.PushButton).
    /// </summary>
    [JsonPropertyName("targetVisuType")]
    public string? TargetVisuType { get; set; }

    [JsonPropertyName("x")]
    public int X { get; set; }

    [JsonPropertyName("y")]
    public int Y { get; set; }

    [JsonPropertyName("width")]
    public int Width { get; set; } = 100;

    [JsonPropertyName("height")]
    public int Height { get; set; } = 30;

    [JsonPropertyName("zIndex")]
    public int ZIndex { get; set; }

    [JsonPropertyName("visible")]
    public bool Visible { get; set; } = true;

    [JsonPropertyName("writeProtected")]
    public bool WriteProtected { get; set; } = true;

    [JsonPropertyName("accessLevel")]
    public int AccessLevel { get; set; }

    [JsonPropertyName("foregroundColorHex")]
    public string ForegroundColorHex { get; set; } = "#000000";

    [JsonPropertyName("backgroundColorHex")]
    public string BackgroundColorHex { get; set; } = "#E0E0E0";

    [JsonPropertyName("pressedColorHex")]
    public string? PressedColorHex { get; set; }

    [JsonPropertyName("borderColorHex")]
    public string BorderColorHex { get; set; } = "#808080";

    [JsonPropertyName("borderWidth")]
    public int BorderWidth { get; set; } = 1;

    [JsonPropertyName("frameType")]
    public string FrameType { get; set; } = "Standard";

    [JsonPropertyName("transparentBackground")]
    public bool TransparentBackground { get; set; }

    [JsonPropertyName("fontStyleId")]
    public string? FontStyleId { get; set; }

    [JsonPropertyName("horizontalAlignment")]
    public string HorizontalAlignment { get; set; } = "Center";

    [JsonPropertyName("verticalAlignment")]
    public string VerticalAlignment { get; set; } = "Middle";

    [JsonPropertyName("textListId")]
    public string? TextListId { get; set; }

    [JsonPropertyName("textEntryId")]
    public string? TextEntryId { get; set; }

    [JsonPropertyName("pressedTextListId")]
    public string? PressedTextListId { get; set; }

    [JsonPropertyName("pressedTextEntryId")]
    public string? PressedTextEntryId { get; set; }

    [JsonPropertyName("staticTextFallback")]
    public string? StaticTextFallback { get; set; }

    [JsonPropertyName("datapointId")]
    public string? DatapointId { get; set; }

    [JsonPropertyName("disableDatapointId")]
    public string? DisableDatapointId { get; set; }

    [JsonPropertyName("imageAssetId")]
    public string? ImageAssetId { get; set; }

    [JsonPropertyName("pressedImageAssetId")]
    public string? PressedImageAssetId { get; set; }

    [JsonPropertyName("imageSchemeId")]
    public string? ImageSchemeId { get; set; }

    [JsonPropertyName("textSchemeId")]
    public string? TextSchemeId { get; set; }

    [JsonPropertyName("colorSchemeId")]
    public string? ColorSchemeId { get; set; }

    [JsonPropertyName("serverSchemeId")]
    public string? ServerSchemeId { get; set; }

    [JsonPropertyName("objectSchemeId")]
    public string? ObjectSchemeId { get; set; }

    [JsonPropertyName("unitId")]
    public string? UnitId { get; set; }

    [JsonPropertyName("decimalPlaces")]
    public int DecimalPlaces { get; set; }

    [JsonPropertyName("minLimit")]
    public double? MinLimit { get; set; }

    [JsonPropertyName("maxLimit")]
    public double? MaxLimit { get; set; }

    [JsonPropertyName("setVal")]
    public int SetVal { get; set; } = 1;

    [JsonPropertyName("resetVal")]
    public int ResetVal { get; set; } = 0;

    [JsonPropertyName("orientation")]
    public string Orientation { get; set; } = "Vertical";

    [JsonPropertyName("referencedObjectName")]
    public string? ReferencedObjectName { get; set; }

    [JsonPropertyName("overloadDatapointPrefix")]
    public string? OverloadDatapointPrefix { get; set; }

    [JsonPropertyName("virtualObjectName")]
    public string? VirtualObjectName { get; set; }

    [JsonPropertyName("udcTypeName")]
    public string? UdcTypeName { get; set; }

    [JsonPropertyName("udcDatapointIds")]
    public List<string> UdcDatapointIds { get; set; } = new();

    [JsonPropertyName("udcColorsHex")]
    public List<string> UdcColorsHex { get; set; } = new();

    [JsonPropertyName("polygonPoints")]
    public List<Point2DModel> PolygonPoints { get; set; } = new();

    [JsonPropertyName("events")]
    public List<HmiEventModel> Events { get; set; } = new();

    [JsonPropertyName("customProperties")]
    public Dictionary<string, string> CustomProperties { get; set; } = new();
}

public sealed class Point2DModel
{
    [JsonPropertyName("x")]
    public int X { get; set; }

    [JsonPropertyName("y")]
    public int Y { get; set; }
}

public sealed class HmiEventModel
{
    /// <summary>
    /// Trigger: OnPress, OnRelease, OnClick, OnValueChange, OnScreenOpen, OnScreenClose, OnKeyPress.
    /// </summary>
    [JsonPropertyName("trigger")]
    public string Trigger { get; set; } = "OnClick";

    /// <summary>
    /// ActionType: NavigateScreen, OpenWindow, CloseWindow, ReturnScreen, SwitchLanguage,
    /// WriteDatapoint, ToggleDatapoint, ExecuteFunctionBlock, CustomScript.
    /// </summary>
    [JsonPropertyName("actionType")]
    public string ActionType { get; set; } = "WriteDatapoint";

    [JsonPropertyName("targetScreenNumber")]
    public int? TargetScreenNumber { get; set; }

    [JsonPropertyName("targetScreenName")]
    public string? TargetScreenName { get; set; }

    [JsonPropertyName("targetDatapointId")]
    public string? TargetDatapointId { get; set; }

    [JsonPropertyName("writeValue")]
    public double? WriteValue { get; set; }

    [JsonPropertyName("functionBlockId")]
    public string? FunctionBlockId { get; set; }

    [JsonPropertyName("hotkeyScanCode")]
    public int? HotkeyScanCode { get; set; }
}

public sealed class CustomPlcUiClassModel
{
    [JsonPropertyName("className")]
    public string ClassName { get; set; } = string.Empty;

    [JsonPropertyName("baseClassName")]
    public string BaseClassName { get; set; } = "_MyIO";

    [JsonPropertyName("objectInstanceNames")]
    public List<string> ObjectInstanceNames { get; set; } = new();

    [JsonPropertyName("sourceFilePath")]
    public string SourceFilePath { get; set; } = string.Empty;

    [JsonPropertyName("overriddenMethods")]
    public List<string> OverriddenMethods { get; set; } = new();

    [JsonPropertyName("inferredPattern")]
    public string InferredPattern { get; set; } = "CustomDrawing";

    [JsonPropertyName("extractedStructuredTextCode")]
    public string ExtractedStructuredTextCode { get; set; } = string.Empty;
}

public sealed class ExtractionDiagnosticModel
{
    [JsonPropertyName("severity")]
    public string Severity { get; set; } = "Info";

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("sourceLocation")]
    public string SourceLocation { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("remediation")]
    public string? Remediation { get; set; }
}
