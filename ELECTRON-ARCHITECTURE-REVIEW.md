# CertStudy Electron Port — Architecture Review

**Reviewer:** Senior Electron/Desktop Platform Architect
**Date:** 2026-01-XX
**Scope:** Full architecture review of proposed .NET WinForms → Electron migration
**Codebase examined:** MainForm.cs (1,465 lines), 4 C# services, LabSimulator SPA (49 views, ~3,500 lines JS), bridge/routing/state infrastructure

---

## Executive Summary

The existing app is well-structured with clear separation: C# WinForms quiz UI, C# services (parsing, blueprints, PDF export, references), and a fully self-contained SPA lab simulator communicating via WebView2 PostMessage bridge. The SPA already uses ES6 modules, hash routing, IndexedDB persistence, and a pub/sub event bus — this is ~80% ready for Electron with minimal changes.

**Key risks:** The PostMessage bridge migration, virtual host replacement, PDF export library choice (PdfSharp has no Node.js equivalent), and the hardcoded font dependency on `Segoe UI`/`Consolas` for Linux.

---

## 1. Security Model

### 1.1 Context Isolation & Node Integration

| Setting | Value | Risk |
|---------|-------|------|
| `nodeIntegration` | `false` | **Required** — never enable |
| `contextIsolation` | `true` | **Required** — default since Electron 12 |
| `sandbox` | `true` | **Recommended** — renderer sandbox |
| `webSecurity` | `true` | **Required** — never disable |

**Risk: LOW** — Straightforward to implement correctly.

#### Recommended `BrowserWindow` Configuration

```javascript
// main.js
const mainWindow = new BrowserWindow({
  width: 1280,
  height: 800,
  minWidth: 1200,
  minHeight: 700,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webviewTag: false,            // Explicitly disable <webview>
    allowRunningInsecureContent: false,
    enableRemoteModule: false,    // Deprecated but belt-and-suspenders
  },
});
```

### 1.2 Preload Script Design

**Risk: MEDIUM** — The preload surface must be minimal and typed. Exposing broad APIs (like `fs`) through contextBridge is a common mistake.

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('certStudy', {
  // Quiz services
  quiz: {
    loadExams: (dataDir) => ipcRenderer.invoke('quiz:load-exams', dataDir),
    getBlueprint: (examCode) => ipcRenderer.invoke('quiz:get-blueprint', examCode),
    calculateCoverage: (examCode, questionTexts) =>
      ipcRenderer.invoke('quiz:calculate-coverage', examCode, questionTexts),
    getObjectivesForQuestion: (examCode, text) =>
      ipcRenderer.invoke('quiz:get-objectives', examCode, text),
    getReferences: (examCode, text) =>
      ipcRenderer.invoke('quiz:get-references', examCode, text),
    getBibleSections: (examCode) =>
      ipcRenderer.invoke('quiz:get-bible-sections', examCode),
  },

  // PDF export
  pdf: {
    exportExam: (examName, questions, includeAnswers) =>
      ipcRenderer.invoke('pdf:export-exam', examName, questions, includeAnswers),
    exportAll: (exams, includeAnswers) =>
      ipcRenderer.invoke('pdf:export-all', exams, includeAnswers),
  },

  // File system (scoped)
  fs: {
    chooseDataDirectory: () => ipcRenderer.invoke('fs:choose-data-dir'),
    showSaveDialog: (options) => ipcRenderer.invoke('fs:show-save-dialog', options),
    openExternal: (filePath) => ipcRenderer.invoke('fs:open-external', filePath),
  },

  // App state / preferences
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  },

  // Lab simulator bridge (replaces window.chrome.webview)
  lab: {
    send: (type, payload) => ipcRenderer.invoke('lab:message', type, payload),
    post: (type, payload) => ipcRenderer.send('lab:notify', type, payload),
    onMessage: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on('lab:from-main', handler);
      return () => ipcRenderer.removeListener('lab:from-main', handler);
    },
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => process.platform,
  },
});
```

**Key principle:** Every IPC channel uses `invoke` (request-response) or scoped `send`/`on`. No raw `ipcRenderer` exposed. No `shell.openExternal` passed directly — validated in main process.

### 1.3 Full IPC API Specification

| Channel | Direction | Method | Purpose | Returns |
|---------|-----------|--------|---------|---------|
| `quiz:load-exams` | R→M | invoke | Parse all .md files from data directory | `{ [examCode]: Question[] }` |
| `quiz:get-blueprint` | R→M | invoke | Get exam blueprint structure | `ExamBlueprint \| null` |
| `quiz:calculate-coverage` | R→M | invoke | Map questions to objectives | `{ [objId]: number }` |
| `quiz:get-objectives` | R→M | invoke | Objectives matching a question | `[{id, title}]` |
| `quiz:get-references` | R→M | invoke | Nutanix Bible references for text | `string[]` |
| `quiz:get-bible-sections` | R→M | invoke | Bible sections for exam | `[{section, description}]` |
| `pdf:export-exam` | R→M | invoke | Export single exam to PDF | `{ success, filePath }` |
| `pdf:export-all` | R→M | invoke | Export all exams combined | `{ success, filePath }` |
| `fs:choose-data-dir` | R→M | invoke | Show folder picker for data dir | `string \| null` |
| `fs:show-save-dialog` | R→M | invoke | Show native save dialog | `string \| null` |
| `fs:open-external` | R→M | invoke | Open file in default app | `void` |
| `store:get` | R→M | invoke | Read preference | `any` |
| `store:set` | R→M | invoke | Write preference | `void` |
| `lab:message` | R→M | invoke | Request-response to lab bridge | `{ id, success, data }` |
| `lab:notify` | R→M | send | Fire-and-forget to lab | n/a |
| `lab:from-main` | M→R | send | Push message to lab renderer | `{ type, payload }` |
| `app:get-version` | R→M | invoke | App & Electron version | `{ app, electron }` |

**R = Renderer, M = Main**

### 1.4 Content Security Policy

**Risk: MEDIUM** — The lab SPA uses ES6 modules loaded via `<script type="module">` and inline event handlers. CSP must allow module scripts but block everything else.

```javascript
// main.js — set CSP via session
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self' certstudy-lab:;",
        "script-src 'self' certstudy-lab:;",
        "style-src 'self' certstudy-lab: 'unsafe-inline';",   // tokens.css uses inline
        "img-src 'self' certstudy-lab: data:;",
        "font-src 'self' certstudy-lab:;",
        "connect-src 'self';",
        "object-src 'none';",
        "base-uri 'self';",
      ].join(' '),
    },
  });
});
```

> **Note:** `'unsafe-inline'` for styles is acceptable here since the CSS is bundled with the app, not user-supplied. The SPA does not use `eval()` or inline scripts.

---

## 2. Process Architecture

### 2.1 Window Strategy: Single Window with View Switching

**Recommendation: Single `BrowserWindow` with internal tab/view switching.**

**Risk: LOW**

Rationale:
- The existing WinForms app is a single window with a side panel and swappable content area
- The lab simulator is currently a separate `Form` (`LabSimulatorForm`), but it uses the same navigation pattern (sidebar + view container)
- A single window with two "modes" (Quiz / Lab) matches the existing UX
- Multiple `BrowserWindow` instances would complicate IPC and state sharing

```
┌──────────────────────────────────────────────┐
│  [🎯 Cert Study]     [Quiz] [Lab] [Settings] │  ← Tab bar
├──────────────────────────────────────────────┤
│ ┌──────────┐ ┌─────────────────────────────┐ │
│ │ Sidebar  │ │                             │ │
│ │ - Exams  │ │   Quiz Content Area         │ │
│ │ - Mode   │ │   (or Lab SPA)              │ │
│ │ - Stats  │ │                             │ │
│ │ - Export │ │                             │ │
│ └──────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Alternative considered:** Loading the lab SPA in a `<webview>` tag. **Rejected** because:
- `<webview>` is based on the deprecated Out-of-Process Iframe (OOPIF) model
- Electron team recommends against `<webview>` — use `BrowserView` or same-window rendering
- The SPA already uses hash routing and is self-contained — it can load directly in the same renderer
- Removes need for second preload script

