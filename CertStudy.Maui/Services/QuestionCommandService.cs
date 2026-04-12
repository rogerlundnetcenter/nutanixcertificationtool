using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class QuestionCommandService
{
    private readonly AppDbContext _context;

    public QuestionCommandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Question> CreateAsync(string certId, int domainId)
    {
        var maxNum = await _context.Questions
            .Where(q => q.CertificationId == certId)
            .MaxAsync(q => (int?)q.Number) ?? 0;

        var question = new Question
        {
            CertificationId = certId,
            DomainId = domainId,
            Number = maxNum + 1,
            Type = QuestionType.Single,
            Stem = "",
            Explanation = "",
            Status = QuestionStatus.Draft,
            Answers = new()
            {
                new() { Letter = "A", Text = "" },
                new() { Letter = "B", Text = "" },
                new() { Letter = "C", Text = "" },
                new() { Letter = "D", Text = "" }
            }
        };

        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<Question> SaveAsync(Question question)
    {
        question.UpdatedAt = DateTime.UtcNow;

        if (question.Id == 0)
        {
            _context.Questions.Add(question);
        }
        else
        {
            var existing = await _context.Questions
                .Include(q => q.Answers)
                .FirstAsync(q => q.Id == question.Id);

            _context.Answers.RemoveRange(existing.Answers);
            _context.Entry(existing).CurrentValues.SetValues(question);
            existing.Answers = question.Answers;
        }

        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question == null) return false;

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();
        return true;
    }
}
