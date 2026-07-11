import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useIdentity } from "@/lib/web3/identity";
import { loginCreatorOS, getMobileDeepLink, NO_WALLET_MOBILE } from "@/lib/web3/unified/loginCreatorOS";

// Multi-wallet entry screen. Uses the unified loginCreatorOS entry point for
// chain detection and wallet connection. Phantom (Solana) and MetaMask (EVM)
// are both supported; the identity context auto-runs the Base44 handshake after
// the wallet is connected.
export default function MultiWalletLogin() {
  const { connect, select, wallets, publicKey } = useWallet();
  const { evmAddress, setEvmAddress, setChain } = useIdentity();
  const [busy, setBusy] = useState(null); // "phantom" | "metamask" | null
  const [error, setError] = useState("");
  const solanaConnected = !!publicKey && publicKey.toBase58();

  const handleError = (err, chain) => {
    if (err?.message === NO_WALLET_MOBILE) {
      window.location.href = getMobileDeepLink(chain);
      return;
    }
    setError(err?.message || `${chain === "solana" ? "Phantom" : "MetaMask"} connect failed`);
  };

  const handlePhantom = async () => {
    setBusy("phantom");
    setError("");
    try {
      // Use the wallet-adapter for Phantom (richer integration) when available,
      // falling back to loginCreatorOS's direct provider connection.
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (phantom) select(phantom.adapter.name);
      await connect();
      setChain("solana");
    } catch (err) {
      // Fallback: try direct connection via loginCreatorOS
      try {
        const { walletAddress, chain } = await loginCreatorOS("solana");
        if (chain === "solana") setChain("solana");
      } catch (fallbackErr) {
        handleError(fallbackErr, "solana");
      }
    } finally {
      setBusy(null);
    }
  };

  const handleMetaMask = async () => {
    setBusy("metamask");
    setError("");
    try {
      const { walletAddress } = await loginCreatorOS("evm");
      setEvmAddress(walletAddress);
      setChain("evm");
    } catch (err) {
      handleError(err, "evm");
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
            {busy === "phantom" ? "Connecting…" : solanaConnected ? `Connected ${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}` : "Connect Phantom (Solana)"}
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

        {solanaConnected && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Solana Wallet Connected</p>
            <p className="font-mono text-sm break-all">{publicKey.toBase58()}</p>
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