using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class QuizQuestionSelector
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    public QuizQuestionSelector(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Question>> SelectAsync(QuizConfig config)
    {
        var query = _context.Questions
            .Where(q => q.CertificationId == config.CertificationId && q.Status == QuestionStatus.Approved)
            .Include(q => q.Answers)
            .AsQueryable();

        if (config.DomainFilter?.Any() == true)
            query = query.Where(q => config.DomainFilter.Contains(q.DomainId));

        if (config.TypeFilter?.Any() == true)
            query = query.Where(q => config.TypeFilter.Contains(q.Type));

        var questions = await query.ToListAsync();

        return config.Mode switch
        {
            QuizMode.Random => questions.OrderBy(_ => _random.Next()).Take(config.QuestionCount).ToList(),
            QuizMode.Sequential => questions.OrderBy(q => q.Number).Take(config.QuestionCount).ToList(),
            _ => questions.OrderBy(_ => _random.Next()).Take(config.QuestionCount).ToList()
        };
    }
}

public class QuizConfig
{
    public string CertificationId { get; set; } = "";
    public int QuestionCount { get; set; } = 20;
    public QuizMode Mode { get; set; } = QuizMode.Random;
    public List<string>? DomainFilter { get; set; }
    public List<QuestionType>? TypeFilter { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public bool ShowExplanationImmediately { get; set; } = false;
    public bool AllowReview { get; set; } = true;
}
