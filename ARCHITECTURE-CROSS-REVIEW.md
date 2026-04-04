# Architecture Cross-Review: Backend Findings vs. Sprint Plan

**Reviewer:** Senior Technical Reviewer (automated)  
**Date:** 2025-07-15  
**Inputs:** Backend Architect Report, Sprint Planner Report, C# source code inspection  
**Verdict:** Sprint plan has **6 critical gaps**, **3 factual errors** in the Backend report, and **1 entirely missing subsystem** that affects sprint sizing.

---

## 0. FACTUAL CORRECTIONS TO BACKEND ARCHITECT REPORT

Before cross-referencing, three claims in the Backend report are contradicted by the source code.

### 0.1 ❌ "all_questions.json already exists as golden baseline"
**Reality:** `all_questions.json` is 6 bytes containing the literal `null`. It is **not** a usable golden baseline. A golden file must be generated from the C# parser output before any snapshot tests can run.

**Impact:** Sprint 0 task `parser-golden-tests` depends on this file existing. The sprint plan must include a **generate-golden-file** step using the C# app's parser before JS tests are meaningful.

### 0.2 ❌ "C# has zero try/catch"
**Reality:** `MainForm.cs` has try/catch around:
- `QuestionParser.LoadAllExams()` (line ~477)
- `ExportService.ExportExam()` (line ~1056)
- `ExportService.ExportAll()` (line ~1085)
- Hyperlink launch via `Process.Start()` (line ~536)

`LabSimulatorBridge.cs` has nested try/catch with error-response propagation (lines 52–79).
`LabSimulatorLauncher.cs` has try/catch for WebView2 runtime detection.

**Impact:** The JS port should replicate these same error boundaries, not invent them from scratch. The risk is lower than reported — **MEDIUM**, not HIGH.

### 0.3 ❌ "No built-in glob needed — simple readdirSync + regex filter for <20 files"
**Reality:** `QuestionParser.LoadAllExams()` calls `Directory.GetFiles(directory, pattern)` with patterns like `"NCP-US*.md"`, `"NCP-CI*.md"`, `"NCP-AI*.md"`, `"NCM-MCI*.md"`. This is a hardcoded 4-pattern search, not a generic glob. The JS port should mirror this exact list of patterns.

---

## 1. MISSING BACKEND ITEMS IN THE SPRINT PLAN

| Backend Finding | In Sprint Plan? | Verdict |
|---|---|---|
| GetBibleSections() | ❌ Not explicitly named | **GAP** — must add to `port-reference-service` or `port-blueprint-service` |
| GetKBLinksForQuestion() | ❌ Not explicitly named | **GAP** — scored keyword matching + deduplication, belongs in `port-reference-service` |
| Exam code normalization | ❌ Not called out | **GAP** — `.Replace(" ","").ToUpperInvariant()` + Contains checks; error-prone |
| File watcher / hot reload | ❌ Not in any sprint | **ACCEPTABLE** — nice-to-have, defer to post-v1 |
| Error handling | ✅ Sprint 6 `error-handling` | **INSUFFICIENT** — one task in Sprint 6 is too late; error boundaries should be built into each service from Sprint 0 |
| Case-insensitive matching | ❌ Not addressed anywhere | **GAP** — 4 distinct patterns in C# source, high bug risk |
| Font licensing (Segoe UI) | ❌ Not mentioned | **MINOR GAP** — Sprint 1 `build-design-system` should specify font bundling |
| Python scripts (export/generate) | ❌ Not mentioned | **ACCEPTABLE** — these are dev tooling, not runtime; document and skip |

### 1.1 GetBibleSections() — MISSING

Located in `BlueprintService.cs`. Returns hardcoded lists of Nutanix Bible section references per exam:
- NCP-AI: 4 sections (Kubernetes & NKP, Prism Central, Security, Volumes CSI)
- NCP-US: 5 sections (Files, Objects, Volumes, Data Protection, Data Lens)
- NCP-CI: 5 sections (NC2 on AWS, NC2 on Azure, Networking, Prism Central, Data Protection)
- NCM-MCI: 8 sections (DSF Internals, Prism Central, Security, Networking, Data Protection, APIs, Storage, CLI)

