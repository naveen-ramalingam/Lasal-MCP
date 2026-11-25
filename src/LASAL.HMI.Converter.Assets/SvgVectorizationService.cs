using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Infrastructure;

namespace LASAL.HMI.Converter.Assets;

/// <summary>
/// Pluggable contract for converting raster HMI assets (transparent PNGs) into 1:1 scalable SVG vectors.
/// Implementations include deterministic local tracing (<see cref="VTracerSvgConverter"/>) and
/// multimodal AI Vision-to-SVG (<see cref="AiVisionSvgConverter"/>).
/// </summary>
public interface ISvgConverter
{
    string EngineName { get; }
    bool IsAvailable { get; }
    Task<SvgConversionResult> ConvertToSvgAsync(
        string inputPngPath,
        string outputSvgPath,
        SvgConversionOptions options,
        CancellationToken cancellationToken = default);
}

public sealed record SvgConversionResult(
    bool Success,
    string EngineUsed,
    string OutputPath,
    string? Message = null);

public sealed class SvgConversionOptions
{
    public bool Enabled { get; set; } = true;
    /// <summary>
    /// "VTracer" (deterministic 1:1 local color spline tracing), "AI" (Gemini/OpenAI vision interface),
    /// or "Hybrid" (1:1 VTracer for all assets + optional AI refinement for selected hero icons/logos).
    /// </summary>
    public string Mode { get; set; } = "Hybrid";
    /// <summary>
    /// Skip vectorizing huge photographic backdrops above this pixel count unless forced (keeps crisp PNG).
    /// Default 262,144 pixels (e.g. 512x512); machine diagrams/icons/logos/buttons are all vectorized to 1:1 SVG.
    /// </summary>
    public int MaxPixelsForVectorization { get; set; } = 1024 * 768;
    /// <summary>
    /// Maximum output SVG byte budget relative to source PNG before falling back to PNG for noisy photos.
    /// Set to 0 for unconditional 1:1 SVG output.
    /// </summary>
    public int MaxSvgBytes { get; set; } = 350_000;
    public int ColorPrecision { get; set; } = 8;
    public int FilterSpeckle { get; set; } = 1;
    public int GradientStep { get; set; } = 10;
    public int CornerThreshold { get; set; } = 45;
    public double SegmentLength { get; set; } = 3.5;
    public int SpliceThreshold { get; set; } = 45;
    public int MaxParallelism { get; set; } = Math.Clamp(Environment.ProcessorCount, 2, 8);

    // Optional AI Vision-to-SVG interface configuration (Gemini or OpenAI-compatible REST endpoint)
    public string? AiProvider { get; set; } = Environment.GetEnvironmentVariable("LASAL_AI_SVG_PROVIDER") ?? "Gemini";
    public string? AiApiKey { get; set; } = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    public string? AiModel { get; set; } = Environment.GetEnvironmentVariable("LASAL_AI_SVG_MODEL") ?? "gemini-2.5-flash";
    public string? AiEndpointUrl { get; set; } = Environment.GetEnvironmentVariable("LASAL_AI_SVG_ENDPOINT");
}

/// <summary>
/// Deterministic 1:1 color Bezier-spline SVG vectorizer powered by visioncortex VTracer.
/// Preserves exact geometry, alpha transparency, labels, and industrial schematic accuracy without AI hallucination.
/// </summary>
public sealed class VTracerSvgConverter : ISvgConverter
{
    public string EngineName => "VTracer";
    public string? ExecutablePath { get; }
    public bool IsAvailable => !string.IsNullOrEmpty(ExecutablePath) && File.Exists(ExecutablePath);

    public VTracerSvgConverter(string? explicitExePath = null)
    {
        ExecutablePath = ResolveVTracerPath(explicitExePath);
    }

