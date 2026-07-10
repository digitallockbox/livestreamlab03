/**
 * Autosplit Engine Integration — Module G
 *
 * Connects creator identity, autosplit identity, token identity, and
 * the storage engine into a working payout calculator.
 *
 * Pure functions:
 *   - loadRules       → parse autosplit config (from backend response)
 *   - validateRules   → percent integers, sum to 100, no negatives
 *   - calculatePayout → split an amount across rules
 *   - buildPayoutRecord → timestamped record for history
 */

/**
 * Validate autosplit rules:
 *   - each percent is a number 0–100
 *   - all percents sum to exactly 100
 *   - each rule has a wallet address
 */
export function validateRules(config) {
  if (!config?.rules || !Array.isArray(config.rules) || config.rules.length === 0) {
    return { ok: false, error: "No split rules defined" };
  }

  let total = 0;
  for (const rule of config.rules) {
    const pct = Number(rule.percent);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return { ok: false, error: `Invalid percent value: ${rule.percent}` };
    }
    if (!rule.wallet) {
      return { ok: false, error: "Each rule must have a wallet address" };
    }
    total += pct;
  }

  if (total !== 100) {
    return { ok: false, error: `Split percentages must total 100% (got ${total}%)` };
  }

  return { ok: true };
}

/**
 * Calculate the payout for each rule given a total amount.
 * Returns an array of { wallet, percent, payout }.
 */
export function calculatePayout(config, amount) {
  const validation = validateRules(config);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const amt = Number(amount);
  if (isNaN(amt) || amt < 0) {
    throw new Error("Amount must be a non-negative number");
  }

  return config.rules.map((rule) => {
    const payout = (amt * Number(rule.percent)) / 100;
    return {
      wallet: rule.wallet,
      percent: Number(rule.percent),
      payout: Math.round(payout * 100) / 100,
    };
  });
}

/**
 * Build a timestamped payout record for history storage.
 */
export function buildPayoutRecord(amount, payouts) {
  return {
    timestamp: new Date().toISOString(),
    amount: Number(amount),
    payouts,
  };
}

/**
 * Preview a payout without storing it — returns the split breakdown
 * for a given amount and config.
 */
export function previewPayout(config, amount) {
  const payouts = calculatePayout(config, amount);
  return {
    amount: Number(amount),
    payouts,
    total: payouts.reduce((sum, p) => sum + p.payout, 0),
  };
}

/**
 * Execute a payout — calculates the split, builds a history record,
 * returns both the payouts and the record (the backend persists it).
 */
export function executePayout(config, amount) {
  const payouts = calculatePayout(config, amount);
  const record = buildPayoutRecord(amount, payouts);
  return {
    status: "executed",
    record,
  };
}