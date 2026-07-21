import React, { useState, useEffect } from "react";
import { GitBranch, AlertCircle, Server, Cpu, ArrowRight, Activity } from "lucide-react";
import { autosplitService } from "@/services/trident/autosplitService";

function LoadCircle({ load, size = 72 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (load / 100) * circ;
  const color = load > 80 ? "#ef4444" : load > 60 ? "#f59e0b" : "#34d399";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500 ease-out"
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="fill-foreground font-display font-bold" style={{ fontSize: size / 5 }}>
        {Math.round(load)}%
      </text>
    </svg>
  );
}

export default function AutosplitWorkerLoad({ refreshInterval = 3000 }) {
  const [status, setStatus] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const [stat, wks, rts] = await Promise.all([
          autosplitService.getStatus(),
          autosplitService.getWorkers(),
          autosplitService.getRoutes(),
        ]);
        if (!active) return;
        setStatus(stat);
        setWorkers(wks || []);
        setRoutes(rts.routes || []);
        setError("");
      } catch {
        if (active) setError("Failed to fetch Autosplit data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    poll();
    const interval = setInterval(poll, refreshInterval);
    return () => { active = false; clearInterval(interval); };
  }, [refreshInterval]);

  const isActive = status?.status === "online";

  // Distribute routes across workers for the detail panel
  const workerRoutes = (workerIdx) => {
    if (workers.length === 0) return [];
    return routes.filter((_, i) => i % workers.length === workerIdx);
  };

  const selectedRoutes = selectedWorker != null ? workerRoutes(selectedWorker) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Server className="w-5 h-5 text-primary" /> Autosplit Worker Load
      </h2>

      {/* Engine Status Header */}
      {status && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isActive ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
              <Activity className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`} />
              {isActive ? "ACTIVE" : "OFFLINE"}
            </span>
            <div><span className="text-muted-foreground">Engine: </span><span className="font-medium">{status.engine}</span></div>
            <div><span className="text-muted-foreground">Port: </span><span className="font-mono">{status.port}</span></div>
            <div><span className="text-muted-foreground">Workers: </span><span className="font-medium">{status.workers}</span></div>
            <div><span className="text-muted-foreground">Active Streams: </span><span className="font-medium">{status.activeStreams}</span></div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Worker Load Graph */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold text-sm mb-4 inline-flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-muted-foreground" /> Worker Load
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading workers…</p>
        ) : workers.length === 0 ? (
          <div className="py-10 text-center">
            <Server className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No Autosplit workers available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workers.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedWorker(i)}
                className={`rounded-lg border p-4 flex flex-col items-center gap-2 transition-all ${
                  selectedWorker === i
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <LoadCircle load={w.load} />
                <div className="text-center">
                  <p className="text-xs font-mono font-medium">{w.id || `worker-${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground capitalize">{w.status}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Routing Context */}
      {routes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display font-semibold text-sm mb-3 inline-flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-muted-foreground" /> Routing Context
          </h3>
          <div className="space-y-2">
            {routes.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-primary truncate">{r.input}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(r.outputs || []).map((o, j) => (
                      <span
                        key={j}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          o.status === "active"
                            ? "bg-accent/15 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <ArrowRight className="w-3 h-3" /> {o.type}: {o.path}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worker Detail Panel */}
      {selectedWorker != null && workers[selectedWorker] && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            {workers[selectedWorker].id || `worker-${selectedWorker + 1}`}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
            <div><p className="text-xs text-muted-foreground">Load</p><p className="font-display font-bold">{workers[selectedWorker].load}%</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><p className="capitalize">{workers[selectedWorker].status}</p></div>
            <div><p className="text-xs text-muted-foreground">Assigned Routes</p><p className="font-display font-bold">{selectedRoutes.length}</p></div>
          </div>
          {selectedRoutes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Assigned Outputs</p>
              <div className="space-y-1.5">
                {selectedRoutes.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-2">
                    <p className="font-mono text-xs text-primary mb-1">{r.input}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(r.outputs || []).map((o, j) => (
                        <span
                          key={j}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            o.status === "active"
                              ? "bg-accent/15 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {o.type} {o.status === "active" ? "●" : "○"}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}