const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateQuestion, validateExamSet } = require('../src/main/services/dataValidator.js');

function makeValidQuestion(overrides = {}) {
  return {
    id: 1, examCode: 'NCP-CI', domain: 'Domain 1: Basics',
    questionText: 'Which component handles storage I/O in a Nutanix cluster?',
    options: [
      { letter: 'A', text: 'Stargate', isCorrect: true },
      { letter: 'B', text: 'Curator', isCorrect: false },
      { letter: 'C', text: 'Medusa', isCorrect: false },
      { letter: 'D', text: 'Prism', isCorrect: false },
    ],
    correctAnswers: ['A'], explanation: 'Stargate is the I/O manager.',
    sourceFile: 'NCP-CI-Part1.md', ...overrides,
  };
}

describe('validateQuestion', () => {
  it('passes for a valid question', () => {
    const r = validateQuestion(makeValidQuestion());
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.errors.length, 0);
  });

  it('fails when questionText is missing', () => {
    const r = validateQuestion(makeValidQuestion({ questionText: '' }));
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('questionText')));
  });

  it('fails when options is empty', () => {
    const r = validateQuestion(makeValidQuestion({ options: [] }));
    assert.strictEqual(r.valid, false);
  });

  it('fails when correctAnswers is empty', () => {
    const r = validateQuestion(makeValidQuestion({ correctAnswers: [] }));
    assert.strictEqual(r.valid, false);
  });

  it('fails when examCode is missing', () => {
    const r = validateQuestion(makeValidQuestion({ examCode: '' }));
    assert.strictEqual(r.valid, false);
  });

  it('fails for an invalid examCode', () => {
    const r = validateQuestion(makeValidQuestion({ examCode: 'FAKE-EXAM' }));
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('Invalid examCode') || e.includes('examCode')));
  });

  it('passes for each valid examCode', () => {
    for (const code of ['NCM-MCI', 'NCP-CI', 'NCP-US', 'NCP-AI']) {
      const r = validateQuestion(makeValidQuestion({ examCode: code }));
      assert.strictEqual(r.valid, true, `${code} should be valid`);
    }
  });

  it('fails on duplicate option letters', () => {
    const q = makeValidQuestion();
    q.options[1] = { letter: 'A', text: 'Duplicate', isCorrect: false };
    const r = validateQuestion(q);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('Duplicate') || e.includes('duplicate')));
  });

  it('fails when correct answer not in options', () => {
    const r = validateQuestion(makeValidQuestion({ correctAnswers: ['E'] }));
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('match') || e.includes('option')));
  });

  it('fails with only 1 option', () => {
    const q = makeValidQuestion({ options: [{ letter: 'A', text: 'Only', isCorrect: true }] });
    const r = validateQuestion(q);
    assert.strictEqual(r.valid, false);
  });

  it('warns on very short stems', () => {
    const r = validateQuestion(makeValidQuestion({ questionText: 'Short?' }));
    assert.strictEqual(r.valid, true);
    assert.ok(r.warnings.some(w => w.includes('short')));
  });

  it('handles null input', () => {
    const r = validateQuestion(null);
    assert.strictEqual(r.valid, false);
  });
});

describe('validateExamSet', () => {
  it('passes for a valid exam set', () => {
    const exams = { 'NCP-CI': [makeValidQuestion(), makeValidQuestion({ id: 2, questionText: 'Another question?' })] };
    const r = validateExamSet(exams);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.totalErrors, 0);
  });

  it('detects duplicate stems', () => {
    const exams = { 'NCP-CI': [makeValidQuestion({ id: 1 }), makeValidQuestion({ id: 2 })] };
    const r = validateExamSet(exams);
    assert.ok(r.totalWarnings > 0);
    assert.ok(r.examResults['NCP-CI'].warnings.some(w => w.includes('Duplicate') || w.includes('duplicate')));
  });

  it('handles null input', () => {
    const r = validateExamSet(null);
    assert.strictEqual(r.valid, false);
  });

  it('handles empty object', () => {
    const r = validateExamSet({});
    assert.strictEqual(r.valid, true);
  });
});
