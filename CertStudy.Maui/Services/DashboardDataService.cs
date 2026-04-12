using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class DashboardDataService
{
    private readonly AppDbContext _context;

    public DashboardDataService(AppDbContext context) => _context = context;

    public async Task<DashboardMetrics> GetMetricsAsync(string? certId = null)
    {
        var query = _context.Questions
            .Include(q => q.Certification)
            .Include(q => q.Domain)
            .Include(q => q.Answers)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(certId))
            query = query.Where(q => q.CertificationId == certId);

        var questions = await query.ToListAsync();
        return MetricsCalculator.Calculate(questions);
    }

    public async Task<List<DomainStat>> GetDomainStatsAsync(string certId)
    {
        return await _context.Domains
            .Where(d => d.CertificationId == certId)
            .Select(d => new DomainStat
            {
                Name = d.Name,
                QuestionCount = d.Questions.Count,
                CompletionPercent = d.Questions.Any()
                    ? (double)d.Questions.Count(q => q.Status == QuestionStatus.Approved) / d.Questions.Count * 100
                    : 0
            })
            .OrderByDescending(d => d.QuestionCount)
            .ToListAsync();
    }

    public async Task<List<ActivityPoint>> GetActivityAsync(int days = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);
        return await _context.Questions
            .Where(q => q.UpdatedAt >= cutoff)
            .GroupBy(q => q.UpdatedAt.Date)
            .Select(g => new ActivityPoint { Date = g.Key, Count = g.Count() })
            .OrderBy(a => a.Date)
            .ToListAsync();
    }
}

public class DomainStat
{
    public string Name { get; set; } = "";
    public int QuestionCount { get; set; }
    public double CompletionPercent { get; set; }
}

public class ActivityPoint
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}
