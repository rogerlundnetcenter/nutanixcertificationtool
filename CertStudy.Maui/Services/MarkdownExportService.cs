using CertStudy.Maui.Data.Entities;
using System.Text;

namespace CertStudy.Maui.Services;

public class MarkdownExportService
{
    public async Task<string> ExportCertificationAsync(List<Question> questions, string certCode)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine($"# {certCode}");
        sb.AppendLine();
        sb.AppendLine($"Auto-generated: {DateTime.Now:yyyy-MM-dd HH:mm}");
        sb.AppendLine();

        foreach (var q in questions.OrderBy(q => q.Number))
        {
            sb.AppendLine(ExportQuestion(q));
            sb.AppendLine();
        }

        return sb.ToString();
    }

    public string ExportQuestion(Question q)
    {
        var sb = new StringBuilder();
        
        var typeMarker = q.Type == QuestionType.Multi ? " (Select TWO)" : "";
        sb.AppendLine($"### Q{q.Number}{typeMarker}");
        sb.AppendLine();
        sb.AppendLine(q.Stem);
        sb.AppendLine();

        foreach (var ans in q.Answers.OrderBy(a => a.Letter))
        {
            sb.AppendLine($"- {ans.Letter}. {ans.Text}");
        }
        sb.AppendLine();

        var correct = string.Join(", ", q.Answers.Where(a => a.IsCorrect).Select(a => a.Letter));
        sb.AppendLine($"**Answer: {correct}**");
        sb.AppendLine();
        sb.AppendLine(q.Explanation);

        if (!string.IsNullOrEmpty(q.KbReferences))
        {
            sb.AppendLine();
            sb.AppendLine($"**References:** {q.KbReferences}");
        }

        sb.AppendLine("---");

        return sb.ToString();
    }

    public async Task ExportToFileAsync(List<Question> questions, string certCode, string filePath)
    {
        var markdown = await ExportCertificationAsync(questions, certCode);
        await File.WriteAllTextAsync(filePath, markdown);
    }
}
