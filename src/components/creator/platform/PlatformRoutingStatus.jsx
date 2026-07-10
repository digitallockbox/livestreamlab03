/**
 * PlatformRoutingStatus — displays the Platform Routing Engine health
 * and namespaced route map.
 *
 * Shows: overall status, port, active modules, total route count, and a
 * grouped breakdown of routes by namespace. Useful as a diagnostics panel
 * inside admin or system-health views.
 */
import React, { useMemo } from "react";
import {
  Activity, Server, Route as RouteIcon, Boxes, RefreshCw, Loader2,
} from "lucide-react";
import { usePlatformHealth } from "@/hooks/web3/usePlatformHealth";

const NS_COLORS = {
  auth:      "text-primary",
  identity:  "text-chart-2",
  creator:   "text-chart-4",
  autosplit: "text-chart-3",
  token:     "text-accent",
  platform:  "text-chart-5",
};

export default function PlatformRoutingStatus() {
  const { health, routes, loading, error, refresh } = usePlatformHealth();

  const grouped = useMemo(() => {
    const map = {};
    for (const r of routes) {
      const ns = r.namespace || r.ns || "other";
      if (!map[ns]) map[ns] = [];
      map[ns].push(r);
    }
    return map;
  }, [routes]);

  const statusOk = health?.status === "ok";

  return (
    <div className="space-y-4">
      {/* Health banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${statusOk ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <Activity className={`w-5 h-5 ${statusOk ? "text-accent" : "text-destructive"}`} />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {error ? "Platform Offline" : statusOk ? "Platform Routing Engine Online" : "Unknown Status"}
          </p>
          <p className="text-xs text-muted-foreground">
            {error ? error : statusOk ? `Port ${health.port} · ${routes.length} routes registered` : "No health data"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Module badges */}
      {health?.modules && (
        <div className="flex flex-wrap gap-2">
          {health.modules.map((m) => (
            <span key={m} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              <Boxes className="w-3 h-3" /> {m}
            </span>
          ))}
        </div>
      )}

      {/* Route map grouped by namespace */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RouteIcon className="w-4 h-4" /> Route Map ({routes.length})
          </div>
          {Object.entries(grouped).map(([ns, nsRoutes]) => (
            <div key={ns} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Server className={`w-3.5 h-3.5 ${NS_COLORS[ns] || "text-muted-foreground"}`} />
                <span className="text-xs font-medium uppercase tracking-wide">{ns}</span>
                <span className="text-[11px] text-muted-foreground ml-auto">{nsRoutes.length} route{nsRoutes.length === 1 ? "" : "s"}</span>
              </div>
              <div className="space-y-1">
                {nsRoutes.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-border/40 last:border-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground w-12 text-center">
                      {r.method || "—"}
                    </span>
                    <span className="font-mono text-foreground truncate">{r.path}</span>
                    <span className="text-muted-foreground ml-auto text-[10px] truncate">{r.handler || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}