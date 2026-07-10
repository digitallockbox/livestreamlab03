import { useState, useCallback } from "react";
import { healthCheck, getRoutingInfo } from "@/lib/engineConfig";

/**
 * useProductionHealth — pings the backend health endpoint and tracks
 * routing diagnostics (engine URL, token presence, response status).
 */
export function useProductionHealth() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const routing = getRoutingInfo();

  const check = useCallback(async () => {
    setLoading(true);
    const res = await healthCheck();
    setResult(res);
    setLoading(false);
    return res;
  }, []);

  return { result, loading, routing, check };
}