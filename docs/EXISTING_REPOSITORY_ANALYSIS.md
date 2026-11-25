# Existing Repository Analysis — `Svel26/Lasal-MCP`

## 1. Repository Identification & License Attribution

- **Repository**: [https://github.com/Svel26/Lasal-MCP](https://github.com/Svel26/Lasal-MCP) (`Svel26/Lasal-MCP`)
- **Local Reference Copy**: [reference/Lasal-MCP](file:///C:/SigmaControl/reference/Lasal-MCP)
- **Version Inspected**: `2.2.0` (`package.json`)
- **License**: **MIT License** (`Copyright (c) 2025-2026 Sven Jansen and Lasal-MCP contributors`, see [LICENSE](file:///C:/SigmaControl/reference/Lasal-MCP/LICENSE))
- **Distribution & Attribution Compliance**:
  - The MIT License permits unrestricted use, modification, extraction of architectural patterns, and redistribution in source or binary form, provided the original copyright notice and permission notice are preserved.
  - **LASAL HMI Converter** includes full attribution in `docs/EXISTING_REPOSITORY_ANALYSIS.md`, `docs/README.md`, and `release/README.md`, and extracts/adapts verified automation patterns into clean, strongly-typed C# modules (`LASAL.HMI.Converter.ComBridge`, `LASAL.HMI.Converter.PythonBridge`, `LASAL.HMI.Converter.Target.VISUDesigner`, `LASAL.HMI.Converter.Class2`) rather than embedding the Node.js MCP server wholesale.

---

## 2. Existing Functionality Audited in Source Code

Every source module under `reference/Lasal-MCP/src/` and `reference/Lasal-MCP/docs/` was inspected directly:

### 2.1 LASAL SCREEN Automation (`src/utils/lseScript.ts`, `src/utils/lseProject.ts`, `src/tools/lseProject.ts`, `src/domains/screen/actions.ts`)
1. **32-bit COM Invocation (`lseScript.ts`)**:
   - Invokes 32-bit Windows PowerShell (`C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe`) because `LASALScreen.Application` (`CLSID {82A49236-710D-4A68-8D66-1FC2312CABAB}`) is registered only in the 32-bit (`WOW6432Node`) registry hive and backed by the 32-bit out-of-process COM server `LSE_Modeless.exe`.
   - Uses an STA script runner (`-NoProfile -NonInteractive -ExecutionPolicy Bypass -File ...`) with a dialog watchdog (`dialogWatchdog.ts`) that monitors Win32 `#32770` modal dialogs spawned by `LSE_Modeless` and dismisses them automatically so automation never hangs indefinitely.
2. **Project Operations (`lseProject.ts`, `tools/lseProject.ts`)**:
   - Supports `Open`, `Create`, `Save`, `Close`, `Compile`, `Reload`, `ExportServerlist`, `ImportServerlist`, `ImportAllLists`, `CleanPictures`, and enumerating `Screens`, `Windows`, `Objects`, `TextLists`, and `Languages` via COM (`IProject2`, `IScreens`, `ILSEWindows`, `IObjects`, `ITextLists`, `ILanguages`).
   - Includes a fallback file-system inspector (`inspectLseProjectFilesystem` in `src/utils/lseProject.ts`) that reads `Project\*.lpg`, `Screen\*.lsn`, `Window\*.lwn`, `Object\*.lse`, `Image\*.bmp/*.jpg/*.png`, and `Runtime\*.MPC` directory inventories when COM is unavailable.
3. **Documented Limitation in `Lasal-MCP` (`docs/LSE_AUTOMATION_REFERENCE.md`)**:
   - `Lasal-MCP` reported `ExportToXML` as blocked by a modal GUI dialog (`"Failed to export project! No language selected."`) because language selection appeared to be GUI-only.
   - **Breakthrough Achieved in LASAL HMI Converter**: By inspecting the `LASALScreen 2.0` type library (`LASALScreen.tlb` `{DC9303D6-0976-4025-AF16-6C1139ACC527}`) directly via `LoadTypeLibEx`, we discovered the method helpstrings on `IProject2`:
     - `ExportLanguagesToXML()` -> *"Exports all languages into XML file"* (actually pre-selects all languages in the internal export buffer)
     - `ExportTextListsToXML()` -> *"Exports all textlists into XML file"* (pre-selects all text lists in the internal export buffer)
     - `AddContainerInfo(bool)` -> *"Defines whether additional container info will be written"* (writes `Width`, `Height`, `Key_FontScheme` for text containers)
     - `ExportToXML(string, bool)` -> *"Exports prechosen languages and textlists into XML file"*
     Calling `ExportLanguagesToXML()` + `ExportTextListsToXML()` + `AddContainerInfo($true)` prior to `ExportToXML($path, $true)` completely unlocks headless XML export of all languages, text lists, texts, container dimensions, text schemes, fonts, and font schemes without any modal error!
   - **Second Breakthrough Achieved in LASAL HMI Converter (`MAX_PATH` Protection)**:
     - `LSE_Modeless.exe` is a 32-bit MFC90 executable (`mfc90.dll`) that uses fixed `MAX_PATH` (260-character) buffers when opening internal project subdirectories. If a project sits inside a deep folder path ( > ~180 characters), `Open()` silently fails or hangs. Staging the read-only project copy into a short path (`Path.GetTempPath()\lse_<hash>\`) guarantees fast (~3 second) COM execution.

### 2.2 VISUDesigner Automation (`src/utils/visuScript.ts`, `src/utils/visuDashboardIO.ts`, `src/utils/visuPropertyEncoding.ts`, `src/tools/visuDashboard.ts`, `src/tools/visuControl.ts`)
1. **Python 3.12 Scripting Bridge (`visuScript.ts`)**:
   - Executes `VISUDesigner.exe --script <temp.py>` using the embedded Python 3.12 module `sigmatek.lasal.lvd` (`C:\Program Files\Sigmatek\Lasal\VISUDesigner\Scripting\3_12\sigmatek\lasal\lvd.py`).
   - Serializes results through a structured JSON marker file because `VISUDesigner.exe` is a Win32 GUI subsystem process that does not pipe `stdout` to the parent console.
2. **Direct Dashboard & Control JSON Authoring (`visuDashboardIO.ts`, `visuPropertyEncoding.ts`, `visuControl.ts`)**:
   - Because `lvd.py` provides project-level operations (`CreateProject`, `LoadProject`, `SaveProject`, `CloseProject`, `PublishProject`, `CreateStation`, `UpdateAllStations`, `AddLanguages`, `AddTextLists`, `AddTexts`, `SetDatapointProperties`, `AddSchemes`, `AddMediaItems`, `AddCodeModules`, `AddMenus`, `AddAlarms`, `AddViews`, `AddViewEntries`, `ValidateAndSynchronizeTextLists`, `UpdateComponentProperties`, `SynchronizeLogicElements`, `UpdatePropertyValues`) but **no API for creating Dashboards or placing Controls**, `Lasal-MCP` authors `Dashboards\<Name>.json`, `GlobalDashboards\<Name>.json`, `Window\<Name>.json`, `ControlTemplate\<Name>.json`, and `View\Default.json` directly on disk as tab-indented UTF-8 JSON.
   - `visuPropertyEncoding.ts` documents the critical VISUDesigner property value encoding rules:
     - **Primitive strings, booleans, and numbers** are double-JSON-encoded inside the `"Value"` string field (e.g., string `"Pump 1"` -> `"\"Pump 1\""`, boolean `true` -> `"true"`, number `42` -> `"42"`).
     - **Structured objects** (`FontStyle`, `Position`, `SingleText`, `Datapoint`, `TextScheme`, `ImageScheme`, `ColorScheme`, `Unit`, `Event`) are JSON-serialized once into the `"Value"` string field.
     - **Color properties** (`Color` type) are stored as raw CSS hex/rgba strings (e.g., `"#3A3A3A"`, `"rgba(255, 0, 0, 1)"`) without outer escaped quotes.
   - After modifying JSON files on disk, `Lasal-MCP` runs a synchronization script (`LoadProject` -> `UpdateComponentProperties` -> `SynchronizeLogicElements` -> `UpdatePropertyValues` -> `SaveProject` -> `CloseProject`) so VISUDesigner rebuilds its internal SQLite index (`.tmp\index.db`).

### 2.3 LASAL CLASS 2 & Runtime Integration (`src/utils/lasalXml.ts`, `src/utils/engine.ts`, `src/utils/lars.ts`)
1. **LASAL CLASS 2 XML & `MaeExp.txt` Parsing (`lasalXml.ts`)**:
   - Parses `.lcp` (Project), `.lcn` (Network), `.lsm` (Station Manager), `.lss` (Station), and `.st` (Structured Text class header) files to resolve PLC classes, objects, servers (`vServer`), clients (`vClient`), and exported HMI lists (`MaeExp.txt`).
2. **CLASS 2 Batch Runner (`engine.ts`)**:
   - Wraps `Lasal2.exe` Python 2.7 batch scripting (`sigmatek.lasal.batch`) and warns about the non-standard `"TRUE"` / `"FALSE"` string return conventions in `Lasal2.exe`.

---

## 3. Reusable Modules vs. Missing Functionality & Required Modifications

| Capability | Status in `Svel26/Lasal-MCP` | Implementation in `LASAL.HMI.Converter` |
|---|---|---|
| **32-bit LSE COM Bridge + Dialog Watchdog** | Implemented in TypeScript (`lseScript.ts`, `dialogWatchdog.ts`) | Ported & hardened in C# (`LASAL.HMI.Converter.ComBridge`) with short-path `MAX_PATH` staging and structured JSON IPC |
| **LSE Headless XML Export (`ExportToXML`)** | Marked blocked by GUI language selection gate | **Solved & implemented** in `ComBridge` by calling `ExportLanguagesToXML()`, `ExportTextListsToXML()`, and `AddContainerInfo(true)` before `ExportToXML(path, true)` |
| **LSE Deep Screen/Window/Object Geometry & Property Extraction** | Only COM names & filesystem file list | **Newly engineered** in `LASAL.HMI.Converter.Source.LASALScreen`: combines COM automation, headless XML export, compiled `Runtime\*.MPC` binary bytecode parser (verified against SIGMATEK C++ kernel `T_file.cpp`, `T_picsub.cpp`, `T_init.cpp`), and `.lsn`/`.lwn`/`.lse` MFC archive inspector |
| **LSE Image & Transparency Conversion** | File enumeration only | **Newly engineered** in `LASAL.HMI.Converter.Assets`: ImageSharp processor converting LASAL SCREEN magic-pink (`#FF00FF`) / per-image transparent RGB colors in BMPs into native alpha-channel PNGs |
| **LSE FunctionBlock (`_INTER_NEU`) & Event Migration** | Not implemented | **Newly engineered** in `LASAL.HMI.Converter.Logic`: translates LSE FunctionBlocks (`LseMirr`, `Add`, `Sub`, `Mul`, `Div`, `Equal`, `Greater`, `Less`, `And`, `Or`, `Xor`, `Not`, `Switch`, `SetValue`, screen navigation, system variables) into VISUDesigner FunctionBlocks (`Functionblocks\*.json` + `*.js`) and CodeModules (`CodeModules\*.js`) |
| **VISUDesigner Hybrid Generator (`lvd.py` + JSON DB)** | Implemented for individual MCP tool calls (`visuScript.ts`, `visuDashboardIO.ts`) | Ported & expanded in `LASAL.HMI.Converter.PythonBridge` and `LASAL.HMI.Converter.Target.VISUDesigner` to batch-generate full projects (Stations, Datapoints, Languages, TextLists, Units, FontStyles, ColorPalettes, Schemes, Resources, Alarms, Menus, Dashboards, GlobalDashboards, Windows, ControlTemplates, FunctionBlocks, CodeModules, Views) and publish to `Publish\webroot` |
| **Configurable Object Mapping Registry** | Not implemented | **Newly engineered** in `LASAL.HMI.Converter.Mapping` covering all 20+ LASAL SCREEN element types to native `sigmatek.*` VISUDesigner controls with coordinate scaling, style preservation, and user JSON overrides |
| **Visual & Functional Validation Engine** | Not implemented | **Newly engineered** in `LASAL.HMI.Converter.Validation` using OpenCVSharp4 + ImageSharp layout/perceptual comparison and structural/publish verification |
| **Multi-Format Reporting Engine** | Not implemented | **Newly engineered** in `LASAL.HMI.Converter.Reporting` producing 17-section HTML, JSON, CSV, and Excel (`.xlsx`) reports |
| **Windows Desktop Engineering UI** | Not implemented (CLI MCP server only) | **Newly engineered** in `LASAL.HMI.Converter.App` (.NET 9 WPF MVVM desktop application) |

---

## 4. API Limitations & Version Dependencies Identified

1. **`LASALScreen.Application` (v01.01.197)**:
   - 32-bit LocalServer32 COM server (`LSE_Modeless.exe`). Cannot be loaded in-process by a 64-bit application; requires out-of-process 32-bit invocation (`SysWOW64\WindowsPowerShell\v1.0\powershell.exe`).
   - Enforces a 260-character `MAX_PATH` limit on project paths.
   - `IScreen`, `ILSEWindow`, and `IObjectAtm` COM interfaces expose only `Name`, `TextList`, `Export()`, and `UpdateButton()`. Full screen/window/object coordinates, colors, server numbers, and events are stored in `<ProjectDir>\Runtime\*.MPC` (refreshed via `IProject.Compile()`) and `<ProjectDir>\Screen\*.lsn`, `<ProjectDir>\Window\*.lwn`, `<ProjectDir>\Object\*.lse`.
2. **`VISUDesigner.exe` (v01.04.006.2890)**:
   - 64-bit executable with embedded Python 3.12 (`Scripting\3_12\sigmatek\lasal\lvd.py`).
   - Single-instance lock or concurrent instance collision if multiple `VISUDesigner.exe --script` processes run simultaneously against the same project; must be serialized with a process mutex and invoked via `Process.Start` + `WaitForExit`.
   - `lvd.CreateStation` accepts `StationType.OPCUA` or `StationType.LARS` (`lvd.StationType.LARS = 1`).
   - Dashboards and controls must be written to the JSON project database and synchronized via `lvd.UpdateComponentProperties()`, `lvd.SynchronizeLogicElements()`, and `lvd.UpdatePropertyValues()` prior to `lvd.SaveProject()` and `lvd.PublishProject()`.
