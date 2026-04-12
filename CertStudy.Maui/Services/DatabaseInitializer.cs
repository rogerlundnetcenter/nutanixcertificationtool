using CertStudy.Maui.Data;
using CertStudy.Maui.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertStudy.Maui.Services;

public class DatabaseInitializer
{
    private readonly AppDbContext _context;

    public DatabaseInitializer(AppDbContext context)
    {
        _context = context;
    }

    public async Task InitializeAsync()
    {
        await _context.Database.MigrateAsync();
        await SeedCertificationsAsync();
    }

    private async Task SeedCertificationsAsync()
    {
        if (await _context.Certifications.AnyAsync())
            return;

        var certs = new List<Certification>
        {
            new()
            {
                Id = "ncp-us-610",
                Code = "NCP-US-6.10",
                Name = "Nutanix Certified Professional - Unified Storage",
                Version = "6.10"
            },
            new()
            {
                Id = "ncp-ci-610",
                Code = "NCP-CI-6.10",
                Name = "Nutanix Certified Professional - Cloud Integration",
                Version = "6.10"
            },
            new()
            {
                Id = "ncp-ai-610",
                Code = "NCP-AI-6.10",
                Name = "Nutanix Certified Professional - AI Infrastructure",
                Version = "6.10"
            },
            new()
            {
                Id = "ncm-mci-610",
                Code = "NCM-MCI-6.10",
                Name = "Nutanix Certified Master - Multicloud Infrastructure",
                Version = "6.10"
            }
        };

        foreach (var cert in certs)
        {
            _context.Certifications.Add(cert);
            
            // Seed default domains
            var domains = new List<Domain>
            {
                new() { Name = "Domain 1", Number = 1, CertificationId = cert.Id },
                new() { Name = "Domain 2", Number = 2, CertificationId = cert.Id },
                new() { Name = "Domain 3", Number = 3, CertificationId = cert.Id },
                new() { Name = "Domain 4", Number = 4, CertificationId = cert.Id }
            };
            
            foreach (var domain in domains)
            {
                _context.Domains.Add(domain);
            }
        }

        await _context.SaveChangesAsync();
    }
}
