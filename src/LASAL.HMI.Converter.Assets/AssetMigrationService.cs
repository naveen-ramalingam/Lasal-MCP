using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace LASAL.HMI.Converter.Assets;

/// <summary>
/// Extracts, processes, and converts graphic assets from a LASAL SCREEN project into native VISUDesigner Resources.
/// Capabilities:
///   1. Authoritative decoding of compiled Runtime\LS0003.MPC bitmaps (preserving exact per-image RGB565 transparency key
///      such as 0xFFFF white, 0x0000 black, 0xF81F magic pink, plus BMP_NO_TRANSPARENT (0x0004) and BMP_TURN (0x0001) flags).
///   2. Fallback disk BMP/JPG/PNG/SVG cataloging from Image\ directory with exact key-color alpha conversion.
///   3. 1:1 scalable SVG vectorization via VTracer and/or pluggable AI Vision-to-SVG (<see cref="ISvgConverter"/>).
/// </summary>
public sealed class AssetMigrationService
{
    private static readonly Rgba32 DefaultMagicPink = new(255, 0, 255, 255);

    /// <summary>
    /// Scans the staged LASAL SCREEN Image\ directory and reconciles with any LS0003.MPC asset entries already in <see cref="HmiIntermediateModel.Assets"/>.
    /// </summary>
    public void DiscoverAssets(string stagedProjectDir, HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        var imageDir = Path.Combine(stagedProjectDir, "Image");
        if (!Directory.Exists(imageDir))
        {
            return;
        }

        var existingById = new Dictionary<string, AssetModel>(StringComparer.OrdinalIgnoreCase);
        var existingByOriginal = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var existing in model.Assets)
        {
            existingByOriginal.Add(existing.OriginalFileName);
            existingById[existing.Id] = existing;
        }

