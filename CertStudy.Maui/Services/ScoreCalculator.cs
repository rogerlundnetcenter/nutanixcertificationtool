using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class ScoreCalculator
{
    public static QuizScore Calculate(QuizSession session)
    {
        if (!session.IsCompleted || !session.Answers.Any())
            return new QuizScore();

        var byDomain = session.Answers
            .GroupBy(a => GetDomainFromQuestion(a.QuestionText))
            .ToDictionary(
                g => g.Key,
                g => new DomainScore
                {
                    Total = g.Count(),
                    Correct = g.Count(a => a.IsCorrect),
                    Percent = g.Count() > 0 ? (double)g.Count(a => a.IsCorrect) / g.Count() * 100 : 0
                });

        var byType = session.Answers
            .GroupBy(a => InferQuestionType(a.CorrectLetters.Count))
            .ToDictionary(
                g => g.Key,
                g => new TypeScore
                {
                    Total = g.Count(),
                    Correct = g.Count(a => a.IsCorrect)
                });

        return new QuizScore
        {
            TotalQuestions = session.TotalQuestions,
            CorrectAnswers = session.CorrectCount,
            Percentage = session.ScorePercent,
            TimeSpentMinutes = session.TimeSpentSeconds / 60.0,
            AverageTimePerQuestion = session.TimeSpentSeconds / (double)session.Answers.Count,
            ByDomain = byDomain,
            ByType = byType,
            PassThreshold = 70.0,
            IsPassing = session.ScorePercent >= 70.0
        };
    }

    private static string GetDomainFromQuestion(string text) => "General";

    private static string InferQuestionType(int correctCount) =>
        correctCount switch
        {
            1 => "Single",
            > 1 => "Multi",
            _ => "Unknown"
        };
}

public class QuizScore
{
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public double Percentage { get; set; }
    public double TimeSpentMinutes { get; set; }
    public double AverageTimePerQuestion { get; set; }
    public Dictionary<string, DomainScore> ByDomain { get; set; } = new();
    public Dictionary<string, TypeScore> ByType { get; set; } = new();
    public double PassThreshold { get; set; } = 70.0;
    public bool IsPassing { get; set; }
}

public class DomainScore
{
    public int Total { get; set; }
    public int Correct { get; set; }
    public double Percent { get; set; }
}

public class TypeScore
{
    public int Total { get; set; }
    public int Correct { get; set; }
}