### 2.2 Service Execution: Main Process

**Recommendation: All services run in the main process.**

**Risk: LOW** (with caveat below)

The C# services to port are:
| Service | C# Lines | Compute Profile | Main Process OK? |
|---------|----------|-----------------|------------------|
| QuestionParser | 203 | I/O-bound (read ~19 .md files) | ✅ Yes |
| BlueprintService | ~700 | Static data, instant lookups | ✅ Yes |
| ReferenceService | ~700 | Static data, keyword matching | ✅ Yes |
| ExportService | 350 | CPU-bound (PDF generation) | ⚠️ Use worker |

**PDF export should use a Worker Thread** to avoid blocking the main process during large exports (the "Complete Study Guide" with 1,458 questions generates a 500+ page PDF):

```javascript
// main.js
const { Worker } = require('worker_threads');

ipcMain.handle('pdf:export-exam', async (event, examName, questions, includeAnswers) => {
  const savePath = await showSaveDialog(event, examName);
  if (!savePath) return { success: false };

  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/services/pdf-worker.js', {
      workerData: { examName, questions, outputPath: savePath, includeAnswers },
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
});
```

### 2.3 Memory: Question Loading

**Risk: LOW**

Current state: ~1,458 questions across 19 markdown files. Each parsed `Question` object is ~0.5-2 KB. Total in-memory: **~3 MB**. This is negligible.

Even at 10× growth (15,000 questions), memory would be ~30 MB — well within Electron's main process budget. No need for streaming, pagination, or SQLite.

