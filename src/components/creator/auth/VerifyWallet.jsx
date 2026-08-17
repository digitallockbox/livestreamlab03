import React from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "@/lib/web3/identity";
import { PLATFORM_TLD, TOKEN_GATE_MIN_BALANCE } from "@/lib/constants/identity";
import { Loader2, ShieldCheck, Zap, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

// VerifyWallet — intermediate screen shown when a wallet is connected but the
// cryptographic handshake (challenge → sign → verify) has not yet completed.
// The identity context auto-fires login(); this screen gives the user context
// about what they're signing and a manual retry if the signature is rejected.
export default function VerifyWallet() {
  const { walletAddress, chain, login, authenticating, loginError } = useIdentity();

  const chainLabel = chain === "solana" ? "Solana" : chain === "evm" ? "EVM" : "—";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Wallet Ownership
          </div>
          <h1 className="text-2xl font-display font-bold">Sign to Continue</h1>
          <p className="text-sm text-muted-foreground">
            Prove you own this wallet to unlock the Creator OS. Your wallet will ask you to sign a nonce — there is no gas cost.
          </p>
        </div>

        {/* Wallet info card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Wallet</span>
            <span className="font-mono text-sm break-all text-right">{walletAddress?.slice(0, 10)}…{walletAddress?.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Chain</span>
            <span className="text-sm font-medium">{chainLabel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Identity TLD</span>
            <span className="font-mono text-sm">{PLATFORM_TLD}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-accent" /> Token Gate</span>
            <span className="text-xs text-muted-foreground">Hold ≥{TOKEN_GATE_MIN_BALANCE} $STREAMING</span>
          </div>
        </div>

        {/* Error display */}
        {loginError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          </div>
        )}

        {/* Sign button */}
        <button
          onClick={login}
          disabled={authenticating}
          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {authenticating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Sign to Continue</>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          {authenticating
            ? "Check your wallet — a signature request has been sent."
            : "If the signature prompt didn't appear, click the button to retry."}
        </p>

        <div className="text-center">
          <Link to="/enter" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Use a different wallet
          </Link>
        </div>
      </div>
    </div>
  );
}