using CertStudy.Maui.Data.Entities;
using System.Net.Http.Json;
using System.Text.Json;

namespace CertStudy.Maui.Services;

public class OllamaValidationService
{
    private readonly HttpClient _httpClient;
    private const string OllamaUrl = "http://localhost:11434";

    public OllamaValidationService()
    {
        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{OllamaUrl}/api/tags");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<OllamaValidationResult?> ValidateAsync(Question question)
    {
        if (!await IsAvailableAsync())
            return null;

        var prompt = BuildPrompt(question);
        
        var request = new
        {
            model = "llama3.1",
            prompt = prompt,
            stream = false,
            options = new { temperature = 0.1 }
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{OllamaUrl}/api/generate", request);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>();
            return ParseResponse(result?.Response ?? "");
        }
        catch
        {
            return null;
        }
    }

    private string BuildPrompt(Question q)
    {
        var answers = string.Join("\n", q.Answers.Select(a => 
            $"{a.Letter}: {a.Text} {(a.IsCorrect ? "(CORRECT)" : "")}"));
        
        var correct = string.Join(", ", q.Answers.Where(a => a.IsCorrect).Select(a => a.Letter));

        return $"""Validate this Nutanix certification question for accuracy.

Question: {q.Stem}

Answers:
{answers}

Correct: {correct}

Explanation: {q.Explanation}

Respond with JSON:
{{"status":"valid|invalid|needs_review","confidence":0.0-1.0,"reasoning":"explanation","suggestions":["improvement1"]}}""";
    }

    private OllamaValidationResult? ParseResponse(string response)
    {
        try
        {
            var jsonStart = response.IndexOf('{');
            var jsonEnd = response.LastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var json = response[jsonStart..(jsonEnd + 1)];
                return JsonSerializer.Deserialize<OllamaValidationResult>(json);
            }
        }
        catch { }
        return null;
    }
}

public class OllamaGenerateResponse
{
    public string Response { get; set; } = "";
}
