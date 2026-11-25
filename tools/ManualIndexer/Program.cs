using System;
using System.IO;
using System.Linq;
using System.Text;

namespace LASAL.HMI.Converter.ManualIndexer;

internal static class Program
{
    private static int Main(string[] args)
    {
        var manualRoot = args.Length > 0 ? args[0] : @"C:\SigmaControl\01_Manuals";
        if (!Directory.Exists(manualRoot))
        {
            Console.Error.WriteLine($"Manual folder not found: {manualRoot}");
            return 1;
        }

        var exts = new[] { ".pdf", ".chm", ".doc", ".docx", ".xls", ".xlsx", ".html", ".htm", ".txt", ".xml", ".7z" };
        var files = Directory.GetFiles(manualRoot, "*.*", SearchOption.AllDirectories)
            .Where(f => Array.Exists(exts, e => e.Equals(Path.GetExtension(f), StringComparison.OrdinalIgnoreCase)))
            .OrderBy(f => f, StringComparer.OrdinalIgnoreCase)
            .ToList();

        Console.WriteLine($"Indexed {files.Count} manual/documentation files in '{manualRoot}'.");
        foreach (var g in files.GroupBy(f => Path.GetExtension(f).ToLowerInvariant()))
        {
            Console.WriteLine($"  {g.Key}: {g.Count()} files");
        }
        return 0;
    }
}
