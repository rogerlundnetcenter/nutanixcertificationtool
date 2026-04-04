// quiz-app.js — Complete CertStudy quiz application
// Port of C# MainForm.cs (1,553 LOC) to browser JS for Electron renderer.
// All IPC via window.certStudy (exposed by preload.js contextBridge).

'use strict';

// ─── State ──────────────────────────────────────────────────────────────────
const state = {
  exams: {},                    // examCode → Question[]
  currentExam: '',
  currentQuestions: [],
  currentIndex: 0,
  submitted: false,
  selectedAnswers: new Set(),
  displayOptions: [],           // shuffled options for current question

  // Stats
  totalAnswered: 0,
  totalCorrect: 0,
  streak: 0,
  domainStats: {},              // domain → { answered, correct }
  wrongAnswers: new Set(),      // "EXAM-Q123" keys

  // Modes
  randomizeAnswers: true,
  testMode: false,
  testTotal: 75,
  reviewingMistakes: false,
  showBlueprint: false,

  // Exam Simulator
  examSimMode: false,
  examSimWrongKeys: [],

  // Timer
  timerInterval: null,
  timerSeconds: 0,
};

// ─── DOM References ─────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  versionLabel: $('#version-label'),
  examButtons: $('#exam-buttons'),
  quizRoot: $('#quiz-root'),
  labFrame: $('#lab-frame'),
  examTitle: $('#exam-title'),
  timerDisplay: $('#timer-display'),
  timerValue: $('#timer-value'),
  progressFill: $('#progress-fill'),
  progressLabel: $('#progress-label'),
  questionPanel: $('#question-panel'),
  stem: $('#stem'),
  optionsContainer: $('#options-container'),
  feedback: $('#feedback'),
  submitBtn: $('#submit-btn'),
  nextBtn: $('#next-btn'),
  prevBtn: $('#prev-btn'),
  skipBtn: $('#skip-btn'),
  blueprintPanel: $('#blueprint-panel'),
  blueprintBtn: $('#blueprint-btn'),
  emptyState: $('#empty-state'),
  explainSidebar: $('#explain-sidebar'),
  explanationContent: $('#explanation-content'),
  exportBtn: $('#export-btn'),
  exportMenu: $('#export-menu'),
  examSimBtn: $('#exam-sim-btn'),
  reviewBtn: $('#review-btn'),
  resetBtn: $('#reset-btn'),
  labBtn: $('#lab-btn'),
  randomizeCheck: $('#randomize-check'),
  statScore: $('#stat-score'),
  statStreak: $('#stat-streak'),
  statWrong: $('#stat-wrong'),
  domainStats: $('#domain-stats'),
  toastContainer: $('#toast-container'),
  examModal: $('#exam-modal'),
  modalTitle: $('#modal-title'),
  modalBody: $('#modal-body'),
  modalClose: $('#modal-close'),
};

// ─── Init ───────────────────────────────────────────────────────────────────

async function init() {
  try {
    const version = await window.certStudy.app.getVersion();
    dom.versionLabel.textContent = `v${version.app} · ${version.platform}`;
  } catch { /* not critical */ }

  wireEvents();
  await loadExams();
}

async function loadExams() {
  try {
    const loaded = await window.certStudy.quiz.loadExams();
    if (!loaded || Object.keys(loaded).length === 0) {
      dom.emptyState.querySelector('h3').textContent = 'No exam files found';
      dom.emptyState.querySelector('p').textContent =
        'Place Nutanix .md question files in the application directory or choose a data folder.';
      return;
    }
    state.exams = loaded;
    populateExamButtons();
  } catch (err) {
    toast(`Failed to load exams: ${err.message}`, 'error');
  }
}

function populateExamButtons() {
  dom.examButtons.innerHTML = '';
  const codes = Object.keys(state.exams).sort();

  for (const code of codes) {
    const count = state.exams[code].length;
    const btn = document.createElement('button');
    btn.className = 'btn btn--exam';
    btn.dataset.exam = code;
    btn.textContent = `${code} (${count})`;
    btn.addEventListener('click', () => {
      stopTimer();
      state.examSimMode = false;
      state.reviewingMistakes = false;
      dom.reviewBtn.textContent = '❌ Review Mistakes';
      selectExam(code);
    });
    dom.examButtons.appendChild(btn);
  }

  // Auto-select first exam
  if (codes.length > 0) {
    selectExam(codes[0]);
  }
}

