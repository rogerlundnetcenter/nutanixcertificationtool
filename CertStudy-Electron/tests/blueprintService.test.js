const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getBlueprint,
  calculateCoverage,
  getObjectivesForQuestion,
  getSupportedExamCodes,
  _blueprints,
} = require('../src/main/services/blueprintService.js');

// ─── getBlueprint ───────────────────────────────────────────────────────────

describe('getBlueprint', () => {
  it('returns null for unknown exam code', () => {
    assert.strictEqual(getBlueprint('UNKNOWN-999'), null);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(getBlueprint(''), null);
  });

  it('returns NCP-AI blueprint by canonical code', () => {
    const bp = getBlueprint('NCP-AI');
    assert.ok(bp);
    assert.strictEqual(bp.examCode, 'NCP-AI');
    assert.strictEqual(bp.questionCount, 75);
  });

  it('returns NCP-US blueprint', () => {
    const bp = getBlueprint('NCP-US');
    assert.ok(bp);
    assert.strictEqual(bp.examCode, 'NCP-US');
  });

  it('returns NCP-CI blueprint', () => {
    const bp = getBlueprint('NCP-CI');
    assert.ok(bp);
    assert.strictEqual(bp.examCode, 'NCP-CI');
  });

  it('returns NCM-MCI blueprint', () => {
    const bp = getBlueprint('NCM-MCI');
    assert.ok(bp);
    assert.strictEqual(bp.examCode, 'NCM-MCI');
    assert.strictEqual(bp.questionCount, 17);
    assert.strictEqual(bp.timeLimitMinutes, 180);
  });

  it('normalises case-insensitive codes', () => {
    assert.ok(getBlueprint('ncp-ai'));
    assert.ok(getBlueprint('ncp ai'));
    assert.ok(getBlueprint('NCP AI'));
  });

  it('normalises partial codes', () => {
    assert.ok(getBlueprint('NCM-MCI-Part2'));
    assert.strictEqual(getBlueprint('NCM-MCI-Part2').examCode, 'NCM-MCI');
  });

  // The C# .Contains("AI") bug: "MAIN" would wrongly match NCP-AI.
  // normalizeExamCode uses word-boundary matching to avoid this.
  it('does NOT match "MAIN" to NCP-AI (Contains bug fix)', () => {
    assert.strictEqual(getBlueprint('MAIN'), null);
  });
});

// ─── Blueprint data integrity ───────────────────────────────────────────────

describe('blueprint data integrity', () => {
  it('loads exactly 4 blueprints', () => {
    assert.strictEqual(_blueprints.size, 4);
  });

  for (const code of ['NCP-AI', 'NCP-US', 'NCP-CI', 'NCM-MCI']) {
    it(`${code} has non-empty sections`, () => {
      const bp = getBlueprint(code);
      assert.ok(bp.sections.length > 0, `${code} should have sections`);
    });

    it(`${code} sections all have objectives`, () => {
      const bp = getBlueprint(code);
      for (const sec of bp.sections) {
        assert.ok(sec.objectives.length > 0, `Section "${sec.name}" should have objectives`);
      }
    });

    it(`${code} objectives all have keywords`, () => {
      const bp = getBlueprint(code);
      for (const sec of bp.sections) {
        for (const obj of sec.objectives) {
          assert.ok(obj.keywords.length > 0, `Objective ${obj.id} should have keywords`);
        }
      }
    });
  }

  it('NCP-AI has 5 sections with correct section numbers', () => {
    const bp = getBlueprint('NCP-AI');
    assert.strictEqual(bp.sections.length, 5);
    assert.deepStrictEqual(bp.sections.map(s => s.sectionNumber), [1, 2, 3, 4, 5]);
  });

  it('NCP-US has 4 sections', () => {
    assert.strictEqual(getBlueprint('NCP-US').sections.length, 4);
  });

  it('NCP-CI has 3 sections', () => {
    assert.strictEqual(getBlueprint('NCP-CI').sections.length, 3);
  });

  it('NCM-MCI has 5 sections', () => {
    assert.strictEqual(getBlueprint('NCM-MCI').sections.length, 5);
  });

  it('NCP-AI total objectives = 17', () => {
    const bp = getBlueprint('NCP-AI');
    const total = bp.sections.reduce((sum, s) => sum + s.objectives.length, 0);
    assert.strictEqual(total, 17);
  });

  it('NCM-MCI total objectives = 19', () => {
    const bp = getBlueprint('NCM-MCI');
    const total = bp.sections.reduce((sum, s) => sum + s.objectives.length, 0);
    assert.strictEqual(total, 19);
  });
});