    public async Task<SvgConversionResult> ConvertToSvgAsync(
        string inputPngPath,
        string outputSvgPath,
        SvgConversionOptions options,
        CancellationToken cancellationToken = default)
    {
        if (!IsAvailable)
        {
            return new SvgConversionResult(false, EngineName, outputSvgPath, "vtracer.exe not found on PATH or Cargo bin.");
        }

        try
        {
            var args = $"--input \"{inputPngPath}\" --output \"{outputSvgPath}\" " +
                       $"--colormode color --hierarchical stacked --mode spline " +
                       $"--filter_speckle {options.FilterSpeckle} " +
                       $"--color_precision {options.ColorPrecision} " +
                       $"--gradient_step {options.GradientStep} " +
                       $"--corner_threshold {options.CornerThreshold} " +
                       $"--segment_length {options.SegmentLength.ToString(System.Globalization.CultureInfo.InvariantCulture)} " +
                       $"--splice_threshold {options.SpliceThreshold}";

            var psi = new ProcessStartInfo
            {
                FileName = ExecutablePath!,
                Arguments = args,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using var proc = Process.Start(psi);
            if (proc == null)
            {
                return new SvgConversionResult(false, EngineName, outputSvgPath, "Failed to launch vtracer process.");
            }

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));
            await proc.WaitForExitAsync(timeoutCts.Token).ConfigureAwait(false);

            if (proc.ExitCode == 0 && File.Exists(outputSvgPath) && new FileInfo(outputSvgPath).Length > 0)
            {
                EnsureSvgViewBox(outputSvgPath);
                return new SvgConversionResult(true, EngineName, outputSvgPath);
            }

            var stderr = await proc.StandardError.ReadToEndAsync(cancellationToken).ConfigureAwait(false);
            return new SvgConversionResult(false, EngineName, outputSvgPath, $"vtracer exited with code {proc.ExitCode}: {stderr}");
        }
        catch (Exception ex)
        {
            return new SvgConversionResult(false, EngineName, outputSvgPath, ex.Message);
        }
    }

    /// <summary>
    /// Ensures the generated SVG root element has an explicit viewBox so VISUDesigner CSS background-size: contain/stretch scales 1:1 cleanly.
    /// </summary>
    public static void EnsureSvgViewBox(string svgPath)
    {
        var svg = File.ReadAllText(svgPath, Encoding.UTF8);
        if (svg.Contains("viewBox=", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }
        var m = Regex.Match(svg, @"<svg(?<pre>[^>]*?)width=""(?<w>\d+(?:\.\d+)?)""(?<mid>[^>]*?)height=""(?<h>\d+(?:\.\d+)?)""(?<post>[^>]*)>", RegexOptions.IgnoreCase);
        if (m.Success)
        {
            var w = m.Groups["w"].Value;
            var h = m.Groups["h"].Value;
            var updated = svg.Replace(
                m.Value,
                $"<svg{m.Groups["pre"].Value}width=\"{w}\"{m.Groups["mid"].Value}height=\"{h}\" viewBox=\"0 0 {w} {h}\"{m.Groups["post"].Value}>");
            File.WriteAllText(svgPath, updated, new UTF8Encoding(false));
        }
    }

    public static string? ResolveVTracerPath(string? explicitPath = null)
    {
        if (!string.IsNullOrWhiteSpace(explicitPath) && File.Exists(explicitPath))
        {
            return explicitPath;
        }

        var candidates = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".cargo", "bin", "vtracer.exe"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "vtracer.exe"),
            @"C:\SigmaControl\tools\vtracer.exe"
        };

        foreach (var c in candidates)
        {
            if (File.Exists(c)) return c;
        }

        var pathEnv = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        foreach (var dir in pathEnv.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            var full = Path.Combine(dir.Trim(), "vtracer.exe");
            if (File.Exists(full)) return full;
        }

        return null;
    }
}

/// <summary>
/// Multimodal AI Vision-to-SVG converter supporting Google Gemini API and OpenAI-compatible vision endpoints.
/// Sends a base64-encoded transparent PNG and requests clean, 1:1 viewBox-matched semantic SVG markup.
/// </summary>
public sealed class AiVisionSvgConverter : ISvgConverter
{
    private static readonly HttpClient SharedHttp = new() { Timeout = TimeSpan.FromSeconds(60) };
    private readonly SvgConversionOptions _defaultOptions;

