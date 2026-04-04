# LLM Handoff Guide — CertStudy Electron App

> **Purpose:** This document gives a follow-on LLM agent everything it needs to resume
> development, test, debug, and ship the CertStudy Electron app **on a Linux machine**.
> The entire codebase was built on Windows where security software (ThreatLocker)
> blocked Electron, esbuild, rg.exe, and .NET executables — so the app has **never been
> launched or visually tested**. Your first job is to launch, test, and fix every issue.

---

## 1. Repository Layout

```
nutanixcertificationtool/                     # Git root
├── CertStudy-Electron/                       # ★ THIS IS THE ELECTRON APP
│   ├── main.js                               # Main process (329 LOC)
│   ├── preload.js                            # contextBridge IPC exposure (52 LOC)
│   ├── forge.config.js                       # Electron Forge packaging
│   ├── package.json                          # Dependencies + scripts
│   ├── src/
│   │   ├── main/
│   │   │   ├── services/
│   │   │   │   ├── questionParser.js         # MD → Question[] (274 LOC, 4 regex)
│   │   │   │   ├── blueprintService.js       # 71 objectives, coverage calc (437 LOC)
│   │   │   │   ├── referenceService.js       # KB links + reference cards (575 LOC)
│   │   │   │   ├── pdfExportService.js       # pdfkit PDF generation (452 LOC)
│   │   │   │   └── dataValidator.js          # Question validation rules
│   │   │   ├── ipc/
│   │   │   │   └── labHandlers.js            # certstudy-lab:// protocol + lab IPC (214 LOC)
│   │   │   └── windowState.js                # Window bounds save/restore
│   │   ├── renderer/
│   │   │   ├── quiz/
│   │   │   │   ├── index.html                # App shell (142 lines)
│   │   │   │   ├── css/
│   │   │   │   │   ├── synthwave-tokens.css  # Design tokens
│   │   │   │   │   ├── animations.css        # Keyframes + reduced-motion
│   │   │   │   │   ├── components.css        # Reusable components
│   │   │   │   │   ├── blueprint.css         # Blueprint coverage display
│   │   │   │   │   └── quiz.css              # Layout + quiz components (560 lines)
│   │   │   │   └── js/
│   │   │   │       └── quiz-app.js           # ★ COMPLETE QUIZ APP (1,001 LOC)
│   │   │   └── lab/
│   │   │       └── js/core/
│   │   │           └── BridgeClient.js       # Electron IPC bridge (88 LOC)
│   │   └── shared/
│   │       └── models.js                     # Question, Blueprint, ExamCodes
│   └── tests/                                # 175 tests across 7 files
│       ├── helpers.js                        # expect() wrapper
│       ├── golden_baseline.json              # 1,438 questions ground truth
│       ├── questionParser.test.js            #  26 tests
│       ├── dataValidator.test.js             #  27 tests
│       ├── referenceService.test.js          #  15 tests
│       ├── windowState.test.js               #  18 tests
│       ├── pdfExportService.test.js          #   9 tests
│       ├── blueprintService.test.js          #  47 tests
│       └── labHandlers.test.js               #  28 tests
│
├── CertStudy/                                # Original .NET WinForms app (reference)
│   ├── LabSimulator/Web/                     # ★ 65 files, ~15K LOC — lab SPA
│   │   ├── index.html
│   │   ├── css/
│   │   ├── data/
│   │   └── js/ (core/, components/, views/)
│   ├── MainForm.cs                           # C# quiz UI (reference for feature parity)
│   └── Services/                             # C# backend services (reference)
│
├── NCM-MCI-Part*.md                          # Question files (350 questions)
├── NCP-CI-Part*.md                           # Question files (363 questions)
├── NCP-US-Part*.md                           # Question files (400 questions)
├── NCP-AI-Part*.md                           # Question files (325 questions)
└── README.md                                 # Root project README
```

---

## 2. Quick Start on Linux

```bash
# 1. Clone and switch branch
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
cd nutanixcertificationtool
git checkout feature/linux-electron

# 2. Install (Node.js 22+ required)
cd CertStudy-Electron
npm install

# 3. Run tests FIRST to verify backend is solid
npm test
# Expected: 175 tests passing, 0 failures

# 4. Launch the app
npm start
# Or for dev with DevTools:
NODE_ENV=development npm start
```