// ─── Events ─────────────────────────────────────────────────────────────────

function wireEvents() {
  dom.submitBtn.addEventListener('click', submitAnswer);
  dom.nextBtn.addEventListener('click', navigateNext);
  dom.prevBtn.addEventListener('click', navigatePrev);
  dom.skipBtn.addEventListener('click', navigateNext);
  dom.resetBtn.addEventListener('click', resetStats);
  dom.blueprintBtn.addEventListener('click', toggleBlueprint);
  dom.exportBtn.addEventListener('click', toggleExportMenu);
  dom.examSimBtn.addEventListener('click', startExamSim);
  dom.reviewBtn.addEventListener('click', reviewMistakes);
  dom.labBtn.addEventListener('click', () => switchTab('lab'));
  dom.modalClose.addEventListener('click', () => dom.examModal.style.display = 'none');

  dom.randomizeCheck.addEventListener('change', () => {
    state.randomizeAnswers = dom.randomizeCheck.checked;
  });

  // Mode radios
  for (const radio of $$('input[name="mode"]')) {
    radio.addEventListener('change', () => {
      setMode(radio.value === 'test');
    });
  }

  // Tab switching
  for (const tab of $$('.tab')) {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  }

  // Export menu items
  for (const item of $$('.export-menu__item')) {
    item.addEventListener('click', () => handleExport(item.dataset.action));
  }

  // Close export menu on outside click
  document.addEventListener('click', (e) => {
    if (!dom.exportMenu.contains(e.target) && e.target !== dom.exportBtn) {
      dom.exportMenu.style.display = 'none';
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
  // Don't handle if modal is open or no questions loaded
  if (dom.examModal.style.display !== 'none') {
    if (e.key === 'Escape' || e.key === 'Enter') dom.examModal.style.display = 'none';
    return;
  }
  if (state.currentQuestions.length === 0) return;

  // Don't capture when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case '1': case '2': case '3': case '4': case '5': case '6':
      toggleOption(parseInt(e.key) - 1);
      e.preventDefault();
      break;
    case 'Enter':
      if (!state.submitted) submitAnswer();
      else navigateNext();
      e.preventDefault();
      break;
    case 'n': case 'N':
      navigateNext();
      e.preventDefault();
      break;
    case 'p': case 'P':
      navigatePrev();
      e.preventDefault();
      break;
    case 'b': case 'B':
      toggleBlueprint();
      e.preventDefault();
      break;
    case 's': case 'S':
      if (!state.submitted) submitAnswer();
      e.preventDefault();
      break;
    case 'Escape':
      dom.exportMenu.style.display = 'none';
      break;
  }
}

// ─── Tab Switching ──────────────────────────────────────────────────────────

function switchTab(tab) {
  for (const t of $$('.tab')) {
    t.classList.toggle('active', t.dataset.tab === tab);
  }

  if (tab === 'quiz') {
    dom.quizRoot.classList.add('active');
    dom.quizRoot.style.display = '';
    dom.labFrame.style.display = 'none';
  } else if (tab === 'lab') {
    dom.quizRoot.classList.remove('active');
    dom.quizRoot.style.display = 'none';
    dom.labFrame.style.display = '';
    // Load lab iframe source on first switch
    if (!dom.labFrame.src || dom.labFrame.src === 'about:blank') {
      dom.labFrame.src = 'certstudy-lab://lab/index.html';
    }
  }
}

// ─── Exam Selection ─────────────────────────────────────────────────────────

function selectExam(examCode) {
  if (!state.exams[examCode]) return;

  state.currentExam = examCode;
  const questions = state.exams[examCode];

  if (state.testMode || state.examSimMode) {
    // Random subset for test mode
    state.currentQuestions = shuffle([...questions]).slice(0, state.testTotal);
  } else {
    state.currentQuestions = [...questions];
  }

  state.currentIndex = 0;
  state.submitted = false;
  state.selectedAnswers.clear();

  // Highlight active button
  for (const btn of dom.examButtons.querySelectorAll('.btn--exam')) {
    btn.classList.toggle('active', btn.dataset.exam === examCode);
  }

  dom.emptyState.style.display = 'none';
  dom.questionPanel.style.display = '';

  if (state.showBlueprint) {
    refreshBlueprint();
  } else {
    showQuestion();
  }

  if (state.testMode || state.examSimMode) {
    startTimer();
  }

  updateNavButtons();
}

// ─── Show Question ──────────────────────────────────────────────────────────

function showQuestion() {
  if (state.currentQuestions.length === 0) return;
  const q = state.currentQuestions[state.currentIndex];

  // Hide blueprint, show question
  dom.blueprintPanel.style.display = 'none';
  dom.questionPanel.style.display = '';
  state.showBlueprint = false;
  dom.blueprintBtn.textContent = '📋 Blueprint Coverage';

  // Header
  const label = state.reviewingMistakes ? 'Review Mistakes' : state.currentExam;
  dom.examTitle.textContent = `${label} — Question ${state.currentIndex + 1} of ${state.currentQuestions.length}`;

  // Progress
  const pct = ((state.currentIndex + 1) / state.currentQuestions.length) * 100;
  dom.progressFill.style.width = `${pct}%`;
  const domain = q.domain || '';
  dom.progressLabel.textContent = `${state.currentIndex + 1}/${state.currentQuestions.length}  •  ${domain}`;

  // Stem
  const multiHint = q.isMultiSelect ? '  [Select ALL that apply]' : '';
  dom.stem.textContent = `Q${q.id}: ${q.questionText}${multiHint}`;

  // Shuffle options
  const options = q.options || [];
  state.displayOptions = state.randomizeAnswers ? shuffle([...options]) : [...options];

  // Build option cards
  buildOptions(q);

  // Reset feedback
  dom.feedback.className = 'feedback';
  dom.feedback.textContent = '';
  state.submitted = false;
  state.selectedAnswers.clear();

  // Reset explanation
  dom.explanationContent.innerHTML = '<p class="explain-placeholder">Submit an answer to see the explanation and reference material.</p>';

  updateNavButtons();
}

function buildOptions(q) {
  dom.optionsContainer.innerHTML = '';

  state.displayOptions.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.tabIndex = 0;
    card.dataset.index = idx;
    card.dataset.letter = opt.letter;

    const indicator = document.createElement('div');
    indicator.className = 'option-indicator';
    indicator.textContent = opt.letter;

    const text = document.createElement('div');
    text.className = 'option-text';
    text.textContent = opt.text;

    card.appendChild(indicator);
    card.appendChild(text);

    card.addEventListener('click', () => toggleOption(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOption(idx);
      }
    });

    dom.optionsContainer.appendChild(card);
  });
}

