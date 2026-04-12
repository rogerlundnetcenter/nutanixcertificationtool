namespace CertStudy.Maui.Data.Entities;

public class Certification
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..16];
    public string Code { get; set; } = string.Empty;  // e.g., "NCP-US-6.10"
    public string Name { get; set; } = string.Empty;
    public string? Version { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public List<Question> Questions { get; set; } = new();
    public List<Domain> Domains { get; set; } = new();
}
