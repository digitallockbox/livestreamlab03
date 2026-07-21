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

export function useEngineStatus() {
  return usePoll(async () => {
    const engines = await adminService.getEngineStatus();
    return engines.map((e) => ({ ...e, heartbeat: "OK", uptime: formatUptime(Date.now() - SESSION_START) }));
  }, 3000);
}

export const useLiveSessions = () => usePoll(() => rtmpService.getLiveSessions(), 2000);
export const useRoutingMap = () => usePoll(() => autosplitService.getRoutingMap(), 3000);
export const useStorageData = () => usePoll(() => storageService.getData(), 0);
export const useTenants = () => usePoll(() => tenantsService.getTenants(), 0);

export function useAdminData() {
  return usePoll(async () => {
    const [engines, metrics] = await Promise.all([adminService.getEngineStatus(), adminService.getNodeMetrics()]);
    return { ...metrics, engines };
  }, 5000);
}