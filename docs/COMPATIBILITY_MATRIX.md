# Software Version & Compatibility Matrix

## 1. Detected Local Environment (`C:\SigmaControl` Host Machine)

| Software Component | Reference Version (Prompt) | Installed Version (Verified) | Architecture | Executable / Module Path | Status |
|---|---|---|---|---|---|
| **SIGMATEK LASAL SCREEN** | `01.01.197` | **`01.01.197` (`1.1.197.0`)** | 32-bit (x86) | `C:\Program Files (x86)\Sigmatek\Lasal\Screen\LSE_Modeless.exe` | **Verified & Supported** |
| **LASAL SCREEN COM Server** | `LASALScreen 2.0` | **TypeLib `2.0` (`LASALScreen.tlb`)** | 32-bit LocalServer32 | `CLSID {82A49236-710D-4A68-8D66-1FC2312CABAB}` / `ProgID LASALScreen.Application` | **Verified & Supported** |
| **SIGMATEK LASAL VISUDesigner** | `01.04.004` | **`01.04.006.2890`** | 64-bit (x64) | `C:\Program Files\Sigmatek\Lasal\VISUDesigner\VISUDesigner.exe` | **Verified & Supported** |
| **VISUDesigner Python Runtime** | Python 3.12 | **Python `3.12` (`lvd.py`)** | 64-bit (x64) | `C:\Program Files\Sigmatek\Lasal\VISUDesigner\Scripting\3_12\sigmatek\lasal\lvd.py` | **Verified & Supported** |
| **SIGMATEK LASAL CLASS 2** | `02.04.001` | **`02.03.002` (`2.3.2.0`)** | 32-bit (x86) | `C:\Program Files (x86)\Sigmatek\Lasal\Class2\Bin\Lasal2.exe` | **Verified & Supported** |
| **SIGMATEK MachineManager** | `01.00.057` | **`01.00.057` (`1.0.57.0`)** | 32-bit (x86) | `C:\Program Files (x86)\Sigmatek\Lasal\MachineManager\Bin\MachineManager.exe` | **Verified & Supported** |
| **SIGMATEK LARS** | `01.03.216` | **Not Installed** | 32-bit (x86) | `C:\Program Files (x86)\Sigmatek\Lars\Lars.exe` (absent) | **Detected as Not Installed (Graceful Degradation)** |
| **.NET SDK & Desktop Runtime** | .NET 8 / 9 / 10 | **SDK `9.0.321` / Runtime `9.0.23` & `8.0.34`** | 64-bit (x64) & 32-bit (x86) | `C:\Program Files\dotnet\shared\Microsoft.WindowsDesktop.App\9.0.23` | **Verified & Supported** |

---

## 2. Feature & API Compatibility Matrix

### 2.1 LASAL SCREEN `01.01.197` (`LASALScreen.Application`)

| API / Extraction Feature | Interface / Method / File Source | Compatibility Status | Notes & Version Adapter Behavior |
|---|---|---|---|
| Project Open / Close / Save / Compile | `IProject.Open`, `Close`, `Save`, `Compile` | **Supported (Verified)** | Requires staging project to a path <= 180 chars so internal files stay below Win32 `MAX_PATH` (260 chars). |
| Screen / Window / Object Enumeration | `IProject.Screens`, `Windows`, `Objects` | **Supported (Verified)** | Enumerates all screen, window, and object names and assigned text lists. |
| Server List Export (`MaeExp.txt`) | `IProject.ExportServerlist(bstrFilePath)` | **Supported (Verified)** | Exports full server/datapoint list in standard LASAL `MaeExp.txt` format. |
| Headless XML Export (`Languages`, `TextLists`, `Texts`, `ContainerInfo`, `TextSchemes`, `Fonts`, `FontSchemes`) | `IProject2.ExportLanguagesToXML()` + `ExportTextListsToXML()` + `AddContainerInfo(true)` + `ExportToXML(path, true)` | **Supported (Verified)** | Pre-selects all languages and text lists in memory before invoking `ExportToXML`, bypassing the modal `"No language selected"` dialog. |
| Screen, Window, GlobalScreen & Object Geometry, Colors, Borders, Datapoints, Events & Schemes | `<ProjectDir>\Runtime\*.MPC` (`LSE.MPC`, `LC*.MPC`, `LW*.MPC`, `GS0000.MPC`, `LS0000.MPC`..`LS0020.MPC`) + `Screen\*.lsn`, `Window\*.lwn`, `Object\*.lse` | **Supported (Verified)** | Parsed directly in read-only mode according to SIGMATEK LSE Kernel C++ specifications (`T_file.cpp`, `T_picsub.cpp`, `T_init.cpp`, `T_types.h`). Automatically invokes `IProject.Compile()` on the staged copy if `Runtime\*.MPC` is missing or stale. |
| Direct In-Process 64-bit COM Instantiation | `Type.GetTypeFromProgID("LASALScreen.Application")` from x64 | **Unsupported by OS/COM** | `LASALScreen.Application` is registered under `HKLM\SOFTWARE\Classes\WOW6432Node\CLSID\{82A49236-710D-4A68-8D66-1FC2312CABAB}`. Handled via out-of-process 32-bit PowerShell bridge (`SysWOW64\WindowsPowerShell\v1.0\powershell.exe`). |

