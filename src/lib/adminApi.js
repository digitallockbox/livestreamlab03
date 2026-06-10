/**
 * Admin/Founder API Client
 * All calls proxy to https://api.tridentsystem.live
 * Admin-only endpoints — requires admin role authentication
 */

import { base44 } from '@/api/base44Client';

const BASE_PATH = '/founder';

async function call(path, body = {}, method = 'POST') {
  const res = await base44.functions.invoke('tridentProxy', {
    method,
    path: `${BASE_PATH}${path}`,
    body: method !== 'GET' ? body : undefined,
  });
  return res.data;
}

// ─── Engine Control ────────────────────────────────────────────────────────
export const engineApi = {
  status: () => call('/engine/status', {}, 'GET'),
  restart: () => call('/engine/restart', {}),
  mode: (mode) => call('/engine/mode', { mode }),
  run: (engineId) => call('/engine/run', { engine_id: engineId }),
};

// ─── Coin Ledger ───────────────────────────────────────────────────────────
export const ledgerApi = {
  overview: () => call('/ledger', {}, 'GET'),
  supply: () => call('/coin/supply', {}, 'GET'),
  transactions: (filters) => call('/coin/transactions', filters),
  wallets: () => call('/coin/wallets', {}, 'GET'),
};

// ─── Platform Analytics ────────────────────────────────────────────────────
export const platformAnalyticsApi = {
  overview: () => call('/analytics/overview', {}, 'GET'),
  creators: () => call('/analytics/creators', {}, 'GET'),
  revenue: () => call('/analytics/revenue', {}, 'GET'),
  retention: () => call('/analytics/retention', {}, 'GET'),
};

// ─── User Management ───────────────────────────────────────────────────────
export const userManagementApi = {
  list: (filters) => call('/users', filters),
  get: (userId) => call('/user', { user_id: userId }),
  update: (body) => call('/user/update', body),
  suspend: (body) => call('/user/suspend', body),
  delete: (body) => call('/user/delete', body),
};

// ─── Moderation & Flags ────────────────────────────────────────────────────
export const moderationApi = {
  flags: () => call('/moderation/flags', {}, 'GET'),
  action: (body) => call('/moderation/action', body),
  list: (filters) => call('/moderation/list', filters),
};

// ─── Payouts & Settlements ─────────────────────────────────────────────────
export const payoutsApi = {
  list: () => call('/payouts', {}, 'GET'),
  process: (body) => call('/payouts/run', body),
  pending: () => call('/payouts/pending', {}, 'GET'),
};

// ─── Domains & Routing ─────────────────────────────────────────────────────
export const domainsApi = {
  list: () => call('/domains', {}, 'GET'),
  status: (domain) => call('/domain/status', { domain }),
  update: (body) => call('/domain/update', body),
};

// ─── Overwatch & War Room ──────────────────────────────────────────────────
export const overwatchApi = {
  dashboard: () => call('/overwatch', {}, 'GET'),
  warroom: () => call('/warroom', {}, 'GET'),
  alerts: () => call('/overwatch/alerts', {}, 'GET'),
  stressTest: (body) => call('/warroom/stress-test', body),
};

// ─── System Health ─────────────────────────────────────────────────────────
export const systemHealthApi = {
  status: () => call('/system/health', {}, 'GET'),
  logs: (filters) => call('/system/logs', filters),
  metrics: () => call('/system/metrics', {}, 'GET'),
};