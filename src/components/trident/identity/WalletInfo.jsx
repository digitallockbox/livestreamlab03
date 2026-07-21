import React from "react";

export default function WalletInfo({ walletAddress, session }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">Wallet</p>
        <p className="font-mono text-sm break-all">{walletAddress || "Not connected"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Tenant</p>
        <p className="font-mono text-sm">{session?.bound_domain || "livestreamlab"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Session Token</p>
        <p className="font-mono text-xs text-accent">{session ? "session-token-xyz" : "—"}</p>
      </div>
    </div>
  );
}