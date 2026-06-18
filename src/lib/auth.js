import { useEffect, useState } from "react";
import { apiRequest, clearAuthToken, logout, setAuthToken } from "./apiClient";

export function useFounderAuth() {
  const [state, setState] = useState({ loading: true, allowed: false, error: null });

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const session = await apiRequest("/auth/verify", { method: "GET" });
        if (!mounted) return;

        if (session?.token) {
          setAuthToken(session.token);
        }

        setState({ loading: false, allowed: Boolean(session?.founder), error: null });
      } catch (error) {
        if (!mounted) return;
        clearAuthToken();
        setState({ loading: false, allowed: false, error: error.message || "Authentication failed" });
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

export async function signOut() {
  await logout();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}
