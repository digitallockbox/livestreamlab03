/**
 * useTridentOS — React hook for the Trident OS SDK.
 *
 * Tracks SDK load status, exposes the config (tenant/website/token),
 * and provides bound track/identify methods. Re-renders when status
 * changes from loading → ready/missing.
 *
 * Usage:
 *   const { status, config, track, identify } = useTridentOS();
 *   if (status === "ready") track("dashboard_view");
 */
import { useState, useEffect, useCallback } from "react";
import { tridentOS, trackEvent, identify } from "@/lib/tridentOS";

export function useTridentOS() {
  const [status, setStatus] = useState(tridentOS.getStatus());

  useEffect(() => {
    const unsub = tridentOS.subscribe(setStatus);
    return unsub;
  }, []);

  const track = useCallback((name, properties) => trackEvent(name, properties), []);
  const identifyUser = useCallback((userId, traits) => identify(userId, traits), []);

  return {
    status,           // "loading" | "ready" | "missing"
    config: tridentOS.getConfig(),
    sdk: tridentOS.raw,
    track,
    identify: identifyUser,
  };
}

export default useTridentOS;