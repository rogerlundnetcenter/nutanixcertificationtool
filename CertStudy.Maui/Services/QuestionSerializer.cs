using CertStudy.Maui.Data.Entities;
using System.Text.Json;

namespace CertStudy.Maui.Services;

public static class QuestionSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public static string ToJson(Question q) => JsonSerializer.Serialize(MapToDto(q), Options);
    
    public static string ToJsonBatch(IEnumerable<Question> questions) =>
        JsonSerializer.Serialize(questions.Select(MapToDto), Options);

    public static QuestionDto? FromJson(string json) => JsonSerializer.Deserialize<QuestionDto>(json, Options);

    private static QuestionDto MapToDto(Question q) => new()
    {
        Id = q.Id,
        Number = q.Number,
        Certification = q.Certification?.Code ?? "",
        Domain = q.Domain?.Name ?? "",
        Type = q.Type.ToString(),
        Status = q.Status.ToString(),
        Stem = q.Stem,
        Explanation = q.Explanation,
        Answers = q.Answers.Select(a => new AnswerDto
        {
            Letter = a.Letter,
            Text = a.Text,
            IsCorrect = a.IsCorrect
        }).ToList()
    };
}

public class QuestionDto
{
    public int Id { get; set; }
    public int Number { get; set; }
    public string Certification { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Type { get; set; } = "";
    public string Status { get; set; } = "";
    public string Stem { get; set; } = "";
    public string Explanation { get; set; } = "";
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public string Letter { get; set; } = "";
    public string Text { get; set; } = "";
    public bool IsCorrect { get; set; }
}