### System Dependencies (Debian/Ubuntu)

```bash
sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 \
  xdg-utils libatspi2.0-0 libsecret-1-0
```

### System Dependencies (Fedora/RHEL)

```bash
sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst \
  xdg-utils at-spi2-core libsecret
```

---

## 3. Architecture Overview

### Process Model

```
┌──────────────────────────────────────────────────────────┐
│  MAIN PROCESS (main.js)                                  │
│  ├── Window management (single BrowserWindow)            │
│  ├── Application menu (File/View/Help)                   │
│  ├── certstudy-lab:// custom protocol handler            │
│  ├── 17 IPC handlers (quiz, pdf, fs, store, lab, app)    │
│  ├── electron-store (preferences)                        │
│  └── Services (questionParser, blueprint, reference, pdf)│
└────────────────────┬─────────────────────────────────────┘
                     │ contextBridge (preload.js)
                     │ window.certStudy.{quiz,pdf,fs,store,lab,app}
┌────────────────────┴─────────────────────────────────────┐
│  RENDERER PROCESS                                        │
│  ├── Quiz UI (quiz-app.js — vanilla JS, no framework)    │
│  └── Lab Simulator (iframe, certstudy-lab:// protocol)   │
│       └── BridgeClient.js (Electron IPC bridge)          │
└──────────────────────────────────────────────────────────┘
```

### IPC Contract (preload.js ↔ main.js)

| Namespace | Method | IPC Channel | Direction |
|-----------|--------|-------------|-----------|
| `quiz` | `loadExams(dataDir?)` | `quiz:load-exams` | R→M |
| `quiz` | `getBlueprint(examCode)` | `quiz:get-blueprint` | R→M |
| `quiz` | `calculateCoverage(examCode, qTexts[])` | `quiz:calculate-coverage` | R→M |
| `quiz` | `getObjectivesForQuestion(examCode, text)` | `quiz:get-objectives` | R→M |
| `quiz` | `getReferences(examCode, text)` | `quiz:get-references` | R→M |
| `quiz` | `getKBLinks(examCode, text)` | `quiz:get-kb-links` | R→M |
| `quiz` | `getGeneralResources(examCode)` | `quiz:get-general-resources` | R→M |
| `pdf` | `exportExam(name, qs[], answers?, path)` | `pdf:export-exam` | R→M |
| `pdf` | `exportAll(exams{}, answers?, path)` | `pdf:export-all` | R→M |
| `fs` | `chooseDataDirectory()` | `fs:choose-data-dir` | R→M |
| `fs` | `showSaveDialog(options)` | `fs:show-save-dialog` | R→M |
| `fs` | `openExternal(target)` | `fs:open-external` | R→M |
| `store` | `get(key)` / `set(key, value)` | `store:get` / `store:set` | R→M |
| `lab` | `send(type, payload)` | `lab:message` | R→M |
| `lab` | `post(type, payload)` | `lab:notify` | R→M (fire-and-forget) |
| `lab` | `onMessage(callback)` | `lab:from-main` | M→R |
| `app` | `getVersion()` | `app:get-version` | R→M |

### Data Flow: Question Loading

```
quiz-app.js init()
  → window.certStudy.quiz.loadExams()
    → ipcMain 'quiz:load-exams'
      → questionParser.loadAllExams(dataDir)
        → findDefaultDataDir() walks up from __dirname to find .md files
        → parses NCM-MCI-Part1.md ... NCP-AI-Part5-GapFill.md
        → returns { 'NCP-AI': Question[], 'NCP-US': [...], ... }
  ← state.exams = result
  → populateExamButtons() → selectExam() → showQuestion()
```

### Lab Simulator Protocol

The lab simulator (62+ files) lives in `CertStudy/LabSimulator/Web/` and is served
via a custom `certstudy-lab://` Electron protocol:

- `labHandlers.js` → `resolveLabRoot()` finds the lab files:
  - Dev mode: `../CertStudy/LabSimulator/Web/` (relative to `CertStudy-Electron/`)
  - Packaged: `src/renderer/lab/` (only BridgeClient.js currently exists here)
