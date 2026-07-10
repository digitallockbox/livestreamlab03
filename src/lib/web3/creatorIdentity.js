/**
 * Creator Identity URLs — Module C
 *
 * Derives a deterministic creator namespace from a wallet address:
 *   creator_id        = SHA256(wallet) as hex
 *   creator_route     = /creator/<creator_id>
 *   creator_url       = https://livestreamlab.live/c/<creator_id>
 *   creator_storage   = /data/creators/<creator_id>/
 *
 * These are pure, synchronous (async only for SHA-256) utility functions.
 * The same wallet always produces the same creator identity — on both
 * frontend and backend — so routes, URLs, and storage paths are predictable.
 */

const CREATOR_URL_BASE = "https://livestreamlab.live/c";
const CREATOR_STORAGE_ROOT = "/data/creators";

/**
 * SHA-256 hash of a string, returned as a lowercase hex string.
 * Uses the browser's Web Crypto API (crypto.subtle).
 */
async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deterministic creator ID — SHA256(wallet) as hex.
 */
export async function getCreatorId(wallet) {
  if (!wallet) throw new Error("Wallet address required");
  return sha256Hex(wallet);
}

/**
 * Internal frontend route for the creator's workspace.
 */
export function getCreatorRoute(creatorId) {
  return `/creator/${creatorId}`;
}

/**
 * Public-facing creator URL (shareable link).
 */
export function getCreatorUrl(creatorId) {
  return `${CREATOR_URL_BASE}/${creatorId}`;
}

/**
 * Private storage namespace root for this creator.
 */
export function getCreatorStoragePath(creatorId) {
  return `${CREATOR_STORAGE_ROOT}/${creatorId}`;
}

/**
 * Full creator identity object — all derived fields in one call.
 */
export async function getCreatorIdentity(wallet) {
  const creatorId = await getCreatorId(wallet);
  return {
    creator_id: creatorId,
    creator_route: getCreatorRoute(creatorId),
    creator_url: getCreatorUrl(creatorId),
    creator_storage: getCreatorStoragePath(creatorId),
    created_at: new Date().toISOString(),
    wallet,
  };
}