**Recommendation:** Load all questions eagerly at startup (same as current C# app). Cache the parsed result in memory. Re-parse only when the data directory changes.

---

## 3. File System Access

### 3.1 Markdown File Discovery

**Risk: HIGH** — The current C# code has a hardcoded path (`C:\copilot\next2026`) and a walk-up heuristic. This MUST change for cross-platform.

**Recommendation: Configurable data directory with smart defaults.**

```javascript
// src/services/data-directory.js
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const MD_PATTERNS = ['NCP-US*.md', 'NCP-CI*.md', 'NCP-AI*.md', 'NCM-MCI*.md'];

function hasMarkdownFiles(dir) {
  return MD_PATTERNS.some(pattern => {
    const glob = pattern.replace('*', '');
    return fs.readdirSync(dir).some(f => f.startsWith(glob.split('*')[0]) && f.endsWith('.md'));
  });
}

function findDataDirectory(savedPref) {
  // 1. User-configured path (from electron-store)
  if (savedPref && fs.existsSync(savedPref) && hasMarkdownFiles(savedPref))
    return savedPref;

  // 2. Portable: data/ folder adjacent to the executable
  const portable = path.join(path.dirname(app.getPath('exe')), 'data');
  if (fs.existsSync(portable) && hasMarkdownFiles(portable))
    return portable;

  // 3. Walk up from app directory (dev mode)
  let search = app.getAppPath();
  for (let i = 0; i < 5; i++) {
    search = path.dirname(search);
    if (fs.existsSync(search) && hasMarkdownFiles(search))
      return search;
  }

  // 4. Documents folder
  const docs = path.join(app.getPath('documents'), 'CertStudy');
  if (fs.existsSync(docs) && hasMarkdownFiles(docs))
    return docs;

  return null; // Prompt user to select
}
```

**Critical:** All paths must use `path.join()`, never string concatenation with `\` or `/`.

### 3.2 User Preferences & State

**Recommendation: `electron-store` for preferences, renderer-side IndexedDB/localStorage for lab state.**

**Risk: LOW**

```javascript
// main.js
const Store = require('electron-store');
const store = new Store({
  schema: {
    dataDirectory: { type: 'string' },
    windowBounds: { type: 'object' },
    lastExam: { type: 'string' },
    randomizeAnswers: { type: 'boolean', default: true },
    theme: { type: 'string', default: 'dark' },
    wrongAnswers: { type: 'object', default: {} },  // { examCode: [questionKeys] }
    stats: { type: 'object', default: {} },
  },
});
```

**Why electron-store over custom:**
- Atomic writes (no corruption on crash)
- Schema validation
- Encrypted store option if needed later
- Cross-platform config location (uses `app.getPath('userData')`)
- Migration support for schema changes between versions

**Lab simulator state:** Keep in IndexedDB (already works in the SPA). The `StateStore.js` already has IndexedDB + localStorage fallback — this works unchanged in Electron's Chromium renderer.

### 3.3 PDF Export: Save Dialog Integration

**Risk: LOW**

```javascript
// main.js
ipcMain.handle('fs:show-save-dialog', async (event, options) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const { filePath, canceled } = await dialog.showSaveDialog(window, {
    title: options.title || 'Save File',
    defaultPath: path.join(app.getPath('desktop'), options.defaultName || 'export.pdf'),
    filters: options.filters || [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return canceled ? null : filePath;
});

ipcMain.handle('fs:open-external', async (_event, filePath) => {
  // SECURITY: Validate the path is a file we exported (not arbitrary)
  if (!filePath.endsWith('.pdf')) throw new Error('Only PDF files allowed');
  await shell.openPath(filePath);
});
```

---

## 4. Lab Simulator Integration

### 4.1 PostMessage Bridge Migration

**Risk: HIGH** — This is the highest-effort migration task. Every `window.chrome.webview.postMessage()` call must be replaced.

**Current pattern (BridgeClient.js):**
```javascript
// CURRENT — WebView2
window.chrome?.webview?.postMessage(msg);
window.chrome?.webview?.addEventListener('message', handler);
```

**Target pattern (Electron IPC via preload):**
```javascript
// NEW — Electron via contextBridge
window.certStudy.lab.send(type, payload);       // → ipcRenderer.invoke
window.certStudy.lab.post(type, payload);       // → ipcRenderer.send
window.certStudy.lab.onMessage(callback);       // → ipcRenderer.on
```

**Migration strategy: Replace `BridgeClient.js` with an Electron-compatible shim.**

```javascript
// src/lab/core/BridgeClient.js (Electron version)
export default class BridgeClient {
  #pending = new Map();
  #handlers = new Map();
  #idCounter = 0;
  #cleanup = null;

  constructor() {
    // Listen for messages from main process
    this.#cleanup = window.certStudy.lab.onMessage((data) => {
      this.#onMessage(data);
    });
  }

  async send(type, payload) {
    const id = String(++this.#idCounter);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`Bridge timeout: ${type}`));
      }, 10_000);

      this.#pending.set(id, { resolve, reject, timer });

      // Use IPC invoke for request-response
      window.certStudy.lab.send(type, { ...payload, id })
        .then(response => {
          clearTimeout(timer);
          this.#pending.delete(id);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          this.#pending.delete(id);
          reject(err);
        });
    });
  }

  post(type, payload) {
    window.certStudy.lab.post(type, payload);
  }

  on(type, handler) {
    this.#handlers.set(type, handler);
  }

  #onMessage(data) {
    const { type, payload, id } = data;

    // Check if it's a response to a pending request
    if (type === 'response' && id && this.#pending.has(id)) {
      const { resolve, reject, timer } = this.#pending.get(id);
      clearTimeout(timer);
      this.#pending.delete(id);
      if (payload?.success) resolve(payload.data);
      else reject(new Error(payload?.error || 'Bridge error'));
      return;
    }

    // Otherwise dispatch to registered handler
    const handler = this.#handlers.get(type);
    if (handler) handler(payload);
  }

  destroy() {
    if (this.#cleanup) this.#cleanup();
  }
}
```

**Files requiring changes:**
| File | Change |
|------|--------|
| `BridgeClient.js` | Full rewrite (above) |
| `app.js` line 79 | `bridge.post('ready')` → works as-is with new BridgeClient |
| All 49 view files | **No changes needed** — views use `StateEngine`, not bridge directly |
| `StateEngine.js` | **No changes needed** — uses IndexedDB, not bridge |
| `CLIService.js` | **No changes needed** — pure computation |

**Effort: ~1 file rewrite + test.** The bridge pattern was well-abstracted.

### 4.2 Virtual Host Replacement

**Risk: HIGH** — `certstudy.local` virtual host mapping must be replaced.

**Current:** WebView2 `SetVirtualHostNameToFolderMapping("certstudy.local", webRoot)`

**Option A: `protocol.handle` with custom scheme (RECOMMENDED)**

```javascript
// main.js
const { protocol, net } = require('electron');

