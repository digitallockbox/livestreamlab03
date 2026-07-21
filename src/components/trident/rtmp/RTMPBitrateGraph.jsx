import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Radio, AlertCircle, Activity, Info } from "lucide-react";
import { rtmpService } from "@/services/trident/rtmpService";

const COLORS = ["#8b5cf6", "#34d399", "#f59e0b", "#38bdf8", "#f43f5e", "#a78bfa"];

function extractBitrate(session) {
  if (typeof session.bitrate === "number") return session.bitrate;
  if (session.lastData) {
    const match = String(session.lastData).match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1])) : 0;
  }
  return 0;
}

export default function RTMPBitrateGraph({ refreshInterval = 2000 }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState(null);
  const [selectedSid, setSelectedSid] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const [sessRes, statRes] = await Promise.all([
          rtmpService.getSessions(),
          rtmpService.getStatus(),
        ]);
        if (!active) return;
        const sess = sessRes.sessions || [];
        setSessions(sess);
        setStatus(statRes);
        setError("");

        const point = { time: new Date().toLocaleTimeString() };
        sess.forEach((s) => {
          point[s.sid] = extractBitrate(s);
        });
        setHistory((h) => [...h.slice(-29), point]);
      } catch {
        if (active) setError("Failed to fetch RTMP data. Retrying…");
      }
    };
    poll();
    const interval = setInterval(poll, refreshInterval);
    return () => { active = false; clearInterval(interval); };
  }, [refreshInterval]);

  useEffect(() => {
    if (!selectedSid && sessions.length > 0) setSelectedSid(sessions[0].sid);
    if (selectedSid && !sessions.find((s) => s.sid === selectedSid)) {
      setSelectedSid(sessions[0]?.sid || null);
    }
  }, [sessions, selectedSid]);

  const selectedSession = sessions.find((s) => s.sid === selectedSid);
  const isLive = status?.status === "online";
  const sids = sessions.map((s) => s.sid);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" /> RTMP Bitrate Graph
      </h2>

      {/* Live Status Panel */}
      {status && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isLive ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
              <Radio className={`w-3.5 h-3.5 ${isLive ? "animate-pulse" : ""}`} />
              {isLive ? "LIVE" : "OFFLINE"}
            </span>
            <div><span className="text-muted-foreground">Engine: </span><span className="font-medium">{status.engine}</span></div>
            <div><span className="text-muted-foreground">Port: </span><span className="font-mono">{status.port}</span></div>
            <div><span className="text-muted-foreground">Sessions: </span><span className="font-medium">{status.sessionCount}</span></div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Session Selector */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Session</label>
          <select
            value={selectedSid || ""}
            onChange={(e) => setSelectedSid(e.target.value)}
            className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
          >
            {sessions.map((s) => (
              <option key={s.sid} value={s.sid}>{s.sid}</option>
            ))}
          </select>
        </div>
      )}

      {/* Bitrate Graph */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold text-sm mb-3">Bitrate Over Time (kbps)</h3>
        {sessions.length === 0 ? (
          <div className="py-12 text-center">
            <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active RTMP streams.</p>
          </div>
        ) : (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} minTickGap={20} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} unit="k" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
                  formatter={(v, name) => [`${v} kbps`, name]}
                />
                {sids.map((sid, i) => (
                  <Line
                    key={sid}
                    type="monotone"
                    dataKey={sid}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={300}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Session Info Box */}
      {selectedSession && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display font-semibold text-sm mb-3 inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-muted-foreground" /> Session Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Session ID</p><p className="font-mono">{selectedSession.sid}</p></div>
            <div><p className="text-xs text-muted-foreground">IP</p><p className="font-mono">{selectedSession.ip}</p></div>
            <div><p className="text-xs text-muted-foreground">Port</p><p className="font-mono">{selectedSession.port}</p></div>
            <div><p className="text-xs text-muted-foreground">Connected</p><p className="text-xs">{selectedSession.connectedAt ? new Date(selectedSession.connectedAt).toLocaleString() : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><p className="capitalize">{selectedSession.status}</p></div>
            <div><p className="text-xs text-muted-foreground">Data</p><p className="text-xs font-mono">{selectedSession.lastData || "—"}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}