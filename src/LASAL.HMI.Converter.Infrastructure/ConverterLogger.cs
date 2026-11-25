using System;
using System.IO;
using Serilog;

namespace LASAL.HMI.Converter.Infrastructure;

/// <summary>
/// Central Serilog structured logger factory and in-memory log sink for UI live log streaming.
/// </summary>
public static class ConverterLogger
{
    private static ILogger? _instance;
    public static event Action<string>? OnLogMessage;

    public static ILogger Instance => _instance ??= CreateDefaultLogger();

    public static ILogger CreateDefaultLogger(string? logDirectory = null)
    {
        var dir = logDirectory ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");
        Directory.CreateDirectory(dir);
        var logFilePath = Path.Combine(dir, "lasal-hmi-converter-.log");

        _instance = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.File(
                logFilePath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                shared: true)
            .CreateLogger();

        return _instance;
    }

    public static void Info(string message)
    {
        Instance.Information("{Message}", message);
        OnLogMessage?.Invoke($"[{DateTime.Now:HH:mm:ss} INF] {message}");
    }

    public static void Warn(string message)
    {
        Instance.Warning("{Message}", message);
        OnLogMessage?.Invoke($"[{DateTime.Now:HH:mm:ss} WRN] {message}");
    }

    public static void Error(string message, Exception? ex = null)
    {
        if (ex != null)
        {
            Instance.Error(ex, "{Message}", message);
            OnLogMessage?.Invoke($"[{DateTime.Now:HH:mm:ss} ERR] {message}: {ex.Message}");
        }
        else
        {
            Instance.Error("{Message}", message);
            OnLogMessage?.Invoke($"[{DateTime.Now:HH:mm:ss} ERR] {message}");
        }
    }
}