This method is called from `MainForm.ShowExplanation()` and renders in the explanation panel. The sprint plan's `port-blueprint-service` task must include this.

**Action:** Add to Sprint 1 `port-blueprint-service` acceptance criteria: *"Port GetBibleSections() with all 4 exam mappings."*

### 1.2 GetKBLinksForQuestion() — MISSING

Located in `ReferenceService.cs` (line ~360+). Algorithm:
1. Look up entries for question's ExamCode from `_kbLinks` dictionary
2. Normalize question stem + all option text to lowercase
3. Score each KB entry by keyword match count
4. Sort by score descending
5. Deduplicate by URL using HashSet (keep highest-scored)
6. Return top entries

This is a second, independent data dictionary separate from `GetReferenceForQuestion()`. The sprint plan's `port-reference-service` must port BOTH dictionaries and BOTH methods.

**Action:** Add to Sprint 1 `port-reference-service` acceptance criteria: *"Port GetKBLinksForQuestion() including the _kbLinks dictionary, keyword scoring, and URL deduplication logic."*

### 1.3 Exam Code Normalization — MISSING

Three distinct normalization patterns in the C# source:

| Location | Pattern | Risk |
|---|---|---|
| `BlueprintService.GetBlueprint()` | `.Replace(" ","").ToUpperInvariant()` then `.Contains("AI")` etc. | HIGH — "AI" matches "MAIN" |
| `QuestionParser.DeriveExamCode()` | Split on `-`, take first two parts | LOW |
| `ExportService.GetExamInfo()` | `.Contains("NCP-AI")` etc. in switch | MEDIUM |
| `MainForm` | `.StartsWith("NCM-MCI", OrdinalIgnoreCase)` | LOW |

The `.Contains("AI")` pattern in BlueprintService is a latent bug in the C# code (would break if an exam code contained "AI" as a substring in another context). The JS port should fix this with exact matching.

**Action:** Create a shared `normalizeExamCode()` utility in Sprint 0 `model-definitions` and use it everywhere. Document the 4 patterns and which to replicate vs. fix.

### 1.4 Case-Insensitive String Matching — MISSING

Four distinct case-handling strategies in C#:

1. **Dictionary keys:** `StringComparer.OrdinalIgnoreCase` (BlueprintService)
2. **Exam code lookup:** `.ToUpperInvariant()` normalization (BlueprintService)
3. **Keyword matching:** `.ToLowerInvariant()` on both sides (ReferenceService)
4. **Prefix matching:** `StringComparison.OrdinalIgnoreCase` (MainForm)

In JavaScript, none of these happen automatically. Every `Map` lookup, every `.includes()` call, every string comparison needs explicit case handling.

**Action:** Add a cross-cutting note to Sprint 0 `model-definitions`: *"All string comparisons involving exam codes, dictionary keys, and keyword matching must use explicit case normalization. Create a `caseInsensitiveMap` utility or normalize all keys at insertion time."*

---

## 2. TESTING COVERAGE ALIGNMENT

| Backend Recommendation | Sprint Plan Coverage | Verdict |
|---|---|---|
| Golden-file snapshot testing | Sprint 0 `parser-golden-tests` | ⚠️ **BLOCKED** — `all_questions.json` is null; need generation step |
| Property-based tests (structural) | ❌ Not mentioned | **GAP** — add to Sprint 0 or Sprint 1 |
| Blueprint coverage accuracy tests | Sprint 4 `blueprint-accuracy-tests` | ✅ Covered |
| Service unit tests | Sprint 1 `service-unit-tests` | ⚠️ **VAGUE** — doesn't specify which services or what coverage |

### 2.1 Golden File Generation — BLOCKED

The golden file must be produced by running the C# parser against all 19 .md files and serializing the output. Options:
1. Run the C# app with a `--dump-json` flag (requires modifying C# code)
2. Write a one-off C# console app that calls `QuestionParser.LoadAllExams()` and serializes
3. Use the Python `generate_questions.py` output (but this generates NEW questions, not parses existing ones)

