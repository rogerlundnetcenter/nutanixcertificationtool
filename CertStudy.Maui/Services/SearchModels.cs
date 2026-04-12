using Microsoft.Data.Sqlite;

namespace CertStudy.Maui.Services;

public class SearchQuery
{
    public string? Term { get; set; }
    public string? CertificationId { get; set; }
    public int? DomainId { get; set; }
    public QuestionType? Type { get; set; }
    public QuestionStatus? Status { get; set; }
    public int Limit { get; set; } = 50;
    public int Offset { get; set; }
}

public class SearchResult
{
    public int QuestionId { get; set; }
    public string Stem { get; set; } = "";
    public string? Explanation { get; set; }
    public double Rank { get; set; }
    public string? HighlightedStem { get; set; }
}

public static class SearchResultMapper
{
    public static SearchResult Map(SqliteDataReader reader)
    {
        return new SearchResult
        {
            QuestionId = reader.GetInt32(0),
            Stem = reader.GetString(1),
            Explanation = reader.IsDBNull(2) ? null : reader.GetString(2),
            Rank = reader.IsDBNull(3) ? 0 : reader.GetDouble(3),
            HighlightedStem = reader.IsDBNull(4) ? null : reader.GetString(4)
        };
    }
}
