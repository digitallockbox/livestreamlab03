// streamingIdentity.jsx
// Phantom + $STREAMING SPL identity layer — the root of the Creator OS.
// Real on-chain: Phantom wallet connection, $STREAMING SPL balance, message signing.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, createTransferInstruction } from "@solana/spl-token";

// --- CONFIG -------------------------------------------------------------
// The real $STREAMING SPL mint + decimals are fetched at runtime from the
// `streamingConfig` backend function (backed by secrets), so they can be
// updated without a frontend redeploy and are never hardcoded in the bundle.
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
// -------------------------------------------------------------------------

const IdentityContext = createContext(null);

// Read real on-chain $STREAMING SPL balance for a wallet.
// `mint` must be a valid base58 mint pubkey. Returns display units (raw / 10^decimals).
async function readStreamingBalance(connection, walletPubkey, mint, decimals) {
  if (!mint) return 0;
  try {
    const mintPk = new PublicKey(mint);
    const ata = await getAssociatedTokenAddress(mintPk, walletPubkey);
    const account = await getAccount(connection, ata);
    const raw = Number(account.amount);
    return decimals > 0 ? raw / Math.pow(10, decimals) : raw;
  } catch {
    return 0;
  }
}

function IdentityInner({ children }) {
  const { publicKey, connect, disconnect, select, wallets, signMessage, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [config, setConfig] = useState({ mint: null, decimals: 9 });

  const connection = useMemo(() => new Connection(RPC_ENDPOINT), []);

  // Fetch the real mint + decimals once on mount from the backend config.
  useEffect(() => {
    base44.functions.invoke("streamingConfig", {})
      .then((r) => r.data)
      .then((cfg) => {
        if (cfg?.mint) setConfig({ mint: cfg.mint, decimals: Number(cfg.decimals) || 9 });
      })
      .catch((e) => console.warn("streamingConfig load failed:", e?.message || e));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) { setBalance(0); return; }
    setLoadingBalance(true);
    try {
      setBalance(await readStreamingBalance(connection, publicKey, config.mint, config.decimals));
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey, connection, config]);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  // Connect the Phantom adapter (the only wallet we register).
  const connectPhantom = useCallback(async () => {
    try {
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (phantom) select(phantom.adapter.name);
      await connect();
    } catch (err) {
      console.warn("Phantom connect failed:", err?.message || err);
    }
  }, [wallets, select, connect]);

  // Sign an arbitrary message with the connected wallet → base64 signature.
  const sign = useCallback(async (message) => {
    if (!signMessage) return null;
    const encoded = new TextEncoder().encode(message);
    const sig = await signMessage(encoded);
    return btoa(String.fromCharCode(...sig));
  }, [signMessage]);

  // Complete the Phantom handshake: challenge → wallet signs → backend verifies ownership.
  const login = useCallback(async () => {
    if (!publicKey) return null;
    setAuthenticating(true);
    try {
      const ch = await base44.functions.invoke("web3Login", { action: "challenge" }).then((r) => r.data);
      const sigB64 = await sign(ch.message);
      if (!sigB64) throw new Error("Signature rejected");
      const res = await base44.functions.invoke("web3Login", {
        action: "verify",
        wallet_address: publicKey.toBase58(),
        message: ch.message,
        signature: sigB64,
      }).then((r) => r.data);
      setProfile(res.profile);
      return res.profile;
    } catch (e) {
      console.warn("Phantom login failed:", e?.message || e);
      return null;
    } finally {
      setAuthenticating(false);
    }
  }, [publicKey, sign]);

  // Login is now driven by the unified useIdentity layer (chain-aware).

  // Sign the engine action with the connected wallet, then invoke the backend.
  // The backend verifies the signature against auth_wallet before writing.
  const signedInvoke = useCallback(async (name, payload) => {
    if (!publicKey) throw new Error("Wallet not connected");
    const auth_wallet = publicKey.toBase58();
    const auth_message = `LiveStreamLab ${name} ts:${Date.now()}`;
    const auth_signature = await sign(auth_message);
    if (!auth_signature) throw new Error("Signature rejected");
    return base44.functions.invoke(name, { ...payload, auth_wallet, auth_message, auth_signature }).then((r) => r.data);
  }, [publicKey, sign]);

  // Real on-chain $STREAMING SPL transfer (Phantom signs, sent to RPC).
  // `amount` is in display units; converted to raw using config.decimals.
  const sendStreaming = useCallback(async (recipientAddress, amount) => {
    if (!publicKey) throw new Error("Wallet not connected");
    if (!config.mint) throw new Error("Token config not loaded yet");
    const mintPk = new PublicKey(config.mint);
    const senderATA = await getAssociatedTokenAddress(mintPk, publicKey);
    const recipient = new PublicKey(recipientAddress);
    const recipientATA = await getAssociatedTokenAddress(mintPk, recipient);
    const rawAmount = Math.round(Number(amount) * Math.pow(10, config.decimals));
    if (!rawAmount || rawAmount <= 0) throw new Error("Amount must be greater than 0");
    const ix = createTransferInstruction(senderATA, recipientATA, publicKey, rawAmount);
    const tx = new Transaction().add(ix);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }, [publicKey, sendTransaction, connection, config]);

  const value = {
    connected: !!publicKey,
    wallet: publicKey ? publicKey.toBase58() : null,
    publicKey,
    profile,
    authenticating,
    balance,
    loadingBalance,
    connect: connectPhantom,
    disconnect,
    refreshBalance,
    signMessage: sign,
    login,
    signedInvoke,
    sendStreaming,
  };

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function PhantomIdentityProvider({ children }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <IdentityInner>{children}</IdentityInner>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useStreamingIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useStreamingIdentity must be used within PhantomIdentityProvider");
  return ctx;
}

export default PhantomIdentityProvider;