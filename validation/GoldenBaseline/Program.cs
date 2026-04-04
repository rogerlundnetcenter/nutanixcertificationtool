using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

// ── Entry point (top-level statements) ──────────────────────────────

var studyGuideDir = @"C:\copilot\next2026";
var outputPath = @"C:\copilot\next2026\CertStudy-Electron\tests\golden_baseline.json";

Console.WriteLine("Parsing study guide files...");

var allExams = QuestionParser.LoadAllExams(studyGuideDir);

var root = new BaselineRoot
{
    GeneratedAt = DateTime.UtcNow.ToString("o"),
    Generator = "CertStudy C# QuestionParser",
};

int totalQuestions = 0;

foreach (var (examCode, questions) in allExams.OrderBy(kv => kv.Key))
{
    Console.WriteLine($"  {examCode}: {questions.Count} questions");

    var exam = new BaselineExam
    {
        ExamCode = examCode,
        QuestionCount = questions.Count,
    };

    foreach (var q in questions)
    {
        exam.Questions.Add(new BaselineQuestion
        {
            QuestionText = q.Stem,
            Options = q.Options.Select(o => new BaselineOption
            {
                Letter = o.Letter,
                Text = o.Text,
                IsCorrect = q.CorrectAnswers.Contains(o.Letter)
            }).ToList(),
            CorrectAnswers = q.CorrectAnswers,
            Explanation = q.Explanation,
            ExamCode = q.ExamCode,
            SourceFile = q.SourceFile,
            Domain = q.Domain,
            QuestionNumber = q.Id
        });
    }

    root.Exams[examCode] = exam;
    totalQuestions += questions.Count;
}

root.TotalQuestions = totalQuestions;
root.ExamCodes = root.Exams.Keys.OrderBy(k => k).ToList();

var jsonOptions = new JsonSerializerOptions
{
    WriteIndented = true,
    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
};

var json = JsonSerializer.Serialize(root, jsonOptions);
File.WriteAllText(outputPath, json);

Console.WriteLine($"\nTotal: {totalQuestions} questions across {root.ExamCodes.Count} exams");
Console.WriteLine($"Written to: {outputPath}");

// ── Internal Models ─────────────────────────────────────────────────

class AnswerOption
{
    public string Letter { get; set; } = "";
    public string Text { get; set; } = "";
}

class Question
{
    public int Id { get; set; }
    public string ExamCode { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Stem { get; set; } = "";
    public List<AnswerOption> Options { get; set; } = new();
    public List<string> CorrectAnswers { get; set; } = new();
    public string Explanation { get; set; } = "";
    public bool IsMultiSelect => CorrectAnswers.Count > 1;
    public string SourceFile { get; set; } = "";
}

// ── QuestionParser (faithfully copied from CertStudy) ───────────────

static class QuestionParser
{
    private static readonly Regex QuestionHeaderRx =
        new(@"^###\s+Q(\d+)", RegexOptions.Compiled);

    private static readonly Regex DomainHeaderRx =
        new(@"^##\s+(?:DOMAIN|Domain)\s*(\d+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static readonly Regex OptionRx =
        new(@"^-\s+([A-F])\)\s+(.*)", RegexOptions.Compiled);

    private static readonly Regex AnswerRx =
        new(@"^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*", RegexOptions.Compiled);

    public static string DeriveExamCode(string fileName)
    {
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

            var dm = DomainHeaderRx.Match(line);
            if (dm.Success)
            {
                currentDomain = $"Domain {dm.Groups[1].Value}";
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
                    int dash = line.IndexOf('\u2014');
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

                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var om = OptionRx.Match(line);
                    if (om.Success)
                    {
                        var optText = om.Groups[2].Value.Trim();
                        i++;
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

                while (i < lines.Length && string.IsNullOrWhiteSpace(lines[i]))
                    i++;

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

// ── JSON output models ──────────────────────────────────────────────

class BaselineOption
{
    [JsonPropertyName("letter")]
    public string Letter { get; set; } = "";

    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("isCorrect")]
    public bool IsCorrect { get; set; }
}

class BaselineQuestion
{
    [JsonPropertyName("questionText")]
    public string QuestionText { get; set; } = "";

    [JsonPropertyName("options")]
    public List<BaselineOption> Options { get; set; } = new();

    [JsonPropertyName("correctAnswers")]
    public List<string> CorrectAnswers { get; set; } = new();

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = "";

    [JsonPropertyName("examCode")]
    public string ExamCode { get; set; } = "";

    [JsonPropertyName("sourceFile")]
    public string SourceFile { get; set; } = "";

    [JsonPropertyName("domain")]
    public string Domain { get; set; } = "";

    [JsonPropertyName("questionNumber")]
    public int QuestionNumber { get; set; }
}

class BaselineExam
{
    [JsonPropertyName("examCode")]
    public string ExamCode { get; set; } = "";

    [JsonPropertyName("questionCount")]
    public int QuestionCount { get; set; }

    [JsonPropertyName("questions")]
    public List<BaselineQuestion> Questions { get; set; } = new();
}

class BaselineRoot
{
    [JsonPropertyName("generatedAt")]
    public string GeneratedAt { get; set; } = "";

    [JsonPropertyName("generator")]
    public string Generator { get; set; } = "";

    [JsonPropertyName("exams")]
    public Dictionary<string, BaselineExam> Exams { get; set; } = new();

    [JsonPropertyName("totalQuestions")]
    public int TotalQuestions { get; set; }

    [JsonPropertyName("examCodes")]
    public List<string> ExamCodes { get; set; } = new();
}
