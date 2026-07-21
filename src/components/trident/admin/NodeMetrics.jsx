import React from "react";
import { Cpu, HardDrive } from "lucide-react";

export default function NodeMetrics({ data }) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> CPU Usage</p>
        <p className="font-display text-2xl font-bold">{data?.cpu || "—"}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> RAM Usage</p>
        <p className="font-display text-2xl font-bold">{data?.ram || "—"}</p>
      </div>
    </div>
  );
}