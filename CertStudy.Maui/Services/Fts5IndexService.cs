using Microsoft.Data.Sqlite;

namespace CertStudy.Maui.Services;

public class Fts5IndexService
{
    private readonly string _connectionString;

    public Fts5IndexService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<SearchResult>> SearchAsync(SearchQuery query)
    {
        var sql = Fts5QueryBuilder.BuildSearch(query);
        var results = new List<SearchResult>();

        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();
        using var command = new SqliteCommand(sql, connection);

        if (!string.IsNullOrEmpty(query.Term))
            command.Parameters.AddWithValue("@term", query.Term + "*");

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(SearchResultMapper.Map(reader));
        }

        return results;
    }

    public async Task<int> GetTotalCountAsync(SearchQuery query)
    {
        var sql = Fts5QueryBuilder.BuildCount(query);

        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();
        using var command = new SqliteCommand(sql, connection);

        if (!string.IsNullOrEmpty(query.Term))
            command.Parameters.AddWithValue("@term", query.Term + "*");

        var result = await command.ExecuteScalarAsync();
        return result != null ? Convert.ToInt32(result) : 0;
    }

    public async Task RebuildIndexAsync()
    {
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();
        using var command = new SqliteCommand(
            "INSERT INTO QuestionSearch(QuestionSearch) VALUES('rebuild')", connection);
        await command.ExecuteNonQueryAsync();
    }
}
