/**
 * Trident OS — Production Routing Config
 *
 * Resolves the backend ENGINE_URL from environment variables with sensible
 * defaults. In development (Base44 sandbox / local), it falls back to
 * localhost. In production (livestreamlab.live), it uses the deployed API.
 *
 * Usage:
 *   import { ENGINE_URL, healthCheck } from "@/lib/engineConfig";
 *   fetch(`${ENGINE_URL}/api/...`)
 *
 * Override at build time via .env:
 *   VITE_ENGINE_URL=https://api.livestreamlab.live
 */

const DEV_URL = "http://localhost:8090";
const PROD_URL = "https://api.livestreamlab.live";

// Resolve in priority order: explicit env var → production default
export const ENGINE_URL =
  import.meta.env.VITE_ENGINE_URL ||
  (import.meta.env.PROD ? PROD_URL : DEV_URL);

export const IS_PRODUCTION = import.meta.env.PROD;
export const CORS_ORIGIN = import.meta.env.VITE_CORS_ORIGIN || window?.location?.origin || "";

// Session token header name — must match backend CORS allowed headers
export const SESSION_HEADER = "x-session-token";
export const WALLET_TOKEN_KEY = "trident_wallet_token";

/**
 * Retrieve the wallet-native JWT for Authorization + x-session-token headers.
 */
export function getSessionToken() {
  try {
    return localStorage.getItem(WALLET_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Health check — pings the platform health endpoint and returns status.
 * Used by SystemHealth and routing diagnostics.
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${ENGINE_URL}/api/platform/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return { status: "degraded", code: res.status, url: ENGINE_URL };
    const data = await res.json();
    return { status: "operational", code: 200, data, url: ENGINE_URL };
  } catch (e) {
    return { status: "unreachable", error: e.message, url: ENGINE_URL };
  }
}

/**
 * Get the resolved routing info for display/diagnostics.
 */
export function getRoutingInfo() {
  return {
    engineUrl: ENGINE_URL,
    isProduction: IS_PRODUCTION,
    corsOrigin: CORS_ORIGIN,
    hasToken: !!getSessionToken(),
  };
}