import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:6000",
  withCredentials: true,
  timeout: 10000
});

// Optional: request logging
apiClient.interceptors.request.use((config) => {
  console.log("[API REQUEST]", config.method?.toUpperCase(), config.url);
  return config;
});

// Optional: response logging
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err.response?.status, err.response?.data);
    return Promise.reject(err);
  }
);

// ─── Trident auth/onboarding API surface ─────────────────────────────────
// Used by login & onboarding flows. Hits the same Trident backend as tridentApi.
const TRIDENT_BASE = "https://api.livestreamlab.live";

async function tridentFetch(path, options = {}) {
  const res = await fetch(`${TRIDENT_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
  });
  const contentType = res.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(typeof data === "string" ? data : msg);
  }
  return data;
}

export const api = {
  login: (body) =>
    tridentFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  auth: {
    twitchClientData: () => tridentFetch("/auth/twitch/client-data", { method: "GET" }),
    oauth: {
      google: (code, redirectUri) =>
        tridentFetch("/auth/oauth/google", { method: "POST", body: JSON.stringify({ code, redirect_uri: redirectUri }) }),
      youtube: (code, redirectUri) =>
        tridentFetch("/auth/oauth/youtube", { method: "POST", body: JSON.stringify({ code, redirect_uri: redirectUri }) }),
      x: (code, redirectUri) =>
        tridentFetch("/auth/oauth/x", { method: "POST", body: JSON.stringify({ code, redirect_uri: redirectUri }) }),
      twitch: (code, redirectUri) =>
        tridentFetch("/auth/oauth/twitch", { method: "POST", body: JSON.stringify({ code, redirect_uri: redirectUri }) }),
    },
  },

  onboarding: {
    status: () => tridentFetch("/onboarding/status", { method: "GET" }),
  },
};

export default apiClient;