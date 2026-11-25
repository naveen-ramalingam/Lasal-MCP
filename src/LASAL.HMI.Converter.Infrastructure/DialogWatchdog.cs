using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LASAL.HMI.Converter.Infrastructure;

/// <summary>
/// Monitors Win32 modal dialogs (#32770) belonging to LSE_Modeless.exe or VISUDesigner.exe
/// during headless automation and dismisses them automatically while recording diagnostic details.
/// Adapted and hardened in C# from the dialogWatchdog concept in Svel26/Lasal-MCP (MIT License).
/// </summary>
public sealed class DialogWatchdog : IDisposable
{
    private readonly CancellationTokenSource _cts = new();
    private readonly Task _monitorTask;
    private readonly List<DismissedDialogRecord> _dismissedDialogs = new();
    private readonly object _lock = new();

    public IReadOnlyList<DismissedDialogRecord> DismissedDialogs
    {
        get
        {
            lock (_lock)
            {
                return _dismissedDialogs.ToArray();
            }
        }
    }

    public DialogWatchdog(params string[] targetWindowTitles)
    {
        var titles = targetWindowTitles.Length > 0
            ? targetWindowTitles
            : new[] { "LASAL Screen", "LSE", "Error", "Warning", "VISUDesigner" };

        _monitorTask = Task.Run(() => MonitorLoopAsync(titles, _cts.Token));
    }

    private async Task MonitorLoopAsync(string[] targetTitles, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                if (OperatingSystem.IsWindows())
                {
                    EnumWindows((hWnd, _) =>
                    {
                        if (!IsWindowVisible(hWnd))
                        {
                            return true;
                        }

                        var className = GetClassNameString(hWnd);
                        if (!string.Equals(className, "#32770", StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }

                        var title = GetWindowTextString(hWnd);
                        foreach (var prefix in targetTitles)
                        {
                            if (title.Contains(prefix, StringComparison.OrdinalIgnoreCase))
                            {
                                var body = ExtractChildText(hWnd);
                                PostMessage(hWnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                                lock (_lock)
                                {
                                    _dismissedDialogs.Add(new DismissedDialogRecord(DateTime.UtcNow, title, body));
                                }
                                ConverterLogger.Warn($"DialogWatchdog dismissed modal dialog '{title}': {body}");
                                break;
                            }
                        }

                        return true;
                    }, IntPtr.Zero);
                }
            }
            catch
            {
                // Ignore transient Win32 enumeration errors
            }

            try
            {
                await Task.Delay(250, token).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private static string ExtractChildText(IntPtr parentHwnd)
    {
        var sb = new StringBuilder();
        EnumChildWindows(parentHwnd, (childHwnd, _) =>
        {
            var cls = GetClassNameString(childHwnd);
            if (string.Equals(cls, "Static", StringComparison.OrdinalIgnoreCase))
            {
                var txt = GetWindowTextString(childHwnd);
                if (!string.IsNullOrWhiteSpace(txt))
                {
                    if (sb.Length > 0) sb.Append(" | ");
                    sb.Append(txt.Replace("\r\n", " ").Replace("\n", " ").Trim());
                }
            }
            return true;
        }, IntPtr.Zero);
        return sb.ToString();
    }

    private static string GetWindowTextString(IntPtr hWnd)
    {
        var sb = new StringBuilder(512);
        _ = GetWindowText(hWnd, sb, sb.Capacity);
        return sb.ToString();
    }

    private static string GetClassNameString(IntPtr hWnd)
    {
        var sb = new StringBuilder(256);
        _ = GetClassName(hWnd, sb, sb.Capacity);
        return sb.ToString();
    }

    public void Dispose()
    {
        _cts.Cancel();
        try
        {
            _monitorTask.Wait(TimeSpan.FromSeconds(1));
        }
        catch
        {
            // Ignore cancellation
        }
        _cts.Dispose();
    }

    private const uint WM_CLOSE = 0x0010;

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool EnumChildWindows(IntPtr hWndParent, EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern bool PostMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);
}

public sealed record DismissedDialogRecord(DateTime TimestampUtc, string Title, string Message);
