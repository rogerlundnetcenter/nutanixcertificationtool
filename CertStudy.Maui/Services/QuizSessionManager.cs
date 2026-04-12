using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public class QuizSessionManager
{
    private QuizSession? _currentSession;
    private int _currentIndex = 0;
    private List<Question> _questions = new();
    private DateTime _questionStartTime;

    public QuizSession? CurrentSession => _currentSession;
    public Question? CurrentQuestion => _currentSession?.IsCompleted == false && _currentIndex < _questions.Count
        ? _questions[_currentIndex]
        : null;
    public int CurrentIndex => _currentIndex;
    public int TotalQuestions => _questions.Count;
    public bool HasNext => _currentIndex < _questions.Count - 1;
    public bool HasPrevious => _currentIndex > 0;
    public bool IsLastQuestion => _currentIndex == _questions.Count - 1;

    public void StartSession(QuizConfig config, List<Question> questions)
    {
        _currentSession = new QuizSession
        {
            CertificationId = config.CertificationId,
            TotalQuestions = questions.Count
        };
        _questions = questions;
        _currentIndex = 0;
        _questionStartTime = DateTime.UtcNow;
    }

    public void RecordAnswer(List<string> selectedLetters)
    {
        if (CurrentQuestion == null || _currentSession == null) return;

        var q = CurrentQuestion;
        var correctLetters = q.Answers.Where(a => a.IsCorrect).Select(a => a.Letter).ToList();
        var isCorrect = selectedLetters.OrderBy(x => x).SequenceEqual(correctLetters.OrderBy(x => x));

        _currentSession.Answers.Add(new QuizAnswer
        {
            QuestionId = q.Id,
            QuestionNumber = q.Number,
            QuestionText = q.Text.Length > 100 ? q.Text[..100] + "..." : q.Text,
            SelectedLetters = selectedLetters,
            CorrectLetters = correctLetters,
            IsCorrect = isCorrect,
            AnsweredAt = DateTime.UtcNow,
            TimeSpentSeconds = (int)(DateTime.UtcNow - _questionStartTime).TotalSeconds
        });
    }

    public bool Next()
    {
        if (!HasNext) return false;
        _currentIndex++;
        _questionStartTime = DateTime.UtcNow;
        return true;
    }

    public bool Previous()
    {
        if (!HasPrevious) return false;
        _currentIndex--;
        _questionStartTime = DateTime.UtcNow;
        return true;
    }

    public void Complete()
    {
        if (_currentSession != null)
            _currentSession.CompletedAt = DateTime.UtcNow;
    }

    public void Reset()
    {
        _currentSession = null;
        _currentIndex = 0;
        _questions.Clear();
    }
}
