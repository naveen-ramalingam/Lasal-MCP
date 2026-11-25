using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Microsoft.Win32;

namespace LASAL.HMI.Converter.Infrastructure;

/// <summary>
/// Automatically detects installed SIGMATEK LASAL software versions, paths, COM registrations,
/// embedded Python runtimes, and installed VISUDesigner controls on the host machine.
/// </summary>
public sealed class SoftwareEnvironmentDetector
{
    public const string DefaultLseExePath = @"C:\Program Files (x86)\Sigmatek\Lasal\Screen\LSE_Modeless.exe";
    public const string DefaultLseTlbPath = @"C:\Program Files (x86)\Sigmatek\Lasal\Screen\LASALScreen.tlb";
    public const string DefaultVisuDesignerExePath = @"C:\Program Files\Sigmatek\Lasal\VISUDesigner\VISUDesigner.exe";
    public const string DefaultVisuLvdPythonPath = @"C:\Program Files\Sigmatek\Lasal\VISUDesigner\Scripting\3_12\sigmatek\lasal\lvd.py";
    public const string DefaultVisuLibsPath = @"C:\Program Files\Sigmatek\Lasal\VISUDesigner\Libs\sigmatek";
    public const string DefaultClass2ExePath = @"C:\Program Files (x86)\Sigmatek\Lasal\Class2\Bin\Lasal2.exe";
    public const string DefaultMachineManagerExePath = @"C:\Program Files (x86)\Sigmatek\Lasal\MachineManager\Bin\MachineManager.exe";
    public const string DefaultLarsExePath = @"C:\Program Files (x86)\Sigmatek\Lars\Lars.exe";
    public const string SysWow64PowerShellPath = @"C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe";

    public const string LseProgId = "LASALScreen.Application";
    public const string LseClsid = "{82A49236-710D-4A68-8D66-1FC2312CABAB}";
    public const string LseTypeLibGuid = "{DC9303D6-0976-4025-AF16-6C1139ACC527}";

    public SoftwareEnvironmentReport Detect()
    {
        var report = new SoftwareEnvironmentReport
        {
            DetectedAtUtc = DateTime.UtcNow,
            SysWow64PowerShellAvailable = File.Exists(SysWow64PowerShellPath),
            SysWow64PowerShellPath = SysWow64PowerShellPath
        };

        // 1. Detect LASAL SCREEN
        var lsePath = ResolveExistingPath(DefaultLseExePath, DiscoverComLocalServer32(LseClsid));
        if (!string.IsNullOrEmpty(lsePath) && File.Exists(lsePath))
        {
            report.LasalScreenInstalled = true;
            report.LasalScreenExecutablePath = lsePath;
            report.LasalScreenVersion = GetFormattedFileVersion(lsePath);
            report.LasalScreenComRegistered = true;
            report.LasalScreenClsid = LseClsid;
            report.LasalScreenProgId = LseProgId;
            report.LasalScreenTypeLibPath = File.Exists(DefaultLseTlbPath)
                ? DefaultLseTlbPath
                : Path.Combine(Path.GetDirectoryName(lsePath) ?? string.Empty, "LASALScreen.tlb");
        }

        // 2. Detect LASAL VISUDesigner
        if (File.Exists(DefaultVisuDesignerExePath))
        {
            report.VisuDesignerInstalled = true;
            report.VisuDesignerExecutablePath = DefaultVisuDesignerExePath;
            report.VisuDesignerVersion = GetFormattedFileVersion(DefaultVisuDesignerExePath);
            report.VisuDesignerLvdModulePath = File.Exists(DefaultVisuLvdPythonPath) ? DefaultVisuLvdPythonPath : string.Empty;
            report.VisuDesignerPythonVersion = File.Exists(DefaultVisuLvdPythonPath) ? "3.12" : "Unknown";

            if (Directory.Exists(DefaultVisuLibsPath))
            {
                foreach (var dir in Directory.GetDirectories(DefaultVisuLibsPath))
                {
                    var name = Path.GetFileName(dir);
                    if (!string.IsNullOrWhiteSpace(name))
                    {
                        report.InstalledVisuControls.Add(name);
                    }
                }
                report.InstalledVisuControls.Sort(StringComparer.OrdinalIgnoreCase);
            }
        }

        // 3. Detect LASAL CLASS 2
        if (File.Exists(DefaultClass2ExePath))
        {
            report.LasalClass2Installed = true;
            report.LasalClass2ExecutablePath = DefaultClass2ExePath;
            report.LasalClass2Version = GetFormattedFileVersion(DefaultClass2ExePath);
        }

        // 4. Detect MachineManager
        if (File.Exists(DefaultMachineManagerExePath))
        {
            report.MachineManagerInstalled = true;
            report.MachineManagerExecutablePath = DefaultMachineManagerExePath;
            report.MachineManagerVersion = GetFormattedFileVersion(DefaultMachineManagerExePath);
        }

        // 5. Detect LARS
        if (File.Exists(DefaultLarsExePath))
        {
            report.LarsInstalled = true;
            report.LarsExecutablePath = DefaultLarsExePath;
            report.LarsVersion = GetFormattedFileVersion(DefaultLarsExePath);
        }

        return report;
    }

