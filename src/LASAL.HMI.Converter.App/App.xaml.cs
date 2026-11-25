using System.Windows;
using System.Windows.Media;

namespace LASAL.HMI.Converter.App;

public partial class App : Application
{
    public void ApplyTheme(bool dark)
    {
        if (dark)
        {
            Resources["AppBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x0F, 0x17, 0x2A));
            Resources["SidebarBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x11, 0x18, 0x27));
            Resources["CardBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x1E, 0x29, 0x3B));
            Resources["BorderBrushTheme"] = new SolidColorBrush(Color.FromRgb(0x33, 0x41, 0x55));
            Resources["PrimaryTextBrush"] = new SolidColorBrush(Color.FromRgb(0xF1, 0xF5, 0xF9));
            Resources["SecondaryTextBrush"] = new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));
            Resources["InputBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x0F, 0x17, 0x2A));
        }
        else
        {
            Resources["AppBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0xF1, 0xF5, 0xF9));
            Resources["SidebarBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));
            Resources["CardBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0xFF, 0xFF, 0xFF));
            Resources["BorderBrushTheme"] = new SolidColorBrush(Color.FromRgb(0xCB, 0xD5, 0xE1));
            Resources["PrimaryTextBrush"] = new SolidColorBrush(Color.FromRgb(0x0F, 0x17, 0x2A));
            Resources["SecondaryTextBrush"] = new SolidColorBrush(Color.FromRgb(0x47, 0x55, 0x69));
            Resources["InputBackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0xFF, 0xFF, 0xFF));
        }
    }
}
