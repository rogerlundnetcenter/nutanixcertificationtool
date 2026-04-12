namespace CertStudy.Maui.Services;

public class OllamaValidationResult
{
    public string Status { get; set; } = "";
    public float Confidence { get; set; }
    public string Reasoning { get; set; } = "";
    public List<string> Suggestions { get; set; } = new();
}
