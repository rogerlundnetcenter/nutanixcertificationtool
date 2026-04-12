namespace CertStudy.Maui.Services;

public class ImportCommand
{
    private readonly BatchImportService _batchService;
    private readonly ConflictResolver _resolver;

    public ImportCommand(BatchImportService batchService, ConflictResolver resolver)
    {
        _batchService = batchService;
        _resolver = resolver;
    }

    public async Task<ImportPreview> PreviewAsync(string[] files)
    {
        var preview = new ImportPreview();

        foreach (var file in files)
        {
            var ext = Path.GetExtension(file).ToLower();
            var content = await File.ReadAllTextAsync(file);

            if (ext == ".md")
            {
                var dto = MarkdownParser.Parse(content);
                if (dto != null) preview.Questions.Add(dto);
            }
            else if (ext == ".json")
            {
                var dtos = JsonParser.ParseBatch(content);
                preview.Questions.AddRange(dtos);
            }
        }

        preview.Validation = ImportValidator.ValidateBatch(preview.Questions);
        return preview;
    }

    public async Task<ImportResult> ExecuteAsync(
        ImportPreview preview,
        string certificationId,
        IProgress<ImportProgress>? progress = null)
    {
        return await _batchService.ImportAsync(preview.Questions, certificationId, progress);
    }
}

public class ImportPreview
{
    public List<ImportQuestionDto> Questions { get; set; } = new();
    public ImportValidationSummary Validation { get; set; } = new();
    public bool CanImport => Validation.IsValid && Questions.Any();
}
