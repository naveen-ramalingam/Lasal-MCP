# LASAL HMI Converter — Known Limitations

See [docs/KNOWN_LIMITATIONS.md](file:///C:/SigmaControl/docs/KNOWN_LIMITATIONS.md) for the complete technical breakdown.

## Summary of Known Limitations

1. **Custom PLC-Side Pixel Drawing (`_MyIO::Draw`, `_ScrollArea2::Line`, `_Screen::S_Start`)**:
   - Known/standard UDC and template patterns (`MyColorBar`, `Indicator`, `MyScrollList`, `MyCarousel`, `AlarmDisplay`, `DataAnalyzer`) are automatically mapped to native `sigmatek.*` VISUDesigner controls (`sigmatek.bar.levelIndicator`, `sigmatek.gauge.radial`, `sigmatek.table.simple`, `sigmatek.carousel.simple`, `sigmatek.alarm.table`, `sigmatek.chart.line`).
   - Arbitrary freehand pixel drawing using low-level `_Grafix` PLC calls (e.g., `InputMyIO` touch crosshair or `DataRecord` freehand drawing pad) is mapped to a bounded container with a generated JavaScript reference stub in `CodeModules\CustomMyIoStubs.js` and flagged for manual review in the Conversion Report.
2. **Custom Unit Conversion Formulas (`50..255` in `_Global::IF_Recalculate`)**:
   - Standard formulas (`0..49`) are migrated directly into `Units\Units.json`. Custom ST formulas (`50..255`) are extracted into JavaScript helper functions in `CodeModules\MigratedLogic.js` and flagged for review.
3. **LARS Runtime Not Installed on Host**:
   - `C:\Program Files (x86)\Sigmatek\Lars\Lars.exe` is not installed on this workstation; validation uses the compiled VISUDesigner `Publish\webroot` HTML5 bundle and high-precision layout renderer.
4. **32-bit `LSE_Modeless.exe` `MAX_PATH` (260-Character) Limit**:
   - Mitigated automatically by staging a read-only copy of the source `.lpr` project into `%TEMP%\lse_<shortId>\` before COM extraction.
