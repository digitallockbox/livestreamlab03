/**
 * $STREAMING Token Identity — Module E
 *
 * Derives a deterministic token namespace from a wallet address:
 *   token_id        = SHA256(wallet + "-streaming-token") as hex
 *   token_route     = /token/<token_id>
 *   token_storage   = /data/token/<token_id>/
 *   token_metadata  = { symbol, name, created_at }
 *   token_config    = { version, balance, payouts, history }
 *
 * This binds each creator to the $STREAMING token ecosystem — balances,
 * payouts, analytics, and token-based autosplit routing.
 */

const TOKEN_STORAGE_ROOT = "/data/token";
export const TOKEN_SYMBOL = "$STREAMING";
export const TOKEN_NAME = "Streaming Token";

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
 * Deterministic token ID — SHA256(wallet + "-streaming-token") as hex.
 */
export async function getTokenId(wallet) {
  if (!wallet) throw new Error("Wallet address required");
  return sha256Hex(`${wallet}-streaming-token`);
}

/**
 * Internal frontend route for the token workspace.
 */
export function getTokenRoute(tokenId) {
  return `/token/${tokenId}`;
}

/**
 * Private storage namespace for token config and history.
 */
export function getTokenStoragePath(tokenId) {
  return `${TOKEN_STORAGE_ROOT}/${tokenId}`;
}

/**
 * Default token config — empty balance, no payout history.
 */
export function getDefaultTokenConfig() {
  return {
    version: 1,
    balance: 0,
    payouts: [],
    history: [],
  };
}

/**
 * Full token identity object — all derived fields in one call.
 */
export async function getTokenIdentity(wallet) {
  const tokenId = await getTokenId(wallet);
  return {
    token_id: tokenId,
    token_route: getTokenRoute(tokenId),
    token_storage: getTokenStoragePath(tokenId),
    token_symbol: TOKEN_SYMBOL,
    token_name: TOKEN_NAME,
    token_config: getDefaultTokenConfig(),
    created_at: new Date().toISOString(),
    wallet,
  };
}