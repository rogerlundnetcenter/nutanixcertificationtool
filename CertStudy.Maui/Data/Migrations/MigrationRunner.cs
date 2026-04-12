using Microsoft.Data.Sqlite;
using System.Reflection;

namespace CertStudy.Maui.Data.Migrations;

public class MigrationRunner
{
    private readonly string _connectionString;

    public MigrationRunner(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task RunMigrationsAsync()
    {
        var assembly = typeof(MigrationRunner).Assembly;
        var migrationFiles = assembly.GetManifestResourceNames()
            .Where(r => r.EndsWith(".sql"))
            .OrderBy(r => r)
            .ToList();

        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        foreach (var resourceName in migrationFiles)
        {
            var sql = await ReadResourceAsync(assembly, resourceName);
            using var command = new SqliteCommand(sql, connection);
            await command.ExecuteNonQueryAsync();
        }
    }

    private static async Task<string> ReadResourceAsync(Assembly assembly, string name)
    {
        using var stream = assembly.GetManifestResourceStream(name);
        using var reader = new StreamReader(stream!);
        return await reader.ReadToEndAsync();
    }
}
