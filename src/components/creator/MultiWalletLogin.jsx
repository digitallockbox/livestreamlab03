import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useIdentity } from "@/lib/web3/identity";
import { loginCreatorOS, getMobileDeepLink, NO_WALLET_MOBILE } from "@/lib/web3/unified/loginCreatorOS";
import { PLATFORM_TLD, PLATFORM_DOMAIN } from "@/lib/constants/identity";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";

// Multi-wallet entry screen. Uses the unified loginCreatorOS entry point for
// chain detection and wallet connection. Phantom (Solana) and MetaMask (EVM)
// are both supported; the identity context auto-runs the Base44 handshake after
// the wallet is connected.
export default function MultiWalletLogin() {
  const { connect, select, wallets, publicKey } = useWallet();
  const { evmAddress, setEvmAddress, setChain, setWcProvider } = useIdentity();
  const [busy, setBusy] = useState(null); // "phantom" | "metamask" | "walletconnect" | null
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
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (phantom) select(phantom.adapter.name);
      await connect();
      setChain("solana");
    } catch (err) {
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
      setWcProvider(null);
      setEvmAddress(walletAddress);
      setChain("evm");
    } catch (err) {
      handleError(err, "evm");
    } finally {
      setBusy(null);
    }
  };

  const handleWalletConnect = async () => {
    setBusy("walletconnect");
    setError("");
    try {
      const { walletAddress, provider } = await loginCreatorOS("walletconnect");
      setWcProvider(provider);
      setEvmAddress(walletAddress);
      setChain("evm");
    } catch (err) {
      setError(err?.message || "WalletConnect connection failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Platform identity header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Zap className="w-3.5 h-3.5" /> {PLATFORM_DOMAIN}
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient-brand">LiveStreamLab</h1>
          <p className="text-sm text-muted-foreground">Connect your wallet to enter the Creator OS.</p>
          <p className="text-xs text-muted-foreground font-mono">Identity TLD: {PLATFORM_TLD}</p>
        </div>

        {/* Wallet connection */}
        <div className="space-y-3">
          <button
            onClick={handlePhantom}
            disabled={!!busy}
            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

          <button
            onClick={handleWalletConnect}
            disabled={!!busy}
            className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 border border-border"
          >
            {busy === "walletconnect" ? "Opening QR…" : "Connect via WalletConnect"}
          </button>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {/* Connected wallet display */}
        {(solanaConnected || evmAddress) && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            {solanaConnected && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Solana Wallet</p>
                <p className="font-mono text-sm break-all">{publicKey.toBase58()}</p>
              </div>
            )}
            {evmAddress && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">EVM Wallet</p>
                <p className="font-mono text-sm break-all">{evmAddress}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-accent pt-1 border-t border-border">
              <ShieldCheck className="w-3.5 h-3.5" /> Signature request sent — check your wallet
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Your wallet + $STREAMING token is your identity. Phantom is required for full Creator OS access (on-chain signing &amp; balance).
        </p>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}