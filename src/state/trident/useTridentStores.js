import { useState, useEffect, useRef } from "react";
import { rtmpService } from "@/services/trident/rtmpService";
import { autosplitService } from "@/services/trident/autosplitService";
import { storageService } from "@/services/trident/storageService";
import { adminService } from "@/services/trident/adminService";
import { tenantsService } from "@/services/trident/tenantsService";
import { ENGINES, formatUptime, SESSION_START } from "@/services/trident/engineRegistry";

export { formatUptime, ENGINES };

export function usePoll(fetchFn, intervalMs = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const result = await fnRef.current(); if (active) setData(result); }
      catch (e) { if (active) setData(null); }
      finally { if (active) setLoading(false); }
    };
    load();
    let interval;
    if (intervalMs > 0) interval = setInterval(load, intervalMs);
    return () => { active = false; if (interval) clearInterval(interval); };
  }, [intervalMs]);
  return { data, loading };
}

// Contract-aligned hooks (extract the array from the { key: [...] } wrapper)
export function useEngineStatus() {
  return usePoll(async () => (await adminService.getEngines()).engines, 3000);
}
export const useLiveSessions = () => usePoll(async () => (await rtmpService.getSessions()).sessions, 2000);
export const useRoutingMap = () => usePoll(async () => (await autosplitService.getRoutes()).routes, 3000);
export const useStorageData = () => usePoll(() => storageService.getData(), 0);
export const useTenants = () => usePoll(async () => (await tenantsService.getTenants()).tenants, 0);

export function useAdminData() {
  return usePoll(async () => {
    const [enginesRes, metrics] = await Promise.all([adminService.getEngines(), adminService.getNodeMetrics()]);
    return { ...metrics, engines: enginesRes.engines };
  }, 5000);
}