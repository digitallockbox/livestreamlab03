import React from "react";

export default function TokenUsage({ rate }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Token Rate</p>
      <p className="font-display font-bold">1 ◎ = ${rate?.coinValue?.toFixed(2) || "0.01"}</p>
    </div>
  );
}