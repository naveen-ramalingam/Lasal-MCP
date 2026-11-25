using System;
using LASAL.HMI.Converter.Models;

namespace LASAL.HMI.Converter.Mapping;

/// <summary>
/// Scales screen, window, and control coordinates and font sizes when migrating between panel resolutions.
/// Supports 1:1 native pixel preservation (default) or proportional scaling to a target panel resolution.
/// </summary>
public static class LayoutScaler
{
    public static void ScaleModelResolution(
        HmiIntermediateModel model,
        int targetWidth,
        int targetHeight,
        bool preserveAspectRatio = false)
    {
        ArgumentNullException.ThrowIfNull(model);
        if (targetWidth <= 0 || targetHeight <= 0)
        {
            return;
        }

        var srcW = model.ProjectMetadata.ResolutionWidth > 0 ? model.ProjectMetadata.ResolutionWidth : 800;
        var srcH = model.ProjectMetadata.ResolutionHeight > 0 ? model.ProjectMetadata.ResolutionHeight : 480;

        if (srcW == targetWidth && srcH == targetHeight)
        {
            return;
        }

        var scaleX = (double)targetWidth / srcW;
        var scaleY = (double)targetHeight / srcH;
        var offsetX = 0;
        var offsetY = 0;

        if (preserveAspectRatio)
        {
            var uniform = Math.Min(scaleX, scaleY);
            offsetX = (int)Math.Round((targetWidth - srcW * uniform) / 2.0);
            offsetY = (int)Math.Round((targetHeight - srcH * uniform) / 2.0);
            scaleX = uniform;
            scaleY = uniform;
        }

        var fontScale = Math.Min(scaleX, scaleY);
        foreach (var font in model.FontStyles)
        {
            font.SizePx = Math.Max(8, (int)Math.Round(font.SizePx * fontScale));
        }

        model.ProjectMetadata.ResolutionWidth = targetWidth;
        model.ProjectMetadata.ResolutionHeight = targetHeight;

        if (model.GlobalScreen != null)
        {
            ScaleScreen(model.GlobalScreen, targetWidth, targetHeight, scaleX, scaleY, offsetX, offsetY);
        }

        foreach (var screen in model.Screens)
        {
            ScaleScreen(screen, targetWidth, targetHeight, scaleX, scaleY, offsetX, offsetY);
        }

        foreach (var win in model.Windows)
        {
            win.Width = Math.Max(40, (int)Math.Round(win.Width * scaleX));
            win.Height = Math.Max(30, (int)Math.Round(win.Height * scaleY));
            foreach (var ctrl in win.Controls)
            {
                ScaleControl(ctrl, scaleX, scaleY, 0, 0);
            }
        }

        foreach (var obj in model.ReusableObjects)
        {
            obj.Width = Math.Max(20, (int)Math.Round(obj.Width * scaleX));
            obj.Height = Math.Max(20, (int)Math.Round(obj.Height * scaleY));
            foreach (var ctrl in obj.Controls)
            {
                ScaleControl(ctrl, scaleX, scaleY, 0, 0);
            }
        }
    }

    private static void ScaleScreen(
        ScreenModel screen,
        int targetW,
        int targetH,
        double scaleX,
        double scaleY,
        int offsetX,
        int offsetY)
    {
        screen.Width = targetW;
        screen.Height = targetH;
        foreach (var ctrl in screen.Controls)
        {
            ScaleControl(ctrl, scaleX, scaleY, offsetX, offsetY);
        }
    }

    private static void ScaleControl(
        HmiControlModel ctrl,
        double scaleX,
        double scaleY,
        int offsetX,
        int offsetY)
    {
        ctrl.X = offsetX + (int)Math.Round(ctrl.X * scaleX);
        ctrl.Y = offsetY + (int)Math.Round(ctrl.Y * scaleY);
        ctrl.Width = Math.Max(4, (int)Math.Round(ctrl.Width * scaleX));
        ctrl.Height = Math.Max(4, (int)Math.Round(ctrl.Height * scaleY));

        foreach (var pt in ctrl.PolygonPoints)
        {
            pt.X = offsetX + (int)Math.Round(pt.X * scaleX);
            pt.Y = offsetY + (int)Math.Round(pt.Y * scaleY);
        }
    }
}
