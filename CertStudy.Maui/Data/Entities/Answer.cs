namespace CertStudy.Maui.Data.Entities;

public class Answer
{
    public int Id { get; set; }
    public string Letter { get; set; } = string.Empty;  // A, B, C...
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Order { get; set; }  // For ordering questions
    
    // Foreign key
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}