- `createLabProtocolHandler()` serves files with correct MIME types
- Security: path traversal prevented by checking resolved path stays within labRoot
- The lab iframe loads `certstudy-lab://lab/index.html`
- IPC bridge: Lab JS calls `BridgeClient.send(type, payload)` → `lab:message` → main process

**IMPORTANT for packaging:** The lab files must be copied into the Electron project
for production builds. Currently in dev mode they're served from the adjacent directory.

---

## 4. Known Issues & What Needs Testing

### 🔴 CRITICAL — App Has Never Been Launched

The app was built entirely on a Windows machine where ThreatLocker blocks `electron.exe`.
**Every feature needs verification.** Here's the testing checklist:

#### A. Basic Launch
1. `npm start` opens a window with the synthwave-themed UI
2. Version label shows in the header bar (e.g., `v1.0.0-alpha.1 · linux`)
3. Application menu works (File/View/Help)
4. DevTools open with `F12` or `NODE_ENV=development`

#### B. Exam Loading
1. Four exam buttons appear in the sidebar: NCM-MCI, NCP-AI, NCP-CI, NCP-US
2. Each shows question count in parentheses: NCM-MCI (350), NCP-CI (363), etc.
3. Clicking an exam loads questions and shows the first question
4. Progress bar updates
5. Domain label shown next to progress

#### C. Question Display
1. Question stem shows with Q# prefix
2. Multi-select questions show `[Select ALL that apply]` hint
3. Option cards render with letter indicators (A, B, C, D...)
4. Clicking an option selects it (highlight)
5. For multi-select: clicking multiple options selects all of them
6. Keyboard shortcuts 1-5 select options
7. Options randomize by default (uncheck "Randomize answers" to test)

#### D. Answer Submission
1. Click Submit or press Enter/S
2. Correct options turn green, wrong selections turn red
3. Feedback text shows ✅ or ❌ with correct answer(s)
4. Options become locked (unclickable) after submit
5. Stats update: score, streak, wrong count
6. Domain stats appear/update below the stats panel

#### E. Navigation
1. Next button becomes enabled after submit
2. Previous button works (goes back, resets answer state)
3. Skip button visible when not submitted
4. Keyboard: N for next, P for previous
5. Edge case: reaching last question doesn't crash

#### F. Explanation Panel (right sidebar)
1. After submit, explanation sidebar populates:
   - Blueprint objectives for this question
   - Explanation text
   - Reference material
   - KB documentation links (clickable, should open in default browser)
   - General resources
2. Links use `window.certStudy.fs.openExternal()` — verify URLs open in browser

#### G. Test Mode
1. Switch to "Test" radio button
2. Questions should shuffle to 75-question subset
3. Timer appears (120 min, or 180 for NCM-MCI)
4. Auto-advance after submit (400ms delay)
5. Timer counts down, turns red at 5 min warning
6. Reaching end or timer=0 shows results modal

#### H. Exam Simulator
1. Click "Start Exam Sim" button
2. Activates test mode with timer
3. On completion: modal shows score out of 6000
4. Pass threshold: 3000/6000
5. Lists wrong questions in the modal
6. Returns to study mode after closing modal

#### I. Review Mistakes
1. Get some answers wrong first
2. "Review Mistakes" button becomes enabled
3. Click it: only wrong questions shown
4. Button changes to "↩ Back to All Questions"
5. Clicking again returns to full question set

#### J. Blueprint Coverage
1. Click "📋 Blueprint Coverage" button or press B
2. Blueprint panel replaces question panel
3. Shows overall coverage percentage
4. Per-section breakdown with color-coded progress bars
5. Per-objective counts
6. Clicking an objective should show matching questions in explanation sidebar
7. Button changes to "🎯 Back to Questions" — clicking returns to quiz

#### K. PDF Export
1. Click "📄 Export PDF" button
2. Dropdown menu appears with 4 options:
   - Export Current Exam (with answers)
   - Export Current Exam (no answers)
   - Export All Exams (with answers)
   - Export All Exams (no answers)
