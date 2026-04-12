namespace CertStudy.Maui.Services;

public class AutoSaveTimer : IDisposable
{
    private readonly System.Timers.Timer _timer;
    private Func<Task>? _saveAction;
    private bool _hasPendingChanges;

    public AutoSaveTimer(double intervalMs = 2000)
    {
        _timer = new System.Timers.Timer(intervalMs);
        _timer.Elapsed += async (_, _) => await OnElapsed();
        _timer.AutoReset = false;
    }

    public void OnChange(Action saveCallback)
    {
        _saveAction = () =>
        {
            saveCallback();
            return Task.CompletedTask;
        };
        _hasPendingChanges = true;
        _timer.Stop();
        _timer.Start();
    }

    public void OnChangeAsync(Func<Task> saveAsyncCallback)
    {
        _saveAction = saveAsyncCallback;
        _hasPendingChanges = true;
        _timer.Stop();
        _timer.Start();
    }

    private async Task OnElapsed()
    {
        if (_hasPendingChanges && _saveAction != null)
        {
            _hasPendingChanges = false;
            await _saveAction();
        }
    }

    public void ForceSave()
    {
        _timer.Stop();
        _hasPendingChanges = false;
        _saveAction?.Invoke();
    }

    public void Dispose() => _timer?.Dispose();
}
