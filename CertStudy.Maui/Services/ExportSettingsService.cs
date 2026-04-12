using System.Text.Json;

namespace CertStudy.Maui.Services;

public class ExportSettingsService
{
    private readonly string _settingsPath;
    private ExportSettings _settings = new();

    public ExportSettingsService()
    {
        var basePath = FileSystem.AppDataDirectory;
        _settingsPath = Path.Combine(basePath, "CertStudy", "export-settings.json");
        _ = LoadAsync();
    }

    public ExportSettings Settings => _settings;

    public async Task LoadAsync()
    {
        if (File.Exists(_settingsPath))
        {
            var json = await File.ReadAllTextAsync(_settingsPath);
            _settings = JsonSerializer.Deserialize<ExportSettings>(json) ?? new();
        }
    }

    public async Task SaveAsync()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_settingsPath)!);
        var json = JsonSerializer.Serialize(_settings, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(_settingsPath, json);
    }

    public void UpdateOutputPath(string path) { _settings.OutputPath = path; _ = SaveAsync(); }
    public void UpdateNamingPattern(string pattern) { _settings.NamingPattern = pattern; _ = SaveAsync(); }
    public void UpdateFormat(ExportFormat format) { _settings.Format = format; _ = SaveAsync(); }
}

public class ExportSettings
{
    public string OutputPath { get; set; } = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "CertStudy_Export");
    public string NamingPattern { get; set; } = "Q{number}_{domain}.md";
    public ExportFormat Format { get; set; } = ExportFormat.Markdown;
    public bool IncludeJson { get; set; } = true;
    public bool OverwriteExisting { get; set; } = false;
}

public enum ExportFormat { Markdown, Json, Both }
