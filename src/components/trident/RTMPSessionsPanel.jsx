import React from "react";
import { Loader2, Radio } from "lucide-react";
import { useLiveSessions } from "@/lib/tridentControlPlane";

export default function RTMPSessionsPanel() {
  const { data: sessions, loading } = useLiveSessions();
  if (loading && !sessions) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const rows = sessions || [];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Radio className="w-5 h-5 text-primary" /> RTMP Live Sessions</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active RTMP sessions.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr><th className="text-left p-3">Session ID</th><th className="text-left p-3">Creator</th><th className="text-left p-3">Port</th><th className="text-left p-3">Connected</th><th className="text-left p-3">Viewers</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.streamId} className="border-t border-border/50">
                  <td className="p-3 font-mono text-xs">{s.sid}</td>
                  <td className="p-3 font-mono text-xs">{s.ip}</td>
                  <td className="p-3">{s.port}</td>
                  <td className="p-3 text-xs">{s.connectedAt ? new Date(s.connectedAt).toLocaleTimeString() : "—"}</td>
                  <td className="p-3">{s.lastData}</td>
                  <td className="p-3"><span className="inline-flex items-center gap-1 text-accent text-xs"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}