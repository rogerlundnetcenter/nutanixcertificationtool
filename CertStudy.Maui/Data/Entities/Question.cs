namespace CertStudy.Maui.Data.Entities;

public enum QuestionType { Single, Multi, Ordering }
public enum QuestionStatus { Draft, Review, Approved, Archived }

public class Question
{
    public int Id { get; set; }
    public int Number { get; set; }  // Q1, Q2, etc.
    public QuestionType Type { get; set; } = QuestionType.Single;
    public string Stem { get; set; } = string.Empty;  // Question text
    public string Explanation { get; set; } = string.Empty;
    public int Difficulty { get; set; } = 3;  // 1-5 scale
    public QuestionStatus Status { get; set; } = QuestionStatus.Draft;
    public string? ValidationReasoning { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Knowledge Base references (comma-separated URLs/docs)
    public string? KbReferences { get; set; }
    
    // Foreign keys
    public string CertificationId { get; set; } = string.Empty;
    public Certification Certification { get; set; } = null!;
    
    public int DomainId { get; set; }
    public Domain Domain { get; set; } = null!;
    
    // Navigation
    public List<Answer> Answers { get; set; } = new();
}