**Action:** Add Sprint 0 task `generate-golden-baseline`: *"Run the C# QuestionParser against all .md files and serialize the full question list to golden_baseline.json. This file is the test oracle for JS parser validation."*

### 2.2 Property-Based Tests — MISSING

Backend Architect recommended structural validation (every question has ≥2 options, correct answers are subset of options, no empty stems, etc.). This is not in the sprint plan.

**Action:** Add to Sprint 0 `parser-golden-tests` or Sprint 1 `service-unit-tests`: *"Property-based structural assertions: every Question has id>0, non-empty stem, ≥2 options, ≥1 correctAnswer, correctAnswers ⊆ option letters."*

### 2.3 Service Unit Tests — VAGUE

Sprint 1 `service-unit-tests` doesn't specify:
- Which services? (QuestionParser, BlueprintService, ReferenceService, ExportService)
- What methods?
- What coverage target?

**Action:** Expand `service-unit-tests` description: *"Unit tests for BlueprintService (GetBlueprint, CalculateCoverage, GetObjectivesForQuestion, GetBibleSections), ReferenceService (GetReferenceForQuestion, GetKBLinksForQuestion, GetGeneralResources). Minimum: exam code normalization edge cases, keyword scoring accuracy, coverage calculation correctness."*

---

## 3. PORT ORDER ANALYSIS

**Backend recommended:** Models → QuestionParser → BlueprintService → ReferenceService → ExportService → IPC → Tests

**Sprint plan actual:**
- Sprint 0: scaffold + **QuestionParser** + tests ✅
- Sprint 1: **BlueprintService** + **ReferenceService** + models + tests ✅
- Sprint 2: UI + **IPC** ✅
- Sprint 6: **ExportService** ✅

**Verdict: ✅ ALIGNED.** The sprint plan follows the Backend's recommended dependency order. One minor note: `model-definitions` is in Sprint 1 but models are needed in Sprint 0 for the parser. The Question and BlueprintObjective classes should move to Sprint 0 or be implicitly part of `port-question-parser`.

**Action:** Move `model-definitions` from Sprint 1 to Sprint 0, or confirm `port-question-parser` includes the Question/AnswerOption model classes.

---

## 4. PDF APPROACH CONFLICT

Three recommendations from three sources:

| Source | Recommendation | Rationale |
|---|---|---|
| Backend Architect | **pdfkit** (Node.js) | Feature parity table, font bundling, `heightOfString()` |
| UI/UX Architect | **printToPDF()** (Electron) | Zero dependencies, uses Chromium's renderer |
| Sprint Planner | **pdfkit or @pdfme/generator** | Left as open choice |

### Analysis

The C# app uses **PdfSharp** for programmatic PDF generation with precise layout control:
- Custom title pages with exam info
- Header/footer on every page
- Styled question rendering with option letters
- Answer key appendix
- Color-coded elements (exam-specific accent colors)
- Height estimation for page breaks

| Criterion | pdfkit | printToPDF() | @pdfme/generator |
|---|---|---|---|
| Programmatic layout | ✅ Full control | ❌ Renders visible HTML | ✅ Template-based |
| Title pages | ✅ Easy | ⚠️ Need hidden DOM | ✅ Via template |
| Headers/footers | ✅ Native | ⚠️ Limited CSS `@page` | ✅ Via template |
| Page break control | ✅ `heightOfString()` | ❌ CSS heuristic | ⚠️ Template-constrained |
| Font bundling | ✅ Required (Inter/JB Mono) | ✅ Uses system fonts | ✅ Required |
| Answer key appendix | ✅ Easy | ⚠️ Complex DOM manipulation | ✅ Via template |
| Dependencies | 1 package | 0 packages | 1 package |
| Matches C# approach | ✅ Direct port | ❌ Complete rewrite | ⚠️ Partial |

### Recommendation: **pdfkit**

**Rationale:** The C# ExportService is procedural with precise coordinate-based drawing (`DrawHeader`, `DrawFooter`, `DrawQuestion`, `EstimateQuestionHeight`). This maps 1:1 to pdfkit's API. Using `printToPDF()` would require building a hidden HTML renderer that reproduces the same visual output — more complex, harder to test, and loses page break control.

