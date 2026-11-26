# Bobst HMI Conversion Fixes & Browser Preview Guide

This document summarizes the root-cause fixes implemented to convert SIGMATEK LASAL SCREEN projects (`Bobst_HMI_Screen_LSE.lpr`) into native, publishable SIGMATEK VISUDesigner (`.lvp`) HTML5 projects, and documents how to preview and verify the published `Publish/webroot` directly in a web browser without a live PLC dataservice.

---

## 1. Conversion & Publish Pipeline

The CLI converter (`tools/ProjectInspector`) builds an Intermediate Representation (IR) from the immutable source LASAL SCREEN project (`main-hmi-lse/`) and generates a complete VISUDesigner project (`main-hmi-visu/Bobst_HMI_Screen_LSE/`), then invokes VISUDesigner's Python API (`lvd.PublishProject(prj, False)`) to produce `Publish/webroot/`.

### Build & Run Commands

```powershell
# 1. Build/publish ProjectInspector (.NET 9 SDK)
& "$env:USERPROFILE\.dotnet\dotnet.exe" publish `
  C:\SigmaControl\tools\ProjectInspector\LASAL.HMI.Converter.ProjectInspector.csproj `
  -c Release -o C:\SigmaControl\release\tools\ProjectInspector --nologo -v minimal

# 2. Convert & publish to VISUDesigner (.lvp + Publish/webroot)
& "C:\SigmaControl\release\tools\ProjectInspector\LASAL.HMI.Converter.ProjectInspector.exe" `
  "C:\SigmaControl\main-hmi-lse\Bobst_HMI_Screen_LSE.lpr" `
  --convert "C:\SigmaControl\main-hmi-visu"

# Optional SVG conversion mode (default is 1:1 lossless transparent RGBA PNG)
# --svg-mode VTracer | AI | Hybrid
```

---

## 2. Root Causes & Fixes Applied

### A. Source Extraction & Multi-Language Parsing
- **Language table parsing (`MpcBinaryReader.cs`)**: Parsed `Runtime\LANGUAGE.TXT` formatted as `<lcid> <name>` (e.g., `3079 German (Austria)`), recovering all 12 languages and 49 TextLists.
- **Non-`LSE.MPC` root directory (`MpcBinaryReader.cs`, `LasalScreenProjectExtractor.cs`)**: Detected project-named root databases such as `Bobst_HM.MPC` instead of assuming `LSE.MPC`.
- **Fast binary extraction & isolation (`LasalScreenProjectExtractor.cs`, `LasalClass2ProjectParser.cs`)**: Skipped slow COM automation when a large (`> 2 MB`) project already contains a complete precompiled `Runtime\LS0001.MPC` + `LANGUAGE.TXT` database, and prevented `LasalClass2ProjectParser` from picking up unrelated `.lcp` test fixtures under `reference/`.