// ─── getSupportedExamCodes ──────────────────────────────────────────────────

describe('getSupportedExamCodes', () => {
  it('returns all 4 exam codes', () => {
    const codes = getSupportedExamCodes();
    assert.strictEqual(codes.length, 4);
    assert.ok(codes.includes('NCP-AI'));
    assert.ok(codes.includes('NCP-US'));
    assert.ok(codes.includes('NCP-CI'));
    assert.ok(codes.includes('NCM-MCI'));
  });
});

// ─── getObjectivesForQuestion ───────────────────────────────────────────────

describe('getObjectivesForQuestion', () => {
  it('returns empty array for unknown exam code', () => {
    const result = getObjectivesForQuestion('UNKNOWN', 'GPU passthrough');
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array when no keywords match', () => {
    const result = getObjectivesForQuestion('NCP-AI', 'What is the meaning of life?');
    assert.deepStrictEqual(result, []);
  });

  it('matches NCP-AI question about GPU prerequisites', () => {
    const result = getObjectivesForQuestion('NCP-AI', 'What are the GPU prerequisites for NAI deployment?');
    assert.ok(result.length > 0);
    const ids = result.map(r => r.objId);
    assert.ok(ids.includes('1.1'), 'Should match objective 1.1 (prerequisites + GPU + NAI + deploy)');
  });

  it('matches case-insensitively', () => {
    const r1 = getObjectivesForQuestion('NCP-AI', 'configure FQDN for the cluster');
    const r2 = getObjectivesForQuestion('NCP-AI', 'Configure fqdn for the cluster');
    assert.deepStrictEqual(r1, r2);
    assert.ok(r1.length > 0);
  });

  it('matches partial keywords (e.g. "auto-scal" matches "auto-scaling")', () => {
    const result = getObjectivesForQuestion('NCP-AI', 'How to configure auto-scaling for endpoints?');
    const ids = result.map(r => r.objId);
    assert.ok(ids.includes('2.3'), 'Should match 2.3 (auto-scal keyword)');
  });

  it('matches NCP-US Files keywords', () => {
    const result = getObjectivesForQuestion('NCP-US', 'How many FSVMs are needed for HA?');
    const ids = result.map(r => r.objId);
    assert.ok(ids.includes('1.1'));
  });

  it('matches NCM-MCI security keywords', () => {
    const result = getObjectivesForQuestion('NCM-MCI', 'How to configure SCMA for cluster hardening?');
    const ids = result.map(r => r.objId);
    assert.ok(ids.includes('3.1'));
  });

  it('returns objId and objTitle properties', () => {
    const result = getObjectivesForQuestion('NCP-AI', 'How to install NKP kubectl components?');
    assert.ok(result.length > 0);
    for (const match of result) {
      assert.ok(typeof match.objId === 'string');
      assert.ok(typeof match.objTitle === 'string');
      assert.ok(match.objId.length > 0);
      assert.ok(match.objTitle.length > 0);
    }
  });
});

// ─── calculateCoverage ──────────────────────────────────────────────────────

