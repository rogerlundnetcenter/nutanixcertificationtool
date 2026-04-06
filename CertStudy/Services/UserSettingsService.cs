using System.IO;
using System.Text.Json;

namespace CertStudy.Services;

/// <summary>
/// Simple JSON-based user settings persistence.
/// Settings are stored in %APPDATA%\CertStudy\settings.json
/// </summary>
static class UserSettingsService
{
    private static readonly string SettingsPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "CertStudy",
        "settings.json"
    );

    private static UserSettings? _cached;

    public static UserSettings Load()
    {
        if (_cached != null) return _cached;

        try
        {
            if (File.Exists(SettingsPath))
            {
                var json = File.ReadAllText(SettingsPath);
                _cached = JsonSerializer.Deserialize<UserSettings>(json);
                if (_cached != null) return _cached;
            }
        }
        catch
        {
            // If reading fails, use defaults
        }

        _cached = new UserSettings();
        return _cached;
    }

    public static void Save(UserSettings settings)
    {
        _cached = settings;
        try
        {
            var dir = Path.GetDirectoryName(SettingsPath);
            if (dir != null && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(SettingsPath, json);
        }
        catch
        {
            // Silently fail - settings persistence is not critical
        }
    }
}

/// <summary>
/// User settings model. Add properties as needed.
/// </summary>
class UserSettings
{
    public bool DisclaimerAccepted { get; set; }
}
