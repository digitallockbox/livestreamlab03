// identity.jsx
// Multi-chain identity context: tracks the active chain ("solana" | "evm"),
// the connected EVM address, a session token, and a unified nonce signer.
// Phantom (Solana) signing goes through the injected window.solana provider;
// MetaMask (EVM) signing uses window.ethereum personal_sign.
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { base44 } from "@/api/base44Client";

const IdentityContext = createContext(null);

export function IdentityProvider({ children }) {
  const { publicKey } = useWallet();
  const [evmAddress, setEvmAddress] = useState("");
  const [chain, setChain] = useState("");        // "solana" | "evm" | ""
  const [session, setSession] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);

  const solanaAddress = publicKey ? publicKey.toBase58() : "";

  // Sign a nonce with Phantom's injected Solana signer → base64 signature.
  const signSolana = async (nonce) => {
    if (!window.solana || !window.solana.signMessage) {
      throw new Error("Phantom signMessage not available");
    }
    const encoded = new TextEncoder().encode(nonce);
    const { signature } = await window.solana.signMessage(encoded, "utf8");
    return btoa(String.fromCharCode(...signature));
  };

  // Sign a nonce with MetaMask → hex signature string.
  const signEvm = async (nonce) => {
    if (!window.ethereum) throw new Error("MetaMask not available");
    if (!evmAddress) throw new Error("No EVM account connected");
    return window.ethereum.request({ method: "personal_sign", params: [nonce, evmAddress] });
  };

  // Unified nonce signer — dispatches to the active chain's signer.
  const signNonce = useCallback(async (nonce) => {
    if (chain === "solana") return await signSolana(nonce);
    if (chain === "evm") return await signEvm(nonce);
    throw new Error("No chain selected");
  }, [chain, evmAddress]);

  // Unified wallet address derived from the active chain.
  const walletAddress = chain === "solana" ? solanaAddress : evmAddress;

  // Challenge → signNonce → verify handshake. Works for both Solana and EVM.
  const login = useCallback(async () => {
    if (!walletAddress || !chain) return null;
    setAuthenticating(true);
    try {
      const ch = await base44.functions.invoke("web3Login", { action: "challenge" }).then((r) => r.data);
      const signature = await signNonce(ch.message);
      if (!signature) throw new Error("Signature rejected");
      const res = await base44.functions.invoke("web3Login", {
        action: "verify",
        chain,
        wallet_address: walletAddress,
        message: ch.message,
        signature,
      }).then((r) => r.data);
      setSession(res.profile);
      return res.profile;
    } catch (e) {
      console.warn("Identity login failed:", e?.message || e);
      return null;
    } finally {
      setAuthenticating(false);
    }
  }, [chain, walletAddress, signNonce]);

  // If Phantom auto-connects (e.g. on reload) before a chain is chosen, default to Solana
  // so the wallet address resolves and the handshake can proceed automatically.
  useEffect(() => {
    if (publicKey && !chain) setChain("solana");
  }, [publicKey, chain]);

  // Symmetric EVM handling: restore a previously-authorized MetaMask account on reload
  // so the wallet address resolves and the handshake can proceed automatically.
  useEffect(() => {
    const eth = window.ethereum;
    if (!evmAddress && !chain && eth?.selectedAddress) {
      setEvmAddress(eth.selectedAddress);
      setChain("evm");
    }
  }, [evmAddress, chain]);

  // Auto-run the handshake once a wallet is connected and not yet verified.
  useEffect(() => {
    if (walletAddress && !session) login();
  }, [walletAddress, session, login]);

  // Sign an engine action with the connected wallet, then invoke the backend.
  // The backend verifies the signature (Solana or EVM) before writing.
  const signedInvoke = useCallback(async (name, payload) => {
    if (!walletAddress) throw new Error("Wallet not connected");
    const auth_message = `LiveStreamLab ${name} ts:${Date.now()}`;
    const auth_signature = await signNonce(auth_message);
    if (!auth_signature) throw new Error("Signature rejected");
    return base44.functions.invoke(name, { ...payload, auth_wallet: walletAddress, chain, auth_message, auth_signature }).then((r) => r.data);
  }, [walletAddress, chain, signNonce]);

  return (
    <IdentityContext.Provider
      value={{
        walletAddress,
        chain,
        setChain,
        evmAddress,
        setEvmAddress,
        session,
        setSession,
        signNonce,
        signedInvoke,
        login,
        authenticating,
        profile: session,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  return useContext(IdentityContext);
}

export default IdentityProvider;