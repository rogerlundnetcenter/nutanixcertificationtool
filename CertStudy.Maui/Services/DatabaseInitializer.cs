using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using CertStudy.Maui.Data.Migrations;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class DatabaseInitializer
{
    private readonly AppDbContext _context;

    public DatabaseInitializer(AppDbContext context)
    {
        _context = context;
    }

    public async Task InitializeAsync()
    {
        await _context.Database.EnsureCreatedAsync();

        // Run FTS5 migrations
        var connectionString = _context.Database.GetDbConnection().ConnectionString;
        await RunFts5MigrationAsync(connectionString);

        if (!await _context.Certifications.AnyAsync())
        {
            await SeedAsync();
        }
    }

    private static async Task RunFts5MigrationAsync(string connectionString)
    {
        using var connection = new SqliteConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
CREATE VIRTUAL TABLE IF NOT EXISTS QuestionSearch USING fts5(
    Stem,
    Explanation,
    content='Questions',
    content_rowid='Id'
);

CREATE TRIGGER IF NOT EXISTS QuestionSearch_ai AFTER INSERT ON Questions BEGIN
    INSERT INTO QuestionSearch (rowid, Stem, Explanation)
    VALUES (new.Id, new.Stem, new.Explanation);
END;

CREATE TRIGGER IF NOT EXISTS QuestionSearch_ad AFTER DELETE ON Questions BEGIN
    INSERT INTO QuestionSearch (QuestionSearch, rowid, Stem, Explanation)
    VALUES ('delete', old.Id, old.Stem, old.Explanation);
END;

CREATE TRIGGER IF NOT EXISTS QuestionSearch_au AFTER UPDATE ON Questions BEGIN
    INSERT INTO QuestionSearch (QuestionSearch, rowid, Stem, Explanation)
    VALUES ('delete', old.Id, old.Stem, old.Explanation);
    INSERT INTO QuestionSearch (rowid, Stem, Explanation)
    VALUES (new.Id, new.Stem, new.Explanation);
END;";

        using var command = new SqliteCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task SeedAsync()
    {
        var ncp = new Certification
        {
            Code = "NCP-DS",
            Name = "Nutanix Certified Professional - Data Services",
            Version = "6.5",
            Domains = new()
            {
                new() { Number = 1, Name = "Data Services Architecture" },
                new() { Number = 2, Name = "Volume Groups" },
                new() { Number = 3, Name = "Data Protection" },
                new() { Number = 4, Name = "Disaster Recovery" },
                new() { Number = 5, Name = "Security and Compliance" }
            }
        };

        _context.Certifications.Add(ncp);
        await _context.SaveChangesAsync();
    }
}
