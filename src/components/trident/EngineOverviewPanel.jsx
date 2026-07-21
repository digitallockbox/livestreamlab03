import React from "react";
import { Loader2 } from "lucide-react";
import { useEngineStatus } from "@/lib/tridentControlPlane";

export default function EngineOverviewPanel() {
  const { data: engines, loading } = useEngineStatus();
  if (loading || !engines) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Engine Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {engines.map((e) => (
          <div key={e.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold capitalize">{e.name}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${e.status === "online" ? "bg-accent" : "bg-destructive"}`} />
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Port</span><span className="font-mono">{e.port}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Heartbeat</span><span className="text-accent">{e.heartbeat}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span className="font-mono">{e.uptime}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}