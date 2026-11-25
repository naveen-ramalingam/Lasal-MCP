using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using LASAL.HMI.Converter.Assets;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;

namespace LASAL.HMI.Converter.Source.LASALScreen;

/// <summary>
/// Byte-exact parser for SIGMATEK LASAL SCREEN compiled Runtime\*.MPC files (COMPILER_VERSION 59/60),
/// implemented directly against the official LASAL SCREEN C++ runtime kernel specifications
/// (T_file.cpp, T_prj.cpp, T_picpic.cpp, T_picsub.cpp, T_varia.cpp, T_schema.cpp, T_ibxlst.cpp, T_stack.cpp).
/// </summary>
public sealed class MpcBinaryReader
{
    public const int MpcHeaderSize = 128;

    public void ParseRuntimeDirectory(string runtimeDir, HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        if (!Directory.Exists(runtimeDir))
        {
            return;
        }

        // 1. Parse Color Palette (LS0017.MPC)
        var paletteFile = Path.Combine(runtimeDir, "LS0017.MPC");
        if (File.Exists(paletteFile))
        {
            TryParsePalette(paletteFile, model);
        }

        // 2. Parse Image List (LS0003.MPC) for symbol names
        var imageSymbols = new List<string>();
        var bmpListFile = Path.Combine(runtimeDir, "LS0003.MPC");
        if (File.Exists(bmpListFile))
        {
            imageSymbols = TryParseImageList(bmpListFile);
        }

        // 3. Parse Font List (LS0007.MPC)
        var fontFile = Path.Combine(runtimeDir, "LS0007.MPC");
        if (File.Exists(fontFile))
        {
            TryParseFontList(fontFile, model);
        }

        // 4. Parse Variable / Server List (LS0001.MPC)
        var varListFile = Path.Combine(runtimeDir, "LS0001.MPC");
        if (File.Exists(varListFile))
        {
            TryParseVarList(varListFile, model);
        }

        // 5. Parse Function Blocks (LS0004.MPC)
        var funcListFile = Path.Combine(runtimeDir, "LS0004.MPC");
        if (File.Exists(funcListFile))
        {
            TryParseFunctionBlockList(funcListFile, model);
        }

        // 6. Parse Standard Schemes (LS0006, LS0009, LS0010, LS0011, LS0012, LS0013, LS0015, LS0019)
        TryParseStandardSchemeFile(Path.Combine(runtimeDir, "LS0006.MPC"), "Color", inclusivLink: true, value4Byte: false, imageSymbols, model);
        TryParseStandardSchemeFile(Path.Combine(runtimeDir, "LS0009.MPC"), "Image", inclusivLink: false, value4Byte: false, imageSymbols, model);
        TryParseStandardSchemeFile(Path.Combine(runtimeDir, "LS0010.MPC"), "Unit", inclusivLink: true, value4Byte: false, imageSymbols, model);
        TryParseStandardSchemeFile(Path.Combine(runtimeDir, "LS0015.MPC"), "Object", inclusivLink: false, value4Byte: false, imageSymbols, model);
        TryParseStandardSchemeFile(Path.Combine(runtimeDir, "LS0019.MPC"), "Server", inclusivLink: true, value4Byte: true, imageSymbols, model);

        // 7. Parse Text Schemes (LS0014.MPC)
        var txtSchemeFile = Path.Combine(runtimeDir, "LS0014.MPC");
        if (File.Exists(txtSchemeFile))
        {
            TryParseTextSchemeFile(txtSchemeFile, model);
        }

        // 8. Parse Alarms (LS0000.MPC)
        var alarmFile = Path.Combine(runtimeDir, "LS0000.MPC");
        if (File.Exists(alarmFile))
        {
            TryParseAlarmFile(alarmFile, model);
        }

        // 9. Parse Menus (LS0005.MPC)
        var menuFile = Path.Combine(runtimeDir, "LS0005.MPC");
        if (File.Exists(menuFile))
        {
            TryParseMenuFile(menuFile, model);
        }

        // 10. Parse Language <LCID>.MPC files if XML export was not used or to enrich TextLists
        var langTxtPath = Path.Combine(runtimeDir, "LANGUAGE.TXT");
        if (File.Exists(langTxtPath))
        {
            TryParseLanguageMpcFiles(runtimeDir, langTxtPath, model);
        }

        // 11. Parse Project Directory Table (LSE.MPC or <ProjectPrefix>.MPC)
        var lseMpcEntries = new List<PrjEntryRecord>();
        var lseMpcPath = Path.Combine(runtimeDir, "LSE.MPC");
        if (!File.Exists(lseMpcPath))
        {
            var customRootMpc = Directory.GetFiles(runtimeDir, "*.MPC")
                .FirstOrDefault(f =>
                {
                    var fn = Path.GetFileNameWithoutExtension(f);
                    return !fn.StartsWith("LS", StringComparison.OrdinalIgnoreCase) &&
                           !fn.StartsWith("LC", StringComparison.OrdinalIgnoreCase) &&
                           !fn.StartsWith("LW", StringComparison.OrdinalIgnoreCase) &&
                           !fn.StartsWith("GS", StringComparison.OrdinalIgnoreCase) &&
                           !int.TryParse(fn, out _);
                });
            if (!string.IsNullOrEmpty(customRootMpc))
            {
                lseMpcPath = customRootMpc;
            }
        }
        if (File.Exists(lseMpcPath))
        {
            lseMpcEntries = TryParseLseMpc(lseMpcPath, model);
        }

        // 12. Parse Reusable Objects (LS0002.MPC)
        var objListPath = Path.Combine(runtimeDir, "LS0002.MPC");
        if (File.Exists(objListPath))
        {
            TryParseObjectList(objListPath, imageSymbols, model);
        }

        // 13. Parse Global Screen (GS0000.MPC)
        var gsPath = Path.Combine(runtimeDir, "GS0000.MPC");
        if (File.Exists(gsPath))
        {
            var gsScreen = TryParsePictureMpc(gsPath, 0, isWindow: false, isGlobalScreen: true, imageSymbols, model);
            if (gsScreen != null)
            {
                model.GlobalScreen = gsScreen;
                model.ProjectMetadata.GlobalScreenName = gsScreen.Name;
            }
        }

        // 14. Parse Screens (LC*.MPC) and Windows (LW*.MPC)
        var parsedScreenFiles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var entry in lseMpcEntries)
        {
            if (entry.FType == 10 || entry.FType == 11) // _PE_PICTURE (10) or _PE_WINDOW (11)
            {
                var filePath = Path.Combine(runtimeDir, entry.FileName);
                if (File.Exists(filePath) && parsedScreenFiles.Add(entry.FileName))
                {
                    var isWin = entry.FType == 11;
                    var scr = TryParsePictureMpc(filePath, entry.No, isWindow: isWin, isGlobalScreen: false, imageSymbols, model);
                    if (scr != null)
                    {
                        MergeOrAddScreen(scr, isWin ? model.Windows : model.Screens);
                    }
                }
            }
        }

        // Also scan any LC*.MPC / LW*.MPC files not already visited
        foreach (var lcFile in Directory.GetFiles(runtimeDir, "LC*.MPC"))
        {
            var fn = Path.GetFileName(lcFile);
            if (parsedScreenFiles.Add(fn))
            {
                var num = ParseTrailingNumber(Path.GetFileNameWithoutExtension(fn)[2..]);
                var scr = TryParsePictureMpc(lcFile, num, isWindow: false, isGlobalScreen: false, imageSymbols, model);
                if (scr != null)
                {
                    MergeOrAddScreen(scr, model.Screens);
                }
            }
        }

        foreach (var lwFile in Directory.GetFiles(runtimeDir, "LW*.MPC"))
        {
            var fn = Path.GetFileName(lwFile);
            if (parsedScreenFiles.Add(fn))
            {
                var num = ParseTrailingNumber(Path.GetFileNameWithoutExtension(fn)[2..]);
                var scr = TryParsePictureMpc(lwFile, num, isWindow: true, isGlobalScreen: false, imageSymbols, model);
                if (scr != null)
                {
                    MergeOrAddScreen(scr, model.Windows);
                }
            }
        }

