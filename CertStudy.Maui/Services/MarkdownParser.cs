using System.Text.RegularExpressions;
using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public static class MarkdownParser
{
    private static readonly Regex QuestionPattern = new(
        @"#\s*Q?(\d+)\s*-\s*(.+?)\n\n" +
        @"\*\*Type:\*\*\s*(Single|Multi|Ordering)\n\n" +
        @"\*\*Status:\*\*\s*(Draft|Review|Approved|Archived)\n\n" +
        @"##\s*Question\n\n(.+?)\n\n" +
        @"##\s*Answers\n\n(.+?)\n\n" +
        @"##\s*Explanation\n\n(.+?)$",
        RegexOptions.Singleline | RegexOptions.IgnoreCase);

    private static readonly Regex AnswerPattern = new(
        @"-\s*\[(.?)\]\s*\*\*([A-Z])\.\*\*\s*(.+?)(?=\n|$)",
        RegexOptions.Multiline);

    public static ImportQuestionDto? Parse(string markdown)
    {
        var match = QuestionPattern.Match(markdown);
        if (!match.Success) return null;

        var number = int.Parse(match.Groups[1].Value);
        var domainName = match.Groups[2].Value.Trim();
        var type = ParseType(match.Groups[3].Value);
        var status = ParseStatus(match.Groups[4].Value);
        var text = match.Groups[5].Value.Trim();
        var answersBlock = match.Groups[6].Value;
        var explanation = match.Groups[7].Value.Trim();

        var answers = ParseAnswers(answersBlock).ToList();

        return new ImportQuestionDto
        {
            Number = number,
            DomainName = domainName,
            Type = type,
            Status = status,
            Text = text,
            Answers = answers,
            Explanation = explanation
        };
    }

    private static QuestionType ParseType(string value) =>
        value.ToLower() switch
        {
            "multi" => QuestionType.MultiSelect,
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

    private static IEnumerable<ImportAnswerDto> ParseAnswers(string block)
    {
        var matches = AnswerPattern.Matches(block);
        foreach (Match m in matches)
        {
            yield return new ImportAnswerDto
            {
                Letter = m.Groups[2].Value,
                Text = m.Groups[3].Value.Trim(),
                IsCorrect = m.Groups[1].Value == "x"
            };
        }
    }
}

public class ImportQuestionDto
{
    public int Number { get; set; }
    public string DomainName { get; set; } = "";
    public QuestionType Type { get; set; }
    public QuestionStatus Status { get; set; }
    public string Text { get; set; } = "";
    public List<ImportAnswerDto> Answers { get; set; } = new();
    public string Explanation { get; set; } = "";
}

public class ImportAnswerDto
{
    public string Letter { get; set; } = "";
    public string Text { get; set; } = "";
    public bool IsCorrect { get; set; }
}
