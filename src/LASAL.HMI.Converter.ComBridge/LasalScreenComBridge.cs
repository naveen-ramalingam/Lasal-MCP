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

namespace LASAL.HMI.Converter.ComBridge;

/// <summary>
/// Out-of-process 32-bit COM Automation Bridge for SIGMATEK LASAL SCREEN (LASALScreen.Application,
/// CLSID {82A49236-710D-4A68-8D66-1FC2312CABAB}).
/// Invokes 32-bit Windows PowerShell (SysWOW64) in STA mode on a short-path staged copy of the .lpr
/// project, executing:
///   1. Project Open &amp; optional Compile (to ensure Runtime\*.MPC is fresh)
///   2. Enumeration of Screens, Windows, Objects, TextLists, and Languages
///   3. Server list export (ExportServerlist -> MaeExp.txt)
///   4. Unlocked headless XML export (ExportLanguagesToXML + ExportTextListsToXML + AddContainerInfo + ExportToXML)
/// </summary>
public sealed class LasalScreenComBridge
{
    private static readonly SemaphoreSlim ComLock = new(1, 1);

    public async Task<LseComExtractionResult> ExtractProjectViaComAsync(
        string stagedLprPath,
        string outputArtifactsDir,
        bool compileIfRuntimeMissing = true,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(stagedLprPath);
        Directory.CreateDirectory(outputArtifactsDir);

        var ps32Path = SoftwareEnvironmentDetector.SysWow64PowerShellPath;
        if (!File.Exists(ps32Path))
        {
            return new LseComExtractionResult
            {
                Success = false,
                ErrorMessage = $"32-bit PowerShell not found at '{ps32Path}'."
            };
        }

        await ComLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            using var watchdog = new DialogWatchdog("LASAL Screen", "LSE", "Error", "Warning");

            var scriptPath = Path.Combine(outputArtifactsDir, "lse_com_extract.ps1");
            var jsonResultPath = Path.Combine(outputArtifactsDir, "lse_com_result.json");
            var exportedXmlPath = Path.Combine(outputArtifactsDir, "lse_export.xml");
            var exportedServerListPath = Path.Combine(outputArtifactsDir, "lse_servers_export.txt");

            var scriptContent = BuildPowerShellExtractionScript(
                stagedLprPath,
                exportedXmlPath,
                exportedServerListPath,
                jsonResultPath,
                compileIfRuntimeMissing);

            await File.WriteAllTextAsync(scriptPath, scriptContent, Encoding.UTF8, cancellationToken).ConfigureAwait(false);

            var psi = new ProcessStartInfo
            {
                FileName = ps32Path,
                Arguments = $"-NoProfile -NonInteractive -ExecutionPolicy Bypass -Sta -File \"{scriptPath}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = Path.GetDirectoryName(stagedLprPath) ?? outputArtifactsDir
            };

            using var proc = Process.Start(psi)
                ?? throw new InvalidOperationException("Failed to start 32-bit PowerShell COM bridge process.");

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(60));

            try
            {
                await proc.WaitForExitAsync(timeoutCts.Token).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                try { proc.Kill(entireProcessTree: true); } catch { }
                CleanupOrphanedLseProcesses();
                return new LseComExtractionResult
                {
                    Success = false,
                    ErrorMessage = "LASALScreen.Application COM extraction timed out after 60 seconds."
                };
            }

            if (File.Exists(jsonResultPath))
            {
                var json = await File.ReadAllTextAsync(jsonResultPath, Encoding.UTF8, cancellationToken).ConfigureAwait(false);
                var result = JsonSerializer.Deserialize<LseComExtractionResult>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (result != null)
                {
                    result.ExportedXmlPath = File.Exists(exportedXmlPath) ? exportedXmlPath : null;
                    result.ExportedServerListPath = File.Exists(exportedServerListPath) ? exportedServerListPath : null;
                    return result;
                }
            }

