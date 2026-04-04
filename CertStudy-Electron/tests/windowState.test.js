'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { getWindowState, trackWindowState, isVisibleOnAnyDisplay, DEFAULTS } = require('../src/main/windowState');

// --- helpers ---

function makeStore(initial = {}) {
  const data = { ...initial };
  return {
    get(key) { return data[key]; },
    set(key, val) { data[key] = val; },
    _data: data,
  };
}

function makeScreen(displays) {
  return { getAllDisplays: () => displays };
}

const PRIMARY = { bounds: { x: 0, y: 0, width: 1920, height: 1080 } };
const SECONDARY = { bounds: { x: 1920, y: 0, width: 2560, height: 1440 } };

function makeWindow(bounds = { x: 100, y: 100, width: 1400, height: 900 }) {
  const listeners = {};
  let maximized = false;
  let currentBounds = { ...bounds };
  return {
    getBounds() { return { ...currentBounds }; },
    setBounds(b) { currentBounds = { ...b }; },
    isMaximized() { return maximized; },
    maximize() { maximized = true; },
    unmaximize() { maximized = false; },
    on(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    emit(event) {
      (listeners[event] || []).forEach(fn => fn());
    },
    _setMaximized(v) { maximized = v; },
  };
}

// --- getWindowState ---

describe('getWindowState', () => {
  it('returns defaults when store is empty', () => {
    const state = getWindowState(makeStore(), null);
    assert.equal(state.width, DEFAULTS.width);
    assert.equal(state.height, DEFAULTS.height);
    assert.equal(state.x, undefined);
    assert.equal(state.y, undefined);
    assert.equal(state.isMaximized, false);
  });

  it('restores saved bounds', () => {
    const store = makeStore({ windowBounds: { x: 50, y: 60, width: 1000, height: 700 } });
    const state = getWindowState(store, makeScreen([PRIMARY]));
    assert.equal(state.x, 50);
    assert.equal(state.y, 60);
    assert.equal(state.width, 1000);
    assert.equal(state.height, 700);
  });

  it('resets position when saved window is off-screen', () => {
    const store = makeStore({ windowBounds: { x: 5000, y: 5000, width: 1400, height: 900 } });
    const state = getWindowState(store, makeScreen([PRIMARY]));
    assert.equal(state.x, undefined);
    assert.equal(state.y, undefined);
    assert.equal(state.width, 1400);
    assert.equal(state.height, 900);
  });

  it('keeps position when visible on secondary monitor', () => {
    const store = makeStore({ windowBounds: { x: 2000, y: 100, width: 1400, height: 900 } });
    const state = getWindowState(store, makeScreen([PRIMARY, SECONDARY]));
    assert.equal(state.x, 2000);
    assert.equal(state.y, 100);
  });

  it('falls back defaults for invalid saved width/height', () => {
    const store = makeStore({ windowBounds: { x: 0, y: 0, width: -1, height: NaN } });
    const state = getWindowState(store, makeScreen([PRIMARY]));
    assert.equal(state.width, DEFAULTS.width);
    assert.equal(state.height, DEFAULTS.height);
  });

  it('handles non-object saved value gracefully', () => {
    const store = makeStore({ windowBounds: 'garbage' });
    const state = getWindowState(store, null);
    assert.equal(state.width, DEFAULTS.width);
  });

  it('restores isMaximized flag', () => {
    const store = makeStore({ windowBounds: { x: 0, y: 0, width: 1400, height: 900, isMaximized: true } });
    const state = getWindowState(store, makeScreen([PRIMARY]));
    assert.equal(state.isMaximized, true);
  });

  it('resets position for negative coordinates off-screen', () => {
    const store = makeStore({ windowBounds: { x: -3000, y: -3000, width: 1400, height: 900 } });
    const state = getWindowState(store, makeScreen([PRIMARY]));
    assert.equal(state.x, undefined);
    assert.equal(state.y, undefined);
  });
});

// --- isVisibleOnAnyDisplay ---

describe('isVisibleOnAnyDisplay', () => {
  it('returns true for fully visible window', () => {
    assert.equal(isVisibleOnAnyDisplay({ x: 100, y: 100, width: 800, height: 600 }, [PRIMARY]), true);
  });

  it('returns false for completely off-screen window', () => {
    assert.equal(isVisibleOnAnyDisplay({ x: 5000, y: 5000, width: 800, height: 600 }, [PRIMARY]), false);
  });

  it('returns false when overlap is less than 100px in either dimension', () => {
    // only 50px overlap horizontally
    assert.equal(isVisibleOnAnyDisplay({ x: -750, y: 200, width: 800, height: 600 }, [PRIMARY]), false);
  });

  it('returns true when partially visible (>=100px overlap)', () => {
    // 200px overlap horizontally, full height visible
    assert.equal(isVisibleOnAnyDisplay({ x: -600, y: 200, width: 800, height: 600 }, [PRIMARY]), true);
  });
});

// --- trackWindowState ---

describe('trackWindowState', () => {
  it('saves bounds on close', () => {
    const store = makeStore();
    const win = makeWindow();
    trackWindowState(win, store);

    win.emit('close');
    assert.deepEqual(store._data.windowBounds, { x: 100, y: 100, width: 1400, height: 900, isMaximized: false });
  });

  it('saves maximized state on maximize', () => {
    const store = makeStore();
    const win = makeWindow();
    trackWindowState(win, store);

    // Simulate a resize first to populate lastBounds, then maximize
    win.emit('resize');
    win._setMaximized(true);
    win.emit('maximize');

    assert.equal(store._data.windowBounds.isMaximized, true);
  });

  it('saves non-maximized state on unmaximize', () => {
    const store = makeStore();
    const win = makeWindow();
    win._setMaximized(true);
    trackWindowState(win, store);

    win._setMaximized(false);
    win.emit('unmaximize');

    assert.equal(store._data.windowBounds.isMaximized, false);
  });

  it('debounces saves on move/resize', async () => {
    const store = makeStore();
    const win = makeWindow();
    trackWindowState(win, store);

    win.setBounds({ x: 200, y: 200, width: 1400, height: 900 });
    win.emit('move');
    win.setBounds({ x: 300, y: 300, width: 1400, height: 900 });
    win.emit('move');

    // Not saved yet (debounced)
    assert.equal(store._data.windowBounds, undefined);

    // Wait for debounce
    await new Promise(r => setTimeout(r, 600));
    assert.equal(store._data.windowBounds.x, 300);
    assert.equal(store._data.windowBounds.y, 300);
  });

  it('clears debounce timer on close (saves immediately)', () => {
    const store = makeStore();
    const win = makeWindow();
    trackWindowState(win, store);

    win.setBounds({ x: 400, y: 400, width: 1400, height: 900 });
    win.emit('move');

    // Close before debounce fires
    win.emit('close');
    assert.equal(store._data.windowBounds.x, 400);
    assert.equal(store._data.windowBounds.y, 400);
  });

  it('preserves normal bounds when closing while maximized', () => {
    const store = makeStore();
    const win = makeWindow({ x: 50, y: 50, width: 1400, height: 900 });
    trackWindowState(win, store);

    // Simulate move to populate lastBounds, then maximize, then close
    win.emit('resize');
    win._setMaximized(true);
    win.emit('maximize');
    win.emit('close');

    assert.equal(store._data.windowBounds.isMaximized, true);
    assert.equal(store._data.windowBounds.x, 50);
    assert.equal(store._data.windowBounds.width, 1400);
  });
});
