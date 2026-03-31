# 🎯 Nutanix Certification Study Tool

A WinForms-based exam preparation tool for Nutanix certifications featuring 1,280 validated practice questions across 4 exams, a synthwave-themed GUI, and an integrated knowledge base with direct links to Nutanix documentation.

![.NET 8.0](https://img.shields.io/badge/.NET-8.0-blue)
![License](https://img.shields.io/badge/License-BSD%203--Clause-green)
![Questions](https://img.shields.io/badge/Questions-1%2C280-orange)
![Status](https://img.shields.io/badge/Status-Alpha-yellow)

## 📋 Supported Certifications

| Exam | Questions | Format | Duration |
|------|-----------|--------|----------|
| **NCP-US 6.10** — Unified Storage | 320 | 75 MCQ, pass 3000/6000 | 120 min |
| **NCP-CI 6.10** — Cloud Integration | 320 | 75 MCQ | 120 min |
| **NCP-AI 6.10** — AI Infrastructure | 320 | 75 MCQ | 120 min |
| **NCM-MCI 6.10** — Multicloud Infrastructure (Master) | 320 | 16-20 live lab scenarios | 180 min |

## ✨ Features

- **1,280 practice questions** — 320 per exam covering all blueprint domains
- **Mixed question formats** — Standard MCQ, multi-select ("Select TWO"), and ordering/sequence questions
- **Synthwave-themed GUI** — Dark neon aesthetic with animated progress bars
- **Explain This Question** panel — Every question has contextual explanations with:
  - Detailed reasoning for the correct answer
  - Links to relevant Nutanix KB articles
  - General documentation resources
  - Scrollable reference content
- **Keyboard shortcuts** — `1-5` select answers, `Enter` submit, `N`/`P` navigate, `E` toggle explain
- **Score tracking** — Real-time accuracy stats per exam
- **100% validated** — Every answer independently verified by LLM reasoning + KB cross-reference

## 🚀 Quick Start

### Option 1: Download Pre-Built Binary (No SDK Required)

1. Download `CertStudy-v0.1.0-alpha-win-x64.zip` from the [Releases](https://github.com/rogerlundnetcenter/nutanixcertificationtool/releases) page or from the repo root (tracked via Git LFS)
2. Extract the zip
3. Run `CertStudy.exe`

> **Note:** This is a self-contained Windows x64 build — no .NET runtime installation needed.

### Option 2: Build From Source

**Prerequisites:** [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (Windows)

```bash
cd CertStudy
dotnet build
dotnet run
```

To create a self-contained publish:

```bash
cd CertStudy
dotnet publish -c Release -r win-x64 --self-contained
```

The app will launch with all 4 exam tabs. Select an exam, answer questions, and use the explain panel to study.

## 📁 Project Structure

```
├── CertStudy/                    # WinForms .NET 8.0 application
│   ├── Program.cs                # Entry point
│   ├── MainForm.cs               # Main GUI (question display, explain panel, navigation)
│   ├── SynthwaveColors.cs        # Neon color scheme
│   ├── Controls/
│   │   └── AnimatedProgressBar.cs
│   ├── Models/
│   │   └── Question.cs           # Question data model
│   └── Services/
│       ├── QuestionParser.cs     # Markdown → Question parser
│       └── ReferenceService.cs   # KB references, doc links, explain content
│
├── NCP-US-Part1.md               # Unified Storage questions (Domains 1-2, 160 Q)
├── NCP-US-Part2-D3.md            # Unified Storage questions (Domain 3, 80 Q)
├── NCP-US-Part2-D4.md            # Unified Storage questions (Domain 4, 80 Q)
├── NCP-CI-Part[1-4].md           # Cloud Integration questions (80 Q each)
├── NCP-AI-Part[1-4].md           # AI Infrastructure questions (80 Q each)
├── NCM-MCI-Part[1-4].md          # Multicloud Infrastructure questions (80 Q each)
│
├── validation/                   # Validation reports & logs
│   ├── llm-val-*.log             # LLM answer validation logs (per exam)
│   ├── kb-100-*.md               # KB coverage verification reports
│   └── kb-audit-*.md             # KB audit reports
│
├── validate_answers.py           # CLI tool for batch answer validation
├── generate_questions.py         # Question generation script
├── CertStudy-v0.1.0-alpha-win-x64.zip  # Pre-built binary (Git LFS)
├── .gitattributes                # Git LFS tracking rules
├── LICENSE                       # BSD 3-Clause
└── README.md
```

## 📝 Question Format

Questions are stored in Markdown files with this structure:

```markdown
### Q1
What is the minimum number of FSVMs required for a Nutanix Files deployment?

A. 1
B. 2
C. 3
D. 4

**Answer: C**

Nutanix Files requires a minimum of 3 File Server VMs (FSVMs) for high availability...
```

Multi-select and ordering questions are also supported:

```markdown
### Q61 (Select TWO)
Which two components are required before deploying NC2 on AWS?

A. IAM roles
B. VPN gateway
C. Subnet configuration
D. On-premises Prism Central

**Answer: A, C**
```

## 🔍 Validation

All 1,280 questions have been through multiple validation passes:

1. **LLM Answer Validation** — Each question independently answered and compared against marked answers (100% agreement rate)
2. **KB Cross-Reference** — Every question matched to Nutanix knowledge base articles (100% coverage)
3. **Expert Review** — Incorrect/ambiguous answers identified and corrected across all exams

Validation logs are in the `validation/` directory.

## 🎨 Screenshots

The app features a synthwave/cyberpunk aesthetic with:
- Deep space background (#0B0B1A)
- Neon magenta accents (#FF2D95)
- Neon cyan highlights (#00F0FF)
- Animated progress bars with glow effects

## ⚠️ Disclaimer

This tool is for **study purposes only**. Questions are generated based on publicly available exam blueprints, Nutanix documentation, and community resources. This is not affiliated with or endorsed by Nutanix, Inc. Actual certification exam questions will differ.

## 📄 License

BSD 3-Clause License — see [LICENSE](LICENSE) for details.

## 📦 Git LFS

This repository uses [Git LFS](https://git-lfs.github.com/) to track large binary files (`.zip`, `.exe`, `.dll`). Make sure Git LFS is installed before cloning:

```bash
git lfs install
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Answer randomization (reduce position bias)
- Timed exam simulation mode
- Question difficulty ratings
- Additional certification exams
- Cross-platform support (Avalonia/MAUI)
