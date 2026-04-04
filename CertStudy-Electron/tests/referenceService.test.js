const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getReferenceForQuestion, getKBLinksForQuestion, getGeneralResources,
  _REFERENCE_DATA, _KB_LINKS,
} = require('../src/main/services/referenceService.js');

function makeQ(examCode, questionText, optionTexts = []) {
  return {
    examCode, questionText,
    options: optionTexts.map((text, i) => ({ letter: String.fromCharCode(65 + i), text, isCorrect: i === 0 })),
  };
}

describe('getReferenceForQuestion', () => {
  it('returns empty for unknown exam code', () => {
    assert.strictEqual(getReferenceForQuestion(makeQ('UNKNOWN', 'What?')), '');
  });

  it('returns empty when no keywords match', () => {
    assert.strictEqual(getReferenceForQuestion(makeQ('NCP-US', 'Meaning of life?', ['42'])), '');
  });

  it('matches NCP-US FSVM keywords', () => {
    const r = getReferenceForQuestion(makeQ('NCP-US', 'How many FSVMs for HA?', ['3 FSVMs minimum']));
    assert.ok(r.length > 0);
    assert.ok(r.includes('Files') || r.includes('FSVM'));
  });

  it('case-insensitive matching', () => {
    const r = getReferenceForQuestion(makeQ('NCP-US', 'what protocol does the fsvm use?', ['smb']));
    assert.ok(r.length > 0);
  });

  it('matches NCM-MCI DSF keywords', () => {
    const r = getReferenceForQuestion(makeQ('NCM-MCI', 'OpLog and Unified Cache?', ['Stargate']));
    assert.ok(r.includes('Distributed Storage Fabric') || r.includes('DSF') || r.includes('Storage'));
  });
});

describe('getKBLinksForQuestion', () => {
  it('returns empty for unknown exam', () => {
    assert.deepStrictEqual(getKBLinksForQuestion(makeQ('UNKNOWN', 'What?')), []);
  });

  it('returns KB links with title and url', () => {
    const r = getKBLinksForQuestion(makeQ('NCP-US', 'Configure FSVM for SMB?', ['Deploy file server']));
    assert.ok(r.length > 0);
    assert.ok('title' in r[0]);
    assert.ok('url' in r[0]);
    assert.match(r[0].url, /^https?:\/\//);
  });

  it('deduplicates results by URL', () => {
    const r = getKBLinksForQuestion(makeQ('NCP-US', 'SMB snapshot replication upgrade LCM', ['SmartDR failover']));
    const urls = r.map(x => x.url);
    assert.strictEqual(urls.length, new Set(urls).size);
  });
});

describe('getGeneralResources', () => {
  it('returns 3 resources', () => {
    assert.strictEqual(getGeneralResources().length, 3);
  });

  it('each has title and url', () => {
    for (const r of getGeneralResources()) {
      assert.ok(typeof r.title === 'string');
      assert.match(r.url, /^https?:\/\//);
    }
  });

  it('includes Nutanix University', () => {
    assert.ok(getGeneralResources().find(r => r.title === 'Nutanix University'));
  });

  it('returns new array each call', () => {
    assert.notStrictEqual(getGeneralResources(), getGeneralResources());
    assert.deepStrictEqual(getGeneralResources(), getGeneralResources());
  });
});

describe('data structures', () => {
  it('covers all 4 exam codes', () => {
    assert.deepStrictEqual(Object.keys(_REFERENCE_DATA).sort(), ['NCM-MCI', 'NCP-AI', 'NCP-CI', 'NCP-US']);
    assert.deepStrictEqual(Object.keys(_KB_LINKS).sort(), ['NCM-MCI', 'NCP-AI', 'NCP-CI', 'NCP-US']);
  });

  it('every reference entry has keywords and reference string', () => {
    for (const [code, entries] of Object.entries(_REFERENCE_DATA)) {
      for (const e of entries) {
        assert.ok(Array.isArray(e.keywords) && e.keywords.length > 0, `${code} missing keywords`);
        assert.ok(typeof e.reference === 'string' && e.reference.length > 0, `${code} missing reference`);
      }
    }
  });

  it('every KB entry has keywords, title, and url', () => {
    for (const [code, entries] of Object.entries(_KB_LINKS)) {
      for (const e of entries) {
        assert.ok(Array.isArray(e.keywords));
        assert.ok(typeof e.title === 'string');
        assert.match(e.url, /^https?:\/\//);
      }
    }
  });
});
