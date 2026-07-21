import React from "react";
import { FileText } from "lucide-react";

export default function LogsViewer({ logs }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-display font-semibold mb-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Logs</h3>
      <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
        {logs.map((l, i) => <p key={i} className={l.includes("ERROR") ? "text-destructive" : "text-muted-foreground"}>{l}</p>)}
      </div>
    </div>
  );
}