**Action:** Lock the decision to pdfkit in Sprint 6 `port-export-service`. Add font bundling (Inter + JetBrains Mono) to the task.

---

## 5. DATA MODEL RISKS

### 5.1 IsMultiSelect Getter

C# `Question.IsMultiSelect` is `CorrectAnswers.Count > 1` — a computed property. The Backend Architect correctly notes this should be a JS getter. Sprint plan `model-definitions` should specify this.

**Risk:** LOW. Simple to implement.

### 5.2 Case-Insensitive Dictionary Keys — NOT ADDRESSED

`BlueprintService._blueprints` uses `StringComparer.OrdinalIgnoreCase`. In JS, `Map` keys are case-sensitive by default. If the sprint plan doesn't mandate normalization at insertion time, lookups like `blueprints.get("ncp-ai")` vs `blueprints.get("NCP-AI")` will silently fail.

**Risk:** HIGH. Silent failures with no error — questions show no blueprint data.

**Action:** Mandate in `model-definitions`: all Maps keyed by exam code must normalize keys to uppercase at insertion time.

### 5.3 Wrong Answer Tracking Key Format

C# uses `$"{_currentExam}-Q{question.Id}"` as wrong-answer keys and filters with `.StartsWith(_currentExam + "-")`. This is an implicit data contract between tracking and filtering.

**Risk:** LOW but must be documented in the model definitions.

---

## 6. 🚨 CRITICAL MISSING SUBSYSTEM: Lab Simulator

**Neither report adequately addresses the Lab Simulator.** The C# codebase contains a complete WebView2-based lab simulator subsystem:

### Scope (62 files):
- **Core:** BridgeClient.js, Router.js, StateStore.js, StateEngine.js, EventBus.js, CLIService.js
- **Components:** EntityTable, CLITerminal, Wizard, Toast, Confirm, ThemeToggle
- **Views (52 files):** Full Prism Central (17 views), Prism Element (12 views), AI (5 views), CI (5 views), US (4 views), plus scenarios and service pages
- **C# Bridge:** LabSimulatorBridge.cs (PostMessage JSON bridge), LabSimulatorForm.cs (WebView2 host), LabSimulatorLauncher.cs (runtime check)
- **Styling:** CSS tokens + components

### What Sprint 5 covers:
- `adapt-bridge-client` — adapt BridgeClient.js
- `lab-browser-window` — new BrowserWindow for simulator
- `lab-ipc-handlers` — IPC between windows
- `smoke-test-all-views` — smoke test
- `fix-web-compat` — fix compatibility issues

### What Sprint 5 DOESN'T cover:
1. **The 52 view files are already pure JS** — they don't need porting, but they DO need testing. A smoke test of "all views" means loading 52+ view modules. Is 1 sprint task sufficient?
2. **StateEngine.js** — complex state machine for lab scenarios. Not mentioned.
3. **CLIService.js** — simulated CLI for Nutanix commands. Not mentioned.
4. **CSS migration** — `tokens.css` and `components.css` use CSS custom properties. If the Electron app uses a different design system (Sprint 1 `build-design-system`), these conflict.
5. **Navigation architecture** — the existing Router.js handles SPA routing within WebView2. In Electron, this is a separate BrowserWindow. URL scheme changes from `certstudy.local` virtual host to `file://` or custom protocol.

### Risk Assessment: MEDIUM-HIGH

The lab simulator is already JavaScript — the porting effort is lower than the C# services. But the integration points (bridge, IPC, window lifecycle, protocol mapping) are non-trivial and Sprint 5's 5 tasks may be undersized.

**Action:**
1. Add task to Sprint 5: `lab-router-protocol-migration` — update Router.js and all navigation from `certstudy.local` virtual host to Electron-compatible protocol
2. Add task to Sprint 5: `lab-state-engine-validation` — verify StateEngine.js and CLIService.js work outside WebView2 context
3. Expand `smoke-test-all-views` description to clarify: 52 view modules must load and render without errors

---

