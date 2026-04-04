# 🎯 CertStudy — Electron (Linux / Cross-Platform)

[![Electron 34](https://img.shields.io/badge/Electron-34-47848F?logo=electron)](https://www.electronjs.org/)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-green)](../LICENSE)
[![Questions](https://img.shields.io/badge/Questions-1%2C438-orange)]()
[![Status](https://img.shields.io/badge/Status-Alpha-yellow)]()

Cross-platform Electron port of the [Nutanix Certification Study Tool](../README.md) — bringing **1,438 validated practice questions** and the full **Lab Simulator** to Linux, macOS, and Windows.

> **Ported from:** .NET 8 WinForms + WebView2 (Windows-only)  
> **Why:** The original app requires WebView2 and WinForms, which are Windows-only. This port enables Linux users to study for Nutanix certifications.

---

## 📋 Supported Certifications

| Exam | Questions | Domains |
|------|-----------|---------|
| **NCM-MCI 6.10** — Multicloud Infrastructure (Master) | 350 | Storage, Networking, VMs, Cluster Admin, Security |
| **NCP-CI 6.10** — Cloud Integration | 363 | AWS, Azure, NC2, Cluster Management |
| **NCP-US 6.10** — Unified Storage | 400 | Files, Objects, Volumes, Data Protection |
| **NCP-AI 6.10** — AI Infrastructure | 325 | NAI, GPUs, Model Management, RAG |

## 🚀 Quick Start (Linux)

### Prerequisites

- **Node.js 22+** — `sudo apt install nodejs npm` or use [nvm](https://github.com/nvm-sh/nvm)
- **Git** — `sudo apt install git`

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

### Study Guide Files

The app parses Markdown study guides from the repository root. These are included in the repo:

```
NCM-MCI-Part1.md ... NCM-MCI-Part5-GapFill.md
NCP-CI-Part1.md  ... NCP-CI-Part5-GapFill.md
NCP-US-Part1.md  ... NCP-US-Part3-GapFill.md
NCP-AI-Part1.md  ... NCP-AI-Part5-GapFill.md
```

On first launch, the app auto-detects the data directory. You can also choose a custom directory via the UI.

## 🧪 Run Tests

```bash
# All tests (57 tests across 3 suites)
npm test

# Individual suites
node --test tests/questionParser.test.js    # 26 tests — parser + golden baseline
node --test tests/dataValidator.test.js     # 16 tests — question validation
node --test tests/referenceService.test.js  # 15 tests — KB links + references
```

Tests use Node.js built-in test runner (`node:test`) — no external test framework needed.

## 📦 Build & Package

```bash
# Package for current platform
npm run package

# Build distributable (deb/rpm on Linux, dmg on macOS, squirrel on Windows)
npm run make
```

### Linux Packages

| Format | Command | Output |
|--------|---------|--------|
| `.deb` (Debian/Ubuntu) | `npm run make` | `out/make/deb/x64/certstudy_1.0.0_amd64.deb` |
| `.rpm` (Fedora/RHEL) | `npm run make` | `out/make/rpm/x64/certstudy-1.0.0.x86_64.rpm` |
| `.zip` (portable) | `npm run make` | `out/make/zip/linux/x64/certstudy-linux-x64.zip` |

## 🏗️ Architecture

```
CertStudy-Electron/
├── main.js                        # Electron main process (IPC, protocol, window)
├── preload.js                     # contextBridge — secure API exposure
├── forge.config.js                # Electron Forge packaging config
├── src/
│   ├── main/services/             # Node.js backend services
│   │   ├── questionParser.js      #   MD → Question[] (4 regex, state machine)
│   │   ├── referenceService.js    #   Keyword → KB links + reference cards
│   │   └── dataValidator.js       #   Question validation rules
│   ├── renderer/
│   │   ├── quiz/                  # Quiz UI (HTML/CSS/JS)
│   │   │   ├── index.html         #   App shell with sidebar + question panel
│   │   │   ├── css/               #   Synthwave design system (5 files)
│   │   │   └── js/                #   Quiz app logic
│   │   └── lab/                   # Lab Simulator (reused from WinForms)
│   │       └── js/core/
│   │           └── BridgeClient.js #   Electron IPC bridge (replaces WebView2)
│   └── shared/
│       └── models.js              # Question, Blueprint, ExamCodes (9 exports)
├── tests/                         # node:test suites + golden baseline
│   ├── golden_baseline.json       #   1,438 questions (ground truth)
│   └── *.test.js                  #   57 tests
└── ARCHITECTURE.md                # Full IPC contract + design decisions
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Window model** | Single window + iframe for Lab | Preserves lab state on tab switch |
| **Lab protocol** | `certstudy-lab://` custom scheme | Avoids CORS issues with `file://` |
| **Bridge migration** | Clean swap of BridgeClient.js only | All 49 lab views use StateEngine, not bridge |
| **PDF export** | pdfkit (not printToPDF) | Page break control, headers/footers |
| **Fonts** | Inter + JetBrains Mono | Cross-platform (Segoe UI is Windows-only) |
| **Test runner** | node:test (built-in) | Zero dependencies, no esbuild needed |
| **Packaging** | Electron Forge v7 | Official Electron tooling, deb/rpm/dmg/squirrel |

### Security Model

- `nodeIntegration: false` — renderer has no Node.js access
- `contextIsolation: true` — preload runs in isolated world
- `contextBridge` — only whitelisted APIs exposed (`window.certStudy.*`)
- Content Security Policy restricts scripts to `'self'`

## 🔗 Related

- [Original WinForms App](../README.md) — Windows-only .NET 8 version
- [ARCHITECTURE.md](ARCHITECTURE.md) — Full IPC contract, error handling, data flow diagrams
- [RISK_REGISTER.md](../RISK_REGISTER.md) — 34 identified risks with mitigations

## 📄 License

BSD 3-Clause — see [LICENSE](../LICENSE)
