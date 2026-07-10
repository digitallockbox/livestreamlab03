/**
 * Token Analytics Engine — Module H
 *
 * Turns the $STREAMING token identity into a metrics layer: balances, flows,
 * earnings, and history — per creator, per token ID.
 *
 * Pure functions mirroring the PowerShell backend:
 *   initializeTokenLedger() → default {token, ledger, stats}
 *   buildTokenLedgerEntry() → {timestamp, type, amount, source, reference}
 *   addTokenEvent()          → {state, entry} — appends event, updates balance + stats
 *   getTokenAnalytics()      → windowed stats (lifetime + N-day window)
 *
 * The backend persists everything under /data/token/<tokenId>/; these functions
 * provide local fallback computation and type-safe request/response shapes.
 */

/**
 * Default token ledger structure — mirrors Initialize-TokenLedger.
 *   token.json  → { version, balance }
 *   ledger.json → []
 *   stats.json  → { total_earned, total_spent, lastpayoutat }
 */
export function initializeTokenLedger() {
  return {
    token: { version: 1, balance: 0 },
    ledger: [],
    stats: {
      total_earned: 0,
      total_spent: 0,
      lastpayoutat: null,
    },
  };
}

/**
 * Build a ledger entry — mirrors the $entry hashtable in Add-TokenEvent.
 * @param {"earn"|"spend"} type
 * @param {number} amount
 * @param {string} source — e.g. "autosplit", "manual", "refund"
 * @param {string} reference — e.g. payout id, tx id
 */
export function buildTokenLedgerEntry(type, amount, source, reference) {
  if (type !== "earn" && type !== "spend") {
    throw new Error(`Invalid token event type: ${type} (expected "earn" or "spend")`);
  }
  return {
    timestamp: new Date().toISOString(),
    type,
    amount: Number(amount),
    source: source || "manual",
    reference: reference || null,
  };
}

/**
 * Append a token event to the ledger — pure function, returns new state + entry.
 * Mirrors Add-TokenEvent: updates balance, stats, and ledger in one pass.
 *
 * Called from autosplit execution, manual payouts, or future token flows.
 */
export function addTokenEvent(state, { type, amount, source, reference }) {
  const entry = buildTokenLedgerEntry(type, amount, source, reference);
  const token = { ...state.token };
  const stats = { ...state.stats };
  const ledger = [...(state.ledger || []), entry];

  if (type === "earn") {
    token.balance = Number(token.balance) + entry.amount;
    stats.total_earned = Number(stats.total_earned) + entry.amount;
    stats.lastpayoutat = entry.timestamp;
  } else if (type === "spend") {
    token.balance = Number(token.balance) - entry.amount;
    stats.total_spent = Number(stats.total_spent) + entry.amount;
  }

  return { state: { token, ledger, stats }, entry };
}

/**
 * Compute windowed analytics — mirrors Get-TokenAnalytics.
 * Returns lifetime stats + N-day window earn/spend from a ledger state.
 *
 * @param {object} state — {token, ledger, stats}
 * @param {number} days — window size (default 30)
 */
export function getTokenAnalytics(state, days = 30) {
  const ledger = state.ledger || [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let window_earned = 0;
  let window_spent = 0;

  for (const entry of ledger) {
    const ts = new Date(entry.timestamp);
    if (ts >= cutoff) {
      if (entry.type === "earn") window_earned += entry.amount;
      if (entry.type === "spend") window_spent += entry.amount;
    }
  }

  return {
    balance: state.token?.balance ?? 0,
    total_earned: state.stats?.total_earned ?? 0,
    total_spent: state.stats?.total_spent ?? 0,
    lastpayoutat: state.stats?.lastpayoutat ?? null,
    window_days: days,
    window_earned,
    window_spent,
  };
}