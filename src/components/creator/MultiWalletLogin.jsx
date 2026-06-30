import React, { useState } from "react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";

// Multi-wallet entry screen. Phantom is the fully-supported path (Solana signing
// + $STREAMING balance via the identity provider). MetaMask connects the EVM
// account for display; full Creator OS access currently requires Phantom.
export default function MultiWalletLogin() {
  const { connect, connected, wallet, authenticating, evmAddress, setEvmAddress, setChain } = useStreamingIdentity();
  const [busy, setBusy] = useState(null); // "phantom" | "metamask" | null
  const [error, setError] = useState("");

  const handlePhantom = async () => {
    setBusy("phantom");
    setError("");
    try {
      await connect();
      setChain("solana");
    } catch (err) {
      setError(err?.message || "Phantom connect failed");
    } finally {
      setBusy(null);
    }
  };

  const handleMetaMask = async () => {
    setBusy("metamask");
    setError("");
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed. Install it at metamask.io to continue.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setEvmAddress(accounts[0]);
        setChain("evm");
      }
    } catch (err) {
      setError(err?.message || "MetaMask connect failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-gradient-brand">LiveStreamLab</h1>
          <p className="text-sm text-muted-foreground">Choose your wallet to enter the Creator OS.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePhantom}
            disabled={!!busy}
            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {busy === "phantom" ? "Connecting…" : authenticating ? "Verifying wallet…" : connected && wallet ? `Connected ${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "Connect Phantom (Solana)"}
          </button>

          <button
            onClick={handleMetaMask}
            disabled={!!busy}
            className="w-full px-4 py-3 rounded-xl bg-chart-3 text-accent-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy === "metamask" ? "Connecting…" : evmAddress ? `Connected ${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}` : "Connect MetaMask (EVM)"}
          </button>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {connected && wallet && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Solana Wallet Connected</p>
            <p className="font-mono text-sm break-all">{wallet}</p>
          </div>
        )}

        {evmAddress && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">EVM Wallet Connected</p>
            <p className="font-mono text-sm break-all">{evmAddress}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Your wallet + $STREAMING token is your identity. Phantom is required for full Creator OS access (on-chain signing &amp; balance).
        </p>
      </div>
    </div>
  );
}