// Register before app ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'certstudy-lab',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: false,
    stream: true,
  }
}]);

app.whenReady().then(() => {
  const labRoot = path.join(__dirname, 'src', 'lab', 'web');

  protocol.handle('certstudy-lab', (request) => {
    const url = new URL(request.url);
    let filePath = path.join(labRoot, decodeURIComponent(url.pathname));

    // Security: prevent directory traversal
    if (!filePath.startsWith(labRoot)) {
      return new Response('Forbidden', { status: 403 });
    }

    return net.fetch(`file://${filePath}`);
  });
});
```

**Navigation URL becomes:** `certstudy-lab://lab/index.html`

**Impact on SPA:** All relative imports (`import Router from './core/Router.js'`) work unchanged because the custom scheme has `standard: true`. The SPA uses only relative paths — no absolute URLs to rewrite.

**Why not `file://`?** Because `file://` URLs have quirky security restrictions on some platforms, cannot set CSP headers easily, and prevent CORS-free module imports on Linux.

**Option B: `file://` with `--allow-file-access-from-files`** — **REJECTED** — security risk, CORS issues on Linux.

### 4.3 Lab Content Loading Strategy

**Recommendation: Same `BrowserWindow`, loaded via in-app navigation.**

When the user clicks "Lab Simulator" tab:
```javascript
// In renderer — Quiz UI switches to lab mode
mainWindow.loadURL('certstudy-lab://lab/index.html');
// Or use in-page SPA routing to swap the content
```

**Better approach — single HTML shell with iframe for lab:**
```html
<!-- src/quiz/index.html -->
<div id="quiz-root" class="active"><!-- Quiz UI --></div>
<iframe id="lab-frame" src="" style="display:none; width:100%; height:100%; border:none;"></iframe>

<script>
function switchToLab() {
  document.getElementById('quiz-root').style.display = 'none';
  const frame = document.getElementById('lab-frame');
  frame.src = 'certstudy-lab://lab/index.html';
  frame.style.display = 'block';
}

function switchToQuiz() {
  document.getElementById('lab-frame').style.display = 'none';
  document.getElementById('quiz-root').style.display = 'block';
}
</script>
```

**Why iframe here is acceptable:**
- Same origin (custom protocol, same app)
- No cross-origin risks — all content is local
- Lab SPA state preserved when switching tabs (iframe stays alive)
- Lab SPA has its own IndexedDB persistence regardless
- Simpler than managing two `BrowserWindow` instances

**Note:** The iframe approach requires the lab SPA's preload context. Since the iframe loads a custom protocol, the same preload applies. If CSP issues arise, consider `BrowserView` overlay instead.

---

## 5. Packaging & Distribution

### 5.1 Build Tooling: electron-forge

**Recommendation: Electron Forge (v7+)**

**Risk: LOW**

| Criteria | electron-builder | electron-forge |
|----------|-----------------|----------------|
| Officially supported | Community | **Electron team** |
| Plugin ecosystem | Mature | Growing, official |
| Auto-update | electron-updater | @electron-forge/publisher-* |
| Config format | YAML/JSON/JS | JS (forge.config.js) |
| Monorepo support | Limited | Good |
| Future-proofing | Maintenance mode | **Active development** |

```javascript
// forge.config.js
module.exports = {
  packagerConfig: {
    name: 'CertStudy',
    executableName: 'certstudy',
    icon: './assets/icon',
    asar: true,
    asarUnpack: ['**/node_modules/pdfkit/**'],  // If pdfkit uses native modules
    ignore: [/\.md$/, /\.py$/, /\.csv$/, /\.json$/],  // Don't bundle data files
  },
  makers: [
    // Linux
    { name: '@electron-forge/maker-deb', config: {
      options: {
        maintainer: 'CertStudy',
        homepage: 'https://github.com/rogerlundnetcenter/next2026',
        categories: ['Education'],
      }
    }},
    { name: '@electron-forge/maker-rpm', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['linux'] },  // AppImage alternative
    // Windows
    { name: '@electron-forge/maker-squirrel', config: {
      setupIcon: './assets/icon.ico',
    }},
    // macOS
    { name: '@electron-forge/maker-dmg', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
  ],
};
```

### 5.2 Target Formats

| Platform | Primary | Secondary | Notes |
|----------|---------|-----------|-------|
| Linux | `.deb` (Ubuntu/Debian) | `.rpm` (Fedora/RHEL), AppImage | AppImage for universal |
| Windows | Squirrel (`.exe` installer) | `.msi` via WiX, portable `.zip` | Squirrel for auto-update |
| macOS | `.dmg` | `.zip` for notarization | Requires Apple Developer ID |

### 5.3 Auto-Update Strategy

**Risk: MEDIUM** — Requires hosting infrastructure.

**Recommended: `electron-updater` with GitHub Releases**

```javascript
// main.js
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update:available');
  });

  autoUpdater.on('update-downloaded', () => {
    // Prompt user to restart
    mainWindow.webContents.send('update:ready');
  });
});
```

**Platform support:**
| Platform | Auto-update method |
|----------|--------------------|
| Windows | Squirrel (native) |
| macOS | Squirrel.Mac or zip-based |
| Linux | **Not natively supported** — use AppImage + manual download, or snap store |

