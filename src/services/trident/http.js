import { ENGINE_URL, getSessionToken, SESSION_HEADER } from "@/lib/engineConfig";

// Shared fetch helper — routes through ENGINE_URL with wallet auth headers.
// Returns { error: true } on failure so callers can fall back to entity SDK.
export async function fetchJSON(path, options = {}) {
  try {
    const headers = { "Content-Type": "application/json" };
    const token = getSessionToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers[SESSION_HEADER] = token;
    }
    const res = await fetch(`${ENGINE_URL}/api${path}`, {
      headers,
      ...options,
    });
    if (!res.ok) return { error: true, status: res.status };
    return await res.json();
  } catch (err) {
    return { error: true, message: err?.message || "Network error" };
  }
}