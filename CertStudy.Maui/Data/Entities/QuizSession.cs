namespace CertStudy.Maui.Data.Entities;

public class QuizSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CertificationId { get; set; } = "";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int TotalQuestions { get; set; }
    public List<QuizAnswer> Answers { get; set; } = new();
    public bool IsCompleted => CompletedAt.HasValue;

    public int CorrectCount => Answers.Count(a => a.IsCorrect);
    public double ScorePercent => TotalQuestions > 0
        ? (double)CorrectCount / TotalQuestions * 100
        : 0;
    public int TimeSpentSeconds => CompletedAt.HasValue
        ? (int)(CompletedAt.Value - StartedAt).TotalSeconds
        : (int)(DateTime.UtcNow - StartedAt).TotalSeconds;
}

public class QuizAnswer
{
    public string QuestionId { get; set; } = "";
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = "";
    public List<string> SelectedLetters { get; set; } = new();
    public List<string> CorrectLetters { get; set; } = new();
    public bool IsCorrect { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    public int TimeSpentSeconds { get; set; }
}

public enum QuizMode { Random, Sequential, WeakAreas, Bookmarked }