### 5.4 Code Signing

**Risk: MEDIUM** — Required for Windows SmartScreen and macOS Gatekeeper.

| Platform | Requirement | Cost |
|----------|-------------|------|
| Windows | EV Code Signing Certificate | ~$300-500/year |
| macOS | Apple Developer ID + Notarization | $99/year |
| Linux | GPG signing (optional, for repos) | Free |

**Recommendation:** Start without signing for alpha/beta. Add Windows signing before public release to avoid SmartScreen warnings that will frighten users.

### 5.5 Bundle Size Optimization

**Risk: MEDIUM** — Electron baseline is ~150 MB. App code is small, but dependencies matter.

| Component | Estimated Size |
|-----------|---------------|
| Electron runtime | ~150 MB |
| App code (Quiz + Lab SPA) | ~2 MB |
| Node.js services | ~1 MB |
| PDF library (pdfkit or similar) | ~5-15 MB |
| electron-store + deps | ~1 MB |
| **Total** | **~170 MB** |

**Optimizations:**
1. Use `asar` packaging (default — single archive, faster loading)
2. Exclude dev dependencies (`npm prune --production` before packaging)
3. Exclude data files from bundle (`.md` files should be external)
4. Tree-shake unused Electron modules
5. Consider `electron-builder` `files` glob to whitelist only needed files

---

## 6. Service Porting Guide

### 6.1 QuestionParser → Node.js

**Risk: LOW** — Direct regex-based port.

```javascript
// src/services/question-parser.js
const fs = require('fs');
const path = require('path');

const QUESTION_HEADER_RX = /^###\s+Q(\d+)/;
const DOMAIN_HEADER_RX = /^##\s+(?:DOMAIN|Domain)\s*(\d+)/i;
const OPTION_RX = /^-\s+([A-F])\)\s+(.*)/;
const ANSWER_RX = /^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*/;

function deriveExamCode(fileName) {
  const name = path.parse(fileName).name;
  const parts = name.split('-');
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : name;
}

function parseFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
  const examCode = deriveExamCode(path.basename(filePath));
  const questions = [];
  let currentDomain = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Domain header
    const dm = DOMAIN_HEADER_RX.exec(line);
    if (dm) {
      currentDomain = `Domain ${dm[1]}`;
      const colonIdx = line.indexOf(':');
      if (colonIdx >= 0) {
        const parenIdx = line.indexOf('(', colonIdx);
        const desc = parenIdx > colonIdx
          ? line.slice(colonIdx + 1, parenIdx).trim()
          : line.slice(colonIdx + 1).trim();
        if (desc) currentDomain += `: ${desc}`;
      }
      i++;
      continue;
    }

    // Question header
    const qm = QUESTION_HEADER_RX.exec(line);
    if (qm) {
      const q = {
        id: parseInt(qm[1]),
        examCode,
        domain: currentDomain || examCode,
        stem: '',
        options: [],
        correctAnswers: [],
        explanation: '',
        sourceFile: path.basename(filePath),
      };

      i++;
      // Collect stem
      const stemLines = [];
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        if (OPTION_RX.test(l) || QUESTION_HEADER_RX.test(l) || ANSWER_RX.test(l)) break;
        stemLines.push(l);
        i++;
      }
      q.stem = stemLines.join('\n').trim();

      // Collect options
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        const om = OPTION_RX.exec(l);
        if (!om) break;
        let optText = om[2].trim();
        i++;
        while (i < lines.length) {
          const next = lines[i].trimEnd();
          if (!next || OPTION_RX.test(next) || ANSWER_RX.test(next) ||
              QUESTION_HEADER_RX.test(next) || next.startsWith('---')) break;
          optText += ' ' + next.trim();
          i++;
        }
        q.options.push({ letter: om[1], text: optText });
      }

      // Skip blanks
      while (i < lines.length && !lines[i].trim()) i++;

      // Answer line
      if (i < lines.length) {
        const am = ANSWER_RX.exec(lines[i].trimEnd());
        if (am) {
          q.correctAnswers = am[1].replace(/[,\s]/g, '').split('');
          i++;
        }
      }

      // Explanation
      const explLines = [];
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        if (l.startsWith('---')) { i++; break; }
        if (QUESTION_HEADER_RX.test(l) || DOMAIN_HEADER_RX.test(l)) break;
        explLines.push(l);
        i++;
      }
      q.explanation = explLines.join('\n').trim();

      if (q.options.length > 0 && q.correctAnswers.length > 0)
        questions.push(q);
      continue;
    }
    i++;
  }
  return questions;
}

function loadAllExams(directory) {
  const exams = {};
  const patterns = ['NCP-US', 'NCP-CI', 'NCP-AI', 'NCM-MCI'];
  const files = fs.readdirSync(directory).filter(f =>
    f.endsWith('.md') && patterns.some(p => f.startsWith(p))
  );

  for (const file of files) {
    const questions = parseFile(path.join(directory, file));
    const code = deriveExamCode(file);
    if (!exams[code]) exams[code] = [];
    exams[code].push(...questions);
  }
  return exams;
}

module.exports = { parseFile, loadAllExams, deriveExamCode };
```

### 6.2 ExportService → Node.js

