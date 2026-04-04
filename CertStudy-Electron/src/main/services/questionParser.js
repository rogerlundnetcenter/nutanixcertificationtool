// questionParser.js — Port of C# CertStudy.Services.QuestionParser
// Parses Markdown exam files into Question objects using a line-by-line state machine.
// Pure Node.js module — no Electron dependencies.

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Regex patterns (mirrors C# QuestionParser) ────────────────────────────

/** Matches `### Q1` or `### Q42.` style question headers */
const QUESTION_HEADER_RX = /^###\s+Q(\d+)/;

/** Matches `## Domain 3` or `## DOMAIN 1` (case-insensitive) */
const DOMAIN_HEADER_RX = /^##\s+(?:DOMAIN|Domain)\s*(\d+)/i;

/** Matches `- A) Some answer text` through `- F)` */
const OPTION_RX = /^-\s+([A-F])\)\s+(.*)/;

/** Matches `**Answer: A**`, `**Answer: A, C**`, `**Answer: B and D**`, `**Correct Answer: B**` */
const ANSWER_RX = /^\*\*(?:Correct\s+)?Answer:\s*([A-F](?:[,\s]+(?:and\s+)?[A-F])*)\*\*/;

// ─── DeriveExamCode ─────────────────────────────────────────────────────────

/**
 * Extracts the exam code from a filename.
 * Uses exact segment matching to avoid the C# `.Contains("AI")` bug
 * that would incorrectly match "MAIN".
 *
 * @param {string} fileName — e.g. "NCP-US-Part1.md"
 * @returns {string} Exam code, e.g. "NCP-US"
 */
function deriveExamCode(fileName) {
  const name = path.parse(fileName).name; // strip extension
  const parts = name.split('-');
  if (parts.length >= 2) {
    const code = `${parts[0]}-${parts[1]}`;
    // Validate against known exact exam prefixes to avoid false matches
    const knownPrefixes = ['NCP-US', 'NCP-CI', 'NCP-AI', 'NCM-MCI'];
    const upper = code.toUpperCase();
    for (const prefix of knownPrefixes) {
      if (upper === prefix) return prefix;
    }
    return code;
  }
  return name;
}

// ─── Domain header description extraction ───────────────────────────────────

/**
 * Extracts domain description from the remainder of a domain header line.
 * Handles both colon-separated and em-dash/hyphen-separated formats:
 *   - `## Domain 1: Storage Performance (Q1–Q40)`
 *   - `## Domain 1 — Deploy NAI Environment (Q1–Q40)`
 *
 * @param {string} line — Full header line
 * @param {RegExpExecArray} dm — Domain header regex match
 * @returns {string} Domain label, e.g. "Domain 1: Storage Performance"
 */
function parseDomainLabel(line, dm) {
  let domain = `Domain ${dm[1]}`;

  const colonIdx = line.indexOf(':');
  if (colonIdx >= 0) {
    const parenIdx = line.indexOf('(', colonIdx);
    const desc = parenIdx > colonIdx
      ? line.slice(colonIdx + 1, parenIdx).trim()
      : line.slice(colonIdx + 1).trim();
    if (desc) domain += `: ${desc}`;
  } else {
    // Try em-dash or hyphen separator after the domain number
    let dashIdx = line.indexOf('\u2014'); // em-dash —
    if (dashIdx < 0) {
      const numEnd = line.indexOf(dm[1]) + dm[1].length;
      dashIdx = line.indexOf('-', numEnd);
    }
    if (dashIdx > 0) {
      const parenIdx = line.indexOf('(', dashIdx);
      const desc = parenIdx > dashIdx
        ? line.slice(dashIdx + 1, parenIdx).trim()
        : line.slice(dashIdx + 1).trim();
      if (desc) domain += `: ${desc}`;
    }
  }

  return domain;
}

// ─── ParseFile ──────────────────────────────────────────────────────────────

/**
 * Parses a single Markdown exam file into an array of question objects.
 *
 * @param {string} filePath — Absolute or relative path to the .md file
 * @returns {Array<{
 *   id: number,
 *   examCode: string,
 *   domain: string,
 *   questionText: string,
 *   options: Array<{letter: string, text: string, isCorrect: boolean}>,
 *   correctAnswers: string[],
 *   explanation: string,
 *   sourceFile: string,
 *   isMultiSelect: boolean
 * }>} Parsed questions (malformed entries are skipped with a warning)
 */
function parseFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.warn(`[QuestionParser] Cannot read file: ${filePath} — ${err.message}`);
    return [];
  }

  const lines = content.split(/\r?\n/);
  const examCode = deriveExamCode(path.basename(filePath));
  const questions = [];
  let currentDomain = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // ── Domain header ──
    const dm = DOMAIN_HEADER_RX.exec(line);
    if (dm) {
      currentDomain = parseDomainLabel(line, dm);
      i++;
      continue;
    }

    // ── Question header ──
    const qm = QUESTION_HEADER_RX.exec(line);
    if (qm) {
      const q = {
        id: parseInt(qm[1], 10),
        examCode,
        domain: currentDomain || examCode,
        questionText: '',
        options: [],
        correctAnswers: [],
        explanation: '',
        sourceFile: path.basename(filePath),
        get isMultiSelect() { return this.correctAnswers.length > 1; },
      };

      i++;

      // ── Collect stem (question text) — may span multiple lines ──
      const stemLines = [];
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        if (OPTION_RX.test(l)) break;
        if (QUESTION_HEADER_RX.test(l)) break;
        if (ANSWER_RX.test(l)) break;
        stemLines.push(l);
        i++;
      }
      q.questionText = stemLines.join('\n').trim();

      // ── Collect answer options (with multi-line continuation) ──
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        const om = OPTION_RX.exec(l);
        if (!om) break;

        let optText = om[2].trim();
        i++;

        // Multi-line option continuation
        while (i < lines.length) {
          const next = lines[i].trimEnd();
          if (!next) break;
          if (OPTION_RX.test(next)) break;
          if (ANSWER_RX.test(next)) break;
          if (QUESTION_HEADER_RX.test(next)) break;
          if (next.startsWith('---')) break;
          optText += ' ' + next.trim();
          i++;
        }

        q.options.push({ letter: om[1], text: optText, isCorrect: false });
      }

      // ── Skip blank lines before answer ──
      while (i < lines.length && !lines[i].trim()) i++;

      // ── Answer line ──
      if (i < lines.length) {
        const am = ANSWER_RX.exec(lines[i].trimEnd());
        if (am) {
          const raw = am[1].replace(/\band\b/gi, '').replace(/[,\s]/g, '');
          q.correctAnswers = raw.split('');
          // Mark correct options
          for (const opt of q.options) {
            opt.isCorrect = q.correctAnswers.includes(opt.letter);
          }
          i++;
        }
      }

      // ── Collect explanation ──
      const explLines = [];
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        if (l.startsWith('---')) { i++; break; }
        if (QUESTION_HEADER_RX.test(l)) break;
        if (DOMAIN_HEADER_RX.test(l)) break;
        explLines.push(l);
        i++;
      }
      q.explanation = explLines.join('\n').trim();

      // Only add well-formed questions (has options + correct answers)
      if (q.options.length > 0 && q.correctAnswers.length > 0) {
        questions.push(q);
      } else {
        console.warn(
          `[QuestionParser] Skipping malformed Q${q.id} in ${q.sourceFile}: ` +
          `${q.options.length} options, ${q.correctAnswers.length} answers`
        );
      }

      continue;
    }

    i++;
  }

  return questions;
}

// ─── LoadAllExams ───────────────────────────────────────────────────────────

/**
 * Scans a directory for exam .md files, parses each, and groups by exam code.
 *
 * @param {string} directory — Path to the directory containing .md files
 * @returns {Object<string, Array>} Map of examCode → question arrays
 */
function loadAllExams(directory) {
  const exams = {};
  const prefixes = ['NCP-US', 'NCP-CI', 'NCP-AI', 'NCM-MCI'];

  let files;
  try {
    files = fs.readdirSync(directory).filter(f =>
      f.endsWith('.md') && prefixes.some(p => f.startsWith(p))
    );
  } catch (err) {
    console.warn(`[QuestionParser] Cannot read directory: ${directory} — ${err.message}`);
    return exams;
  }

  for (const file of files) {
    try {
      const questions = parseFile(path.join(directory, file));
      const code = deriveExamCode(file);
      if (!exams[code]) exams[code] = [];
      exams[code].push(...questions);
    } catch (err) {
      console.warn(`[QuestionParser] Error parsing ${file}: ${err.message}`);
    }
  }

  return exams;
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = { parseFile, loadAllExams, deriveExamCode };
