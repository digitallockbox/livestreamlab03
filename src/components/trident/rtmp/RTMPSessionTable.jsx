import React from "react";

export default function RTMPSessionTable({ sessions }) {
  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr><th className="text-left p-3">Session ID</th><th className="text-left p-3">Creator</th><th className="text-left p-3">Port</th><th className="text-left p-3">Connected</th><th className="text-left p-3">Viewers</th><th className="text-left p-3">Status</th></tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
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
  );
}