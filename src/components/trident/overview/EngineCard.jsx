import React from "react";

export default function EngineCard({ engine }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold capitalize">{engine.name}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${engine.status === "online" ? "bg-accent" : "bg-destructive"}`} />
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Port</span><span className="font-mono">{engine.port}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Heartbeat</span><span className="text-accent">{engine.heartbeat}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span className="font-mono">{engine.uptime}</span></div>
      </div>
    </div>
  );
}