        var supportedExts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".bmp", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico"
        };

        var files = Directory.GetFiles(imageDir, "*.*", SearchOption.AllDirectories);
        Array.Sort(files, StringComparer.OrdinalIgnoreCase);

        foreach (var file in files)
        {
            var ext = Path.GetExtension(file);
            if (!supportedExts.Contains(ext))
            {
                continue;
            }

            var fileName = Path.GetFileName(file);
            var stem = Path.GetFileNameWithoutExtension(fileName);
            var relPath = Path.GetRelativePath(stagedProjectDir, file);
            var isBmp = string.Equals(ext, ".bmp", StringComparison.OrdinalIgnoreCase);
            var targetFileName = isBmp ? stem + ".png" : fileName;

            // If LS0003.MPC already registered this image ID, enrich its disk path while keeping the authoritative MPC transparency metadata!
            if (existingById.TryGetValue(stem, out var mpcAsset))
            {
                mpcAsset.OriginalFileName = fileName;
                mpcAsset.OriginalRelativePath = relPath;
                if (!isBmp && !mpcAsset.HasTransparencyKey)
                {
                    mpcAsset.TargetFileName = fileName;
                    mpcAsset.Format = ext.TrimStart('.').ToUpperInvariant();
                }
                existingByOriginal.Add(fileName);
                continue;
            }

            if (existingByOriginal.Contains(fileName))
            {
                continue;
            }

            var width = 0;
            var height = 0;
            var hasMagicPink = false;

            if (!string.Equals(ext, ".svg", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using var img = Image.Load<Rgba32>(file);
                    width = img.Width;
                    height = img.Height;
                    if (isBmp)
                    {
                        hasMagicPink = ContainsPixelColor(img, DefaultMagicPink);
                    }
                }
                catch (Exception ex)
                {
                    ConverterLogger.Warn($"Could not inspect image header for '{fileName}': {ex.Message}");
                }
            }

            var added = new AssetModel
            {
                Id = stem,
                Index = model.Assets.Count,
                OriginalFileName = fileName,
                OriginalRelativePath = relPath,
                TargetFileName = targetFileName,
                Format = isBmp ? "PNG" : ext.TrimStart('.').ToUpperInvariant(),
                Width = width,
                Height = height,
                HasTransparencyKey = hasMagicPink,
                TransparencyKeyCssHex = hasMagicPink ? "#FF00FF" : null
            };
            model.Assets.Add(added);
            existingByOriginal.Add(fileName);
            existingById[stem] = added;
        }
    }

    /// <summary>
    /// Processes all assets in <paramref name="model"/> from <paramref name="sourceProjectDir"/>
    /// into <paramref name="targetResourcesDir"/>:
    ///   - Extracts authoritative bitmaps (with exact RGB565 transparency key) from Runtime\LS0003.MPC whenever available
    ///   - Falls back to disk Image\* files for any non-MPC assets
    ///   - Optionally vectorizes clean assets 1:1 into scalable SVG via VTracer / AI Vision interface.
    /// </summary>
    public List<string> ExportAssetsToTargetResources(
        string sourceProjectDir,
        string targetResourcesDir,
        HmiIntermediateModel model,
        bool convertBmpTransparencyToPng = true,
        SvgConversionOptions? svgOptions = null,
        ISvgConverter? customSvgConverter = null)
    {
        ArgumentNullException.ThrowIfNull(model);
        Directory.CreateDirectory(targetResourcesDir);

        // 1. Pre-load compiled LS0003.MPC bitmap records once so we have 100% coverage & exact transparency
        var mpcPath = Path.Combine(sourceProjectDir, "Runtime", "LS0003.MPC");
        var mpcBank = File.Exists(mpcPath) ? LoadMpcImageBank(mpcPath) : null;

        var pngIntermediateMap = new List<(AssetModel Asset, string RasterPath, bool EligibleForSvg)>();

        foreach (var asset in model.Assets)
        {
            var safeStem = SanitizeAssetStem(asset.Id);
            var diskPath = ResolveSourceDiskPath(sourceProjectDir, asset);
            var isDiskJpg = diskPath != null &&
                            (Path.GetExtension(diskPath).Equals(".jpg", StringComparison.OrdinalIgnoreCase) ||
                             Path.GetExtension(diskPath).Equals(".jpeg", StringComparison.OrdinalIgnoreCase));
            var isDiskSvg = diskPath != null &&
                            Path.GetExtension(diskPath).Equals(".svg", StringComparison.OrdinalIgnoreCase);

            // Case A: Native SVG already on disk
            if (isDiskSvg && diskPath != null)
            {
                var destSvg = Path.Combine(targetResourcesDir, safeStem + ".svg");
                File.Copy(diskPath, destSvg, overwrite: true);
                asset.TargetFileName = Path.GetFileName(destSvg);
                asset.Format = "SVG";
                asset.ConversionMode = "NativeSVG";
                pngIntermediateMap.Add((asset, destSvg, false));
                continue;
            }

            // Case B: Authoritative LS0003.MPC image exists!
            // If it has a transparency key (0xFFFF white, 0x0000 black, 0xF81F pink, etc.) OR is missing from disk,
            // decode directly from LS0003.MPC (or apply the exact MPC RGB565 key to full 24-bit disk BMP for maximum fidelity!)
            if (mpcBank != null && asset.MpcImageIndex.HasValue &&
                asset.MpcImageIndex.Value >= 0 && asset.MpcImageIndex.Value < mpcBank.Records.Count)
            {
                var rec = mpcBank.Records[asset.MpcImageIndex.Value];
                var hasTrans = (rec.State & 0x0004) == 0;
                var outPng = Path.Combine(targetResourcesDir, safeStem + ".png");

                try
                {
                    if (diskPath != null && !isDiskJpg && File.Exists(diskPath) && convertBmpTransparencyToPng)
                    {
                        // Use full 24-bit source BMP pixels + exact LS0003.MPC RGB565 transparency matching
                        ConvertDiskBitmapWithMpcTransparency(diskPath, outPng, hasTrans, rec.TransparentRgb565);
                    }
                    else if (isDiskJpg && !hasTrans && diskPath != null && File.Exists(diskPath))
                    {
                        // Opaque JPEG without transparency: keep crisp JPEG unless SVG vectorization is explicitly requested
                        var outJpg = Path.Combine(targetResourcesDir, safeStem + Path.GetExtension(diskPath).ToLowerInvariant());
                        File.Copy(diskPath, outJpg, overwrite: true);
                        asset.TargetFileName = Path.GetFileName(outJpg);
                        asset.Format = "JPG";
                        asset.ConversionMode = "JPG";
                        pngIntermediateMap.Add((asset, outJpg, true));
                        continue;
                    }
                    else
                    {
                        // Decode directly from compiled LS0003.MPC RLE packets (fixes all 254 missing disk images + transparent JPEGs!)
                        DecodeMpcRecordToPng(mpcBank.RawBytes, rec, outPng);
                    }

                    asset.TargetFileName = Path.GetFileName(outPng);
                    asset.Format = "PNG";
                    asset.ConversionMode = hasTrans ? "MPC-RGBA-PNG" : "PNG";
                    pngIntermediateMap.Add((asset, outPng, true));
                    continue;
                }
                catch (Exception ex)
                {
                    ConverterLogger.Warn($"LS0003.MPC decode fallback for '{asset.Id}': {ex.Message}");
                }
            }

            // Case C: Disk-only fallback (not in LS0003.MPC)
            if (diskPath == null || !File.Exists(diskPath))
            {
                ConverterLogger.Warn($"Asset file not found on disk or in LS0003.MPC: '{asset.Id}'");
                continue;
            }

            var isBmp = Path.GetExtension(diskPath).Equals(".bmp", StringComparison.OrdinalIgnoreCase);
            var outFileName = (isBmp && convertBmpTransparencyToPng)
                ? safeStem + ".png"
                : safeStem + Path.GetExtension(diskPath).ToLowerInvariant();
            var destPath = Path.Combine(targetResourcesDir, outFileName);

            try
            {
                if (isBmp && convertBmpTransparencyToPng)
                {
                    ConvertBmpToTransparentPng(diskPath, destPath, ParseKeyColorOrDefault(asset.TransparencyKeyCssHex));
                }
                else
                {
                    File.Copy(diskPath, destPath, overwrite: true);
                }

                asset.TargetFileName = Path.GetFileName(destPath);
                asset.Format = Path.GetExtension(destPath).TrimStart('.').ToUpperInvariant();
                asset.ConversionMode = asset.Format;
                pngIntermediateMap.Add((asset, destPath, !isDiskJpg));
            }
            catch (Exception ex)
            {
                ConverterLogger.Warn($"Image conversion fallback for '{asset.OriginalFileName}': {ex.Message}");
                var rawDest = Path.Combine(targetResourcesDir, safeStem + Path.GetExtension(diskPath).ToLowerInvariant());
                File.Copy(diskPath, rawDest, overwrite: true);
                asset.TargetFileName = Path.GetFileName(rawDest);
                pngIntermediateMap.Add((asset, rawDest, false));
            }
        }

        // 2. Optional 1:1 SVG vectorization stage (VTracer deterministic spline tracing + optional AI Vision interface)
        if (svgOptions != null && svgOptions.Enabled)
        {
            RunSvgVectorizationBatch(pngIntermediateMap, targetResourcesDir, svgOptions, customSvgConverter);
        }

        return pngIntermediateMap
            .Select(x => Path.Combine(targetResourcesDir, x.Asset.TargetFileName))
            .Where(File.Exists)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static void RunSvgVectorizationBatch(
        List<(AssetModel Asset, string RasterPath, bool EligibleForSvg)> items,
        string targetResourcesDir,
        SvgConversionOptions options,
        ISvgConverter? customConverter)
    {
        ISvgConverter? converter = customConverter;
        if (converter == null)
        {
            if (string.Equals(options.Mode, "AI", StringComparison.OrdinalIgnoreCase))
            {
                var ai = new AiVisionSvgConverter(options);
                converter = ai.IsAvailable ? ai : new VTracerSvgConverter();
            }
            else
            {
                var vt = new VTracerSvgConverter();
                if (vt.IsAvailable)
                {
                    converter = vt;
                }
                else
                {
                    var ai = new AiVisionSvgConverter(options);
                    if (ai.IsAvailable) converter = ai;
                }
            }
        }

        if (converter == null || !converter.IsAvailable)
        {
            ConverterLogger.Warn("SVG vectorization requested, but neither vtracer.exe nor AI API key is available; keeping transparent RGBA PNGs.");
            return;
        }

        ConverterLogger.Info($"Vectorizing eligible HMI assets 1:1 to SVG using {converter.EngineName} (parallelism={options.MaxParallelism})...");
        var convertedCount = 0;
        var skippedLargeOrPhoto = 0;
        var failedCount = 0;

        var parallelOpts = new ParallelOptions { MaxDegreeOfParallelism = options.MaxParallelism };
        Parallel.ForEach(items, parallelOpts, entry =>
        {
            if (!entry.EligibleForSvg || !File.Exists(entry.RasterPath)) return;

            var pixelCount = (long)Math.Max(1, entry.Asset.Width) * Math.Max(1, entry.Asset.Height);
            if (pixelCount > options.MaxPixelsForVectorization)
            {
                Interlocked.Increment(ref skippedLargeOrPhoto);
                return;
            }

            var safeStem = SanitizeAssetStem(entry.Asset.Id);
            var svgPath = Path.Combine(targetResourcesDir, safeStem + ".svg");

            // VTracer requires PNG/JPG input; ensure raster input is valid
            var res = converter.ConvertToSvgAsync(entry.RasterPath, svgPath, options).GetAwaiter().GetResult();
            if (res.Success && File.Exists(svgPath))
            {
                var svgSize = new FileInfo(svgPath).Length;
                if (options.MaxSvgBytes > 0 && svgSize > options.MaxSvgBytes)
                {
                    // Very noisy/photographic image produced a bloated SVG: keep crisp RGBA PNG
                    try { File.Delete(svgPath); } catch { }
                    Interlocked.Increment(ref skippedLargeOrPhoto);
                    return;
                }

                // Replace intermediate raster file with the crisp 1:1 SVG
                try
                {
                    if (!string.Equals(entry.RasterPath, svgPath, StringComparison.OrdinalIgnoreCase) && File.Exists(entry.RasterPath))
                    {
                        File.Delete(entry.RasterPath);
                    }
                }
                catch { }

                entry.Asset.TargetFileName = Path.GetFileName(svgPath);
                entry.Asset.Format = "SVG";
                entry.Asset.ConversionMode = $"1:1 SVG ({res.EngineUsed})";
                Interlocked.Increment(ref convertedCount);
            }
            else
            {
                try { if (File.Exists(svgPath)) File.Delete(svgPath); } catch { }
                Interlocked.Increment(ref failedCount);
            }
        });

        ConverterLogger.Info($"SVG vectorization complete: {convertedCount} converted to 1:1 SVG, {skippedLargeOrPhoto} kept as crisp PNG/JPG (photo/oversize), {failedCount} fallback.");
    }

    public static void ConvertBmpToTransparentPng(string bmpPath, string pngOutputPath, Rgba32 transparentKeyColor)
    {
        using var img = Image.Load<Rgba32>(bmpPath);
        img.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (var x = 0; x < row.Length; x++)
                {
                    ref var p = ref row[x];
                    if (p.R == transparentKeyColor.R &&
                        p.G == transparentKeyColor.G &&
                        p.B == transparentKeyColor.B)
                    {
                        p = new Rgba32(0, 0, 0, 0);
                    }
                }
            }
        });
        img.SaveAsPng(pngOutputPath);
    }

    /// <summary>
    /// Converts a full 24-bit source BMP to RGBA PNG using the exact LASAL SCREEN RGB565 transparency key from LS0003.MPC.
    /// For Magic Pink (0xF81F) or non-neutral keys, removes all matching pixels globally.
    /// For white (0xFFFF) or black (0x0000) keys, flood-fills from the image border so interior white/black fills
    /// (such as the white inside "JD" letters or the black "!" inside warning triangles) stay crisp and opaque.
    /// </summary>
    public static void ConvertDiskBitmapWithMpcTransparency(
        string bmpPath,
        string pngOutputPath,
        bool hasTransparency,
        ushort transparentRgb565)
    {
        using var img = Image.Load<Rgba32>(bmpPath);
        if (hasTransparency)
        {
            ApplySmartRgb565Transparency(img, transparentRgb565);
        }
        img.SaveAsPng(pngOutputPath);
    }

    /// <summary>
    /// Decodes a compiled RLE _BMP record directly from Runtime\LS0003.MPC into a 32-bit RGBA PNG.
    /// Handles both 16-bit RGB565 (_BMPDAT = 3B) and 8-bit (_BMPDAT256 = 2B), BMP_NO_TRANSPARENT (0x0004), and BMP_TURN (0x0001).
    /// </summary>
    public static void DecodeMpcRecordToPng(byte[] rawBytes, MpcImageRecord rec, string pngOutputPath)
    {
        var w = Math.Max(1, (int)rec.Width);
        var h = Math.Max(1, (int)rec.Height);
        var hasTrans = (rec.State & 0x0004) == 0;
        var isTurned = (rec.State & 0x0001) != 0;
        var totalPixels = w * h;
        var pixels = new Rgba32[totalPixels];
        var rawCols = new ushort[totalPixels];

        var p = rec.DataOffset;
        var dst = 0;
        for (uint k = 0; k < rec.DataNo && dst < totalPixels && p + rec.BytesPerPacket <= rawBytes.Length; k++)
        {
            var cnt = rawBytes[p];
            ushort col;
            if (rec.BytesPerPacket == 3)
            {
                col = BitConverter.ToUInt16(rawBytes, p + 1);
                p += 3;
            }
            else
            {
                col = rawBytes[p + 1];
                p += 2;
            }

            var r5 = (col >> 11) & 0x1F;
            var g6 = (col >> 5) & 0x3F;
            var b5 = col & 0x1F;
            var r8 = (byte)((r5 * 255 + 15) / 31);
            var g8 = (byte)((g6 * 255 + 31) / 63);
            var b8 = (byte)((b5 * 255 + 15) / 31);
            var rgba = new Rgba32(r8, g8, b8, 255);

            var end = Math.Min(totalPixels, dst + cnt);
            for (; dst < end; dst++)
            {
                pixels[dst] = rgba;
                rawCols[dst] = col;
            }
        }

        using var img = Image.LoadPixelData<Rgba32>(pixels, w, h);
        if (isTurned)
        {
            img.Mutate(ctx => ctx.Flip(FlipMode.Vertical));
        }

        if (hasTrans)
        {
            ApplySmartRgb565Transparency(img, rec.TransparentRgb565);
        }

        img.SaveAsPng(pngOutputPath);
    }

    private static void ApplySmartRgb565Transparency(Image<Rgba32> img, ushort transparentRgb565)
    {
        var w = img.Width;
        var h = img.Height;
        var isNeutralKey = transparentRgb565 == 0xFFFF || transparentRgb565 == 0x0000;

        static bool MatchesKey(Rgba32 p, ushort key, bool neutral)
        {
            var rgb565 = (ushort)(((p.R >> 3) << 11) | ((p.G >> 2) << 5) | (p.B >> 3));
            if (rgb565 == key) return true;
            if (neutral && key == 0xFFFF && p.R >= 248 && p.G >= 248 && p.B >= 248) return true;
            if (neutral && key == 0x0000 && p.R <= 8 && p.G <= 8 && p.B <= 8) return true;
            return false;
        }

        if (!isNeutralKey)
        {
            // Non-neutral chroma keys (e.g. Magic Pink 0xF81F) are stripped globally
            img.ProcessPixelRows(accessor =>
            {
                for (var y = 0; y < h; y++)
                {
                    var row = accessor.GetRowSpan(y);
                    for (var x = 0; x < w; x++)
                    {
                        if (MatchesKey(row[x], transparentRgb565, false))
                        {
                            row[x] = new Rgba32(0, 0, 0, 0);
                        }
                    }
                }
            });
            return;
        }

        // For pure white (0xFFFF) or pure black (0x0000) keys, flood-fill from outer border pixels
        // so outer background is cleanly removed while enclosed interior fills (like white inside "JD" or black "!") remain intact.
        var visited = new bool[w * h];
        var queue = new Queue<int>();

        void TryEnqueue(int x, int y)
        {
            var idx = y * w + x;
            if (visited[idx]) return;
            if (MatchesKey(img[x, y], transparentRgb565, true))
            {
                visited[idx] = true;
                queue.Enqueue(idx);
            }
        }

        for (var x = 0; x < w; x++)
        {
            TryEnqueue(x, 0);
            TryEnqueue(x, h - 1);
        }
        for (var y = 0; y < h; y++)
        {
            TryEnqueue(0, y);
            TryEnqueue(w - 1, y);
        }

        while (queue.Count > 0)
        {
            var idx = queue.Dequeue();
            var x = idx % w;
            var y = idx / w;
            img[x, y] = new Rgba32(0, 0, 0, 0);

            if (x > 0) TryEnqueue(x - 1, y);
            if (x + 1 < w) TryEnqueue(x + 1, y);
            if (y > 0) TryEnqueue(x, y - 1);
            if (y + 1 < h) TryEnqueue(x, y + 1);
        }
    }

    public static MpcImageBank? LoadMpcImageBank(string ls0003MpcPath)
    {
        try
        {
            var raw = File.ReadAllBytes(ls0003MpcPath);
            if (raw.Length < 132 || raw[6] != (byte)'s' || raw[16] != (byte)'o' || raw[18] != (byte)'w')
            {
                return null;
            }

            var singleImage = BitConverter.ToUInt16(raw, 128);
            if (singleImage != 0)
            {
                return null;
            }

            var no = BitConverter.ToUInt16(raw, 130);
            var records = new List<MpcImageRecord>(no);
            var pos = 132;
            for (var i = 0; i < no && pos + 12 <= raw.Length; i++)
            {
                var datano = BitConverter.ToUInt32(raw, pos);
                var w = BitConverter.ToUInt16(raw, pos + 4);
                var h = BitConverter.ToUInt16(raw, pos + 6);
                var trans = BitConverter.ToUInt16(raw, pos + 8);
                var state = BitConverter.ToUInt16(raw, pos + 10);
                pos += 12;
                var bpp = (state & 0x0008) != 0 ? 2 : 3;
                records.Add(new MpcImageRecord(i, w, h, trans, state, datano, pos, bpp));
                pos += (int)(datano * bpp);
            }

            return new MpcImageBank(raw, records);
        }
        catch (Exception ex)
        {
            ConverterLogger.Warn($"Could not load LS0003.MPC image bank: {ex.Message}");
            return null;
        }
    }

    public static string ConvertRgb565ToCssHex(ushort rgb565)
    {
        var r5 = (rgb565 >> 11) & 0x1F;
        var g6 = (rgb565 >> 5) & 0x3F;
        var b5 = rgb565 & 0x1F;

        var r8 = (r5 * 255 + 15) / 31;
        var g8 = (g6 * 255 + 31) / 63;
        var b8 = (b5 * 255 + 15) / 31;

        return $"#{r8:X2}{g8:X2}{b8:X2}";
    }

    private static string? ResolveSourceDiskPath(string sourceProjectDir, AssetModel asset)
    {
        if (!string.IsNullOrWhiteSpace(asset.OriginalRelativePath) &&
            !asset.OriginalRelativePath.EndsWith(".MPC", StringComparison.OrdinalIgnoreCase))
        {
            var p = Path.Combine(sourceProjectDir, asset.OriginalRelativePath);
            if (File.Exists(p)) return p;
        }

        var imgDir = Path.Combine(sourceProjectDir, "Image");
        if (!Directory.Exists(imgDir)) return null;

        if (!string.IsNullOrWhiteSpace(asset.OriginalFileName))
        {
            var direct = Path.Combine(imgDir, asset.OriginalFileName);
            if (File.Exists(direct)) return direct;
        }

        foreach (var ext in new[] { ".bmp", ".png", ".jpg", ".jpeg", ".svg", ".gif" })
        {
            var candidate = Path.Combine(imgDir, asset.Id + ext);
            if (File.Exists(candidate)) return candidate;
        }

        return null;
    }

    private static string SanitizeAssetStem(string id)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var sb = new StringBuilder(id.Length);
        foreach (var ch in id)
        {
            sb.Append(invalid.Contains(ch) ? '_' : ch);
        }
        var s = sb.ToString().Trim();
        return string.IsNullOrEmpty(s) ? "Asset" : s;
    }

    private static bool ContainsPixelColor(Image<Rgba32> img, Rgba32 color)
    {
        var found = false;
        img.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height && !found; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (var x = 0; x < row.Length; x++)
                {
                    var p = row[x];
                    if (p.R == color.R && p.G == color.G && p.B == color.B)
                    {
                        found = true;
                        break;
                    }
                }
            }
        });
        return found;
    }

    private static Rgba32 ParseKeyColorOrDefault(string? cssHex)
    {
        if (!string.IsNullOrWhiteSpace(cssHex) && Color.TryParseHex(cssHex, out var c))
        {
            return c.ToPixel<Rgba32>();
        }
        return DefaultMagicPink;
    }
}

public sealed record MpcImageRecord(
    int Index,
    ushort Width,
    ushort Height,
    ushort TransparentRgb565,
    ushort State,
    uint DataNo,
    int DataOffset,
    int BytesPerPacket);

public sealed record MpcImageBank(
    byte[] RawBytes,
    List<MpcImageRecord> Records);
