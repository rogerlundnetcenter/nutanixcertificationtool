'use strict';

const DEFAULTS = { width: 1400, height: 900, x: undefined, y: undefined };
const SAVE_DELAY_MS = 500;

/**
 * Read saved window state from store, falling back to defaults.
 * Validates that saved position is visible on at least one display.
 */
function getWindowState(store, screen) {
  const saved = store.get('windowBounds');
  if (!saved || typeof saved !== 'object') return { ...DEFAULTS, isMaximized: false };

  const bounds = {
    width:  Number.isFinite(saved.width)  && saved.width  > 0 ? saved.width  : DEFAULTS.width,
    height: Number.isFinite(saved.height) && saved.height > 0 ? saved.height : DEFAULTS.height,
    x:      Number.isFinite(saved.x) ? saved.x : undefined,
    y:      Number.isFinite(saved.y) ? saved.y : undefined,
    isMaximized: !!saved.isMaximized,
  };

  if (bounds.x !== undefined && bounds.y !== undefined && screen) {
    if (!isVisibleOnAnyDisplay(bounds, screen.getAllDisplays())) {
      bounds.x = undefined;
      bounds.y = undefined;
    }
  }

  return bounds;
}

/**
 * Returns true when at least 100×100 px of the window overlaps a display.
 */
function isVisibleOnAnyDisplay(bounds, displays) {
  const MIN_OVERLAP = 100;
  return displays.some(({ bounds: d }) => {
    const overlapX = Math.max(0,
      Math.min(bounds.x + bounds.width, d.x + d.width) - Math.max(bounds.x, d.x));
    const overlapY = Math.max(0,
      Math.min(bounds.y + bounds.height, d.y + d.height) - Math.max(bounds.y, d.y));
    return overlapX >= MIN_OVERLAP && overlapY >= MIN_OVERLAP;
  });
}

/**
 * Attach event listeners to persist window bounds on move/resize/maximize.
 * Saves are debounced to avoid excessive writes during drag operations.
 */
function trackWindowState(win, store) {
  let saveTimeout = null;
  let lastBounds = {};

  function scheduleSave() {
    if (win.isMaximized()) return; // don't overwrite normal bounds while maximized
    lastBounds = win.getBounds();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      store.set('windowBounds', { ...lastBounds, isMaximized: false });
    }, SAVE_DELAY_MS);
  }

  win.on('move', scheduleSave);
  win.on('resize', scheduleSave);

  win.on('maximize', () => {
    clearTimeout(saveTimeout);
    store.set('windowBounds', { ...lastBounds, isMaximized: true });
  });

  win.on('unmaximize', () => {
    // After unmaximize, save the restored bounds
    lastBounds = win.getBounds();
    store.set('windowBounds', { ...lastBounds, isMaximized: false });
  });

  win.on('close', () => {
    clearTimeout(saveTimeout);
    const finalBounds = win.isMaximized() ? lastBounds : win.getBounds();
    store.set('windowBounds', { ...finalBounds, isMaximized: win.isMaximized() });
  });
}

module.exports = { getWindowState, trackWindowState, isVisibleOnAnyDisplay, DEFAULTS, SAVE_DELAY_MS };