3. Save dialog opens
4. PDF generates (toast: "Generating PDF...")
5. Success toast appears
6. File opens in system PDF viewer
7. PDF content is correct: questions, options, optional answer keys

#### L. Lab Simulator Tab
1. Click "Lab Simulator" tab or "🔬 Lab Simulator" button
2. Iframe loads `certstudy-lab://lab/index.html`
3. Lab SPA renders (hash-based routing, 49 views)
4. Switch back to Quiz tab — lab state should persist
5. BridgeClient IPC works (lab sends 'ready' message, gets init response)

#### M. Other
1. Window state saves/restores (resize window, close, reopen)
2. Zoom works (Ctrl+=/Ctrl+-)
3. Reset Stats button clears all stats
4. Help menu links open Nutanix website in browser
5. About dialog shows version info
6. File → Choose Data Directory works

---

## 5. Likely Bugs to Fix

Based on code review (app never ran), these are the most probable issues:

### 5.1 Lab Simulator iframe might not load

**Why:** The iframe `src` is set to `certstudy-lab://lab/index.html`, but the lab root
is resolved to `CertStudy/LabSimulator/Web/`. The URL pathname will be `/index.html`
(the `lab` from `certstudy-lab://lab/` is the hostname, not part of the path).

**Check:** The `createLabProtocolHandler` in labHandlers.js processes `url.pathname`.
If the lab root resolves correctly, this should work. But verify the URL parsing.

**Fix if broken:** Adjust the URL or the protocol handler to align hostname/path.

### 5.2 Lab iframe sandbox restrictions

**Why:** The iframe has `sandbox="allow-scripts allow-same-origin allow-popups"`.
The lab SPA uses IndexedDB for state persistence, which requires `allow-same-origin`.
If any lab feature needs form submission or other blocked capabilities, it'll fail.

**Fix:** Add additional sandbox flags if needed, or remove sandbox entirely since
the protocol only serves local files.

### 5.3 Lab iframe can't access window.certStudy

**Why:** `preload.js` runs in the main window's renderer. The lab iframe loaded via
`certstudy-lab://` protocol has a different origin and **does not get the preload script**.
The `BridgeClient.js` in `src/renderer/lab/` calls `window.certStudy.lab.send()` which
won't exist in the iframe context.

**This is a known architectural issue.** Options to fix:
1. Register a separate preload for the iframe using `webContents.setWindowOpenHandler`
   or by intercepting the iframe's webContents
2. Use `postMessage` between the main renderer and the iframe, with the main renderer
   proxying IPC calls
3. Use a `<webview>` tag instead of iframe (set `webviewTag: true` in webPreferences)

**Recommended fix (option 2):** Add a `window.addEventListener('message', ...)` in
quiz-app.js that listens for postMessage from the lab iframe and proxies calls through
`window.certStudy.lab.*`. Update BridgeClient.js to use `parent.postMessage()` instead
of `window.certStudy.lab.*` when in an iframe context.

### 5.4 Question object serialization across IPC

**Why:** `loadAllExams` returns Question objects with methods/class instances. Electron's
IPC uses structured clone algorithm which strips functions and class prototypes. The
returned objects will be plain JSON objects.

**Expected impact:** `quiz-app.js` only accesses data properties (`.questionText`,
`.options`, `.correctAnswers`, `.isMultiSelect`, `.domain`, `.id`, `.explanation`),
so this should work. But verify no code depends on class methods.

### 5.5 PDF export `outputPath` parameter

**Recently fixed** in preload.js — the `exportExam` and `exportAll` functions now
pass `outputPath` through. But verify the pdfExportService actually writes to the
given path:

```js
// In pdfExportService.js, check that exportExam(name, questions, includeAnswers, outputPath)
// actually uses outputPath to write the PDF file
```

### 5.6 CSS layout on Linux with different fonts

**Why:** The design system uses Inter and JetBrains Mono fonts. These are referenced
in synthwave-tokens.css but may not be installed. The fallback chain includes system
fonts, but sizing may differ.

**Check:** If fonts aren't bundled, install them or add @font-face declarations pointing
to local font files. There's an `assets/fonts/` directory in the project structure but
it may be empty.

