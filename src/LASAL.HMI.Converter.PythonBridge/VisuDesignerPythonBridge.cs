using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using LASAL.HMI.Converter.Infrastructure;

namespace LASAL.HMI.Converter.PythonBridge;

/// <summary>
/// Executes Python 3.12 automation scripts inside SIGMATEK LASAL VISUDesigner
/// ("VISUDesigner.exe --script &lt;script.py&gt;") using the official sigmatek.lasal.lvd module.
/// Serializes execution with an inter-process mutex and captures structured JSON result markers.
/// </summary>
public sealed class VisuDesignerPythonBridge
{
    private static readonly SemaphoreSlim VisuLock = new(1, 1);

    public async Task<VisuScriptResult> ExecuteScriptAsync(
        string pythonBody,
        string workingDirectory,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(pythonBody);
        Directory.CreateDirectory(workingDirectory);

        var visuExe = SoftwareEnvironmentDetector.DefaultVisuDesignerExePath;
        if (!File.Exists(visuExe))
        {
            return new VisuScriptResult
            {
                Success = false,
                ErrorMessage = $"VISUDesigner.exe not found at '{visuExe}'."
            };
        }

        await VisuLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            using var watchdog = new DialogWatchdog("VISUDesigner", "Error", "Warning");

            var runId = Guid.NewGuid().ToString("N")[..8];
            var scriptPath = Path.Combine(workingDirectory, $"_lvd_script_{runId}.py");
            var resultJsonPath = Path.Combine(workingDirectory, $"_lvd_result_{runId}.json");

            var wrappedScript = BuildWrappedPythonScript(pythonBody, resultJsonPath);
            await File.WriteAllTextAsync(scriptPath, wrappedScript, new UTF8Encoding(false), cancellationToken).ConfigureAwait(false);

            var psi = new ProcessStartInfo
            {
                FileName = visuExe,
                Arguments = $"--script \"{scriptPath}\"",
                WorkingDirectory = workingDirectory,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var proc = Process.Start(psi)
                ?? throw new InvalidOperationException("Failed to launch VISUDesigner.exe --script process.");

            var effectiveTimeout = timeout ?? TimeSpan.FromSeconds(120);
            var deadline = DateTime.UtcNow + effectiveTimeout;
            DateTime? resultWrittenAt = null;

            try
            {
                while (!proc.HasExited)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    if (File.Exists(resultJsonPath))
                    {
                        resultWrittenAt ??= DateTime.UtcNow;
                        if ((DateTime.UtcNow - resultWrittenAt.Value).TotalSeconds >= 5.0)
                        {
                            try { proc.Kill(entireProcessTree: true); } catch { }
                            break;
                        }
                    }
                    if (DateTime.UtcNow >= deadline)
                    {
                        try { proc.Kill(entireProcessTree: true); } catch { }
                        return new VisuScriptResult
                        {
                            Success = false,
                            ErrorMessage = $"VISUDesigner.exe --script timed out after {effectiveTimeout.TotalSeconds}s."
                        };
                    }
                    await Task.Delay(250, cancellationToken).ConfigureAwait(false);
                }
            }
            catch (OperationCanceledException)
            {
                try { proc.Kill(entireProcessTree: true); } catch { }
                return new VisuScriptResult
                {
                    Success = false,
                    ErrorMessage = "VISUDesigner.exe --script was cancelled."
                };
            }
            finally
            {
                try { if (File.Exists(scriptPath)) File.Delete(scriptPath); } catch { }
            }

            if (File.Exists(resultJsonPath))
            {
                var json = await File.ReadAllTextAsync(resultJsonPath, Encoding.UTF8, cancellationToken).ConfigureAwait(false);
                try { File.Delete(resultJsonPath); } catch { }

                var parsed = JsonSerializer.Deserialize<VisuScriptResult>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (parsed != null)
                {
                    return parsed;
                }
            }

            return new VisuScriptResult
            {
                Success = proc.ExitCode == 0,
                ErrorMessage = proc.ExitCode == 0 ? string.Empty : $"VISUDesigner exited with code {proc.ExitCode} without writing result JSON."
            };
        }
        finally
        {
            VisuLock.Release();
        }
    }

    private static string BuildWrappedPythonScript(string userPythonBody, string resultJsonPath)
    {
        var escapedJsonPath = resultJsonPath.Replace("\\", "\\\\");
        var indentedBody = new StringBuilder();
        foreach (var line in userPythonBody.Replace("\r\n", "\n").Split('\n'))
        {
            indentedBody.AppendLine("    " + line);
        }

        return $$"""
import json
import traceback
from sigmatek.lasal import lvd

try:
    lvd.SetExceptionOnError(False)
except Exception:
    pass

_result = {
    "success": False,
    "errorMessage": "",
    "steps": [],
    "publishedWebrootPath": ""
}

def _record(step_name, ok):
    _result["steps"].append({"step": step_name, "ok": bool(ok)})
    return bool(ok)

try:
{{indentedBody}}
    _result["success"] = True
except Exception as ex:
    _result["success"] = False
    _result["errorMessage"] = f"{ex}\n{traceback.format_exc()}"
finally:
    try:
        lvd.CloseAllProjects()
    except Exception:
        pass
    with open("{{escapedJsonPath}}", "w", encoding="utf-8") as f:
        json.dump(_result, f, indent=2)
""";
    }
}

public sealed class VisuScriptResult
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("errorMessage")]
    public string ErrorMessage { get; set; } = string.Empty;

    [JsonPropertyName("steps")]
    public List<VisuScriptStepResult> Steps { get; set; } = new();

    [JsonPropertyName("publishedWebrootPath")]
    public string PublishedWebrootPath { get; set; } = string.Empty;
}

public sealed class VisuScriptStepResult
{
    [JsonPropertyName("step")]
    public string Step { get; set; } = string.Empty;

    [JsonPropertyName("ok")]
    public bool Ok { get; set; }
}
