'use strict';

const { describe, it, beforeEach, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  MIME_TYPES,
  resolveLabRoot,
  createLabProtocolHandler,
  registerLabMessageHandler,
  registerDefaultHandlers,
  processLabMessage,
  sendToLab,
  setupLabIPC,
} = require('../src/main/ipc/labHandlers');

// ── Fixtures ──

const LAB_WEB_DIR = path.resolve(__dirname, '..', '..', 'CertStudy', 'LabSimulator', 'Web');
const LAB_EXISTS = fs.existsSync(LAB_WEB_DIR);

// ── resolveLabRoot ──

describe('resolveLabRoot', () => {
  it('resolves the dev CertStudy/LabSimulator/Web path', () => {
    const appRoot = path.resolve(__dirname, '..');
    const result = resolveLabRoot(appRoot);
    if (LAB_EXISTS) {
      assert.equal(result, path.resolve(LAB_WEB_DIR));
    } else {
      // In CI without the adjacent repo, may return a packaged fallback or null
      assert.ok(result === null || typeof result === 'string');
    }
  });

  it('returns null when neither dev nor packaged path exists', () => {
    const result = resolveLabRoot(path.join(os.tmpdir(), 'nonexistent-certstudy-dir'));
    assert.equal(result, null);
  });
});

// ── MIME_TYPES ──

describe('MIME_TYPES', () => {
  it('maps common extensions', () => {
    assert.equal(MIME_TYPES['.html'], 'text/html');
    assert.equal(MIME_TYPES['.js'], 'application/javascript');
    assert.equal(MIME_TYPES['.css'], 'text/css');
    assert.equal(MIME_TYPES['.json'], 'application/json');
    assert.equal(MIME_TYPES['.png'], 'image/png');
    assert.equal(MIME_TYPES['.svg'], 'image/svg+xml');
  });

  it('includes font types', () => {
    assert.equal(MIME_TYPES['.woff2'], 'font/woff2');
    assert.equal(MIME_TYPES['.ttf'], 'font/ttf');
  });
});

// ── createLabProtocolHandler ──

describe('createLabProtocolHandler', { skip: !LAB_EXISTS && 'Lab files not available' }, () => {
  let handler;

  before(() => {
    // Minimal net mock — we test the security/routing logic, not actual file serving
    const mockNet = {
      fetch: (url) => Promise.resolve({
        body: null,
        status: 200,
        statusText: 'OK',
      }),
    };
    handler = createLabProtocolHandler(LAB_WEB_DIR, mockNet);
  });

  it('serves index.html for root path', async () => {
    const result = await handler({ url: 'certstudy-lab://lab/' });
    assert.equal(result.status, 200);
  });

  it('serves index.html for empty path', async () => {
    const result = await handler({ url: 'certstudy-lab://lab' });
    // Either 200 (serves index.html) or handled
    assert.ok(result.status === 200);
  });

  it('serves known file with correct MIME type', async () => {
    const result = await handler({ url: 'certstudy-lab://lab/index.html' });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('Content-Type'), 'text/html');
  });

  it('serves CSS files with correct MIME type', async () => {
    const result = await handler({ url: 'certstudy-lab://lab/css/tokens.css' });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('Content-Type'), 'text/css');
  });

  it('serves JS files with correct MIME type', async () => {
    const result = await handler({ url: 'certstudy-lab://lab/js/app.js' });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('Content-Type'), 'application/javascript');
  });

  it('returns 404 for missing files', () => {
    const result = handler({ url: 'certstudy-lab://lab/nonexistent.html' });
    // Sync return for 404
    assert.equal(result.status, 404);
  });

  it('blocks path traversal with ../', () => {
    const result = handler({ url: 'certstudy-lab://lab/../../../etc/passwd' });
    assert.ok(result.status === 403 || result.status === 404);
  });

  it('blocks encoded path traversal', () => {
    const result = handler({ url: 'certstudy-lab://lab/%2e%2e/%2e%2e/etc/passwd' });
    assert.ok(result.status === 403 || result.status === 404);
  });

  it('blocks path traversal with backslashes on Windows', () => {
    const result = handler({ url: 'certstudy-lab://lab/..\\..\\..\\Windows\\System32\\config\\SAM' });
    assert.ok(result.status === 403 || result.status === 404);
  });

  it('returns 404 for directory requests (not files)', () => {
    const result = handler({ url: 'certstudy-lab://lab/js' });
    // js/ is a directory, not a file — should 404 (index.html only at root)
    assert.equal(result.status, 404);
  });
});

