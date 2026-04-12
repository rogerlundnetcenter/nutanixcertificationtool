using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class SearchService
{
    private readonly AppDbContext _context;
    private readonly string _connectionString;

    public SearchService(AppDbContext context)
    {
        _context = context;
        _connectionString = context.Database.GetDbConnection().ConnectionString;
    }

    public async Task<List<Question>> SearchAsync(string query, string? certId = null)
    {
        var sql = @"
            SELECT q.* FROM Questions q
            WHERE (q.Stem LIKE @query OR q.Explanation LIKE @query)";
        
        if (!string.IsNullOrEmpty(certId))
        {
            sql += " AND q.CertificationId = @certId";
        }
        
        sql += " ORDER BY q.Number";

        var searchPattern = $"%{query}%";
        
        return await _context.Questions
            .FromSqlRaw(sql, 
                new SqliteParameter("@query", searchPattern),
                new SqliteParameter("@certId", certId ?? (object)DBNull.Value))
            .Include(q => q.Answers)
            .Include(q => q.Certification)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Question>> GetByStatusAsync(string certId, QuestionStatus status)
    {
        return await _context.Questions
            .Where(q => q.CertificationId == certId && q.Status == status)
            .Include(q => q.Answers)
            .OrderBy(q => q.Number)
            .AsNoTracking()
            .ToListAsync();
    }
}