### 5.7 `findDefaultDataDir()` path resolution

**Why:** The function walks up from `__dirname` looking for `.md` files. In dev mode,
`__dirname` = `CertStudy-Electron/`, and the `.md` files are at the repo root (one level
up). This should work. But in packaged mode, `app.getPath('exe')` will be somewhere else.

**Verify:** `console.log(findDefaultDataDir())` on launch and confirm it finds the
data directory.

---

## 6. Feature Parity Checklist vs C# MainForm.cs

The original C# app (`CertStudy/MainForm.cs`, 1,553 LOC) has these features.
All were ported to `quiz-app.js`. Verify each:

| Feature | C# Method | JS Function | Status |
|---------|-----------|-------------|--------|
| Load exams from .md files | `LoadExams()` | `loadExams()` | ✅ Ported |
| Exam selection sidebar | `CreateExamButtons()` | `populateExamButtons()` | ✅ Ported |
| Question display | `ShowQuestion()` | `showQuestion()` | ✅ Ported |
| Option selection (single) | click handler | `toggleOption()` | ✅ Ported |
| Option selection (multi) | click handler | `toggleOption()` | ✅ Ported |
| Answer submission | `SubmitAnswer()` | `submitAnswer()` | ✅ Ported |
| Color-coded feedback | green/red coloring | CSS classes | ✅ Ported |
| Next/Previous navigation | `NextQuestion()` | `navigateNext/Prev()` | ✅ Ported |
| Skip button | `SkipQuestion()` | `navigateNext()` | ✅ Ported |
| Keyboard shortcuts (1-5, Enter, N, P, B, S) | `MainForm_KeyDown` | `handleKeyDown()` | ✅ Ported |
| Study mode (immediate feedback) | `studyMode` | `!state.testMode` | ✅ Ported |
| Test mode (timed, 75 questions) | `testMode` | `state.testMode` | ✅ Ported |
| Timer (120/180 min) | `Timer` | `setInterval` | ✅ Ported |
| Exam Simulator (6000-point) | `StartExamSim()` | `startExamSim()` | ✅ Ported |
| Pass/fail modal | `MessageBox` | `showModal()` | ✅ Ported |
| Score tracking | stats panel | `updateStats()` | ✅ Ported |
| Streak counter | `streak` | `state.streak` | ✅ Ported |
| Domain breakdown | per-domain stats | `state.domainStats` | ✅ Ported |
| Wrong answer tracking | `wrongAnswers` | `state.wrongAnswers` Set | ✅ Ported |
| Review Mistakes | `ReviewMistakes()` | `reviewMistakes()` | ✅ Ported |
| Answer randomization | `randomize` | `state.randomizeAnswers` | ✅ Ported |
| Blueprint coverage panel | `ShowBlueprint()` | `toggleBlueprint()` | ✅ Ported |
| Objective drill-down | `OnObjectiveClick()` | `onBlueprintObjectiveClick()` | ✅ Ported |
| Explanation sidebar | explanation panel | `showExplanation()` | ✅ Ported |
| KB links (external URLs) | `OpenUrl()` | `fs.openExternal()` | ✅ Ported |
| PDF export (single exam) | `ExportExam()` | `handleExport()` | ✅ Ported |
| PDF export (all exams) | `ExportAll()` | `handleExport()` | ✅ Ported |
| Export with/without answers | toggle | 4 menu items | ✅ Ported |
| Progress bar | `UpdateProgress()` | CSS width + label | ✅ Ported |
| Tab switching (Quiz ↔ Lab) | tab control | `switchTab()` | ✅ Ported |

---

## 7. File-by-File Reference

### main.js (329 LOC) — Main Process

**Responsibilities:**
- Creates single BrowserWindow with security settings
- Builds application menu (File/View/Help)
- Registers `certstudy-lab://` custom protocol (privileged scheme)
- Sets up 17 IPC handlers across 6 namespaces
- Manages electron-store for preferences
- `findDefaultDataDir()` auto-discovers question .md files
- Error handling for uncaught exceptions

