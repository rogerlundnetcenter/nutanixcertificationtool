namespace CertStudy.Maui.Data.Entities;

public class ExamAttempt
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CertificationId { get; set; } = "";
    public string CertificationName { get; set; } = "";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int TotalQuestions { get; set; }
    public int AnsweredCount { get; set; }
    public int CorrectCount { get; set; }
    public int TimeLimitMinutes { get; set; } = 120;
    public int TimeSpentSeconds { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsPassed => ScorePercent >= 75.0;
    public double ScorePercent => TotalQuestions > 0 ? (double)CorrectCount / TotalQuestions * 100 : 0;
    public List<ExamAnswer> Answers { get; set; } = new();
}

public class ExamAnswer
{
    public string QuestionId { get; set; } = "";
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = "";
    public List<string> SelectedLetters { get; set; } = new();
    public List<string> CorrectLetters { get; set; } = new();
    public string Explanation { get; set; } = "";
    public bool IsCorrect { get; set; }
    public bool IsAnswered => SelectedLetters.Any();
}

public enum SimulatorMode { FullExam, Custom }
