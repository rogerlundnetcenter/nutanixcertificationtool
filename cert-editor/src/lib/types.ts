export interface Certification {
  id: string;
  code: string;
  name: string;
  version: string;
  question_count: number;
}

export interface Answer {
  letter: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: number | null;
  cert_id: string;
  domain: string;
  number: number;
  q_type: 'single' | 'multi' | 'ordering';
  stem: string;
  explanation: string;
  difficulty: number;
  status: 'draft' | 'validated' | 'rejected';
  answers: Answer[];
  kb_refs: string[];
  validation_reasoning: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  status: 'valid' | 'invalid' | 'needs_review';
  confidence: number;
  reasoning: string;
  suggestions: string[];
}
