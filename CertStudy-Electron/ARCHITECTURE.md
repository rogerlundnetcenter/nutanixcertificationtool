# CertStudy Electron — Architecture

> **Version:** 1.0.0-alpha.1  
> **Platform:** Electron 34 (Chromium 132+, Node.js 22 LTS)  
> **Ported from:** .NET 8 WinForms + WebView2  
> **License:** BSD-3-Clause

---

## Table of Contents

- [1. Architecture Overview](#1-architecture-overview)
  - [1.1 Process Model](#11-process-model)
  - [1.2 Security Model](#12-security-model)
  - [1.3 Directory Structure](#13-directory-structure)
  - [1.4 Data Flow — Quiz](#14-data-flow--quiz)
  - [1.5 Data Flow — Lab Simulator](#15-data-flow--lab-simulator)
  - [1.6 Custom Protocol](#16-custom-protocol-certstudy-lab)
- [2. IPC Contract Specification](#2-ipc-contract-specification)
  - [2.1 Channel Summary](#21-channel-summary)
  - [2.2 Quiz Channels](#22-quiz-channels)
  - [2.3 File System Channels](#23-file-system-channels)
  - [2.4 Store Channels](#24-store-channels)
  - [2.5 PDF Export Channels](#25-pdf-export-channels)
  - [2.6 Lab Simulator Channels](#26-lab-simulator-channels)
  - [2.7 App Info Channels](#27-app-info-channels)
- [3. Error Handling Patterns](#3-error-handling-patterns)
  - [3.1 IPC Response Envelope](#31-ipc-response-envelope)
  - [3.2 Error Codes](#32-error-codes)
  - [3.3 IPC Handler Wrapper](#33-ipc-handler-wrapper)
  - [3.4 Process-Level Error Handling](#34-process-level-error-handling)
- [4. Key Design Decisions](#4-key-design-decisions)
- [5. Development Guide](#5-development-guide)
  - [5.1 Prerequisites](#51-prerequisites)
  - [5.2 Setup](#52-setup)
  - [5.3 Running the App](#53-running-the-app)
  - [5.4 Running Tests](#54-running-tests)
  - [5.5 Linting](#55-linting)
  - [5.6 Building / Packaging](#56-building--packaging)
  - [5.7 Code Style Conventions](#57-code-style-conventions)

---

## 1. Architecture Overview

### 1.1 Process Model

CertStudy uses Electron's two-process architecture:

```
┌─────────────────────────────────────────────────────┐
│  Main Process (Node.js)                             │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ questionParser│ │blueprintSvc  │ │referenceSvc │  │
│  └──────────────┘ └──────────────┘ └─────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ exportService│ │ electron-store│ │data-directory│  │
│  └──────────────┘ └──────────────┘ └─────────────┘  │
│                        │                             │
│              ipcMain.handle()                        │
├────────────────────────┼────────────────────────────┤
│              contextBridge                           │
├────────────────────────┼────────────────────────────┤
│  Renderer Process      │ (Chromium)                  │
│  ┌────────────────────────────────────────────────┐  │
│  │  Quiz UI  (src/renderer/quiz/)                 │  │
│  │  ┌──────────┐ ┌───────────────────────────┐    │  │
│  │  │ Sidebar  │ │ Content Area              │    │  │
│  │  │ - Exams  │ │ - Question + Options      │    │  │
│  │  │ - Mode   │ │ - Explanation Panel       │    │  │
│  │  │ - Stats  │ │ - Blueprint Panel         │    │  │
│  │  │ - Export │ │                           │    │  │
│  │  └──────────┘ └───────────────────────────┘    │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Lab Simulator (iframe, loaded on demand)      │  │
│  │  certstudy-lab://lab/index.html                │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Main process** — Runs all Node.js services (question parsing, blueprint lookups, reference matching, PDF export, preferences). No service logic runs in the renderer.

**Renderer process** — Single `BrowserWindow` hosting the quiz UI with an `<iframe>` slot for the lab simulator SPA. The lab SPA is loaded on demand via the `certstudy-lab://` custom protocol.

### 1.2 Security Model

| Setting | Value | Notes |
|---------|-------|-------|
| `nodeIntegration` | `false` | Never enable |
| `contextIsolation` | `true` | Required — default since Electron 12 |
| `sandbox` | `true` | Renderer sandbox enabled |
| `webviewTag` | `false` | Explicitly disabled |
| `webSecurity` | `true` | Never disable |
| `allowRunningInsecureContent` | `false` | Default |

**Preload surface:** The preload script (`preload.js`) exposes a minimal `window.certStudy` API via `contextBridge.exposeInMainWorld()`. No raw `ipcRenderer`, `fs`, `shell`, or Node.js APIs are exposed to the renderer.

**Content Security Policy (CSP):**

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self';
           style-src 'self' 'unsafe-inline';
           img-src 'self' data:; font-src 'self';">
```

- `'unsafe-inline'` for styles only — CSS is bundled with the app, not user-supplied
- No `eval()` or inline scripts anywhere in the codebase
- Lab simulator content served via `certstudy-lab://` is allowed by extending `default-src`

**File system access:** All file operations go through validated IPC handlers. `fs:open-external` only allows `.pdf` files. Dialog-based file selection prevents arbitrary path access.

### 1.3 Directory Structure

```
CertStudy-Electron/
├── main.js                          # Electron main process entry point
├── preload.js                       # contextBridge — IPC API surface
├── package.json                     # Dependencies and scripts
├── forge.config.js                  # Electron Forge packaging config
├── vitest.config.js                 # Test runner configuration
├── src/
│   ├── main/                        # Main process code
│   │   ├── services/                # Node.js service modules
│   │   │   ├── questionParser.js    # Markdown → Question[] parser
│   │   │   ├── blueprintService.js  # Exam blueprint data & coverage
│   │   │   ├── referenceService.js  # Nutanix Bible & KB link lookups
│   │   │   ├── exportService.js     # PDF export (pdfkit)
│   │   │   └── pdf-worker.js        # Worker thread for PDF generation
│   │   └── ipc/                     # IPC handler registration
│   ├── renderer/                    # Renderer process code
│   │   ├── quiz/                    # Quiz UI (HTML/CSS/JS)
│   │   │   ├── index.html           # App shell with sidebar + content
│   │   │   ├── css/
│   │   │   │   ├── synthwave-tokens.css  # Design tokens (colors, fonts)
│   │   │   │   └── quiz.css              # Quiz-specific styles
│   │   │   └── js/
│   │   │       ├── quiz-app.js      # Quiz bootstrap (ES6 module)
│   │   │       ├── components/      # Reusable UI components
│   │   │       └── views/           # View modules
│   │   └── lab/                     # Lab Simulator SPA (minimal changes)
│   └── shared/                      # Shared utilities (exam code normalization)
├── assets/
│   ├── fonts/                       # Inter, JetBrains Mono (bundled, SIL OFL)
│   └── icons/                       # App icons (png, ico, icns)
└── tests/                           # Vitest test files
```

### 1.4 Data Flow — Quiz

```
User selects exam
       │
       ▼
Renderer: window.certStudy.quiz.loadExams(dataDir)
       │
       ▼  ipcRenderer.invoke('quiz:load-exams')
       │
Main Process: questionParser.loadAllExams()
  ├── Read NCP-US*.md, NCP-CI*.md, NCP-AI*.md, NCM-MCI*.md
  ├── Parse questions (regex: headers, options, answers)
  └── Return { [examCode]: Question[] }
       │
       ▼
Renderer: renders exam buttons → user picks exam → displays questions
       │
       ▼
User answers → renderer tracks score locally
       │
       ▼ (on explanation show)
Renderer: window.certStudy.quiz.getReferences(examCode, text)
          window.certStudy.quiz.getKBLinks(examCode, text)
       │
       ▼
Main Process: referenceService keyword matching → return results
```

### 1.5 Data Flow — Lab Simulator

```
User clicks "Lab Simulator" tab
       │
       ▼
Renderer: loads <iframe src="certstudy-lab://lab/index.html">
       │
       ▼
Lab SPA boots → BridgeClient.js uses window.certStudy.lab.*
       │
       ├── lab.send(type, payload)  →  ipcRenderer.invoke('lab:message')
       │                                    → Main process handler
       │                                    → response returned
       │
       ├── lab.post(type, payload)  →  ipcRenderer.send('lab:notify')
       │                                    → fire-and-forget
       │
       └── lab.onMessage(callback)  ←  ipcRenderer.on('lab:from-main')
                                            ← push from main process
```

### 1.6 Custom Protocol (`certstudy-lab://`)

The lab simulator SPA is served via a custom protocol registered before `app.ready`:

```javascript
protocol.registerSchemesAsPrivileged([{
  scheme: 'certstudy-lab',
  privileges: {
    standard: true,        // Enables relative URL resolution
    secure: true,          // Treated as secure origin
    supportFetchAPI: true, // fetch() works with this scheme
    corsEnabled: false,    // No CORS restrictions (local content)
    stream: true,          // Streaming responses supported
  }
}]);
```

**Why not `file://`?** — `file://` URLs have quirky security restrictions on Linux, cannot set CSP headers cleanly, and prevent CORS-free ES6 module imports.

**Directory traversal prevention:** The protocol handler validates that resolved paths stay within the lab root directory:

```javascript
protocol.handle('certstudy-lab', (request) => {
  const url = new URL(request.url);
  const filePath = path.join(labRoot, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(labRoot)) {
    return new Response('Forbidden', { status: 403 });
  }
  return net.fetch(`file://${filePath}`);
});
```

---

## 2. IPC Contract Specification

All IPC uses Electron's `invoke`/`handle` pattern (request-response) or `send`/`on` (fire-and-forget). Every channel is registered in `main.js` via `setupIPC()` and exposed in `preload.js` via `contextBridge`.

### 2.1 Channel Summary

| # | Channel | Direction | Method | Purpose |
|---|---------|-----------|--------|---------|
| 1 | `quiz:load-exams` | R→M | invoke | Load and parse all markdown exam files |
| 2 | `quiz:get-blueprint` | R→M | invoke | Get exam blueprint structure |
| 3 | `quiz:calculate-coverage` | R→M | invoke | Map questions to blueprint objectives |
| 4 | `quiz:get-objectives` | R→M | invoke | Get objectives matching a question |
| 5 | `quiz:get-references` | R→M | invoke | Get Nutanix Bible references for text |
| 6 | `quiz:get-kb-links` | R→M | invoke | Get KB documentation links |
| 7 | `quiz:get-general-resources` | R→M | invoke | Get general resource list for exam |
| 8 | `fs:choose-data-dir` | R→M | invoke | Show native folder picker dialog |
| 9 | `fs:show-save-dialog` | R→M | invoke | Show native save file dialog |
| 10 | `fs:open-external` | R→M | invoke | Open a file in the default OS app |
| 11 | `store:get` | R→M | invoke | Read a preference value |
| 12 | `store:set` | R→M | invoke | Write a preference value |
| 13 | `pdf:export-exam` | R→M | invoke | Export a single exam to PDF |
| 14 | `pdf:export-all` | R→M | invoke | Export all exams to combined PDF |
| 15 | `lab:message` | R→M | invoke | Request-response lab bridge message |
| 16 | `lab:notify` | R→M | send | Fire-and-forget lab notification |
| 17 | `lab:from-main` | M→R | send | Push message from main to lab |
| 18 | `app:get-version` | R→M | invoke | Get app and runtime version info |

**R = Renderer, M = Main**

### 2.2 Quiz Channels

#### `quiz:load-exams`

Load and parse all certification exam markdown files from a data directory.

| Property | Value |
|----------|-------|
| Channel | `quiz:load-exams` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `dataDir` | `string \| null` | No | Path to data directory. If null, uses auto-detection. |

**Response:** `{ [examCode: string]: Question[] }`

```javascript
// Question shape
{
  id: number,
  examCode: string,           // e.g. "NCP-US"
  domain: string,             // e.g. "Domain 1: Configuration"
  stem: string,               // Question text (may be multiline)
  options: [
    { letter: string, text: string }  // e.g. { letter: "A", text: "Prism Central" }
  ],
  correctAnswers: string[],   // e.g. ["B", "D"]
  explanation: string,
  sourceFile: string,         // e.g. "NCP-US-Part1.md"
}
```

**Example:**

```javascript
const exams = await window.certStudy.quiz.loadExams(null);
// exams = { "NCP-US": [...], "NCP-CI": [...], "NCP-AI": [...], "NCM-MCI": [...] }
```

#### `quiz:get-blueprint`

Get the blueprint (exam structure, objectives, passing criteria) for an exam.

| Property | Value |
|----------|-------|
| Channel | `quiz:get-blueprint` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code (e.g. `"NCP-AI"`) |

**Response:** `ExamBlueprint | null`

```javascript
// ExamBlueprint shape
{
  examCode: string,
  examTitle: string,            // e.g. "NCP-AI 6.10 — AI Infrastructure"
  questionCount: number,        // e.g. 75
  timeLimitMinutes: number,     // e.g. 120
  passingScore: string,         // e.g. "3000/6000"
  sections: [{
    sectionNumber: number,
    sectionTitle: string,
    objectives: [{
      id: string,               // e.g. "1.1"
      title: string,
      keywords: string[],
      knowledge: string[],
    }]
  }]
}
```

#### `quiz:calculate-coverage`

Calculate which blueprint objectives are covered by a set of questions.

| Property | Value |
|----------|-------|
| Channel | `quiz:calculate-coverage` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code |
| `questionTexts` | `string[]` | Yes | Array of question stem texts |

**Response:** `{ [objectiveId: string]: number }` — Map of objective IDs to match counts.

#### `quiz:get-objectives`

Get blueprint objectives that match a specific question.

| Property | Value |
|----------|-------|
| Channel | `quiz:get-objectives` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code |
| `text` | `string` | Yes | Question stem text |

**Response:** `[{ id: string, title: string }]`

#### `quiz:get-references`

Get Nutanix Bible reference sections matching a question.

| Property | Value |
|----------|-------|
| Channel | `quiz:get-references` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code |
| `text` | `string` | Yes | Question stem + option text |

**Response:** `string[]` — Array of reference descriptions.

#### `quiz:get-kb-links`

Get Nutanix KB documentation links matching a question. Uses scored keyword matching with URL deduplication.

| Property | Value |
|----------|-------|
| Channel | `quiz:get-kb-links` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code |
| `text` | `string` | Yes | Question stem + option text |

**Response:** `[{ title: string, url: string }]`

#### `quiz:get-general-resources`

Get general study resources for an exam (not question-specific).

| Property | Value |
|----------|-------|
| Channel | `quiz:get-general-resources` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examCode` | `string` | Yes | Exam code |

**Response:** `[{ title: string, url: string }]`

### 2.3 File System Channels

#### `fs:choose-data-dir`

Show a native OS folder picker dialog for selecting the question data directory.

| Property | Value |
|----------|-------|
| Channel | `fs:choose-data-dir` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:** None

**Response:** `string | null` — Selected directory path, or `null` if cancelled.

#### `fs:show-save-dialog`

Show a native OS save dialog (used for PDF export).

| Property | Value |
|----------|-------|
| Channel | `fs:show-save-dialog` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `object` | No | Dialog options |
| `options.title` | `string` | No | Dialog title. Default: `"Save File"` |
| `options.defaultName` | `string` | No | Default filename. Default: `"export.pdf"` |
| `options.filters` | `FileFilter[]` | No | File type filters. Default: PDF only |

**Response:** `string | null` — Chosen file path, or `null` if cancelled.

#### `fs:open-external`

Open a file in the default OS application. **Security: only `.pdf` files are allowed.**

| Property | Value |
|----------|-------|
| Channel | `fs:open-external` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filePath` | `string` | Yes | Absolute path to a `.pdf` file |

**Response:** `void`

### 2.4 Store Channels

Preferences are persisted via `electron-store` in the OS-standard user data directory (`app.getPath('userData')`).

**Schema:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `dataDirectory` | `string` | — | Custom data directory path |
| `windowBounds` | `object` | — | `{ x, y, width, height }` |
| `lastExam` | `string` | — | Last selected exam code |
| `randomizeAnswers` | `boolean` | `true` | Shuffle answer options |
| `theme` | `string` | `"dark"` | UI theme |

#### `store:get`

| Property | Value |
|----------|-------|
| Channel | `store:get` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:** `key: string`  
**Response:** `any` — The stored value, or `undefined` if not set.

#### `store:set`

| Property | Value |
|----------|-------|
| Channel | `store:set` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:** `key: string`, `value: any`  
**Response:** `void`

### 2.5 PDF Export Channels

PDF export uses `pdfkit` running in a worker thread to avoid blocking the main process.

#### `pdf:export-exam`

Export a single exam's questions to a styled PDF document.

| Property | Value |
|----------|-------|
| Channel | `pdf:export-exam` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `examName` | `string` | Yes | Display name (e.g. `"NCP-AI 6.10"`) |
| `questions` | `Question[]` | Yes | Questions to export |
| `includeAnswers` | `boolean` | Yes | Include answer key appendix |

**Response:** `{ success: boolean, filePath?: string }`

#### `pdf:export-all`

Export all exams to a combined PDF.

| Property | Value |
|----------|-------|
| Channel | `pdf:export-all` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `exams` | `{ [examCode]: Question[] }` | Yes | All exam data |
| `includeAnswers` | `boolean` | Yes | Include answer key appendix |

**Response:** `{ success: boolean, filePath?: string }`

### 2.6 Lab Simulator Channels

These channels replace the WebView2 `PostMessage` bridge used in the WinForms version.

#### `lab:message` (Request-Response)

| Property | Value |
|----------|-------|
| Channel | `lab:message` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | Yes | Message type identifier |
| `payload` | `object` | No | Message data |

**Response:** `{ type: 'response', payload: { success: boolean, data: any } }`

#### `lab:notify` (Fire-and-Forget)

| Property | Value |
|----------|-------|
| Channel | `lab:notify` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.send` |

**Parameters:** `type: string`, `payload?: object`  
**Response:** None (fire-and-forget).

#### `lab:from-main` (Push to Renderer)

| Property | Value |
|----------|-------|
| Channel | `lab:from-main` |
| Direction | Main → Renderer |
| Method | `mainWindow.webContents.send` |

**Payload:** `{ type: string, payload: any, id?: string }`

**Renderer subscription:**

```javascript
const cleanup = window.certStudy.lab.onMessage((data) => {
  console.log(data.type, data.payload);
});
// Call cleanup() to unsubscribe
```

### 2.7 App Info Channels

#### `app:get-version`

| Property | Value |
|----------|-------|
| Channel | `app:get-version` |
| Direction | Renderer → Main |
| Method | `ipcRenderer.invoke` |

**Parameters:** None

**Response:**

```javascript
{
  app: string,       // e.g. "1.0.0-alpha.1"
  electron: string,  // e.g. "34.0.0"
  node: string,      // e.g. "22.0.0"
  chrome: string,    // e.g. "132.0.0"
  platform: string,  // "win32" | "linux" | "darwin"
}
```

---

## 3. Error Handling Patterns

### 3.1 IPC Response Envelope

All IPC handlers that can fail use a standard response envelope:

```javascript
// Success
{ success: true, data: { /* result */ } }

// Failure
{ success: false, error: { code: 'ERROR_CODE', message: 'Human-readable message', details: { /* optional */ } } }
```

**Example — successful quiz load:**

```javascript
{
  success: true,
  data: { "NCP-US": [{ id: 1, stem: "...", ... }], "NCP-AI": [...] }
}
```

**Example — parse failure:**

```javascript
{
  success: false,
  error: {
    code: 'PARSE_ERROR',
    message: 'Failed to parse NCP-US-Part1.md: unexpected format at line 42',
    details: { file: 'NCP-US-Part1.md', line: 42 }
  }
}
```

### 3.2 Error Codes

| Code | When Used | Severity |
|------|-----------|----------|
| `DATA_DIR_NOT_FOUND` | Data directory doesn't exist or has no .md files | User action needed |
| `PARSE_ERROR` | Markdown file fails to parse (malformed question) | Warning — skip file |
| `BLUEPRINT_NOT_FOUND` | Unknown exam code passed to blueprint service | Graceful fallback |
| `REFERENCE_NOT_FOUND` | No references found for question text | Silent — show empty |
| `PDF_EXPORT_FAILED` | pdfkit error during PDF generation | User-facing error |
| `PDF_CANCELLED` | User cancelled the save dialog | Silent |
| `STORE_ERROR` | electron-store read/write failure | Log + fallback default |
| `DIALOG_ERROR` | Native dialog failed to open | Log + fallback |
| `FILE_NOT_ALLOWED` | `fs:open-external` called with non-.pdf path | Security violation |
| `BRIDGE_TIMEOUT` | Lab bridge message exceeded 10s timeout | Retry suggestion |
| `BRIDGE_ERROR` | Lab bridge handler returned an error | Log + notify user |
| `INTERNAL_ERROR` | Unhandled/unexpected error in any IPC handler | Log + generic message |

### 3.3 IPC Handler Wrapper

All IPC handlers are wrapped in a standard try/catch pattern:

```javascript
function handleIPC(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const result = await handler(event, ...args);
      return { success: true, data: result };
    } catch (err) {
      console.error(`[IPC:${channel}]`, err);
      return {
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || 'An unexpected error occurred',
          details: err.details || undefined,
        },
      };
    }
  });
}

// Usage
handleIPC('quiz:load-exams', async (_event, dataDir) => {
  const { loadAllExams } = require('./src/main/services/questionParser');
  return loadAllExams(dataDir || findDefaultDataDir());
});
```

### 3.4 Process-Level Error Handling

```javascript
// Main process — catch unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Renderer crash recovery
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Renderer crashed:', details.reason);
  // Recreate window
});
```

---

## 4. Key Design Decisions

| Decision | Choice | Rationale | Alternatives Rejected |
|----------|--------|-----------|----------------------|
| **PDF library** | pdfkit | Maps 1:1 to C#'s PdfSharp imperative draw API. Pure JS, no native deps. Supports font embedding. | `pdf-lib` (edit-oriented), `puppeteer` (+200MB Chromium), `printToPDF()` (no page break control) |
| **Window strategy** | Single window + iframe | Matches WinForms UX. Lab state preserved in iframe. Avoids multi-window IPC complexity. | `<webview>` tag (deprecated OOPIF), separate `BrowserWindow` (state sharing issues) |
| **Lab bridge** | Clean `BridgeClient.js` swap | Original PostMessage bridge was well-abstracted. Only 1 file rewrite; all 49+ views unchanged. | Shim layer on top of old bridge (fragile), full SPA rewrite (unnecessary) |
| **Fonts** | Inter + JetBrains Mono (bundled) | Open-source (SIL OFL). Cross-platform. Inter replaces Segoe UI; JetBrains Mono replaces Consolas. | System fonts only (Segoe UI missing on Linux), Noto Sans (larger bundle) |
| **Packaging** | Electron Forge | Officially maintained by the Electron team. JS config (`forge.config.js`). | `electron-builder` (community-maintained, entering maintenance mode) |
| **Preferences** | electron-store | Atomic writes, schema validation, cross-platform config path, migration support. | localStorage (no main process access), custom JSON file (no crash safety) |
| **Test framework** | Vitest | Fast, ESM-native, Vite-compatible. Node environment for service tests. | Jest (slower, CJS-first), Mocha (more setup) |
| **Custom protocol** | `certstudy-lab://` | Avoids `file://` CORS/security quirks on Linux. Enables CSP control. All relative imports work. | `file://` (CORS issues), HTTP server (unnecessary complexity) |
| **State management** | Extracted `StudySessionStore` | Decouples state from UI (C# had 30+ fields mixed in MainForm). Enables unit testing state logic. | Inline state in DOM (untestable), Redux (overkill for vanilla JS) |
| **Quiz UI pattern** | Vanilla ES6 modules | Matches the existing lab SPA pattern. No build step needed. Reuses design tokens. | React/Vue (adds framework dep + build tooling for small UI) |

---

## 5. Development Guide

### 5.1 Prerequisites

- **Node.js** 22 LTS or later
- **npm** 10+ (bundled with Node.js)
- **Git**
- **OS:** Windows 10+, Ubuntu 22.04+, Fedora 38+, or macOS 13+

### 5.2 Setup

```bash
cd CertStudy-Electron
npm install
```

### 5.3 Running the App

```bash
# Standard launch
npm start

# Development mode (DevTools open)
NODE_ENV=development npm start      # Linux/macOS
set NODE_ENV=development&& npm start  # Windows CMD
$env:NODE_ENV="development"; npm start  # Windows PowerShell
```

The app auto-detects the question data directory by searching:
1. Saved preference (from `electron-store`)
2. Walk up from app directory (finds `NCP-*.md` / `NCM-*.md` files)
3. `~/Documents/CertStudy/`
4. Prompt user via folder picker dialog

### 5.4 Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file change)
npm run test:watch
```

Tests use [Vitest](https://vitest.dev/) with Node.js environment. Test files go in `tests/` and must match `tests/**/*.test.js`.

Coverage uses V8 provider:

```bash
npx vitest run --coverage
```

### 5.5 Linting

```bash
npm run lint
```

Lints `src/`, `main.js`, and `preload.js` with ESLint 9.

### 5.6 Building / Packaging

```bash
# Package (creates unpacked app)
npm run package

# Make distributable (creates installers)
npm run make
```

**Target formats** (configured in `forge.config.js`):

| Platform | Format | Maker |
|----------|--------|-------|
| Windows | Squirrel `.exe` installer | `@electron-forge/maker-squirrel` |
| Linux | `.deb` (Debian/Ubuntu) | `@electron-forge/maker-deb` |
| Linux | `.rpm` (Fedora/RHEL) | `@electron-forge/maker-rpm` |
| Linux / macOS | `.zip` portable | `@electron-forge/maker-zip` |

### 5.7 Code Style Conventions

- **Module format:** CommonJS in main process (`require`), ES6 modules in renderer (`import/export`)
- **Naming:** camelCase for variables/functions, PascalCase for classes, kebab-case for file names
- **Path construction:** Always use `path.join()` — never string concatenation with `\` or `/`
- **Special directories:** Always use `app.getPath()` — never hardcode OS-specific paths
- **Exam code handling:** Always normalize with `.toUpperCase()` before Map lookups
- **Line endings:** Parser splits on `/\r?\n/` to handle both CRLF and LF
- **IPC channels:** Namespaced with colons (e.g. `quiz:load-exams`, `fs:open-external`)
- **Error handling:** All IPC handlers wrapped in try/catch with structured error responses
- **CSS:** Design tokens in `synthwave-tokens.css`, component styles in separate files
- **Font stacks:** `'Inter', 'Segoe UI', -apple-system, 'Noto Sans', sans-serif` for body; `'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace` for code
