namespace CertStudy.Maui.Services;

public static class Fts5QueryBuilder
{
    public static string BuildSearch(SearchQuery query)
    {
        var builder = new SearchQueryBuilder();

        if (string.IsNullOrEmpty(query.Term))
        {
            builder.SelectFrom("Questions q")
                   .Join("Certifications c ON c.Id = q.CertificationId")
                   .Where("1=1");
        }
        else
        {
            builder.SelectFrom("QuestionSearch s")
                   .Join("Questions q ON q.Id = s.rowid")
                   .Join("Certifications c ON c.Id = q.CertificationId")
                   .Where("QuestionSearch MATCH @term")
                   .OrderBy("rank");
        }

        ApplyFilters(builder, query);

        return builder
            .Select("q.Id, q.Stem, q.Explanation, s.rank")
            .AddSelect("snippet(QuestionSearch, 0, '<mark>', '</mark>', '...', 10) as HighlightedStem")
            .Limit(query.Limit)
            .Offset(query.Offset)
            .Build();
    }

    public static string BuildCount(SearchQuery query)
    {
        var builder = new SearchQueryBuilder();

        if (string.IsNullOrEmpty(query.Term))
        {
            builder.SelectFrom("Questions q").Where("1=1");
        }
        else
        {
            builder.SelectFrom("QuestionSearch s")
                   .Join("Questions q ON q.Id = s.rowid")
                   .Where("QuestionSearch MATCH @term");
        }

        ApplyFilters(builder, query);
        return builder.SelectCount().Build();
    }

    private static void ApplyFilters(SearchQueryBuilder builder, SearchQuery query)
    {
        if (!string.IsNullOrEmpty(query.CertificationId))
            builder.Where($"q.CertificationId = '{query.CertificationId}'");

        if (query.DomainId.HasValue)
            builder.Where($"q.DomainId = {query.DomainId.Value}");

        if (query.Type.HasValue)
            builder.Where($"q.Type = {(int)query.Type.Value}");

        if (query.Status.HasValue)
            builder.Where($"q.Status = {(int)query.Status.Value}");
    }
}
