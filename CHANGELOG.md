# Changelog — LASAL HMI Converter

## [1.0.0] — 2026-11-16

### Added
- **Complete Solution Architecture (`LASAL.HMI.Converter.sln`)**:
  - 13 core library & application projects (`Models`, `Infrastructure`, `ComBridge`, `Source.LASALScreen`, `Class2`, `Assets`, `Mapping`, `Logic`, `PythonBridge`, `Target.VISUDesigner`, `Validation`, `Reporting`, `Core`, `App`).
  - 3 CLI diagnostic and inspection tools (`Diagnostic`, `ManualIndexer`, `ProjectInspector`).
  - 6 automated xUnit test suites (`UnitTests`, `MappingTests`, `ComBridgeTests`, `VisuDesignerTests`, `IntegrationTests`, `RegressionTests`).
- **Breakthrough Headless LASAL SCREEN Extraction (`LASAL.HMI.Converter.ComBridge` & `Source.LASALScreen`)**:
  - Unlocked headless `IProject2.ExportToXML` in LASAL SCREEN `01.01.197` by invoking `ExportLanguagesToXML()`, `ExportTextListsToXML()`, and `AddContainerInfo(true)` prior to `ExportToXML(path, true)`.
  - Added automatic short-path staging (`MAX_PATH` protection) and Win32 `#32770` modal dialog watchdog for `LSE_Modeless.exe`.
  - Implemented full `Runtime\*.MPC` binary parser (`LSE.MPC`, `GS0000.MPC`, `LC*.MPC`, `LW*.MPC`, `LS0000.MPC`..`LS0020.MPC`) verified against the SIGMATEK C++ runtime kernel (`T_file.cpp`, `T_picsub.cpp`, `T_init.cpp`, `T_types.h`) plus `.lsn`/`.lwn`/`.lse` inspection.
- **Hybrid VISUDesigner Project Generator (`LASAL.HMI.Converter.PythonBridge` & `Target.VISUDesigner`)**:
  - Combines official `VISUDesigner.exe --script` (`sigmatek.lasal.lvd` Python 3.12 API) with direct tab-indented UTF-8 JSON database authoring for `Dashboards`, `GlobalDashboards`, `Window`, `ControlTemplate`, `View/Default.json`, `Datapoints`, `Stations`, `Localization`, `Textlists`, `Schemes`, `FontStyles`, `Units`, `Alarms`, `Menu`, `Functionblocks`, `CodeModules`, and `ColorPalettes`, followed by `lvd` index synchronization and `PublishProject` (`Publish\webroot`).
- **Asset, Logic, Validation & Reporting Engines**:
  - Automatic BMP transparent key RGB (`#FF00FF` or custom key) to 32-bit RGBA PNG alpha conversion via SixLabors.ImageSharp.
  - LSE `_INTER_NEU` FunctionBlock and button/screen event translator to VISUDesigner FunctionBlocks and JavaScript CodeModules.
  - Visual layout and structural comparison validator using OpenCVSharp4 and ImageSharp.
  - 17-section Conversion Report generator supporting HTML, JSON, CSV, and Excel (`.xlsx`).
- **Windows Desktop Engineering UI (`LASAL.HMI.Converter.App`)**:
  - .NET 9 WPF MVVM desktop application featuring dark/light industrial theme, 11 navigation views, and a 6-step New Conversion wizard.