### 2.2 LASAL VISUDesigner `01.04.006.2890` (`VISUDesigner.exe --script` + JSON DB)

| API / Generation Feature | Interface / Method / File Target | Compatibility Status | Notes & Version Adapter Behavior |
|---|---|---|---|
| Project Creation / Loading / Saving / Closing | `lvd.CreateProject`, `LoadProject`, `SaveProject`, `CloseProject` | **Supported (Verified)** | Executed via `VISUDesigner.exe --script <script.py>`. |
| Station Creation & Synchronization | `lvd.CreateStation(name, StationType.LARS, address)`, `UpdateAllStations()` | **Supported (Verified)** | Supports `StationType.OPCUA (0)` and `StationType.LARS (1)`. Also writes `Stations\<Station>.json` and `Datapoints\0_Datapoints.json`. |
| Languages, Text Lists & Translations | `lvd.AddLanguages`, `AddTextLists`, `AddTexts`, `ValidateAndSynchronizeTextLists` | **Supported (Verified)** | Synchronizes `Localization\Languages.json` and `Textlists\*.json`. |
| Media & Graphic Resources | `lvd.AddMediaItems` + `Resources\` copy | **Supported (Verified)** | Copies converted PNG/SVG/JPG/BMP assets into `Resources\` and registers them in `Resources.json` and via `lvd.AddMediaItems`. |
| Schemes (`ImageScheme`, `TextScheme`, `ColorScheme`, `FontScheme`, `ObjectScheme`, `ServerScheme`) | `lvd.AddSchemes` + `Schemes\*.json` | **Supported (Verified)** | Supports `SchemeType.Image`, `Text`, `Color`, `Font`, `Object`, `Value`. |
| Alarms & Menus | `lvd.AddAlarms`, `AddMenus` + `Alarms\Alarms.json`, `Menu\*.json` | **Supported (Verified)** | Supports `AlarmSeverity` (`Error`, `Warning`, `Information`), `ConfirmationPolicy`, and `MenuEntry` trees. |
| Views & Navigation Entries | `lvd.AddViews`, `AddViewEntries` + `View\Default.json` | **Supported (Verified)** | Links generated `Dashboards`, `GlobalDashboards`, and `Windows` into the active `Default` view hierarchy. |
| Dashboard, Window, GlobalDashboard & ControlTemplate Placement | Direct JSON authoring (`Dashboards\*.json`, `GlobalDashboards\*.json`, `Window\*.json`, `ControlTemplate\*.json`) + `lvd.UpdateComponentProperties()`, `SynchronizeLogicElements()`, `UpdatePropertyValues()` | **Supported (Verified)** | Native `lvd.py` in `01.04.004`–`01.04.006` does not expose control placement methods; authoring the JSON database and running the 3 `lvd` synchronization methods rebuilds `.tmp\index.db` cleanly. |
| FunctionBlocks & JavaScript CodeModules | `lvd.AddCodeModules` + `Functionblocks\*.json` / `*.js` + `CodeModules\*.js` | **Supported (Verified)** | Migrates LSE `_INTER_NEU` FunctionBlocks and button/screen events to VISUDesigner FunctionBlocks and JavaScript modules. |
| Project Publishing (`webroot`) | `lvd.PublishProject(output_path)` | **Supported (Verified)** | Compiles the VISUDesigner project into a deployable HTML5/JS web bundle (`Publish\webroot\index.html`). |

### 2.3 Installed VISUDesigner Control Library (`01.04.006.2890`)

Native SIGMATEK WebComponent controls installed under `C:\Program Files\Sigmatek\Lasal\VISUDesigner\Libs\sigmatek\` and mapped by `ObjectMappingRegistry`:
- `sig-control-text`, `sig-control-output`, `sig-control-numeric-input`, `sig-control-input`, `sig-control-button`, `sig-control-toggle-button`, `sig-control-switch-button2`, `sig-control-radio-button`, `sig-control-checkbox`, `sig-control-bar-straight`, `sig-control-progress-bar-basic`, `sig-control-slider`, `sig-control-gauge2`, `sig-control-image`, `sig-control-svg-container`, `sig-control-rectangle`, `sig-control-ellipse`, `sig-control-line-simple`, `sig-control-enum`, `sig-control-menu-input`, `sig-control-alarmlist2`, `sig-control-trend`, `sig-control-listview`, `sig-control-carousel`, `sig-control-mediacontainer`, `sig-composite-container`.

---

## 3. Known Environment & Compatibility Issues

1. **LARS Runtime Absence on Build Host**:
   - `C:\Program Files (x86)\Sigmatek\Lars\Lars.exe` is not installed on this workstation. Live PLC simulation via LARS is therefore disabled with a clear diagnostic status in the Environment Detector; visual & structural validation uses the compiled `Publish\webroot` output and headless renderer instead.
2. **LASAL CLASS 2 `02.03.002` vs. `02.04.001`**:
   - Installed LASAL CLASS 2 is `02.03.002`. Both `02.03.x` and `02.04.x` use identical XML schemas for `.lcp`, `.lcn`, `.lsm`, `.lss`, `.st`, and identical `MaeExp.txt` server export syntax.
3. **`LSE_Modeless.exe` Modal Dialogs & Path Length**:
   - Addressed automatically by the `ComBridge` short-path staging manager and Win32 `#32770` modal dialog watchdog.