function toggleOption(idx) {
  if (state.submitted || idx < 0 || idx >= state.displayOptions.length) return;
  const q = state.currentQuestions[state.currentIndex];
  const letter = state.displayOptions[idx].letter;
  const cards = dom.optionsContainer.querySelectorAll('.option-card');

  if (q.isMultiSelect) {
    if (state.selectedAnswers.has(letter)) {
      state.selectedAnswers.delete(letter);
      cards[idx].classList.remove('selected');
    } else {
      state.selectedAnswers.add(letter);
      cards[idx].classList.add('selected');
    }
  } else {
    state.selectedAnswers.clear();
    state.selectedAnswers.add(letter);
    cards.forEach((c, i) => c.classList.toggle('selected', i === idx));
  }
}

// ─── Submit & Scoring ───────────────────────────────────────────────────────

function submitAnswer() {
  if (state.submitted || state.currentQuestions.length === 0 || state.selectedAnswers.size === 0) return;

  state.submitted = true;
  const q = state.currentQuestions[state.currentIndex];
  const correct = new Set((q.correctAnswers || []).map(a => a.toUpperCase()));
  const selected = new Set([...state.selectedAnswers].map(a => a.toUpperCase()));
  const isCorrect = setsEqual(selected, correct);

  // Update stats
  state.totalAnswered++;
  if (isCorrect) {
    state.totalCorrect++;
    state.streak++;
  } else {
    state.streak = 0;
    const wrongKey = `${state.currentExam}-Q${q.id}`;
    state.wrongAnswers.add(wrongKey);
    if (state.examSimMode) {
      state.examSimWrongKeys.push(wrongKey);
    }
  }

  // Domain stats
  const domain = q.domain || 'Unknown';
  if (!state.domainStats[domain]) state.domainStats[domain] = { answered: 0, correct: 0 };
  state.domainStats[domain].answered++;
  if (isCorrect) state.domainStats[domain].correct++;

  // Color the options
  const cards = dom.optionsContainer.querySelectorAll('.option-card');
  cards.forEach((card, i) => {
    const letter = state.displayOptions[i].letter.toUpperCase();
    card.classList.add('locked');
    if (correct.has(letter)) {
      card.classList.add('correct');
    } else if (selected.has(letter)) {
      card.classList.add('incorrect');
    }
  });

  // Feedback
  if (state.testMode && !state.examSimMode) {
    // In test mode, don't reveal answers
    dom.feedback.className = 'feedback';
    dom.feedback.textContent = '';
  } else {
    const correctLetters = [...correct].sort().join(', ');
    if (isCorrect) {
      dom.feedback.className = 'feedback correct';
      dom.feedback.textContent = `✅ Correct! ${correctLetters} is right.`;
    } else {
      dom.feedback.className = 'feedback incorrect';
      dom.feedback.textContent = `❌ Incorrect. Correct answer: ${correctLetters}`;
    }
  }

  showExplanation(q);
  updateStats();
  updateNavButtons();

  // Enable review button if we have wrong answers
  const wrongForExam = [...state.wrongAnswers].filter(k => k.startsWith(state.currentExam + '-')).length;
  dom.reviewBtn.disabled = wrongForExam === 0;

  // Auto-advance in test mode after brief delay
  if (state.testMode) {
    setTimeout(() => {
      if (state.submitted) navigateNext();
    }, 400);
  }
}