## 7. ADDITIONAL FINDINGS

### 7.1 AnimatedProgressBar Custom Control

`Controls/AnimatedProgressBar.cs` is a GDI+ custom-painted progress bar with glow effects. The sprint plan's `animated-progress-bar` (Sprint 3) covers this, but should note it requires Canvas or CSS animation recreation, not a simple HTML `<progress>` element.

### 7.2 BlueprintPanel Custom Control

`Controls/BlueprintPanel.cs` (256 lines) is a full custom-painted scrollable panel with:
- Mouse hover highlighting
- Click handlers for objective navigation
- Coverage bar rendering with color thresholds (green ≥70%, yellow ≥40%, red below)
- Section/objective hierarchy

Sprint 4 `blueprint-panel-ui` covers this, but the complexity warrants noting that this is NOT a simple list — it's a virtual-scrolling interactive panel.

### 7.3 Hardcoded Exam Data Volume

`ReferenceService.cs` contains ~395 lines of hardcoded reference data (keywords → references, keywords → KB links). `BlueprintService.cs` contains ~515 lines of hardcoded blueprint data. Together that's ~900 lines of data that must be ported verbatim.

**Action:** Consider extracting this data to JSON files during the port rather than embedding in JS. This makes it testable and maintainable independently.

### 7.4 Missing IPC Contract Definition

The Backend Architect flagged IPC design as HIGH risk but didn't detail it. Sprint 2 has `main-process-ipc` as a single task. Based on the C# source, the IPC surface area is:

| Channel | Direction | Purpose |
|---|---|---|
| `load-exams` | renderer→main | Load all .md files, return question data |
| `get-blueprint` | renderer→main | Get blueprint for exam code |
| `get-coverage` | renderer→main | Calculate coverage for exam |
| `get-objectives` | renderer→main | Get objectives for a question |
| `get-bible-sections` | renderer→main | Get Bible section references |
| `get-reference` | renderer→main | Get reference material for question |
| `get-kb-links` | renderer→main | Get KB documentation links |
| `get-general-resources` | renderer→main | Get general resource list |
| `export-exam` | renderer→main | Export single exam PDF |
| `export-all` | renderer→main | Export all exams PDF |
| `open-file` | renderer→main | Open file in OS (shell.openPath) |
| `launch-lab` | renderer→main | Open lab simulator window |

That's 12+ IPC channels. One sprint task is likely insufficient for implementation + TypeScript types + error handling.

**Action:** Split `main-process-ipc` into two tasks:
1. `ipc-data-channels` (Sprint 2) — load-exams, get-blueprint, get-coverage, get-objectives, get-bible-sections, get-reference, get-kb-links, get-general-resources
2. `ipc-action-channels` (Sprint 6) — export-exam, export-all, open-file (alongside ExportService port)

---

## 8. CONSOLIDATED ACTION ITEMS

Prioritized by impact and sprint timing:

### P0 — Must Fix Before Sprint 0 Starts

| # | Action | Sprint | Task |
|---|---|---|---|
| 1 | **Generate golden baseline file** from C# parser output; `all_questions.json` is null | Sprint 0 | New: `generate-golden-baseline` |
| 2 | **Move `model-definitions` to Sprint 0** — parser depends on Question/AnswerOption classes | Sprint 0 | Move from Sprint 1 |
| 3 | **Add `normalizeExamCode()` utility** with documented behavior for all 4 C# patterns | Sprint 0 | Add to `model-definitions` |

### P1 — Must Fix Before Relevant Sprint Starts

| # | Action | Sprint | Task |
|---|---|---|---|
| 4 | **Add GetBibleSections()** to BlueprintService port acceptance criteria | Sprint 1 | `port-blueprint-service` |
| 5 | **Add GetKBLinksForQuestion()** to ReferenceService port with scoring + dedup logic | Sprint 1 | `port-reference-service` |
| 6 | **Mandate case-insensitive Map handling** across all service ports | Sprint 1 | `model-definitions` (now in S0) |
| 7 | **Add property-based structural tests** for question data integrity | Sprint 1 | `service-unit-tests` |
| 8 | **Expand `service-unit-tests` scope** to enumerate specific methods and edge cases | Sprint 1 | `service-unit-tests` |
| 9 | **Split `main-process-ipc`** into data channels (S2) and action channels (S6) | Sprint 2 | `main-process-ipc` |
| 10 | **Move error handling pattern** from Sprint 6 to Sprint 0 as cross-cutting convention | Sprint 0 | `design-architecture` |