describe('calculateCoverage', () => {
  it('returns zero coverage for unknown exam code', () => {
    const result = calculateCoverage('UNKNOWN', ['some question text']);
    assert.strictEqual(result.overallPercent, 0);
    assert.strictEqual(result.totalObjectives, 0);
    assert.strictEqual(result.sectionBreakdown.length, 0);
  });

  it('returns zero coverage when no questions match', () => {
    const result = calculateCoverage('NCP-AI', ['What is the meaning of life?']);
    assert.strictEqual(result.coveredObjectives, 0);
    assert.strictEqual(result.overallPercent, 0);
    assert.strictEqual(result.examCode, 'NCP-AI');
    assert.ok(result.totalObjectives > 0);
  });

  it('returns zero coverage with empty question list', () => {
    const result = calculateCoverage('NCP-AI', []);
    assert.strictEqual(result.coveredObjectives, 0);
    assert.strictEqual(result.overallPercent, 0);
    assert.strictEqual(result.totalObjectives, 17);
  });

  it('counts questions per objective correctly', () => {
    const questions = [
      'What are the GPU prerequisites for NAI?',
      'How do you validate GPU passthrough?',
      'How to configure auto-scaling for endpoints?',
    ];
    const result = calculateCoverage('NCP-AI', questions);
    // Objective 1.1 has "GPU" keyword — first two questions should match
    assert.ok(result.objectiveCounts['1.1'] >= 2, `Expected >=2, got ${result.objectiveCounts['1.1']}`);
  });

  it('returns correct section breakdown structure', () => {
    const result = calculateCoverage('NCP-AI', ['GPU prerequisites for deployment']);
    assert.strictEqual(result.sectionBreakdown.length, 5);
    for (const sec of result.sectionBreakdown) {
      assert.ok(typeof sec.sectionName === 'string');
      assert.ok(typeof sec.totalObjectives === 'number');
      assert.ok(typeof sec.coveredObjectives === 'number');
      assert.ok(typeof sec.questionCount === 'number');
      assert.ok(typeof sec.coveragePercent === 'number');
      assert.ok(sec.coveragePercent >= 0 && sec.coveragePercent <= 100);
    }
  });

  it('overall percent is rounded to integer', () => {
    const questions = ['GPU passthrough for NAI deployment'];
    const result = calculateCoverage('NCP-AI', questions);
    assert.strictEqual(result.overallPercent, Math.round(result.overallPercent));
  });

  it('100% coverage when all objectives are hit', () => {
    const bp = getBlueprint('NCP-AI');
    // Build a question that hits every objective by joining all keywords
    const allKeywords = bp.sections
      .flatMap(s => s.objectives.flatMap(o => o.keywords));
    const megaQuestion = allKeywords.join(' ');
    const result = calculateCoverage('NCP-AI', [megaQuestion]);
    assert.strictEqual(result.overallPercent, 100);
    assert.strictEqual(result.coveredObjectives, result.totalObjectives);
  });

  it('handles NCP-US coverage', () => {
    const result = calculateCoverage('NCP-US', [
      'How to configure FSVM for Files deployment?',
      'Configure S3 bucket policy for Objects',
      'Troubleshoot iSCSI Volume Group connectivity',
    ]);
    assert.strictEqual(result.examCode, 'NCP-US');
    assert.ok(result.coveredObjectives > 0);
    assert.ok(result.overallPercent > 0);
  });

  it('handles NCM-MCI coverage', () => {
    const result = calculateCoverage('NCM-MCI', [
      'Run NCC health check and collect logs with logbay',
      'Configure Flow VPC microsegmentation policy',
      'Create recovery plan for failover',
    ]);
    assert.strictEqual(result.examCode, 'NCM-MCI');
    assert.ok(result.coveredObjectives > 0);
  });

  it('case-insensitive matching in coverage', () => {
    const r1 = calculateCoverage('NCP-AI', ['gpu passthrough']);
    const r2 = calculateCoverage('NCP-AI', ['GPU PASSTHROUGH']);
    assert.deepStrictEqual(r1.objectiveCounts, r2.objectiveCounts);
  });
});
