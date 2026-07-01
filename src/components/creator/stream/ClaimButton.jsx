import React, { useState } from "react";
import { Loader2, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";

// ClaimButton — lets a viewer instantly redeem earned $STREAMING tokens to
// their connected wallet. Calls web3Watch 'claim', which ends any active
// session, aggregates earned tokens, builds an unsigned settlement tx, and
// returns it for broadcast. Doubles as the in-stream redemption control.
export default function ClaimButton({ viewerWallet, earned, onClaimed }) {
  const { signedInvoke } = useIdentity();
  const [status, setStatus] = useState("idle"); // idle | claiming | success | error
  const [claimed, setClaimed] = useState(0);
  const [error, setError] = useState("");

  const handleClaim = async () => {
    if (!viewerWallet) { setError("Connect your wallet first"); setStatus("error"); return; }
    if (!earned || earned <= 0) { setError("No tokens to claim yet"); setStatus("error"); return; }
    setStatus("claiming"); setError("");
    try {
      const res = await signedInvoke("web3Watch", { action: "claim", viewerWallet });
      setClaimed(res.claimed);
      setStatus("success");
      onClaimed?.(res.claimed);
    } catch (e) {
      setError(e?.message || "Claim failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 text-accent text-sm border border-accent/30">
        <CheckCircle2 className="w-4 h-4" /> Claimed {claimed} ◎
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClaim}
        disabled={status === "claiming" || !earned}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 text-accent text-sm border border-accent/30 hover:bg-accent/25 disabled:opacity-50"
      >
        {status === "claiming" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        Claim {earned} ◎
      </button>
      {status === "error" && (
        <p className="text-xs text-destructive inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>
      )}
    </div>
  );
}