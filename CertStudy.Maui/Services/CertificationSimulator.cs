using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class CertificationSimulator
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    private ExamAttempt? _attempt;
    private List<Question> _questions = new();
    private int _currentIndex = 0;
    private ExamTimer? _timer;

    public ExamAttempt? CurrentAttempt => _attempt;
    public Question? CurrentQuestion => _attempt?.IsCompleted == false && _currentIndex < _questions.Count
        ? _questions[_currentIndex]
        : null;
    public int CurrentIndex => _currentIndex;
    public int TotalQuestions => _questions.Count;
    public bool HasNext => _currentIndex < _questions.Count - 1;
    public bool HasPrevious => _currentIndex > 0;
    public bool IsLastQuestion => _currentIndex == _questions.Count - 1;
    public ExamTimer? Timer => _timer;

    public event Action? OnTimeUp;

    public CertificationSimulator(AppDbContext context)
    {
        _context = context;
    }

    public async Task StartAsync(SimulatorConfig config)
    {
        var cert = await _context.Certifications
            .FirstOrDefaultAsync(c => c.Id == config.CertificationId);

        var query = _context.Questions
            .Where(q => q.CertificationId == config.CertificationId && q.Status == QuestionStatus.Approved)
            .Include(q => q.Answers)
            .AsNoTracking();

        var allQuestions = await query.ToListAsync();
        _questions = allQuestions.OrderBy(_ => _random.Next()).Take(config.QuestionCount).ToList();

        _attempt = new ExamAttempt
        {
            CertificationId = config.CertificationId,
            CertificationName = cert?.Name ?? config.CertificationId,
            TotalQuestions = _questions.Count,
            TimeLimitMinutes = config.TimeLimitMinutes
        };

        _timer = new ExamTimer(config.TimeLimitMinutes);
        _timer.OnTimeUp += () => OnTimeUp?.Invoke();
        _timer.Start();

        _currentIndex = 0;
    }

    public void RecordAnswer(List<string> selectedLetters)
    {
        if (CurrentQuestion == null || _attempt == null) return;

        var q = CurrentQuestion;
        var correctLetters = q.Answers.Where(a => a.IsCorrect).Select(a => a.Letter).ToList();
        var isCorrect = selectedLetters.OrderBy(x => x).SequenceEqual(correctLetters.OrderBy(x => x));

        var existing = _attempt.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
        if (existing != null)
        {
            _attempt.Answers.Remove(existing);
            if (existing.IsCorrect) _attempt.CorrectCount--;
            if (existing.IsAnswered) _attempt.AnsweredCount--;
        }

        _attempt.Answers.Add(new ExamAnswer
        {
            QuestionId = q.Id,
            QuestionNumber = q.Number,
            QuestionText = q.Text.Length > 200 ? q.Text[..200] + "..." : q.Text,
            SelectedLetters = selectedLetters,
            CorrectLetters = correctLetters,
            Explanation = q.Explanation ?? "",
            IsCorrect = isCorrect
        });

        if (isCorrect) _attempt.CorrectCount++;
        _attempt.AnsweredCount++;
    }

    public bool Next()
    {
        if (!HasNext) return false;
        _currentIndex++;
        return true;
    }

    public bool Previous()
    {
        if (!HasPrevious) return false;
        _currentIndex--;
        return true;
    }

    public void GoToQuestion(int index)
    {
        if (index >= 0 && index < _questions.Count)
            _currentIndex = index;
    }

    public void Complete()
    {
        if (_attempt != null)
        {
            _attempt.IsCompleted = true;
            _attempt.CompletedAt = DateTime.UtcNow;
            _attempt.TimeSpentSeconds = _timer?.TotalSeconds - (_timer?.SecondsRemaining ?? 0) ?? 0;
        }
        _timer?.Stop();
    }

    public void Reset()
    {
        _timer?.Stop();
        _timer?.Dispose();
        _timer = null;
        _attempt = null;
        _questions.Clear();
        _currentIndex = 0;
    }
}

public class SimulatorConfig
{
    public string CertificationId { get; set; } = "";
    public SimulatorMode Mode { get; set; } = SimulatorMode.FullExam;
    public int QuestionCount { get; set; } = 75;
    public int TimeLimitMinutes { get; set; } = 120;
}
