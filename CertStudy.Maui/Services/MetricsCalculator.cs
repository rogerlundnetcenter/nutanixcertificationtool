using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class MetricsCalculator
{
    public static DashboardMetrics Calculate(IEnumerable<Question> questions)
    {
        var items = questions.ToList();
        var byType = items.GroupBy(q => q.Type).ToDictionary(g => g.Key, g => g.Count());
        var byStatus = items.GroupBy(q => q.Status).ToDictionary(g => g.Key, g => g.Count());
        var byDomain = items.GroupBy(q => q.Domain?.Name ?? "Unknown").ToDictionary(g => g.Key, g => g.Count());
        var byCert = items.GroupBy(q => q.Certification?.Code ?? "Unknown").ToDictionary(g => g.Key, g => g.Count());

        return new DashboardMetrics
        {
            TotalQuestions = items.Count,
            TotalAnswers = items.Sum(q => q.Answers?.Count ?? 0),
            ByType = byType,
            ByStatus = byStatus,
            ByDomain = byDomain,
            ByCertification = byCert,
            AverageAnswersPerQuestion = items.Any() ? items.Average(q => q.Answers?.Count ?? 0) : 0,
            CompletionRate = CalculateCompletionRate(items)
        };
    }

    private static double CalculateCompletionRate(List<Question> items)
    {
        if (!items.Any()) return 0;
        var approved = items.Count(q => q.Status == QuestionStatus.Approved);
        return (double)approved / items.Count * 100;
    }
}

public class DashboardMetrics
{
    public int TotalQuestions { get; set; }
    public int TotalAnswers { get; set; }
    public double AverageAnswersPerQuestion { get; set; }
    public double CompletionRate { get; set; }
    public Dictionary<QuestionType, int> ByType { get; set; } = new();
    public Dictionary<QuestionStatus, int> ByStatus { get; set; } = new();
    public Dictionary<string, int> ByDomain { get; set; } = new();
    public Dictionary<string, int> ByCertification { get; set; } = new();
}