        // Update project resolution from screens if detected
        if (model.Screens.Count > 0)
        {
            var first = model.Screens[0];
            if (first.Width > 0 && first.Height > 0)
            {
                model.ProjectMetadata.ResolutionWidth = first.Width;
                model.ProjectMetadata.ResolutionHeight = first.Height;
            }
            if (string.IsNullOrEmpty(model.ProjectMetadata.StartScreenName))
            {
                model.ProjectMetadata.StartScreenName = first.Name;
                model.ProjectMetadata.StartScreenNumber = first.ScreenNumber;
            }
        }
    }

    private static void MergeOrAddScreen(ScreenModel parsed, List<ScreenModel> targetList)
    {
        var existing = targetList.Find(s =>
            string.Equals(s.Name, parsed.Name, StringComparison.OrdinalIgnoreCase) ||
            (s.ScreenNumber == parsed.ScreenNumber && s.Controls.Count == 0));

        if (existing != null)
        {
            existing.ScreenNumber = parsed.ScreenNumber;
            existing.MpcFileName = parsed.MpcFileName;
            existing.Width = parsed.Width;
            existing.Height = parsed.Height;
            existing.BackgroundColorHex = parsed.BackgroundColorHex;
            existing.IncludeGlobalScreen = parsed.IncludeGlobalScreen;
            if (parsed.Controls.Count > 0)
            {
                existing.Controls = parsed.Controls;
            }
        }
        else
        {
            targetList.Add(parsed);
        }
    }

    private static bool TryReadMpcHeader(BinaryReader br, out uint mpcVer, out string headerName)
    {
        mpcVer = 60;
        headerName = string.Empty;
        if (br.BaseStream.Length < MpcHeaderSize)
        {
            return false;
        }

        var head = br.ReadBytes(MpcHeaderSize);
        if (head[6] != (byte)'s' || head[16] != (byte)'o' || head[18] != (byte)'w')
        {
            return false;
        }

        mpcVer = BitConverter.ToUInt32(head, 24);

        // Extract null-terminated ASCII name at offset 80..111 if not 0xFF
        if (head[80] != 0xFF && head[80] != 0x00)
        {
            var len = 0;
            while (len < 32 && head[80 + len] != 0x00 && head[80 + len] != 0xFF)
            {
                len++;
            }
            headerName = Encoding.Latin1.GetString(head, 80, len).Trim();
        }

        return true;
    }

    private static List<PrjEntryRecord> TryParseLseMpc(string filePath, HmiIntermediateModel model)
    {
        var entries = new List<PrjEntryRecord>();
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out var mpcVer, out _))
            {
                return entries;
            }

            model.ProjectMetadata.LseCompilerVersion = (int)mpcVer;
            var totalNo = br.ReadUInt16();
            var noStatic = br.ReadUInt16();

            for (var i = 0; i < totalNo; i++)
            {
                var ftype = br.ReadUInt16();
                var no = br.ReadUInt16();
                SkipChkBit(br);
                var nameBytes = br.ReadBytes(13);
                var nameLen = Array.IndexOf(nameBytes, (byte)0);
                if (nameLen < 0) nameLen = 13;
                var fileName = Encoding.Latin1.GetString(nameBytes, 0, nameLen).Trim();
                SkipAnyPara(br);
                _ = br.ReadUInt16(); // access
                _ = br.ReadUInt16(); // nextno
                _ = br.ReadUInt16(); // imageno
                _ = br.ReadByte();   // refcyc

                entries.Add(new PrjEntryRecord(ftype, no, fileName));
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LSE.MPC: {ex.Message}");
        }
        return entries;
    }

    private static void TryParsePalette(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var count = br.ReadUInt32();
            if (count > 1024) count = 256;
            var rgbBytes = br.ReadBytes((int)(count * 3));
            var names = TryReadAsciiBuffer(br);

            model.ColorPalette.Clear();
            for (var i = 0; i < count; i++)
            {
                var r = rgbBytes[i * 3];
                var g = rgbBytes[i * 3 + 1];
                var b = rgbBytes[i * 3 + 2];
                var rgb565 = (ushort)(((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3));
                model.ColorPalette.Add(new ColorPaletteEntryModel
                {
                    Index = i,
                    Name = i < names.Count ? names[i] : $"Color_{i}",
                    Rgb565 = rgb565,
                    CssHex = $"#{r:X2}{g:X2}{b:X2}"
                });
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0017.MPC palette: {ex.Message}");
        }
    }

    private static List<string> TryParseImageList(string filePath)
    {
        var labels = new List<string>();
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return labels;
            }

            var singleImage = br.ReadUInt16();
            if (singleImage == 0)
            {
                var no = br.ReadUInt16();
                for (var i = 0; i < no; i++)
                {
                    var datano = br.ReadUInt32();
                    _ = br.ReadUInt16(); // width
                    _ = br.ReadUInt16(); // height
                    _ = br.ReadUInt16(); // transparent
                    var state = br.ReadUInt16();
                    var bytesPerPacket = (state & 0x0008) != 0 ? 2 : 3;
                    br.BaseStream.Seek(datano * bytesPerPacket, SeekOrigin.Current);
                }
            }
            else
            {
                _ = TryReadAsciiBuffer(br);
            }

            labels = TryReadAsciiBuffer(br);
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0003.MPC image list: {ex.Message}");
        }
        return labels;
    }

    private static void TryParseFontList(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var fontFiles = TryReadAsciiBuffer(br);
            var attrCount = br.ReadUInt16();
            var attrs = new uint[attrCount];
            for (var i = 0; i < attrCount; i++)
            {
                attrs[i] = br.ReadUInt32();
            }
            var labels = TryReadAsciiBuffer(br);

            var count = Math.Max(fontFiles.Count, labels.Count);
            for (var i = 0; i < count; i++)
            {
                var name = i < labels.Count && !string.IsNullOrWhiteSpace(labels[i])
                    ? labels[i]
                    : (i < fontFiles.Count ? Path.GetFileNameWithoutExtension(fontFiles[i]) : $"Font_{i}");

                if (model.FontStyles.Exists(f => string.Equals(f.Id, name, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                var attr = i < attrs.Length ? attrs[i] : 0u;
                model.FontStyles.Add(new FontStyleModel
                {
                    Id = name,
                    Index = i,
                    FamilyName = "Arial",
                    SizePx = 14,
                    Bold = (attr & 0x0400) != 0,
                    Italic = (attr & 0x0800) != 0,
                    Underline = (attr & 0x1000) != 0
                });
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0007.MPC font list: {ex.Message}");
        }
    }

    private static void TryParseVarList(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out var mpcVer, out _))
            {
                return;
            }

            var varCount = br.ReadUInt32();
            if (varCount == 0 || varCount > 200000)
            {
                return;
            }

            var rawVars = new List<RawVarInfo>((int)varCount);
            for (var i = 0; i < varCount; i++)
            {
                var vartypeRaw = br.ReadUInt16();
                var vartype = (byte)(vartypeRaw & 0x3F);
                var classId = br.ReadUInt32();
                var (loLim, hiLim) = ReadHiLoLim(br);
                var data = br.ReadBytes(17);
                var accessNo = BitConverter.ToUInt16(data, 2);
                var format = BitConverter.ToUInt16(data, 4);
                var station = data[6];
                var funit = BitConverter.ToUInt16(data, 8);
                var refTime = BitConverter.ToUInt16(data, 15);

                // Read 4 _ANYPARA records (xmemtext)
                for (var t = 0; t < 4; t++)
                {
                    SkipAnyPara(br);
                }

                var data2 = br.ReadBytes(14);
                var funitScheme = BitConverter.ToUInt16(data2, 0);
                var crc32 = BitConverter.ToUInt32(data2, 8);

                SkipChkBit(br); // xxchkbit (3 bytes)

                var linkVlCount = br.ReadUInt16();
                for (var l = 0; l < linkVlCount; l++)
                {
                    _ = br.ReadByte(); // info
                    SkipVarLabel(br);
                }

                _ = br.ReadByte();   // physic
                _ = br.ReadUInt32(); // hostname
                if (mpcVer >= 60)
                {
                    _ = br.ReadInt32(); // memberoffset
                }

                rawVars.Add(new RawVarInfo(
                    i, vartype, classId, loLim, hiLim, accessNo, format, station, funit, funitScheme, refTime, crc32));
            }

            var parentScopes = new uint[varCount];
            for (var i = 0; i < varCount; i++)
            {
                parentScopes[i] = br.ReadUInt32();
            }

            var labels = TryReadTextBufferStrings(br);

            // Reconstruct hierarchical symbol names using parentScopes
            string ResolveFullPath(int idx, int depth = 0)
            {
                if (idx < 0 || idx >= labels.Count || depth > 8)
                {
                    return idx >= 0 && idx < labels.Count ? labels[idx] : $"Var_{idx}";
                }
                var token = labels[idx];
                var scope = parentScopes[idx];
                if (scope != 0xFFFFFFFF && scope < varCount && scope != idx)
                {
                    return $"{ResolveFullPath((int)scope, depth + 1)}.{token}";
                }
                return token;
            }

            var existingByVarNo = new Dictionary<int, DatapointModel>();
            foreach (var d in model.Datapoints)
            {
                existingByVarNo[d.VarNo] = d;
            }

            var discoveredStations = new HashSet<int>();

            for (var i = 0; i < varCount; i++)
            {
                var rv = rawVars[i];
                var fullSymbol = ResolveFullPath(i);
                var parts = fullSymbol.Split('.');
                var objName = parts.Length > 1 ? string.Join(".", parts[..^1]) : string.Empty;
                var srvName = parts[^1];

                var (lseTypeStr, plcTypeStr, visuTypeStr) = MapVarType(rv.VarType);
                discoveredStations.Add(rv.Station);

                var dp = new DatapointModel
                {
                    Id = fullSymbol,
                    VarNo = i,
                    SymbolPath = fullSymbol,
                    ObjectName = objName,
                    ServerName = srvName,
                    StationNumber = rv.Station,
                    StationName = $"Station_{rv.Station}",
                    LseVarType = lseTypeStr,
                    PlcDataType = plcTypeStr,
                    VisuDataType = visuTypeStr,
                    RefreshTimeMs = rv.RefTime > 0 ? rv.RefTime : 250,
                    AccessLevel = rv.AccessNo,
                    MinLimit = rv.LoLim,
                    MaxLimit = rv.HiLim,
                    UnitId = rv.FUnit != 0xFFFF && rv.FUnit != 0xFF ? $"Unit_{rv.FUnit}" : null,
                    UnitSchemeId = rv.FUnitScheme != 0xFFFF ? $"UnitScheme_{rv.FUnitScheme}" : null,
                    Crc32 = rv.Crc32
                };

                if (existingByVarNo.TryGetValue(i, out var prev))
                {
                    var idx = model.Datapoints.IndexOf(prev);
                    if (idx >= 0) model.Datapoints[idx] = dp;
                }
                else
                {
                    model.Datapoints.Add(dp);
                }
            }

            foreach (var stNum in discoveredStations)
            {
                if (!model.Stations.Exists(s => s.StationNumber == stNum))
                {
                    model.Stations.Add(new StationModel
                    {
                        StationNumber = stNum,
                        Name = $"Station_{stNum}",
                        StationType = "LARS",
                        Address = "127.0.0.1:1954"
                    });
                }
            }

            // Skip typedummy _VARBLOCK (no=0)
            var typeDummyCount = br.ReadUInt32();
            if (typeDummyCount == 0)
            {
                _ = TryReadTextBufferStrings(br);
            }

            // Read MemUnit if at valid position
            if (br.BaseStream.Position + 2 <= br.BaseStream.Length && typeDummyCount == 0)
            {
                var unitCount = br.ReadUInt16();
                var rawUnits = new List<(byte Formula, int Digits)>();
                for (var u = 0; u < unitCount; u++)
                {
                    var xdigits = ReadVarLabelFirstInt(br);
                    _ = ReadVarLabelFirstInt(br); // posdezpt
                    var formula = br.ReadByte();
                    _ = ReadVarLabelFirstInt(br); // parameter
                    _ = br.ReadByte(); // fixdp
                    SkipAnyPara(br);
                    if (mpcVer >= 60)
                    {
                        _ = br.ReadByte(); // leading0
                    }
                    rawUnits.Add((formula, xdigits ?? 0));
                }

                var unitLabels = TryReadAsciiBuffer(br);
                for (var u = 0; u < rawUnits.Count; u++)
                {
                    var uName = u < unitLabels.Count && !string.IsNullOrWhiteSpace(unitLabels[u])
                        ? unitLabels[u]
                        : $"Unit_{u}";
                    model.Units.Add(new UnitModel
                    {
                        Id = $"Unit_{u}",
                        Index = u,
                        Name = uName,
                        Symbol = uName,
                        FormulaNumber = rawUnits[u].Formula,
                        DecimalPlaces = Math.Clamp(rawUnits[u].Digits, 0, 6)
                    });
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0001.MPC VarList: {ex.Message}");
        }
    }

    private static void TryParseFunctionBlockList(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var fbCount = br.ReadUInt32();
            if (fbCount > 10000) return;

            var fbs = new List<FunctionBlockModel>((int)fbCount);
            for (var i = 0; i < fbCount; i++)
            {
                var lineCount = br.ReadUInt16();
                var fb = new FunctionBlockModel
                {
                    Id = $"FB_{i}",
                    Index = i,
                    Name = $"FunctionBlock_{i}"
                };

                for (var l = 0; l < lineCount; l++)
                {
                    var cmd = br.ReadUInt16();
                    var opCount = GetCommandOperandCount(cmd);
                    int? op1Var = null, op1Const = null, op2Var = null, op2Const = null;
                    if (opCount >= 1)
                    {
                        (op1Var, op1Const) = ReadVarLabelTarget(br);
                    }
                    if (opCount >= 2)
                    {
                        (op2Var, op2Const) = ReadVarLabelTarget(br);
                    }

                    fb.Steps.Add(new FunctionBlockStepModel
                    {
                        Opcode = MapPicCommandName(cmd),
                        CommandCode = MapPicCommandName(cmd),
                        Input1DatapointId = ResolveVarNoToSymbol(op1Var, model),
                        Input1Constant = op1Const,
                        Input2DatapointId = ResolveVarNoToSymbol(op2Var, model),
                        Input2Constant = op2Const,
                        Output1DatapointId = ResolveVarNoToSymbol(op1Var, model),
                        CommandArg = op1Const ?? op1Var
                    });
                }
                fbs.Add(fb);
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < fbs.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    fbs[i].Name = labels[i];
                    fbs[i].Id = labels[i];
                }
                model.FunctionBlocks.Add(fbs[i]);
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0004.MPC FunctionBlocks: {ex.Message}");
        }
    }

    private static void TryParseStandardSchemeFile(
        string filePath,
        string schemeType,
        bool inclusivLink,
        bool value4Byte,
        List<string> imageSymbols,
        HmiIntermediateModel model)
    {
        if (!File.Exists(filePath))
        {
            return;
        }

        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var count = br.ReadUInt16();
            var schemes = new List<SchemeModel>(count);
            for (var i = 0; i < count; i++)
            {
                if (inclusivLink)
                {
                    SkipVarLabel(br);
                }

                var noLines = br.ReadUInt16();
                var sch = new SchemeModel
                {
                    Id = $"{schemeType}Scheme_{i}",
                    Name = $"{schemeType}Scheme_{i}",
                    SchemeType = schemeType
                };

                for (var l = 0; l < noLines; l++)
                {
                    var (uptoVar, uptoConst) = ReadVarLabelTarget(br);
                    var op = br.ReadByte();
                    var val = value4Byte ? br.ReadUInt32() : br.ReadUInt16();

                    var resultStr = val.ToString();
                    if (schemeType == "Image" && val < imageSymbols.Count)
                    {
                        resultStr = Path.GetFileNameWithoutExtension(imageSymbols[(int)val]) + ".png";
                    }
                    else if (schemeType == "Color")
                    {
                        resultStr = AssetMigrationService.ConvertRgb565ToCssHex((ushort)(val & 0xFFFF));
                    }
                    else if (schemeType == "Server")
                    {
                        resultStr = ResolveVarNoToSymbol((int)val, model) ?? $"Var_{val}";
                    }

                    sch.Entries.Add(new SchemeEntryModel
                    {
                        Operator = MapSchemeOperator(op),
                        CompareValue = uptoConst ?? 0,
                        CompareDatapointId = ResolveVarNoToSymbol(uptoVar, model),
                        ResultValue = resultStr
                    });
                }

                if (sch.Entries.Count > 0)
                {
                    sch.DefaultValue = sch.Entries[0].ResultValue;
                }
                schemes.Add(sch);
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < schemes.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    schemes[i].Name = labels[i];
                    schemes[i].Id = labels[i];
                }
                if (!model.Schemes.Exists(s => string.Equals(s.Id, schemes[i].Id, StringComparison.OrdinalIgnoreCase) && s.SchemeType == schemeType))
                {
                    model.Schemes.Add(schemes[i]);
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading scheme file '{Path.GetFileName(filePath)}': {ex.Message}");
        }
    }

    private static void TryParseTextSchemeFile(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var count = br.ReadUInt16();
            var schemes = new List<SchemeModel>(count);
            for (var i = 0; i < count; i++)
            {
                var noLines = br.ReadUInt16();
                var sch = new SchemeModel
                {
                    Id = $"TextScheme_{i}",
                    Name = $"TextScheme_{i}",
                    SchemeType = "Text"
                };

                for (var l = 0; l < noLines; l++)
                {
                    var (uptoVar, uptoConst) = ReadVarLabelTarget(br);
                    var op = br.ReadByte();
                    var (listNo, entryNo) = ReadAnyParaTextRef(br);
                    sch.Entries.Add(new SchemeEntryModel
                    {
                        Operator = MapSchemeOperator(op),
                        CompareValue = uptoConst ?? 0,
                        CompareDatapointId = ResolveVarNoToSymbol(uptoVar, model),
                        ResultValue = $"{listNo}:{entryNo}"
                    });
                }

                if (sch.Entries.Count > 0)
                {
                    sch.DefaultValue = sch.Entries[0].ResultValue;
                }
                schemes.Add(sch);
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < schemes.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    schemes[i].Name = labels[i];
                    schemes[i].Id = labels[i];
                }
                if (!model.Schemes.Exists(s => string.Equals(s.Id, schemes[i].Id, StringComparison.OrdinalIgnoreCase) && s.SchemeType == "Text"))
                {
                    model.Schemes.Add(schemes[i]);
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0014.MPC TextSchemes: {ex.Message}");
        }
    }

    private static void TryParseAlarmFile(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var no = br.ReadUInt16();
            var alarms = new List<AlarmModel>(no);
            for (var i = 0; i < no; i++)
            {
                var lno = br.ReadUInt16();
                int? mainVar = null;
                var paramVars = new List<string>();
                for (var j = 0; j < lno; j++)
                {
                    var (vNo, _) = ReadVarLabelTarget(br);
                    if (j == 0)
                    {
                        mainVar = vNo;
                    }
                    else if (vNo.HasValue)
                    {
                        var sym = ResolveVarNoToSymbol(vNo, model);
                        if (!string.IsNullOrEmpty(sym)) paramVars.Add(sym);
                    }
                }

                var priority = br.ReadUInt16();
                SkipChkBit(br);
                var group = br.ReadUInt16();
                var userConfig = br.ReadUInt16();
                var activeCol = br.ReadUInt32();
                _ = br.ReadUInt32(); // passive
                _ = br.ReadUInt32(); // quit_active
                _ = br.ReadUInt32(); // quit_passive
                var (txtList, txtEntry) = ReadAnyParaTextRef(br);
                SkipAnyPara(br); // helptext

                alarms.Add(new AlarmModel
                {
                    Id = $"Alarm_{i}",
                    AlarmNumber = userConfig > 0 ? userConfig : i,
                    Group = group,
                    Severity = priority > 1 ? "Error" : (priority == 1 ? "Warning" : "Information"),
                    DatapointId = ResolveVarNoToSymbol(mainVar, model) ?? $"AlarmServer_{i}",
                    TextListId = txtList >= 1000 ? $"TextList_{txtList - 1000}" : "AlarmText",
                    TextEntryId = txtEntry.ToString(),
                    ParameterDatapointIds = paramVars,
                    ActiveTextColorHex = ExtractPenColorHex(activeCol, "#FFFFFF"),
                    ActiveBackgroundColorHex = ExtractBackColorHex(activeCol, "#CC0000")
                });
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < alarms.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    alarms[i].Id = labels[i];
                }
                model.Alarms.Add(alarms[i]);
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0000.MPC Alarms: {ex.Message}");
        }
    }

    private static void TryParseMenuFile(string filePath, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out var mpcVer, out _))
            {
                return;
            }

            var menuCount = br.ReadUInt16();
            var menus = new List<MenuModel>(menuCount);
            for (var i = 0; i < menuCount; i++)
            {
                var lineCount = br.ReadUInt16();
                var menu = new MenuModel
                {
                    Id = $"Menu_{i}",
                    Name = $"Menu_{i}"
                };

                for (var l = 0; l < lineCount; l++)
                {
                    SkipChkBit(br);
                    var (_, constVal) = ReadVarLabelTarget(br);
                    _ = br.ReadUInt32(); // gfunct (4B)
                    var (txtList, txtEntry) = ReadAnyParaTextRef(br);
                    SkipMemVarLabel(br);
                    _ = br.ReadUInt16(); // stscheme

                    menu.Items.Add(new MenuItemModel
                    {
                        Index = l,
                        TextListId = txtList >= 1000 ? $"TextList_{txtList - 1000}" : "MenueText",
                        TextEntryId = txtEntry.ToString(),
                        Value = constVal ?? l
                    });
                }

                // Skip _MENUINFO
                _ = br.ReadByte();   // font
                _ = br.ReadUInt32(); // attrib
                _ = br.ReadUInt32(); // xy
                _ = br.ReadUInt16(); // line_height
                _ = br.ReadUInt16(); // width
                _ = br.ReadUInt16(); // height
                _ = br.ReadUInt32(); // text_color
                _ = br.ReadUInt32(); // bar_color
                _ = br.ReadUInt32(); // frame_color
                _ = br.ReadUInt32(); // inactive_text_color
                SkipVarLabel(br);    // server
                _ = br.ReadByte();   // frametype
                if (mpcVer >= 60)
                {
                    _ = br.ReadByte(); // draw_shadow
                }

                menus.Add(menu);
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < menus.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    menus[i].Name = labels[i];
                    menus[i].Id = labels[i];
                }
                model.Menus.Add(menus[i]);
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0005.MPC Menus: {ex.Message}");
        }
    }

    private static void TryParseLanguageMpcFiles(string runtimeDir, string langTxtPath, HmiIntermediateModel model)
    {
        try
        {
            var lines = File.ReadAllLines(langTxtPath, Encoding.Latin1);
            var langIdx = 0;
            foreach (var raw in lines)
            {
                var trimmed = raw.Trim();
                if (string.IsNullOrEmpty(trimmed))
                {
                    continue;
                }
                var firstSpace = trimmed.IndexOf(' ');
                var lcidToken = firstSpace > 0 ? trimmed[..firstSpace] : trimmed;
                var displayToken = firstSpace > 0 ? trimmed[(firstSpace + 1)..].Trim() : string.Empty;
                if (!int.TryParse(lcidToken, out var lcid) || lcid <= 0)
                {
                    continue;
                }

                var bcp47 = MapLcidToBcp47(lcid);
                if (!model.Languages.Exists(l => l.Lcid == lcid || string.Equals(l.Bcp47Code, bcp47, StringComparison.OrdinalIgnoreCase)))
                {
                    model.Languages.Add(new LanguageModel
                    {
                        Index = langIdx,
                        Lcid = lcid,
                        Bcp47Code = bcp47,
                        DisplayName = !string.IsNullOrEmpty(displayToken) ? displayToken : bcp47,
                        WinName = !string.IsNullOrEmpty(displayToken) ? displayToken : bcp47
                    });
                }

                var lcidMpc = Path.Combine(runtimeDir, $"{lcid}.MPC");
                if (File.Exists(lcidMpc))
                {
                    using var fs = new FileStream(lcidMpc, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    using var br = new BinaryReader(fs, Encoding.Latin1);
                    if (TryReadMpcHeader(br, out _, out _))
                    {
                        _ = br.ReadUInt32(); // footer offset
                        var noTextLists = br.ReadUInt16();
                        for (var tlIdx = 0; tlIdx < noTextLists; tlIdx++)
                        {
                            var strings = TryReadTextBufferStrings(br);
                            var listId = $"TextList_{tlIdx}";
                            var tlModel = model.TextLists.Find(t =>
                                string.Equals(t.Id, listId, StringComparison.OrdinalIgnoreCase) ||
                                (tlIdx < model.TextLists.Count && model.TextLists[tlIdx] == t));

                            if (tlModel == null)
                            {
                                tlModel = new TextListModel
                                {
                                    Id = listId,
                                    Name = listId
                                };
                                model.TextLists.Add(tlModel);
                            }

                            for (var sIdx = 0; sIdx < strings.Count; sIdx++)
                            {
                                var entryId = sIdx.ToString();
                                var entry = tlModel.Entries.Find(e => e.NumericIndex == sIdx);
                                if (entry == null)
                                {
                                    entry = new TextEntryModel
                                    {
                                        EntryId = entryId,
                                        NumericIndex = sIdx
                                    };
                                    tlModel.Entries.Add(entry);
                                }
                                if (!entry.Translations.ContainsKey(bcp47))
                                {
                                    entry.Translations[bcp47] = strings[sIdx];
                                }
                            }
                        }
                    }
                }
                langIdx++;
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading <LCID>.MPC language files: {ex.Message}");
        }
    }

    private static void TryParseObjectList(string filePath, List<string> imageSymbols, HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out _))
            {
                return;
            }

            var no = br.ReadUInt16();
            var parsedObjects = new List<ReusableObjectModel>(no);
            for (var i = 0; i < no; i++)
            {
                var (room, controls, _) = ReadSubPicture(br, $"Obj_{i}", imageSymbols, model);
                var w = Math.Max(20, room.X2 - room.X1 + 1);
                var h = Math.Max(20, room.Y2 - room.Y1 + 1);
                parsedObjects.Add(new ReusableObjectModel
                {
                    Id = $"Object_{i}",
                    Index = i,
                    Name = $"Object_{i}",
                    SourceFileName = $"Object_{i}.lse",
                    Width = w,
                    Height = h,
                    Controls = controls
                });
            }

            var labels = TryReadAsciiBuffer(br);
            for (var i = 0; i < parsedObjects.Count; i++)
            {
                if (i < labels.Count && !string.IsNullOrWhiteSpace(labels[i]))
                {
                    parsedObjects[i].Name = labels[i];
                    parsedObjects[i].Id = labels[i];
                    parsedObjects[i].SourceFileName = $"{labels[i]}.lse";
                }

                var existing = model.ReusableObjects.Find(o =>
                    string.Equals(o.Name, parsedObjects[i].Name, StringComparison.OrdinalIgnoreCase) ||
                    o.Index == i);

                if (existing != null)
                {
                    existing.Width = parsedObjects[i].Width;
                    existing.Height = parsedObjects[i].Height;
                    existing.Controls = parsedObjects[i].Controls;
                }
                else
                {
                    model.ReusableObjects.Add(parsedObjects[i]);
                }
            }
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning reading LS0002.MPC ObjectList: {ex.Message}");
        }
    }

    private static ScreenModel? TryParsePictureMpc(
        string filePath,
        int screenNumber,
        bool isWindow,
        bool isGlobalScreen,
        List<string> imageSymbols,
        HmiIntermediateModel model)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var br = new BinaryReader(fs, Encoding.Latin1);
            if (!TryReadMpcHeader(br, out _, out var headerName))
            {
                return null;
            }

            var mpcFileName = Path.GetFileName(filePath);
            var screenName = !string.IsNullOrWhiteSpace(headerName)
                ? headerName
                : (isGlobalScreen ? "GlobalScreen" : Path.GetFileNameWithoutExtension(filePath));

            // _Picture Header (T_picpic.cpp)
            _ = br.ReadInt16();  // FirstInput.x
            _ = br.ReadInt16();  // FirstInput.y
            _ = br.ReadUInt16(); // TouchEditorNumeric
            _ = br.ReadUInt16(); // TouchEditorAscii
            _ = br.ReadUInt16(); // DrawShadow
            var startFunct = br.ReadUInt16();
            var endFunct = br.ReadUInt16();
            _ = br.ReadUInt16(); // GlobalHotkeys

            // Softkey->Read(&File)
            SkipTextPufferLanguage(br);
            var sno = br.ReadUInt16();
            var fno = br.ReadUInt16();
            for (var f = 0; f < fno * sno; f++)
            {
                SkipSingleSoft(br);
            }

            var subPicCount = br.ReadUInt16();
            if (subPicCount == 0 || subPicCount > 16)
            {
                return null;
            }

            // Note: When subPicCount == 2, the first _SubPicture in the file is the foreground screen
            // and the second _SubPicture is the embedded GlobalScreen background copy!
            var (room, controls, bgHex) = ReadSubPicture(br, screenName, imageSymbols, model);

            var width = Math.Max(64, room.X2 - room.X1 + 1);
            var height = Math.Max(48, room.Y2 - room.Y1 + 1);
            if (!isWindow && (width <= 64 || width > 4096))
            {
                width = model.ProjectMetadata.ResolutionWidth > 0 ? model.ProjectMetadata.ResolutionWidth : 800;
                height = model.ProjectMetadata.ResolutionHeight > 0 ? model.ProjectMetadata.ResolutionHeight : 480;
            }

            return new ScreenModel
            {
                Id = screenName,
                ScreenNumber = screenNumber,
                Name = screenName,
                IsWindow = isWindow,
                IsGlobalScreen = isGlobalScreen,
                SourceFileName = isWindow ? $"{screenName}.lwn" : $"{screenName}.lsn",
                MpcFileName = mpcFileName,
                Width = width,
                Height = height,
                BackgroundColorHex = bgHex,
                IncludeGlobalScreen = subPicCount >= 2,
                Controls = controls
            };
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Non-fatal warning parsing picture MPC '{Path.GetFileName(filePath)}': {ex.Message}");
            return null;
        }
    }

    private static (RoomCoords Room, List<HmiControlModel> Controls, string BackgroundHex) ReadSubPicture(
        BinaryReader br,
        string ownerName,
        List<string> imageSymbols,
        HmiIntermediateModel model)
    {
        SkipChkBit(br);
        var localTexts = ReadTextPufferLanguageFirstLang(br);
        var maskRoom = ReadRoom(br);
        var controls = new List<HmiControlModel>();
        var bgHex = "#D4D0C8";
        var zOrder = 1;

        // 1. Rectangles (memrectangle: 24 bytes each)
        var rectCount = br.ReadUInt16();
        for (var i = 0; i < rectCount; i++)
        {
            SkipChkBit(br);
            var attrib = br.ReadUInt32();
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var r = ReadRoom(br);
            var frameType = br.ReadByte();

            // Check if this rectangle is the full-screen background rectangle
            if (i == 0 && r.X1 <= maskRoom.X1 + 2 && r.Y1 <= maskRoom.Y1 + 2 &&
                r.X2 >= maskRoom.X2 - 2 && r.Y2 >= maskRoom.Y2 - 2)
            {
                bgHex = ExtractBackColorHex(color, ExtractPenColorHex(color, "#D4D0C8"));
            }

            controls.Add(CreateRectangleControl($"{ownerName}_Rect_{i}", r, color, colorFrame, frameType, attrib, zOrder++));
        }

        // 2. Polygons / Lines (mempolygon)
        var polyCount = br.ReadUInt16();
        for (var i = 0; i < polyCount; i++)
        {
            SkipChkBit(br);
            var attrib = br.ReadUInt32();
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var ptCount = br.ReadUInt16();
            var pts = new List<Point2DModel>(ptCount);
            int minX = int.MaxValue, minY = int.MaxValue, maxX = int.MinValue, maxY = int.MinValue;
            for (var p = 0; p < ptCount; p++)
            {
                var px = br.ReadInt16();
                var py = br.ReadInt16();
                pts.Add(new Point2DModel { X = px, Y = py });
                if (px < minX) minX = px;
                if (py < minY) minY = py;
                if (px > maxX) maxX = px;
                if (py > maxY) maxY = py;
            }

            if (pts.Count > 0)
            {
                var isLine = pts.Count == 2;
                controls.Add(new HmiControlModel
                {
                    Id = $"{ownerName}_{(isLine ? "Line" : "Poly")}_{i}",
                    Name = $"{(isLine ? "Line" : "Polygon")}_{i}",
                    SourceType = isLine ? "Line" : "Polygon",
                    X = minX,
                    Y = minY,
                    Width = Math.Max(4, maxX - minX + 1),
                    Height = Math.Max(4, maxY - minY + 1),
                    ZIndex = zOrder++,
                    ForegroundColorHex = ExtractPenColorHex(color, "#000000"),
                    BackgroundColorHex = ExtractBackColorHex(color, "#808080"),
                    BorderColorHex = ExtractPenColorHex(colorFrame, "#000000"),
                    PolygonPoints = pts
                });
            }
        }

        // 3. Circles (memcircle: 27 bytes each)
        var circleCount = br.ReadUInt16();
        for (var i = 0; i < circleCount; i++)
        {
            SkipChkBit(br);
            _ = br.ReadUInt32(); // attrib
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var r = ReadRoom(br);
            _ = br.ReadInt16();  // angle
            _ = br.ReadInt16();  // arc

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_Circle_{i}",
                Name = $"Circle_{i}",
                SourceType = "Circle",
                X = r.X1,
                Y = r.Y1,
                Width = Math.Max(8, r.X2 - r.X1 + 1),
                Height = Math.Max(8, r.Y2 - r.Y1 + 1),
                ZIndex = zOrder++,
                ForegroundColorHex = ExtractPenColorHex(color, "#000000"),
                BackgroundColorHex = ExtractBackColorHex(color, "#E0E0E0"),
                BorderColorHex = ExtractPenColorHex(colorFrame, "#404040")
            });
        }

        // 4. Static Texts (mempictxt)
        var txtCount = br.ReadUInt16();
        for (var i = 0; i < txtCount; i++)
        {
            var ctrl = ReadPicTextControl(br, $"{ownerName}_Text_{i}", $"Label_{i}", localTexts, model, zOrder++);
            controls.Add(ctrl);
        }

        // 5. Object References (memobject)
        var objCount = br.ReadUInt16();
        for (var i = 0; i < objCount; i++)
        {
            SkipChkBit(br);
            _ = br.ReadUInt32(); // attrib
            var xyX = br.ReadInt16();
            var xyY = br.ReadInt16();
            var xeX = br.ReadInt16();
            var xeY = br.ReadInt16();
            var objNo = br.ReadUInt16();
            _ = br.ReadInt16(); // zoom.x
            _ = br.ReadInt16(); // zoom.y
            _ = br.ReadUInt32(); // colorframe
            var (loaderVar, _) = ReadVarLabelTarget(br);
            _ = br.ReadUInt16(); // stscheme
            _ = br.ReadUInt32(); // direction
            _ = br.ReadUInt16(); // summary
            _ = br.ReadByte();   // doimage
            _ = br.ReadByte();   // lock_overload
            var loaderScheme = br.ReadUInt16();

            var refObj = objNo < model.ReusableObjects.Count ? model.ReusableObjects[objNo] : null;
            var objName = refObj?.Name ?? $"Object_{objNo}";
            var overloadSymbol = ResolveVarNoToSymbol(loaderVar, model);

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_ObjInst_{i}",
                Name = $"{objName}_{i}",
                SourceType = "ObjectInstance",
                X = xyX,
                Y = xyY,
                Width = xeX > xyX ? (xeX - xyX + 1) : (refObj?.Width ?? 160),
                Height = xeY > xyY ? (xeY - xyY + 1) : (refObj?.Height ?? 100),
                ZIndex = zOrder++,
                ReferencedObjectName = objName,
                OverloadDatapointPrefix = overloadSymbol,
                DatapointId = overloadSymbol,
                ServerSchemeId = loaderScheme != 0xFFFF ? ResolveSchemeName("Server", loaderScheme, model) : null
            });
        }

        // 6. Static Bitmaps (membitmap: 25 bytes each)
        var bmpCount = br.ReadUInt16();
        for (var i = 0; i < bmpCount; i++)
        {
            SkipChkBit(br);
            _ = br.ReadUInt32(); // attrib
            _ = br.ReadUInt32(); // color
            _ = br.ReadUInt32(); // colorframe
            var r = ReadRoom(br);
            var imgNo = br.ReadUInt16();
            var assetId = ResolveImageAssetId(imgNo, imageSymbols, model);

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_Img_{i}",
                Name = $"Image_{i}",
                SourceType = "StaticImage",
                X = r.X1,
                Y = r.Y1,
                Width = Math.Max(8, r.X2 - r.X1 + 1),
                Height = Math.Max(8, r.Y2 - r.Y1 + 1),
                ZIndex = zOrder++,
                ImageAssetId = assetId,
                TransparentBackground = true
            });
        }

        // 7. Inputs (meminput)
        var inputCount = br.ReadUInt16();
        var ioVirtNameIndices = new List<(HmiControlModel Ctrl, ushort VirtIdx)>();
        for (var i = 0; i < inputCount; i++)
        {
            var (ioCtrl, virtIdx, ioTyp) = ReadIoControl(br, $"{ownerName}_Input_{i}", $"Input_{i}", isInput: true, imageSymbols, model, zOrder++);
            _ = br.ReadUInt16(); // enter_plus
            _ = br.ReadByte();   // tmpacc
            _ = br.ReadByte();   // searchchoice
            _ = br.ReadByte();   // selector
            if (ioTyp == 16)     // AS_ENUMERATION -> 5-byte _COMBOINFO
            {
                _ = br.ReadBytes(5);
            }
            if (virtIdx != 0xFFFF)
            {
                ioVirtNameIndices.Add((ioCtrl, virtIdx));
            }
            controls.Add(ioCtrl);
        }

        // 8. Outputs (memoutput)
        var outputCount = br.ReadUInt16();
        for (var i = 0; i < outputCount; i++)
        {
            var (ioCtrl, virtIdx, _) = ReadIoControl(br, $"{ownerName}_Output_{i}", $"Output_{i}", isInput: false, imageSymbols, model, zOrder++);
            if (virtIdx != 0xFFFF)
            {
                ioVirtNameIndices.Add((ioCtrl, virtIdx));
            }
            controls.Add(ioCtrl);
        }

        // 9. Motions (memmotion)
        var motionCount = br.ReadUInt16();
        for (var i = 0; i < motionCount; i++)
        {
            SkipChkBit(br);
            var r = ReadRoom(br);
            _ = br.ReadUInt32(); // attrib
            var (anyList, anyNo) = ReadAnything(br);
            var (varX, _) = ReadVarLabelTarget(br);
            var (varY, _) = ReadVarLabelTarget(br);
            var (loaderVar, _) = ReadVarLabelTarget(br);
            _ = br.ReadUInt32(); // direction
            _ = br.ReadUInt16(); // stscheme
            _ = br.ReadUInt16(); // summary
            _ = br.ReadUInt32(); // zoom

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_Motion_{i}",
                Name = $"Motion_{i}",
                SourceType = "MotionGraphic",
                X = r.X1,
                Y = r.Y1,
                Width = Math.Max(16, r.X2 - r.X1 + 1),
                Height = Math.Max(16, r.Y2 - r.Y1 + 1),
                ZIndex = zOrder++,
                DatapointId = ResolveVarNoToSymbol(varX ?? varY ?? loaderVar, model),
                ImageAssetId = anyList == 2 ? ResolveImageAssetId((ushort)anyNo, imageSymbols, model) : null
            });
        }

        // 10. Dynamic-Colored Rectangles (colrect)
        var colRectCount = br.ReadUInt16();
        for (var i = 0; i < colRectCount; i++)
        {
            SkipChkBit(br);
            var attrib = br.ReadUInt32();
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var r = ReadRoom(br);
            var frameType = br.ReadByte();
            var (backScheme, backVar) = ReadLinkScheme(br);
            var (frontScheme, frontVar) = ReadLinkScheme(br);
            SkipLinkScheme(br);
            SkipLinkScheme(br);

            var rectCtrl = CreateRectangleControl($"{ownerName}_ColRect_{i}", r, color, colorFrame, frameType, attrib, zOrder++);
            var schemeNo = backScheme != 0xFFFF ? backScheme : frontScheme;
            if (schemeNo != 0xFFFF)
            {
                rectCtrl.ColorSchemeId = ResolveSchemeName("Color", schemeNo, model);
                rectCtrl.DatapointId = ResolveVarNoToSymbol(backVar ?? frontVar, model);
            }
            controls.Add(rectCtrl);
        }

        // 11. Dynamic-Colored Polygons (colpoly)
        var colPolyCount = br.ReadUInt16();
        for (var i = 0; i < colPolyCount; i++)
        {
            SkipChkBit(br);
            _ = br.ReadUInt32();
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var ptCount = br.ReadUInt16();
            var pts = new List<Point2DModel>(ptCount);
            int minX = int.MaxValue, minY = int.MaxValue, maxX = int.MinValue, maxY = int.MinValue;
            for (var p = 0; p < ptCount; p++)
            {
                var px = br.ReadInt16();
                var py = br.ReadInt16();
                pts.Add(new Point2DModel { X = px, Y = py });
                if (px < minX) minX = px;
                if (py < minY) minY = py;
                if (px > maxX) maxX = px;
                if (py > maxY) maxY = py;
            }
            var (backScheme, backVar) = ReadLinkScheme(br);
            SkipLinkScheme(br);
            SkipLinkScheme(br);

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_ColPoly_{i}",
                Name = $"ColPolygon_{i}",
                SourceType = pts.Count == 2 ? "Line" : "Polygon",
                X = minX == int.MaxValue ? 0 : minX,
                Y = minY == int.MaxValue ? 0 : minY,
                Width = maxX >= minX ? Math.Max(4, maxX - minX + 1) : 20,
                Height = maxY >= minY ? Math.Max(4, maxY - minY + 1) : 20,
                ZIndex = zOrder++,
                ForegroundColorHex = ExtractPenColorHex(color, "#000000"),
                BackgroundColorHex = ExtractBackColorHex(color, "#808080"),
                BorderColorHex = ExtractPenColorHex(colorFrame, "#000000"),
                ColorSchemeId = backScheme != 0xFFFF ? ResolveSchemeName("Color", backScheme, model) : null,
                DatapointId = ResolveVarNoToSymbol(backVar, model),
                PolygonPoints = pts
            });
        }

        // 12. Dynamic-Colored Circles (colcirc)
        var colCircCount = br.ReadUInt16();
        for (var i = 0; i < colCircCount; i++)
        {
            SkipChkBit(br);
            _ = br.ReadUInt32();
            var color = br.ReadUInt32();
            var colorFrame = br.ReadUInt32();
            var r = ReadRoom(br);
            _ = br.ReadInt16();
            _ = br.ReadInt16();
            var (backScheme, backVar) = ReadLinkScheme(br);
            var (frontScheme, frontVar) = ReadLinkScheme(br);
            SkipLinkScheme(br);

            var schemeNo = backScheme != 0xFFFF ? backScheme : frontScheme;
            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_ColCircle_{i}",
                Name = $"ColCircle_{i}",
                SourceType = "Circle",
                X = r.X1,
                Y = r.Y1,
                Width = Math.Max(8, r.X2 - r.X1 + 1),
                Height = Math.Max(8, r.Y2 - r.Y1 + 1),
                ZIndex = zOrder++,
                ForegroundColorHex = ExtractPenColorHex(color, "#000000"),
                BackgroundColorHex = ExtractBackColorHex(color, "#E0E0E0"),
                BorderColorHex = ExtractPenColorHex(colorFrame, "#404040"),
                ColorSchemeId = schemeNo != 0xFFFF ? ResolveSchemeName("Color", schemeNo, model) : null,
                DatapointId = ResolveVarNoToSymbol(backVar ?? frontVar, model)
            });
        }

        // 13. Dynamic-Colored Texts (colpictxt)
        var colTxtCount = br.ReadUInt16();
        for (var i = 0; i < colTxtCount; i++)
        {
            var ctrl = ReadPicTextControl(br, $"{ownerName}_ColText_{i}", $"DynLabel_{i}", localTexts, model, zOrder++);
            var (backScheme, backVar) = ReadLinkScheme(br);
            SkipLinkScheme(br); // dyncolfront
            var (txtScheme, txtVar) = ReadLinkScheme(br);
            SkipLinkScheme(br); // dyncoltl
            SkipLinkScheme(br); // dyncolbr

            var schemeNo = backScheme != 0xFFFF ? backScheme : txtScheme;
            if (schemeNo != 0xFFFF)
            {
                ctrl.ColorSchemeId = ResolveSchemeName("Color", schemeNo, model);
                ctrl.DatapointId ??= ResolveVarNoToSymbol(backVar ?? txtVar, model);
            }
            controls.Add(ctrl);
        }

        // 14. Carousels (COMPILER_VERSION >= 55)
        var caroCount = br.ReadUInt16();
        for (var i = 0; i < caroCount; i++)
        {
            var r = ReadRoom(br);
            var colBack = br.ReadUInt32();
            _ = br.ReadUInt32(); // attrib
            _ = br.ReadByte();   // gap
            _ = br.ReadByte();   // skip_percent
            var (vlVar, _) = ReadVarLabelTarget(br);
            var flags1 = br.ReadByte();
            SkipChkBit(br);
            _ = br.ReadUInt16(); // stscheme
            var karuItems = br.ReadUInt16();
            for (var k = 0; k < karuItems; k++)
            {
                _ = br.ReadUInt16(); // objno
                SkipVarLabel(br);    // loader
            }
            SkipLinkScheme(br);
            SkipLinkScheme(br);
            SkipVarLabel(br); // varindex
            _ = br.ReadByte(); // flags2
            _ = br.ReadByte(); // frametype
            _ = br.ReadUInt32(); // tcol
            _ = br.ReadUInt32(); // col_frame
            _ = br.ReadUInt32(); // col_text
            _ = br.ReadByte();   // movespeed_code

            controls.Add(new HmiControlModel
            {
                Id = $"{ownerName}_Carousel_{i}",
                Name = $"Carousel_{i}",
                SourceType = "Carousel",
                X = r.X1,
                Y = r.Y1,
                Width = Math.Max(40, r.X2 - r.X1 + 1),
                Height = Math.Max(40, r.Y2 - r.Y1 + 1),
                ZIndex = zOrder++,
                BackgroundColorHex = ExtractBackColorHex(colBack, "#E0E0E0"),
                Orientation = (flags1 & 0x02) != 0 ? "Horizontal" : "Vertical",
                DatapointId = ResolveVarNoToSymbol(vlVar, model)
            });
        }

        // 15. Keyboard Keys (memkey: 11 bytes each)
        var keyCount = br.ReadUInt16();
        for (var i = 0; i < keyCount; i++)
        {
            _ = br.ReadBytes(11);
        }

        // 16. Touch Buttons (membutton)
        var btnCount = br.ReadUInt16();
        for (var i = 0; i < btnCount; i++)
        {
            var btn = ReadButtonControl(br, $"{ownerName}_Btn_{i}", $"Button_{i}", localTexts, imageSymbols, model, zOrder++);
            controls.Add(btn);
        }

        // 17. Enclosed Virtual Object Names (enclosed_name)
        var enclosedNames = TryReadAsciiBuffer(br);
        foreach (var (ioCtrl, virtIdx) in ioVirtNameIndices)
        {
            if (virtIdx < enclosedNames.Count && !string.IsNullOrWhiteSpace(enclosedNames[virtIdx]))
            {
                var vName = enclosedNames[virtIdx];
                ioCtrl.VirtualObjectName = vName;
                ioCtrl.Name = vName;
                if (vName.Contains("Alarm", StringComparison.OrdinalIgnoreCase))
                {
                    ioCtrl.SourceType = "AlarmDisplay";
                }
                else if (vName.Contains("Scroll", StringComparison.OrdinalIgnoreCase) ||
                         vName.Contains("List", StringComparison.OrdinalIgnoreCase) ||
                         vName.Contains("Header", StringComparison.OrdinalIgnoreCase))
                {
                    ioCtrl.SourceType = "ScrollArea";
                }
                else if (vName.Contains("ColorBar", StringComparison.OrdinalIgnoreCase))
                {
                    ioCtrl.SourceType = "Bar";
                }
                else if (vName.Contains("Indicator", StringComparison.OrdinalIgnoreCase))
                {
                    ioCtrl.SourceType = "Gauge";
                }
                else if (ioCtrl.SourceType == "NumericDisplay" || ioCtrl.SourceType == "NumericInput")
                {
                    ioCtrl.SourceType = "CustomMyIo";
                }
            }
        }

        // 18. Z-Order Table (memzorder)
        if (br.BaseStream.Position + 2 <= br.BaseStream.Length)
        {
            var zCount = br.ReadUInt16();
            if (br.BaseStream.Position + zCount * 3 <= br.BaseStream.Length)
            {
                br.BaseStream.Seek(zCount * 3, SeekOrigin.Current);
            }
        }

        return (maskRoom, controls, bgHex);
    }

    private static HmiControlModel ReadPicTextControl(
        BinaryReader br,
        string id,
        string name,
        List<string> localTexts,
        HmiIntermediateModel model,
        int zIndex)
    {
        SkipChkBit(br);
        var attrib = br.ReadUInt32();
        var colBack = br.ReadUInt32();
        var colFrame = br.ReadUInt32();
        var colTxt = br.ReadUInt32();
        var r = ReadRoom(br);
        var (anyList, anyNo) = ReadAnyParaTextRef(br);
        var fontIdx = br.ReadByte();
        _ = br.ReadUInt16(); // summary
        _ = br.ReadUInt16(); // stscheme
        var frameType = br.ReadByte();
        _ = br.ReadUInt16(); // fillchr
        _ = br.ReadByte();   // doimage
        _ = br.ReadByte();   // lock_overload

        var (txtListId, txtEntryId, fallbackText, txtSchemeId) = ResolveTextReference(anyList, anyNo, localTexts, model);

        return new HmiControlModel
        {
            Id = id,
            Name = name,
            SourceType = txtSchemeId != null ? "DynamicText" : "StaticText",
            X = r.X1,
            Y = r.Y1,
            Width = Math.Max(8, r.X2 - r.X1 + 1),
            Height = Math.Max(8, r.Y2 - r.Y1 + 1),
            ZIndex = zIndex,
            ForegroundColorHex = ExtractPenColorHex(colTxt, "#000000"),
            BackgroundColorHex = ExtractBackColorHex(colBack, "#FFFFFF"),
            BorderColorHex = ExtractPenColorHex(colFrame, "#808080"),
            BorderWidth = frameType == 0 ? 0 : 1,
            TransparentBackground = ((colBack >> 16) & 0xFFFF) == 0xFFFE,
            FontStyleId = fontIdx < model.FontStyles.Count ? model.FontStyles[fontIdx].Id : null,
            HorizontalAlignment = DecodeHorizAlign(attrib),
            VerticalAlignment = DecodeVertAlign(attrib),
            TextListId = txtListId,
            TextEntryId = txtEntryId,
            StaticTextFallback = fallbackText,
            TextSchemeId = txtSchemeId
        };
    }

    private static (HmiControlModel Control, ushort VirtNameIdx, ushort IoType) ReadIoControl(
        BinaryReader br,
        string id,
        string name,
        bool isInput,
        List<string> imageSymbols,
        HmiIntermediateModel model,
        int zIndex)
    {
        SkipChkBit(br);
        var attrib = br.ReadUInt32();
        var colBack = br.ReadUInt32();
        var colFrame = br.ReadUInt32();
        var colTxt = br.ReadUInt32();
        var r = ReadRoom(br);
        var ioTyp = br.ReadUInt16();
        var (varNo, _) = ReadVarLabelTarget(br);
        var fontIdx = br.ReadByte();

        // Read_IOINFO (T_file.cpp:2102-2159)
        ushort tboList = 17;
        uint tboNo = 0;
        if (ioTyp == 4) // AS_BAR
        {
            tboNo = br.ReadByte();
            _ = br.ReadBytes(5);
        }
        else if (ioTyp == 8 || ioTyp == 5) // AS_MENU (8) or AS_TBO (5) -> Read_ANYTHING (6B) + 2 dummy bytes = 8B!
        {
            tboList = br.ReadUInt16();
            tboNo = br.ReadUInt32();
            _ = br.ReadBytes(2);
        }
        else
        {
            _ = br.ReadBytes(6);
        }

        // Read_PICFORMAT
        _ = br.ReadUInt16(); // format
        var digits = br.ReadByte();
        var posDezPt = ReadVarLabelFirstInt(br);

        _ = br.ReadUInt16(); // summary
        var virtNameIdx = br.ReadUInt16();
        _ = br.ReadUInt16(); // is_dyncolor
        var (dynBackScheme, _) = ReadLinkScheme(br);
        SkipLinkScheme(br);  // dyncolfront
        SkipLinkScheme(br);  // dyncoltl
        SkipLinkScheme(br);  // dyncolbr
        SkipLinkScheme(br);  // dyncoltxt
        _ = br.ReadUInt16(); // stscheme
        var frameType = br.ReadByte();
        var lseFunct = br.ReadUInt16();
        _ = br.ReadUInt16(); // fillchr
        _ = br.ReadUInt32(); // direction

        var udcDatapoints = new List<string>();
        var udcColors = new List<string>();
        ushort urgeType = 0xFFFF;
        if (ioTyp == 14) // AS_THEURGE
        {
            (urgeType, udcDatapoints, udcColors) = ReadTheUrge(br, model);
        }

        _ = br.ReadByte(); // doimage
        _ = br.ReadByte(); // lock_overload
        SkipAnyPara(br);   // newbubbletext

        var dpSymbol = ResolveVarNoToSymbol(varNo, model);
        var dpModel = varNo.HasValue && varNo.Value >= 0 && varNo.Value < model.Datapoints.Count
            ? model.Datapoints[varNo.Value]
            : null;

        var srcType = MapIoTypeToSourceType(ioTyp, isInput, tboList, urgeType);
        string? imgSchemeId = null;
        string? txtSchemeId = null;
        string? objSchemeId = null;

        if (ioTyp == 5) // AS_TBO
        {
            if (tboList == 10) imgSchemeId = ResolveSchemeName("Image", (ushort)tboNo, model);
            else if (tboList == 12) txtSchemeId = ResolveSchemeName("Text", (ushort)tboNo, model);
            else if (tboList == 13) objSchemeId = ResolveSchemeName("Object", (ushort)tboNo, model);
        }

        if (string.IsNullOrEmpty(dpSymbol) && udcDatapoints.Count > 0)
        {
            dpSymbol = udcDatapoints[^1];
        }

        var ctrl = new HmiControlModel
        {
            Id = id,
            Name = !string.IsNullOrEmpty(dpSymbol) ? $"{name}_{dpSymbol.Replace('.', '_')}" : name,
            SourceType = srcType,
            X = r.X1,
            Y = r.Y1,
            Width = Math.Max(8, r.X2 - r.X1 + 1),
            Height = Math.Max(8, r.Y2 - r.Y1 + 1),
            ZIndex = zIndex,
            WriteProtected = !isInput,
            ForegroundColorHex = ExtractPenColorHex(colTxt, "#000000"),
            BackgroundColorHex = udcColors.Count > 1 ? udcColors[1] : ExtractBackColorHex(colBack, isInput ? "#FFFFFF" : "#F0F0F0"),
            BorderColorHex = ExtractPenColorHex(colFrame, "#808080"),
            BorderWidth = frameType == 0 ? 0 : 1,
            FontStyleId = fontIdx < model.FontStyles.Count ? model.FontStyles[fontIdx].Id : null,
            HorizontalAlignment = DecodeHorizAlign(attrib),
            VerticalAlignment = DecodeVertAlign(attrib),
            DatapointId = dpSymbol,
            UnitId = dpModel?.UnitId,
            MinLimit = dpModel?.MinLimit,
            MaxLimit = dpModel?.MaxLimit,
            DecimalPlaces = Math.Clamp(posDezPt ?? 0, 0, 6),
            ImageSchemeId = imgSchemeId,
            TextSchemeId = txtSchemeId,
            ObjectSchemeId = objSchemeId,
            ColorSchemeId = dynBackScheme != 0xFFFF ? ResolveSchemeName("Color", dynBackScheme, model) : null,
            UdcDatapointIds = udcDatapoints,
            UdcColorsHex = udcColors
        };

        if (lseFunct != 0xFFFF)
        {
            ctrl.Events.Add(new HmiEventModel
            {
                Trigger = "OnValueChange",
                ActionType = "ExecuteFunctionBlock",
                FunctionBlockId = ResolveFunctionBlockId(lseFunct, model)
            });
        }

        return (ctrl, virtNameIdx, ioTyp);
    }

    private static (ushort UrgeType, List<string> Datapoints, List<string> Colors) ReadTheUrge(
        BinaryReader br,
        HmiIntermediateModel model)
    {
        var urgeType = br.ReadUInt16();
        _ = br.ReadUInt32(); // info

        var fontCount = br.ReadUInt16();
        _ = br.ReadBytes(fontCount);

        var attrCount = br.ReadUInt16();
        _ = br.ReadBytes(attrCount * 4);

        var colCount = br.ReadUInt16();
        var colors = new List<string>(colCount);
        for (var i = 0; i < colCount; i++)
        {
            var c = br.ReadUInt32();
            colors.Add(ExtractPenColorHex(c, "#0080FF"));
        }

        var vlCount = br.ReadUInt16();
        var dps = new List<string>();
        for (var i = 0; i < vlCount; i++)
        {
            var (vNo, _) = ReadVarLabelTarget(br);
            var sym = ResolveVarNoToSymbol(vNo, model);
            if (!string.IsNullOrEmpty(sym))
            {
                dps.Add(sym);
            }
        }

        var anyCount = br.ReadUInt16();
        _ = br.ReadBytes(anyCount * 6);

        var dynColCount = br.ReadUInt16();
        for (var i = 0; i < dynColCount; i++) SkipLinkScheme(br);

        var fnCount = br.ReadUInt16();
        _ = br.ReadBytes(fnCount * 2);

        var anyParaCount = br.ReadUInt16();
        for (var i = 0; i < anyParaCount; i++) SkipAnyPara(br);

        var boolCount = br.ReadUInt16();
        _ = br.ReadBytes(boolCount * 2);

        var imgCount = br.ReadUInt16();
        _ = br.ReadBytes(imgCount * 6);

        return (urgeType, dps, colors);
    }

    private static HmiControlModel ReadButtonControl(
        BinaryReader br,
        string id,
        string name,
        List<string> localTexts,
        List<string> imageSymbols,
        HmiIntermediateModel model,
        int zIndex)
    {
        SkipChkBit(br);
        var r = ReadRoom(br);
        var posFl = br.ReadUInt16();
        var negFl = br.ReadUInt16();
        var (anyList, anyNo) = ReadAnything(br);
        var attrib = br.ReadUInt32();
        var frameCol = br.ReadUInt32();
        var col = br.ReadUInt32();
        _ = br.ReadUInt16(); // group
        var btnFType = br.ReadUInt16(); // 0=_TKEY, 1=_TSWITCH, 2=_TRADIO
        _ = br.ReadUInt16(); // tip
        _ = br.ReadUInt16(); // summary
        _ = br.ReadUInt16(); // enter_plus
        _ = br.ReadUInt32(); // direction
        var frameType = br.ReadByte();
        var (loaderVar, _) = ReadVarLabelTarget(br);
        var access = br.ReadUInt16();
        var (dynBackScheme, _) = ReadLinkScheme(br);
        SkipLinkScheme(br); // dyncolfront
        SkipLinkScheme(br); // dyncoltl
        SkipLinkScheme(br); // dyncolbr
        _ = br.ReadUInt16(); // stscheme

        // buttonimages (7 * uint16 = 14 bytes)
        var imgRelease = br.ReadUInt16();
        var imgPress = br.ReadUInt16();
        _ = br.ReadBytes(10);

        var (txtList0, txtEntry0) = ReadAnyParaTextRef(br);
        var (varNo, _) = ReadVarLabelTarget(br);
        var fontIdx = br.ReadByte();
        var colTxt = br.ReadUInt32();
        SkipLinkScheme(br); // dyncoltxt
        var hotkeyCode = br.ReadUInt16();
        _ = br.ReadByte();   // doimage
        _ = br.ReadByte();   // zoom_images
        _ = br.ReadByte();   // lock_overload
        _ = br.ReadByte();   // doubleclick
        _ = br.ReadByte();   // searchchoice
        _ = br.ReadByte();   // wose
        _ = br.ReadByte();   // selector
        var (txtList1, txtEntry1) = ReadAnyParaTextRef(br);

        // ReadMomentaryStationary (T_file.cpp:1517-1531)
        var momFlags = br.ReadByte();
        var actMomentary = (momFlags & 0x01) != 0;
        var setVal = 1;
        var resetVal = 0;
        if ((momFlags & 0x80) != 0)
        {
            setVal = br.ReadInt32();
            resetVal = br.ReadInt32();
        }

        SkipAnyPara(br); // newbubbletext

        var (tListId, tEntryId, fallbackTxt, _) = ResolveTextReference(txtList0, txtEntry0, localTexts, model);
        var (pListId, pEntryId, _, _) = ResolveTextReference(txtList1, txtEntry1, localTexts, model);
        var dpSymbol = ResolveVarNoToSymbol(varNo ?? loaderVar, model);

        var sourceType = btnFType switch
        {
            1 => "ToggleButton",
            2 => "RadioButton",
            _ => "PushButton"
        };

        var ctrl = new HmiControlModel
        {
            Id = id,
            Name = !string.IsNullOrWhiteSpace(fallbackTxt) ? $"Btn_{SanitizeIdentifier(fallbackTxt)}" : name,
            SourceType = sourceType,
            X = r.X1,
            Y = r.Y1,
            Width = Math.Max(12, r.X2 - r.X1 + 1),
            Height = Math.Max(12, r.Y2 - r.Y1 + 1),
            ZIndex = zIndex,
            WriteProtected = false,
            AccessLevel = access,
            ForegroundColorHex = ExtractPenColorHex(colTxt, "#000000"),
            BackgroundColorHex = ExtractBackColorHex(col, "#D0D0D0"),
            PressedColorHex = ExtractPenColorHex(col, "#A0A0A0"),
            BorderColorHex = ExtractPenColorHex(frameCol, "#606060"),
            BorderWidth = frameType == 0 ? 0 : 1,
            FontStyleId = fontIdx < model.FontStyles.Count ? model.FontStyles[fontIdx].Id : null,
            HorizontalAlignment = DecodeHorizAlign(attrib),
            VerticalAlignment = DecodeVertAlign(attrib),
            TextListId = tListId,
            TextEntryId = tEntryId,
            PressedTextListId = pListId,
            PressedTextEntryId = pEntryId,
            StaticTextFallback = fallbackTxt,
            DatapointId = dpSymbol,
            ImageAssetId = ResolveImageAssetId(imgRelease, imageSymbols, model),
            PressedImageAssetId = ResolveImageAssetId(imgPress, imageSymbols, model),
            ColorSchemeId = dynBackScheme != 0xFFFF ? ResolveSchemeName("Color", dynBackScheme, model) : null,
            SetVal = setVal,
            ResetVal = resetVal
        };

        // Populate button events
        if (anyList == 22) // PRJSCREEN navigation
        {
            ctrl.Events.Add(new HmiEventModel
            {
                Trigger = "OnClick",
                ActionType = "NavigateScreen",
                TargetScreenNumber = (int)anyNo,
                HotkeyScanCode = hotkeyCode != 0 ? hotkeyCode : null
            });
        }
        else if (anyList == 23) // PRJWINDOW popup
        {
            ctrl.Events.Add(new HmiEventModel
            {
                Trigger = "OnClick",
                ActionType = "OpenWindow",
                TargetScreenNumber = (int)anyNo,
                HotkeyScanCode = hotkeyCode != 0 ? hotkeyCode : null
            });
        }

        if (posFl != 0xFFFF)
        {
            ctrl.Events.Add(new HmiEventModel
            {
                Trigger = "OnPress",
                ActionType = "ExecuteFunctionBlock",
                FunctionBlockId = ResolveFunctionBlockId(posFl, model)
            });
        }

        if (negFl != 0xFFFF)
        {
            ctrl.Events.Add(new HmiEventModel
            {
                Trigger = "OnRelease",
                ActionType = "ExecuteFunctionBlock",
                FunctionBlockId = ResolveFunctionBlockId(negFl, model)
            });
        }

        if (!string.IsNullOrEmpty(dpSymbol) && ctrl.Events.Count == 0)
        {
            if (btnFType == 1)
            {
                ctrl.Events.Add(new HmiEventModel
                {
                    Trigger = "OnClick",
                    ActionType = "ToggleDatapoint",
                    TargetDatapointId = dpSymbol,
                    WriteValue = setVal
                });
            }
            else if (actMomentary)
            {
                ctrl.Events.Add(new HmiEventModel
                {
                    Trigger = "OnPress",
                    ActionType = "WriteDatapoint",
                    TargetDatapointId = dpSymbol,
                    WriteValue = setVal
                });
                ctrl.Events.Add(new HmiEventModel
                {
                    Trigger = "OnRelease",
                    ActionType = "WriteDatapoint",
                    TargetDatapointId = dpSymbol,
                    WriteValue = resetVal
                });
            }
            else
            {
                ctrl.Events.Add(new HmiEventModel
                {
                    Trigger = "OnClick",
                    ActionType = "WriteDatapoint",
                    TargetDatapointId = dpSymbol,
                    WriteValue = setVal
                });
            }
        }

        return ctrl;
    }

    private static HmiControlModel CreateRectangleControl(
        string id,
        RoomCoords r,
        uint color,
        uint colorFrame,
        byte frameType,
        uint attrib,
        int zIndex)
    {
        return new HmiControlModel
        {
            Id = id,
            Name = id,
            SourceType = "Rectangle",
            X = r.X1,
            Y = r.Y1,
            Width = Math.Max(4, r.X2 - r.X1 + 1),
            Height = Math.Max(4, r.Y2 - r.Y1 + 1),
            ZIndex = zIndex,
            ForegroundColorHex = ExtractPenColorHex(color, "#D4D0C8"),
            BackgroundColorHex = ExtractBackColorHex(color, ExtractPenColorHex(color, "#D4D0C8")),
            BorderColorHex = ExtractPenColorHex(colorFrame, "#808080"),
            BorderWidth = frameType == 0 ? 0 : 1,
            FrameType = frameType.ToString()
        };
    }

    private static RoomCoords ReadRoom(BinaryReader br)
    {
        var x1 = br.ReadInt16();
        var y1 = br.ReadInt16();
        var x2 = br.ReadInt16();
        var y2 = br.ReadInt16();
        return new RoomCoords(x1, y1, x2, y2);
    }

    private static void SkipChkBit(BinaryReader br)
    {
        _ = br.ReadBytes(3);
    }

    private static void SkipVarLabel(BinaryReader br)
    {
        var no = br.ReadByte();
        if (no > 0)
        {
            _ = br.ReadBytes(no * 6);
        }
    }

    private static void SkipMemVarLabel(BinaryReader br)
    {
        var count = br.ReadUInt16();
        for (var i = 0; i < count; i++)
        {
            SkipVarLabel(br);
        }
    }

    private static (int? VarNo, int? ConstVal) ReadVarLabelTarget(BinaryReader br)
    {
        var no = br.ReadByte();
        int? varNo = null;
        int? constVal = null;
        for (var i = 0; i < no; i++)
        {
            var state = br.ReadUInt16();
            var val = br.ReadInt32();
            if (i == 0)
            {
                if (state == 1) varNo = val;       // VAR_VAL
                else if (state == 2) constVal = val; // CONST_VAL
            }
        }
        return (varNo, constVal);
    }

    private static int? ReadVarLabelFirstInt(BinaryReader br)
    {
        var (v, c) = ReadVarLabelTarget(br);
        return c ?? v;
    }

    private static (double? LoLim, double? HiLim) ReadHiLoLim(BinaryReader br)
    {
        var state = br.ReadByte();
        double? lo = null;
        double? hi = null;
        if ((state & 0x0F) != 0)
        {
            lo = br.ReadInt32();
        }
        if ((state & 0xF0) != 0)
        {
            hi = br.ReadInt32();
        }
        return (lo, hi);
    }

    private static (ushort List, uint No) ReadAnything(BinaryReader br)
    {
        var list = br.ReadUInt16();
        var no = br.ReadUInt32();
        return (list, no);
    }

    private static void SkipAnyPara(BinaryReader br)
    {
        _ = br.ReadBytes(6); // _ANYTHING
        SkipMemVarLabel(br);
    }

    private static (ushort List, uint No) ReadAnyParaTextRef(BinaryReader br)
    {
        var list = br.ReadUInt16();
        var no = br.ReadUInt32();
        SkipMemVarLabel(br);
        return (list, no);
    }

    private static void SkipLinkScheme(BinaryReader br)
    {
        _ = br.ReadUInt16(); // myscheme
        SkipVarLabel(br);
    }

    private static (ushort SchemeNo, int? VarNo) ReadLinkScheme(BinaryReader br)
    {
        var schemeNo = br.ReadUInt16();
        var (varNo, _) = ReadVarLabelTarget(br);
        return (schemeNo, varNo);
    }

    private static void SkipSingleSoft(BinaryReader br)
    {
        _ = br.ReadBytes(18); // attrib(4), color(4), frame(4), text(4), tip(2)
        SkipAnyPara(br);
        SkipChkBit(br);
        _ = br.ReadUInt16(); // access
        _ = br.ReadByte();   // font
        _ = br.ReadUInt32(); // gfunct
        _ = br.ReadByte();   // frametype
        _ = br.ReadBytes(14); // buttonimages
        SkipVarLabel(br);
        SkipVarLabel(br);
        _ = br.ReadUInt16(); // stscheme
        _ = br.ReadByte();   // valid
        for (var i = 0; i < 5; i++) SkipLinkScheme(br);
        _ = br.ReadByte();   // wose
        var mom = br.ReadByte();
        if ((mom & 0x80) != 0)
        {
            _ = br.ReadBytes(8);
        }
        SkipAnyPara(br);
    }

    private static void SkipTextPufferLanguage(BinaryReader br)
    {
        var noLang = br.ReadUInt16();
        for (var i = 0; i < noLang; i++)
        {
            _ = TryReadTextBufferStrings(br);
        }
    }

    private static List<string> ReadTextPufferLanguageFirstLang(BinaryReader br)
    {
        var noLang = br.ReadUInt16();
        var first = new List<string>();
        for (var i = 0; i < noLang; i++)
        {
            var list = TryReadTextBufferStrings(br);
            if (i == 0) first = list;
        }
        return first;
    }

    private static List<string> TryReadAsciiBuffer(BinaryReader br)
    {
        var result = new List<string>();
        if (br.BaseStream.Position + 9 > br.BaseStream.Length)
        {
            return result;
        }

        var sc = br.ReadByte();
        var no = br.ReadUInt32();
        var size = br.ReadUInt32();
        if (size == 0 || br.BaseStream.Position + size * Math.Max((int)sc, 1) > br.BaseStream.Length)
        {
            return result;
        }

        var raw = br.ReadBytes((int)(size * Math.Max((int)sc, 1)));
        var text = sc == 2
            ? Encoding.Unicode.GetString(raw)
            : Encoding.Latin1.GetString(raw);

        var split = text.Split('\0');
        for (var i = 0; i < Math.Min(no, split.Length); i++)
        {
            result.Add(split[i]);
        }
        return result;
    }

    private static List<string> TryReadTextBufferStrings(BinaryReader br)
    {
        return TryReadAsciiBuffer(br);
    }

    private static string? ResolveVarNoToSymbol(int? varNo, HmiIntermediateModel model)
    {
        if (!varNo.HasValue || varNo.Value < 0 || varNo.Value >= model.Datapoints.Count)
        {
            return null;
        }
        return model.Datapoints[varNo.Value].SymbolPath;
    }

    private static string? ResolveImageAssetId(ushort imgNo, List<string> imageSymbols, HmiIntermediateModel model)
    {
        if (imgNo == 0xFFFF)
        {
            return null;
        }
        if (imgNo < imageSymbols.Count && !string.IsNullOrWhiteSpace(imageSymbols[imgNo]))
        {
            return Path.GetFileNameWithoutExtension(imageSymbols[imgNo]);
        }
        if (imgNo < model.Assets.Count)
        {
            return model.Assets[imgNo].Id;
        }
        return null;
    }

    private static string? ResolveSchemeName(string schemeType, ushort schemeNo, HmiIntermediateModel model)
    {
        if (schemeNo == 0xFFFF)
        {
            return null;
        }
        var matches = model.Schemes.FindAll(s => string.Equals(s.SchemeType, schemeType, StringComparison.OrdinalIgnoreCase));
        if (schemeNo < matches.Count)
        {
            return matches[schemeNo].Id;
        }
        return $"{schemeType}Scheme_{schemeNo}";
    }

    private static string? ResolveFunctionBlockId(ushort fbNo, HmiIntermediateModel model)
    {
        if (fbNo == 0xFFFF)
        {
            return null;
        }
        if (fbNo < model.FunctionBlocks.Count)
        {
            return model.FunctionBlocks[fbNo].Id;
        }
        return $"FB_{fbNo}";
    }

    private static (string? TextListId, string? TextEntryId, string? FallbackText, string? TextSchemeId) ResolveTextReference(
        ushort anyList,
        uint anyNo,
        List<string> localTexts,
        HmiIntermediateModel model)
    {
        if (anyList == 17 || anyNo == 0xFFFFFFFF || anyNo == 0xFFFF)
        {
            return (null, null, null, null);
        }

        if (anyList == 0) // LOCTXT
        {
            var txt = anyNo < localTexts.Count ? localTexts[(int)anyNo] : null;
            return (null, null, txt, null);
        }

        if (anyList == 12) // TEXTSCHEME
        {
            var schemeId = ResolveSchemeName("Text", (ushort)anyNo, model);
            return (null, null, null, schemeId);
        }

        if (anyList >= 1000) // TXTLIST_VTX (1000), TXTLIST_STX (1001), TXTLIST_002 (1002+)
        {
            var listIdx = anyList - 1000;
            var tl = listIdx < model.TextLists.Count ? model.TextLists[listIdx] : null;
            var listId = tl?.Id ?? $"TextList_{listIdx}";
            var entry = tl?.Entries.Find(e => e.NumericIndex == (int)anyNo);
            string? fallback = null;
            if (entry != null && entry.Translations.Count > 0)
            {
                foreach (var val in entry.Translations.Values)
                {
                    if (!string.IsNullOrWhiteSpace(val))
                    {
                        fallback = val;
                        break;
                    }
                }
            }
            return (listId, anyNo.ToString(), fallback, null);
        }

        return (null, null, null, null);
    }

    private static string ExtractPenColorHex(uint color, string fallbackHex)
    {
        var pen = (ushort)(color & 0xFFFF);
        if (pen == 0xFFFE) return fallbackHex;
        return AssetMigrationService.ConvertRgb565ToCssHex(pen);
    }

    private static string ExtractBackColorHex(uint color, string fallbackHex)
    {
        var back = (ushort)((color >> 16) & 0xFFFF);
        if (back == 0xFFFE) return fallbackHex;
        return AssetMigrationService.ConvertRgb565ToCssHex(back);
    }

    private static string DecodeHorizAlign(uint attrib)
    {
        if ((attrib & 0x0002) != 0) return "Right";
        if ((attrib & 0x0001) != 0) return "Center";
        return "Left";
    }

    private static string DecodeVertAlign(uint attrib)
    {
        if ((attrib & 0x0008) != 0) return "Bottom";
        if ((attrib & 0x0004) != 0) return "Middle";
        return "Top";
    }

    private static (string LseType, string PlcType, string VisuType) MapVarType(byte vartype)
    {
        return vartype switch
        {
            1 => ("STRING", "STRING", "STRING"),
            2 => ("TIME_LSE", "UDINT", "INT"),
            3 => ("DATE_LSE", "UDINT", "INT"),
            5 => ("BIT", "BOOL", "BOOL"),
            11 => ("OBJECT", "OBJECT", "INT"),
            13 => ("MERKER", "DINT", "INT"),
            14 => ("ENUM", "DINT", "INT"),
            _ => ("BINARY", "DINT", "INT")
        };
    }

    private static string MapIoTypeToSourceType(ushort ioTyp, bool isInput, ushort tboList, ushort urgeType)
    {
        return ioTyp switch
        {
            1 or 12 => isInput ? "NumericInput" : "NumericDisplay",
            2 or 13 or 15 => isInput ? "StringInput" : "StringDisplay",
            3 => "Checkbox",
            4 => "Bar",
            5 => tboList switch
            {
                10 => "DynamicImage",
                12 => "DynamicText",
                13 => "ObjectInstance",
                _ => "DynamicText"
            },
            6 => "DateDisplay",
            7 => "TimeDisplay",
            8 or 16 => "Enumeration",
            11 => "RadioButton",
            14 => urgeType switch
            {
                0x8000 => "Bar",
                0x8001 => "Gauge",
                0x8002 => "TimeDisplay",
                0x8006 => "Slider",
                0xFFFE => "TrendChart",
                _ => "UdcInstance"
            },
            _ => isInput ? "NumericInput" : "NumericDisplay"
        };
    }

    private static int GetCommandOperandCount(ushort cmd)
    {
        return cmd switch
        {
            10 or 11 or 12 or 16 or 18 or 21 or 22 or 24 or 31 or 33 or 40 => 1,
            5 or 8 or 9 or 17 or 19 or 20 or 23 or 25 or 26 or 27 or 35 or 37 or 38 or 39 => 2,
            _ => 0
        };
    }

    private static string MapPicCommandName(ushort cmd)
    {
        return cmd switch
        {
            0 => "CMD_NOP",
            1 => "CMD_START",
            2 => "CMD_NEWPICRET",
            3 => "CMD_EXIT",
            4 => "CMD_CLOSE",
            5 => "CMD_EDITNO",
            6 => "CMD_REDRAW",
            7 => "CMD_OUTSOFTKEY",
            8 => "CMD_NEWPICTURE",
            9 => "CMD_NEWWINDOW",
            10 => "CMD_NEWSOFTKEY",
            11 => "CMD_NEWLANGUAGE",
            12 => "CMD_EDIT",
            13 => "CMD_KILLEDITOR",
            14 => "CMD_SAVEEDITOR",
            15 => "CMD_RETURN",
            16 => "CMD_SCANCODE",
            17 => "CMD_CALL",
            18 => "CMD_BEEP",
            19 => "Add",
            20 => "Sub",
            21 => "Inc",
            22 => "Dec",
            23 => "SetValue",
            24 => "Toggle",
            25 => "Equal",
            26 => "Greater",
            27 => "Less",
            28 => "Else",
            29 => "EndIf",
            30 => "CMD_EXITPROGRAM",
            31 => "CMD_NEWPOPUP",
            32 => "CMD_CALL_ALARM",
            33 => "CMD_OVERLOAD",
            34 => "CMD_REDRAWTEXT",
            35 => "CMD_SCRNSCHEME",
            36 => "CMD_DIAGNOSTIC",
            37 => "CMD_OVERLOAD_OBJ",
            38 => "CMD_OVERLOAD_SUMMARY",
            39 => "CMD_LED",
            40 => "CMD_FUNCTIONBLOCK",
            _ => $"CMD_{cmd}"
        };
    }

    private static string MapSchemeOperator(byte op)
    {
        return op switch
        {
            0 => "<",
            1 => "<=",
            2 => "==",
            3 => ">=",
            4 => ">",
            5 => "!=",
            _ => "=="
        };
    }

    public static string MapLcidToBcp47(int lcid)
    {
        return lcid switch
        {
            1031 or 3079 or 2055 => "de-DE",
            1033 or 2057 => "en-US",
            1036 => "fr-FR",
            1040 => "it-IT",
            1034 or 3082 => "es-ES",
            1043 => "nl-NL",
            1045 => "pl-PL",
            1029 => "cs-CZ",
            1030 => "da-DK",
            1035 => "fi-FI",
            1053 => "sv-SE",
            1044 or 2068 => "no-NO",
            1038 => "hu-HU",
            1049 => "ru-RU",
            2052 => "zh-CN",
            1041 => "ja-JP",
            _ => $"lang-{lcid}"
        };
    }

    private static int ParseTrailingNumber(string s)
    {
        if (int.TryParse(s, System.Globalization.NumberStyles.HexNumber, null, out var hex))
        {
            return hex;
        }
        if (int.TryParse(s, out var dec))
        {
            return dec;
        }
        return 0;
    }

    private static string SanitizeIdentifier(string raw)
    {
        var sb = new StringBuilder(raw.Length);
        foreach (var ch in raw)
        {
            if (char.IsLetterOrDigit(ch)) sb.Append(ch);
            else if (ch == ' ' || ch == '_' || ch == '-') sb.Append('_');
        }
        var res = sb.ToString().Trim('_');
        return string.IsNullOrEmpty(res) ? "Ctrl" : (res.Length > 24 ? res[..24] : res);
    }

    private sealed record PrjEntryRecord(ushort FType, ushort No, string FileName);
    private readonly record struct RoomCoords(short X1, short Y1, short X2, short Y2);
    private sealed record RawVarInfo(
        int Index,
        byte VarType,
        uint ClassId,
        double? LoLim,
        double? HiLim,
        ushort AccessNo,
        ushort Format,
        byte Station,
        ushort FUnit,
        ushort FUnitScheme,
        ushort RefTime,
        uint Crc32);
}
