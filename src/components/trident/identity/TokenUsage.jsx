import React from "react";

export default function TokenUsage({ rate, usage }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">Token Rate</p>
        <p className="font-display font-bold">1 ◎ = ${rate?.coinValue?.toFixed(2) || "0.01"}</p>
      </div>
      {usage && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Tokens Used</p>
            <p className="font-display font-bold">{usage.tokensUsed}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-display font-bold text-accent">{usage.tokensRemaining}</p>
          </div>
        </div>
      )}
    </div>
  );
}