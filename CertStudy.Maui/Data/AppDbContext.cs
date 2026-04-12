using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Data;

public class AppDbContext : DbContext
{
    public DbSet<Certification> Certifications { get; set; } = null!;
    public DbSet<Domain> Domains { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<Answer> Answers { get; set; } = null!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Certification
        modelBuilder.Entity<Certification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        // Domain
        modelBuilder.Entity<Domain>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(d => d.Certification)
                  .WithMany(c => c.Domains)
                  .HasForeignKey(d => d.CertificationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Question
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CertificationId, e.Number }).IsUnique();
            entity.HasIndex(e => e.Stem);  // For search
            
            entity.HasOne(q => q.Certification)
                  .WithMany(c => c.Questions)
                  .HasForeignKey(q => q.CertificationId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(q => q.Domain)
                  .WithMany(d => d.Questions)
                  .HasForeignKey(q => q.DomainId);
        });

        // Answer
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Letter).HasMaxLength(10);
            
            entity.HasOne(a => a.Question)
                  .WithMany(q => q.Answers)
                  .HasForeignKey(a => a.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
