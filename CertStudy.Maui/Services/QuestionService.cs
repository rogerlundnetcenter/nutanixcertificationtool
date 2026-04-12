using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class QuestionService
{
    private readonly AppDbContext _context;

    public QuestionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Certification>> GetCertificationsAsync()
    {
        return await _context.Certifications
            .AsNoTracking()
            .OrderBy(c => c.Code)
            .ToListAsync();
    }

    public async Task<Certification?> GetCertificationAsync(string id)
    {
        return await _context.Certifications
            .Include(c => c.Domains)
            .Include(c => c.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Question>> GetQuestionsAsync(string certId)
    {
        return await _context.Questions
            .Where(q => q.CertificationId == certId)
            .Include(q => q.Answers)
            .Include(q => q.Domain)
            .OrderBy(q => q.Number)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Question?> GetQuestionAsync(int id)
    {
        return await _context.Questions
            .Include(q => q.Answers)
            .Include(q => q.Domain)
            .Include(q => q.Certification)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<Question> SaveQuestionAsync(Question question)
    {
        question.UpdatedAt = DateTime.UtcNow;

        if (question.Id == 0)
        {
            _context.Questions.Add(question);
        }
        else
        {
            // Remove old answers and re-add
            var existing = await _context.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == question.Id);
            
            if (existing != null)
            {
                _context.Answers.RemoveRange(existing.Answers);
                _context.Entry(existing).CurrentValues.SetValues(question);
                existing.Answers = question.Answers;
            }
        }

        await _context.SaveChangesAsync();
        return question;
    }

    public async Task DeleteQuestionAsync(int id)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question != null)
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetNextQuestionNumberAsync(string certId)
    {
        var max = await _context.Questions
            .Where(q => q.CertificationId == certId)
            .MaxAsync(q => (int?)q.Number) ?? 0;
        return max + 1;
    }
}
