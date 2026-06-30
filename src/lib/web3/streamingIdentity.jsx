// streamingIdentity.jsx
// Phantom + $STREAMING SPL identity layer — the root of the Creator OS.
// Real on-chain: Phantom wallet connection, $STREAMING SPL balance, message signing.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, createTransferInstruction } from "@solana/spl-token";

// --- CONFIG: replace with your real values --------------------------------
export const STREAMING_MINT = "STREAMING_MINT_PLACEHOLDER"; // <-- set the real SPL mint address
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
// -------------------------------------------------------------------------

const IdentityContext = createContext(null);

// Read real on-chain $STREAMING SPL balance for a wallet. Returns 0 if no ATA / invalid mint.
async function readStreamingBalance(connection, walletPubkey) {
  try {
    const mint = new PublicKey(STREAMING_MINT);
    const ata = await getAssociatedTokenAddress(mint, walletPubkey);
    const account = await getAccount(connection, ata);
    return Number(account.amount);
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
  const [chain, setChain] = useState("");        // "solana" | "evm" | ""
  const [evmAddress, setEvmAddress] = useState("");

  const connection = useMemo(() => new Connection(RPC_ENDPOINT), []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) { setBalance(0); return; }
    setLoadingBalance(true);
    try {
      setBalance(await readStreamingBalance(connection, publicKey));
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey, connection]);

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

  // EVM (MetaMask) personal_sign → returns the hex signature string.
  const signEvm = useCallback(async (message) => {
    if (!window.ethereum) throw new Error("MetaMask not available");
    if (!evmAddress) throw new Error("No EVM account connected");
    return window.ethereum.request({ method: "personal_sign", params: [message, evmAddress] });
  }, [evmAddress]);

  // Unified nonce signer — dispatches to the active chain's signer.
  const signNonce = useCallback(async (nonce) => {
    if (chain === "solana") return sign(nonce);
    if (chain === "evm") return signEvm(nonce);
    throw new Error("No chain selected");
  }, [chain, sign, signEvm]);

  // Unified wallet address derived from the active chain.
  const walletAddress = chain === "evm" ? evmAddress : (publicKey ? publicKey.toBase58() : "");

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

  // Auto-run the handshake once the wallet connects.
  useEffect(() => {
    if (publicKey && !profile) login();
  }, [publicKey, profile, login]);

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
  const sendStreaming = useCallback(async (recipientAddress, amount) => {
    if (!publicKey) throw new Error("Wallet not connected");
    const mint = new PublicKey(STREAMING_MINT);
    const senderATA = await getAssociatedTokenAddress(mint, publicKey);
    const recipient = new PublicKey(recipientAddress);
    const recipientATA = await getAssociatedTokenAddress(mint, recipient);
    const ix = createTransferInstruction(senderATA, recipientATA, publicKey, Number(amount));
    const tx = new Transaction().add(ix);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }, [publicKey, sendTransaction, connection]);

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
    chain,
    setChain,
    evmAddress,
    setEvmAddress,
    signEvm,
    signNonce,
    walletAddress,
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