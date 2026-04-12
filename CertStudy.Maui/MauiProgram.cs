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
        builder.Services.AddSingleton<DatabaseInitializer>();
        builder.Services.AddSingleton<QuestionService>();
        builder.Services.AddSingleton<QuestionCommandService>();
        builder.Services.AddSingleton<MarkdownExportService>();
        builder.Services.AddSingleton<ExportSettingsService>();
        builder.Services.AddSingleton<ExportCommand>();
        builder.Services.AddSingleton<ExportPageService>();
        builder.Services.AddSingleton<DashboardDataService>();
        builder.Services.AddSingleton<ChartJsService>();
        builder.Services.AddSingleton<Fts5IndexService>(sp =>
            new Fts5IndexService($"Data Source={dbPath}"));
        builder.Services.AddSingleton<SearchPageService>();
        builder.Services.AddSingleton<StressTestDataGenerator>();

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
