/**
 * usePlatformHealth — fetches platform routing engine health + route map.
 *
 * Calls the two platform-level endpoints exposed by the Platform Routing
 * Engine: /api/platform/health (status, port, modules, routes) and
 * /api/platform/routes (full namespaced route map).
 *
 * Fail-open: if the backend is unavailable, returns null state so the UI
 * can show a "platform offline" indicator without crashing.
 */
import { useState, useEffect, useCallback } from "react";
import { base44Api } from "@/lib/tridentApi";

export function usePlatformHealth() {
  const [health, setHealth] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [h, r] = await Promise.all([
        base44Api.platformHealth().catch(() => null),
        base44Api.platformRoutes().catch(() => null),
      ]);
      setHealth(h);
      setRoutes(r?.routes || []);
    } catch (e) {
      setHealth(null);
      setRoutes([]);
      setError(e?.message || "Platform health check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { health, routes, loading, error, refresh: fetch };
}