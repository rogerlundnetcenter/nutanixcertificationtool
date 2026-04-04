// shared/models.js — Data models for CertStudy Electron app
// Mirrors C# models from CertStudy WinForms (Models/ and Services/)

// ─── Exam Code Constants ────────────────────────────────────────────────────

/** @enum {string} Canonical exam code identifiers */
export const ExamCodes = Object.freeze({
  NCM_MCI: 'NCM-MCI',
  NCP_CI: 'NCP-CI',
  NCP_US: 'NCP-US',
  NCP_AI: 'NCP-AI',
});

// ─── normalizeExamCode ──────────────────────────────────────────────────────

/**
 * Normalises an exam code string to one of the canonical {@link ExamCodes}.
 *
 * The C# version uses `.Contains("AI")` which incorrectly matches strings
 * like "MAIN". This implementation uses word-boundary matching instead.
 *
 * @param {string} code — Raw exam code (e.g. "NCP-AI", "ncp ai", "NCM-MCI-Part2")
 * @returns {string|null} Canonical exam code or null if unrecognised
 */
export function normalizeExamCode(code) {
  if (!code || typeof code !== 'string') return null;
  const key = code.replace(/[\s-]+/g, '').toUpperCase();

  // Order matters: check the most specific tokens first.
  // Use word-boundary-safe matching — test isolated segments so that
  // "MAIN" does not accidentally match "AI".
  if (/(?:^|[^A-Z])AI(?:$|[^A-Z])/.test(key) || key.startsWith('NCPAI')) return ExamCodes.NCP_AI;
  if (/(?:^|[^A-Z])US(?:$|[^A-Z])/.test(key) || key.startsWith('NCPUS')) return ExamCodes.NCP_US;
  if (/(?:^|[^A-Z])CI(?:$|[^A-Z])/.test(key) || key.startsWith('NCPCI')) return ExamCodes.NCP_CI;
  if (/MCI|MCM|NCM/.test(key)) return ExamCodes.NCM_MCI;

  return null;
}

// ─── AnswerOption ───────────────────────────────────────────────────────────

/**
 * A single answer choice within a question.
 * Mirrors C# CertStudy.Models.AnswerOption.
 */
export class AnswerOption {
  /**
   * @param {object} opts
   * @param {string} opts.letter — Option letter, e.g. "A"
   * @param {string} opts.text   — Option body text
   * @param {boolean} [opts.isCorrect=false] — Whether this is a correct answer
   */
  constructor({ letter = '', text = '', isCorrect = false } = {}) {
    /** @type {string} */
    this.letter = letter;
    /** @type {string} */
    this.text = text;
    /** @type {boolean} */
    this.isCorrect = isCorrect;
  }
}

// ─── Question ───────────────────────────────────────────────────────────────

/**
 * A single exam question.
 * Mirrors C# CertStudy.Models.Question.
 */
export class Question {
  /**
   * @param {object} opts
   * @param {number}         opts.id             — Question number within its file
   * @param {string}         opts.examCode       — Canonical exam code (e.g. "NCP-AI")
   * @param {string}         opts.domain         — Domain / section label
   * @param {string}         opts.questionText   — The question stem
   * @param {AnswerOption[]} opts.options         — Answer choices
   * @param {string[]}       opts.correctAnswers  — Letters of correct answers (e.g. ["A","C"])
   * @param {string}         opts.explanation     — Explanation text (may contain markdown)
   * @param {string}         opts.sourceFile      — Originating markdown filename
   */
  constructor({
    id = 0,
    examCode = '',
    domain = '',
    questionText = '',
    options = [],
    correctAnswers = [],
    explanation = '',
    sourceFile = '',
  } = {}) {
    /** @type {number} */
    this.id = id;
    /** @type {string} */
    this.examCode = examCode;
    /** @type {string} */
    this.domain = domain;
    /** @type {string} */
    this.questionText = questionText;
    /** @type {AnswerOption[]} */
    this.options = options;
    /** @type {string[]} */
    this.correctAnswers = correctAnswers;
    /** @type {string} */
    this.explanation = explanation;
    /** @type {string} */
    this.sourceFile = sourceFile;
  }

  /** True when more than one correct answer exists. */
  get isMultiSelect() {
    return this.correctAnswers.length > 1;
  }
}

// ─── BlueprintObjective ─────────────────────────────────────────────────────

/**
 * A single learning objective inside a blueprint section.
 * Mirrors C# CertStudy.Models.BlueprintObjective.
 */
export class BlueprintObjective {
  /**
   * @param {object} opts
   * @param {string}   opts.id          — Objective identifier (e.g. "1.1", "2.3")
   * @param {string}   opts.title       — Short title / description
   * @param {string[]} opts.knowledge   — Knowledge area bullet points
   * @param {string[]} opts.references  — Reference links or descriptions
   * @param {string[]} opts.keywords    — Keywords used for question mapping
   */
  constructor({
    id = '',
    title = '',
    knowledge = [],
    references = [],
    keywords = [],
  } = {}) {
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.title = title;
    /** @type {string[]} */
    this.knowledge = knowledge;
    /** @type {string[]} */
    this.references = references;
    /** @type {string[]} */
    this.keywords = keywords;
  }
}

