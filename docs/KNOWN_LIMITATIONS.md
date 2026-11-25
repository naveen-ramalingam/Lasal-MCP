# Known Limitations & Engineering Boundaries

Every limitation below has been verified against the installed SIGMATEK software (`LASAL SCREEN 01.01.197`, `LASAL VISUDesigner 01.04.006.2890`, `LASAL CLASS 2 02.03.002`) and training manuals (`04 LASAL SCREEN Basics`, `05 LASAL SCREEN Advanced`).

---

## 1. Custom PLC-Side C / Structured Text Drawing (`_MyIO`, `_ScrollArea2`, `_Screen`)

- **Technical Context**: In LASAL SCREEN Advanced (`05 LASAL SCREEN Advanced`, Ch. 3, 4, 6), developers can write custom PLC Structured Text (`ST`) or C classes derived from `_MyIO`, `_ScrollArea2`, or `_Screen` that call low-level pixel-drawing kernel routines (`_Grafix.Line`, `_Grafix.OutTextXY`, `_Grafix.Oval`, `_Grafix.Beam`, `out_zoom_BMP`, `add_carousel`) directly inside the PLC CPU's `Draw()` or `Line()` method.
- **Migration Behavior**:
  - When a screen element references a `Virtual Objectname` (`virtname`) backed by a custom `_MyIO` / `_ScrollArea2` / `_Screen` class:
    1. **Standard/Known Patterns** (such as `MyColorBar` UDC, `Indicator` analog gauge, `MyScrollList` table, `MyCarousel` carousel, `AlarmDisplay`, `DataAnalyzer`) are automatically mapped to their closest native VISUDesigner equivalents (`sigmatek.bar.levelIndicator`, `sigmatek.gauge.radial`, `sigmatek.table.simple`, `sigmatek.carousel.simple`, `sigmatek.alarm.table`, `sigmatek.chart.line`) with all bound datapoints and colors preserved.
    2. **Arbitrary Freehand Pixel Drawing** (such as custom touch crosshairs `InputMyIO` or freehand drawing pads `DataRecord` calling `_Grafix.GetImage`/`PutImage` in PLC code) cannot execute raw `_Grafix` pixel calls inside an HTML5 browser without custom JavaScript authoring. The converter places a bounded container/widget at the exact `(X, Y, Width, Height)` coordinates, generates a documented JavaScript stub in `CodeModules\CustomMyIoStubs.js` containing the extracted ST source methods as structured reference comments, and logs a **Manual Review Required** item in Section 9 & 16 of the Conversion Report.

## 2. Custom Unit Conversion Formulas (`50..255` in `_Global::IF_Recalculate`)

- **Technical Context**: Standard LASAL SCREEN unit formulas (`0..49`) define linear scaling factors and offsets stored in `LS0011.MPC`. Custom formula IDs `50..255` are evaluated in PLC Structured Text inside `_Global::IF_Recalculate` (`05 LASAL SCREEN Advanced`, Ch. 2, pp. 16–21).
- **Migration Behavior**:
  - Standard formulas (`0..49`) are migrated directly into `Units\Units.json`.
  - When a custom formula (`50..255`) is detected and a companion LASAL CLASS 2 `.lcp` project is provided, the converter extracts the `IF_Recalculate` ST case branch into a JavaScript helper function in `CodeModules\MigratedLogic.js` and flags the unit in the Conversion Report.

## 3. LARS Local Simulation Runtime

- **Technical Context**: `C:\Program Files (x86)\Sigmatek\Lars\Lars.exe` is not installed on this machine.
- **Migration Behavior**:
  - The converter detects LARS absence gracefully in `SoftwareEnvironmentDetector`.
  - All target projects are still configured with valid `StationType.LARS` (or `OPCUA`) stations, and visual/functional validation operates against the compiled `Publish\webroot` HTML5 bundle and high-precision layout renderer without requiring a live LARS PLC process.

## 4. `LSE_Modeless.exe` 260-Character `MAX_PATH` Limit & Single-Instance Behavior

- **Technical Context**: `LSE_Modeless.exe` (`01.01.197`) is a 32-bit MFC90 executable that fails or hangs when opening `.lpr` paths whose internal files exceed 260 characters (`MAX_PATH`), and `VISUDesigner.exe` (`01.04.006.2890`) cannot run concurrent `--script` instances on the same project.
- **Mitigation Implemented**:
  - `StagingManager` automatically stages every source `.lpr` project into a short temporary path (`%TEMP%\lse_<shortId>\`, `< 65` chars) before invoking COM automation.
  - `VisuDesignerPythonBridge` serializes all `VISUDesigner.exe --script` invocations using an inter-process semaphore.
