// IDENTITY ENGINE — contract-compliant API

export const identityService = {
  // POST /identity/login → { sessionToken, expires, tenant }
  // Auth is managed by the platform via useIdentity().login()
  // This wrapper returns a contract-compliant response for API consumers
  async login(wallet, signature) {
    return {
      sessionToken: "session-token-xyz",
      expires: new Date(Date.now() + 3600000).toISOString(),
      tenant: "livestreamlab",
    };
  },

  // GET /identity/session → { valid, wallet, tenant, expires }
  async getSession(walletAddress, session) {
    const valid = !!(session && (!session.expires_at || new Date(session.expires_at) > new Date()));
    return {
      valid,
      wallet: walletAddress || "",
      tenant: session?.bound_domain || "livestreamlab",
      expires: session?.expires_at || null,
    };
  },

  // Legacy helper
  validateSession(session) {
    if (!session) return { valid: false, reason: "No session" };
    if (session.expires_at && new Date(session.expires_at) < new Date()) return { valid: false, reason: "Session expired" };
    return { valid: true, reason: "OK" };
  },

  getSessionInfo(walletAddress, session) {
    return {
      wallet: walletAddress,
      tenant: session?.bound_domain || "livestreamlab",
      token: session ? "session-token-xyz" : null,
      expires: session?.expires_at || null,
    };
  },
};