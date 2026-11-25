# LASAL HMI Converter — Documentation Suite

Welcome to the technical documentation for **LASAL HMI Converter**, a standalone Windows desktop engineering application for migrating SIGMATEK LASAL SCREEN (`.lpr`) projects into native SIGMATEK LASAL VISUDesigner (`.lvp`) projects.

## Documentation Index

1. [ARCHITECTURE.md](file:///C:/SigmaControl/docs/ARCHITECTURE.md) — System architecture, module responsibilities, data flow, and safety guarantees.
2. [EXISTING_REPOSITORY_ANALYSIS.md](file:///C:/SigmaControl/docs/EXISTING_REPOSITORY_ANALYSIS.md) — Audit of `Svel26/Lasal-MCP` (MIT License), reused automation patterns, newly engineered modules, and breakthroughs.
3. [MANUAL_INDEX.md](file:///C:/SigmaControl/docs/MANUAL_INDEX.md) — Complete index of all local SIGMATEK training manuals (`01_Manuals\01`–`07`) and installed CHM help files.
4. [MANUAL_TECHNICAL_REFERENCE.md](file:///C:/SigmaControl/docs/MANUAL_TECHNICAL_REFERENCE.md) — Detailed technical reference extracted from the SIGMATEK training manuals and runtime kernel specifications.
5. [API_REFERENCE.md](file:///C:/SigmaControl/docs/API_REFERENCE.md) — Verified `LASALScreen.tlb` v2.0 COM API, VISUDesigner Python 3.12 (`sigmatek.lasal.lvd`) API, and VISUDesigner JSON database encoding rules.
6. [OBJECT_MAPPING_REFERENCE.md](file:///C:/SigmaControl/docs/OBJECT_MAPPING_REFERENCE.md) — Complete mapping specification for all 24 LASAL SCREEN element types, project structures, schemes, and coordinate scaling modes.
7. [COMPATIBILITY_MATRIX.md](file:///C:/SigmaControl/docs/COMPATIBILITY_MATRIX.md) — Verified local software versions (`LASAL SCREEN 01.01.197`, `VISUDesigner 01.04.006.2890`, `LASAL CLASS 2 02.03.002`, `MachineManager 01.00.057`) and feature support matrix.
8. [CONVERSION_GUIDE.md](file:///C:/SigmaControl/docs/CONVERSION_GUIDE.md) — User and engineering guide for executing conversions via the WPF desktop UI or CLI tools.
9. [TESTING_GUIDE.md](file:///C:/SigmaControl/docs/TESTING_GUIDE.md) — Guide to the 6 xUnit test suites (`UnitTests`, `MappingTests`, `ComBridgeTests`, `VisuDesignerTests`, `IntegrationTests`, `RegressionTests`).
10. [KNOWN_LIMITATIONS.md](file:///C:/SigmaControl/docs/KNOWN_LIMITATIONS.md) — Documented engineering boundaries and fallback behaviors.

## Attribution & Licensing

- **Reference Foundation**: Portions of the COM and Python bridge patterns are adapted from [Svel26/Lasal-MCP](https://github.com/Svel26/Lasal-MCP), Copyright (c) 2025-2026 Sven Jansen and Lasal-MCP contributors, licensed under the **MIT License**.
- **SIGMATEK Trademarks**: LASAL, LASAL SCREEN, LASAL VISUDesigner, LASAL CLASS, and LARS are trademarks of SIGMATEK GmbH & Co KG. No proprietary SIGMATEK binaries or copyrighted manual texts are redistributed in this package.
