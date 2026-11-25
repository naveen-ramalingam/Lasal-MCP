# Official API & Binary Format Reference

This document records the verified COM interfaces, Python scripting APIs, JSON database schemas, and binary file formats used by **LASAL HMI Converter**. Every entry has been verified against the installed software on this machine (`LASAL SCREEN 01.01.197`, `LASAL VISUDesigner 01.04.006.2890`, `LASAL CLASS 2 02.03.002`) and the SIGMATEK C++ runtime kernel source (`Stations\Terminal\HMI\Source\cppcode\`).

---

## 1. LASAL SCREEN COM Automation API (`LASALScreen.tlb` v2.0)

- **TypeLib GUID**: `{DC9303D6-0976-4025-AF16-6C1139ACC527}` (`LASALScreen 2.0 Type Library`)
- **CoClass `Application`**: `CLSID {82A49236-710D-4A68-8D66-1FC2312CABAB}`, `ProgID "LASALScreen.Application"`
- **Server Binary**: `C:\Program Files (x86)\Sigmatek\Lasal\Screen\LSE_Modeless.exe` (32-bit Out-of-Process LocalServer32)

### 1.1 `IApplication` (`{F9B8E822-2B28-4EE0-B19F-D7CE7E56C9E7}`)
| Member | Signature | Verified Behavior |
|---|---|---|
| `Open` | `IProject* Open(BSTR bstrFilePath)` | Opens a `.lpr` project file and returns its `IProject*` instance (`$prj = $app.Open($lprPath)`). Note: `$app.Project` and `$app.Visible` are not populated directly on `IApplication` in `01.01.197`. Full path including internal subfolders must be `< 260` chars (`MAX_PATH`). |
| `Close` | `void Close(...)` / `IProject.Close(VARIANT_BOOL bSave)` | Closes the project cleanly without saving (`$prj.Close($false)`), then release COM via `[Marshal]::FinalReleaseComObject`. |

### 1.2 `IProject` / `IProject2` / `IProject3` (`{A954325D-2177-4021-8176-52F6C5D7A227}`)
| Member | Signature | Helpstring / Verified Behavior |
|---|---|---|
| `Compile` | `void Compile()` | Compiles the project and writes/updates `<ProjectDir>\Runtime\*.MPC`. |
| `ExportServerlist` | `void ExportServerlist(BSTR bstrFilePath)` | Exports the project's server/variable table in LASAL `MaeExp.txt` format. |
| `Screens` | `IScreens* Screens { get; }` | Collection of `IScreen` (`Count()`). **Important**: `Screens.Item(id)`, `Windows.Item(id)`, `Objects.Item(id)` index by sparse object ID rather than dense `0..Count-1`; non-existent IDs raise `Requested item not found`. |
| `Windows` | `ILSEWindows* Windows { get; }` | Collection of `ILSEWindow` (`Count()`, `Item(id)`). |
| `Objects` | `IObjects* Objects { get; }` | Collection of `IObjectAtm` (`Count()`, `Item(id)`). |
| `TextLists` | `ITextLists* TextLists { get; }` | Collection of `ITextList` (`Count()`, `Item(index)` -> `Name()`, `Import`, `Export`). |
| `Languages` | `ILanguages* Languages { get; }` | Collection of `ILanguage` (`Count()`, `Item(index)` -> `Name()`, `LanguageID()`). |
| `ExportLanguagesToXML` | `void ExportLanguagesToXML()` | (`IProject2`) Pre-selects all project languages for XML export (`IsSelectedForXMLExport = true`). |
| `ExportTextListsToXML` | `void ExportTextListsToXML()` | (`IProject2`) Pre-selects all project text lists for XML export (`IsSelectedForXMLExport = true`). |
| `AddContainerInfo` | `void AddContainerInfo(VARIANT_BOOL bAdd)` | (`IProject2`) Enables writing `<ContainerInfo Key_FontScheme="..." Width="..." Height="..."/>` on `<Text>` nodes. |
| `ExportToXML` | `void ExportToXML(BSTR bstrFilePath, VARIANT_BOOL bSingleFile)` | (`IProject2`) Exports pre-selected languages, text lists, texts, text schemes, fonts, and font schemes into a UTF-8 XML file. |
| `ImportFromXML` | `void ImportFromXML(BSTR bstrFilePath)` | (`IProject2`) Imports languages and text lists from an XML file. |

---

## 2. LASAL VISUDesigner Python 3.12 API (`sigmatek.lasal.lvd`)

- **Module Path**: `C:\Program Files\Sigmatek\Lasal\VISUDesigner\Scripting\3_12\sigmatek\lasal\lvd.py`
- **Execution Command**: `"C:\Program Files\Sigmatek\Lasal\VISUDesigner\VISUDesigner.exe" --script "<script.py>"`

### 2.1 Project Lifecycle & Station Methods
- `lvd.CreateProject(project_path: str, width: str, height: str, design_template: str, language: str) -> IProject`: Creates a new `.lvp` project with numeric pixel dimensions (e.g. `'800'`, `'480'`, without `'px'` suffix) and initializes standard subdirectories (`Alarms`, `CodeModules`, `ControlTemplate`, `Dashboards`, `Datapoints`, `FontStyles`, `Functionblocks`, `GlobalDashboards`, `Localization`, `Menu`, `Resources`, `Runtime`, `Schemes`, `Stations`, `Units`, `View`, `Window`). Note: target parent directory must not contain conflicting pre-created files before calling `CreateProject`.
- `lvd.LoadProject(project_path: str) -> IProject`: Loads an existing `.lvp` project and synchronizes `.tmp\index.db`.
- `lvd.SaveProject(prj: IProject) -> bool`: Commits in-memory state and `.tmp\index.db` to disk.
- `lvd.CloseProject(prj: IProject) -> bool` & `lvd.CloseAllProjects() -> bool`: Closes open projects and releases `.lock` / SQLite handles.
- `lvd.PublishProject(prj: IProject, output_path: str = ...) -> bool`: Compiles the project into a deployable HTML5/JS web bundle (`Publish\webroot\index.html`).
- `lvd.CreateStation(prj: IProject, iStationNr: int, strStationPath: str = None, strConnSetting: str = None, strName: str = None, ...) -> bool`: Creates a PLC/internal communication station (`Station0` with `INTERN`, PLC stations with `GLOBAL` or `LOCAL`).
- `lvd.UpdateStation(prj: IProject, uiStationNr: int) -> bool` & `lvd.UpdateAllStations(prj: IProject) -> bool`: Synchronizes station datapoints from an LC2 XML export file.

### 2.2 Resource, Localization, Scheme, Alarm & Synchronization Methods
- `lvd.AddLanguages(prj: IProject, languages: list[Language]) -> bool`: Registers languages (`lvd.Language(name)`).
- `lvd.AddTextLists(prj: IProject, text_lists: list[TextList]) -> bool`: Creates named text lists (`Localization\<lang>\<Name>.json`).
- `lvd.AddTexts(prj: IProject, text_lists: list[TextList]) -> bool`: Adds `lvd.TextElement(name, text)` items to a text list.
- `lvd.ValidateAndSynchronizeTextLists(prj: IProject) -> bool`: Rebuilds the localization index.
- `lvd.SetDatapointProperties(prj: IProject, datapointPropertySets: list[PropertySet]) -> bool`: Configures `DP_ALIAS_NAME`, `DP_REFRESH_TIME`, `DP_WRITE_PROTECTED`, `DP_LIMIT_LOW`, `DP_LIMIT_HIGH`, `DP_UNIT`, `DP_INIT_VALUE`.
- `lvd.AddMediaItems(prj: IProject, items: list[MediaItem]) -> bool`: Imports image/SVG/media files into `Resources\` and collection manifests.
- `lvd.AddSchemes(prj: IProject, schemes: list[Scheme]) -> bool`, `lvd.AddSchemeEntries(prj, schemes)`, `lvd.SetSchemeEntryProperties(prj, schemes)`: Creates `ColorSchemeCollection`, `MediaSchemeCollection`, `TextSchemeCollection`, `UnitSchemeCollection`, `StateSchemeCollection`, and `DatapointSchemeCollection` entries.
- `lvd.AddCodeModules(prj: IProject, file_paths: list[str]) -> bool`: Imports `.js` modules into `CodeModules\`.
- `lvd.AddMenus(prj: IProject, menus: list[Menu]) -> bool`: Creates `Menu\Menu.json` (`type="menus"`, entries `type="menu"` with `controlId="sig-control-menu"` and `children` of `type="menuItem"`).
- `lvd.AddAlarms(prj: IProject, alarms: list[Alarm]) -> bool`: Creates alarm definitions in `Alarms\Alarm.json`.
- `lvd.AddViews(prj: IProject, views: list[View]) -> bool` & `lvd.AddViewEntries(prj: IProject, view_entry_sets: list[ViewEntrySet]) -> bool`: Registers dashboards/windows in `View\`.
- `lvd.UpdateComponentProperties(prj: IProject) -> bool`, `lvd.SynchronizeLogicElements(prj: IProject) -> bool`, `lvd.UpdatePropertyValues(prj: IProject) -> bool`: Synchronizes directly authored `Dashboards\*.json`, `GlobalDashboards\*.json`, `Window\*.json`, `ControlTemplate\*.json`, and `Functionblocks\*.json` into VISUDesigner's internal SQLite database (`.tmp\index.db`).

---

## 3. VISUDesigner JSON Database Encoding Specification

1. **Dashboard / Window / GlobalDashboard / ControlTemplate JSON (`Dashboards\<Name>.json`)**:
   - Formatted with tab (`\t`) indentation, UTF-8 without BOM.
   - Root object holds `"FormatVersion": "1.0"`, `"ComponentId"`, `"Name"`, `"Type"` (`"Dashboard"`, `"GlobalDashboard"`, `"Window"`, `"ControlTemplate"`), `"Properties"` array, `"Components"` array (placed child controls), and `"Events"` array.
2. **Property Value Encoding Rules**:
   - Every property in `"Properties"` has `"Id"`, `"Type"`, `"Value"`, and optional `"Binding"` / `"ComplexBinding"`.
   - **Primitive types (`String`, `Boolean`, `Number`, `Integer`, `Enum`)**: `"Value"` stores the JSON-serialized representation as a string (e.g., string `"Start"` is stored as `"\"Start\""`, number `100` as `"100"`, boolean `true` as `"true"`).
   - **Color type (`Color`)**: `"Value"` stores a raw CSS color string (`"#RRGGBB"` or `"rgba(r, g, b, a)"`) **without** extra inner quotes.
   - **Complex object types (`Position`, `FontStyle`, `SingleText`, `Datapoint`, `ImageScheme`, `TextScheme`, `ColorScheme`, `Unit`)**: `"Value"` stores the JSON-serialized object once as a string (e.g., `"{\"X\":10,\"Y\":20,\"Width\":120,\"Height\":40,\"ZIndex\":1}"`).
