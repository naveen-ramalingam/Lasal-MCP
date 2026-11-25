# BUILD STATUS — LASAL HMI CONVERTER

**Build Date**: 2026-11-16
**Solution**: `C:\SigmaControl\LASAL.HMI.Converter.sln`
**Target Framework**: `.NET 9.0` (`net9.0` / `net9.0-windows` WPF App)
**Configuration**: `Release` (`win-x64`)

## 1. Solution Build & Publish Status

| Component | Path | Status |
| :--- | :--- | :--- |
| Solution Build & Restore | `C:\SigmaControl\LASAL.HMI.Converter.sln` | **PASSED** (0 errors; transitive NuGet advisory warning `NU1902`/`NU1903` on `SixLabors.ImageSharp` 3.1.11 noted) |
| Desktop WPF Application | `C:\SigmaControl\release\LASAL.HMI.Converter.exe` | **PUBLISHED & SMOKE-TESTED** |
| Diagnostic CLI Tool | `C:\SigmaControl\release\tools\Diagnostic\LASAL.HMI.Converter.Diagnostic.exe` | **PUBLISHED & VERIFIED (Exit 0)** |
| ManualIndexer CLI Tool | `C:\SigmaControl\release\tools\ManualIndexer\LASAL.HMI.Converter.ManualIndexer.exe` | **PUBLISHED & VERIFIED (Exit 0)** |
| ProjectInspector CLI Tool | `C:\SigmaControl\release\tools\ProjectInspector\LASAL.HMI.Converter.ProjectInspector.exe` | **PUBLISHED & VERIFIED (Exit 0)** |
| Installation Guide PDF | `C:\SigmaControl\release\INSTALLATION_GUIDE.pdf` | **GENERATED (2,911 bytes, PDF 1.4)** |
| Documentation & Dependency Notice | `C:\SigmaControl\release\docs\`, `C:\SigmaControl\release\Dependencies\DEPENDENCIES.md` | **PACKAGED (Zero proprietary SIGMATEK binaries bundled)** |

## 2. Automated Verification (`dotnet test LASAL.HMI.Converter.sln -c Release -m:1`)

| Test Suite | Assembly | Passed | Failed | Skipped | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Unit Tests | `LASAL.HMI.Converter.UnitTests` | 9 | 0 | 0 | 1.86 s |
| Integration Tests | `LASAL.HMI.Converter.IntegrationTests` | 4 | 0 | 0 | 2.18 min |
| Mapping Tests | `LASAL.HMI.Converter.MappingTests` | 32 | 0 | 0 | 0.60 s |
| COM Bridge Tests | `LASAL.HMI.Converter.ComBridgeTests` | 2 | 0 | 0 | 7.06 s |
| VISUDesigner Tests | `LASAL.HMI.Converter.VisuDesignerTests` | 2 | 0 | 0 | 21.80 s |
| Regression Tests | `LASAL.HMI.Converter.RegressionTests` | 1 | 0 | 0 | 14.17 s |
| **Total** | **6 Test Assemblies** | **50** | **0** | **0** | **~3.0 min** |

## 3. Verified Target Environments

- **SIGMATEK LASAL SCREEN**: `01.01.197` (32-bit `LASALScreen.Application` COM bridge via SysWOW64 PowerShell STA)
- **SIGMATEK LASAL VISUDesigner**: `01.04.006.2890` (`110` installed native controls, Python `lvd` scripting API & `PublishProject`)
- **SIGMATEK LASAL CLASS 2**: `02.03.002`
- **SIGMATEK MachineManager**: `01.00.057`

## 4. End-to-End Sample Project Outputs

All four training projects in `C:\SigmaControl\examples\SampleSource\` converted, published to HTML5/JS (`Publish\webroot\index.html`), validated via OpenCV/structural checks, and documented with 17-section HTML/JSON/CSV/Excel reports under `C:\SigmaControl\examples\ExpectedOutput\`:

1. `2_PumpControlSolution`
2. `4_PumpControlSchemeSolution`
3. `5_ClassInputOutputSolution`
4. `LASALScreenAdvancedSolution`
