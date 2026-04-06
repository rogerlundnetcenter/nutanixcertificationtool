// Golden-file tests for QuestionParser
// Validates parser output against known-good baseline data.

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { expect } = require('./helpers.js');
const path = require('path');
const fs = require('fs');

const { parseFile, loadAllExams, deriveExamCode } = require('../src/main/services/questionParser.js');

// Shared fixtures
const DATA_DIR = path.resolve(__dirname, '..', '..');
let exams;
let allQuestions;

const EXPECTED_COUNTS = {
  'NCM-MCI': 350,
  'NCP-AI': 644,
  'NCP-CI': 363,
  'NCP-US': 400,
};
const EXPECTED_TOTAL = 1757;

before(() => {
  exams = loadAllExams(DATA_DIR);
  allQuestions = Object.values(exams).flat();
});

// 1. Per-exam question counts
describe('Per-exam question counts', () => {
  it('each exam has the expected number of questions', () => {
    for (const [examCode, expected] of Object.entries(EXPECTED_COUNTS)) {
      assert.ok(exams[examCode] !== undefined, examCode + ' should exist');
      expect(exams[examCode].length).toBe(expected);
    }
  });
});

// 2. Total question count
describe('Total question count', () => {
  it('parses exactly 1438 questions across all exams', () => {
    expect(allQuestions.length).toBe(EXPECTED_TOTAL);
  });

  it('has exactly 4 exam codes', () => {
    expect(Object.keys(exams).sort()).toEqual(
      ['NCM-MCI', 'NCP-AI', 'NCP-CI', 'NCP-US'],
    );
  });
});

// 3. deriveExamCode
describe('deriveExamCode', () => {
  it('derives correct exam codes from filenames', () => {
    const cases = [
      ['NCP-US-Part1.md', 'NCP-US'],
      ['NCM-MCI-Part2.md', 'NCM-MCI'],
      ['NCP-AI-Part5-GapFill.md', 'NCP-AI'],
      ['NCP-CI-Part3.md', 'NCP-CI'],
      ['NCP-US-Part2-D3.md', 'NCP-US'],
      ['NCM-MCI-Part5-GapFill.md', 'NCM-MCI'],
    ];
    for (const [fileName, expected] of cases) {
      expect(deriveExamCode(fileName)).toBe(expected);
    }
  });

  it('returns the raw name when no hyphen is present', () => {
    expect(deriveExamCode('README')).toBe('README');
  });

  it('returns two-segment code for unknown prefix', () => {
    expect(deriveExamCode('FOO-BAR-Part1.md')).toBe('FOO-BAR');
  });
});

// 4. Question structure
describe('Question structure (first question per exam)', () => {
  it('each exam Q1 has required fields', () => {
    for (const examCode of Object.keys(EXPECTED_COUNTS)) {
      const q = exams[examCode][0];
      assert.ok(q.questionText.length > 0, examCode + ' Q1 stem should be non-empty');
      assert.ok(q.options.length >= 2, examCode + ' Q1 should have >= 2 options');
      assert.ok(q.correctAnswers.length >= 1, examCode + ' Q1 should have >= 1 correct answer');
      assert.ok(q.explanation.length > 0, examCode + ' Q1 should have an explanation');
      expect(q.examCode).toBe(examCode);
      assert.ok(q.sourceFile.endsWith('.md'), examCode + ' Q1 sourceFile should be .md');
    }
  });
});

// 5. Multi-select detection
describe('Multi-select detection', () => {
  it('finds multi-select questions in the parsed output', () => {
    const multiSelect = allQuestions.filter((q) => q.isMultiSelect);
    assert.ok(multiSelect.length > 0, 'Should find at least one multi-select question');
  });

  it('isMultiSelect is true iff correctAnswers.length > 1', () => {
    for (const q of allQuestions) {
      expect(q.isMultiSelect).toBe(q.correctAnswers.length > 1);
    }
  });

  it('NCM-MCI Q61 from Part3 is multi-select with answers A, B', () => {
    const q = exams['NCM-MCI'].find(
      (q) => q.id === 61 && q.sourceFile === 'NCM-MCI-Part3.md',
    );
    assert.ok(q !== undefined, 'Q61 should exist');
    assert.strictEqual(q.isMultiSelect, true);
    assert.deepStrictEqual(q.correctAnswers, ['A', 'B']);
  });
});

// 6. Option letters
describe('Option letters', () => {
  it('every option has a single uppercase letter A-F', () => {
    for (const q of allQuestions) {
      for (const opt of q.options) {
        assert.match(opt.letter, /^[A-F]$/);
      }
    }
  });

  it('option letters within a question are unique', () => {
    for (const q of allQuestions) {
      const letters = q.options.map((o) => o.letter);
      expect(new Set(letters).size).toBe(letters.length);
    }
  });

  it('option letters are in alphabetical order', () => {
    for (const q of allQuestions) {
      const letters = q.options.map((o) => o.letter);
      const sorted = [...letters].sort();
      expect(letters).toEqual(sorted);
    }
  });
});

