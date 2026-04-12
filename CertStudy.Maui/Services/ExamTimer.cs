namespace CertStudy.Maui.Services;

public class ExamTimer : IDisposable
{
    private System.Threading.Timer? _timer;
    private int _secondsRemaining;
    private readonly int _totalSeconds;

    public int SecondsRemaining => _secondsRemaining;
    public int TotalSeconds => _totalSeconds;
    public bool IsRunning => _timer != null;
    public bool IsWarning => _secondsRemaining <= 300; // 5 minutes
    public event Action<int>? OnTick;
    public event Action? OnTimeUp;

    public ExamTimer(int minutes)
    {
        _totalSeconds = minutes * 60;
        _secondsRemaining = _totalSeconds;
    }

    public void Start()
    {
        _timer?.Dispose();
        _timer = new System.Threading.Timer(_ =>
        {
            _secondsRemaining--;
            OnTick?.Invoke(_secondsRemaining);
            if (_secondsRemaining <= 0)
            {
                _timer?.Dispose();
                _timer = null;
                OnTimeUp?.Invoke();
            }
        }, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
    }

    public void Stop()
    {
        _timer?.Dispose();
        _timer = null;
    }

    public string FormatTime()
    {
        var min = _secondsRemaining / 60;
        var sec = _secondsRemaining % 60;
        return $"{min:D2}:{sec:D2}";
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
