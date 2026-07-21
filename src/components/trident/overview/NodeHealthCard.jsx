import React from "react";
import { Activity } from "lucide-react";

export default function NodeHealthCard({ engines }) {
  const online = engines.filter((e) => e.status === "online").length;
  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-card p-4 flex items-center gap-4">
      <Activity className="w-8 h-8 text-accent" />
      <div>
        <p className="text-xs text-muted-foreground">Node Health</p>
        <p className="font-display text-lg font-bold">{online}/{engines.length} engines online</p>
      </div>
    </div>
  );
}