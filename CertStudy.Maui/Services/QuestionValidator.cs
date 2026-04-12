using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class QuestionValidator
{
    public static ValidationResult Validate(Question question)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(question.Stem))
            errors.Add("Question stem is required");

        if (question.Stem?.Length < 10)
            errors.Add("Question stem must be at least 10 characters");

        if (question.Answers.Count < 2)
            errors.Add("At least 2 answers are required");

        if (question.Answers.Count > 6)
            errors.Add("Maximum 6 answers allowed");

        var correctCount = question.Answers.Count(a => a.IsCorrect);
        if (correctCount == 0)
            errors.Add("At least one answer must be marked correct");

        if (question.Type == QuestionType.Single && correctCount > 1)
            errors.Add("Single answer questions can only have one correct answer");

        if (question.Type == QuestionType.Multi && correctCount < 2)
            errors.Add("Multi-select questions must have at least 2 correct answers");

        if (question.Answers.Any(a => string.IsNullOrWhiteSpace(a.Text)))
            errors.Add("All answers must have text");

        if (string.IsNullOrWhiteSpace(question.Explanation))
            errors.Add("Explanation is required");

        return new ValidationResult
        {
            IsValid = !errors.Any(),
            Errors = errors
        };
    }
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
}
