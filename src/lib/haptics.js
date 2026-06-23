// Progressive-enhancement haptics. No-ops where unsupported (iOS Safari has no
// vibrate API). Self-syncing: lazily reads the saved setting on first use, and the
// Settings toggle calls setHaptics() so we never add an App.jsx hook.
let enabled = null; // null = not yet read

function readEnabled() {
  try {
    const raw = localStorage.getItem('coven:v1:settings');
    if (raw) return JSON.parse(raw).haptics !== false;
  } catch {}
  return true; // default on
}

export function setHaptics(on) { enabled = on !== false; }

const can = () => {
  if (enabled === null) enabled = readEnabled();
  return enabled && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
};

// Short, distinct patterns per reward moment (ms; arrays are vibrate/pause sequences).
const P = { tap: 8, like: [0, 14], react: 10, rite: [0, 18, 40, 28], secret: [0, 30, 60, 30], nav: 6 };

export function buzz(kind = 'tap') {
  if (can()) { try { navigator.vibrate(P[kind] || P.tap); } catch {} }
}
