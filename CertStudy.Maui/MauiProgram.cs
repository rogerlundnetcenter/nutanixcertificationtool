using CertStudy.Maui.Data;
using CertStudy.Maui.Services;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        // Database path - platform-specific
        var dbPath = GetDatabasePath();
        Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite($"Data Source={dbPath}"));

        // Services
        builder.Services.AddSingleton<QuestionService>();
        builder.Services.AddSingleton<SearchService>();
        builder.Services.AddSingleton<MarkdownExportService>();
        builder.Services.AddSingleton<OllamaValidationService>();
        builder.Services.AddSingleton<DatabaseInitializer>();

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
#endif

        var app = builder.Build();

        // Initialize database
        using var scope = app.Services.CreateScope();
        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        initializer.InitializeAsync().Wait();

        return app;
    }

    private static string GetDatabasePath()
    {
        var basePath = FileSystem.AppDataDirectory;
        return Path.Combine(basePath, "CertStudy", "questions.db");
    }
}
