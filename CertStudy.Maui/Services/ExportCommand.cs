using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public class ExportCommand
{
    private readonly ExportSettingsService _settings;

    public ExportCommand(ExportSettingsService settings)
    {
        _settings = settings;
    }

    public async Task<ExportResult> ExportAsync(IEnumerable<Question> questions, IProgress<ExportProgress>? progress = null)
    {
        var settings = _settings.Settings;
        Directory.CreateDirectory(settings.OutputPath);

        var items = questions.ToList();
        var exported = new List<string>();
        var errors = new List<string>();

        for (int i = 0; i < items.Count; i++)
        {
            var q = items[i];
            try
            {
                if (settings.Format is ExportFormat.Markdown or ExportFormat.Both)
                    await ExportMarkdownAsync(q, settings);

                if (settings.Format is ExportFormat.Json or ExportFormat.Both)
                    await ExportJsonAsync(q, settings);

                exported.Add(q.Number.ToString());
            }
            catch (Exception ex)
            {
                errors.Add($"Q{q.Number}: {ex.Message}");
            }

            progress?.Report(new ExportProgress { Current = i + 1, Total = items.Count, CurrentItem = $"Q{q.Number}" });
        }

        return new ExportResult { Exported = exported, Errors = errors, OutputPath = settings.OutputPath };
    }

    private static async Task ExportMarkdownAsync(Question q, ExportSettings s)
    {
        var fileName = MarkdownFormatter.GetFileName(q, s) + ".md";
        var path = Path.Combine(s.OutputPath, fileName);

        if (File.Exists(path) && !s.OverwriteExisting)
            throw new InvalidOperationException("File exists");

        var markdown = MarkdownFormatter.FormatQuestion(q);
        await File.WriteAllTextAsync(path, markdown);
    }

    private static async Task ExportJsonAsync(Question q, ExportSettings s)
    {
        var fileName = MarkdownFormatter.GetFileName(q, s).Replace(".md", "") + ".json";
        var path = Path.Combine(s.OutputPath, fileName);

        if (File.Exists(path) && !s.OverwriteExisting)
            throw new InvalidOperationException("File exists");

        var json = QuestionSerializer.ToJson(q);
        await File.WriteAllTextAsync(path, json);
    }
}

public class ExportResult
{
    public List<string> Exported { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public string OutputPath { get; set; } = "";
    public bool Success => !Exported.Any() && !Errors.Any();
}

public class ExportProgress
{
    public int Current { get; set; }
    public int Total { get; set; }
    public string CurrentItem { get; set; } = "";
    public double Percent => Total > 0 ? (double)Current / Total * 100 : 0;
}
