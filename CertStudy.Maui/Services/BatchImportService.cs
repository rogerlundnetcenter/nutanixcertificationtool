using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class BatchImportService
{
    private readonly AppDbContext _context;
    private readonly ConflictResolver _resolver;

    public BatchImportService(AppDbContext context, ConflictResolver resolver)
    {
        _context = context;
        _resolver = resolver;
    }

    public async Task<ImportResult> ImportAsync(
        List<ImportQuestionDto> dtos,
        string certificationId,
        IProgress<ImportProgress>? progress = null)
    {
        var result = new ImportResult();
        var total = dtos.Count;

        for (int i = 0; i < dtos.Count; i++)
        {
            var dto = dtos[i];
            progress?.Report(new ImportProgress(i + 1, total, $"Processing Q{dto.Number}"));

            var conflict = await FindConflictAsync(dto, certificationId);
            if (conflict != null)
            {
                var resolution = _resolver.GetResolution(dto.Number);
                if (resolution == ConflictResolution.Skip)
                {
                    result.Skipped++;
                    continue;
                }
            }

            await ImportSingleAsync(dto, certificationId);
            result.Imported++;
        }

        await _context.SaveChangesAsync();
        return result;
    }

    private async Task<ImportConflict?> FindConflictAsync(ImportQuestionDto dto, string certId)
    {
        var existing = await _context.Questions
            .FirstOrDefaultAsync(q => q.CertificationId == certId && q.Number == dto.Number);

        if (existing == null) return null;

        return new ImportConflict
        {
            QuestionNumber = dto.Number,
            ExistingText = existing.Text[..Math.Min(50, existing.Text.Length)],
            ImportedText = dto.Text[..Math.Min(50, dto.Text.Length)],
            Type = ConflictType.DuplicateNumber
        };
    }

    private async Task ImportSingleAsync(ImportQuestionDto dto, string certId)
    {
        var domain = await _context.Domains
            .FirstOrDefaultAsync(d => d.Name == dto.DomainName && d.CertificationId == certId)
            ?? new Domain { Id = Guid.NewGuid().ToString(), Name = dto.DomainName, CertificationId = certId };

        var question = new Question
        {
            Id = Guid.NewGuid().ToString(),
            CertificationId = certId,
            DomainId = domain.Id,
            Number = dto.Number,
            Text = dto.Text,
            Type = dto.Type,
            Status = dto.Status,
            Explanation = dto.Explanation,
            Answers = dto.Answers.Select(a => new Answer
            {
                Id = Guid.NewGuid().ToString(),
                Letter = a.Letter,
                Text = a.Text,
                IsCorrect = a.IsCorrect
            }).ToList()
        };

        _context.Questions.Add(question);
    }
}

public class ImportResult
{
    public int Imported { get; set; }
    public int Skipped { get; set; }
    public int Failed { get; set; }
}

public class ImportProgress
{
    public int Current { get; set; }
    public int Total { get; set; }
    public string Message { get; set; } = "";

    public ImportProgress(int current, int total, string message)
    {
        Current = current;
        Total = total;
        Message = message;
    }

    public double Percent => Total > 0 ? (double)Current / Total * 100 : 0;
}
