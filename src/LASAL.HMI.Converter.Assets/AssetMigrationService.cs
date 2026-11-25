using System;
using System.Collections.Generic;
using System.IO;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace LASAL.HMI.Converter.Assets;

/// <summary>
/// Extracts, processes, and converts graphic assets (BMP, JPG, PNG, SVG, GIF) from a LASAL SCREEN project
/// into native VISUDesigner Resources.
/// Converts LASAL SCREEN BMP transparent key colors (e.g., Magic Pink #FF00FF / RGB(255,0,255) or custom key)
/// into true 32-bit RGBA PNG alpha transparency using SixLabors.ImageSharp.
/// </summary>
public sealed class AssetMigrationService
{
    private static readonly Rgba32 DefaultMagicPink = new(255, 0, 255, 255);

    /// <summary>
    /// Scans the staged LASAL SCREEN Image\ directory and populates <see cref="HmiIntermediateModel.Assets"/>.
    /// </summary>
    public void DiscoverAssets(string stagedProjectDir, HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        var imageDir = Path.Combine(stagedProjectDir, "Image");
        if (!Directory.Exists(imageDir))
        {
            return;
        }

        var existingByOriginal = new HashSet<string>(
            StringComparer.OrdinalIgnoreCase);
        foreach (var existing in model.Assets)
        {
            existingByOriginal.Add(existing.OriginalFileName);
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
            if (existingByOriginal.Contains(fileName))
            {
                continue;
            }

            var relPath = Path.GetRelativePath(stagedProjectDir, file);
            var isBmp = string.Equals(ext, ".bmp", StringComparison.OrdinalIgnoreCase);
            var targetFileName = isBmp
                ? Path.GetFileNameWithoutExtension(fileName) + ".png"
                : fileName;

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

            model.Assets.Add(new AssetModel
            {
                Id = Path.GetFileNameWithoutExtension(fileName),
                Index = model.Assets.Count,
                OriginalFileName = fileName,
                OriginalRelativePath = relPath,
                TargetFileName = targetFileName,
                Format = isBmp ? "PNG" : ext.TrimStart('.').ToUpperInvariant(),
                Width = width,
                Height = height,
                HasTransparencyKey = hasMagicPink,
                TransparencyKeyCssHex = hasMagicPink ? "#FF00FF" : null
            });

            existingByOriginal.Add(fileName);
        }
    }

    /// <summary>
    /// Processes all assets in <paramref name="model"/> from <paramref name="sourceProjectDir"/>
    /// into <paramref name="targetResourcesDir"/>, converting BMPs to RGBA PNGs with transparent key removal.
    /// Returns the list of full target file paths written.
    /// </summary>
    public List<string> ExportAssetsToTargetResources(
        string sourceProjectDir,
        string targetResourcesDir,
        HmiIntermediateModel model,
        bool convertBmpTransparencyToPng = true)
    {
        ArgumentNullException.ThrowIfNull(model);
        Directory.CreateDirectory(targetResourcesDir);
        var exportedPaths = new List<string>();

        foreach (var asset in model.Assets)
        {
            var srcPath = Path.Combine(sourceProjectDir, asset.OriginalRelativePath);
            if (!File.Exists(srcPath))
            {
                var fallback = Path.Combine(sourceProjectDir, "Image", asset.OriginalFileName);
                if (File.Exists(fallback))
                {
                    srcPath = fallback;
                }
                else
                {
                    ConverterLogger.Warn($"Asset file not found on disk: '{asset.OriginalRelativePath}'");
                    continue;
                }
            }

            var isBmp = Path.GetExtension(srcPath).Equals(".bmp", StringComparison.OrdinalIgnoreCase);
            var outFileName = (isBmp && convertBmpTransparencyToPng)
                ? Path.GetFileNameWithoutExtension(asset.OriginalFileName) + ".png"
                : asset.OriginalFileName;
            asset.TargetFileName = outFileName;

            var destPath = Path.Combine(targetResourcesDir, outFileName);

            try
            {
                if (isBmp && convertBmpTransparencyToPng)
                {
                    ConvertBmpToTransparentPng(srcPath, destPath, ParseKeyColorOrDefault(asset.TransparencyKeyCssHex));
                }
                else
                {
                    File.Copy(srcPath, destPath, overwrite: true);
                }

                exportedPaths.Add(destPath);
            }
            catch (Exception ex)
            {
                ConverterLogger.Warn($"Image conversion fallback for '{asset.OriginalFileName}': {ex.Message}");
                var rawDest = Path.Combine(targetResourcesDir, asset.OriginalFileName);
                File.Copy(srcPath, rawDest, overwrite: true);
                asset.TargetFileName = asset.OriginalFileName;
                exportedPaths.Add(rawDest);
            }
        }

        return exportedPaths;
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
