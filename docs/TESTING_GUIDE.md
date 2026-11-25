# LASAL HMI Converter — Testing & Verification Guide

## 1. Test Suite Architecture (`tests/`)

All automated tests are implemented using **xUnit** (`dotnet test LASAL.HMI.Converter.sln`) and organized into six dedicated test projects:

1. **`tests/UnitTests` (`LASAL.HMI.Converter.UnitTests.csproj`)**:
   - Tests Intermediate Representation (`HmiIntermediateModel`) JSON serialization, deserialization, and schema validation.
   - Tests RGB565-to-CSS `#RRGGBB` color conversion accuracy.
   - Tests BMP transparent key color (`#FF00FF`) to RGBA PNG alpha conversion (`LASAL.HMI.Converter.Assets`).
   - Tests LSE FunctionBlock (`_INTER_NEU`) to JavaScript and VISUDesigner FunctionBlock translation (`LASAL.HMI.Converter.Logic`).
   - Tests 17-section HTML, JSON, CSV, and Excel (`.xlsx`) report generation (`LASAL.HMI.Converter.Reporting`).
2. **`tests/MappingTests` (`LASAL.HMI.Converter.MappingTests.csproj`)**:
   - Verifies mapping rules for all 20+ LASAL SCREEN element types (`_BUTTON`, `AS_NUMERIC`, `AS_ASCII`, `AS_CHKBOX`, `AS_RADIO`, `AS_BAR`, `AS_DATE`, `AS_TIME`, `AS_ENUMERATION`, `AS_THEURGE`, `AS_MENU`, `_RECTANGLE`, `_CIRCLE`, `_POLYGON`, `_PICTEXT`, `_MOTION`, `_OBJECT`, `_AlarmDisplay`, `_Graph`, `_ScrollArea2`, `_Carousel`) to native `sigmatek.*` VISUDesigner controls.
   - Tests 1:1 coordinate preservation and proportional resolution scaling (`800x480` -> `1280x800` / `1920x1080`).
   - Tests VISUDesigner property value encoding rules (double-encoded primitives, single-encoded complex objects, raw CSS hex colors).
3. **`tests/ComBridgeTests` (`LASAL.HMI.Converter.ComBridgeTests.csproj`)**:
   - Verifies 32-bit PowerShell STA execution, COM registration detection (`LASALScreen.Application`), short-path `MAX_PATH` staging, live `.lpr` opening, `ExportServerlist`, and unlocked headless XML export (`ExportLanguagesToXML` + `ExportTextListsToXML` + `AddContainerInfo` + `ExportToXML`).
4. **`tests/VisuDesignerTests` (`LASAL.HMI.Converter.VisuDesignerTests.csproj`)**:
   - Verifies live `VISUDesigner.exe --script` execution (`lvd.CreateProject`, `AddLanguages`, `AddTextLists`, `AddTexts`, `CreateStation`, `UpdateComponentProperties`, `SynchronizeLogicElements`, `UpdatePropertyValues`, `SaveProject`, `PublishProject`, `CloseProject`).
5. **`tests/IntegrationTests` (`LASAL.HMI.Converter.IntegrationTests.csproj`)**:
   - Executes full end-to-end conversions of real SIGMATEK LASAL SCREEN projects (`2_PumpControlSolution`, `4_PumpControlSchemeSolution`, `5_ClassInputOutputSolution`, `LASALScreenAdvancedSolution`) from `examples/SampleSource/` into `examples/ExpectedOutput/`.
   - Verifies that every generated `.lvp` project opens cleanly in VISUDesigner, publishes to `Publish\webroot\index.html`, and passes structural and visual validation.
6. **`tests/RegressionTests` (`LASAL.HMI.Converter.RegressionTests.csproj`)**:
   - Verifies source project immutability (pre/post SHA-256 checksums of all source files).
   - Verifies deterministic Intermediate Representation and report outputs across repeated runs.

---

## 2. Running the Test Suite

```powershell
C:\Users\AMSI_Tech\.dotnet\dotnet.exe test C:\SigmaControl\LASAL.HMI.Converter.sln --configuration Release --logger "console;verbosity=normal"
```