### B. 1:1 Lossless Image Extraction & Transparency
- **Authoritative `LS0003.MPC` bitmap decoding (`AssetMigrationService.cs`)**: Extracted all compiled bitmaps (including images missing from the source `Image\` folder) with exact per-image RGB565 transparency keys (`0xFFFF` white, `0x0000` black, `0xF81F` Magic Pink), `BMP_NO_TRANSPARENT` (`0x0004`), and `BMP_TURN` (`0x0001` vertical flip).
- **Border flood-fill transparency (`AssetMigrationService.cs`)**: Applied edge-seeded flood-fill for white/black transparency keys so exterior backgrounds become transparent while interior white/black details (e.g., text inside logos or warning icons) remain opaque.
- **Lossless PNG default + opt-in SVG (`SvgVectorizationService.cs`)**: Defaulted exported assets to 1:1 lossless RGBA PNGs to avoid vectorization artifacts on small raster HMI icons, while keeping `ISvgConverter` (`VTracerSvgConverter`, `AiVisionSvgConverter`) available via `--svg-mode`.

### C. VISUDesigner `PublishProject` Blockers & Scale
- **Symbol-named FunctionBlock collisions (`LogicMigrationService.cs`, `VisuDesignerProjectGenerator.cs`)**: FunctionBlocks named with symbols (e.g., `Key_<`, `Key_+`) previously collapsed onto the same sanitized name or left raw unsanitized references in `Window\Keyboard.json`, causing `lvd.PublishProject` to fail. Fixed with deterministic symbol mapping (`+` -> `_plus`, `<` -> `_lt`, etc.), index deduplication (`SanitizeUniqueFunctionBlockName`), and matching `fbLookup` references.
- **Unbound scheme properties (`VisuDesignerProjectGenerator.cs`)**: Controls referencing `ColorScheme` (`typeId=18`) or `MediaScheme` (`typeId=29`) without a bound scheme-input datapoint caused `PublishProject` to abort (`SchemeVariableUndefined`). Fixed by resolving each scheme's default palette color (`typeId=9`) or default media item (`typeId=15`) on controls while preserving all 491 definitions in `Schemes\*\*.json`.
- **Large project performance (`VisuDesignerProjectGenerator.cs`)**: Indexed referenced datapoints when total datapoints exceed `5,000` (167,239 in Bobst) and wrote `imagesCollection.json` directly when media items exceed `250`.
- **Start screen selection (`MpcBinaryReader.cs`, `VisuDesignerProjectGenerator.cs`)**: Prioritized `Main` (or `ScreenNumber == 0`) instead of index `0` (`JamTeach`) and ensured `View\Default.json` marks exactly one `isStartDashboard: true`.

### D. HTML5 Runtime Boot & Visual Fidelity
- **Runtime boot crash in `alarms.json` (`VisuDesignerProjectGenerator.cs`)**: Removed non-schema primitive fields (`alarmNumber`, `group`, `severity`, `datapoint`, `activeColor`) from `Alarms\Alarm.json`, which VISUDesigner serialized into `Publish\webroot\res\data\alarms.json` and crashed `runtime-bundle.js` at System Manager 17/19 (`TypeError: Cannot create property 'name' on number '49'`).
- **Button icon slots & gradients (`MpcBinaryReader.cs`, `VisuDesignerProjectGenerator.cs`)**:
  - Read all 7 `_BUTTONIMAGES` `uint16` slots (`image_release`, `image_press`, `image_sel_press`, `image_sel_release`, `image_in_press`, `image_in_release`, `image_describe`) plus `0xFFFE` button transparency.
  - Set `--theme-sig-control-button-background-color-stop` alongside background color so VISUDesigner's default blue gradient does not bleed through, and cleared VISUDesigner's default `1px` white button border (`--theme-sig-control-button-border-width: 0px`) on frameless, transparent-overlay, and image buttons.
- **Full `1024x768` canvas (`MpcBinaryReader.cs`)**: Expanded non-window screen dimensions to encompass all child control coordinates so bottom navigation bars (`y = 708..768`) are not clipped.
- **Nested `ControlTemplate`, `Object_N`, and `ObjectScheme` resolution (`MpcBinaryReader.cs`, `VisuDesignerProjectGenerator.cs`)**:
  - Resolved intra-library `Object_<N>` references inside `TryParseObjectLibrary` once all object labels are read.
  - Pre-allocated all `ControlTemplate` GUIDs and resolved `ObjectSchemeId` defaults so composite containers (`Login`, `b_BoxEdit`, `Main_Servo`, `Box_Options_by_Chosen`, bottom navigation bar) render their graphics.
- **Outline-only rectangle transparency (`MpcBinaryReader.cs`, `VisuDesignerProjectGenerator.cs`)**: Set `TransparentBackground = true` in `CreateRectangleControl` when `back == 0xFFFE` and preserved visible rectangle borders (`--theme-sig-control-rectangle-border-*`), fixing an opaque beige overlay that occluded inner controls on `#Box_Main/`.
- **Font sizes & tight labels (`MpcBinaryReader.cs`, `VisuDesignerProjectGenerator.cs`)**: Inferred pixel sizes from `LS0007.MPC` font names (`Tiny_7`, `Arial12`, `Arial48`, `LCD_36`, etc.), mapped text alignment, disabled `dolinebreak`, and zeroed padding on compact single-line labels (`<= 24px`).

---

## 3. Browser Access & Offline Preview Method

Opening `Publish\webroot\index.html` over `file://` or serving `Publish\webroot` alone with a basic static server will stall `<sig-dependency-loader>` for two reasons:

1. **Shared SIGMATEK `/rt/` runtime assets**: `Publish\webroot` references `/rt/default/dependencies.json`, `/rt/scripts/runtime-bundle.js`, `/rt/scripts/worker-bundle.js`, `/rt/node_modules/loadjs/dist/loadjs.min.js`, and runtime fonts, which live in the project's `Runtime\Runtime\` folder.
2. **PLC Dataservice WebSocket (`ws://localhost:9980`)**: Without a running PLC or DataService, `Publish\webroot\res\data\dsconfig.json` attempts to connect to `ws://localhost:9980` and blocks startup unless `offlinemode: true` is enabled.

### Local Preview Server Script

Save and run the following Python server (no external packages required) to mount `Publish\webroot` + `Runtime\Runtime` and enable VISUDesigner's native `offlinemode`:

```python
import http.server
import json
import os
import posixpath
import urllib.parse

WEBROOT = r"C:\SigmaControl\main-hmi-visu\Bobst_HMI_Screen_LSE\Publish\webroot"
RUNTIME = r"C:\SigmaControl\main-hmi-visu\Bobst_HMI_Screen_LSE\Runtime\Runtime"


class VisuPreviewHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path).path
        if parsed == "/res/data/dsconfig.json":
            body = json.dumps({
                "version": "2.0.0",
                "autoUrlDetection": False,
                "offlinemode": True,
            }).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def translate_path(self, path):
        parsed = urllib.parse.urlsplit(path).path
        clean = posixpath.normpath(urllib.parse.unquote(parsed)).lstrip("/")
        parts = [p for p in clean.split("/") if p and p not in (".", "..")]
        primary = os.path.join(WEBROOT, *parts) if parts else WEBROOT
        if os.path.exists(primary):
            return primary
        fallback = os.path.join(RUNTIME, *parts) if parts else RUNTIME
        if os.path.exists(fallback):
            return fallback
        return primary


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 8766), VisuPreviewHandler)
    print("Serving VISUDesigner offline preview on http://127.0.0.1:8766", flush=True)
    server.serve_forever()
```

### Navigating Screens in the Browser

- Start the server (`python serve_visu.py`) and open:
  - Start screen (`Main`): `http://127.0.0.1:8766/index.html`
- Once `<sig-app>` finishes initializing all 19 System Managers, switch screens directly via URL hash:
  - `http://127.0.0.1:8766/index.html#Main/`
  - `http://127.0.0.1:8766/index.html#Production/`
  - `http://127.0.0.1:8766/index.html#Box_Main/`
  - Any dashboard name from `main-hmi-visu/Bobst_HMI_Screen_LSE/Dashboards/*.json` (`#<DashboardName>/`)
- Recommended browser viewport: **`1280x960`** (or at least `1024x768` + header height) so the full `1024x768` HMI and bottom navigation bar display without clipping.