// ─── Explanation Panel ──────────────────────────────────────────────────────

async function showExplanation(q) {
  const content = dom.explanationContent;
  content.innerHTML = '';

  // Blueprint objectives
  try {
    const qText = q.questionText + ' ' + (q.options || []).map(o => o.text).join(' ');
    const objectives = await window.certStudy.quiz.getObjectivesForQuestion(state.currentExam, qText);
    if (objectives && objectives.length > 0) {
      content.innerHTML += `
        <h4>📋 Blueprint Objectives</h4>
        <ul class="explain-list">
          ${objectives.slice(0, 3).map(o => `<li><strong>${o.objId}:</strong> ${o.objTitle}</li>`).join('')}
        </ul>`;
    }
  } catch { /* non-critical */ }

  // Explanation text
  const explanation = q.explanation || '(No explanation provided)';
  content.innerHTML += `<h4>💡 Explanation</h4><p>${escapeHtml(explanation)}</p>`;

  // References
  try {
    const ref = await window.certStudy.quiz.getReferences(state.currentExam, q.questionText);
    if (ref) {
      content.innerHTML += `<h4>📚 Reference Material</h4><p>${escapeHtml(ref)}</p>`;
    }
  } catch { /* non-critical */ }

  // KB Links
  try {
    const links = await window.certStudy.quiz.getKBLinks(state.currentExam, q.questionText);
    if (links && links.length > 0) {
      content.innerHTML += `
        <h4>📖 Documentation</h4>
        <ul class="explain-links">
          ${links.map(l => `<li><strong>${escapeHtml(l.title)}</strong><br><a href="#" data-url="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a></li>`).join('')}
        </ul>`;
    }
  } catch { /* non-critical */ }

  // General resources
  try {
    const resources = await window.certStudy.quiz.getGeneralResources(state.currentExam);
    if (resources && resources.length > 0) {
      content.innerHTML += `
        <h4>🔗 General Resources</h4>
        <ul class="explain-links">
          ${resources.map(r => `<li><a href="#" data-url="${escapeHtml(r.url)}">${escapeHtml(r.title)}</a></li>`).join('')}
        </ul>`;
    }
  } catch { /* non-critical */ }

  // Wire up links to open externally
  content.querySelectorAll('a[data-url]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // Open in default browser
      window.certStudy.fs.openExternal(a.dataset.url).catch(() => {});
    });
  });
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function navigateNext() {
  if (state.currentQuestions.length === 0) return;

  if (state.currentIndex < state.currentQuestions.length - 1) {
    state.currentIndex++;
    state.submitted = false;
    state.selectedAnswers.clear();
    showQuestion();
  } else if (state.testMode || state.examSimMode) {
    finishTest();
  }
}

function navigatePrev() {
  if (state.currentQuestions.length === 0 || state.currentIndex <= 0) return;
  state.currentIndex--;
  state.submitted = false;
  state.selectedAnswers.clear();
  showQuestion();
}

function updateNavButtons() {
  dom.prevBtn.disabled = state.currentIndex <= 0;
  dom.nextBtn.disabled = !state.submitted && !(state.testMode);
  dom.skipBtn.style.display = state.submitted ? 'none' : '';
  dom.submitBtn.disabled = state.submitted;
}

// ─── Stats ──────────────────────────────────────────────────────────────────

function updateStats() {
  const pct = state.totalAnswered > 0
    ? Math.round(100 * state.totalCorrect / state.totalAnswered)
    : 0;

  dom.statScore.textContent = `${state.totalCorrect}/${state.totalAnswered} (${pct}%)`;
  dom.statScore.style.color = pct >= 75 ? 'var(--sw-status-green)'
    : pct >= 50 ? 'var(--sw-status-amber)'
    : 'var(--sw-status-red)';

  dom.statStreak.textContent = state.streak;

  const wrongForExam = [...state.wrongAnswers].filter(k => k.startsWith(state.currentExam + '-')).length;
  dom.statWrong.textContent = wrongForExam;
  dom.statWrong.style.color = wrongForExam > 0 ? 'var(--sw-status-red)' : '';

  // Domain stats
  const entries = Object.entries(state.domainStats).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length > 0) {
    dom.domainStats.innerHTML = entries.map(([domain, s]) => {
      const dp = s.answered > 0 ? Math.round(100 * s.correct / s.answered) : 0;
      const name = domain.length > 35 ? domain.substring(0, 35) + '…' : domain;
      const color = dp >= 75 ? 'var(--sw-status-green)' : dp >= 50 ? 'var(--sw-status-amber)' : 'var(--sw-status-red)';
      return `<div class="domain-stat"><span>${escapeHtml(name)}</span><span style="color:${color}">${dp}%</span></div>`;
    }).join('');
  }
}

function resetStats() {
  state.totalAnswered = 0;
  state.totalCorrect = 0;
  state.streak = 0;
  state.domainStats = {};
  state.wrongAnswers.clear();
  state.examSimWrongKeys = [];

  dom.statScore.textContent = '0/0 (0%)';
  dom.statScore.style.color = '';
  dom.statStreak.textContent = '0';
  dom.statWrong.textContent = '0';
  dom.statWrong.style.color = '';
  dom.domainStats.innerHTML = '';
  dom.reviewBtn.disabled = true;

  toast('Stats reset', 'info');
}

// ─── Test Mode ──────────────────────────────────────────────────────────────

function setMode(test) {
  state.testMode = test;
  stopTimer();

  if (!state.testMode) {
    dom.timerDisplay.style.display = 'none';
  }

  // Re-select current exam with new mode
  if (state.currentExam) {
    selectExam(state.currentExam);
  }
}

function startTimer() {
  stopTimer();
  // NCM-MCI = 180 min, others = 120 min
  state.timerSeconds = state.currentExam.startsWith('NCM-MCI') ? 180 * 60 : 120 * 60;
  dom.timerDisplay.style.display = '';
  resetStats();
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerDisplay();
    if (state.timerSeconds <= 0) {
      finishTest();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  dom.timerDisplay.style.display = 'none';
  dom.timerDisplay.classList.remove('warning');
}

function updateTimerDisplay() {
  const min = Math.floor(state.timerSeconds / 60);
  const sec = state.timerSeconds % 60;
  dom.timerValue.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  if (state.timerSeconds <= 300) {
    dom.timerDisplay.classList.add('warning');
  }
}

function finishTest() {
  stopTimer();

  if (state.examSimMode) {
    const pointsPerQ = Math.floor(6000 / Math.max(1, state.testTotal));
    const score = state.totalCorrect * pointsPerQ;
    const passed = score >= 3000;

    let wrongSection = '';
    if (state.examSimWrongKeys.length > 0) {
      const shown = state.examSimWrongKeys.slice(0, 20);
      wrongSection = '<h4>Wrong Questions:</h4><ul>' + shown.map(k => `<li>${escapeHtml(k)}</li>`).join('') + '</ul>';
      if (state.examSimWrongKeys.length > 20) {
        wrongSection += `<p>... and ${state.examSimWrongKeys.length - 20} more</p>`;
      }
    } else {
      wrongSection = '<p>🎉 Perfect score!</p>';
    }

    showModal(
      passed ? '✅ EXAM PASSED' : '❌ EXAM FAILED',
      `<div class="exam-result ${passed ? 'passed' : 'failed'}">
        <p class="score-big">${score}/6000</p>
        <p>Correct: ${state.totalCorrect}/${state.totalAnswered}</p>
        <p>Pass threshold: 3000/6000</p>
        ${wrongSection}
      </div>`
    );

    state.examSimMode = false;
    state.testMode = false;
    document.querySelector('input[name="mode"][value="study"]').checked = true;
    return;
  }

  const pct = state.totalAnswered > 0 ? Math.round(100 * state.totalCorrect / state.totalAnswered) : 0;
  const passed = pct >= 75;

  showModal(
    passed ? '✅ Test Complete — PASSED' : '❌ Test Complete — FAILED',
    `<div class="exam-result ${passed ? 'passed' : 'failed'}">
      <p class="score-big">${pct}%</p>
      <p>Score: ${state.totalCorrect}/${state.totalAnswered}</p>
      <p>Passing score: 75%</p>
    </div>`
  );
}

// ─── Exam Simulator ─────────────────────────────────────────────────────────

function startExamSim() {
  if (!state.currentExam || !state.exams[state.currentExam]) return;

  state.examSimMode = true;
  state.examSimWrongKeys = [];
  state.reviewingMistakes = false;
  dom.reviewBtn.textContent = '❌ Review Mistakes';

  state.testMode = true;
  document.querySelector('input[name="mode"][value="test"]').checked = true;

  selectExam(state.currentExam);
  toast(`Exam simulation started: ${state.currentExam}`, 'info');
}

// ─── Review Mistakes ────────────────────────────────────────────────────────

function reviewMistakes() {
  if (state.reviewingMistakes) {
    state.reviewingMistakes = false;
    dom.reviewBtn.textContent = '❌ Review Mistakes';
    if (state.currentExam) selectExam(state.currentExam);
    return;
  }

  if (!state.currentExam) return;
  const allQuestions = state.exams[state.currentExam] || [];
  const wrongQuestions = allQuestions.filter(q =>
    state.wrongAnswers.has(`${state.currentExam}-Q${q.id}`)
  );

  if (wrongQuestions.length === 0) {
    toast('No wrong answers to review for this exam!', 'info');
    return;
  }

  state.reviewingMistakes = true;
  dom.reviewBtn.textContent = '↩ Back to All Questions';
  state.currentQuestions = wrongQuestions;
  state.currentIndex = 0;
  state.submitted = false;
  state.selectedAnswers.clear();

  dom.emptyState.style.display = 'none';
  dom.questionPanel.style.display = '';
  dom.examTitle.textContent = `${state.currentExam} — Review Mistakes (${wrongQuestions.length})`;

  showQuestion();
}

// ─── Blueprint ──────────────────────────────────────────────────────────────

async function toggleBlueprint() {
  state.showBlueprint = !state.showBlueprint;

  if (state.showBlueprint) {
    dom.questionPanel.style.display = 'none';
    dom.blueprintPanel.style.display = '';
    dom.blueprintBtn.textContent = '🎯 Back to Questions';
    dom.examTitle.textContent = `Blueprint Coverage — ${state.currentExam}`;
    await refreshBlueprint();
  } else {
    dom.blueprintPanel.style.display = 'none';
    dom.questionPanel.style.display = '';
    dom.blueprintBtn.textContent = '📋 Blueprint Coverage';
    if (state.currentQuestions.length > 0) showQuestion();
  }
}

async function refreshBlueprint() {
  if (!state.currentExam) return;

  try {
    const blueprint = await window.certStudy.quiz.getBlueprint(state.currentExam);
    if (!blueprint) {
      dom.blueprintPanel.innerHTML = '<p style="padding:20px;color:var(--sw-text-dim)">No blueprint available for this exam.</p>';
      return;
    }

    const questions = state.exams[state.currentExam] || [];
    const qTexts = questions.map(q => q.questionText + ' ' + (q.options || []).map(o => o.text).join(' '));
    const coverage = await window.certStudy.quiz.calculateCoverage(state.currentExam, qTexts);

    renderBlueprint(blueprint, coverage);
    renderBlueprintExplanation(blueprint, coverage);
  } catch (err) {
    dom.blueprintPanel.innerHTML = `<p style="padding:20px;color:var(--sw-status-red)">Error: ${escapeHtml(err.message)}</p>`;
  }
}

function renderBlueprint(blueprint, coverage) {
  const sections = blueprint.sections || [];
  const sectionBreakdown = coverage.sectionBreakdown || [];

  let html = `
    <div class="blueprint-header">
      <h3>${escapeHtml(blueprint.examName || state.currentExam)}</h3>
      <div class="blueprint-stats">
        <span class="blueprint-stat">${coverage.coveredObjectives || 0}/${coverage.totalObjectives || 0} objectives covered</span>
        <span class="blueprint-stat blueprint-stat--pct">${coverage.overallPercent || 0}%</span>
      </div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-bar__fill" style="width:${coverage.overallPercent || 0}%"></div>
      </div>
    </div>`;

  sections.forEach((section, si) => {
    const sc = sectionBreakdown[si] || {};
    const pct = sc.coveragePercent || 0;
    const color = pct >= 80 ? 'var(--sw-status-green)' : pct >= 50 ? 'var(--sw-status-amber)' : 'var(--sw-status-red)';

    html += `
      <div class="blueprint-section">
        <div class="blueprint-section__header">
          <h4>Section ${section.sectionNumber}: ${escapeHtml(section.name)}</h4>
          <span style="color:${color};font-weight:700">${pct}% (${sc.coveredObjectives || 0}/${sc.totalObjectives || 0})</span>
        </div>
        <div class="progress-bar" style="height:4px;margin:4px 0 8px">
          <div class="progress-bar__fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="blueprint-objectives">`;

    for (const obj of section.objectives || []) {
      const count = (coverage.objectiveCounts || {})[obj.id] || 0;
      const objColor = count > 0 ? 'var(--sw-status-green)' : 'var(--sw-status-red)';
      html += `
          <div class="blueprint-obj" data-obj-id="${obj.id}" style="cursor:pointer">
            <span class="blueprint-obj__id" style="color:${objColor}">${obj.id}</span>
            <span class="blueprint-obj__title">${escapeHtml(obj.title)}</span>
            <span class="blueprint-obj__count" style="color:${objColor}">${count} Q</span>
          </div>`;
    }

    html += `</div></div>`;
  });

  dom.blueprintPanel.innerHTML = html;

  // Wire objective click handlers
  dom.blueprintPanel.querySelectorAll('.blueprint-obj').forEach(el => {
    el.addEventListener('click', () => onBlueprintObjectiveClick(el.dataset.objId));
  });
}

