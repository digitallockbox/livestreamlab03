/**
 * useTrident — React hook for calling Trident API via the proxy.
 * Usage:
 *   const { call, loading, error } = useTrident();
 *   const profile = await call("GET", "/creator/profile");
 */
import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useTrident() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (method, path, body = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("tridentProxy", { method, path, body });
      return res.data;
    } catch (err) {
      setError(err.message || "Trident error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}

export default useTrident;