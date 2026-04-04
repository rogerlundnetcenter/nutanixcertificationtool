'use strict';

const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain',
  '.xml':  'text/xml',
  '.webp': 'image/webp',
};

/**
 * Resolve the lab simulator root directory.
 * In development: adjacent CertStudy repo. In packaged: bundled under resources.
 */
function resolveLabRoot(appRoot) {
  // Dev: adjacent CertStudy/LabSimulator/Web
  const devPath = path.join(appRoot, '..', 'CertStudy', 'LabSimulator', 'Web');
  if (fs.existsSync(devPath)) return path.resolve(devPath);

  // Packaged: bundled under src/renderer/lab
  const pkgPath = path.join(appRoot, 'src', 'renderer', 'lab');
  if (fs.existsSync(pkgPath)) return path.resolve(pkgPath);

  return null;
}

/**
 * Create the protocol handler function for certstudy-lab:// requests.
 * Returns a handler suitable for protocol.handle().
 */
function createLabProtocolHandler(labRoot, net) {
  const normalizedRoot = path.resolve(labRoot) + path.sep;

  return (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);

    // Serve index.html for root requests
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    const filePath = path.resolve(path.join(labRoot, pathname));

    // Security: prevent path traversal — resolved path must be within labRoot
    if (!filePath.startsWith(normalizedRoot) && filePath !== path.resolve(labRoot)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Check file exists
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new Response('Not Found', { status: 404 });
    }

    // Determine MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Use net.fetch for file:// — Electron's recommended approach
    return net.fetch(`file://${filePath}`).then(response => {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': mimeType },
      });
    });
  };
}

// ── Lab message handlers (mapped from C# LabSimulatorBridge) ──

const messageHandlers = new Map();

/**
 * Register a handler for a lab message type.
 * @param {string} type - Message type identifier
 * @param {(payload: any) => Promise<any>} handler - Async handler function
 */
function registerLabMessageHandler(type, handler) {
  messageHandlers.set(type, handler);
}

/**
 * Register all default lab message handlers.
 * Maps the C# LabSimulatorBridge.RegisterDefaultHandlers() equivalents.
 */
function registerDefaultHandlers(appVersion) {
  // 'ready' — lab SPA signals it has booted; respond with init info
  registerLabMessageHandler('ready', async (_payload) => {
    return {
      appVersion: appVersion || '1.0.0',
      electronVersion: process.versions.electron || 'unknown',
      platform: process.platform,
    };
  });

  // 'log' — lab SPA sends debug log messages
  registerLabMessageHandler('log', async (payload) => {
    const msg = payload?.message ?? payload ?? '';
    console.log(`[LabSimulator] ${msg}`);
    return null;
  });

  // 'state:save' — lab requests state persistence (handled in renderer IndexedDB,
  // but main can acknowledge)
  registerLabMessageHandler('state:save', async (payload) => {
    console.log('[LabSimulator] State save acknowledged');
    return { acknowledged: true };
  });

  // 'state:load' — lab requests state load
  registerLabMessageHandler('state:load', async (payload) => {
    // State is managed client-side in IndexedDB; return null to signal
    // the renderer should use its own store
    return null;
  });
}

/**
 * Process an incoming lab message by routing to the appropriate handler.
 * @returns {{ type: string, payload: { success: boolean, data: any } }}
 */
async function processLabMessage(type, payload) {
  const handler = messageHandlers.get(type);

  if (!handler) {
    console.warn(`[LabBridge] Unknown message type: ${type}`);
    return {
      type: 'response',
      payload: { success: false, error: `Unknown message type: ${type}` },
    };
  }

  try {
    const result = await handler(payload);
    return {
      type: 'response',
      payload: { success: true, data: result },
    };
  } catch (err) {
    console.error(`[LabBridge] Handler error for '${type}':`, err);
    return {
      type: 'response',
      payload: { success: false, error: err.message },
    };
  }
}

/**
 * Send a message from main process to the lab renderer.
 * @param {BrowserWindow} mainWindow
 * @param {string} type - Message type
 * @param {any} payload - Message data
 * @param {string} [id] - Optional correlation ID for request-response
 */
function sendToLab(mainWindow, type, payload, id) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const message = { type, payload };
  if (id) message.id = id;
  mainWindow.webContents.send('lab:from-main', message);
}

/**
 * Set up all lab-related IPC handlers.
 * @param {Electron.IpcMain} ipcMain
 * @param {() => BrowserWindow|null} getMainWindow - Getter for current main window
 * @param {string} appVersion - App version string for init response
 */
function setupLabIPC(ipcMain, getMainWindow, appVersion) {
  registerDefaultHandlers(appVersion);

  // lab:message — request-response from lab renderer
  ipcMain.handle('lab:message', async (_event, type, payload) => {
    return processLabMessage(type, payload);
  });

  // lab:notify — fire-and-forget from lab renderer
  ipcMain.on('lab:notify', (_event, type, payload) => {
    const handler = messageHandlers.get(type);
    if (handler) {
      handler(payload).catch(err => {
        console.error(`[LabBridge] Notify handler error for '${type}':`, err);
      });
    } else {
      console.log(`[LabBridge] Notification: ${type}`, payload || '');
    }
  });
}

module.exports = {
  MIME_TYPES,
  resolveLabRoot,
  createLabProtocolHandler,
  registerLabMessageHandler,
  registerDefaultHandlers,
  processLabMessage,
  sendToLab,
  setupLabIPC,
};
