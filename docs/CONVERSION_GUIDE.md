# LASAL HMI Converter — Conversion Guide

## 1. End-to-End Migration Workflow

**LASAL HMI Converter** automates the migration of SIGMATEK LASAL SCREEN (`.lpr`) projects to native SIGMATEK LASAL VISUDesigner (`.lvp`) projects in 6 structured steps:

1. **Step 1 — Select Source LASAL SCREEN Project (`.lpr`)**:
   - Browse to any existing `.lpr` project file (e.g., `LSE.lpr`).
   - The converter verifies file readability and records cryptographic SHA-256 checksums of all source files to guarantee that the original project is never altered.
2. **Step 2 — Optional LASAL CLASS 2 Project (`.lcp` / `.lsm` / `MaeExp.txt`)**:
   - Auto-detects or allows selection of the companion LASAL CLASS 2 `.lcp` / `.lsm` project (typically in `Stations\...\*.lcp` or root `*.lsm`) to enrich server data types, initial values, station IP addresses, and custom `_MyIO` / `_Global` / `_ScrollArea2` / `_Screen` companion class analysis.
3. **Step 3 — Select Target VISUDesigner Output Directory**:
   - Choose a clean output folder where the native `.lvp` project and its subdirectories (`Dashboards`, `GlobalDashboards`, `Window`, `ControlTemplate`, `Datapoints`, `Stations`, `Localization`, `Textlists`, `Schemes`, `Resources`, `Alarms`, `Menu`, `Functionblocks`, `CodeModules`, `View`, `Publish\webroot`) will be generated.
4. **Step 4 — Configure Conversion & Scaling Options**:
   - **Resolution Mode**: Keep 1:1 original panel resolution (e.g., `800x480`, `800x600`) or proportionally scale to a target panel resolution (`1024x768`, `1280x800`, `1920x1080`).
   - **Asset Processing**: Convert BMP transparent key colors (`#FF00FF` or custom RGB) to 32-bit RGBA PNGs.
   - **Publish Webroot**: Automatically invoke `lvd.PublishProject()` after generation to produce a deployable HTML5/JS visualization bundle (`Publish\webroot\index.html`).
5. **Step 5 — Inspect Source Inventory & Customize Mappings**:
   - Inspect all extracted Screens, Windows, Global Screen, Objects/UDCs, Servers/Datapoints, Text Lists, Languages, Images, Schemes, Alarms, and Function Blocks.
   - Override any default control mapping (`sigmatek.*`) or export/import custom JSON mapping templates.
6. **Step 6 — Execute Conversion, Validate & Export Reports**:
   - Run the conversion pipeline with real-time stage progress and live structured logs.
   - Inspect side-by-side visual layout comparisons and similarity scores in the **Validation** view.
   - Export the 17-section Conversion Report in **HTML**, **JSON**, **CSV**, or **Excel (`.xlsx`)** format.

---

## 2. Command-Line Tools Included

In addition to the WPF desktop application (`LASAL.HMI.Converter.exe`), three engineering CLI utilities are provided:
- **`LASAL.HMI.Converter.Diagnostic.exe`**: Verifies installed LASAL SCREEN, VISUDesigner, CLASS 2, MachineManager, COM registration, and Python 3.12 scripting readiness.
- **`LASAL.HMI.Converter.ProjectInspector.exe`**: Extracts a `.lpr` project into the versioned JSON Intermediate Representation (`ir.json`) and prints a complete structural summary.
- **`LASAL.HMI.Converter.ManualIndexer.exe`**: Indexes local SIGMATEK training manuals and CHM documentation.
