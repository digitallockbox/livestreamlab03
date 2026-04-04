/**
 * Trident API Client
 * Base44 UI → Trident OS
 * All calls go to https://api.trident.live/api/*
 * Engines are never exposed. Logic stays sovereign.
 */

const TRIDENT_BASE = "https://api.trident.live/api";

function getToken() {
  return localStorage.getItem("trident_token") || null;
}

function setToken(token) {
  localStorage.setItem("trident_token", token);
}

function clearToken() {
  localStorage.removeItem("trident_token");
}

async function request(method, path, body = null, requiresAuth = true) {
  const headers = { "Content-Type": "application/json" };
  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${TRIDENT_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Trident API error ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  login:   (email, password)         => request("POST", "/auth/login",   { email, password }, false),
  signup:  (email, password, username) => request("POST", "/auth/signup", { email, password, username }, false),
  me:      ()                        => request("GET",  "/auth/me"),
  refresh: (refresh_token)           => request("POST", "/auth/refresh", { refresh_token }, false),
  logout:  () => clearToken(),
  setToken,
  getToken,
};

// ─── Creator ─────────────────────────────────────────────────────────────────
export const creator = {
  getProfile:      ()     => request("GET",   "/creator/profile"),
  updateProfile:   (data) => request("PATCH", "/creator/profile", data),
  getSegment:      ()     => request("GET",   "/creator/segment"),
  refreshSegment:  ()     => request("POST",  "/creator/segment/refresh"),
  getRisk:         ()     => request("GET",   "/creator/risk"),
  refreshRisk:     ()     => request("POST",  "/creator/risk/refresh"),
  startOnboarding: ()     => request("POST",  "/creator/onboarding/start"),
  getOnboarding:   ()     => request("GET",   "/creator/onboarding/status"),
};

// ─── Streaming ───────────────────────────────────────────────────────────────
export const stream = {
  start:    (title, category) => request("POST", "/stream/start",      { title, category }),
  end:      (stream_id)       => request("POST", "/stream/end",        { stream_id }),
  getById:  (id)              => request("GET",  `/stream/${id}`,      null, false),
  getChat:  (id)              => request("GET",  `/stream/${id}/chat`, null, false),
  sendChat: (id, text)        => request("POST", `/stream/${id}/chat`, { text }),
  tip:      (id, amount, currency) => request("POST", `/stream/${id}/tip`, { amount, currency }),
};

// ─── Content ─────────────────────────────────────────────────────────────────
export const content = {
  upload:   (data) => request("POST",   "/content/upload", data),
  list:     ()     => request("GET",    "/content/list"),
  getById:  (id)   => request("GET",    `/content/${id}`, null, false),
  delete:   (id)   => request("DELETE", `/content/${id}`),
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const store = {
  createItem: (data)              => request("POST", "/store/item",     data),
  listItems:  ()                  => request("GET",  "/store/items"),
  purchase:   (item_id, payment)  => request("POST", "/store/purchase", { item_id, payment }),
};

// ─── Payouts ─────────────────────────────────────────────────────────────────
export const payouts = {
  getSummary: ()                   => request("GET",  "/payouts/summary"),
  request:    (amount, method)     => request("POST", "/payouts/request", { amount, method }),
  getMethods: ()                   => request("GET",  "/payouts/methods"),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analytics = {
  overview:         ()   => request("GET", "/analytics/overview"),
  byStream:         (id) => request("GET", `/analytics/stream/${id}`),
  byContent:        (id) => request("GET", `/analytics/content/${id}`),
};

// ─── System ──────────────────────────────────────────────────────────────────
export const system = {
  health:        () => request("GET", "/system/health",  null, false),
  enginesHealth: () => request("GET", "/engines/health", null, false),
};

// ─── Default export ──────────────────────────────────────────────────────────
const trident = { auth, creator, stream, content, store, payouts, analytics, system, TRIDENT_BASE };
export default trident;