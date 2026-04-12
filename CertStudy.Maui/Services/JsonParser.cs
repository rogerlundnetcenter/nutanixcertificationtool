using System.Text.Json;
using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class JsonParser
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public static ImportQuestionDto? Parse(string json)
    {
        try
        {
            var dto = JsonSerializer.Deserialize<QuestionExportDto>(json, Options);
            if (dto == null) return null;

            return new ImportQuestionDto
            {
                Number = dto.Number,
                DomainName = dto.Domain ?? "Unknown",
                Type = ParseType(dto.Type),
                Status = ParseStatus(dto.Status),
                Text = dto.Text,
                Explanation = dto.Explanation ?? "",
                Answers = dto.Answers?.Select(a => new ImportAnswerDto
                {
                    Letter = a.Letter,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect
                }).ToList() ?? new List<ImportAnswerDto>()
            };
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static List<ImportQuestionDto> ParseBatch(string json)
    {
        try
        {
            var dtos = JsonSerializer.Deserialize<List<QuestionExportDto>>(json, Options);
            return dtos?.Select(d => Parse(JsonSerializer.Serialize(d, Options)))
                       .Where(d => d != null)
                       .Cast<ImportQuestionDto>()
                       .ToList() ?? new List<ImportQuestionDto>();
        }
        catch (JsonException)
        {
            return new List<ImportQuestionDto>();
        }
    }

    private static QuestionType ParseType(string value) =>
        value.ToLower() switch
        {
            "multiselect" => QuestionType.MultiSelect,
            "ordering" => QuestionType.Ordering,
            _ => QuestionType.Single
        };

    private static QuestionStatus ParseStatus(string value) =>
        value.ToLower() switch
        {
            "approved" => QuestionStatus.Approved,
            "archived" => QuestionStatus.Archived,
            "review" => QuestionStatus.Review,
            _ => QuestionStatus.Draft
        };
}

public class QuestionExportDto
{
    public int Number { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public string Text { get; set; } = "";
    public string? Domain { get; set; }
    public string? Certification { get; set; }
    public string? Explanation { get; set; }
    public List<AnswerExportDto>? Answers { get; set; }
}

public class AnswerExportDto
{
    public string Letter { get; set; } = "";
    public string Text { get; set; } = "";
    public bool IsCorrect { get; set; }
}
