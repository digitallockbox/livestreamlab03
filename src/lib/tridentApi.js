/**
 * Trident System API Client
 * All calls proxy to https://api.tridentsystem.live
 * Frontend → tridentApi → api.tridentsystem.live → engines
 */

const BASE_URL = 'https://api.tridentsystem.live';

async function call(path, body = {}, method = 'POST', includeCredentials = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
    credentials: includeCredentials ? 'include' : 'omit',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[TridentAPI] ${path} → ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// ─── Auth ─────────────────────────────────────────────────────────────────
// Isolated session authentication (creator vs admin)
export const authApi = {
  creatorLogin: (body) => call('/auth/creator/login', body, 'POST', true),
  adminLogin: (body) => call('/auth/admin/login', body, 'POST', true),
  creatorLogout: () => call('/auth/creator/logout', {}, 'POST', true),
  adminLogout: () => call('/auth/admin/logout', {}, 'POST', true),
  validateCreator: () => call('/auth/creator/validate', {}, 'GET', true),
  validateAdmin: () => call('/auth/admin/validate', {}, 'GET', true),
  // Legacy support
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
  // Stream viewer page
  getStream: (body) => call('/public/stream', body),
  getStreamChat: (body) => call('/public/stream/chat', body),
  sendStreamChat: (body) => call('/public/stream/chat/send', body),
  getRecommendedStreams: (body) => call('/public/streams/recommended', body),
  sendTip: (body) => call('/wallet/streaming/transfer', body),
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
// Deprecated: use founderApi instead — kept for backwards compat
export const engineApi = {
  run: (body) => call('/founder/engine/run', body),
  status: () => call('/founder/engine/status', {}, 'GET'),
  logs: (body) => call('/kernel/logs', body),
};

// ─── Coin Ledger ($STREAMING) ─────────────────────────────────────────────
export const coinApi = {
  balance:      ()     => call('/coin/balance', {}, 'GET'),
  transactions: ()     => call('/coin/transactions', {}, 'GET'),
  supply:       ()     => call('/coin/supply', {}, 'GET'),
  earn:         (body) => call('/coin/earn', body),
  spend:        (body) => call('/coin/spend', body),
  transfer:     (body) => call('/coin/transfer', body),
};

// ─── Phantom Wallet ───────────────────────────────────────────────────────
export const phantomApi = {
  challenge: ()     => call('/wallet/phantom/challenge', {}),
  verify:    (body) => call('/wallet/phantom/verify', body),
  link:      (body) => call('/wallet/phantom/link', body),
  status:    ()     => call('/wallet/phantom/status', {}, 'GET'),
  unlink:    ()     => call('/wallet/phantom/unlink', {}),
};

// ─── Founder OS (privileged) ──────────────────────────────────────────────
export const founderApi = {
  // Engine
  engineStatus:  ()     => call('/founder/engine/status', {}, 'GET'),
  engineRestart: ()     => call('/founder/engine/restart', {}),
  engineMode:    (mode) => call('/founder/engine/mode', { mode }),
  // Ledger
  ledger:        ()     => call('/founder/ledger', {}, 'GET'),
  // Payouts / Settlements
  payoutsList:   ()     => call('/founder/payouts', {}, 'GET'),
  payoutsRun:    (body) => call('/founder/payouts/run', body),
  // Domains / Routing
  domains:       ()     => call('/founder/domains', {}, 'GET'),
  // Overwatch / War Room
  overwatch:     ()     => call('/founder/overwatch', {}, 'GET'),
  warroom:       ()     => call('/founder/warroom', {}, 'GET'),
};