// Tests for pdfExportService — uses node:test (built-in)

'use strict';

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { exportExam, exportAll } = require('../src/main/services/pdfExportService.js');

/** Disable stream compression so hex-encoded text is visible in the buffer. */
const NO_COMPRESS = { compress: false };

/**
 * Extracts readable text from a PDFKit-generated buffer.
 * PDFKit emits text as hex-encoded glyph data inside TJ operators.
 * This helper decodes all <hex> runs and concatenates them.
 */
function extractPdfText(buffer) {
  const raw = buffer.toString('binary');
  const hexRuns = raw.matchAll(/<([0-9a-fA-F]+)>/g);
  let text = '';
  for (const m of hexRuns) {
    text += Buffer.from(m[1], 'hex').toString('binary');
  }
  // Also include literal PDF strings (parenthesised) for metadata
  return text + ' ' + raw;
}

// ─── Test fixtures ──────────────────────────────────────────────────────────

/** Minimal single-select question */
const singleQ = {
  id: 1,
  examCode: 'NCP-AI',
  domain: 'Domain 1',
  questionText: 'Which component handles GPU passthrough in Nutanix AHV?',
  options: [
    { letter: 'A', text: 'Prism Central', isCorrect: false },
    { letter: 'B', text: 'AHV Hypervisor', isCorrect: true },
    { letter: 'C', text: 'CVM', isCorrect: false },
    { letter: 'D', text: 'Foundation', isCorrect: false },
  ],
  correctAnswers: ['B'],
  explanation: 'AHV provides native GPU passthrough via its built-in hypervisor layer.',
  sourceFile: 'NCP-AI-Part1.md',
};

/** Multi-select question (two correct answers) */
const multiQ = {
  id: 2,
  examCode: 'NCP-AI',
  domain: 'Domain 2',
  questionText: 'Which TWO components are required for Nutanix GPT-in-a-Box? (Choose 2)',
  options: [
    { letter: 'A', text: 'Nutanix NKE', isCorrect: true },
    { letter: 'B', text: 'Citrix ADC', isCorrect: false },
    { letter: 'C', text: 'GPU Nodes', isCorrect: true },
    { letter: 'D', text: 'Prism Pro', isCorrect: false },
  ],
  correctAnswers: ['A', 'C'],
  explanation: 'GPT-in-a-Box requires NKE for Kubernetes orchestration and GPU-enabled nodes.',
  sourceFile: 'NCP-AI-Part2.md',
};

/** Question with a very long stem to exercise text wrapping */
const longStemQ = {
  id: 3,
  examCode: 'NCP-AI',
  domain: 'Domain 3',
  questionText:
    'An administrator needs to configure a Nutanix cluster for AI/ML workloads. ' +
    'The environment requires low-latency access to training data stored on Nutanix Files, ' +
    'GPU passthrough for model training, and Kubernetes orchestration via NKE. ' +
    'What is the recommended first step?',
  options: [
    { letter: 'A', text: 'Enable GPU passthrough in AHV', isCorrect: false },
    { letter: 'B', text: 'Deploy NKE cluster', isCorrect: false },
    { letter: 'C', text: 'Validate hardware compatibility', isCorrect: true },
    { letter: 'D', text: 'Create Nutanix Files share', isCorrect: false },
  ],
  correctAnswers: ['C'],
  explanation: '',
  sourceFile: 'NCP-AI-Part3.md',
};

const fixtures = [singleQ, multiQ, longStemQ];