**Risk: HIGH** — PdfSharp (C#) has no Node.js equivalent. Must choose a PDF library.

| Library | Pros | Cons |
|---------|------|------|
| **pdfkit** | Pure JS, no native deps, mature | Manual layout (no auto text wrapping) |
| **pdf-lib** | Pure JS, great for forms/edits | Less suited for document generation |
| **puppeteer** | HTML→PDF, pixel-perfect | Bundles Chromium (+200MB!), overkill |
| **jspdf** | Browser + Node, simple API | Limited font support |

**Recommendation: `pdfkit`** — Closest to PdfSharp's imperative draw API. The existing ExportService uses `DrawString`, `DrawRectangle`, coordinate-based layout — pdfkit's API maps directly.

```javascript
// src/services/export-service.js (sketch)
const PDFDocument = require('pdfkit');
const fs = require('fs');

function exportExam(examName, questions, outputPath, includeAnswers) {
  const doc = new PDFDocument({ size: 'letter', margin: 50 });
  doc.pipe(fs.createWriteStream(outputPath));

  // Title page
  doc.rect(0, 0, doc.page.width, 120).fill('#0b0b1a');
  doc.fontSize(20).fill('#00f0ff').text('NUTANIX EXAM PREP', 0, 30, { align: 'center' });
  // ... similar to C# ExportService

  doc.end();
}
```

**Font concern:** The C# ExportService uses `Segoe UI` exclusively. On Linux, this font does not exist. The Node.js PDF library must embed fonts.

```javascript
// Register cross-platform fonts
doc.registerFont('body', path.join(__dirname, '../../assets/fonts/Inter-Regular.ttf'));
doc.registerFont('body-bold', path.join(__dirname, '../../assets/fonts/Inter-Bold.ttf'));
doc.registerFont('mono', path.join(__dirname, '../../assets/fonts/JetBrainsMono-Regular.ttf'));
```

### 6.3 BlueprintService & ReferenceService

**Risk: LOW** — These are pure static data with keyword matching. Direct port to JS objects.

```javascript
// src/services/blueprint-service.js
const blueprints = {
  'NCP-AI': {
    examCode: 'NCP-AI',
    examTitle: 'NCP-AI 6.10 — AI Infrastructure',
    questionCount: 75,
    timeLimitMinutes: 120,
    passingScore: '3000/6000',
    sections: [
      {
        sectionNumber: 1,
        sectionTitle: 'Deploy NAI Environment',
        objectives: [
          { id: '1.1', title: 'GPU Configuration', keywords: ['GPU', 'passthrough', 'vGPU', ...], knowledge: [...] },
          // ...
        ],
      },
    ],
  },
  // ... other exams
};

function getBlueprint(examCode) { /* normalize and lookup */ }
function calculateCoverage(examCode, questionTexts) { /* keyword matching */ }
module.exports = { getBlueprint, calculateCoverage, ... };
```

---

## 7. Cross-Platform Gotchas

### 7.1 Path Separators

**Risk: HIGH** — The current C# code uses backslashes and Windows-specific paths.

**Rules:**
- ✅ Always use `path.join()`, `path.resolve()`, `path.basename()`
- ❌ Never hardcode `\` or `/` in paths
- ❌ Never use `C:\` drive letters
- ✅ Use `app.getPath()` for special directories

**Specific locations in current code that must change:**
| Current (C#) | Electron Equivalent |
|--------------|---------------------|
| `@"C:\copilot\next2026"` | `findDataDirectory()` (configurable) |
| `Environment.SpecialFolder.Desktop` | `app.getPath('desktop')` |
| `Environment.SpecialFolder.LocalApplicationData` | `app.getPath('userData')` |
| `AppContext.BaseDirectory` | `app.getAppPath()` or `__dirname` |
| `Path.Combine(...)` | `path.join(...)` |

### 7.2 Font Availability on Linux

**Risk: HIGH** — Current app exclusively uses `Segoe UI` (Windows-only) and `Consolas` (Windows-only).

**Quiz UI (HTML/CSS):**
```css
/* tokens.css — update font stack */
:root {
  --font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 
                 'Noto Sans', 'Liberation Sans', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Cascadia Code', 'Consolas', 
                      'Fira Code', 'Ubuntu Mono', 'Liberation Mono', monospace;
}
```

**PDF Export:**
- Must embed fonts in the PDF (pdfkit supports this natively)
- Bundle `Inter` (or `Noto Sans`) and `JetBrains Mono` in `assets/fonts/`
- Both are open-source (SIL OFL license)

**Lab Simulator CSS (`tokens.css` line 5-6):**
```css
/* CURRENT */
--font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--font-mono: 'Cascadia Code', 'Consolas', 'Courier New', monospace;

/* UPDATED */
--font-family: 'Inter', 'Segoe UI', -apple-system, 'Noto Sans', sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Ubuntu Mono', monospace;
```

### 7.3 Window Chrome Differences

**Risk: LOW**

| Aspect | Windows | macOS | Linux |
|--------|---------|-------|-------|
| Title bar | System | Traffic lights (left) | Varies (GNOME/KDE) |
| Menu bar | In window | Global menu bar | In window |
| Close behavior | Closes app | Hides to dock | Closes app |
| Tray | System tray | Menu bar extra | System tray (if supported) |

**Recommendation:**
```javascript
// Platform-specific close behavior
mainWindow.on('close', (e) => {
  if (process.platform === 'darwin') {
    e.preventDefault();
    mainWindow.hide();  // macOS: hide, don't quit
  }
});

app.on('activate', () => {
  mainWindow.show();  // macOS: re-show on dock click
});
```

### 7.4 Tray/Dock Behavior

**Risk: LOW** — This app likely doesn't need a tray icon. It's a study tool, not a daemon. Skip tray implementation for v1.

### 7.5 Line Endings in Markdown

**Risk: MEDIUM** — Markdown files may have CRLF (Windows) or LF (Linux). The question parser must handle both.

```javascript
// Already handled if splitting correctly:
const lines = content.split(/\r?\n/);  // Handles both CRLF and LF
```

### 7.6 Case Sensitivity

**Risk: MEDIUM** — Windows filesystem is case-insensitive; Linux is case-sensitive.

All file references in the lab SPA (imports, CSS URLs) must match actual filenames exactly. Audit needed:
- `import Router from './core/Router.js'` — file must be `Router.js`, not `router.js`
- CSS `url(...)` references
- HTML `src` attributes

**The current SPA appears consistent** (PascalCase for class files, camelCase for utilities), but this must be validated on Linux.

---

## 8. Development Experience

### 8.1 Hot Reload

**Recommendation: `electron-vite` or manual `electron-reload`**

```javascript
// For development only
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: require('electron'),
      forceHardReset: false,
      hardResetMethod: 'exit',
    });
  } catch {}
}
```

**Or use Vite with `electron-vite`** for HMR:
```bash
npm install --save-dev electron-vite vite
```

Since the lab SPA uses vanilla ES6 modules with no build step, HMR works natively — just reload the page.

### 8.2 Debug Workflow

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron: Main",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["."],
      "cwd": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "Electron: Renderer",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**DevTools:** Enable in development, disable in production:
```javascript
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}
```

### 8.3 Recommended Electron Version

**Electron 34.x** (latest stable as of early 2026)
- Chromium 132+
- Node.js 22 LTS
- ES2024 support
- Improved `protocol.handle()` API
- Better Linux Wayland support

---

## 9. Missing from Plan — Critical Gaps

### 9.1 ❗ Quiz UI Not Addressed (CRITICAL)

**Risk: HIGH**

The plan shows `src/quiz/` for "Quiz UI (HTML/CSS/JS)" but the **entire quiz UI is currently WinForms C#** (MainForm.cs, 1,465 lines). This is not a port — it's a **full rewrite** of:
- Exam selection sidebar with exam buttons
- Question display with styled option cards
- Answer selection with visual feedback (correct/incorrect highlighting)
- Progress bar with animation
- Timer (countdown for test mode)
- Stats dashboard (score, domain breakdown, streak)
- Study mode vs. test mode toggle
- Wrong-answer review
- Exam simulation mode
- Blueprint coverage overlay panel
- PDF export menu with current/all options

**Estimated effort: 2,000-3,000 lines of HTML/CSS/JS** — this is the largest single task in the migration and it's not even mentioned in the plan.

**Recommendation:** Build the quiz UI as a modern SPA using the same vanilla ES6 module pattern as the lab simulator. Reuse the lab's design system (`tokens.css`, `components.css`) for visual consistency. The quiz UI can share:
- `EntityTable.js` for stats display
- `Toast.js` for notifications
- `ThemeToggle.js` for theme switching
- The color token system from `tokens.css`

### 9.2 ❗ Error Handling Strategy (HIGH)

No error handling strategy is defined. The app needs:
- Graceful fallback when data directory is missing
- User-facing error messages for parse failures
- Crash reporting (consider `electron-log` + Sentry or similar)
- Unhandled rejection catching in main process

```javascript
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});

