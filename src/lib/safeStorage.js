// Safe localStorage wrapper — falls back to an in-memory Map when localStorage
// is blocked (sandboxed iframes, Safari ITP, third-party cookies disabled).
// Prevents: SecurityError: Failed to read the 'localStorage' property from 'Window'.

const memoryStore = new Map();
let _resolved = null;

function resolve() {
  if (_resolved !== null) return _resolved;
  try {
    const probe = "__safeStorage_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    _resolved = window.localStorage;
  } catch {
    _resolved = memoryStore;
  }
  return _resolved;
}

export const safeStorage = {
  getItem(key) {
    try { return resolve().getItem(key); } catch { return null; }
  },
  setItem(key, value) {
    try { resolve().setItem(key, value); } catch {}
  },
  removeItem(key) {
    try { resolve().removeItem(key); } catch {}
  },
};