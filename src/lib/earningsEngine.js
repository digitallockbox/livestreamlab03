/**
 * Earnings Engine — attribution rules, aggregation, and autosplit calculation.
 *
 * Pure functions that turn real Transaction + WatchSession data into earnings
 * by source (stream, viewer, product, type), then split across participants
 * (team members, affiliates, platform fee).
 *
 * Used by AutosplitPanel and EarningsBreakdown — no backend function needed.
 */

// ── Attribution Rules ──────────────────────────────────────────────────
// audio_boost counts at half value (promotional rate); all other revenue
// types count at full transaction amount. Watch-time earns $0.01/min.
export const earningsRules = {
  stream_tip: (tx) => Number(tx.amount) || 0,
  store_sale: (tx) => Number(tx.amount) || 0,
  video_unlock: (tx) => Number(tx.amount) || 0,
  subscription: (tx) => Number(tx.amount) || 0,
  affiliate: (tx) => Number(tx.amount) || 0,
  podcast: (tx) => Number(tx.amount) || 0,
  audio_boost: (tx) => (Number(tx.amount) || 0) * 0.5,
};

export const watchTimeRate = 0.01;
export const platformFeePct = 5;
export const affiliateSharePct = 2;

export function calcTransactionEarnings(tx) {
  const fn = earningsRules[tx.type];
  return fn ? fn(tx) : 0;
}

export function calcWatchTimeEarnings(minutes) {
  return (Number(minutes) || 0) * watchTimeRate;
}

// ── Aggregation ────────────────────────────────────────────────────────
// Groups earnings by type, stream, viewer, and product from raw entity data.
export function aggregateEarnings(transactions = [], watchSessions = []) {
  const byType = {};
  let total = 0;

  for (const tx of transactions) {
    const amt = calcTransactionEarnings(tx);
    if (amt > 0) {
      byType[tx.type] = (byType[tx.type] || 0) + amt;
      total += amt;
    }
  }

  let watchTimeTotal = 0;
  for (const ws of watchSessions) {
    const amt = calcWatchTimeEarnings(ws.minutes_watched);
    watchTimeTotal += amt;
    total += amt;
  }
  if (watchTimeTotal > 0) byType.watch_time = watchTimeTotal;

  // Per-stream
  const byStream = {};
  for (const tx of transactions) {
    if (tx.stream_id) {
      byStream[tx.stream_id] = (byStream[tx.stream_id] || 0) + calcTransactionEarnings(tx);
    }
  }
  for (const ws of watchSessions) {
    if (ws.stream_id) {
      byStream[ws.stream_id] = (byStream[ws.stream_id] || 0) + calcWatchTimeEarnings(ws.minutes_watched);
    }
  }

  // Per-viewer (sender_wallet for tx, viewer_wallet for watch sessions)
  const byViewer = {};
  for (const tx of transactions) {
    if (tx.sender_wallet) {
      byViewer[tx.sender_wallet] = (byViewer[tx.sender_wallet] || 0) + calcTransactionEarnings(tx);
    }
  }
  for (const ws of watchSessions) {
    if (ws.viewer_wallet) {
      byViewer[ws.viewer_wallet] = (byViewer[ws.viewer_wallet] || 0) + calcWatchTimeEarnings(ws.minutes_watched);
    }
  }

  // Per-product
  const byProduct = {};
  for (const tx of transactions) {
    if (tx.product_id) {
      byProduct[tx.product_id] = (byProduct[tx.product_id] || 0) + calcTransactionEarnings(tx);
    }
  }

  return { total, byType, byStream, byViewer, byProduct };
}

// ── Participants ───────────────────────────────────────────────────────
// Builds the autosplit participant list: team members (custom %),
// active affiliates (2% each), and platform fee (5%).
export function buildParticipants(teamMembers = [], affiliateLinks = []) {
  const team = teamMembers.map((m) => ({
    name: m.name,
    percentage: m.split_percentage || 0,
    type: "team",
  }));
  const affiliates = affiliateLinks
    .filter((a) => (a.clicks || 0) > 0)
    .map((a) => ({
      name: a.title || "Affiliate",
      percentage: affiliateSharePct,
      type: "affiliate",
    }));
  const platform = { name: "Platform Fee", percentage: platformFeePct, type: "platform" };
  return [...team, ...affiliates, platform];
}

// ── Split Calculation ─────────────────────────────────────────────────
// Distributes a total across participants proportionally to their percentages.
export function calculateSplit(total, participants) {
  const totalPct = participants.reduce((s, p) => s + (p.percentage || 0), 0);
  if (totalPct === 0) return participants.map((p) => ({ ...p, amount: 0 }));
  return participants.map((p) => ({
    ...p,
    amount: Math.round((total * (p.percentage || 0) / totalPct) * 100) / 100,
  }));
}