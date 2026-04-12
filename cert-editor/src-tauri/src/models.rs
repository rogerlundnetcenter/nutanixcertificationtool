use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Certification {
    pub id: String,
    pub code: String,
    pub name: String,
    pub version: String,
    pub question_count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: i64,
    pub cert_id: String,
    pub domain: String,
    pub number: i32,
    pub q_type: String,  // single, multi, ordering
    pub stem: String,
    pub explanation: String,
    pub difficulty: i32,
    pub status: String,  // draft, validated, rejected
    pub answers: Vec<Answer>,
    pub kb_refs: Vec<String>,
    pub validation_reasoning: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Answer {
    pub letter: String,
    pub text: String,
    pub is_correct: bool,
}

#[derive(Debug, Deserialize, Clone)]
pub struct QuestionInput {
    pub id: Option<i64>,
    pub cert_id: String,
    pub domain: String,
    pub number: i32,
    pub q_type: String,
    pub stem: String,
    pub explanation: String,
    pub difficulty: i32,
    pub answers: Vec<AnswerInput>,
    pub kb_refs: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AnswerInput {
    pub letter: String,
    pub text: String,
    pub is_correct: bool,
}

#[derive(Debug, Serialize, Clone)]
pub struct ValidationResult {
    pub status: String,  // valid, invalid, needs_review
    pub confidence: f32,
    pub reasoning: String,
    pub suggestions: Vec<String>,
}
