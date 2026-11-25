using System;
using System.Text.Json;
using LASAL.HMI.Converter.Infrastructure;

namespace LASAL.HMI.Converter.Diagnostic;

internal static class Program
{
    private static int Main(string[] args)
    {
        Console.WriteLine("=== LASAL HMI Converter — Environment & Toolchain Diagnostic ===");
        var detector = new SoftwareEnvironmentDetector();
        var report = detector.Detect();

        Console.WriteLine($"LASAL SCREEN Installed : {report.LasalScreenInstalled} (Version: {report.LasalScreenVersion})");
        Console.WriteLine($"  Executable           : {report.LasalScreenExecutablePath}");
        Console.WriteLine($"  COM ProgID / CLSID   : {report.LasalScreenProgId} / {report.LasalScreenClsid}");
        Console.WriteLine($"VISUDesigner Installed : {report.VisuDesignerInstalled} (Version: {report.VisuDesignerVersion}, Python: {report.VisuDesignerPythonVersion})");
        Console.WriteLine($"  Executable           : {report.VisuDesignerExecutablePath}");
        Console.WriteLine($"  Native Controls Found: {report.InstalledVisuControls.Count}");
        Console.WriteLine($"LASAL CLASS 2 Installed: {report.LasalClass2Installed} (Version: {report.LasalClass2Version})");
        Console.WriteLine($"MachineManager         : {report.MachineManagerInstalled} (Version: {report.MachineManagerVersion})");
        Console.WriteLine($"LARS Installed         : {report.LarsInstalled} (Version: {report.LarsVersion})");
        Console.WriteLine($"32-bit PowerShell STA  : {report.SysWow64PowerShellAvailable} ({report.SysWow64PowerShellPath})");

        if (args.Length > 0 && args[0] == "--json")
        {
            Console.WriteLine(JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        }

        return (report.LasalScreenInstalled && report.VisuDesignerInstalled) ? 0 : 1;
    }
}
