using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;

namespace LASAL.HMI.Converter.Infrastructure;

/// <summary>
/// Enforces the strict engineering rule that the original LASAL SCREEN (.lpr) and LASAL CLASS 2 (.lcp)
/// projects are NEVER modified. Also stages the project into a short temporary path (&lt; 65 characters)
/// so 32-bit LSE_Modeless.exe never hits the Windows 260-character MAX_PATH limit.
/// </summary>
public sealed class StagingManager : IDisposable
{
    public string OriginalLprPath { get; }
    public string OriginalProjectDirectory { get; }
    public string StagedProjectDirectory { get; }
    public string StagedLprPath { get; }
    public IReadOnlyDictionary<string, string> OriginalFileChecksums => _originalChecksums;

    private readonly Dictionary<string, string> _originalChecksums = new(StringComparer.OrdinalIgnoreCase);
    private bool _disposed;

    private StagingManager(
        string originalLprPath,
        string originalProjectDirectory,
        string stagedProjectDirectory,
        string stagedLprPath,
        Dictionary<string, string> originalChecksums)
    {
        OriginalLprPath = originalLprPath;
        OriginalProjectDirectory = originalProjectDirectory;
        StagedProjectDirectory = stagedProjectDirectory;
        StagedLprPath = stagedLprPath;
        _originalChecksums = originalChecksums;
    }

    public static StagingManager CreateStagedCopy(string sourceLprPath)
    {
        if (string.IsNullOrWhiteSpace(sourceLprPath))
        {
            throw new ArgumentException("Source .lpr path cannot be empty.", nameof(sourceLprPath));
        }

        var fullLprPath = Path.GetFullPath(sourceLprPath);
        if (!File.Exists(fullLprPath))
        {
            throw new FileNotFoundException($"Source LASAL SCREEN project file not found: {fullLprPath}", fullLprPath);
        }

        var sourceDir = Path.GetDirectoryName(fullLprPath)
            ?? throw new InvalidOperationException($"Could not determine parent directory of {fullLprPath}");

        var checksums = ComputeDirectoryChecksums(sourceDir);

        // Create a short staging folder in %TEMP% (< 65 chars) to prevent LSE_Modeless MAX_PATH hangs
        var shortId = Guid.NewGuid().ToString("N")[..8];
        var stageDir = Path.Combine(Path.GetTempPath(), $"lse_{shortId}");
        if (Directory.Exists(stageDir))
        {
            Directory.Delete(stageDir, recursive: true);
        }
        Directory.CreateDirectory(stageDir);

        CopyDirectoryRecursive(sourceDir, stageDir);

        var lprFileName = Path.GetFileName(fullLprPath);
        var stagedLprPath = Path.Combine(stageDir, lprFileName);

        return new StagingManager(fullLprPath, sourceDir, stageDir, stagedLprPath, checksums);
    }

    /// <summary>
    /// Verifies that the original source project directory has not been modified in any way.
    /// Throws an <see cref="InvalidOperationException"/> if any file was altered, added, or removed.
    /// </summary>
    public void VerifySourceImmutability()
    {
        var currentChecksums = ComputeDirectoryChecksums(OriginalProjectDirectory);
        if (currentChecksums.Count != _originalChecksums.Count)
        {
            throw new InvalidOperationException(
                $"Source immutability check failed: file count changed from {_originalChecksums.Count} to {currentChecksums.Count}.");
        }

        foreach (var kvp in _originalChecksums)
        {
            if (!currentChecksums.TryGetValue(kvp.Key, out var currentHash) ||
                !string.Equals(kvp.Value, currentHash, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"Source immutability check failed for '{kvp.Key}': SHA-256 hash changed.");
            }
        }
    }

    public static Dictionary<string, string> ComputeDirectoryChecksums(string directoryPath)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var file in Directory.EnumerateFiles(directoryPath, "*", SearchOption.AllDirectories))
        {
            var relPath = Path.GetRelativePath(directoryPath, file);
            using var stream = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            var hash = SHA256.HashData(stream);
            result[relPath] = Convert.ToHexString(hash);
        }
        return result;
    }

    private static void CopyDirectoryRecursive(string sourceDir, string targetDir)
    {
        Directory.CreateDirectory(targetDir);
        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var destFile = Path.Combine(targetDir, Path.GetFileName(file));
            File.Copy(file, destFile, overwrite: true);
            // Ensure staged copy is writable so LSE_Modeless.exe can open/compile it cleanly
            var attrs = File.GetAttributes(destFile);
            if ((attrs & FileAttributes.ReadOnly) != 0)
            {
                File.SetAttributes(destFile, attrs & ~FileAttributes.ReadOnly);
            }
        }

        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            var destSubDir = Path.Combine(targetDir, Path.GetFileName(subDir));
            CopyDirectoryRecursive(subDir, destSubDir);
        }
    }

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }
        _disposed = true;

        try
        {
            if (Directory.Exists(StagedProjectDirectory))
            {
                Directory.Delete(StagedProjectDirectory, recursive: true);
            }
        }
        catch
        {
            // Ignore locked temp cleanup errors
        }
    }
}
