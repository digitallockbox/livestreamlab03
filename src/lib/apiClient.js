const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://api.livestreamlab.live";

const ACCESS_TOKEN_KEY = "livestreamlab_access_token";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setAccessToken(token) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to refresh session");
  }

  const data = await response.json();
  if (data?.token) {
    setAccessToken(data.token);
  }
  return data;
}

async function request(path, options = {}, retrying = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });

  if (response.status === 401 && !retrying) {
    try {
      await refreshSession();
      return request(path, options, true);
    } catch {
      setAccessToken(null);
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function setAuthToken(token) {
  setAccessToken(token);
}

export function clearAuthToken() {
  setAccessToken(null);
}

export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearAuthToken();
  }
}

export async function apiRequest(path, options = {}) {
  return request(path, options);
}