app.on('render-process-gone', (event, webContents, details) => {
  log.error('Renderer crashed:', details.reason);
  // Offer to reload
});
```

### 9.3 ❗ Accessibility (MEDIUM)

The current WinForms app has zero accessibility support. The Electron port is an opportunity to add:
- ARIA labels on quiz options
- Keyboard navigation (already partially supported — quiz has `KeyPreview`)
- Screen reader support for question stems
- Focus management on navigation
- High-contrast theme

### 9.4 ⚠️ Data Bundling Strategy (MEDIUM)

The plan doesn't address how markdown question files ship with the app:
- **Option A:** Bundle in `asar` — fast, but users can't add their own questions
- **Option B:** External `data/` directory — users can add/edit markdown files
- **Option C:** Hybrid — bundle defaults, allow user override directory

**Recommendation: Option C.** Ship default questions in the app, allow configurable external directory.

### 9.5 ⚠️ First-Run Experience (MEDIUM)

No onboarding flow defined. On first launch:
1. Auto-detect data directory (bundled questions)
2. Show exam selection
3. Offer to set preferences (theme, answer randomization)
4. Brief feature tour (optional)

### 9.6 ⚠️ State Migration from WinForms (LOW)

Users with existing WinForms stats/preferences lose them. Consider:
- Document this as a known limitation
- Or provide an import tool for WinForms settings (if any were persisted)

### 9.7 ⚠️ Testing Strategy (MEDIUM)

Not mentioned in the plan. Recommended:
| Layer | Tool | Coverage |
|-------|------|----------|
| Unit (services) | Jest or Vitest | QuestionParser, BlueprintService |
| Integration (IPC) | Electron testing utilities | All IPC channels |
| E2E | Playwright + @playwright/electron | Full user flows |
| Visual | Percy or manual | Cross-platform screenshot comparison |

### 9.8 ⚠️ Logging (LOW)

Use `electron-log` for structured logging:
```javascript
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
// Logs to: ~/Library/Logs/CertStudy/ (macOS), %USERPROFILE%\AppData\Roaming\CertStudy\logs\ (Windows)
```

---

## 10. Risk Summary

| # | Finding | Risk | Effort | Priority |
|---|---------|------|--------|----------|
| 1 | Quiz UI is a full rewrite, not a port | 🔴 HIGH | 3-4 weeks | P0 |
| 2 | PostMessage bridge migration | 🔴 HIGH | 2-3 days | P0 |
| 3 | Virtual host → custom protocol | 🔴 HIGH | 1-2 days | P0 |
| 4 | PDF library selection & port | 🔴 HIGH | 1 week | P1 |
| 5 | Font cross-platform strategy | 🔴 HIGH | 2-3 days | P1 |
| 6 | Hardcoded Windows paths | 🔴 HIGH | 1 day | P0 |
| 7 | CSP configuration | 🟡 MEDIUM | 1 day | P1 |
| 8 | Data directory strategy | 🟡 MEDIUM | 2-3 days | P1 |
| 9 | File case sensitivity (Linux) | 🟡 MEDIUM | 1 day | P1 |
| 10 | Error handling strategy | 🟡 MEDIUM | 2-3 days | P1 |
| 11 | Testing strategy | 🟡 MEDIUM | 1-2 weeks | P2 |
| 12 | Code signing | 🟡 MEDIUM | 1-2 days | P2 |
| 13 | Auto-update (Linux) | 🟡 MEDIUM | 2-3 days | P2 |
| 14 | Accessibility | 🟡 MEDIUM | 1 week | P2 |
| 15 | Window chrome differences | 🟢 LOW | Hours | P2 |
| 16 | Memory (question loading) | 🟢 LOW | None | — |
| 17 | electron-store setup | 🟢 LOW | Hours | P1 |
| 18 | Tray behavior | 🟢 LOW | Skip for v1 | P3 |

---

## 11. Recommended Implementation Order

```
Phase 1 — Skeleton (1 week)
├── Electron app scaffold with forge
├── Custom protocol (certstudy-lab://)
├── Preload + IPC channel registration
├── Lab SPA loads in Electron (BridgeClient rewrite)
└── Verify all 49 lab routes work on Linux

Phase 2 — Services (1 week)
├── QuestionParser port to Node.js
├── BlueprintService port to Node.js
├── ReferenceService port to Node.js
├── electron-store for preferences
└── Data directory discovery

Phase 3 — Quiz UI (3-4 weeks)
├── HTML/CSS quiz shell (sidebar + content area)
├── Exam selection & loading
├── Question display with option cards
├── Study mode + test mode + timer
├── Stats tracking + domain breakdown
├── Wrong-answer review
├── Blueprint coverage panel
└── Exam simulation mode

Phase 4 — PDF Export (1 week)
├── pdfkit integration
├── Font embedding (Inter + JetBrains Mono)
├── Export single exam
├── Export all exams
└── Save dialog integration

Phase 5 — Polish (1 week)
├── Cross-platform font stacks
├── CSP hardening
├── Error handling + logging
├── First-run experience
└── Linux testing (Ubuntu, Fedora)

Phase 6 — Distribution (1 week)
├── electron-forge packaging
├── .deb + .rpm + AppImage builds
├── Windows .exe installer
├── macOS .dmg (if targeting)
├── Auto-update setup
└── CI/CD pipeline (GitHub Actions)
```

**Total estimated effort: 8-10 weeks for one developer.**

---

## 12. Revised Architecture

```
CertStudy-Electron/
├── package.json
├── forge.config.js
├── main.js                          # Electron main process entry
├── preload.js                       # contextBridge (single preload)
├── src/
│   ├── services/                    # Node.js (main process)
│   │   ├── question-parser.js       # Port of QuestionParser.cs
│   │   ├── blueprint-service.js     # Port of BlueprintService.cs
│   │   ├── reference-service.js     # Port of ReferenceService.cs
│   │   ├── export-service.js        # Port of ExportService.cs (pdfkit)
│   │   ├── pdf-worker.js            # Worker thread for PDF generation
│   │   ├── data-directory.js        # Cross-platform data dir discovery
│   │   └── ipc-handlers.js          # All ipcMain.handle() registrations
│   ├── quiz/                        # Quiz UI (renderer, NEW)
│   │   ├── index.html               # Quiz shell with lab iframe slot
│   │   ├── css/
│   │   │   ├── quiz.css             # Quiz-specific styles
│   │   │   └── shared-tokens.css    # Shared with lab (extracted)
│   │   └── js/
│   │       ├── app.js               # Quiz bootstrap
│   │       ├── views/               # Exam selection, question, stats, etc.
│   │       └── components/          # Option cards, progress bar, timer, etc.
│   └── lab/                         # Lab Simulator (REUSED, minimal changes)
│       └── web/                     # Existing SPA, only BridgeClient.js changes
│           ├── index.html
│           ├── css/
│           └── js/
├── assets/
│   ├── fonts/                       # Inter, JetBrains Mono (bundled)
│   ├── icon.png                     # App icon (512x512)
│   ├── icon.ico                     # Windows icon
│   └── icon.icns                    # macOS icon
└── data/                            # Default question files (bundled)
    ├── NCP-US-Part1.md
    ├── NCP-CI-Part1.md
    └── ...
```

---

*End of review. The migration is feasible with well-bounded risk. The lab simulator SPA is the biggest win — it ports almost unchanged. The quiz UI rewrite is the biggest cost but also the biggest opportunity to improve the UX.*
