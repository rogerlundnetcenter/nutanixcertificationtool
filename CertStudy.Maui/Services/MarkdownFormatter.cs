using CertStudy.Maui.Data.Entities;
using System.Text;

namespace CertStudy.Maui.Services;

public static class MarkdownFormatter
{
    public static string FormatQuestion(Question q)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine($"# Q{q.Number} - {q.Domain.Name}");
        sb.AppendLine();
        sb.AppendLine($"**Type:** {q.Type}");
        sb.AppendLine($"**Status:** {q.Status}");
        sb.AppendLine();
        sb.AppendLine("## Question");
        sb.AppendLine(q.Stem);
        sb.AppendLine();
        sb.AppendLine("## Answers");
        
        foreach (var ans in q.Answers.OrderBy(a => a.Letter))
        {
            var marker = ans.IsCorrect ? "[x]" : "[ ]";
            sb.AppendLine($"- {marker} **{ans.Letter}.** {ans.Text}");
        }
        
        sb.AppendLine();
        sb.AppendLine("## Explanation");
        sb.AppendLine(q.Explanation);
        sb.AppendLine();
        sb.AppendLine("---");
        
        return sb.ToString();
    }

    public static string FormatBatch(IEnumerable<Question> questions)
    {
        return string.Join("\n\n", questions.Select(FormatQuestion));
    }

    public static string GetFileName(Question q, ExportSettings s) =>
        s.NamingPattern.Replace("{number}", q.Number.ToString("D3"))
                     .Replace("{cert}", q.Certification.Code)
                     .Replace("{domain}", q.Domain.Name.Replace(" ", "_"));
}