// 7. Correct answer validation
describe('Correct answer validation', () => {
  it('every correctAnswer letter exists in the question options', () => {
    for (const q of allQuestions) {
      const optLetters = new Set(q.options.map((o) => o.letter));
      for (const ans of q.correctAnswers) {
        expect(optLetters.has(ans)).toBe(true);
      }
    }
  });

  it('isCorrect flags on options match correctAnswers', () => {
    for (const q of allQuestions) {
      for (const opt of q.options) {
        expect(opt.isCorrect).toBe(q.correctAnswers.includes(opt.letter));
      }
    }
  });
});

// 8. Domain tracking
describe('Domain tracking', () => {
  it('every question has a non-empty domain', () => {
    for (const q of allQuestions) {
      assert.ok(q.domain.length > 0, 'Q' + q.id + ' in ' + q.sourceFile + ' should have a domain');
    }
  });

  it('domains start with Domain or the exam code', () => {
    for (const q of allQuestions) {
      const ok = q.domain.startsWith('Domain') || q.domain.startsWith(q.examCode);
      assert.strictEqual(ok, true, 'Q' + q.id + ' domain should start with Domain or ' + q.examCode);
    }
  });
});

// 9. Edge cases
describe('Edge cases', () => {
  it('returns empty array for non-existent file', () => {
    const result = parseFile(path.join(DATA_DIR, 'does-not-exist.md'));
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for an empty file', () => {
    const tmp = path.join(__dirname, '_empty_test.md');
    fs.writeFileSync(tmp, '', 'utf-8');
    try {
      const result = parseFile(tmp);
      assert.deepStrictEqual(result, []);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('returns empty array for file with no questions', () => {
    const tmp = path.join(__dirname, '_no_questions_test.md');
    fs.writeFileSync(tmp, '# Just a title\n\nSome random text.\n', 'utf-8');
    try {
      const result = parseFile(tmp);
      assert.deepStrictEqual(result, []);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('skips malformed questions (header with no options)', () => {
    const tmp = path.join(__dirname, '_malformed_test.md');
    fs.writeFileSync(
      tmp,
      '### Q1\nSome stem text but no options or answer line.\n---\n',
      'utf-8',
    );
    try {
      const result = parseFile(tmp);
      assert.deepStrictEqual(result, []);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});

// 10. Spot checks
describe('Spot checks', () => {
  it('NCM-MCI Q1 (Part1): VDI boot storms / Shadow Clones', () => {
    const q = exams['NCM-MCI'].find(
      (q) => q.id === 1 && q.sourceFile === 'NCM-MCI-Part1.md',
    );
    assert.ok(q !== undefined, 'NCM-MCI Q1 Part1 should exist');
    expect(q.questionText).toBe(
      'An administrator needs to optimize storage performance for a VDI environment experiencing boot storms. Which Nutanix feature should be enabled?',
    );
    assert.deepStrictEqual(q.correctAnswers, ['A']);
    expect(q.options[0].text).toBe(
      'Shadow Clones to cache read-only boot disk data locally on each node',
    );
    assert.strictEqual(q.examCode, 'NCM-MCI');
    assert.strictEqual(q.isMultiSelect, false);
  });

  it('NCM-MCI Q10 (Part1): storage pool capacity', () => {
    const q = exams['NCM-MCI'].find(
      (q) => q.id === 10 && q.sourceFile === 'NCM-MCI-Part1.md',
    );
    assert.ok(q !== undefined, 'NCM-MCI Q10 Part1 should exist');
    expect(q.questionText).toBe(
      'An administrator needs to check the total usable storage capacity and current utilization of all storage pools. Which command provides this information?',
    );
    assert.deepStrictEqual(q.correctAnswers, ['A']);
  });

  it('NCP-AI Q1 (Part1): 70B LLM on T4 GPUs', () => {
    const q = exams['NCP-AI'].find(
      (q) => q.id === 1 && q.sourceFile === 'NCP-AI-Part1.md',
    );
    assert.ok(q !== undefined, 'NCP-AI Q1 Part1 should exist');
    assert.ok(q.questionText.includes('70B'), 'Stem should mention 70B');
    assert.deepStrictEqual(q.correctAnswers, ['A']);
    assert.strictEqual(q.examCode, 'NCP-AI');
  });

  it('NCP-US Q1 (Part1): minimum FSVMs for HA', () => {
    const q = exams['NCP-US'].find(
      (q) => q.id === 1 && q.sourceFile === 'NCP-US-Part1.md',
    );
    assert.ok(q !== undefined, 'NCP-US Q1 Part1 should exist');
    assert.ok(q.questionText.includes('FSVM'), 'Stem should mention FSVM');
    assert.ok(q.questionText.includes('high availability'), 'Stem should mention HA');
    assert.deepStrictEqual(q.correctAnswers, ['C']);
    expect(q.options.map((o) => o.letter)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('NCP-CI Q1 (Part1): AWS VPC /24 CIDR', () => {
    const q = exams['NCP-CI'].find(
      (q) => q.id === 1 && q.sourceFile === 'NCP-CI-Part1.md',
    );
    assert.ok(q !== undefined, 'NCP-CI Q1 Part1 should exist');
    assert.ok(q.questionText.includes('AWS'), 'Stem should mention AWS');
    assert.deepStrictEqual(q.correctAnswers, ['B']);
    assert.strictEqual(q.examCode, 'NCP-CI');
  });
});