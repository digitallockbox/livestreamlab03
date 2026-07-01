// identity.jsx
// Multi-chain identity context: tracks the active chain ("solana" | "evm"),
// the connected wallet address, a verified session (the Web3Profile returned by
// web3Login), and a unified nonce signer. Phantom (Solana) signing goes through
// the injected window.solana provider; MetaMask (EVM) uses window.ethereum personal_sign.
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { base44 } from "@/api/base44Client";
import session from "@/lib/session";

const WALLET_TOKEN_KEY = "trident_wallet_token";

const IdentityContext = createContext(null);

export function IdentityProvider({ children }) {
  const { publicKey } = useWallet();
  const [evmAddress, setEvmAddress] = useState("");
  const [chain, setChain] = useState("");        // "solana" | "evm" | ""
  const [session, setSession] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tracks the wallet we last attempted the handshake for, so the auto-login
  // only fires once per wallet (prevents repeated sign prompts / loops).
  const attemptedFor = useRef("");

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
    setLoginError("");
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
      // Persist the wallet-native JWT so engine/proxy calls can use it.
      if (res?.token) {
        try { localStorage.setItem(WALLET_TOKEN_KEY, res.token); } catch {}
        session.create(res.profile, res.token);
      }
      return res.profile;
    } catch (e) {
      const msg = e?.message || "Sign-in failed";
      console.warn("Identity login failed:", msg);
      setLoginError(msg);
      return null;
    } finally {
      setAuthenticating(false);
    }
  }, [chain, walletAddress, signNonce]);

  // Re-fetch the profile from the backend (no re-sign) and sync the session.
  const refreshProfile = useCallback(async () => {
    if (!walletAddress) return null;
    try {
      const res = await base44.functions.invoke("web3Profile", { action: "get", wallet_address: walletAddress }).then((r) => r.data);
      if (res?.profile) setSession(res.profile);
      return res?.profile || null;
    } catch (e) {
      console.warn("refreshProfile failed:", e?.message || e);
      return null;
    }
  }, [walletAddress]);

  // If Phantom auto-connects (e.g. on reload) before a chain is chosen, default to Solana
  // so the wallet address resolves and the handshake can proceed automatically.
  useEffect(() => {
    if (publicKey && !chain) setChain("solana");
  }, [publicKey, chain]);

  // Symmetric EVM handling: restore a previously-authorized MetaMask account on reload.
  useEffect(() => {
    const eth = window.ethereum;
    if (!evmAddress && !chain && eth?.selectedAddress) {
      setEvmAddress(eth.selectedAddress);
      setChain("evm");
    }
  }, [evmAddress, chain]);

  // Auto-run the handshake once a wallet is connected and not yet verified.
  // Guarded by attemptedFor so it fires exactly once per wallet; manual retry
  // is available on the VerifyWallet screen via login().
  useEffect(() => {
    if (walletAddress && !session && attemptedFor.current !== walletAddress) {
      attemptedFor.current = walletAddress;
      login();
    }
  }, [walletAddress, session, login]);

  // Silent token refresh — renews the wallet-native JWT every 12 hours so
  // wallet-only creators stay authenticated without re-signing. The backend
  // refreshToken function accepts a still-valid token and issues a fresh
  // 24h one; if the token is expired the user must re-authenticate via login().
  const refreshToken = useCallback(async () => {
    const current = getWalletToken();
    if (!current) return;
    try {
      const res = await base44.functions.invoke("refreshToken", { token: current }).then((r) => r.data);
      if (res?.token) {
        try { localStorage.setItem(WALLET_TOKEN_KEY, res.token); } catch {}
      }
    } catch (e) {
      console.warn("Token refresh failed:", e?.message || e);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refreshToken, 12 * 60 * 60 * 1000); // 12 hours
    return () => clearInterval(id);
  }, [refreshToken]);

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
        refreshProfile,
        authenticating,
        loginError,
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

// Retrieve the persisted wallet-native JWT (for Authorization headers in
// proxy / engine calls). Wallet-only auth path — no Base44 session needed.
export const getWalletToken = () => {
  try { return localStorage.getItem(WALLET_TOKEN_KEY); } catch { return null; }
};
export const clearWalletToken = () => {
  try { localStorage.removeItem(WALLET_TOKEN_KEY); } catch {}
};

export default IdentityProvider;