/**
 * Trident System API Client
 * All calls proxy to https://api.tridentsystem.live
 * Frontend → tridentApi → api.tridentsystem.live → engines
 */

const BASE_URL = 'https://api.tridentsystem.live';

async function call(path, body = {}, method = 'POST') {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[TridentAPI] ${path} → ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (body) => call('/auth/login', body),
  register: (body) => call('/auth/register', body),
  walletAuth: (body) => call('/auth/wallet', body),
};

// ─── Public ───────────────────────────────────────────────────────────────
export const publicApi = {
  home: () => call('/public/home'),
  user: (username) => call('/public/user', { username }),
  explore: (filters) => call('/public/explore', filters),
  creator: (id) => call('/public/creator', { id }),
  video: (id) => call('/public/video', { id }),
  livestream: (id) => call('/public/livestream', { id }),
};

// ─── Creator ──────────────────────────────────────────────────────────────
export const creatorApi = {
  analytics: (body) => call('/creator/analytics', body),
  profile: (body) => call('/creator/profile', body),
  earnings: (body) => call('/creator/earnings', body),
  updateProfile: (body) => call('/creator/profile/update', body),
};

// ─── Streaming ────────────────────────────────────────────────────────────
export const streamingApi = {
  start: (body) => call('/streaming/start', body),
  end: (body) => call('/streaming/end', body),
  status: (id) => call('/streaming/status', { id }),
};

// ─── Video ────────────────────────────────────────────────────────────────
export const videoApi = {
  upload: (body) => call('/video/upload', body),
  list: (body) => call('/video/list', body),
  get: (id) => call('/video/get', { id }),
};

// ─── Wallet / $STREAMING ──────────────────────────────────────────────────
export const walletApi = {
  balance: (body) => call('/wallet/streaming/balance', body),
  transactions: (body) => call('/wallet/streaming/transactions', body),
  deposit: (body) => call('/wallet/streaming/deposit', body),
  withdraw: (body) => call('/wallet/streaming/withdraw', body),
  transfer: (body) => call('/wallet/streaming/transfer', body),
  connectExternal: (body) => call('/wallet/streaming/connect', body),
};

// ─── Audio ────────────────────────────────────────────────────────────────
export const audioApi = {
  upload: (body) => call('/audio/upload', body),
  list: (body) => call('/audio/list', body),
  get: (id) => call('/audio/get', { id }),
};

// ─── Auto-Splits ──────────────────────────────────────────────────────────
export const autosplitsApi = {
  list: (body) => call('/autosplits/list', body),
  create: (body) => call('/autosplits/create', body),
  update: (body) => call('/autosplits/update', body),
  delete: (body) => call('/autosplits/delete', body),
};

// ─── Moderation ───────────────────────────────────────────────────────────
export const moderationApi = {
  action: (body) => call('/moderation/action', body),
  flags: (body) => call('/risk/flags', body),
  list: (body) => call('/moderation/list', body),
};

// ─── Payouts ──────────────────────────────────────────────────────────────
export const payoutsApi = {
  process: (body) => call('/payouts/process', body),
  list: (body) => call('/payouts/list', body),
};

// ─── Founder OS ───────────────────────────────────────────────────────────
export const engineApi = {
  run: (body) => call('/engine/run', body),
  status: () => call('/engine/status'),
  logs: (body) => call('/kernel/logs', body),
};