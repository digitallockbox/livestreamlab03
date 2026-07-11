import React, { useEffect, useState } from "react";
import { Route as RouteIcon, RefreshCw } from "lucide-react";
import { base44Api } from "@/lib/tridentApi";

export default function EventRouter() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44Api.platformRoutes();
      const list = res?.routes || res || [];
      setRoutes(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || "Failed to load platform routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading event routes…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Platform Event Routes</h3>
          </div>
          <button onClick={load} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        {routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No routes configured. Engine may be offline.</p>
        ) : (
          <div className="space-y-1.5">
            {routes.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-sm">
                <span className="font-mono text-xs">{r.path || r.route || r.event || `Route ${i + 1}`}</span>
                <span className="text-xs text-muted-foreground">{r.method || r.handler || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}