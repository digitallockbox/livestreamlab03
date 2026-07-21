import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { token } from "@/lib/livestreamlabApi";

export default function IdentityPanel() {
  const { walletAddress, session } = useIdentity();
  const [rate, setRate] = useState(null);
  useEffect(() => { token.rate().then(setRate).catch(() => {}); }, []);
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Identity + Web3 Login</h2>
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
        {session?.expires_at && (
          <div>
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className="font-mono text-xs">{new Date(session.expires_at).toLocaleString()}</p>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Token Rate</p>
        <p className="font-display font-bold">1 ◎ = ${rate?.coinValue?.toFixed(2) || "0.01"}</p>
      </div>
    </div>
  );
}