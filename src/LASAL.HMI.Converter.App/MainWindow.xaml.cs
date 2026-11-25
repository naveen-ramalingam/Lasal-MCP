using System.Windows;
using LASAL.HMI.Converter.App.ViewModels;

namespace LASAL.HMI.Converter.App;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }
}
