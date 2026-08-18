// localStorage polyfill — installs an in-memory localStorage on `window` when
// the browser blocks access (sandboxed iframes, Safari ITP, third-party cookies
// disabled). Must run BEFORE @base44/sdk's createClient, which reads
// window.localStorage at import time and throws:
//   SecurityError: Failed to read the 'localStorage' property from 'Window'

if (typeof window !== "undefined") {
  try {
    const probe = "__localStorage_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch {
    const store = new Map();
    const shim = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
      clear: () => { store.clear(); },
      key: (i) => Array.from(store.keys())[i] || null,
      get length() { return store.size; },
    };
    try {
      Object.defineProperty(window, "localStorage", {
        value: shim,
        writable: true,
        configurable: true,
      });
    } catch {
      try { window.localStorage = shim; } catch { /* read-only window — give up */ }
    }
  }
}