// streamingIdentity.jsx
// Phantom + $STREAMING SPL identity layer — the root of the Creator OS.
// Real on-chain: Phantom wallet connection, $STREAMING SPL balance, message signing.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

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
  const { publicKey, connect, disconnect, select, wallets, signMessage } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

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

  const value = {
    connected: !!publicKey,
    wallet: publicKey ? publicKey.toBase58() : null,
    publicKey,
    balance,
    loadingBalance,
    connect: connectPhantom,
    disconnect,
    refreshBalance,
    signMessage: sign,
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