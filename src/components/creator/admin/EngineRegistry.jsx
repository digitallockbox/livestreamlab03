import React, { useEffect, useState } from "react";
import { Activity, Server, Cpu, RefreshCw } from "lucide-react";
import { founderApi, base44Api } from "@/lib/tridentApi";

const STATUS_COLORS = {
  online: "text-accent bg-accent/15",
  offline: "text-destructive bg-destructive/15",
  degraded: "text-chart-3 bg-chart-3/15",
  unknown: "text-muted-foreground bg-muted",
};

export default function EngineRegistry() {
  const [engines, setEngines] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [engineRes, healthRes] = await Promise.all([
        founderApi.engineStatus().catch(() => null),
        base44Api.platformHealth().catch(() => null),
      ]);
      const list = engineRes?.engines || engineRes?.services || [];
      setEngines(Array.isArray(list) ? list : []);
      setHealth(healthRes);
    } catch (e) {
      setError(e?.message || "Failed to load engine registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading engine registry…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {health && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-sm">Platform Health</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Status</p><p className="font-medium capitalize">{health.status || "unknown"}</p></div>
            <div><p className="text-xs text-muted-foreground">Uptime</p><p className="font-medium">{health.uptime || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Version</p><p className="font-medium">{health.version || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Region</p><p className="font-medium">{health.region || "—"}</p></div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Registered Engines</h3>
          </div>
          <button onClick={load} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        {engines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No engines registered. Engine may be offline.</p>
        ) : (
          <div className="space-y-2">
            {engines.map((eng, i) => {
              const status = (eng.status || "unknown").toLowerCase();
              return (
                <div key={eng.id || i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{eng.name || eng.id || `Engine ${i + 1}`}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status] || STATUS_COLORS.unknown}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}