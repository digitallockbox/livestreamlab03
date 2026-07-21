export const identityService = {
  validateSession(session) {
    if (!session) return { valid: false, reason: "No session" };
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return { valid: false, reason: "Session expired" };
    }
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