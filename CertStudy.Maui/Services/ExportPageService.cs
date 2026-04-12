namespace CertStudy.Maui.Services;

public class ExportPageService : IDisposable
{
    private readonly QuestionService _questionService;
    private readonly ExportCommand _exportCmd;
    private readonly ExportSettingsService _settings;

    public List<Certification> Certifications { get; private set; } = new();
    public string SelectedCertId { get; set; } = "";
    public bool IsExporting { get; private set; }
    public int ProgressPercent { get; private set; }
    public string CurrentItem { get; private set; } = "";
    public ExportResult? Result { get; private set; }

    public ExportSettings Settings => _settings.Settings;
    public event Action? OnChange;

    public ExportPageService(QuestionService qs, ExportCommand ec, ExportSettingsService es)
    {
        _questionService = qs;
        _exportCmd = ec;
        _settings = es;
    }

    public async Task InitAsync()
    {
        Certifications = await _questionService.GetCertificationsAsync();
        OnChange?.Invoke();
    }

    public async Task PickFolder()
    {
        var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "CertStudy_Export");
        _settings.UpdateOutputPath(path);
        OnChange?.Invoke();
    }

    public async Task ExportAsync()
    {
        IsExporting = true;
        ProgressPercent = 0;
        Result = null;
        OnChange?.Invoke();

        var progress = new Progress<ExportProgress>(p =>
        {
            ProgressPercent = (int)p.Percent;
            CurrentItem = p.CurrentItem;
            OnChange?.Invoke();
        });

        var questions = string.IsNullOrEmpty(SelectedCertId)
            ? await _questionService.GetAllQuestionsAsync()
            : await _questionService.GetQuestionsAsync(SelectedCertId);

        Result = await _exportCmd.ExportAsync(questions, progress);
        IsExporting = false;
        OnChange?.Invoke();
    }

    public void Dispose() { }
}
