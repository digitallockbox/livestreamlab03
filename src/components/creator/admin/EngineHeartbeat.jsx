import React, { useEffect, useState, useRef } from "react";
import { HeartPulse, RefreshCw } from "lucide-react";
import { founderApi } from "@/lib/tridentApi";

export default function EngineHeartbeat() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const check = async () => {
    try {
      const res = await founderApi.engineStatus();
      const ts = new Date().toLocaleTimeString();
      const status = res?.status || res?.engine?.status || "unknown";
      const latency = res?.latency_ms ?? res?.engine?.latency_ms ?? null;
      setBeats((prev) => [{ ts, status, latency }, ...prev].slice(0, 20));
    } catch {
      setBeats((prev) => [{ ts: new Date().toLocaleTimeString(), status: "offline", latency: null }, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    timerRef.current = setInterval(check, 15000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Checking engine heartbeat…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-destructive" />
            <h3 className="font-display font-semibold text-sm">Engine Heartbeat</h3>
            <span className="text-xs text-muted-foreground">Auto-refreshes every 15s</span>
          </div>
          <button onClick={check} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3 h-3" /> Check now
          </button>
        </div>
        {beats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No heartbeat data yet.</p>
        ) : (
          <div className="space-y-1.5">
            {beats.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{b.ts}</span>
                <div className="flex items-center gap-3">
                  {b.latency !== null && <span className="text-xs text-muted-foreground">{b.latency}ms</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    b.status === "online" ? "bg-accent/15 text-accent" :
                    b.status === "offline" ? "bg-destructive/15 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}