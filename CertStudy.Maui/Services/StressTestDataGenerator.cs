using Bogus;
using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class StressTestDataGenerator
{
    private readonly AppDbContext _context;
    private readonly Faker _faker;

    public StressTestDataGenerator(AppDbContext context)
    {
        _context = context;
        _faker = new Faker();
    }

    public async Task<int> GenerateAsync(string certId, int count)
    {
        var cert = await _context.Certifications
            .Include(c => c.Domains)
            .FirstOrDefaultAsync(c => c.Id == certId);

        if (cert == null) throw new ArgumentException($"Certification {certId} not found");

        var domainIds = cert.Domains.Select(d => d.Id).ToList();
        var maxNum = await _context.Questions
            .Where(q => q.CertificationId == certId)
            .MaxAsync(q => (int?)q.Number) ?? 0;

        var questions = Enumerable.Range(1, count)
            .Select(i => CreateQuestion(certId, domainIds, maxNum + i))
            .ToList();

        _context.Questions.AddRange(questions);
        await _context.SaveChangesAsync();
        return count;
    }

    private Question CreateQuestion(string certId, List<int> domainIds, int number)
    {
        var type = _faker.PickRandom<QuestionType>();
        var answerCount = type == QuestionType.Ordering ? 4 : _faker.Random.Int(2, 6);

        return new Question
        {
            CertificationId = certId,
            DomainId = _faker.PickRandom(domainIds),
            Number = number,
            Type = type,
            Stem = _faker.Lorem.Sentence(8, 15),
            Explanation = _faker.Lorem.Paragraph(2),
            Status = _faker.PickRandom<QuestionStatus>(),
            Answers = GenerateAnswers(answerCount, type)
        };
    }

    private List<Answer> GenerateAnswers(int count, QuestionType type)
    {
        var letters = new[] { "A", "B", "C", "D", "E", "F" };
        var answers = new List<Answer>();
        var correctCount = type == QuestionType.Single ? 1 : _faker.Random.Int(1, Math.Min(3, count - 1));
        var correctIndices = _faker.PickRandom(Enumerable.Range(0, count), correctCount).ToList();

        for (int i = 0; i < count; i++)
        {
            answers.Add(new Answer
            {
                Letter = letters[i],
                Text = _faker.Lorem.Sentence(4, 8),
                IsCorrect = correctIndices.Contains(i)
            });
        }
        return answers;
    }

    public async Task ClearAsync(string certId)
    {
        var toRemove = await _context.Questions
            .Where(q => q.CertificationId == certId)
            .ToListAsync();

        _context.Questions.RemoveRange(toRemove);
        await _context.SaveChangesAsync();
    }
}
