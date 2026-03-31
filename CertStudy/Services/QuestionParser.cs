using System.Text.RegularExpressions;
using CertStudy.Models;

namespace CertStudy.Services;

static partial class QuestionParser
{
    private static readonly Regex QuestionHeaderRx = QuestionHeaderRegex();
    private static readonly Regex DomainHeaderRx   = DomainHeaderRegex();
    private static readonly Regex OptionRx         = OptionRegex();
    private static readonly Regex AnswerRx         = AnswerRegex();

    [GeneratedRegex(@"^###\s+Q(\d+)", RegexOptions.Compiled)]
    private static partial Regex QuestionHeaderRegex();

    [GeneratedRegex(@"^##\s+(?:DOMAIN|Domain)\s*(\d+)", RegexOptions.Compiled | RegexOptions.IgnoreCase)]
    private static partial Regex DomainHeaderRegex();

    [GeneratedRegex(@"^-\s+([A-F])\)\s+(.*)", RegexOptions.Compiled)]
    private static partial Regex OptionRegex();

    [GeneratedRegex(@"^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*", RegexOptions.Compiled)]
    private static partial Regex AnswerRegex();

    public static string DeriveExamCode(string fileName)
    {
        // NCP-US-Part1.md -> NCP-US, NCM-MCI-Part2.md -> NCM-MCI
        var name = Path.GetFileNameWithoutExtension(fileName);
        var parts = name.Split('-');
        if (parts.Length >= 2)
            return $"{parts[0]}-{parts[1]}";
        return name;
    }

    public static List<Question> ParseFile(string filePath)
    {
        var lines = File.ReadAllLines(filePath);
        var examCode = DeriveExamCode(Path.GetFileName(filePath));
        var questions = new List<Question>();
        var currentDomain = "";

        int i = 0;
        while (i < lines.Length)
        {
            var line = lines[i].TrimEnd();

            // Domain header
            var dm = DomainHeaderRx.Match(line);
            if (dm.Success)
            {
                currentDomain = $"Domain {dm.Groups[1].Value}";
                // grab description after the colon if present
                int colon = line.IndexOf(':');
                if (colon >= 0)
                {
                    int paren = line.IndexOf('(', colon);
                    var desc = paren > colon
                        ? line[(colon + 1)..paren].Trim()
                        : line[(colon + 1)..].Trim();
                    if (!string.IsNullOrEmpty(desc))
                        currentDomain += $": {desc}";
                }
                else
                {
                    // try dash separator: ## Domain 1 — Deploy NAI Environment
                    int dash = line.IndexOf('—');
                    if (dash < 0) dash = line.IndexOf('-', line.IndexOf(dm.Groups[1].Value));
                    if (dash > 0)
                    {
                        int paren = line.IndexOf('(', dash);
                        var desc = paren > dash
                            ? line[(dash + 1)..paren].Trim()
                            : line[(dash + 1)..].Trim();
                        if (!string.IsNullOrEmpty(desc))
                            currentDomain += $": {desc}";
                    }
                }
                i++;
                continue;
            }

            // Question header
            var qm = QuestionHeaderRx.Match(line);
            if (qm.Success)
            {
                var q = new Question
                {
                    Id = int.Parse(qm.Groups[1].Value),
                    ExamCode = examCode,
                    Domain = string.IsNullOrEmpty(currentDomain) ? examCode : currentDomain,
                    SourceFile = Path.GetFileName(filePath)
                };

                i++;

                // Collect stem lines
                var stemLines = new List<string>();
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    if (OptionRx.IsMatch(line)) break;
                    if (QuestionHeaderRx.IsMatch(line)) break;
                    if (AnswerRx.IsMatch(line)) break;
                    stemLines.Add(line);
                    i++;
                }
                q.Stem = string.Join("\n", stemLines).Trim();

                // Collect options
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var om = OptionRx.Match(line);
                    if (om.Success)
                    {
                        var optText = om.Groups[2].Value.Trim();
                        i++;
                        // multi-line option: continuation lines that don't start a new option/answer/question
                        while (i < lines.Length)
                        {
                            var next = lines[i].TrimEnd();
                            if (string.IsNullOrWhiteSpace(next)) break;
                            if (OptionRx.IsMatch(next)) break;
                            if (AnswerRx.IsMatch(next)) break;
                            if (QuestionHeaderRx.IsMatch(next)) break;
                            if (next.StartsWith("---")) break;
                            optText += " " + next.Trim();
                            i++;
                        }
                        q.Options.Add(new AnswerOption
                        {
                            Letter = om.Groups[1].Value,
                            Text = optText
                        });
                        continue;
                    }
                    break;
                }

                // Skip blank lines before answer
                while (i < lines.Length && string.IsNullOrWhiteSpace(lines[i]))
                    i++;

                // Answer line
                if (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var am = AnswerRx.Match(line);
                    if (am.Success)
                    {
                        var raw = am.Groups[1].Value
                            .Replace(",", "")
                            .Replace(" ", "");
                        q.CorrectAnswers = raw.Select(c => c.ToString()).ToList();
                        i++;
                    }
                }

                // Collect explanation
                var explLines = new List<string>();
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    if (line.StartsWith("---")) { i++; break; }
                    if (QuestionHeaderRx.IsMatch(line)) break;
                    if (DomainHeaderRx.IsMatch(line)) break;
                    explLines.Add(line);
                    i++;
                }
                q.Explanation = string.Join("\n", explLines).Trim();

                if (q.Options.Count > 0 && q.CorrectAnswers.Count > 0)
                    questions.Add(q);

                continue;
            }

            i++;
        }

        return questions;
    }

    public static Dictionary<string, List<Question>> LoadAllExams(string directory)
    {
        var exams = new Dictionary<string, List<Question>>();
        var patterns = new[] { "NCP-US*.md", "NCP-CI*.md", "NCP-AI*.md", "NCM-MCI*.md" };

        foreach (var pattern in patterns)
        {
            foreach (var file in Directory.GetFiles(directory, pattern))
            {
                var questions = ParseFile(file);
                var code = DeriveExamCode(Path.GetFileName(file));
                if (!exams.ContainsKey(code))
                    exams[code] = new List<Question>();
                exams[code].AddRange(questions);
            }
        }

        return exams;
    }
}