// ── processLabMessage ──

describe('processLabMessage', () => {
  before(() => {
    registerDefaultHandlers('1.0.0-test');
  });

  it('handles "ready" message with init response', async () => {
    const result = await processLabMessage('ready', {});
    assert.equal(result.type, 'response');
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data.appVersion, '1.0.0-test');
    assert.equal(result.payload.data.platform, process.platform);
    assert.ok(result.payload.data.electronVersion);
  });

  it('handles "log" message', async () => {
    const result = await processLabMessage('log', { message: 'test log entry' });
    assert.equal(result.type, 'response');
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data, null);
  });

  it('handles "state:save" message', async () => {
    const result = await processLabMessage('state:save', { key: 'test' });
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data.acknowledged, true);
  });

  it('handles "state:load" message', async () => {
    const result = await processLabMessage('state:load', {});
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data, null);
  });

  it('returns error for unknown message types', async () => {
    const result = await processLabMessage('nonexistent-type', {});
    assert.equal(result.type, 'response');
    assert.equal(result.payload.success, false);
    assert.ok(result.payload.error.includes('Unknown message type'));
  });

  it('handles handler exceptions gracefully', async () => {
    registerLabMessageHandler('test:throws', async () => {
      throw new Error('Intentional test error');
    });
    const result = await processLabMessage('test:throws', {});
    assert.equal(result.payload.success, false);
    assert.ok(result.payload.error.includes('Intentional test error'));
  });
});

// ── registerLabMessageHandler ──

describe('registerLabMessageHandler', () => {
  it('registers a custom handler that can be invoked', async () => {
    registerLabMessageHandler('test:custom', async (payload) => {
      return { echo: payload.value };
    });
    const result = await processLabMessage('test:custom', { value: 42 });
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data.echo, 42);
  });

  it('overwrites existing handler for same type', async () => {
    registerLabMessageHandler('test:overwrite', async () => 'first');
    registerLabMessageHandler('test:overwrite', async () => 'second');
    const result = await processLabMessage('test:overwrite', {});
    assert.equal(result.payload.data, 'second');
  });
});

// ── sendToLab ──

describe('sendToLab', () => {
  it('sends message to mainWindow webContents', () => {
    const sent = [];
    const mockWindow = {
      isDestroyed: () => false,
      webContents: {
        send: (channel, data) => sent.push({ channel, data }),
      },
    };

    sendToLab(mockWindow, 'init', { version: '1.0' });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].channel, 'lab:from-main');
    assert.equal(sent[0].data.type, 'init');
    assert.deepEqual(sent[0].data.payload, { version: '1.0' });
    assert.equal(sent[0].data.id, undefined);
  });

  it('includes id when provided', () => {
    const sent = [];
    const mockWindow = {
      isDestroyed: () => false,
      webContents: {
        send: (channel, data) => sent.push({ channel, data }),
      },
    };

    sendToLab(mockWindow, 'response', { ok: true }, 'req-123');
    assert.equal(sent[0].data.id, 'req-123');
  });

  it('does nothing when window is null', () => {
    // Should not throw
    sendToLab(null, 'test', {});
  });

  it('does nothing when window is destroyed', () => {
    const mockWindow = { isDestroyed: () => true, webContents: { send: () => { throw new Error('should not be called'); } } };
    sendToLab(mockWindow, 'test', {});
  });
});

// ── setupLabIPC ──

describe('setupLabIPC', () => {
  it('registers lab:message and lab:notify handlers on ipcMain', () => {
    const registered = { handle: [], on: [] };
    const mockIpcMain = {
      handle: (channel, handler) => registered.handle.push({ channel, handler }),
      on: (channel, handler) => registered.on.push({ channel, handler }),
    };

    setupLabIPC(mockIpcMain, () => null, '1.0.0');

    const handleChannels = registered.handle.map(r => r.channel);
    const onChannels = registered.on.map(r => r.channel);

    assert.ok(handleChannels.includes('lab:message'));
    assert.ok(onChannels.includes('lab:notify'));
  });

  it('lab:message handler routes to processLabMessage', async () => {
    let messageHandler;
    const mockIpcMain = {
      handle: (channel, handler) => { if (channel === 'lab:message') messageHandler = handler; },
      on: () => {},
    };

    setupLabIPC(mockIpcMain, () => null, '2.0.0');
    assert.ok(messageHandler, 'lab:message handler should be registered');

    const result = await messageHandler({}, 'ready', {});
    assert.equal(result.type, 'response');
    assert.equal(result.payload.success, true);
  });
});
