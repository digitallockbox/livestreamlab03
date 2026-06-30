/**
 * Centralized Trident Session Manager
 * Persists the session token so all tridentProxy callers can inject it
 * for secure authenticated requests to the Trident API.
 */

const TOKEN_KEY = "trident_session_token";
const USER_KEY = "trident_session_user";

function safeStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const session = {
  /**
   * Create / persist a session after a successful login or OAuth callback.
   * @param {object} user  - the user object returned by the API
   * @param {string} token - the session JWT token
   */
  async create(user, token) {
    const store = safeStorage();
    if (store) {
      if (token) store.setItem(TOKEN_KEY, token);
      if (user) store.setItem(USER_KEY, JSON.stringify(user));
    }
    return { user, token };
  },

  /** Retrieve the persisted session token (for tridentProxy injection). */
  getToken() {
    const store = safeStorage();
    return store ? store.getItem(TOKEN_KEY) : null;
  },

  /** Retrieve the persisted user object, if any. */
  getUser() {
    const store = safeStorage();
    if (!store) return null;
    const raw = store.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** Whether a session token is currently persisted. */
  isAuthenticated() {
    return !!session.getToken();
  },

  /** Clear the persisted session. */
  async clear() {
    const store = safeStorage();
    if (store) {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    }
  },
};

export default session;