// ─── BlueprintSection ───────────────────────────────────────────────────────

/**
 * A numbered section (domain) within an exam blueprint.
 * Mirrors C# CertStudy.Models.BlueprintSection.
 */
export class BlueprintSection {
  /**
   * @param {object} opts
   * @param {string}               opts.examCode       — Owning exam code
   * @param {number}               opts.sectionNumber  — 1-based section index
   * @param {string}               opts.name           — Section title
   * @param {BlueprintObjective[]} opts.objectives     — Objectives in this section
   */
  constructor({
    examCode = '',
    sectionNumber = 0,
    name = '',
    objectives = [],
  } = {}) {
    /** @type {string} */
    this.examCode = examCode;
    /** @type {number} */
    this.sectionNumber = sectionNumber;
    /** @type {string} */
    this.name = name;
    /** @type {BlueprintObjective[]} */
    this.objectives = objectives;
  }
}

// ─── ExamBlueprint (Blueprint) ──────────────────────────────────────────────

/**
 * Top-level exam blueprint containing metadata and sections.
 * Mirrors C# CertStudy.Models.ExamBlueprint.
 */
export class Blueprint {
  /**
   * @param {object} opts
   * @param {string}             opts.examCode         — Canonical exam code
   * @param {string}             opts.examName         — Full exam title
   * @param {number}             opts.questionCount    — Number of questions on the exam
   * @param {number}             opts.timeLimitMinutes — Exam time limit in minutes
   * @param {string}             opts.passingScore     — Passing score description
   * @param {BlueprintSection[]} opts.sections         — Ordered list of sections
   */
  constructor({
    examCode = '',
    examName = '',
    questionCount = 0,
    timeLimitMinutes = 0,
    passingScore = '',
    sections = [],
  } = {}) {
    /** @type {string} */
    this.examCode = examCode;
    /** @type {string} */
    this.examName = examName;
    /** @type {number} */
    this.questionCount = questionCount;
    /** @type {number} */
    this.timeLimitMinutes = timeLimitMinutes;
    /** @type {string} */
    this.passingScore = passingScore;
    /** @type {BlueprintSection[]} */
    this.sections = sections;
  }
}

// ─── SectionCoverage ────────────────────────────────────────────────────────

/**
 * Coverage statistics for a single blueprint section.
 * Used as an element in {@link CoverageResult.sectionBreakdown}.
 */
export class SectionCoverage {
  /**
   * @param {object} opts
   * @param {string} opts.sectionName      — Section title
   * @param {number} opts.totalObjectives  — Number of objectives in the section
   * @param {number} opts.coveredObjectives — Objectives matched by ≥ 1 question
   * @param {number} opts.questionCount    — Total questions mapped to the section
   * @param {number} opts.coveragePercent  — 0–100 coverage percentage
   */
  constructor({
    sectionName = '',
    totalObjectives = 0,
    coveredObjectives = 0,
    questionCount = 0,
    coveragePercent = 0,
  } = {}) {
    /** @type {string} */
    this.sectionName = sectionName;
    /** @type {number} */
    this.totalObjectives = totalObjectives;
    /** @type {number} */
    this.coveredObjectives = coveredObjectives;
    /** @type {number} */
    this.questionCount = questionCount;
    /** @type {number} */
    this.coveragePercent = coveragePercent;
  }
}

// ─── CoverageResult ─────────────────────────────────────────────────────────

/**
 * Aggregate coverage result for an exam blueprint.
 * Wraps the per-objective counts from BlueprintService.CalculateCoverage
 * with an overall percentage and per-section breakdown.
 */
export class CoverageResult {
  /**
   * @param {object} opts
   * @param {string}            opts.examCode           — Exam that was analysed
   * @param {number}            opts.overallPercent      — 0–100 overall coverage
   * @param {number}            opts.totalObjectives     — Total objectives in the blueprint
   * @param {number}            opts.coveredObjectives   — Objectives matched by ≥ 1 question
   * @param {SectionCoverage[]} opts.sectionBreakdown    — Per-section stats
   * @param {Object<string,number>} opts.objectiveCounts — objectiveId → question count
   */
  constructor({
    examCode = '',
    overallPercent = 0,
    totalObjectives = 0,
    coveredObjectives = 0,
    sectionBreakdown = [],
    objectiveCounts = {},
  } = {}) {
    /** @type {string} */
    this.examCode = examCode;
    /** @type {number} */
    this.overallPercent = overallPercent;
    /** @type {number} */
    this.totalObjectives = totalObjectives;
    /** @type {number} */
    this.coveredObjectives = coveredObjectives;
    /** @type {SectionCoverage[]} */
    this.sectionBreakdown = sectionBreakdown;
    /** @type {Object<string,number>} */
    this.objectiveCounts = objectiveCounts;
  }
}