**Key functions:**
- `buildMenu()` — Application menu template
- `createWindow()` — BrowserWindow creation with state restore
- `setupLabProtocol()` — Custom protocol for lab iframe
- `setupIPC()` — All IPC handler registrations
- `getStore()` — Lazy electron-store singleton
- `findDefaultDataDir()` — Walks up directory tree to find .md files

### preload.js (52 LOC) — Context Bridge

Exposes `window.certStudy` with 6 namespaces: quiz, pdf, fs, store, lab, app.
Each maps to specific IPC channels. This is the **only** API the renderer can access.

### quiz-app.js (1,001 LOC) — Quiz Application

**State management:** Single `state` object at module scope. No framework.

**DOM binding:** All selectors resolved once at load via `$()` into `dom` object.
If any HTML element ID doesn't match, you'll get a null reference.

**Key sections:**
- Lines 1-83: State + DOM references
- Lines 87-137: Init + exam loading
- Lines 139-227: Event wiring + keyboard shortcuts
- Lines 229-249: Tab switching
- Lines 252-289: Exam selection
- Lines 292-367: Question display + option building
- Lines 369-388: Option toggle (single/multi-select)
- Lines 392-463: Submit + scoring logic
- Lines 467-528: Explanation panel (async IPC calls)
- Lines 530-558: Navigation
- Lines 560-607: Stats tracking + reset
- Lines 609-708: Test mode + finish logic
- Lines 710-724: Exam simulator
- Lines 726-759: Review mistakes
- Lines 761-893: Blueprint panel (render + objective click)
- Lines 895-950: PDF export
- Lines 952-1001: Toast, modal, utilities, init

### questionParser.js (274 LOC) — Parser

Parses Markdown files with 4 regex patterns:
1. `### Q{N}` — question header
2. `- {LETTER})` — option line
3. `**Answer: {X}**` or `**Correct Answer: {X}**` — answer line
4. `**Answer: A, C**` or `**Answer: B and D**` — multi-answer

Also handles `normalizeExamCode()` which maps filenames to exam codes.
**Bug fixed:** C# had `.Contains("AI")` matching "MAIN" in NCM-MCI filenames.

`loadAllExams(dir)` returns `{ examCode: Question[] }` object.

### blueprintService.js (437 LOC) — Blueprints

Contains hardcoded blueprint data for 4 exams (71 objectives total).
Functions: `getBlueprint`, `calculateCoverage`, `getObjectivesForQuestion`.

### referenceService.js (575 LOC) — References

Maps keywords to KB articles and reference material for all 4 exams.
Functions: `getReferenceForQuestion`, `getKBLinksForQuestion`, `getGeneralResources`.

### pdfExportService.js (452 LOC) — PDF Export

Uses `pdfkit` (pure JS, no native deps) to generate PDFs.
Functions: `exportExam(name, questions, includeAnswers, outputPath)`,
`exportAll(exams, includeAnswers, outputPath)`.

### labHandlers.js (214 LOC) — Lab Protocol + IPC

Exports: `resolveLabRoot`, `createLabProtocolHandler`, `setupLabIPC`, `sendToLab`.
Registered message handlers: `ready`, `log`, `state:save`, `state:load`.

### windowState.js — Window Persistence

`getWindowState(store, screen)` loads saved bounds with screen-edge validation.
`trackWindowState(win, store)` saves on resize/move with 500ms debounce.

---

## 8. Testing

```bash
# Run all 175 tests
npm test

# Individual suites
node --test tests/questionParser.test.js    #  26 tests
node --test tests/dataValidator.test.js     #  27 tests
node --test tests/referenceService.test.js  #  15 tests
node --test tests/windowState.test.js       #  18 tests
node --test tests/pdfExportService.test.js  #   9 tests
node --test tests/blueprintService.test.js  #  47 tests
node --test tests/labHandlers.test.js       #  28 tests

# Watch mode
npm run test:watch
```

**Test framework:** Node.js built-in `node:test` (zero dependencies).
Helper file `tests/helpers.js` provides a lightweight `expect()` wrapper
with: `toBe`, `toEqual`, `toHaveLength`, `toBeTruthy`, `toContain`,
`toHaveProperty`, `toBeGreaterThan`, `toBeLessThan`, `toMatch`, `toThrow`.

