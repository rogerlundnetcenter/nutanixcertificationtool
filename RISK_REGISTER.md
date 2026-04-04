# CertStudy Electron Port — Consolidated Risk Register

> **Prepared by**: Risk Analysis Team  
> **Date**: 2025-07-16  
> **Scope**: Port of CertStudy from .NET 8 WinForms + WebView2 to Electron (cross-platform)  
> **Source Inputs**: UI/UX Architect Report, Backend Architect Report, Sprint Planner Timeline  
> **Baseline**: Source analysis of actual codebase (MainForm.cs: 1,362 LOC; BlueprintService.cs: 496 LOC; ExportService.cs: 350 LOC; QuestionParser.cs: 203 LOC; ReferenceService.cs: 294 LOC)

---

## Rating Disagreements & Resolutions

Before presenting the final register, here are the cases where architects disagreed or where source analysis led to a re-evaluation:

| Risk | UI/UX | Backend | Planner | Source Evidence | **Final** | Rationale |
|------|-------|---------|---------|-----------------|-----------|-----------|
| Bridge Migration | HIGH | HIGH | — | WebView2 bridge is isolated in `LabSimulatorForm`, already uses `PostMessage` JSON pattern (not `AddHostObjectToScript`) | **MEDIUM** | PostMessage → Electron IPC is a well-documented migration. The bridge is isolated, not entangled with MainForm. Adapter pattern reduces this from rewrite to translation. |
| Case-Insensitive Matching | — | HIGH | — | Single `Dictionary<string, ExamBlueprint>` with `StringComparer.OrdinalIgnoreCase` in BlueprintService.cs | **MEDIUM** | Fix is mechanical: normalize keys with `.toLowerCase()` on insert and lookup. Unit-testable. Not subtle if you know where to look. |
| MainForm Decomposition | — | — | Sprint 2 (HIGHEST) | 1,362 LOC, 30+ private fields, mixed UI + state + timer logic | **HIGH** | Confirmed as the riskiest item. No architectural shortcut — requires deliberate state extraction before UI work begins. |
| PDF Export | HIGH | LOW (pdfkit) | Sprint 6 | ExportService.cs: 350 LOC using `XGraphics` pixel positioning, pagination, multi-column layout | **HIGH** | Backend underrated this. pdfkit *can* do everything PdfSharp does, but the API paradigm shift (streaming cursor vs. absolute coordinates) means this is a reimplementation, not a translation. |
| Virtual Host Mapping | HIGH | — | Sprint 5 | LabSimulator uses `ms-appx-web://` / `certstudy.local` virtual host | **MEDIUM** | Electron's `protocol.registerFileProtocol` or direct `file://` with proper CSP handles this. One-time config, not ongoing risk. |
| Error Handling (missing in C#) | — | HIGH | — | Confirmed: no try/catch in services, no error boundaries | **HIGH** | Agrees with backend assessment. JS port must add error handling from scratch — silent failures will be harder to debug in Electron without .NET's crash dialog. |
| Font Bundling | MEDIUM | MEDIUM | Sprint 6 | `XFont("Segoe UI", ...)` hardcoded in ExportService.cs | **MEDIUM** | Consensus. Straightforward fix with bundled font + CSS fallback stack. |
| Line Endings | — | MEDIUM | Sprint 0 | `File.ReadAllLines()` handles CRLF; JS `split(/\r?\n/)` equivalent | **LOW** | Both overrated. JS handles this natively. QuestionParser already uses `TrimEnd()`. |
| Regex Translation | — | LOW | Sprint 0 | 4 `[GeneratedRegex]` patterns, all simple anchored patterns | **LOW** | Consensus. Direct JS `RegExp` equivalents, zero ambiguity. |

---

## Risk Categories

### 🔴 Blockers — Resolve Before Implementation

Risks that will cascade into every sprint if not addressed upfront.

### 🟡 Sprint Risks — Address During Specific Sprint

Risks tied to specific features; manageable if planned for.

### 🟢 Watch Items — Monitor, Low Likelihood of Impact

Unlikely to cause issues but worth tracking.

---

## Final Risk Register

| ID | Risk Description | Category | Rating | Mitigation | Sprint | Owner |
|----|-----------------|----------|--------|------------|--------|-------|
| **R-01** | **MainForm monolith decomposition** — 1,362 LOC with 30+ fields mixing UI state, timer logic, exam mode flags, and domain statistics. No separation of concerns. | 🔴 Blocker | **HIGH** | Extract state into a `StudySessionStore` class before any UI work. Define clear state interface: `{currentExam, selectedAnswers, domainStats, timerState, mode}`. Write state-only unit tests against the extracted store. Use a reactive pattern (EventEmitter or simple pub/sub) so UI components subscribe to state changes. | Sprint 0 (design), Sprint 2 (implement) | Backend + UI |
| **R-02** | **Error handling — none exists in C#** — Services have zero try/catch blocks. In .NET, unhandled exceptions show a dialog; in Electron, they silently fail or crash the renderer. | 🔴 Blocker | **HIGH** | Define error handling strategy in Sprint 0: (1) wrap all IPC handlers in try/catch, (2) add `process.on('uncaughtException')` + `window.onerror` handlers, (3) create an `ErrorBoundary` UI component for graceful degradation, (4) add structured logging from day one. | Sprint 0 (strategy), Sprint 1+ (implement) | Backend |
| **R-03** | **PDF export reimplementation** — ExportService.cs (350 LOC) uses PdfSharp's `XGraphics` absolute-positioning API. pdfkit uses a streaming cursor model. Pagination, multi-column layouts, and answer key generation all need rethinking. | 🟡 Sprint Risk | **HIGH** | Build a PDF prototype in Sprint 1 (proof-of-concept for one exam). Validate: (1) text wrapping with long question stems, (2) multi-column answer key layout, (3) page break logic, (4) font embedding. Use pdfkit's `.text()` with column options rather than manual coordinate math. Full implementation in Sprint 6. | Sprint 1 (PoC), Sprint 6 (full) | Backend |
| **R-04** | **IPC bridge design** — LabSimulatorForm uses WebView2 `PostWebMessageAsJson` / `WebMessageReceived` pattern. Electron IPC (`ipcMain`/`ipcRenderer`) is similar but requires explicit channel registration and `contextBridge` for security. | 🟡 Sprint Risk | **MEDIUM** | Map existing PostMessage channels to named IPC channels. Use `contextBridge.exposeInMainWorld()` to create a `window.certStudyAPI` object mirroring the current bridge contract. Write integration tests that verify round-trip message passing. Lab Simulator already uses JSON messages — preserve that contract. | Sprint 1 | Backend + UI |
| **R-05** | **Case-insensitive string matching** — BlueprintService uses `StringComparer.OrdinalIgnoreCase` for dictionary keys and coverage calculations. JS `Map` and object keys are case-sensitive by default. | 🟡 Sprint Risk | **MEDIUM** | Create a `CaseInsensitiveMap` utility class (or normalize all keys with `.toLowerCase()` at insertion and lookup). Add unit tests comparing coverage output against the C# baseline for all exam files. Check `ReferenceService` for same pattern. | Sprint 1 | Backend |
| **R-06** | **Virtual host / path resolution** — WebView2 uses `certstudy.local` virtual host mapping and `ms-appx-web://` protocol. Electron uses `file://` or custom protocol handlers. | 🟡 Sprint Risk | **MEDIUM** | Register a custom `certstudy://` protocol using `protocol.registerFileProtocol()` in main process, or switch to `file://` with a permissive CSP for local assets. Test that all Lab Simulator HTML/JS/CSS loads correctly. One-time configuration. | Sprint 5 | Platform |
| **R-07** | **CSP blocking inline scripts/styles** — Lab Simulator HTML may use inline `<script>` or `style=` attributes. Electron's default CSP blocks these in renderer with `contextIsolation: true`. | 🟡 Sprint Risk | **MEDIUM** | Audit all Lab Simulator HTML files for inline scripts/styles. Extract to external files or add `nonce`-based CSP. Configure `webPreferences.contextIsolation` and set appropriate `Content-Security-Policy` meta tag. Test all lab scenarios. | Sprint 5 | Platform |
| **R-08** | **BlueprintPanel GDI+ → HTML/CSS** — 257 LOC custom-painted control with hover states, progress bars, hit detection, and scrolling. Requires full reimplementation. | 🟡 Sprint Risk | **MEDIUM** | Implement as a CSS Grid or Flexbox component with percentage-width progress bars. This is *easier* in HTML than GDI+ — no coordinate math, hover states via CSS `:hover`, scrolling is native. Risk is in matching visual fidelity, not in technical difficulty. Create a visual comparison checklist. | Sprint 2 | UI |
| **R-09** | **Font rendering cross-platform** — Segoe UI is Windows-only. Used in ExportService for PDF and in SynthwaveColors theme implicitly. Consolas used for code-style text. | 🟡 Sprint Risk | **MEDIUM** | Define CSS fallback stack: `'Segoe UI', 'SF Pro Display', 'Noto Sans', system-ui, sans-serif`. For PDF: bundle Inter or Noto Sans as a TTF asset. For monospace: `'Cascadia Code', 'Consolas', 'JetBrains Mono', 'Fira Code', monospace`. Test on Ubuntu and macOS. | Sprint 1 (CSS), Sprint 6 (PDF) | UI + Platform |
| **R-10** | **Theme unification (synthwave-tokens.css)** — SynthwaveColors.cs defines 12 color constants as `System.Drawing.Color`. Need CSS custom properties equivalent. | 🟡 Sprint Risk | **MEDIUM** | Create `synthwave-tokens.css` with CSS custom properties mapping all 12 colors: `--deep-space`, `--neon-magenta`, `--neon-cyan`, etc. Reference from all components. One-time task with low ongoing risk. | Sprint 1 | UI |
| **R-11** | **Keyboard shortcuts + input conflicts** — Global shortcuts (arrow keys, Enter, number keys) must not fire when focus is in search boxes or text inputs. | 🟡 Sprint Risk | **MEDIUM** | Use `document.activeElement.tagName` check before handling keyboard events. Register shortcuts with Electron's `globalShortcut` for app-level bindings and DOM `keydown` for in-page navigation. Add `data-shortcut-ignore` attribute to input elements. | Sprint 3 | UI |
| **R-12** | **File I/O paths — Windows-specific logic** — `Path.Combine`, backslash separators, `Environment.SpecialFolder` references. | 🟡 Sprint Risk | **MEDIUM** | Use Node.js `path.join()` (cross-platform by default). Replace `Environment.SpecialFolder` with `app.getPath('userData')`. Audit all file operations for hardcoded `\\` separators. | Sprint 0 | Backend |
| **R-13** | **Missing service methods in port plan** — `GetKBLinksForQuestion()` exists in ReferenceService.cs but may not be in the port plan. `GetGeneralResources()` also needs porting. | 🟡 Sprint Risk | **MEDIUM** | Audit ReferenceService.cs public API surface and ensure all 3 methods are in the port plan: `GetReferenceForQuestion()`, `GetKBLinksForQuestion()`, `GetGeneralResources()`. Note: `GetBibleSections` does NOT exist — remove from risk list. | Sprint 1 | Backend |
| **R-14** | **Blueprint keyword typos** — 496 LOC of hardcoded exam blueprint data in BlueprintService.cs. Manual porting risks introducing string mismatches. | 🟡 Sprint Risk | **MEDIUM** | Do NOT hand-port blueprint data. Export from C# to JSON programmatically (`JsonSerializer.Serialize`), then `require()` the JSON in JS. Zero manual transcription = zero typo risk. Validate with diff against C# output. | Sprint 1 | Backend |
| **R-15** | **Blueprint coverage accuracy validation** — Coverage percentages must exactly match C# baseline. Differences could indicate case-sensitivity, rounding, or logic bugs. | 🟡 Sprint Risk | **MEDIUM** | Generate a coverage snapshot from the C# app for all exam files. Write an automated comparison test that runs the JS coverage calculator against the same inputs and asserts identical results. Gate Sprint 4 completion on 100% match. | Sprint 4 | Backend |
| **R-16** | **IndexedDB + contextIsolation quirk** — Known Electron issue where IndexedDB access fails with certain `contextIsolation` + `sandbox` configurations. | 🟡 Sprint Risk | **MEDIUM** | If using IndexedDB for persistence: test early in Sprint 0 spike. Alternatively, use `electron-store` (JSON file) or SQLite via `better-sqlite3` for simpler persistence. The dataset is small (<100KB) — file-based storage may be simpler. | Sprint 5 | Platform |
| **R-17** | **Window management — single-window tab approach** — Current app is multi-form (MainForm + LabSimulatorForm). Electron port proposes single window with tabs/views. | 🟡 Sprint Risk | **MEDIUM** | Use `BrowserView` or `<webview>` tag for Lab Simulator within main window, or open as a separate `BrowserWindow`. Tab UI is cosmetic; the real risk is managing the LabSimulator lifecycle (create/destroy on navigation). | Sprint 2 | UI |
| **R-18** | **macOS code signing** — Apple requires $99/yr developer account + notarization for distribution. Without it, users get "unidentified developer" warning. | 🟡 Sprint Risk | **MEDIUM** | Ship unsigned for alpha/beta (document Gatekeeper bypass for testers). Budget for Apple Developer Program before public release. Use `electron-builder`'s built-in signing support when ready. Not a technical risk — purely financial/process. | Sprint 7 | PM |
| **R-19** | **Auto-update hosting + signing** — Electron auto-update requires a hosting strategy (GitHub Releases, S3, or custom server) and code signing on both Windows and macOS. | 🟡 Sprint Risk | **MEDIUM** | Use `electron-updater` with GitHub Releases (free for public repos). Configure `publish` in `electron-builder.yml`. Windows signing can use self-signed cert for internal distribution. Defer to Sprint 7. | Sprint 7 | PM + Platform |
| **R-20** | **AnimatedProgressBar GDI+ → CSS** — 81 LOC with sin-wave glow and scanline overlay. | 🟢 Watch | **LOW** | CSS `@keyframes` with `box-shadow` glow + pseudo-element scanline. Simpler than GDI+ version. May even look better with GPU-accelerated CSS animations. | Sprint 2 | UI |
| **R-21** | **Timer drift** — Current `System.Windows.Forms.Timer` may accumulate drift. JS `setInterval` has the same issue. | 🟢 Watch | **LOW** | Use `Date.now()` delta for elapsed time display (not interval counting). Store `startTime` and compute `elapsed = Date.now() - startTime` on each tick. Standard JS pattern. | Sprint 3 | UI |
| **R-22** | **Regex translation** — 4 `[GeneratedRegex]` patterns: question headers, domain headers, options, answers. All are simple anchored line patterns. | 🟢 Watch | **LOW** | Direct JS `RegExp` equivalents. `^###\s+Q(\d+)` → `/^###\s+Q(\d+)/`. Validate with the existing question files as test fixtures. Sprint 0 task, near-zero risk. | Sprint 0 | Backend |
| **R-23** | **Line-ending normalization** — CRLF vs LF differences when parsing .md files cross-platform. | 🟢 Watch | **LOW** | `content.split(/\r?\n/)` handles both. QuestionParser already uses `TrimEnd()`. JS equivalent is `.trimEnd()`. Non-issue with standard patterns. | Sprint 0 | Backend |
| **R-24** | **Data model mapping** — `Question.cs` and `BlueprintObjective.cs` to JS classes/objects. | 🟢 Watch | **LOW** | Straightforward property-for-property mapping. Consider TypeScript interfaces for type safety. Small models, no inheritance hierarchy. | Sprint 0 | Backend |
| **R-25** | **Startup performance** — Current app loads <100ms. Electron has ~2-3s cold start overhead. | 🟢 Watch | **LOW** | Electron cold start is unavoidable but acceptable for a desktop study app. Warm starts are fast. Show splash/skeleton UI during load. Not a real risk for this app category. | Sprint 7 | Platform |
| **R-26** | **Electron binary size (~150MB vs ~30MB .NET)** — 5× larger distributable. | 🟢 Watch | **LOW** | Industry-standard tradeoff for cross-platform desktop apps. Use `electron-builder` with `asar` compression. Consider Electron Forge for optimized builds. Not a blocker for a study tool. | Sprint 7 | Platform |
| **R-27** | **Emoji rendering in reference text** — 📁 🪣 emoji in study content. | 🟢 Watch | **LOW** | Chromium (Electron's renderer) has excellent emoji support. This is a non-issue — HTML renders emoji natively. Only risk is PDF export (pdfkit + emoji = use emoji-aware font). | Sprint 1 | UI |
| **R-28** | **Rich text URLs in explanations** — Need `shell.openExternal()` for opening links in default browser. | 🟢 Watch | **LOW** | Standard Electron pattern. Intercept `<a>` clicks with `will-navigate` event, call `shell.openExternal(url)`. Well-documented, trivial. | Sprint 2 | UI |
| **R-29** | **Dynamic text wrapping for long stems** — Long question text needs proper wrapping in option cards. | 🟢 Watch | **LOW** | HTML handles text wrapping natively via CSS `word-wrap: break-word`. Easier than the WinForms equivalent. Not a real risk. | Sprint 2 | UI |
| **R-30** | **Accessibility** — Not present in current app. Net new feature for Electron port. | 🟢 Watch | **LOW** | Opportunity, not risk. HTML/ARIA is inherently more accessible than WinForms GDI+. Add `role`, `aria-label`, and keyboard navigation as enhancement. Not a blocker. | Sprint 4+ | UI |
| **R-31** | **Linux packaging** — .deb, .rpm, AppImage, Snap, Flatpak distribution. | 🟢 Watch | **LOW** | `electron-builder` handles all formats with config. One-time setup in Sprint 7. Well-trodden path. | Sprint 7 | Platform |
| **R-32** | **File watcher for .md changes** — Detect content file changes at runtime. | 🟢 Watch | **LOW** | Node.js `fs.watch()` or `chokidar` package. Simple feature, not present in C# version either. Add as enhancement if desired. | Sprint 4+ | Backend |
| **R-33** | **Option cards rendering** — Multiple-choice option display. | 🟢 Watch | **LOW** | HTML is the natural medium for card-based UI. CSS flexbox + hover states. Strictly easier than WinForms. | Sprint 2 | UI |
| **R-34** | **Explanation panel** — Collapsible panel showing answer explanations. | 🟢 Watch | **LOW** | HTML `<details>` / `<summary>` or simple CSS toggle. Native HTML pattern. | Sprint 2 | UI |

---

## Risk Heatmap Summary

```
                     LOW          MEDIUM          HIGH
                  ┌────────────┬──────────────┬──────────────┐
  Blockers        │            │              │ R-01, R-02   │
                  ├────────────┼──────────────┼──────────────┤
  Sprint Risks    │            │ R-04 → R-19  │ R-03         │
                  ├────────────┼──────────────┼──────────────┤
  Watch Items     │ R-20 → R-34│              │              │
                  └────────────┴──────────────┴──────────────┘
```

**Totals**: 2 Blockers (HIGH) · 1 Sprint Risk (HIGH) · 16 Sprint Risks (MEDIUM) · 15 Watch Items (LOW)

---

## Sprint Risk Loading

| Sprint | Risks Addressed | Load |
|--------|----------------|------|
| Sprint 0 | R-01 (design), R-02 (strategy), R-12, R-22, R-23, R-24 | 🟡 Moderate — foundational decisions |
| Sprint 1 | R-03 (PoC), R-05, R-09 (CSS), R-10, R-13, R-14, R-27 | 🔴 Heavy — validate early |
| Sprint 2 | R-01 (implement), R-08, R-17, R-20, R-28, R-29, R-33, R-34 | 🔴 Heavy — MainForm decomposition is here |
| Sprint 3 | R-11, R-21 | 🟢 Light |
| Sprint 4 | R-15, R-30 | 🟡 Moderate — coverage validation is critical |
| Sprint 5 | R-04, R-06, R-07, R-16 | 🟡 Moderate — platform concerns |
| Sprint 6 | R-03 (full), R-09 (PDF) | 🟡 Moderate — PDF is complex but scoped |
| Sprint 7 | R-18, R-19, R-25, R-26, R-31 | 🟢 Light — packaging/distribution |

---

## Top 5 Actions for Project Kickoff

1. **Sprint 0, Day 1**: Design the `StudySessionStore` state architecture (R-01). This unblocks all Sprint 2 UI work. Produce a state interface document before writing any Electron code.

2. **Sprint 0, Day 1**: Define error handling patterns (R-02). Write a `handleIPC()` wrapper function template that all IPC handlers must use. Establish logging from the start.

3. **Sprint 1, Week 1**: Build a PDF proof-of-concept (R-03). Export one exam to PDF using pdfkit. If the API mismatch is worse than expected, evaluate alternatives (Puppeteer `page.pdf()`, or `@react-pdf/renderer`) before committing to Sprint 6.

4. **Sprint 1, Week 1**: Export BlueprintService data to JSON programmatically (R-14). Do NOT hand-copy 496 lines of blueprint data. This eliminates an entire class of bugs.

5. **Sprint 1, Week 2**: Run case-insensitive coverage calculation against C# baseline (R-05, R-15). Establish the comparison test harness early so coverage bugs surface immediately, not in Sprint 4.

---

## Removed / Invalid Risks

| Original Risk | Reason for Removal |
|--------------|-------------------|
| `GetBibleSections` missing | Method does not exist in the C# codebase. `GetKBLinksForQuestion()` exists and is tracked in R-13. |
| Dict key case-sensitivity (separate from R-05) | Same root cause as R-05. Merged. |
| `pdfkit feature parity` (rated LOW by backend) | Merged into R-03. Backend underrated the API paradigm shift; the risk is in the reimplementation effort, not in missing features. |

---

*This register should be reviewed at the start of each sprint and updated as risks are resolved or new risks emerge.*
