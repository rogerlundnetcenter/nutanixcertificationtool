// dataValidator.js — Validates parsed question data for CertStudy Electron app
// CommonJS module — no Electron dependencies.

'use strict';

// Known exam codes (mirrors ExamCodes in shared/models.js)
const VALID_EXAM_CODES = Object.freeze([
  'NCM-MCI',
  'NCP-CI',
  'NCP-US',
  'NCP-AI',
]);

const VALID_OPTION_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'F']);
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const MIN_STEM_LENGTH = 10;
const MAX_STEM_LENGTH = 2000;

// ─── validateQuestion ───────────────────────────────────────────────────────

/**
 * Validates a single parsed question object.
 *
 * @param {object} question — A question object (from questionParser or golden baseline)
 * @param {string} question.questionText — The question stem
 * @param {Array<{letter: string, text: string}>} question.options — Answer choices
 * @param {string[]} question.correctAnswers — Letters of correct answers
 * @param {string} question.examCode — Exam code identifier
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
function validateQuestion(question) {
  const errors = [];
  const warnings = [];

  if (!question || typeof question !== 'object') {
    return { valid: false, errors: ['Question is null or not an object'], warnings };
  }

  const qId = question.id != null ? `Q${question.id}` : 'Q?';

  // 1. Required fields
  if (!question.questionText || typeof question.questionText !== 'string' || !question.questionText.trim()) {
    errors.push(`${qId}: Missing or empty questionText (stem)`);
  }
  if (!Array.isArray(question.options) || question.options.length === 0) {
    errors.push(`${qId}: Missing or empty options array`);
  }
  if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
    errors.push(`${qId}: Missing or empty correctAnswers`);
  }
  if (!question.examCode || typeof question.examCode !== 'string' || !question.examCode.trim()) {
    errors.push(`${qId}: Missing or empty examCode`);
  }

  // 5. Exam code validity
  if (question.examCode && typeof question.examCode === 'string' && question.examCode.trim()) {
    if (!VALID_EXAM_CODES.includes(question.examCode)) {
      errors.push(`${qId}: Invalid examCode "${question.examCode}"`);
    }
  }

  // 6. Option count
  if (Array.isArray(question.options)) {
    if (question.options.length > 0 && question.options.length < MIN_OPTIONS) {
      errors.push(`${qId}: Too few options (${question.options.length}), minimum is ${MIN_OPTIONS}`);
    }
    if (question.options.length > MAX_OPTIONS) {
      errors.push(`${qId}: Too many options (${question.options.length}), maximum is ${MAX_OPTIONS}`);
    }

    // 2. Option integrity
    const seenLetters = new Set();
    for (let idx = 0; idx < question.options.length; idx++) {
      const opt = question.options[idx];
      if (!opt || typeof opt !== 'object') {
        errors.push(`${qId}: Option at index ${idx} is null or not an object`);
        continue;
      }
      if (!opt.letter || typeof opt.letter !== 'string' || !opt.letter.trim()) {
        errors.push(`${qId}: Option at index ${idx} is missing a letter`);
      } else if (!VALID_OPTION_LETTERS.has(opt.letter)) {
        errors.push(`${qId}: Option letter "${opt.letter}" is not valid (A-F)`);
      } else if (seenLetters.has(opt.letter)) {
        errors.push(`${qId}: Duplicate option letter "${opt.letter}"`);
      } else {
        seenLetters.add(opt.letter);
      }
      if (!opt.text || typeof opt.text !== 'string' || !opt.text.trim()) {
        errors.push(`${qId}: Option ${opt.letter || idx} has empty text`);
      }
    }

    // 3. Answer validity
    if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
      const optionLetters = new Set(
        question.options
          .filter(o => o && typeof o === 'object' && o.letter)
          .map(o => o.letter)
      );
      for (const ans of question.correctAnswers) {
        if (!optionLetters.has(ans)) {
          errors.push(`${qId}: Correct answer "${ans}" does not match any option`);
        }
      }
    }
  }

  // 7. Stem length warnings
  if (question.questionText && typeof question.questionText === 'string') {
    const len = question.questionText.trim().length;
    if (len > 0 && len < MIN_STEM_LENGTH) {
      warnings.push(`${qId}: Stem is very short (${len} chars)`);
    }
    if (len > MAX_STEM_LENGTH) {
      warnings.push(`${qId}: Stem is very long (${len} chars)`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── validateExamSet ────────────────────────────────────────────────────────

/**
 * Validates all questions across one or more exams, including cross-question
 * checks such as duplicate stem detection.
 *
 * @param {Object<string, Array<object>>} exams — Map of examCode → question arrays
 * @returns {{
 *   valid: boolean,
 *   examResults: Object<string, { valid: boolean, errors: string[], warnings: string[], questionCount: number }>,
 *   totalErrors: number,
 *   totalWarnings: number
 * }}
 */
function validateExamSet(exams) {
  const examResults = {};
  let totalErrors = 0;
  let totalWarnings = 0;

  if (!exams || typeof exams !== 'object') {
    return {
      valid: false,
      examResults: {},
      totalErrors: 1,
      totalWarnings: 0,
    };
  }

  for (const [code, questions] of Object.entries(exams)) {
    const examErrors = [];
    const examWarnings = [];

    if (!Array.isArray(questions)) {
      examErrors.push(`Exam "${code}": questions is not an array`);
      examResults[code] = {
        valid: false,
        errors: examErrors,
        warnings: examWarnings,
        questionCount: 0,
      };
      totalErrors += examErrors.length;
      continue;
    }

    // Validate each question individually
    for (const q of questions) {
      const result = validateQuestion(q);
      examErrors.push(...result.errors);
      examWarnings.push(...result.warnings);
    }

    // 4. Duplicate detection — flag questions with identical stems
    const stemMap = new Map();
    for (const q of questions) {
      if (!q || !q.questionText || typeof q.questionText !== 'string') continue;
      const normalizedStem = q.questionText.trim().toLowerCase();
      if (!normalizedStem) continue;
      if (!stemMap.has(normalizedStem)) {
        stemMap.set(normalizedStem, []);
      }
      stemMap.get(normalizedStem).push(q.id != null ? `Q${q.id}` : 'Q?');
    }
    for (const [, ids] of stemMap) {
      if (ids.length > 1) {
        examWarnings.push(
          `Duplicate stem detected in exam "${code}": ${ids.join(', ')}`
        );
      }
    }

    totalErrors += examErrors.length;
    totalWarnings += examWarnings.length;

    examResults[code] = {
      valid: examErrors.length === 0,
      errors: examErrors,
      warnings: examWarnings,
      questionCount: questions.length,
    };
  }

  return {
    valid: totalErrors === 0,
    examResults,
    totalErrors,
    totalWarnings,
  };
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = { validateQuestion, validateExamSet, VALID_EXAM_CODES };
