using CertStudy.Maui.Data.Entities;

namespace CertStudy.Maui.Services;

public class ConflictResolver
{
    private readonly Dictionary<int, ConflictResolution> _resolutions = new();

    public void SetResolution(int questionNumber, ConflictResolution resolution)
    {
        _resolutions[questionNumber] = resolution;
    }

    public ConflictResolution GetResolution(int questionNumber)
    {
        return _resolutions.TryGetValue(questionNumber, out var res)
            ? res
            : ConflictResolution.Skip;
    }

    public bool HasResolution(int questionNumber) => _resolutions.ContainsKey(questionNumber);

    public void Clear() => _resolutions.Clear();

    public ConflictSummary GetSummary(List<ImportConflict> conflicts)
    {
        return new ConflictSummary
        {
            TotalConflicts = conflicts.Count,
            ResolvedCount = conflicts.Count(c => HasResolution(c.QuestionNumber)),
            SkippedCount = _resolutions.Count(r => r.Value == ConflictResolution.Skip),
            OverwriteCount = _resolutions.Count(r => r.Value == ConflictResolution.Overwrite),
            MergeCount = _resolutions.Count(r => r.Value == ConflictResolution.Merge)
        };
    }
}

public enum ConflictResolution { Skip, Overwrite, Merge }

public class ImportConflict
{
    public int QuestionNumber { get; set; }
    public string ExistingText { get; set; } = "";
    public string ImportedText { get; set; } = "";
    public ConflictType Type { get; set; }
}

public enum ConflictType { DuplicateNumber, SimilarText, SameDomain }

public class ConflictSummary
{
    public int TotalConflicts { get; set; }
    public int ResolvedCount { get; set; }
    public int SkippedCount { get; set; }
    public int OverwriteCount { get; set; }
    public int MergeCount { get; set; }
    public bool AllResolved => TotalConflicts == ResolvedCount;
}
