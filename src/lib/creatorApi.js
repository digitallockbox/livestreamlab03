/**
 * Creator API Client
 * All calls proxy to https://api.tridentsystem.live
 * Creator-only endpoints — do not use for admin operations
 */

import { base44 } from '@/api/base44Client';

const BASE_PATH = '';

async function call(path, body = {}, method = 'POST') {
  const res = await base44.functions.invoke('tridentProxy', {
    method,
    path: `${BASE_PATH}${path}`,
    body: method !== 'GET' ? body : undefined,
  });
  return res.data;
}

// Special handler for file uploads with FormData
async function uploadFile(path, formData) {
  const res = await base44.functions.invoke('tridentProxy', {
    method: 'POST',
    path: `${BASE_PATH}${path}`,
    formData,
  });
  return res.data;
}

// ─── Creator Dashboard ─────────────────────────────────────────────────────
export const creatorDashboardApi = {
  overview: () => call('/creator/dashboard/overview', {}, 'GET'),
  earnings: () => call('/creator/earnings', {}, 'GET'),
  analytics: (filters) => call('/creator/analytics', filters, 'POST'),
};

// ─── Content Management ────────────────────────────────────────────────────
export const contentApi = {
  // Videos
  uploadVideo: (formData) => call('/video/upload', formData),
  listVideos: () => call('/video/list', {}, 'GET'),
  getVideo: (id) => call('/video/get', { video_id: id }, 'GET'),
  updateVideo: (body) => call('/video/update', body),
  deleteVideo: (body) => call('/video/delete', body),
  
  // Podcasts/Audio
  uploadAudio: (formData) => call('/audio/upload', formData),
  listAudio: () => call('/audio/list', {}, 'GET'),
  getAudio: (id) => call('/audio/get', { audio_id: id }, 'GET'),
  
  // Streams
  listStreams: () => call('/creator/streams', {}, 'GET'),
  getStream: (id) => call('/creator/stream', { stream_id: id }, 'GET'),
};

// ─── Wallet & Earnings ─────────────────────────────────────────────────────
export const creatorWalletApi = {
  balance: () => call('/wallet/streaming/balance', {}, 'GET'),
  transactions: () => call('/wallet/streaming/transactions', {}, 'GET'),
  payouts: () => call('/creator/payouts', {}, 'GET'),
  withdraw: (body) => call('/wallet/streaming/withdraw', body),
};

// ─── Profile & Settings ────────────────────────────────────────────────────
export const creatorProfileApi = {
  get: () => call('/creator/profile', {}, 'GET'),
  update: (body) => call('/creator/profile/update', body),
  settings: () => call('/creator/settings', {}, 'GET'),
  updateSettings: (body) => call('/creator/settings/update', body),
};

// ─── Store & Products ──────────────────────────────────────────────────────
export const creatorStoreApi = {
  listProducts: () => call('/creator/store/products', {}, 'GET'),
  createProduct: (body) => call('/creator/store/product/create', body),
  updateProduct: (body) => call('/creator/store/product/update', body),
  deleteProduct: (body) => call('/creator/store/product/delete', body),
};

// ─── Affiliates ────────────────────────────────────────────────────────────
export const creatorAffiliateApi = {
  listLinks: () => call('/creator/affiliates/links', {}, 'GET'),
  createLink: (body) => call('/creator/affiliates/link/create', body),
  updateLink: (body) => call('/creator/affiliates/link/update', body),
  analytics: () => call('/creator/affiliates/analytics', {}, 'GET'),
};