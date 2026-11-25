# SIGMATEK LASAL Training Manuals & Local Help Index

This document indexes all SIGMATEK LASAL training manuals, project archives, and installed CHM help databases located on the workstation (`C:\SigmaControl\01_Manuals` and `C:\Program Files*\Sigmatek\Lasal\`).

> **Copyright Notice**: No copyrighted manual prose has been copied verbatim into public distribution files. This index records document metadata, file paths, versions, chapter structures, and page citations used to verify engineering decisions in **LASAL HMI Converter**.

---

## 1. Training Manual Folders (`C:\SigmaControl\01_Manuals\`)

### 1.1 `01 LASAL CLASS Basics`
- **Root Path**: [01 LASAL CLASS Basics](file:///C:/SigmaControl/01_Manuals/01%20LASAL%20CLASS%20Basics)
- **Software Versions Referenced**: LASAL CLASS 2 `02.02.189` – `02.03.x`
- **Documents (`Pdf\Englisch\` & `Pdf\Deutsch\`, Release Date: `22.11.2016`)**:
  - `Cover.pdf` (1 page) — *Training Manual: LASAL CLASS 2 (Basic Course)*
  - `Chapter Overview.pdf` (2 pages) — Complete table of contents (Chapters 1–17)
  - `Chapters\1_Introduction.pdf` (4 pages, pp. 1-1 to 1-4) — Object-oriented PLC programming concepts (`Class`, `Object`, `Server`, `Client`)
  - `Chapters\2_LASAL CLASS 2.pdf` (18 pages, pp. 2-1 to 2-18) — IDE layout, Workspace, Network views, Class view, Object dictionary
  - `Chapters\3_First Project.pdf` (16 pages, pp. 3-1 to 3-16) — Creating projects (`.lcp`), networks (`.lcn`), placing objects, online connection
  - `Chapters\4_Classes and Objects.pdf` (18 pages, pp. 4-1 to 4-18) — Server types (`Data`, `Command`, `MerkerEx`), Client options (`Required`, `Initialized`), `Init`/`CyWork`/`RtWork`/`Background` methods, `Read()`/`Write()` methods
  - `Chapters\5_Hardware Connection.pdf` (14 pages, pp. 5-1 to 5-14) — Hardware Tree, S-DIAS / Diasbus / Varnan modules, mapping hardware inputs/outputs to class clients
  - `Chapters\6_State Machine.pdf` (6 pages, pp. 6-1 to 6-6) — `CASE ... OF` step sequencers in Structured Text (ST)
  - `Chapters\7_Complex Networks.pdf` (14 pages, pp. 7-1 to 7-14) — Complex classes (hierarchical embedding), virtual networks
  - `Chapters\8_Debugging.pdf` (16 pages, pp. 8-1 to 8-16) — Debugger, breakpoints, Real-Time Trend, Server Watchlists
  - `Chapters\9_Inheritance and Polymorphism.pdf` (8 pages, pp. 9-1 to 9-8) — Base/derived classes, `VIRTUAL GLOBAL` method overrides
  - `Chapters\10_Time Measurement.pdf` (6 pages, pp. 10-1 to 10-6) — `ops.tAbsolute` millisecond tick timer patterns
  - `Chapters\11_Libraries.pdf` (6 pages, pp. 11-1 to 11-6) — Importing/exporting class libraries
  - `Chapters\12_String Processing.pdf` (12 pages, pp. 12-1 to 12-12) — `String` and `StringRAM` classes (`ReadDataOff`, `WriteDataOff`, `GetLength`)
  - `Chapters\13_Data Storage.pdf` (8 pages, pp. 13-1 to 13-8) — Retentive memory (`RAM`, `Merker`, `RamEx`, `MerkerEx`, SRAM/File)
  - `Chapters\14_File Handling.pdf` (8 pages, pp. 14-1 to 14-8) — `_FileSys` OS interface (`FileOpen`, `FileRead`, `FileWrite`, `FileClose`)
  - `Chapters\15_Graphical Display.pdf` (20 pages, pp. 15-1 to 15-20) — Setting `Visualized = true` on servers, `_LSE` kernel object, exporting `MaeExp.txt` for LASAL SCREEN
  - `Chapters\16_Alarms.pdf` (8 pages, pp. 16-1 to 16-8) — `_AlarmX0Para`, `_AlarmXBuffer`, alarm configuration and HMI synchronization
  - `Chapters\17_Appendix.pdf` (10 pages, pp. 17-1 to 17-10) — ST operators, data types (`DINT`, `UDINT`, `REAL`, `BDINT`, `BINT`, `BOOL`), keyboard shortcuts
- **Example Archives (`Extra\`)**:
  - `LASAL CLASS 2 Basic Examples.7z` — Complete step-by-step PLC & HMI projects (`15_GraphicalDisplay`, `16_Alarms`, etc.)

### 1.2 `02 LASAL CLASS Advanced`
- **Root Path**: [02 LASAL CLASS Advanced](file:///C:/SigmaControl/01_Manuals/02%20LASAL%20CLASS%20Advanced)
- **Documents (`Pdf\Englisch\` & `Pdf\Deutsch\`)**:
  - `Cover.pdf` (1 page) — *Training Manual: LASAL CLASS 2 (Advanced Course)*
  - `Chapter Overview.pdf` (1 page)
  - `Chapters\1_The Loader.pdf` (12 pages) — Boot sequence, `Autoexec.lsl`, cyclic/realtime task scheduling
  - `Chapters\2_Pointers and References.pdf` (10 pages) — Typed pointers (`^Type`), `THIS`, function pointers
  - `Chapters\3_OS Interfaces.pdf` (14 pages) — `_TaskObjectControl`, `_MultiTask`, `_SysMsg`, `_Can`, `_SerLib`, `_TCPIP`
  - `Chapters\4_Multi-CPU Communication.pdf` (16 pages) — Station Manager (`.lsm`), inter-station server synchronization (`TxUPD`, `RxUPD`)
  - `Chapters\5_Motion Control (_LMCAxis).pdf` (22 pages) — `_LMCAxis`, `_LMCProfile`, homing, positioning, coupled axes
  - `Chapters\6_Compiler Directives and pragmas.pdf` (8 pages) — `#pragma`, conditional compilation, `AWL` / `ST` mixing
- **Example Archives (`Extra\`)**:
  - `LASAL CLASS 2 Advanced Examples.7z`

### 1.3 `03 LASAL TRAININGS Library`
- **Root Path**: [03 LASAL TRAININGS Library](file:///C:/SigmaControl/01_Manuals/03%20LASAL%20TRAININGS%20Library)
- **Archives**:
  - `TrainingSimulation.7z` — Hardware simulation classes used across CLASS 2 and SCREEN training exercises.

### 1.4 `04 LASAL SCREEN Basics`
- **Root Path**: [04 LASAL SCREEN Basics](file:///C:/SigmaControl/01_Manuals/04%20LASAL%20SCREEN%20Basics)
- **Software Versions Referenced**: LASAL Screen Editor `V01.01.155` (Compiler `Ver. 60 / LSE Standard`), `StandardTemplate (01.01.003)`, LASAL Machine Manager (`01.00.x`), LASAL Online Configuration (`01.02.047`)
- **Documents (`Pdf\Englisch\` & `Pdf\Deutsch\`, Release Date: `12.10.2018`)**:
  - `Cover.pdf` (1 page) — *Training Manual: LASAL SCREEN Basics (Basic Course)*
  - `Chapter Overview.pdf` (1 page)
  - `Chapters\1_Working with the Standard Template.pdf` (30 pages, pp. 1–30) — Machine Manager setup, project creation from `StandardTemplate`, station numbers, importing `MaeExp.txt`, `LSE_Project.lpr`, Add-On packages (`AccessControl`, `DataAnalyzer`, `Diagnosis`, `EventJournal`, `FileExplorer`, `PDFViewer`, `RecipeHandling`, `VNCClient`, etc.)
  - `Chapters\2_Visualization Basics.pdf` (48 pages, pp. 1–48) — Global Screen, Screens, Windows, Project Tree (`CTRL+ALT+P`), Repository (`CTRL+ALT+R`), Server Explorer (`CTRL+ALT+S`), Object Inspector (`CTRL+ALT+I`), Text Lists (`CTRL+ALT+T`), Image Pools (`CTRL+ALT+B`), Themes (`CTRL+ALT+O`), Buttons (Toggle, Push, Radio, Screen/Window Open, FunctionBlock trigger), Inputs/Outputs (Numeric, String, Date, Time, Enumeration), Bars (`Bar`), Motion/Dynamic graphics, Schemes (`ImageScheme`, `TextScheme`, `ColorScheme`, `UnitScheme`, `ServerScheme`, `FontScheme`, `ObjectScheme`), FunctionBlocks (`_INTER_NEU`: `LseMirr`, arithmetic, logic, comparisons, `Switch`), Units & scaling
  - `Chapters\3_Alarm Management.pdf` (13 pages, pp. 1–13) — Configuring alarms in LSE and CLASS 2 (`_AlarmX0Para`, `_AlarmXBuffer`, `_HotAlarm`, `_AlarmDisplay`), alarm parameters, acknowledgement, `EventJournal`
  - `Chapters\4_Language Management.pdf` (25 pages, pp. 1–25) — Creating Text Lists (`TextPuffer`), adding languages, assigning flag icons, `LanguageSelection` window, Unicode (UTF-16) vs. ASCIIfonts, Excel/XML export & import (`ExportToXML` / `ImportFromXML`), dynamic container resizing (`AddContainerInfo`)
  - `Chapters\5_Graph Representation.pdf` (17 pages, pp. 1–17) — `DataAnalyzer` Add-On vs. classic `_Graph` object, sampling rates, trigger modes, cursor inspection, USB CSV export
  - `Chapters\6_Access Control.pdf` (18 pages, pp. 1–18) — `AccessControl` Add-On, user levels (`AccessLevel` 1..31), password login/logout, USB key authentication, protecting buttons and inputs via `AccessLevel`
- **Example Archives (`Extra\`)**:
  - `LASAL SCREEN Basic Examples.7z` — Contains `1_FirstProjectSolution`, `2_PumpControlSolution`, `3_PumpControlUnitSolution`, `4_PumpControlSchemeSolution`, `5_ClassInputOutputSolution`, `6_AlarmSolution`, `7_LanguageSolution`, `8_GraphSolution`, `9_AccessControlSolution`.

### 1.5 `05 LASAL SCREEN Advanced`
- **Root Path**: [05 LASAL SCREEN Advanced](file:///C:/SigmaControl/01_Manuals/05%20LASAL%20SCREEN%20Advanced)
- **Software Versions Referenced**: LASAL Screen Editor `V01.01.155+`
- **Documents (`Pdf\Englisch\` & `Pdf\Deutsch\`, Release Date: `12.10.2018`)**:
  - `Cover.pdf` (1 page) — *Training Manual: LASAL SCREEN Advanced (Advanced Course)*
  - `Chapter Overview.pdf` (1 page)
  - `Chapters\1_Kernel Interfaces.pdf` (8 pages, pp. 1–8) — Architecture of the `_LSE` kernel, graphics engine (`Grafik Engine`), `Source\cppcode\` compilation inside CLASS 2 (`Terminal\HMI`)
  - `Chapters\2_Global Interface.pdf` (26 pages, pp. 1–26) — Deriving from `_Global`: virtual event hooks `IF_WindowRun`, `IF_WindowStart`, `IF_WindowEnd`, `IF_Write`, `IF_InputIsSaved`, `IF_PressButton`, `IF_StayOnButton`, `IF_VerifyEvent`; calling `InsertCmd(CMD_NEWPICTURE, nr, 0)`, `InsertCmd(CMD_NEWWINDOW, nr, 0)`, `InsertCmd(CMD_CLOSE, 0, 0)`, `InsertCmd(CMD_REDRAW, 0, 0)`
  - `Chapters\3_MyIO Interface.pdf` (35 pages, pp. 1–35) — Custom graphical controls derived from `_MyIO`: `GetEvent`, `Draw`, `IF_Start`, `Run`, `End`, low-level drawing primitives (`OutTextXY`, `Rectangle`, `Button`, `Bitmap`, `Line`, `Bar`)
  - `Chapters\4_ScrollArea Interface.pdf` (14 pages, pp. 1–14) — Custom scrollable lists derived from `_ScrollArea` / `_ScrollArea2`: `Line`, `LineWidth`, `LineHeight`, `ActPos`
  - `Chapters\5_UDC creation.pdf` (24 pages, pp. 1–24) — User Defined Controls (`UDC`): creating parameterized control templates in LSE with internal servers, texts, images, schemes, and binding them to a CLASS 2 companion class (`_MyIO` / `GetTheUrValues`)
  - `Chapters\6_Drag and Drop.pdf` (22 pages, pp. 1–22) — Touch drag-and-drop implementation using `_MyIO` hit-testing and coordinate tracking
  - `Chapters\6_Dynamic Carousel.pdf` (20 pages, pp. 1–20) — Touch swipe/inertial carousel container (`_Carousel`) hosting UDC tiles
- **Example Archives (`Extra\`)**:
  - `LASAL SCREEN Advanced Examples.7z` — Contains `LASALScreenAdvancedExercise` and `LASALScreenAdvancedSolution` (with complete `Stations\Terminal\HMI\LSE_Project\LSE.lpr` and `Source\cppcode\` kernel sources).

### 1.6 `06 LASAL REMOTE SERVICES`
- **Root Path**: [06 LASAL REMOTE SERVICES](file:///C:/SigmaControl/01_Manuals/06%20LASAL%20REMOTE%20SERVICES)
- **Documents**:
  - Covers Remote Manager, VNC Server/Client configuration, and secure remote HMI tunneling.

### 1.7 `07 LASAL SAFETY`
- **Root Path**: [07 LASAL SAFETY](file:///C:/SigmaControl/01_Manuals/07%20LASAL%20SAFETY)
- **Documents**:
  - Covers SafetyDesigner, S-DIAS Safety CPUs (`SCP111`), safe FBD logic, and safe/non-safe HMI diagnostics (`SafetyDownload` Add-On).

---

## 2. Installed Official SIGMATEK CHM Documentation Databases

Decompiled and indexed from the local SIGMATEK installation into the converter documentation reference:

1. **LASAL SCREEN Help (`LASAL_SCREEN_EN.chm` & `LSE_Change_History_EN.chm`)**:
   - Path: `C:\Program Files (x86)\Sigmatek\Lasal\Screen\Help\LASAL_SCREEN_EN.chm`
   - Contains 156 HTML topics detailing every LSE editor dialog, object property (`Position`, `Color`, `Font`, `Frame`, `RefreshTime`, `Access`, `Server`, `Limits`, `Text`, `Image`, `Unit`, `Format`), FunctionBlock operator (`_INTER_NEU`), and compiler diagnostic code.
2. **LASAL VISUDesigner Help (`VISUDesigner_EN.chm`)**:
   - Path: `C:\Program Files\Sigmatek\Lasal\VISUDesigner\Help\VISUDesigner_EN.chm`
   - Contains 142 HTML topics detailing VISUDesigner project structure, Dashboards, Global Dashboards, Windows, ControlTemplates, Views, Datapoints, Schemes, Alarms, Menus, FunctionBlocks, CodeModules, and Python Scripting (`sigmatek.lasal.lvd`).
3. **LASAL VISURuntime Help (`VISURuntime_EN.chm`)**:
   - Path: `C:\Program Files\Sigmatek\Lasal\VISUDesigner\Help\VISURuntime_EN.chm`
   - Documents the HTML5/JS visualization runtime, `sig.*` JavaScript API (`@types/sig-api`), WebSocket LARS/OPC-UA communication, and browser deployment.
4. **LASAL CLASS 2 Help (`LASAL_CLASS_2_EN.chm`)**:
   - Path: `C:\Program Files (x86)\Sigmatek\Lasal\Class2\Help\LASAL_CLASS_2_EN.chm`
   - Documents Structured Text syntax, class/server headers, and OS interfaces.