**Why not vitest?** vitest requires esbuild which was blocked on the build machine.
If you want to switch, `npm install -D vitest` and update test files.

**Golden baseline:** `tests/golden_baseline.json` contains all 1,438 questions
as parsed by the C# parser. The JS parser is tested against this.

---

## 9. Packaging

```bash
# Package for current platform (creates out/CertStudy-linux-x64/)
npm run package

# Build distributable (.deb + .rpm + .zip)
npm run make
```

**IMPORTANT:** Before packaging, you MUST copy the lab simulator files:

```bash
# Copy lab SPA into the Electron project for packaging
cp -r ../CertStudy/LabSimulator/Web/* src/renderer/lab/

# But KEEP the custom BridgeClient.js (don't overwrite)
git checkout -- src/renderer/lab/js/core/BridgeClient.js
```

The `forge.config.js` uses `asar: true` which bundles all files. Verify the
lab files are included in the asar archive after packaging.

**Makers configured:**
- `@electron-forge/maker-squirrel` — Windows installer
- `@electron-forge/maker-zip` — Linux/macOS zip
- `@electron-forge/maker-deb` — Debian/Ubuntu .deb
- `@electron-forge/maker-rpm` — Fedora/RHEL .rpm

---

## 10. CSS Design System

The UI uses a "synthwave" theme (dark background with neon accent colors).