### P2 — Should Fix

| # | Action | Sprint | Task |
|---|---|---|---|
| 11 | **Add lab router/protocol migration** task to Sprint 5 | Sprint 5 | New: `lab-router-protocol-migration` |
| 12 | **Add lab state engine validation** task to Sprint 5 | Sprint 5 | New: `lab-state-engine-validation` |
| 13 | **Lock PDF approach to pdfkit** and add font bundling requirement | Sprint 6 | `port-export-service` |
| 14 | **Extract hardcoded reference/blueprint data to JSON** during port | Sprint 1 | `port-blueprint-service`, `port-reference-service` |
| 15 | **Specify font bundling** (Inter + JetBrains Mono) in design system task | Sprint 1 | `build-design-system` |
| 16 | **Expand `smoke-test-all-views`** description to clarify 52-view scope | Sprint 5 | `smoke-test-all-views` |

### P3 — Nice to Have / Defer

| # | Action | Sprint | Task |
|---|---|---|---|
| 17 | File watcher / hot reload for .md changes | Post-v1 | Backlog |
| 18 | Python script documentation (export_to_pdf.py, generate_questions.py) | Post-v1 | Backlog |
| 19 | Note AnimatedProgressBar requires Canvas/CSS recreation, not `<progress>` | Sprint 3 | `animated-progress-bar` |

---

## 9. REVISED SPRINT 0 (WITH FIXES APPLIED)

Original Sprint 0 (5 tasks):
1. scaffold
2. design-architecture  
3. port-question-parser
4. parser-golden-tests
5. data-validation

**Revised Sprint 0 (7 tasks):**
1. `scaffold` — Electron + Vite + TypeScript project init
2. `design-architecture` — architecture doc **including error handling patterns and IPC contract**
3. `model-definitions` — **moved from Sprint 1**; Question, AnswerOption, BlueprintObjective, ExamBlueprint classes with IsMultiSelect getter and normalizeExamCode() utility
4. `generate-golden-baseline` — **NEW**; run C# parser, serialize to golden_baseline.json
5. `port-question-parser` — port QuestionParser with all 4 regex patterns + DeriveExamCode + LoadAllExams
6. `parser-golden-tests` — snapshot tests against golden_baseline.json **+ property-based structural tests**
7. `data-validation` — validate all 19 .md files parse correctly

**Net impact:** Sprint 0 grows from 5 → 7 tasks. This is acceptable because `model-definitions` and `generate-golden-baseline` are small tasks, and catching these issues in Sprint 0 prevents cascading failures in Sprints 1–2.

---

## 10. SUMMARY

| Category | Status | Issues Found |
|---|---|---|
| Missing backend items | ⚠️ 4 gaps | GetBibleSections, GetKBLinksForQuestion, exam normalization, case sensitivity |
| Testing coverage | ⚠️ 2 gaps | Golden file blocked, property tests missing |
| Port order | ✅ Aligned | Minor: models should be Sprint 0 |
| PDF approach | ⚠️ Unresolved | Three conflicting recs; pdfkit is correct choice |
| Data model risks | ⚠️ Not addressed | Case-insensitive Maps, exam code normalization |
| Lab Simulator scope | ⚠️ Undersized | 62-file subsystem, Sprint 5 may need expansion |
| IPC surface area | ⚠️ Undersized | 12+ channels in 1 task |
| Backend report accuracy | ⚠️ 3 errors | Golden file, error handling claim, glob claim |

**Bottom line:** The sprint plan's sequencing and architecture are sound, but it has blind spots on data-level correctness (case sensitivity, exam normalization) and under-scopes two complex areas (IPC surface area, lab simulator integration). The 16 action items above will close these gaps.
