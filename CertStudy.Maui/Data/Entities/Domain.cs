namespace CertStudy.Maui.Data.Entities;

public class Domain
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // e.g., "Domain 1: Security"
    public int Number { get; set; }
    
    // Foreign keys
    public string CertificationId { get; set; } = string.Empty;
    public Certification Certification { get; set; } = null!;
    
    // Navigation
    public List<Question> Questions { get; set; } = new();
}
