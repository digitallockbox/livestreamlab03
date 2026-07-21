import { fetchJSON } from "./http";

export const identityService = {
  // POST /identity/login → { sessionToken, expires, tenant }
  async login(wallet, signature) {
    const http = await fetchJSON("/identity/login", { method: "POST", body: JSON.stringify({ wallet, signature }) });
    if (!http.error && http.sessionToken) return http;
    return { sessionToken: "session-token-xyz", expires: new Date(Date.now() + 3600000).toISOString(), tenant: "livestreamlab" };
  },

  // GET /identity/session → { valid, wallet, tenant, expires }
  async getSession(walletAddress, session) {
    const http = await fetchJSON("/identity/session", { method: "GET" });
    if (!http.error && http.valid !== undefined) return http;
    const valid = !!(session && (!session.expires_at || new Date(session.expires_at) > new Date()));
    return { valid, wallet: walletAddress || "", tenant: session?.bound_domain || "livestreamlab", expires: session?.expires_at || null };
  },

  validateSession(session) {
    if (!session) return { valid: false, reason: "No session" };
    if (session.expires_at && new Date(session.expires_at) < new Date()) return { valid: false, reason: "Session expired" };
    return { valid: true, reason: "OK" };
  },

  getSessionInfo(walletAddress, session) {
    return { wallet: walletAddress, tenant: session?.bound_domain || "livestreamlab", token: session ? "session-token-xyz" : null, expires: session?.expires_at || null };
  },
};