    private static string? ResolveExistingPath(params string?[] candidates)
    {
        return candidates.FirstOrDefault(c => !string.IsNullOrWhiteSpace(c) && File.Exists(c));
    }

    private static string? DiscoverComLocalServer32(string clsid)
    {
        if (!OperatingSystem.IsWindows())
        {
            return null;
        }

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey($@"SOFTWARE\Classes\WOW6432Node\CLSID\{clsid}\LocalServer32")
                         ?? Registry.LocalMachine.OpenSubKey($@"SOFTWARE\Classes\CLSID\{clsid}\LocalServer32");
            var raw = key?.GetValue(null)?.ToString()?.Trim().Trim('"');
            if (!string.IsNullOrWhiteSpace(raw))
            {
                var exeIdx = raw.IndexOf(".exe", StringComparison.OrdinalIgnoreCase);
                if (exeIdx > 0)
                {
                    return raw[..(exeIdx + 4)].Trim('"');
                }
                return raw;
            }
        }
        catch
        {
            // Ignore registry permission issues and fall back to default path
        }
        return null;
    }

    private static string GetFormattedFileVersion(string filePath)
    {
        try
        {
            var info = FileVersionInfo.GetVersionInfo(filePath);
            if (!string.IsNullOrWhiteSpace(info.ProductVersion))
            {
                return info.ProductVersion.Trim();
            }
            return $"{info.FileMajorPart:D2}.{info.FileMinorPart:D2}.{info.FileBuildPart:D3}";
        }
        catch
        {
            return "Unknown";
        }
    }
}

public sealed class SoftwareEnvironmentReport
{
    public DateTime DetectedAtUtc { get; set; }
    public bool LasalScreenInstalled { get; set; }
    public string LasalScreenVersion { get; set; } = "Not Installed";
    public string LasalScreenExecutablePath { get; set; } = string.Empty;
    public bool LasalScreenComRegistered { get; set; }
    public string LasalScreenProgId { get; set; } = string.Empty;
    public string LasalScreenClsid { get; set; } = string.Empty;
    public string LasalScreenTypeLibPath { get; set; } = string.Empty;

    public bool VisuDesignerInstalled { get; set; }
    public string VisuDesignerVersion { get; set; } = "Not Installed";
    public string VisuDesignerExecutablePath { get; set; } = string.Empty;
    public string VisuDesignerPythonVersion { get; set; } = string.Empty;
    public string VisuDesignerLvdModulePath { get; set; } = string.Empty;
    public List<string> InstalledVisuControls { get; set; } = new();

    public bool LasalClass2Installed { get; set; }
    public string LasalClass2Version { get; set; } = "Not Installed";
    public string LasalClass2ExecutablePath { get; set; } = string.Empty;

    public bool MachineManagerInstalled { get; set; }
    public string MachineManagerVersion { get; set; } = "Not Installed";
    public string MachineManagerExecutablePath { get; set; } = string.Empty;

    public bool LarsInstalled { get; set; }
    public string LarsVersion { get; set; } = "Not Installed";
    public string LarsExecutablePath { get; set; } = string.Empty;

    public bool SysWow64PowerShellAvailable { get; set; }
    public string SysWow64PowerShellPath { get; set; } = string.Empty;
}
