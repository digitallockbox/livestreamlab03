import React, { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import NodeMetrics from "@/components/trident/admin/NodeMetrics";
import LogsViewer from "@/components/trident/admin/LogsViewer";
import { useAdminData } from "@/state/trident/useTridentStores";
import { adminService } from "@/services/trident/adminService";

const DEFAULT_LOGS = ["[INFO] Node initialized", "[INFO] RTMP engine started on :1935", "[OK] Autosplit engine connected", "[OK] Storage engine mounted /data"];

export default function AdminPage() {
  const { data, loading } = useAdminData();
  const [logs, setLogs] = useState(DEFAULT_LOGS);
  if (loading && !data) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const d = data || { cpu: "—", ram: "—", engines: [] };
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Admin Control Panel</h2>
      <NodeMetrics data={d} />
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold mb-3">Engine Controls</h3>
        <div className="space-y-2">
          {d.engines.map((e) => (
            <div key={e.name} className="flex items-center justify-between">
              <span className="text-sm capitalize">{e.name} <span className="text-xs text-muted-foreground">:{e.port}</span></span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${e.status === "online" ? "bg-accent" : "bg-destructive"}`} />
                <button onClick={async () => { setLogs((l) => [`[INFO] Restarting ${e.name}...`, ...l]); try { const r = await adminService.restartEngine(e.name); if (r.restarted) setLogs((l) => [`[OK] ${e.name} restarted`, ...l]); } catch { setLogs((l) => [`[ERROR] ${e.name} restart failed`, ...l]); } }} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs hover:bg-muted"><RotateCcw className="w-3 h-3" /> Restart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LogsViewer logs={logs} />
    </div>
  );
}