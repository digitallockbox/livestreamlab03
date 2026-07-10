/**
 * AutoSplit Identity Routing — Module D
 *
 * Derives a deterministic autosplit namespace from a wallet address:
 *   autosplit_id       = SHA256(wallet + "-autosplit") as hex
 *   autosplit_route    = /autosplit/<autosplit_id>
 *   autosplit_storage  = /data/autosplit/<autosplit_id>/
 *   autosplit_config   = default split rules
 *
 * Built on top of the Creator Identity (Module C) — every wallet gets its
 * own autosplit config, storage path, and management route.
 */

const AUTOSPLIT_STORAGE_ROOT = "/data/autosplit";

/**
 * SHA-256 hash of a string, returned as a lowercase hex string.
 */
async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deterministic autosplit ID — SHA256(wallet + "-autosplit") as hex.
 */
export async function getAutoSplitId(wallet) {
  if (!wallet) throw new Error("Wallet address required");
  return sha256Hex(`${wallet}-autosplit`);
}

/**
 * Internal frontend route for the autosplit config workspace.
 */
export function getAutoSplitRoute(autosplitId) {
  return `/autosplit/${autosplitId}`;
}

/**
 * Private storage namespace for autosplit config files.
 */
export function getAutoSplitStoragePath(autosplitId) {
  return `${AUTOSPLIT_STORAGE_ROOT}/${autosplitId}`;
}

/**
 * Default autosplit config — 100% to the creator's own wallet.
 */
export function getDefaultAutoSplitConfig(wallet) {
  return {
    version: 1,
    rules: [
      { wallet: wallet || "self", percent: 100 },
    ],
  };
}

/**
 * Validate that split rules sum to 100%.
 */
export function validateAutoSplitConfig(config) {
  if (!config?.rules || !Array.isArray(config.rules)) {
    return { valid: false, error: "No split rules defined" };
  }
  const total = config.rules.reduce((sum, r) => sum + (Number(r.percent) || 0), 0);
  if (total !== 100) {
    return { valid: false, error: `Split percentages must total 100% (got ${total}%)` };
  }
  return { valid: true };
}

/**
 * Full autosplit identity object — all derived fields in one call.
 */
export async function getAutoSplitIdentity(wallet) {
  const autosplitId = await getAutoSplitId(wallet);
  return {
    autosplit_id: autosplitId,
    autosplit_route: getAutoSplitRoute(autosplitId),
    autosplit_storage: getAutoSplitStoragePath(autosplitId),
    autosplit_config: getDefaultAutoSplitConfig(wallet),
    created_at: new Date().toISOString(),
    wallet,
  };
}