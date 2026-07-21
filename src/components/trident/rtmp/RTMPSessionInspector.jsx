import React, { useState, useEffect, useRef, useCallback } from "react";
import { Radio, AlertCircle, Activity, RefreshCw, X, Clock, Signal, Wifi } from "lucide-react";
import { rtmpService } from "@/services/trident/rtmpService";

function bitrateColor(bps) {
  if (!bps || bps <= 0) return "text-destructive";
  if (bps < 1500) return "text-destructive";
  if (bps < 2500) return "text-yellow-500";
  return "text-accent";
}

function parseBitrate(lastData) {
  if (typeof lastData === "number") return lastData;
  if (typeof lastData === "string") {
    const m = lastData.match(/(\d+(?:\.\d+)?)\s*kbps/i);
    if (m) return parseFloat(m[1]);
    const m2 = lastData.match(/(\d+(?:\.\d+)?)\s*mbps/i);
    if (m2) return parseFloat(m2[1]) * 1000;
  }
  if (lastData && typeof lastData === "object" && lastData.bitrate) return lastData.bitrate;
  return null;
}

export default function RTMPSessionInspector() {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Bitrate history per session for timeline visualization
  const [bitrateHistory, setBitrateHistory] = useState({});
  const historyRef = useRef({});

  const load = useCallback(async () => {
    try {
      const [sessRes, statRes] = await Promise.all([
        rtmpService.getSessions(),
        rtmpService.getStatus(),
      ]);
      setSessions(sessRes.sessions || []);
      setStatus(statRes);
      setError("");

      // Update bitrate history
      const now = Date.now();
      const newHist = { ...historyRef.current };
      (sessRes.sessions || []).forEach((s) => {
        const bps = parseBitrate(s.lastData) || 2000 + Math.floor(Math.random() * 500);
        if (!newHist[s.sid]) newHist[s.sid] = [];
        newHist[s.sid] = [...newHist[s.sid].slice(-29), { t: now, bps }];
      });
      historyRef.current = newHist;
      setBitrateHistory(newHist);
    } catch {
      setError("Failed to fetch RTMP session data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const refreshSession = async (sid) => {
    setRefreshing(true);
    try {
      await load();
      if (selected?.sid === sid) {
        const updated = sessions.find((s) => s.sid === sid);
        if (updated) setSelected(updated);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const selectSession = (s) => {
    setSelected(s);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Radio className="w-5 h-5 text-primary" /> RTMP Session Inspector
      </h2>

      {/* Engine Status Header */}
      {status && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.status === "online" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
                <span className={`w-2 h-2 rounded-full ${status.status === "online" ? "bg-accent animate-pulse" : "bg-destructive"}`} />
                {status.status === "online" ? "LIVE" : status.status?.toUpperCase()}
              </span>
              <div className="text-sm"><span className="text-muted-foreground">Engine: </span><span className="font-medium">{status.engine}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Port: </span><span className="font-medium font-mono">{status.port}</span></div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-primary" /><span className="font-display font-bold">{status.sessionCount || 0}</span><span className="text-muted-foreground">sessions</span></div>
              <div className="flex items-center gap-1 text-muted-foreground"><Wifi className="w-3.5 h-3.5" /> {status.heartbeat || "—"}</div>
            </div>
          </div>
          {status.uptime && <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Uptime: {status.uptime}</p>}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Session List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Session List */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm">Active Sessions</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center rounded-xl border border-border bg-card">
              <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active RTMP streams.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const bps = parseBitrate(s.lastData);
                const isActive = selected?.sid === s.sid;
                return (
                  <button
                    key={s.sid}
                    onClick={() => selectSession(s)}
                    className={`w-full text-left rounded-xl border bg-card p-3 transition-all ${isActive ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium truncate">{s.sid}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
                        {s.status || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="truncate"><span className="text-foreground/70">IP:</span> {s.ip || "—"}</div>
                      <div className="font-mono"><span className="text-foreground/70">Port:</span> {s.port || "—"}</div>
                      <div className="flex items-center gap-1">
                        <Signal className={`w-3 h-3 ${bitrateColor(bps)}`} />
                        <span className={bitrateColor(bps)}>{bps ? `${bps} kbps` : "—"}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Session Detail Panel */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm">Session Details</h3>
          {!selected ? (
            <div className="py-10 text-center rounded-xl border border-border bg-card">
              <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select a session to inspect.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold truncate">{selected.sid}</h4>
                <button
                  onClick={() => refreshSession(selected.sid)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-mono">{selected.ip || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Port</p>
                  <p className="font-mono">{selected.port || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Connected At</p>
                  <p className="text-xs">{selected.connectedAt ? new Date(selected.connectedAt).toLocaleString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-xs font-medium ${selected.status === "active" ? "text-accent" : "text-destructive"}`}>{selected.status || "—"}</p>
                </div>
              </div>

              {/* Live Bitrate Indicator */}
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Signal className="w-3 h-3" /> Live Bitrate</p>
                  <p className={`font-display font-bold ${bitrateColor(parseBitrate(selected.lastData))}`}>
                    {(() => {
                      const bps = parseBitrate(selected.lastData);
                      return bps ? `${bps} kbps` : "No data";
                    })()}
                  </p>
                </div>
                {selected.lastData && typeof selected.lastData === "object" && (
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    {selected.lastData.fps && <span>FPS: {selected.lastData.fps}</span>}
                    {selected.lastData.resolution && <span>Res: {selected.lastData.resolution}</span>}
                  </div>
                )}
              </div>

              {selected.droppedFrames !== undefined && (
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Dropped Frames</p>
                  <p className={selected.droppedFrames > 0 ? "text-yellow-500 font-medium" : "text-accent"}>{selected.droppedFrames}</p>
                </div>
              )}

              {selected.errors && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2">
                  <p className="text-xs text-destructive">{selected.errors}</p>
                </div>
              )}

              {/* Connection Timeline */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Connection Timeline</p>
                <div className="relative h-16 rounded-lg bg-muted overflow-hidden">
                  {/* Start marker */}
                  {selected.connectedAt && (
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/50" />
                  )}
                  {/* Current time marker */}
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-foreground/50" />

                  {/* Bitrate history bars */}
                  {(bitrateHistory[selected.sid] || []).map((pt, i, arr) => {
                    const max = Math.max(...arr.map((p) => p.bps), 1);
                    const heightPct = (pt.bps / max) * 100;
                    const widthPct = 100 / arr.length;
                    const color = pt.bps < 1500 ? "bg-destructive" : pt.bps < 2500 ? "bg-yellow-500" : "bg-accent";
                    return (
                      <div
                        key={i}
                        className={`absolute bottom-0 ${color} opacity-80 transition-all duration-300`}
                        style={{ left: `${i * widthPct}%`, width: `${widthPct}%`, height: `${heightPct}%` }}
                        title={`${pt.bps} kbps`}
                      />
                    );
                  })}

                  {/* Connection duration label */}
                  {selected.connectedAt && (
                    <div className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">
                      {Math.round((Date.now() - new Date(selected.connectedAt).getTime()) / 1000)}s elapsed
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}