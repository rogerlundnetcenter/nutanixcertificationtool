// tests/dataValidator.test.js - Tests for the dataValidator service

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { expect } = require('./helpers.js');
const { validateQuestion, validateExamSet } = require('../src/main/services/dataValidator.js');

// Helper
function makeValidQuestion(overrides = {}) {
  return {
    id: 1,
    examCode: 'NCP-CI',
    domain: 'Domain 1: Basics',
    questionText: 'Which component handles storage I/O in a Nutanix cluster?',
    options: [
      { letter: 'A', text: 'Stargate', isCorrect: true },
      { letter: 'B', text: 'Curator', isCorrect: false },
      { letter: 'C', text: 'Medusa', isCorrect: false },
      { letter: 'D', text: 'Prism', isCorrect: false },
    ],
    correctAnswers: ['A'],
    explanation: 'Stargate is the I/O manager.',
    sourceFile: 'NCP-CI-Part1.md',
    ...overrides,
  };
}

// validateQuestion
describe('validateQuestion', () => {
  it('passes for a valid question', () => {
    const result = validateQuestion(makeValidQuestion());
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 0);
  });

  it('passes for a valid multi-select question', () => {
    const q = makeValidQuestion({
      correctAnswers: ['A', 'C'],
    });
    q.options[2].isCorrect = true;
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('fails when questionText is missing', () => {
    const result = validateQuestion(makeValidQuestion({ questionText: '' }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('questionText'))).toBe(true);
  });

  it('fails when questionText is null', () => {
    const result = validateQuestion(makeValidQuestion({ questionText: null }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('questionText'))).toBe(true);
  });

  it('fails when options is empty', () => {
    const result = validateQuestion(makeValidQuestion({ options: [] }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('options'))).toBe(true);
  });

  it('fails when options is null', () => {
    const result = validateQuestion(makeValidQuestion({ options: null }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('options'))).toBe(true);
  });

  it('fails when correctAnswers is empty', () => {
    const result = validateQuestion(makeValidQuestion({ correctAnswers: [] }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('correctAnswers'))).toBe(true);
  });

  it('fails when examCode is missing', () => {
    const result = validateQuestion(makeValidQuestion({ examCode: '' }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('examCode'))).toBe(true);
  });

  it('fails for an invalid examCode', () => {
    const result = validateQuestion(makeValidQuestion({ examCode: 'FAKE-EXAM' }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('Invalid examCode'))).toBe(true);
  });

  it('passes for each valid examCode', () => {
    for (const code of ['NCM-MCI', 'NCP-CI', 'NCP-US', 'NCP-AI']) {
      const result = validateQuestion(makeValidQuestion({ examCode: code }));
      assert.strictEqual(result.valid, true, code + ' should be valid');
    }
  });

  it('fails when an option has no letter', () => {
    const q = makeValidQuestion();
    q.options[0] = { letter: '', text: 'Some text', isCorrect: false };
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('missing a letter'))).toBe(true);
  });

  it('fails for an invalid option letter', () => {
    const q = makeValidQuestion();
    q.options[0] = { letter: 'G', text: 'Some text', isCorrect: false };
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('not valid'))).toBe(true);
  });

  it('fails when option text is empty', () => {
    const q = makeValidQuestion();
    q.options[1] = { letter: 'B', text: '', isCorrect: false };
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('empty text'))).toBe(true);
  });

  it('fails on duplicate option letters', () => {
    const q = makeValidQuestion();
    q.options[1] = { letter: 'A', text: 'Duplicate letter', isCorrect: false };
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('Duplicate option letter'))).toBe(true);
  });

  it('fails when a correct answer does not match any option', () => {
    const result = validateQuestion(makeValidQuestion({ correctAnswers: ['E'] }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('does not match any option'))).toBe(true);
  });

  it('fails when one of multiple correct answers is invalid', () => {
    const result = validateQuestion(makeValidQuestion({ correctAnswers: ['A', 'F'] }));
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('"F"'))).toBe(true);
  });

  it('fails when there is only 1 option', () => {
    const q = makeValidQuestion({
      options: [{ letter: 'A', text: 'Only option', isCorrect: true }],
    });
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('Too few options'))).toBe(true);
  });

  it('fails when there are more than 6 options', () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const opts = letters.map(l => ({ letter: l, text: 'Option ' + l, isCorrect: false }));
    opts.push({ letter: 'A', text: 'Extra option', isCorrect: false });
    const q = makeValidQuestion({ options: opts, correctAnswers: ['A'] });
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('Too many options'))).toBe(true);
  });

  it('warns on very short stems', () => {
    const result = validateQuestion(makeValidQuestion({ questionText: 'Short?' }));
    assert.strictEqual(result.valid, true);
    expect(result.warnings.some(w => w.includes('very short'))).toBe(true);
  });

  it('warns on very long stems', () => {
    const longStem = 'A'.repeat(2001);
    const result = validateQuestion(makeValidQuestion({ questionText: longStem }));
    assert.strictEqual(result.valid, true);
    expect(result.warnings.some(w => w.includes('very long'))).toBe(true);
  });

  it('does not warn on normal-length stems', () => {
    const result = validateQuestion(makeValidQuestion());
    assert.strictEqual(result.warnings.length, 0);
  });

  it('returns error for null input', () => {
    const result = validateQuestion(null);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('null'))).toBe(true);
  });

  it('returns error for undefined input', () => {
    const result = validateQuestion(undefined);
    assert.strictEqual(result.valid, false);
  });

  it('handles option that is null inside the array', () => {
    const q = makeValidQuestion();
    q.options[2] = null;
    const result = validateQuestion(q);
    assert.strictEqual(result.valid, false);
    expect(result.errors.some(e => e.includes('index 2'))).toBe(true);
  });
});

