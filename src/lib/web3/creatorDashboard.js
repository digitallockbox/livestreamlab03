/**
 * Creator Dashboard Aggregator — Module I
 *
 * Merges all identity subsystems into a single unified dashboard object:
 *   - identity (wallet, session, permissions)
 *   - creator metadata (IDs, routes, URLs)
 *   - autosplit (rules + history)
 *   - token analytics (balance, lifetime + windowed stats)
 *   - storage (all paths from the storage tree)
 *
 * Mirrors Build-CreatorDashboard on the backend. The frontend calls
 * GET /api/creator/dashboard and receives one JSON object; this module
 * provides the local fallback aggregator when the backend is unavailable.
 */
import { getTokenAnalytics, initializeTokenLedger } from "@/lib/web3/tokenAnalytics";
import { base44Api } from "@/lib/tridentApi";

/**
 * Default permissions every creator has on their own dashboard.
 */
const DEFAULT_PERMISSIONS = {
  autosplit_manage: true,
  token_manage: true,
  storage_manage: true,
  identity_manage: true,
};

/**
 * Build the unified creator dashboard from locally-derived identity pieces.
 *
 * @param {object} params
 * @param {object} params.creator   — creator identity (Module C)
 * @param {object} params.autosplit — autosplit identity (Module D)
 * @param {object} params.token     — token identity (Module E)
 * @param {object} params.storage   — storage tree (Module F)
 * @param {string} params.wallet    — wallet address
 * @param {string} params.sessionToken — session token (if available)
 * @param {object} [params.autosplitRules]  — loaded rules (defaults to config)
 * @param {array}  [params.autosplitHistory] — loaded history (defaults to [])
 * @param {object} [params.tokenLedgerState] — {token, ledger, stats} (defaults to empty)
 * @param {number} [params.analyticsDays]    — window size (default 30)
 * @param {object} [params.identityIndex]    — the creator's entry in the Global Identity Index (Module I)
 * @param {object} [params.platformRoutes]   — the platform route map for this creator (Module J)
 */
export function buildCreatorDashboard({
  creator,
  autosplit,
  token,
  storage,
  wallet,
  sessionToken,
  autosplitRules,
  autosplitHistory,
  tokenLedgerState,
  analyticsDays = 30,
  identityIndex,
  platformRoutes,
}) {
  const ledgerState = tokenLedgerState || initializeTokenLedger();
  const tokenAnalytics = getTokenAnalytics(ledgerState, analyticsDays);

  return {
    creator_id: creator?.creator_id || null,
    autosplit_id: autosplit?.autosplit_id || null,
    token_id: token?.token_id || null,

    routes: {
      creator_home: creator?.creator_route || null,
      autosplit_home: autosplit?.autosplit_route || null,
      token_home: token?.token_route || null,
    },

    urls: {
      creator_url: creator?.creator_url || null,
    },

    storage: {
      root: storage?.creator_root || null,
      videos: storage?.creator_videos || null,
      thumbnails: storage?.creator_thumbnails || null,
      autosplit: storage?.creator_autosplit || autosplit?.autosplit_storage || null,
      token: storage?.creator_token || token?.token_storage || null,
    },

    autosplit: {
      rules: autosplitRules || autosplit?.autosplit_config || null,
      history: autosplitHistory || [],
    },

    token: {
      symbol: token?.token_symbol || "$STREAMING",
      name: token?.token_name || "Streaming Token",
      analytics: tokenAnalytics,
    },

    identity: {
      wallet: wallet || null,
      session_token: sessionToken || null,
      permissions: { ...DEFAULT_PERMISSIONS },
      index_entry: identityIndex || null,
      indexed: !!(identityIndex?.type || identityIndex?.identity),
    },

    platform: {
      routes: platformRoutes || null,
      health: platformRoutes?.status || null,
    },
  };
}

/**
 * Fetch the creator's entry in the Global Identity Index (Module I).
 * Looks up the wallet address and returns the matching identity record.
 */
export async function fetchIdentityIndexEntry(wallet) {
  if (!wallet) return null;
  try {
    return await base44Api.identityLookup(wallet);
  } catch {
    return null;
  }
}

/**
 * Fetch the platform route map (Module J) for this creator's namespace.
 */
export async function fetchPlatformRoutes() {
  try {
    return await base44Api.platformRoutes();
  } catch {
    return null;
  }
}