import React from "react";

export default function TenantCard({ tenant }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold">{tenant.name}</span>
        <span className="text-xs capitalize text-accent">{tenant.status}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div><p className="text-xs text-muted-foreground">Domain</p><p className="font-mono text-xs">{tenant.domain}</p></div>
        <div><p className="text-xs text-muted-foreground">Streams</p><p className="font-mono">{tenant.streams}</p></div>
        <div><p className="text-xs text-muted-foreground">Chain</p><p className="capitalize">{tenant.chain}</p></div>
        <div><p className="text-xs text-muted-foreground">Wallet</p><p className="font-mono text-xs">{tenant.wallet?.slice(0, 12)}…</p></div>
      </div>
    </div>
  );
}