using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class ImportValidator
{
    public static List<string> Validate(ImportQuestionDto dto)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Text))
            errors.Add("Question text is required");

        if (dto.Text.Length < 10)
            errors.Add("Question text too short (< 10 chars)");

        if (!dto.Answers.Any())
            errors.Add("At least one answer required");

        if (dto.Answers.Count < 2)
            errors.Add("At least two answers required");

        if (!dto.Answers.Any(a => a.IsCorrect))
            errors.Add("At least one correct answer required");

        if (dto.Type == QuestionType.Single && dto.Answers.Count(a => a.IsCorrect) > 1)
            errors.Add("Single-select questions must have exactly one correct answer");

        if (string.IsNullOrWhiteSpace(dto.DomainName))
            errors.Add("Domain name is required");

        var duplicateLetters = dto.Answers
            .GroupBy(a => a.Letter)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);

        foreach (var letter in duplicateLetters)
            errors.Add($"Duplicate answer letter: {letter}");

        return errors;
    }

    public static ImportValidationSummary ValidateBatch(List<ImportQuestionDto> dtos)
    {
        var summary = new ImportValidationSummary();

        foreach (var dto in dtos)
        {
            var errors = Validate(dto);
            if (errors.Any())
            {
                summary.InvalidCount++;
                summary.Errors.Add($"Q{dto.Number}: {string.Join(", ", errors)}");
            }
            else
            {
                summary.ValidCount++;
            }
        }

        return summary;
    }
}

public class ImportValidationSummary
{
    public int ValidCount { get; set; }
    public int InvalidCount { get; set; }
    public List<string> Errors { get; set; } = new();
    public bool IsValid => InvalidCount == 0;
}
