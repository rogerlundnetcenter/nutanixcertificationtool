# 🎯 CertStudy — Electron (Linux / Cross-Platform)

[![Electron 34](https://img.shields.io/badge/Electron-34-47848F?logo=electron)](https://www.electronjs.org/)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-175%20passing-brightgreen)]()
[![License](https://img.shields.io/badge/License-BSD%203--Clause-green)](../LICENSE)
[![Questions](https://img.shields.io/badge/Questions-1%2C438-orange)]()
[![Status](https://img.shields.io/badge/Status-Alpha-yellow)]()

Cross-platform Electron port of the [Nutanix Certification Study Tool](../README.md) — bringing **1,438 validated practice questions**, a full **Lab Simulator**, and **blueprint coverage tracking** to Linux, macOS, and Windows.

> **Ported from:** .NET 8 WinForms + WebView2 (Windows-only)  
> **Why:** The original app requires WebView2 and WinForms, which are Windows-only. This port enables Linux users (and macOS) to study for Nutanix certifications with the same feature set.

---

## ✨ Features

### Quiz Engine
- **1,438 practice questions** across 4 Nutanix certifications
- **Study Mode** — immediate feedback with detailed explanations after each answer
- **Test Mode** — timed (120 or 180 min), 75-question random subset, auto-advance after submit
- **Exam Simulator** — full scored practice exam on a 6,000-point scale (3,000 to pass)
- **Answer randomization** toggle for varied practice
- **Review Mistakes** mode — drill only the questions you got wrong
- **Keyboard shortcuts** — 1–5 select options, Enter submit, N/P navigate, B toggle blueprint, S submit

### Blueprint Coverage
- **71 exam objectives** across 4 certifications with per-domain/per-objective tracking
- Color-coded progress bars (green ≥75%, amber ≥50%, red <50%)
- Click any objective to filter to matching questions

### Explanation Panel
- Blueprint objectives matched to the current question
- Reference material from the built-in knowledge base
- KB documentation links (opens in default browser)
- General resources per exam

### Lab Simulator
- Full interactive lab environment (49 views, 15,106 LOC)
- Simulates Nutanix Prism Element, Prism Central, and AI Infrastructure
- CLI terminal with command parsing
- Persistent state via IndexedDB

### PDF Export
- Export current exam or all exams (with or without answer keys)
- Formatted PDF with title pages, page numbers, and page breaks
- pdfkit-based rendering (no print dialog needed)

### Desktop Experience
- Synthwave-themed UI with neon cyan/purple/pink color scheme
- Application menu bar (File, View, Help)
- Window state persistence (size, position, maximized state)
- Toast notifications for user feedback
- Reduced motion support for accessibility

---

## 📋 Supported Certifications

| Exam | Questions | Domains |
|------|-----------|---------|
| **NCM-MCI 6.10** — Multicloud Infrastructure (Master) | 350 | Storage, Networking, VMs, Cluster Admin, Security |
| **NCP-CI 6.10** — Cloud Integration | 363 | AWS, Azure, NC2, Cluster Management |
| **NCP-US 6.10** — Unified Storage | 400 | Files, Objects, Volumes, Data Protection |
| **NCP-AI 6.10** — AI Infrastructure | 325 | NAI, GPUs, Model Management, RAG |

---

## 🚀 Quick Start (Linux)

### Prerequisites

- **Node.js 22+** — install via [nvm](https://github.com/nvm-sh/nvm) (recommended) or your package manager
- **Git** — `sudo apt install git`
- **System libraries** (for Electron on Debian/Ubuntu):
  ```bash
  sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libsecret-1-0
  ```

### Install & Run

```bash
# Clone the repo
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
cd nutanixcertificationtool

# Switch to the Electron branch
git checkout feature/linux-electron

# Install dependencies
cd CertStudy-Electron
npm install

# Launch the app
npm start
```

The app auto-detects the data directory (parent of `CertStudy-Electron/`). On first launch it will parse all Markdown study guides and load questions.

### Study Guide Files

The app parses Markdown study guides from the repository root. These are included in the repo:

```
NCM-MCI-Part1.md ... NCM-MCI-Part5-GapFill.md   (5 files, 350 questions)
NCP-CI-Part1.md  ... NCP-CI-Part5-GapFill.md     (5 files, 363 questions)
NCP-US-Part1.md  ... NCP-US-Part3-GapFill.md     (3 files, 400 questions)
NCP-AI-Part1.md  ... NCP-AI-Part5-GapFill.md     (5 files, 325 questions)
```

You can choose a custom data directory via **File → Choose Data Directory** in the menu bar.

---

## 🚀 Quick Start (macOS)

```bash
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
cd nutanixcertificationtool
git checkout feature/linux-electron
cd CertStudy-Electron
npm install
npm start
```

## 🚀 Quick Start (Windows)

```powershell
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
cd nutanixcertificationtool
git checkout feature/linux-electron
cd CertStudy-Electron
npm install
npm start
```

> **Note:** The original .NET WinForms version (in `CertStudy/`) is still the primary Windows app. The Electron version works on Windows but is optimized for the Linux/macOS use case.

---

## 🧪 Run Tests

```bash
# All 175 tests across 7 suites
npm test

# Individual suites
node --test tests/questionParser.test.js    # 26 tests — parser + golden baseline
node --test tests/dataValidator.test.js     # 27 tests — question validation
node --test tests/referenceService.test.js  # 15 tests — KB links + references
node --test tests/windowState.test.js       # 18 tests — window bounds persistence
node --test tests/pdfExportService.test.js  #  9 tests — PDF generation
node --test tests/blueprintService.test.js  # 47 tests — blueprint coverage
node --test tests/labHandlers.test.js       # 28 tests — lab protocol + IPC

# Watch mode (re-runs on file changes)
npm run test:watch
```

Tests use Node.js built-in test runner (`node:test`) — **zero external test dependencies**.

---

## 📦 Build & Package

```bash
# Package for current platform (creates executable in out/)
npm run package

# Build distributable installer for current platform
npm run make
```

### Linux Packages

| Format | Target | Output |
|--------|--------|--------|
| `.deb` (Debian/Ubuntu) | `npm run make` | `out/make/deb/x64/certstudy_1.0.0_amd64.deb` |
| `.rpm` (Fedora/RHEL) | `npm run make` | `out/make/rpm/x64/certstudy-1.0.0.x86_64.rpm` |
| `.zip` (portable) | `npm run make` | `out/make/zip/linux/x64/certstudy-linux-x64.zip` |

### macOS

| Format | Output |
|--------|--------|
| `.dmg` | `out/make/CertStudy.dmg` |

### Windows

| Format | Output |
|--------|--------|
| Squirrel installer | `out/make/squirrel.windows/x64/` |

---

## 🏗️ Architecture

```
CertStudy-Electron/
├── main.js                          # Main process: IPC, protocol, window, menu (310 LOC)
├── preload.js                       # contextBridge: 6 API namespaces (55 LOC)
├── forge.config.js                  # Electron Forge packaging config
├── src/
│   ├── main/
│   │   ├── services/
│   │   │   ├── questionParser.js    #   MD → Question[] parser (274 LOC, 4 regex)
│   │   │   ├── blueprintService.js  #   4 exams, 71 objectives, coverage calc (437 LOC)
│   │   │   ├── referenceService.js  #   KB links + reference cards (575 LOC)
│   │   │   ├── pdfExportService.js  #   pdfkit PDF generation (452 LOC)
│   │   │   └── dataValidator.js     #   Question validation rules
│   │   ├── ipc/
│   │   │   └── labHandlers.js       #   certstudy-lab:// protocol + lab IPC (214 LOC)
│   │   └── windowState.js           #   Window bounds save/restore with debounce
│   ├── renderer/
│   │   ├── quiz/
│   │   │   ├── index.html           #   App shell: sidebar, question panel, explanation
│   │   │   ├── css/
│   │   │   │   ├── synthwave-tokens.css  # Design tokens (colors, fonts, spacing)
│   │   │   │   ├── components.css        # Reusable components
│   │   │   │   ├── blueprint.css         # Blueprint coverage display
│   │   │   │   ├── animations.css        # 10 keyframes + reduced motion
│   │   │   │   └── quiz.css              # Quiz layout + all UI components
│   │   │   └── js/
│   │   │       └── quiz-app.js           # Complete quiz application (650 LOC)
│   │   └── lab/                     # Lab Simulator (reused, 62 files)
│   │       └── js/core/
│   │           └── BridgeClient.js  #   Electron IPC bridge (replaces WebView2)
│   └── shared/
│       └── models.js                # Question, Blueprint, ExamCodes (9 exports)
├── tests/                           # 175 tests across 7 suites
│   ├── golden_baseline.json         #   1,438 questions (ground truth from C# parser)
│   ├── helpers.js                   #   Lightweight expect() wrapper for jest-like API
│   ├── questionParser.test.js       #   26 tests
│   ├── dataValidator.test.js        #   27 tests
│   ├── referenceService.test.js     #   15 tests
│   ├── windowState.test.js          #   18 tests
│   ├── pdfExportService.test.js     #    9 tests
│   ├── blueprintService.test.js     #   47 tests
│   └── labHandlers.test.js          #   28 tests
└── ARCHITECTURE.md                  # Full IPC contract + design decisions
```

### IPC API (17 channels)

The renderer communicates with the main process through `window.certStudy.*` namespaces:

| Namespace | Channels | Purpose |
|-----------|----------|---------|
| `quiz` | `load-exams`, `get-blueprint`, `calculate-coverage`, `get-objectives`, `get-references`, `get-kb-links`, `get-general-resources`, `get-bible-sections` | Quiz data |
| `pdf` | `export-exam`, `export-all` | PDF generation |
| `fs` | `choose-data-dir`, `show-save-dialog`, `open-external` | File system |
| `store` | `get`, `set` | User preferences |
| `lab` | `message`, `notify`, `from-main` | Lab Simulator bridge |
| `app` | `get-version` | App metadata |

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Window model** | Single window + iframe for Lab | Preserves lab state on tab switch |
| **Lab protocol** | `certstudy-lab://` custom scheme | Avoids CORS issues with `file://` |
| **Bridge migration** | Clean swap of BridgeClient.js only | All 49 lab views use StateEngine, not bridge |
| **PDF export** | pdfkit (not printToPDF) | Page break control, headers/footers |
| **Fonts** | Inter + JetBrains Mono (bundled) | Cross-platform (Segoe UI is Windows-only) |
| **Test runner** | node:test (built-in) | Zero dependencies, no esbuild needed |
| **Packaging** | Electron Forge v7 | Official Electron tooling, deb/rpm/dmg/squirrel |
| **Framework** | Vanilla JS (no React/Vue) | Zero build step, minimal dependencies |

### Security Model

- `nodeIntegration: false` — renderer has no Node.js access
- `contextIsolation: true` — preload runs in isolated world
- `contextBridge` — only whitelisted APIs exposed via `window.certStudy.*`
- Content Security Policy restricts scripts to `'self'`
- `certstudy-lab://` protocol restricts to local lab files only
- File open restricted to `.pdf` files and `http(s)://` URLs

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` – `5` | Select answer option A–E |
| `Enter` | Submit answer / advance to next question |
| `N` | Next question |
| `P` | Previous question |
| `S` | Submit answer |
| `B` | Toggle blueprint panel |
| `Ctrl+E` | Export PDF |
| `Ctrl+Q` | Quit |
| `Ctrl+=` / `Ctrl+-` | Zoom in / out |
| `Ctrl+0` | Reset zoom |
| `F12` | Toggle DevTools |

---

## 🔗 Related

- [Original WinForms App](../README.md) — Windows-only .NET 8 version
- [ARCHITECTURE.md](ARCHITECTURE.md) — Full IPC contract, error handling, data flow diagrams
- [RISK_REGISTER.md](../RISK_REGISTER.md) — 34 identified risks with mitigations
- [ELECTRON-ARCHITECTURE-REVIEW.md](../ELECTRON-ARCHITECTURE-REVIEW.md) — 7-agent architecture review

---

## 📄 License

BSD 3-Clause — see [LICENSE](../LICENSE)
