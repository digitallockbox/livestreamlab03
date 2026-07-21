import React from "react";
import { ArrowRight } from "lucide-react";

export default function AutosplitRoutingMap({ routes }) {
  if (!routes || routes.length === 0) return <p className="text-sm text-muted-foreground">No active routing maps.</p>;
  return (
    <div className="space-y-3">
      {routes.map((r) => (
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