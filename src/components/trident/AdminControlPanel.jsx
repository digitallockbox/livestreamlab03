import React, { useState } from "react";
import { Loader2, Cpu, HardDrive, RotateCcw, FileText } from "lucide-react";
import { useAdminData } from "@/lib/tridentControlPlane";

const DEFAULT_LOGS = [
  "[INFO] Node initialized",
  "[INFO] RTMP engine started on :1935",
  "[OK] Autosplit engine connected",
  "[OK] Storage engine mounted /data",
];

export default function AdminControlPanel() {
  const { data, loading } = useAdminData();
  const [logs, setLogs] = useState(DEFAULT_LOGS);
  if (loading && !data) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const d = data || { cpu: "—", ram: "—", engines: [] };
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Admin Control Panel</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> CPU Usage</p>
          <p className="font-display text-2xl font-bold">{d.cpu}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> RAM Usage</p>
          <p className="font-display text-2xl font-bold">{d.ram}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold mb-3">Engine Controls</h3>
        <div className="space-y-2">
          {d.engines.map((e) => (
            <div key={e.name} className="flex items-center justify-between">
              <span className="text-sm capitalize">{e.name} <span className="text-xs text-muted-foreground">:{e.port}</span></span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${e.status === "online" ? "bg-accent" : "bg-destructive"}`} />
                <button onClick={() => setLogs((l) => [`[INFO] Restarting ${e.name}...`, ...l])} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs hover:bg-muted"><RotateCcw className="w-3 h-3" /> Restart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Logs</h3>
        <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
          {logs.map((l, i) => <p key={i} className={l.includes("ERROR") ? "text-destructive" : "text-muted-foreground"}>{l}</p>)}
        </div>
      </div>
    </div>
  );
}