**Token files:**
- `synthwave-tokens.css` — CSS custom properties (`--sw-*` prefix)
  - Colors: deep-space (#0a0a19), dark-panel (#111128), neon-cyan, neon-purple, neon-pink
  - Fonts: Inter (body), JetBrains Mono (code)
  - Spacing: 4/8/12/16/24/32/48px scale
  - Radii: 4/8/12px
  - Status: green (#00ff88), amber (#ffaa00), red (#ff4466)

**Font issue:** Inter and JetBrains Mono may not be installed on Linux.
The `assets/fonts/` directory exists but may be empty. You may need to:
1. Download the fonts and add @font-face declarations, OR
2. Install them system-wide: `sudo apt install fonts-inter` + download JetBrains Mono
3. Or just rely on the fallback chain (system-ui, sans-serif, monospace)

---

## 11. Remaining Work (Priority Order)

### P0 — Must Fix for Demo

1. **Launch and fix runtime errors** — The app has never run. Expect console errors.
2. **Fix lab iframe IPC** — BridgeClient.js can't access `window.certStudy` in iframe.
   Implement postMessage proxy (see section 5.3).
3. **Fix any CSS layout issues** — Verify on actual screen, adjust as needed.
4. **Verify PDF export works end-to-end** — Save dialog → generate → open file.

### P1 — Should Fix for Demo

5. **Bundle fonts** — Add Inter + JetBrains Mono to assets/fonts/ with @font-face.
6. **Copy lab files for packaging** — Script to copy CertStudy/LabSimulator/Web/.
7. **App icon** — Add multi-size PNG icon to assets/icons/.
8. **Loading states** — Show spinner while exams load, "Generating PDF..." overlay.

### P2 — Nice to Have

9. **Error handling UI** — Global error boundary, user-friendly error dialogs.
10. **E2E tests** — Playwright or Spectron for 5 critical paths.
11. **CI/CD** — GitHub Actions: test + build on Ubuntu/macOS/Windows.
12. **Package and test .deb** — `npm run make` and install on Ubuntu.

---

## 12. Git Branch & Commit History

**Branch:** `feature/linux-electron`

```
da50bd7 feat: complete production quiz UI with all features
9560c3c feat: add blueprintService, pdfExportService, test helpers, fix test runner
151c499 feat: implement certstudy-lab:// protocol and lab IPC handlers
8b39d39 feat(electron): add window state persistence between sessions
5b82382 test: expand questionParser golden-file tests to 37 cases
169d434 docs: add Linux-focused README for Electron app
aa9e860 feat: add dataValidator, referenceService, and 57 passing tests
41efef3 Add golden baseline JSON from C# QuestionParser
49901a7 feat(css): build out design system with components, blueprint, and animations
ab3f2f3 feat: rewrite BridgeClient.js for Electron IPC
b23af1e feat: generate golden baseline (1,438 questions across 4 exams)
95bfe4b Port C# QuestionParser to JavaScript for Electron app
0e79a53 docs: add ARCHITECTURE.md for CertStudy Electron app
6399e7a feat: add shared data models (Question, Blueprint, CoverageResult)
a964c9b feat: scaffold Electron app with full project structure
```

---

## 13. Quick Debugging Tips

### Console.log in Main Process
The main process console output goes to the terminal where you ran `npm start`.

### Console.log in Renderer
Open DevTools (`F12` or `NODE_ENV=development npm start`) to see renderer console.

### Common IPC Debugging
Add this to main.js temporarily to see all IPC traffic:

```js
const { ipcMain } = require('electron');
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, handler) => {
  originalHandle(channel, async (event, ...args) => {
    console.log(`[IPC] ${channel}`, args.length > 0 ? JSON.stringify(args).substring(0, 200) : '');
    try {
      const result = await handler(event, ...args);
      console.log(`[IPC] ${channel} → OK`);
      return result;
    } catch (err) {
      console.error(`[IPC] ${channel} → ERROR:`, err.message);
      throw err;
    }
  });
};
```

### Check Data Directory
If exams don't load, check what `findDefaultDataDir()` returns:

```js
// Temporarily add to main.js after app.whenReady():
console.log('Data dir:', findDefaultDataDir());
```

### Lab Protocol Debugging
If lab iframe shows blank/404:
```js
// In setupLabProtocol():
console.log('Lab root:', labRoot);
// In the protocol handler:
console.log('Lab request:', request.url, '→', filePath);
```

---

## 14. Dependencies

### Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| electron | ^34.0.0 | App framework |
| electron-store | ^10.0.0 | Persistent preferences (JSON file) |
| pdfkit | ^0.15.0 | PDF generation (pure JS, no native deps) |

### Dev
| Package | Version | Purpose |
|---------|---------|---------|
| @electron-forge/cli | ^7.0.0 | Packaging/making |
| @electron-forge/maker-deb | ^7.0.0 | .deb maker |
| @electron-forge/maker-dmg | ^7.0.0 | .dmg maker (macOS) |
| @electron-forge/maker-rpm | ^7.0.0 | .rpm maker |
| @electron-forge/maker-squirrel | ^7.0.0 | Windows installer |
| @electron-forge/maker-zip | ^7.0.0 | Zip archive |
| electron | ^34.0.0 | (also listed as devDep) |

No native/compiled dependencies. Everything is pure JS. `npm install` on Linux
should work without build tools.

---

## 15. Security Model

- `nodeIntegration: false` — Renderer has zero Node.js access
- `contextIsolation: true` — Preload runs in a separate JS world
- `sandbox: true` — Renderer process is sandboxed
- `webviewTag: false` — No `<webview>` tags allowed
- `allowRunningInsecureContent: false` — No mixed content
- CSP: `default-src 'self' certstudy-lab:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self'; frame-src certstudy-lab:`
- `fs:open-external` only allows `http://`, `https://` URLs and `.pdf` file paths
- Lab protocol handler validates paths stay within labRoot (no traversal)

---

## 16. Summary of What Was Done vs What Remains

### ✅ Complete (built + tested with 175 passing tests)
- Question parser (1,438 questions from 18 .md files)
- Data validator
- Blueprint service (71 objectives, coverage calculation)
- Reference service (KB links, reference cards)
- PDF export service (pdfkit, title pages, answer keys)
- Lab protocol handler (certstudy-lab://)
- Window state persistence
- Complete quiz UI application (1,001 LOC)
- Full CSS design system (5 files)
- IPC handlers (17 channels)
- Application menu
- Preload context bridge

### ❌ Needs Verification (never ran)
- The Electron app actually launches
- All UI features work visually
- IPC calls succeed at runtime
- Lab simulator iframe loads
- PDF export end-to-end
- Font rendering
- Window state save/restore

### ❌ Needs Implementation
- Lab iframe IPC bridge fix (postMessage proxy)
- Lab file copying for packaging
- Font bundling
- App icon
- Loading/error states
- E2E tests
- CI/CD pipeline
- Package verification (.deb/.rpm)
