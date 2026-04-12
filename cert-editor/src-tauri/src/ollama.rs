use crate::models::{Question, ValidationResult};
use serde::{Deserialize, Serialize};

pub struct OllamaClient {
    base_url: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: Option<GenerationOptions>,
}

#[derive(Serialize)]
struct GenerationOptions {
    temperature: f32,
}

#[derive(Deserialize)]
struct GenerateResponse {
    response: String,
    done: bool,
}

impl OllamaClient {
    pub fn new(base_url: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            client: reqwest::Client::new(),
        }
    }

    pub async fn is_available(&self) -> anyhow::Result<bool> {
        match self.client.get(format!("{}/api/tags", self.base_url)).send().await {
            Ok(resp) => Ok(resp.status().is_success()),
            Err(_) => Ok(false),
        }
    }

    pub async fn validate(&self, question: &Question) -> anyhow::Result<ValidationResult> {
        // Build validation prompt
        let answers_text: Vec<String> = question
            .answers
            .iter()
            .map(|a| format!("{}: {} {}", a.letter, a.text, if a.is_correct { "(CORRECT)" } else { "" }))
            .collect();

        let correct_answers: Vec<&str> = question
            .answers
            .iter()
            .filter(|a| a.is_correct)
            .map(|a| a.letter.as_str())
            .collect();

        let prompt = format!(
            r#"You are a Nutanix certification expert validating practice exam questions.

QUESTION:
{}

ANSWER OPTIONS:
{}

CORRECT ANSWER(S): {}

EXPLANATION:
{}

TASK: Validate this question for accuracy and clarity.

Check:
1. Is the stem clear and unambiguous?
2. Is there exactly one unambiguously correct answer (or correct set for multi-select)?
3. Is the explanation accurate and complete?
4. Are there any factual errors about Nutanix technology?

Respond in JSON format:
{{
  "status": "valid" | "invalid" | "needs_review",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation",
  "suggestions": ["list", "of", "improvements"]
}}"#,
            question.stem,
            answers_text.join("\n"),
            correct_answers.join(", "),
            question.explanation
        );

        let request = GenerateRequest {
            model: "llama3.1".to_string(),
            prompt,
            stream: false,
            options: Some(GenerationOptions { temperature: 0.1 }),
        };

        let response = self
            .client
            .post(format!("{}/api/generate", self.base_url))
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Ollama request failed: {}", response.status()));
        }

        let result: GenerateResponse = response.json().await?;
        
        // Parse JSON from response
        let validation: ValidationResponse = self.parse_validation_response(&result.response)?;

        Ok(ValidationResult {
            status: validation.status,
            confidence: validation.confidence,
            reasoning: validation.reasoning,
            suggestions: validation.suggestions,
        })
    }

    fn parse_validation_response(&self, text: &str) -> anyhow::Result<ValidationResponse> {
        // Extract JSON from response (handles markdown code blocks)
        let json_str = if text.contains("```json") {
            text.split("```json").nth(1)
                .and_then(|s| s.split("```").next())
                .unwrap_or(text)
        } else if text.contains("```") {
            text.split("```").nth(1)
                .unwrap_or(text)
        } else {
            text
        }.trim();

        let validation: ValidationResponse = serde_json::from_str(json_str)?;
        Ok(validation)
    }
}

#[derive(Deserialize)]
struct ValidationResponse {
    status: String,
    confidence: f32,
    reasoning: String,
    suggestions: Vec<String>,
}
