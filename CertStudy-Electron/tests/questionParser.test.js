// Golden-file tests for QuestionParser
// Validates parser output against known-good baseline data.
// vitest globals: true — describe/it/expect/beforeAll are global

const path = require('path');
const fs = require('fs');
const { parseFile, loadAllExams, deriveExamCode } = require('../src/main/services/questionParser.js');

// Shared fixtures
const DATA_DIR = path.resolve(__dirname, '..', '..');
let exams;
let allQuestions;

const EXPECTED_COUNTS = {
  'NCM-MCI': 350,
  'NCP-AI': 325,
  'NCP-CI': 363,
  'NCP-US': 400,
};
const EXPECTED_TOTAL = 1438;

beforeAll(() => {
  exams = loadAllExams(DATA_DIR);
  allQuestions = Object.values(exams).flat();
});

// 1. Per-exam question counts
describe('Per-exam question counts', () => {
  it.each([
    ['NCM-MCI', 350],
    ['NCP-AI', 325],
    ['NCP-CI', 363],
    ['NCP-US', 400],
  ])('%s has %d questions', (examCode, expected) => {
    expect(exams[examCode]).toBeDefined();
    expect(exams[examCode].length).toBe(expected);
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
  it.each([
    ['NCP-US-Part1.md', 'NCP-US'],
    ['NCM-MCI-Part2.md', 'NCM-MCI'],
    ['NCP-AI-Part5-GapFill.md', 'NCP-AI'],
    ['NCP-CI-Part3.md', 'NCP-CI'],
    ['NCP-US-Part2-D3.md', 'NCP-US'],
    ['NCM-MCI-Part5-GapFill.md', 'NCM-MCI'],
  ])('"%s" derives to "%s"', (fileName, expected) => {
    expect(deriveExamCode(fileName)).toBe(expected);
  });

  it('returns the raw name when no extension is present', () => {
    expect(deriveExamCode('README')).toBe('README');
  });

  it('returns two-segment code for unknown prefix', () => {
    expect(deriveExamCode('FOO-BAR-Part1.md')).toBe('FOO-BAR');
  });
});

// 4. Question structure - first question of each exam
describe('Question structure (first question per exam)', () => {
  it.each(['NCM-MCI', 'NCP-AI', 'NCP-CI', 'NCP-US'])(
    '%s Q1 has required fields',
    (examCode) => {
      const q = exams[examCode][0];
      expect(q.questionText.length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswers.length).toBeGreaterThanOrEqual(1);
      expect(q.explanation.length).toBeGreaterThan(0);
      expect(q.examCode).toBe(examCode);
      expect(q.sourceFile).toMatch(/\.md$/);
      expect(typeof q.id).toBe('number');
    },
  );
});

// 5. Multi-select detection
describe('Multi-select detection', () => {
  it('finds multi-select questions in the parsed output', () => {
    const multiSelect = allQuestions.filter((q) => q.isMultiSelect);
    expect(multiSelect.length).toBeGreaterThan(0);
  });

  it('isMultiSelect is true iff correctAnswers.length > 1', () => {
    for (const q of allQuestions) {
      expect(q.isMultiSelect).toBe(q.correctAnswers.length > 1);
    }
  });

  it('NCM-MCI Q61 from Part3 is multi-select with answers A, B', () => {
    const q = exams['NCM-MCI'].find(
      (item) => item.id === 61 && item.sourceFile === 'NCM-MCI-Part3.md',
    );
    expect(q).toBeDefined();
    expect(q.isMultiSelect).toBe(true);
    expect(q.correctAnswers).toEqual(['A', 'B']);
    expect(q.options.length).toBe(5);
  });
});

// 6. Option letters - all A-F single uppercase
describe('Option letters', () => {
  it('every option has a single uppercase letter A-F', () => {
    for (const q of allQuestions) {
      for (const opt of q.options) {
        expect(opt.letter).toMatch(/^[A-F]$/);
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
      expect(q.domain.length).toBeGreaterThan(0);
    }
  });

  it('domains start with "Domain" or the exam code', () => {
    for (const q of allQuestions) {
      const startsCorrectly =
        q.domain.startsWith('Domain') || q.domain.startsWith(q.examCode);
      expect(startsCorrectly).toBe(true);
    }
  });
});

// 9. Edge cases
describe('Edge cases', () => {
  it('returns empty array for non-existent file', () => {
    const result = parseFile(path.join(DATA_DIR, 'does-not-exist.md'));
    expect(result).toEqual([]);
  });

  it('returns empty array for an empty file', () => {
    const tmp = path.join(__dirname, '_empty_test.md');
    fs.writeFileSync(tmp, '', 'utf-8');
    try {
      expect(parseFile(tmp)).toEqual([]);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('returns empty array for file with no questions', () => {
    const tmp = path.join(__dirname, '_no_questions_test.md');
    fs.writeFileSync(tmp, '# Just a title\n\nSome random text.\n', 'utf-8');
    try {
      expect(parseFile(tmp)).toEqual([]);
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
      expect(parseFile(tmp)).toEqual([]);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});

// 10. Spot checks - verify specific questions exactly
describe('Spot checks', () => {
  it('NCM-MCI Q1 (Part1): VDI boot storms / Shadow Clones', () => {
    const q = exams['NCM-MCI'].find(
      (item) => item.id === 1 && item.sourceFile === 'NCM-MCI-Part1.md',
    );
    expect(q).toBeDefined();
    expect(q.questionText).toBe(
      'An administrator needs to optimize storage performance for a VDI environment experiencing boot storms. Which Nutanix feature should be enabled?',
    );
    expect(q.correctAnswers).toEqual(['A']);
    expect(q.options[0].text).toBe(
      'Shadow Clones to cache read-only boot disk data locally on each node',
    );
    expect(q.domain).toBe('Domain 1: Storage Performance');
    expect(q.isMultiSelect).toBe(false);
  });

  it('NCM-MCI Q10 (Part1): ncli storage-pool ls', () => {
    const q = exams['NCM-MCI'].find(
      (item) => item.id === 10 && item.sourceFile === 'NCM-MCI-Part1.md',
    );
    expect(q).toBeDefined();
    expect(q.questionText).toBe(
      'An administrator needs to check the total usable storage capacity and current utilization of all storage pools. Which command provides this information?',
    );
    expect(q.correctAnswers).toEqual(['A']);
    expect(q.options[0].text).toContain('ncli storage-pool ls');
  });

  it('NCP-AI Q1 (Part1): 70B LLM on T4 GPUs', () => {
    const q = exams['NCP-AI'].find(
      (item) => item.id === 1 && item.sourceFile === 'NCP-AI-Part1.md',
    );
    expect(q).toBeDefined();
    expect(q.questionText).toContain('70B parameter LLM');
    expect(q.correctAnswers).toEqual(['A']);
    expect(q.domain).toBe('Domain 1: Deploy NAI Environment');
  });

  it('NCP-US Q1 (Part1): minimum FSVMs for HA', () => {
    const q = exams['NCP-US'].find(
      (item) => item.id === 1 && item.sourceFile === 'NCP-US-Part1.md',
    );
    expect(q).toBeDefined();
    expect(q.questionText).toContain('minimum');
    expect(q.questionText).toContain('File Server VMs');
    expect(q.correctAnswers).toEqual(['C']);
    expect(q.options.map((o) => o.letter)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('NCP-CI Q1 (Part1): AWS VPC /24 CIDR', () => {
    const q = exams['NCP-CI'].find(
      (item) => item.id === 1 && item.sourceFile === 'NCP-CI-Part1.md',
    );
    expect(q).toBeDefined();
    expect(q.questionText).toContain('/24 CIDR');
    expect(q.correctAnswers).toEqual(['B']);
    expect(q.domain).toBe('Domain 1: Prepare Cloud Environment');
  });
});