function renderBlueprintExplanation(blueprint, coverage) {
  const content = dom.explanationContent;
  content.innerHTML = `
    <h4>📋 ${escapeHtml(blueprint.examName || '')}</h4>
    <p>Questions: ${blueprint.questionCount || '?'}</p>
    <p>Time: ${blueprint.timeLimitMinutes || '?'} min</p>
    <p>Pass: ${escapeHtml(blueprint.passingScore || '?')}</p>
    <p>Sections: ${(blueprint.sections || []).length}</p>
    <p style="margin-top:12px;font-weight:700;color:${(coverage.overallPercent || 0) >= 80 ? 'var(--sw-status-green)' : 'var(--sw-status-amber)'}">
      Coverage: ${coverage.coveredObjectives || 0}/${coverage.totalObjectives || 0} objectives (${coverage.overallPercent || 0}%)
    </p>`;
}

async function onBlueprintObjectiveClick(objectiveId) {
  if (!state.currentExam) return;
  const questions = state.exams[state.currentExam] || [];

  const matching = [];
  for (const q of questions) {
    const qText = q.questionText + ' ' + (q.options || []).map(o => o.text).join(' ');
    try {
      const objs = await window.certStudy.quiz.getObjectivesForQuestion(state.currentExam, qText);
      if (objs && objs.some(o => o.objId === objectiveId)) {
        matching.push(q);
      }
    } catch { /* skip */ }
  }

  const content = dom.explanationContent;
  content.innerHTML = `
    <h4>Objective ${escapeHtml(objectiveId)}</h4>
    <p>${matching.length} matching questions</p>
    <ul class="explain-list">
      ${matching.slice(0, 15).map(q => {
        const stem = q.questionText.length > 80 ? q.questionText.substring(0, 80) + '…' : q.questionText;
        return `<li>Q${q.id}: ${escapeHtml(stem)}</li>`;
      }).join('')}
    </ul>`;
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

function toggleExportMenu() {
  const menu = dom.exportMenu;
  if (menu.style.display === 'none' || !menu.style.display) {
    const rect = dom.exportBtn.getBoundingClientRect();
    menu.style.left = `${rect.right + 8}px`;
    menu.style.top = `${rect.top}px`;
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

async function handleExport(action) {
  dom.exportMenu.style.display = 'none';

  if (!state.currentExam && (action === 'export-current' || action === 'export-current-no-answers')) {
    toast('No exam selected', 'error');
    return;
  }

  try {
    const includeAnswers = !action.includes('no-answers');
    const isAll = action.includes('all');

    const defaultName = isAll
      ? `Nutanix-Complete-Study-Guide${includeAnswers ? '' : '-NoAnswers'}.pdf`
      : `${state.currentExam}-Questions${includeAnswers ? '' : '-NoAnswers'}.pdf`;

    const savePath = await window.certStudy.fs.showSaveDialog({
      title: 'Export to PDF',
      defaultName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });

    if (!savePath) return;

    toast('Generating PDF...', 'info');

    if (isAll) {
      await window.certStudy.pdf.exportAll(state.exams, includeAnswers, savePath);
      const total = Object.values(state.exams).reduce((s, q) => s + q.length, 0);
      toast(`Exported ${total} questions across ${Object.keys(state.exams).length} exams`, 'success');
    } else {
      const questions = state.exams[state.currentExam];
      await window.certStudy.pdf.exportExam(state.currentExam, questions, includeAnswers, savePath);
      toast(`Exported ${questions.length} questions to PDF`, 'success');
    }

    // Open the file
    await window.certStudy.fs.openExternal(savePath);
  } catch (err) {
    toast(`Export failed: ${err.message}`, 'error');
  }
}

// ─── Toast Notifications ────────────────────────────────────────────────────

function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  dom.toastContainer.appendChild(el);

  // Animate in
  requestAnimationFrame(() => el.classList.add('toast--visible'));

  setTimeout(() => {
    el.classList.remove('toast--visible');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function showModal(title, bodyHtml) {
  dom.modalTitle.textContent = title;
  dom.modalBody.innerHTML = bodyHtml;
  dom.examModal.style.display = 'flex';
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Start ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