    public string EngineName => $"AI-Vision ({_defaultOptions.AiProvider ?? "Gemini"})";
    public bool IsAvailable => !string.IsNullOrWhiteSpace(_defaultOptions.AiApiKey);

    public AiVisionSvgConverter(SvgConversionOptions? options = null)
    {
        _defaultOptions = options ?? new SvgConversionOptions();
    }

    public async Task<SvgConversionResult> ConvertToSvgAsync(
        string inputPngPath,
        string outputSvgPath,
        SvgConversionOptions options,
        CancellationToken cancellationToken = default)
    {
        var apiKey = options.AiApiKey ?? _defaultOptions.AiApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new SvgConversionResult(false, EngineName, outputSvgPath, "AI API key not configured (set GEMINI_API_KEY or OPENAI_API_KEY).");
        }

        try
        {
            var imgBytes = await File.ReadAllBytesAsync(inputPngPath, cancellationToken).ConfigureAwait(false);
            var b64 = Convert.ToBase64String(imgBytes);
            var provider = (options.AiProvider ?? _defaultOptions.AiProvider ?? "Gemini").Trim();
            var model = options.AiModel ?? _defaultOptions.AiModel ?? "gemini-2.5-flash";

            const string prompt =
                "Convert this industrial HMI bitmap image into an exact 1-to-1 scalable SVG vector graphic. " +
                "Preserve the exact pixel dimensions in width, height, and viewBox, preserve all colors, shapes, symbols, and transparent background. " +
                "Return ONLY the raw <svg ...>...</svg> markup with no markdown fences or explanation.";

            string rawText;
            if (provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) ||
                provider.Equals("OpenAICompatible", StringComparison.OrdinalIgnoreCase))
            {
                var endpoint = !string.IsNullOrWhiteSpace(options.AiEndpointUrl)
                    ? options.AiEndpointUrl!
                    : "https://api.openai.com/v1/chat/completions";
                var payload = new
                {
                    model,
                    messages = new object[]
                    {
                        new
                        {
                            role = "user",
                            content = new object[]
                            {
                                new { type = "text", text = prompt },
                                new { type = "image_url", image_url = new { url = $"data:image/png;base64,{b64}" } }
                            }
                        }
                    }
                };
                using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                using var resp = await SharedHttp.SendAsync(req, cancellationToken).ConfigureAwait(false);
                var body = await resp.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                if (!resp.IsSuccessStatusCode)
                {
                    return new SvgConversionResult(false, EngineName, outputSvgPath, $"AI API HTTP {(int)resp.StatusCode}: {body}");
                }
                using var doc = JsonDocument.Parse(body);
                rawText = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
            }
            else
            {
                var endpoint = !string.IsNullOrWhiteSpace(options.AiEndpointUrl)
                    ? options.AiEndpointUrl!
                    : $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                var payload = new
                {
                    contents = new object[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = prompt },
                                new { inline_data = new { mime_type = "image/png", data = b64 } }
                            }
                        }
                    }
                };
                using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
                req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                using var resp = await SharedHttp.SendAsync(req, cancellationToken).ConfigureAwait(false);
                var body = await resp.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                if (!resp.IsSuccessStatusCode)
                {
                    return new SvgConversionResult(false, EngineName, outputSvgPath, $"Gemini API HTTP {(int)resp.StatusCode}: {body}");
                }
                using var doc = JsonDocument.Parse(body);
                rawText = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? string.Empty;
            }

            var svgMatch = Regex.Match(rawText, @"<svg[\s\S]*?</svg>", RegexOptions.IgnoreCase);
            if (!svgMatch.Success)
            {
                return new SvgConversionResult(false, EngineName, outputSvgPath, "AI response did not contain a valid <svg>...</svg> document.");
            }

            await File.WriteAllTextAsync(outputSvgPath, svgMatch.Value, new UTF8Encoding(false), cancellationToken).ConfigureAwait(false);
            VTracerSvgConverter.EnsureSvgViewBox(outputSvgPath);
            return new SvgConversionResult(true, EngineName, outputSvgPath);
        }
        catch (Exception ex)
        {
            return new SvgConversionResult(false, EngineName, outputSvgPath, ex.Message);
        }
    }
}
