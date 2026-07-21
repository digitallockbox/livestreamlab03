import React from "react";
import { Loader2, GitBranch, ArrowRight } from "lucide-react";
import { useRoutingMap } from "@/lib/tridentControlPlane";

export default function AutosplitRoutingPanel() {
  const { data: routes, loading } = useRoutingMap();
  if (loading && !routes) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const rows = routes || [];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> Autosplit Routing Map</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active routing maps.</p>
      ) : rows.map((r) => (
        <div key={r.streamId} className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs text-muted-foreground mb-2">{r.input}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{r.title}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            {r.outputs.map((o, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs">
                <span className="font-mono font-medium">{o.type}</span>
                <span className="text-muted-foreground">{o.path}</span>
                <span className="text-accent">●</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}