// validateExamSet
describe('validateExamSet', () => {
  it('passes for a valid exam set', () => {
    const exams = {
      'NCP-CI': [makeValidQuestion(), makeValidQuestion({ id: 2, questionText: 'Another valid question about Nutanix?' })],
    };
    const result = validateExamSet(exams);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.totalErrors, 0);
    assert.strictEqual(result.totalWarnings, 0);
  });

  it('reports errors from individual questions', () => {
    const exams = {
      'NCP-CI': [makeValidQuestion({ examCode: 'INVALID' })],
    };
    const result = validateExamSet(exams);
    assert.strictEqual(result.valid, false);
    assert.ok(result.totalErrors > 0);
    assert.strictEqual(result.examResults['NCP-CI'].valid, false);
  });

  it('detects duplicate stems within an exam', () => {
    const exams = {
      'NCP-CI': [
        makeValidQuestion({ id: 1 }),
        makeValidQuestion({ id: 2 }),
      ],
    };
    const result = validateExamSet(exams);
    assert.ok(result.totalWarnings > 0);
    expect(
      result.examResults['NCP-CI'].warnings.some(w => w.includes('Duplicate stem'))
    ).toBe(true);
  });

  it('does not flag different stems as duplicates', () => {
    const exams = {
      'NCP-CI': [
        makeValidQuestion({ id: 1, questionText: 'First question about storage?' }),
        makeValidQuestion({ id: 2, questionText: 'Second question about networking?' }),
      ],
    };
    const result = validateExamSet(exams);
    expect(
      result.examResults['NCP-CI'].warnings.some(w => w.includes('Duplicate stem'))
    ).toBe(false);
  });

  it('validates multiple exams independently', () => {
    const exams = {
      'NCP-CI': [makeValidQuestion()],
      'NCP-AI': [makeValidQuestion({ examCode: 'NCP-AI', id: 10, questionText: 'AI question about GPT models?' })],
    };
    const result = validateExamSet(exams);
    assert.strictEqual(result.valid, true);
    expect(Object.keys(result.examResults)).toHaveLength(2);
    assert.strictEqual(result.totalErrors, 0);
    assert.strictEqual(result.totalWarnings, 0);
  });

  it('handles null exams input', () => {
    const result = validateExamSet(null);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.totalErrors, 1);
  });

  it('handles empty exams object', () => {
    const result = validateExamSet({});
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.totalErrors, 0);
  });

  it('handles an exam with non-array questions value', () => {
    const result = validateExamSet({ 'NCP-CI': 'not an array' });
    assert.strictEqual(result.valid, false);
    expect(result.examResults['NCP-CI'].errors.some(e => e.includes('not an array'))).toBe(true);
  });
});