            var stderr = await proc.StandardError.ReadToEndAsync(cancellationToken).ConfigureAwait(false);
            return new LseComExtractionResult
            {
                Success = false,
                ErrorMessage = $"COM bridge script did not produce result JSON (ExitCode={proc.ExitCode}): {stderr}"
            };
        }
        finally
        {
            ComLock.Release();
        }
    }

    private static string BuildPowerShellExtractionScript(
        string stagedLprPath,
        string exportedXmlPath,
        string exportedServerListPath,
        string jsonResultPath,
        bool compileIfRuntimeMissing)
    {
        var escapedLpr = stagedLprPath.Replace("'", "''");
        var escapedXml = exportedXmlPath.Replace("'", "''");
        var escapedSrv = exportedServerListPath.Replace("'", "''");
        var escapedJson = jsonResultPath.Replace("'", "''");
        var compileFlag = compileIfRuntimeMissing ? "$true" : "$false";

        return $$"""
$ErrorActionPreference = 'Stop'
$lprPath = '{{escapedLpr}}'
$xmlOut = '{{escapedXml}}'
$srvOut = '{{escapedSrv}}'
$jsonOut = '{{escapedJson}}'
$compileIfMissing = {{compileFlag}}

$res = @{
    success = $false
    errorMessage = ''
    screens = @()
    windows = @()
    objects = @()
    textLists = @()
    languages = @()
    xmlExported = $false
    serverListExported = $false
    compiledRuntime = $false
}

$app = $null
$prj = $null
function Get-Count($col) {
    if ($null -eq $col) { return 0 }
    try { return [int]$col.Count() } catch {
        try { return [int]$col.Count } catch { return 0 }
    }
}
function Get-ItemAt($col, [int]$idx) {
    try { return $col.Item($idx) } catch { return $null }
}
function Get-ObjName($obj) {
    if ($null -eq $obj) { return "" }
    try { return [string]$obj.Name() } catch {
        try { return [string]$obj.Name } catch { return "" }
    }
}
function Get-ObjTextList($obj) {
    if ($null -eq $obj) { return "" }
    try { return [string]$obj.TextList() } catch {
        try { return [string]$obj.TextList } catch { return "" }
    }
}
function Get-ObjLangId($obj) {
    if ($null -eq $obj) { return 0 }
    try { return [int]$obj.LanguageID() } catch {
        try { return [int]$obj.LanguageID } catch {
            try { return [int]$obj.Code } catch { return 0 }
        }
    }
}

try {
    $app = New-Object -ComObject LASALScreen.Application
    $prj = $app.Open($lprPath)
    if ($null -eq $prj) { throw "LASALScreen.Application.Open returned null for '$lprPath'" }

    $prjDir = Split-Path -Parent $lprPath
    $mpcPath = Join-Path $prjDir 'Runtime\LSE.MPC'
    if ($compileIfMissing -and -not (Test-Path $mpcPath)) {
        try {
            $prj.Compile()
            $res.compiledRuntime = $true
        } catch {
            # Non-fatal if Compile warns
        }
    }

    $scCount = Get-Count $prj.Screens
    for ($i = 0; $i -lt $scCount; $i++) {
        $item = Get-ItemAt $prj.Screens $i
        if ($null -ne $item) {
            $res.screens += @{ index = $i; name = (Get-ObjName $item); textList = (Get-ObjTextList $item) }
        }
    }

    $wnCount = Get-Count $prj.Windows
    for ($i = 0; $i -lt $wnCount; $i++) {
        $item = Get-ItemAt $prj.Windows $i
        if ($null -ne $item) {
            $res.windows += @{ index = $i; name = (Get-ObjName $item); textList = (Get-ObjTextList $item) }
        }
    }

    $obCount = Get-Count $prj.Objects
    for ($i = 0; $i -lt $obCount; $i++) {
        $item = Get-ItemAt $prj.Objects $i
        if ($null -ne $item) {
            $res.objects += @{ index = $i; name = (Get-ObjName $item); textList = (Get-ObjTextList $item) }
        }
    }

    $tlCount = Get-Count $prj.TextLists
    for ($i = 0; $i -lt $tlCount; $i++) {
        $item = Get-ItemAt $prj.TextLists $i
        if ($null -ne $item) {
            $res.textLists += @{ index = $i; name = (Get-ObjName $item) }
        }
    }

    $lgCount = Get-Count $prj.Languages
    for ($i = 0; $i -lt $lgCount; $i++) {
        $item = Get-ItemAt $prj.Languages $i
        if ($null -ne $item) {
            $res.languages += @{ index = $i; name = (Get-ObjName $item); code = (Get-ObjLangId $item) }
        }
    }

    try {
        if (Test-Path $srvOut) { Remove-Item $srvOut -Force }
        $prj.ExportServerlist($srvOut)
        $res.serverListExported = (Test-Path $srvOut)
    } catch {
        # Ignore if project has no servers
    }

    try {
        if (Test-Path $xmlOut) { Remove-Item $xmlOut -Force }
        # Pre-select all languages & text lists in memory before ExportToXML
        try { $prj.ExportLanguagesToXML() } catch {}
        try { $prj.ExportTextListsToXML() } catch {}
        try { $prj.AddContainerInfo($true) } catch {}
        $prj.ExportToXML($xmlOut, $true)
        $res.xmlExported = (Test-Path $xmlOut)
    } catch {
        # Non-fatal fallback
    }

    try { $prj.Close($false) } catch { try { $prj.Close() } catch {} }
    $res.success = $true
} catch {
    $res.errorMessage = $_.Exception.Message
} finally {
    if ($null -ne $prj) {
        try { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($prj) } catch {}
    }
    if ($null -ne $app) {
        try { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($app) } catch {}
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
    $res | ConvertTo-Json -Depth 6 | Set-Content -Path $jsonOut -Encoding UTF8
}
""";
    }

    private static void CleanupOrphanedLseProcesses()
    {
        try
        {
            foreach (var p in Process.GetProcessesByName("LSE_Modeless"))
            {
                try { p.Kill(entireProcessTree: true); } catch { }
            }
        }
        catch
        {
            // Ignore
        }
    }
}

public sealed class LseComExtractionResult
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("errorMessage")]
    public string ErrorMessage { get; set; } = string.Empty;

    [JsonPropertyName("screens")]
    public List<LseComNamedItem> Screens { get; set; } = new();

    [JsonPropertyName("windows")]
    public List<LseComNamedItem> Windows { get; set; } = new();

    [JsonPropertyName("objects")]
    public List<LseComNamedItem> Objects { get; set; } = new();

    [JsonPropertyName("textLists")]
    public List<LseComNamedItem> TextLists { get; set; } = new();

    [JsonPropertyName("languages")]
    public List<LseComLanguageItem> Languages { get; set; } = new();

    [JsonPropertyName("xmlExported")]
    public bool XmlExported { get; set; }

    [JsonPropertyName("serverListExported")]
    public bool ServerListExported { get; set; }

    [JsonPropertyName("compiledRuntime")]
    public bool CompiledRuntime { get; set; }

    [JsonIgnore]
    public string? ExportedXmlPath { get; set; }

    [JsonIgnore]
    public string? ExportedServerListPath { get; set; }
}

public sealed class LseComNamedItem
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("textList")]
    public string TextList { get; set; } = string.Empty;
}

public sealed class LseComLanguageItem
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public int Code { get; set; }
}
