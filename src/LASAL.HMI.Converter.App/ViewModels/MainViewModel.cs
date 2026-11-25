using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using LASAL.HMI.Converter.Core;
using LASAL.HMI.Converter.Infrastructure;
using LASAL.HMI.Converter.Mapping;
using LASAL.HMI.Converter.Models;
using LASAL.HMI.Converter.Reporting;
using LASAL.HMI.Converter.Source.LASALScreen;
using LASAL.HMI.Converter.Validation;
using Microsoft.Win32;

namespace LASAL.HMI.Converter.App.ViewModels;

public sealed class MainViewModel : ViewModelBase
{
    private readonly ConversionOrchestrator _orchestrator = new();
    private CancellationTokenSource? _conversionCts;

    private string _selectedSection = "Dashboard";
    private int _wizardStep = 1;
    private bool _isDarkTheme = true;
    private string _sourceLprPath = string.Empty;
    private string _class2ProjectPath = string.Empty;
    private string _targetOutputDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "LASAL_VISUDesigner_Output");
    private string _resolutionMode = "Original";
    private int _customTargetWidth = 1280;
    private int _customTargetHeight = 800;
    private bool _preserveAspectRatio = true;
    private bool _convertBmpTransparency = true;
    private bool _publishWebroot = true;
    private bool _isBusy;
    private int _progressPercent;
    private string _progressMessage = "Ready.";
    private HmiIntermediateModel? _currentModel;
    private ConversionPipelineResult? _lastResult;
    private ScreenModel? _selectedInspectorScreen;
    private ScreenValidationResult? _selectedValidationScreen;
    private string _datapointSearchFilter = string.Empty;
    private string _selectedDocTitle = "ARCHITECTURE.md";
    private string _selectedDocContent = string.Empty;

    public MainViewModel()
    {
        ConverterLogger.OnLogMessage += msg =>
        {
            Application.Current?.Dispatcher?.BeginInvoke(() =>
            {
                LiveLogs.Add(msg);
                if (LiveLogs.Count > 500)
                {
                    LiveLogs.RemoveAt(0);
                }
            });
        };

        NavigateCommand = new RelayCommand(p => SelectedSection = p?.ToString() ?? "Dashboard");
        BrowseSourceLprCommand = new RelayCommand(_ => BrowseSourceLpr());
        BrowseClass2Command = new RelayCommand(_ => BrowseClass2Project());
        BrowseTargetDirCommand = new RelayCommand(_ => BrowseTargetDirectory());
        WizardNextCommand = new RelayCommand(_ => WizardStep = Math.Min(6, WizardStep + 1));
        WizardBackCommand = new RelayCommand(_ => WizardStep = Math.Max(1, WizardStep - 1));
        ExtractInspectCommand = new AsyncRelayCommand(_ => ExtractAndInspectAsync(), _ => !IsBusy && File.Exists(SourceLprPath));
        RunConversionCommand = new AsyncRelayCommand(_ => RunConversionAsync(), _ => !IsBusy && File.Exists(SourceLprPath));
        CancelConversionCommand = new RelayCommand(_ => _conversionCts?.Cancel(), _ => IsBusy);
        ToggleThemeCommand = new RelayCommand(_ => ToggleTheme());
        RefreshEnvironmentCommand = new RelayCommand(_ => RefreshEnvironment());
        ExportMappingsCommand = new RelayCommand(_ => ExportMappingRules());
        ImportMappingsCommand = new RelayCommand(_ => ImportMappingRules());
        OpenReportFileCommand = new RelayCommand(p => OpenFileShell(p?.ToString()));
        OpenTargetFolderCommand = new RelayCommand(_ => OpenFileShell(LastResult?.VisuResult.ProjectDirectory ?? TargetOutputDirectory));
        LoadDocCommand = new RelayCommand(p => LoadDocumentationFile(p?.ToString() ?? "ARCHITECTURE.md"));

        RefreshEnvironment();
        LoadMappingRulesCollection();
        TryAutoPopulateDefaultExamplePaths();
        LoadDocumentationFile("ARCHITECTURE.md");
    }

    public SoftwareEnvironmentReport EnvironmentReport { get; private set; } = new();

    public ObservableCollection<string> LiveLogs { get; } = new();
    public ObservableCollection<ControlMappingRule> MappingRules { get; } = new();
    public ObservableCollection<ScreenModel> InspectorScreens { get; } = new();
    public ObservableCollection<DatapointModel> FilteredDatapoints { get; } = new();
    public ObservableCollection<AssetModel> Assets { get; } = new();
    public ObservableCollection<ScreenValidationResult> ValidationComparisons { get; } = new();
    public ObservableCollection<string> DocFileNames { get; } = new()
    {
        "ARCHITECTURE.md",
        "OBJECT_MAPPING_REFERENCE.md",
        "COMPATIBILITY_MATRIX.md",
        "API_REFERENCE.md",
        "MANUAL_INDEX.md",
        "CONVERSION_GUIDE.md",
        "KNOWN_LIMITATIONS.md"
    };

    public ICommand NavigateCommand { get; }
    public ICommand BrowseSourceLprCommand { get; }
    public ICommand BrowseClass2Command { get; }
    public ICommand BrowseTargetDirCommand { get; }
    public ICommand WizardNextCommand { get; }
    public ICommand WizardBackCommand { get; }
    public ICommand ExtractInspectCommand { get; }
    public ICommand RunConversionCommand { get; }
    public ICommand CancelConversionCommand { get; }
    public ICommand ToggleThemeCommand { get; }
    public ICommand RefreshEnvironmentCommand { get; }
    public ICommand ExportMappingsCommand { get; }
    public ICommand ImportMappingsCommand { get; }
    public ICommand OpenReportFileCommand { get; }
    public ICommand OpenTargetFolderCommand { get; }
    public ICommand LoadDocCommand { get; }

    public string SelectedSection
    {
        get => _selectedSection;
        set
        {
            if (SetProperty(ref _selectedSection, value))
            {
                OnPropertyChanged(nameof(SectionTitle));
            }
        }
    }

    public string SectionTitle => SelectedSection switch
    {
        "Dashboard" => "Dashboard & Environment Readiness",
        "NewConversion" => $"New Conversion Wizard — Step {WizardStep} of 6",
        "Inspector" => "LASAL SCREEN Project Inspector",
        "ObjectMapping" => "Object & Control Mapping Editor",
        "DatapointMapping" => "Datapoint & Server Mapping",
        "AssetManager" => "Graphic Assets & Transparency Manager",
        "Preview" => "Side-by-Side Layout Conversion Preview",
        "Validation" => "OpenCV Visual & Functional Validation",
        "Reports" => "17-Section Conversion Reports (HTML / JSON / CSV / Excel)",
        "Settings" => "Application & Conversion Settings",
        "Documentation" => "Technical Documentation & Traceability",
        _ => SelectedSection
    };

    public int WizardStep
    {
        get => _wizardStep;
        set
        {
            if (SetProperty(ref _wizardStep, value))
            {
                OnPropertyChanged(nameof(SectionTitle));
            }
        }
    }

    public bool IsDarkTheme
    {
        get => _isDarkTheme;
        set => SetProperty(ref _isDarkTheme, value);
    }

    public string SourceLprPath
    {
        get => _sourceLprPath;
        set => SetProperty(ref _sourceLprPath, value);
    }

    public string Class2ProjectPath
    {
        get => _class2ProjectPath;
        set => SetProperty(ref _class2ProjectPath, value);
    }

    public string TargetOutputDirectory
    {
        get => _targetOutputDirectory;
        set => SetProperty(ref _targetOutputDirectory, value);
    }

    public string ResolutionMode
    {
        get => _resolutionMode;
        set => SetProperty(ref _resolutionMode, value);
    }

    public int CustomTargetWidth
    {
        get => _customTargetWidth;
        set => SetProperty(ref _customTargetWidth, value);
    }

    public int CustomTargetHeight
    {
        get => _customTargetHeight;
        set => SetProperty(ref _customTargetHeight, value);
    }

    public bool PreserveAspectRatio
    {
        get => _preserveAspectRatio;
        set => SetProperty(ref _preserveAspectRatio, value);
    }

    public bool ConvertBmpTransparency
    {
        get => _convertBmpTransparency;
        set => SetProperty(ref _convertBmpTransparency, value);
    }

    public bool PublishWebroot
    {
        get => _publishWebroot;
        set => SetProperty(ref _publishWebroot, value);
    }

    public bool IsBusy
    {
        get => _isBusy;
        set => SetProperty(ref _isBusy, value);
    }

    public int ProgressPercent
    {
        get => _progressPercent;
        set => SetProperty(ref _progressPercent, value);
    }

    public string ProgressMessage
    {
        get => _progressMessage;
        set => SetProperty(ref _progressMessage, value);
    }

    public HmiIntermediateModel? CurrentModel
    {
        get => _currentModel;
        set
        {
            if (SetProperty(ref _currentModel, value))
            {
                RefreshModelDerivedCollections();
            }
        }
    }

    public ConversionPipelineResult? LastResult
    {
        get => _lastResult;
        set => SetProperty(ref _lastResult, value);
    }

    public ScreenModel? SelectedInspectorScreen
    {
        get => _selectedInspectorScreen;
        set => SetProperty(ref _selectedInspectorScreen, value);
    }

    public ScreenValidationResult? SelectedValidationScreen
    {
        get => _selectedValidationScreen;
        set
        {
            if (SetProperty(ref _selectedValidationScreen, value))
            {
                OnPropertyChanged(nameof(SourcePreviewImage));
                OnPropertyChanged(nameof(TargetPreviewImage));
            }
        }
    }

    public BitmapImage? SourcePreviewImage => LoadBitmapFromPath(SelectedValidationScreen?.SourcePreviewImagePath);
    public BitmapImage? TargetPreviewImage => LoadBitmapFromPath(SelectedValidationScreen?.TargetPreviewImagePath);

    public string DatapointSearchFilter
    {
        get => _datapointSearchFilter;
        set
        {
            if (SetProperty(ref _datapointSearchFilter, value))
            {
                RefreshFilteredDatapoints();
            }
        }
    }

    public string SelectedDocTitle
    {
        get => _selectedDocTitle;
        set => SetProperty(ref _selectedDocTitle, value);
    }

    public string SelectedDocContent
    {
        get => _selectedDocContent;
        set => SetProperty(ref _selectedDocContent, value);
    }

    public string SummaryKpiText => CurrentModel == null
        ? "No project loaded yet. Use 'New Conversion' or 'Extract & Inspect' to analyze a .lpr project."
        : $"Project: {CurrentModel.ProjectMetadata.ProjectName} | {CurrentModel.ProjectMetadata.ResolutionWidth}x{CurrentModel.ProjectMetadata.ResolutionHeight} | " +
          $"Screens: {CurrentModel.Screens.Count} | Windows: {CurrentModel.Windows.Count} | Datapoints: {CurrentModel.Datapoints.Count} | " +
          $"Assets: {CurrentModel.Assets.Count} | TextLists: {CurrentModel.TextLists.Count}";

    public string LastValidationSummaryText => LastResult == null
        ? "Run a conversion to inspect visual comparison scores, structural validation, and report exports."
        : $"Status: {(LastResult.ValidationResult.Passed ? "PASSED" : "REVIEW REQUIRED")} | " +
          $"Visual Similarity: {LastResult.ValidationResult.AverageVisualSimilarityPercent:F2}% | " +
          $"Dashboards: {LastResult.VisuResult.DashboardCount} | Windows: {LastResult.VisuResult.WindowCount} | " +
          $"Webroot Published: {(LastResult.ValidationResult.PublishWebrootExists ? "YES" : "NO")} | " +
          $"Duration: {LastResult.Duration.TotalSeconds:F1}s";

    public void RefreshEnvironment()
    {
        EnvironmentReport = new SoftwareEnvironmentDetector().Detect();
        OnPropertyChanged(nameof(EnvironmentReport));
        ConverterLogger.Info($"Environment check: LSE {EnvironmentReport.LasalScreenVersion}, VISUDesigner {EnvironmentReport.VisuDesignerVersion}, CLASS 2 {EnvironmentReport.LasalClass2Version}");
    }

    private async Task ExtractAndInspectAsync()
    {
        if (string.IsNullOrWhiteSpace(SourceLprPath) || !File.Exists(SourceLprPath))
        {
            MessageBox.Show("Please select an existing LASAL SCREEN .lpr file first.", "Source Required", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        IsBusy = true;
        ProgressPercent = 10;
        ProgressMessage = "Extracting source LASAL SCREEN project (read-only staging)...";
        try
        {
            var extractor = new LasalScreenProjectExtractor();
            var model = await extractor.ExtractProjectAsync(
                SourceLprPath,
                string.IsNullOrWhiteSpace(Class2ProjectPath) ? null : Class2ProjectPath);
            _orchestrator.MappingRegistry.ApplyMappingsToModel(model);
            CurrentModel = model;
            ProgressPercent = 100;
            ProgressMessage = $"Extracted '{model.ProjectMetadata.ProjectName}' cleanly ({model.Screens.Count} screens, {model.Datapoints.Count} datapoints).";
        }
        catch (Exception ex)
        {
            ConverterLogger.Error("Extraction failed", ex);
            ProgressMessage = $"Extraction error: {ex.Message}";
            MessageBox.Show(ex.Message, "Extraction Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task RunConversionAsync()
    {
        if (string.IsNullOrWhiteSpace(SourceLprPath) || !File.Exists(SourceLprPath))
        {
            MessageBox.Show("Please select an existing LASAL SCREEN .lpr file first.", "Source Required", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        IsBusy = true;
        ProgressPercent = 0;
        WizardStep = 6;
        _conversionCts?.Dispose();
        _conversionCts = new CancellationTokenSource();

        var progress = new Progress<ConversionProgressUpdate>(u =>
        {
            ProgressPercent = u.PercentComplete;
            ProgressMessage = u.StageDescription;
        });

        try
        {
            int? tgtW = null;
            int? tgtH = null;
            if (!string.Equals(ResolutionMode, "Original", StringComparison.OrdinalIgnoreCase))
            {
                tgtW = CustomTargetWidth;
                tgtH = CustomTargetHeight;
            }

            var req = new ConversionRequest
            {
                SourceLprPath = SourceLprPath,
                Class2ProjectPath = string.IsNullOrWhiteSpace(Class2ProjectPath) ? null : Class2ProjectPath,
                TargetOutputDirectory = TargetOutputDirectory,
                TargetWidth = tgtW,
                TargetHeight = tgtH,
                PreserveAspectRatio = PreserveAspectRatio,
                ConvertBmpTransparencyToPng = ConvertBmpTransparency,
                PublishWebroot = PublishWebroot,
                OverwriteTarget = true
            };

            var res = await _orchestrator.RunConversionAsync(req, progress, _conversionCts.Token);
            LastResult = res;
            CurrentModel = res.IntermediateModel;

            ValidationComparisons.Clear();
            foreach (var comp in res.ValidationResult.ScreenComparisons)
            {
                ValidationComparisons.Add(comp);
            }
            SelectedValidationScreen = ValidationComparisons.FirstOrDefault();

            OnPropertyChanged(nameof(LastValidationSummaryText));
            ConverterLogger.Info($"Conversion completed in {res.Duration.TotalSeconds:F1}s: {res.VisuResult.LvpFilePath}");
        }
        catch (OperationCanceledException)
        {
            ProgressMessage = "Conversion cancelled by user.";
        }
        catch (Exception ex)
        {
            ConverterLogger.Error("Conversion failed", ex);
            ProgressMessage = $"Conversion error: {ex.Message}";
            MessageBox.Show(ex.Message, "Conversion Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void RefreshModelDerivedCollections()
    {
        InspectorScreens.Clear();
        Assets.Clear();

        if (CurrentModel != null)
        {
            if (CurrentModel.GlobalScreen != null)
            {
                InspectorScreens.Add(CurrentModel.GlobalScreen);
            }
            foreach (var s in CurrentModel.Screens) InspectorScreens.Add(s);
            foreach (var w in CurrentModel.Windows) InspectorScreens.Add(w);
            SelectedInspectorScreen = InspectorScreens.FirstOrDefault();

            foreach (var a in CurrentModel.Assets) Assets.Add(a);
        }

        RefreshFilteredDatapoints();
        OnPropertyChanged(nameof(SummaryKpiText));
    }

    private void RefreshFilteredDatapoints()
    {
        FilteredDatapoints.Clear();
        if (CurrentModel == null) return;

        var filter = DatapointSearchFilter.Trim();
        var items = string.IsNullOrEmpty(filter)
            ? CurrentModel.Datapoints
            : CurrentModel.Datapoints.Where(d =>
                d.SymbolPath.Contains(filter, StringComparison.OrdinalIgnoreCase) ||
                d.ClassName.Contains(filter, StringComparison.OrdinalIgnoreCase));

        foreach (var d in items)
        {
            FilteredDatapoints.Add(d);
        }
    }

    private void LoadMappingRulesCollection()
    {
        MappingRules.Clear();
        foreach (var r in _orchestrator.MappingRegistry.Rules.OrderBy(x => x.SourceType))
        {
            MappingRules.Add(r);
        }
    }

    private void ExportMappingRules()
    {
        var dlg = new SaveFileDialog
        {
            Filter = "Mapping Rules JSON (*.json)|*.json",
            FileName = "lasal_mapping_rules.json"
        };
        if (dlg.ShowDialog() == true)
        {
            _orchestrator.MappingRegistry.SaveRulesToFile(dlg.FileName);
            MessageBox.Show($"Saved mapping rules to:\n{dlg.FileName}", "Mappings Exported", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void ImportMappingRules()
    {
        var dlg = new OpenFileDialog
        {
            Filter = "Mapping Rules JSON (*.json)|*.json"
        };
        if (dlg.ShowDialog() == true)
        {
            _orchestrator.MappingRegistry.LoadRulesFromFile(dlg.FileName);
            LoadMappingRulesCollection();
            if (CurrentModel != null)
            {
                _orchestrator.MappingRegistry.ApplyMappingsToModel(CurrentModel);
            }
            MessageBox.Show($"Loaded mapping rules from:\n{dlg.FileName}", "Mappings Imported", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void BrowseSourceLpr()
    {
        var dlg = new OpenFileDialog
        {
            Title = "Select Source LASAL SCREEN Project (.lpr)",
            Filter = "LASAL SCREEN Project (*.lpr)|*.lpr|All Files (*.*)|*.*"
        };
        if (dlg.ShowDialog() == true)
        {
            SourceLprPath = dlg.FileName;
            var autoClass2 = new Class2.LasalClass2ProjectParser().TryAutoDiscoverClass2Project(SourceLprPath);
            if (!string.IsNullOrEmpty(autoClass2))
            {
                Class2ProjectPath = autoClass2;
            }
        }
    }

    private void BrowseClass2Project()
    {
        var dlg = new OpenFileDialog
        {
            Title = "Select Companion LASAL CLASS 2 Project (.lsm or .lcp)",
            Filter = "LASAL CLASS 2 Project (*.lsm;*.lcp)|*.lsm;*.lcp|All Files (*.*)|*.*"
        };
        if (dlg.ShowDialog() == true)
        {
            Class2ProjectPath = dlg.FileName;
        }
    }

    private void BrowseTargetDirectory()
    {
        var dlg = new OpenFolderDialog
        {
            Title = "Select Target VISUDesigner Output Directory"
        };
        if (dlg.ShowDialog() == true)
        {
            TargetOutputDirectory = dlg.FolderName;
        }
    }

    private void ToggleTheme()
    {
        IsDarkTheme = !IsDarkTheme;
        if (Application.Current is App app)
        {
            app.ApplyTheme(IsDarkTheme);
        }
    }

    private void LoadDocumentationFile(string fileName)
    {
        SelectedDocTitle = fileName;
        var baseDirs = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "docs"),
            @"C:\SigmaControl\docs"
        };
        foreach (var dir in baseDirs)
        {
            var path = Path.Combine(dir, fileName);
            if (File.Exists(path))
            {
                SelectedDocContent = File.ReadAllText(path);
                return;
            }
        }
        SelectedDocContent = $"Documentation file '{fileName}' was not found.";
    }

    private void TryAutoPopulateDefaultExamplePaths()
    {
        var candidates = new[]
        {
            @"C:\SigmaControl\main-hmi-lse\Bobst_HMI_Screen_LSE.lpr",
            @"C:\SigmaControl\examples\SampleSource\4_PumpControlSchemeSolution\Stations\Terminal\LSE\LSE.lpr"
        };
        foreach (var candidate in candidates)
        {
            if (File.Exists(candidate))
            {
                SourceLprPath = candidate;
                var autoClass2 = new Class2.LasalClass2ProjectParser().TryAutoDiscoverClass2Project(candidate);
                if (!string.IsNullOrEmpty(autoClass2)) Class2ProjectPath = autoClass2;
                return;
            }
        }
    }

    private static void OpenFileShell(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || (!File.Exists(path) && !Directory.Exists(path)))
        {
            MessageBox.Show("Target file or folder does not exist yet. Run a conversion first.", "Not Available", MessageBoxButton.OK, MessageBoxImage.Information);
            return;
        }
        Process.Start(new ProcessStartInfo(path) { UseShellExecute = true });
    }

    private static BitmapImage? LoadBitmapFromPath(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
            return null;
        }
        try
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.CacheOption = BitmapCacheOption.OnLoad;
            bmp.UriSource = new Uri(path, UriKind.Absolute);
            bmp.EndInit();
            bmp.Freeze();
            return bmp;
        }
        catch
        {
            return null;
        }
    }
}
