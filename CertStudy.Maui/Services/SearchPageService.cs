using System.Timers;

namespace CertStudy.Maui.Services;

public class SearchPageService : IDisposable
{
    private readonly QuestionService _questionService;
    private readonly Fts5IndexService _searchService;
    private readonly Timer _debounce;

    public string SearchTerm { get; set; } = "";
    public List<SearchResult> Results { get; private set; } = new();
    public List<Certification> Certifications { get; private set; } = new();
    public List<Domain> Domains { get; private set; } = new();
    public SearchFilterState Filters { get; private set; } = new();

    public bool IsSearching { get; private set; }
    public int TotalResults { get; private set; }
    public int CurrentPage { get; private set; } = 1;
    public int PageSize { get; } = 50;
    public long SearchTimeMs { get; private set; }

    public event Action? OnChange;

    public SearchPageService(QuestionService qs, Fts5IndexService ss)
    {
        _questionService = qs;
        _searchService = ss;
        _debounce = new Timer(300);
        _debounce.Elapsed += async (_, _) => await ExecuteSearch();
        _debounce.AutoReset = false;
    }

    public async Task InitializeAsync()
    {
        Certifications = await _questionService.GetCertificationsAsync();
        OnChange?.Invoke();
    }

    public void OnInput() { _debounce.Stop(); _debounce.Start(); }

    public async Task OnFiltersChanged(SearchFilterState f)
    {
        Filters = f; CurrentPage = 1;
        Domains = Certifications.FirstOrDefault(c => c.Id == f.CertificationId)?.Domains.ToList() ?? new();
        await ExecuteSearch();
    }

    public async Task OnPageChanged(int p) { CurrentPage = p; await ExecuteSearch(); }

    private async Task ExecuteSearch()
    {
        if (string.IsNullOrWhiteSpace(SearchTerm) && !HasFilters) { Results.Clear(); OnChange?.Invoke(); return; }
        IsSearching = true; OnChange?.Invoke();
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var q = new SearchQuery { Term = SearchTerm, CertificationId = Filters.CertificationId, DomainId = Filters.DomainId, Type = Filters.Type, Status = Filters.Status, Limit = PageSize, Offset = (CurrentPage - 1) * PageSize };
        Results = await _searchService.SearchAsync(q);
        TotalResults = await _searchService.GetTotalCountAsync(q);
        sw.Stop(); SearchTimeMs = sw.ElapsedMilliseconds; IsSearching = false; OnChange?.Invoke();
    }

    private bool HasFilters => !string.IsNullOrEmpty(Filters.CertificationId) || Filters.DomainId.HasValue || Filters.Type.HasValue || Filters.Status.HasValue;
    public void Dispose() => _debounce?.Dispose();
}

public class SearchFilterState
{
    public string? CertificationId { get; set; }
    public int? DomainId { get; set; }
    public QuestionType? Type { get; set; }
    public QuestionStatus? Status { get; set; }
}