// Temp files to clean up
const tempFiles = [];
after(() => {
  for (const f of tempFiles) {
    try { fs.unlinkSync(f); } catch { /* ignore */ }
  }
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('pdfExportService', () => {

  describe('exportExam()', () => {

    it('produces a non-empty Buffer', async () => {
      const buf = await exportExam('NCP-AI 6.10', fixtures, false, undefined, NO_COMPRESS);
      assert.ok(Buffer.isBuffer(buf), 'result should be a Buffer');
      assert.ok(buf.length > 500, `PDF buffer too small (${buf.length} bytes)`);
    });

    it('output starts with the %PDF magic bytes', async () => {
      const buf = await exportExam('NCP-AI 6.10', fixtures, false, undefined, NO_COMPRESS);
      const magic = buf.subarray(0, 5).toString('ascii');
      assert.equal(magic, '%PDF-', `Expected %PDF- header, got ${magic}`);
    });

    it('includes the exam name in the PDF content', async () => {
      const buf = await exportExam('NCP-AI 6.10', fixtures, false, undefined, NO_COMPRESS);
      const text = extractPdfText(buf);
      assert.ok(text.includes('NCP-AI'), 'PDF should contain the exam name');
    });

    it('handles multi-select questions with Select label', async () => {
      const buf = await exportExam('NCP-AI 6.10', [multiQ], true, undefined, NO_COMPRESS);
      const text = extractPdfText(buf);
      assert.ok(text.includes('Select'), 'PDF should contain Select hint for multi-select');
      assert.ok(text.includes('TWO'), 'PDF should contain TWO for 2-answer multi-select');
    });

    it('includes explanations when includeAnswers is true', async () => {
      const buf = await exportExam('NCP-AI 6.10', [singleQ], true, undefined, NO_COMPRESS);
      const text = extractPdfText(buf);
      assert.ok(text.includes('passthrough'), 'PDF should contain explanation text');
    });

    it('does NOT include answer markers when includeAnswers is false', async () => {
      const buf = await exportExam('NCP-AI 6.10', [singleQ], false, undefined, NO_COMPRESS);
      const text = extractPdfText(buf);
      // Check the decoded hex text only (not raw metadata)
      const raw = buf.toString('binary');
      const hexRuns = raw.matchAll(/<([0-9a-fA-F]+)>/g);
      let decoded = '';
      for (const m of hexRuns) decoded += Buffer.from(m[1], 'hex').toString('binary');
      assert.ok(!decoded.includes('Answer:'), 'PDF should not contain "Answer:" when answers excluded');
    });

    it('writes a valid PDF file when outputPath is provided', async () => {
      const outFile = path.join(__dirname, '_test_output_exam.pdf');
      tempFiles.push(outFile);

      const buf = await exportExam('NCP-AI 6.10', fixtures, true, outFile, NO_COMPRESS);
      assert.ok(fs.existsSync(outFile), 'Output file should exist');

      const ondisk = fs.readFileSync(outFile);
      assert.equal(ondisk.length, buf.length, 'File size should match buffer size');

      const magic = ondisk.subarray(0, 5).toString('ascii');
      assert.equal(magic, '%PDF-', 'File should start with %PDF-');
    });
  });

  describe('exportAll()', () => {

    it('produces a combined PDF with multiple exams', async () => {
      const exams = {
        'NCP-AI 6.10': [singleQ],
        'NCP-US 6.10': [multiQ],
      };
      const buf = await exportAll(exams, true, undefined, NO_COMPRESS);
      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 1000, 'Combined PDF should be reasonably large');

      const text = extractPdfText(buf);
      assert.ok(text.includes('NCP-AI'), 'Should contain first exam name');
      assert.ok(text.includes('NCP-US'), 'Should contain second exam name');
    });

    it('writes combined PDF to disk', async () => {
      const outFile = path.join(__dirname, '_test_output_all.pdf');
      tempFiles.push(outFile);

      const exams = { 'NCP-AI 6.10': fixtures };
      await exportAll(exams, false, outFile, NO_COMPRESS);

      assert.ok(fs.existsSync(outFile), 'Combined PDF file should exist');
      const magic = fs.readFileSync(outFile).subarray(0, 5).toString('ascii');
      assert.equal(magic, '%PDF-');
    });
  });
});
