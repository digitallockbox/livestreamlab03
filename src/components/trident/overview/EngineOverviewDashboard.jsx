import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Activity, Server, RotateCw, X } from "lucide-react";
import { adminService } from "@/services/trident/adminService";

const ENGINE_ICONS = {
  rtmp: "📡",
  autosplit: "🔀",
  storage: "💾",
  identity: "🔐",
  token: "🪙",
  tenants: "🏢",
};

function statusColor(status) {
  if (status === "online") return { dot: "bg-accent", badge: "bg-accent/15 text-accent", label: "Online" };
  if (status === "offline") return { dot: "bg-destructive", badge: "bg-destructive/15 text-destructive", label: "Offline" };
  return { dot: "bg-yellow-500", badge: "bg-yellow-500/15 text-yellow-600", label: "Warning" };
}

function heartbeatColor(heartbeat) {
  if (!heartbeat || heartbeat === "OK") return "text-accent";
  return "text-yellow-600";
}

export default function EngineOverviewDashboard() {
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected, setSelected] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const poll = async () => {
    try {
      const res = await adminService.getEngines();
      setEngines(res.engines || []);
      setError("");
    } catch {
      setError("Failed to fetch engine data.");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  const doRestart = async () => {
    if (!selected) return;
    setRestarting(true);
    try {
      await adminService.restartEngine(selected.name);
      setConfirmRestart(false);
      setSelected(null);
      poll();
    } catch {
      setError("Failed to restart engine.");
    } finally {
      setRestarting(false);
    }
  };

  const onlineCount = engines.filter((e) => e.status === "online").length;
  const offlineCount = engines.filter((e) => e.status === "offline").length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" /> Engine Overview Dashboard
      </h2>

      {/* Node Summary Header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="font-medium">{onlineCount}</span>
              <span className="text-muted-foreground">Online</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="font-medium">{offlineCount}</span>
              <span className="text-muted-foreground">Offline</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {engines.length} engines total
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Engine Status Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading engines…</div>
      ) : engines.length === 0 ? (
        <div className="py-12 text-center">
          <Server className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No engines detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((e) => {
            const sc = statusColor(e.status);
            const hbWarn = e.heartbeat && e.heartbeat !== "OK";
            return (
              <button
                key={e.name}
                onClick={() => { setSelected(e); setConfirmRestart(false); }}
                className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ENGINE_ICONS[e.name] || "⚙️"}</span>
                    <div>
                      <p className="font-display font-semibold capitalize text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">:{e.port}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${sc.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${e.status === "online" ? "animate-pulse" : ""}`} />
                    {sc.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium truncate">{e.uptime || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Heartbeat</p>
                    <p className={`font-medium inline-flex items-center gap-1 ${heartbeatColor(e.heartbeat)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hbWarn ? "bg-yellow-500" : "bg-accent"} ${!hbWarn && e.status === "online" ? "animate-pulse" : ""}`} />
                      {e.heartbeat || "—"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Engine Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-lg">{ENGINE_ICONS[selected.name] || "⚙️"}</span>
                  <span className="capitalize">{selected.name} Engine</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium capitalize">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Port</p>
                    <p className="font-mono">:{selected.port}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColor(selected.status).badge}`}>
                      {statusColor(selected.status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heartbeat</p>
                    <p className={`font-medium ${heartbeatColor(selected.heartbeat)}`}>{selected.heartbeat || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <p className="font-medium">{selected.uptime || "—"}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col gap-2">
                {confirmRestart ? (
                  <div className="flex items-center justify-between gap-3 w-full rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">Confirm restart?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmRestart(false)}
                        className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={doRestart}
                        disabled={restarting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs hover:bg-destructive/90"
                      >
                        {restarting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                        {restarting ? "Restarting…" : "Confirm Restart"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRestart(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 self-start"
                  >
                    <RotateCw className="w-4 h-4" /> Restart Engine
                  </button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}