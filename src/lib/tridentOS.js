/**
 * Trident OS SDK — Frontend Client Wrapper
 *
 * Reads config from the <script> tag's data attributes (data-tenant,
 * data-website, data-token) injected in index.html. Detects the SDK global
 * (window.TridentOS) once the external script loads and provides a queued
 * event API so calls before SDK readiness are buffered and flushed.
 *
 * Usage:
 *   import { tridentOS, trackEvent, identify } from "@/lib/tridentOS";
 *   tridentOS.getStatus();          // → "loading" | "ready" | "missing"
 *   trackEvent("page_view", { url: "/" });
 *   identify(walletAddress);
 */

const SDK_GLOBAL = "TridentOS";
const SCRIPT_SELECTOR = "script[data-tenant][data-website]";

let _config = null;
let _status = "loading"; // loading | ready | missing
let _queue = [];
const _listeners = new Set();

function readConfig() {
  if (_config) return _config;
  const script = document.querySelector(SCRIPT_SELECTOR);
  if (!script) {
    _config = null;
    return null;
  }
  _config = {
    tenant: script.dataset.tenant || "",
    website: script.dataset.website || "",
    token: script.dataset.token || "",
    src: script.src || "",
  };
  return _config;
}

function getSDK() {
  return typeof window !== "undefined" ? window[SDK_GLOBAL] : undefined;
}

function setStatus(s) {
  _status = s;
  _listeners.forEach((fn) => fn(s));
}

function flushQueue() {
  if (!_queue.length || !getSDK()) return;
  const sdk = getSDK();
  _queue.forEach(([method, args]) => {
    try {
      if (typeof sdk[method] === "function") sdk[method](...args);
    } catch (e) {
      console.warn(`[TridentOS] queued ${method} failed:`, e?.message || e);
    }
  });
  _queue = [];
}

function detectSDK() {
  const sdk = getSDK();
  if (sdk) {
    setStatus("ready");
    flushQueue();
    return true;
  }
  return false;
}

/** Initialize — call once on app boot. Polls for the SDK global. */
function init() {
  readConfig();
  if (detectSDK()) return;

  // Poll for up to 10 seconds (SDK script may still be downloading)
  let attempts = 0;
  const maxAttempts = 20;
  const interval = setInterval(() => {
    attempts++;
    if (detectSDK()) {
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      setStatus("missing");
    }
  }, 500);
}

function enqueueOrCall(method, ...args) {
  const sdk = getSDK();
  if (sdk && typeof sdk[method] === "function") {
    try { return sdk[method](...args); } catch (e) {
      console.warn(`[TridentOS] ${method} failed:`, e?.message || e);
    }
  } else {
    _queue.push([method, args]);
  }
}

// ─── Public API ───────────────────────────────────────────

export const tridentOS = {
  init,
  getConfig: () => readConfig(),
  getStatus: () => _status,
  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
  /** Raw SDK global (null if not loaded). */
  get raw() { return getSDK() || null; },
};

/** Track an event. Queued if SDK isn't ready yet. */
export function trackEvent(name, properties = {}) {
  return enqueueOrCall("track", name, properties);
}

/** Identify the current user (wallet address or user ID). */
export function identify(userId, traits = {}) {
  return enqueueOrCall("identify", userId, traits);
}

/** Set a custom property on the current session. */
export function setProperty(key, value) {
  return enqueueOrCall("set", key, value);
}

// Auto-init on module load (browser only)
if (typeof window !== "undefined") {
  init();
}