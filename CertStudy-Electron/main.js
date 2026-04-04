const { app, BrowserWindow, ipcMain, protocol, net, dialog, shell, Menu, screen } = require('electron');
const path = require('path');
const { getWindowState, trackWindowState } = require('./src/main/windowState');
const {
  resolveLabRoot,
  createLabProtocolHandler,
  setupLabIPC,
  sendToLab,
} = require('./src/main/ipc/labHandlers');

let mainWindow = null;

// Register custom protocol for lab simulator
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

function createWindow() {
  const state = getWindowState(getStore(), screen);

  const windowOpts = {
    width: state.width,
    height: state.height,
    minWidth: 1200,
    minHeight: 700,
    title: 'CertStudy',
    backgroundColor: '#0a0a19',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
      allowRunningInsecureContent: false,
    },
  };

  if (state.x !== undefined && state.y !== undefined) {
    windowOpts.x = state.x;
    windowOpts.y = state.y;
  } else {
    windowOpts.center = true;
  }

  mainWindow = new BrowserWindow(windowOpts);

  if (state.isMaximized) mainWindow.maximize();

  trackWindowState(mainWindow, getStore());

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'quiz', 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Custom protocol handler for lab simulator content
function setupLabProtocol() {
  const labRoot = resolveLabRoot(__dirname);

  if (!labRoot) {
    console.warn('[LabProtocol] Lab simulator directory not found — protocol will return 404');
    protocol.handle('certstudy-lab', () => {
      return new Response('Lab simulator files not found', { status: 404 });
    });
    return;
  }

  console.log(`[LabProtocol] Serving lab files from: ${labRoot}`);
  protocol.handle('certstudy-lab', createLabProtocolHandler(labRoot, net));
}

// Register IPC handlers
function setupIPC() {
  // Quiz data channels
  ipcMain.handle('quiz:load-exams', async (_event, dataDir) => {
    const { loadAllExams } = require('./src/main/services/questionParser');
    return loadAllExams(dataDir || findDefaultDataDir());
  });

  ipcMain.handle('quiz:get-blueprint', async (_event, examCode) => {
    const { getBlueprint } = require('./src/main/services/blueprintService');
    return getBlueprint(examCode);
  });

  ipcMain.handle('quiz:calculate-coverage', async (_event, examCode, questionTexts) => {
    const { calculateCoverage } = require('./src/main/services/blueprintService');
    return calculateCoverage(examCode, questionTexts);
  });

  ipcMain.handle('quiz:get-objectives', async (_event, examCode, text) => {
    const { getObjectivesForQuestion } = require('./src/main/services/blueprintService');
    return getObjectivesForQuestion(examCode, text);
  });

  ipcMain.handle('quiz:get-references', async (_event, examCode, text) => {
    const { getReferenceForQuestion } = require('./src/main/services/referenceService');
    return getReferenceForQuestion(examCode, text);
  });

  ipcMain.handle('quiz:get-kb-links', async (_event, examCode, text) => {
    const { getKBLinksForQuestion } = require('./src/main/services/referenceService');
    return getKBLinksForQuestion(examCode, text);
  });

  ipcMain.handle('quiz:get-general-resources', async (_event, examCode) => {
    const { getGeneralResources } = require('./src/main/services/referenceService');
    return getGeneralResources(examCode);
  });

  // File system channels
  ipcMain.handle('fs:choose-data-dir', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Question Data Directory',
    });
    return filePaths[0] || null;
  });

  ipcMain.handle('fs:show-save-dialog', async (_event, options) => {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: options?.title || 'Save File',
      defaultPath: path.join(app.getPath('desktop'), options?.defaultName || 'export.pdf'),
      filters: options?.filters || [{ name: 'PDF Files', extensions: ['pdf'] }],
    });
    return canceled ? null : filePath;
  });

  ipcMain.handle('fs:open-external', async (_event, filePath) => {
    if (typeof filePath === 'string' && filePath.endsWith('.pdf')) {
      await shell.openPath(filePath);
    }
  });

  // Store channels
  ipcMain.handle('store:get', async (_event, key) => {
    const store = getStore();
    return store.get(key);
  });

  ipcMain.handle('store:set', async (_event, key, value) => {
    const store = getStore();
    store.set(key, value);
  });

  // App info
  ipcMain.handle('app:get-version', async () => ({
    app: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
    platform: process.platform,
  }));

  // Lab bridge channels — delegated to labHandlers module
  setupLabIPC(ipcMain, () => mainWindow, app.getVersion());
}

let _store = null;
function getStore() {
  if (!_store) {
    const Store = require('electron-store');
    _store = new Store({
      schema: {
        dataDirectory: { type: 'string' },
        windowBounds: { type: 'object' },
        lastExam: { type: 'string' },
        randomizeAnswers: { type: 'boolean', default: true },
        theme: { type: 'string', default: 'dark' },
      },
    });
  }
  return _store;
}

function findDefaultDataDir() {
  const fs = require('fs');
  const patterns = ['NCP-US', 'NCP-CI', 'NCP-AI', 'NCM-MCI'];

  function hasMarkdownFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      return patterns.some(p => files.some(f => f.startsWith(p) && f.endsWith('.md')));
    } catch { return false; }
  }

  // 1. Saved preference
  const saved = getStore().get('dataDirectory');
  if (saved && hasMarkdownFiles(saved)) return saved;

  // 2. Walk up from app directory
  let search = app.isPackaged ? path.dirname(app.getPath('exe')) : __dirname;
  for (let i = 0; i < 5; i++) {
    if (hasMarkdownFiles(search)) return search;
    const parent = path.dirname(search);
    if (parent === search) break;
    search = parent;
  }

  // 3. Documents folder
  const docs = path.join(app.getPath('documents'), 'CertStudy');
  if (hasMarkdownFiles(docs)) return docs;

  return null;
}

// macOS dock behavior
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else if (mainWindow) mainWindow.show();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

app.whenReady().then(() => {
  setupLabProtocol();
  setupIPC();
  createWindow();
});
