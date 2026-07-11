// identity.jsx
// Multi-chain identity context: tracks the active chain ("solana" | "evm"),
// the connected wallet address, a verified session (the Web3Profile returned by
// web3Login), and a unified nonce signer. Phantom (Solana) signing goes through
// the injected window.solana provider; MetaMask (EVM) uses window.ethereum personal_sign.
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { base44 } from "@/api/base44Client";
import { base44Handshake, signNonceForChain, getWalletToken } from "@/lib/web3/unified/base44Handshake";

const WALLET_TOKEN_KEY = "trident_wallet_token";

const IdentityContext = createContext(null);

export function IdentityProvider({ children }) {
  const { publicKey } = useWallet();
  const [evmAddress, setEvmAddress] = useState("");
  const [chain, setChain] = useState("");        // "solana" | "evm" | ""
  const [session, setSession] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState("");
  const wcProviderRef = useRef(null);             // WalletConnect provider for EVM signing

  // Tracks the wallet we last attempted the handshake for, so the auto-login
  // only fires once per wallet (prevents repeated sign prompts / loops).
  const attemptedFor = useRef("");

  const solanaAddress = publicKey ? publicKey.toBase58() : "";

  // Unified nonce signer — delegates to the chain-specific signer in base44Handshake.
  // For WalletConnect EVM sessions, passes the WC provider so signing goes through
  // the WC session rather than window.ethereum.
  const signNonce = useCallback(
    async (nonce) => signNonceForChain(nonce, chain, evmAddress, wcProviderRef.current),
    [chain, evmAddress]
  );

  // Unified wallet address derived from the active chain.
  const walletAddress = chain === "solana" ? solanaAddress : evmAddress;

  // Full Base44 handshake — delegates challenge/sign/verify to base44Handshake.
  // Works for both Solana and EVM. Surfaces backend errors to the user.
  const login = useCallback(async () => {
    if (!walletAddress || !chain) return null;
    setAuthenticating(true);
    setLoginError("");
    try {
      const { profile } = await base44Handshake(walletAddress, chain, wcProviderRef.current);
      setSession(profile);
      return profile;
    } catch (e) {
      // base44.functions.invoke throws an Axios error on non-2xx; the real
      // backend reason lives in e.response.data, not e.message (which is just
      // "Request failed with status code N"). Surface it so the user sees the
      // actual cause (e.g. "Nonce invalid or already used", "Signature rejected").
      const data = e?.response?.data;
      const msg =
        (data && (data.error || data.message)) ||
        e?.message ||
        "Sign-in failed";
      console.warn("Identity login failed:", msg, e?.response?.status || "");
      setLoginError(msg);
      return null;
    } finally {
      setAuthenticating(false);
    }
  }, [chain, walletAddress]);

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
    const token = getWalletToken();
    if (!token) throw new Error("Wallet not authenticated — please complete wallet login first");
    return base44.functions.invoke(name, { ...payload, wallet_token: token }).then((r) => r.data);
  }, [walletAddress]);

  return (
    <IdentityContext.Provider
      value={{
        walletAddress,
        chain,
        setChain,
        evmAddress,
        setEvmAddress,
        setWcProvider: (p) => { wcProviderRef.current = p; },
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

// Token helpers are re-exported from base44Handshake for backward compatibility.
// All new code should import directly from @/lib/web3/unified/base44Handshake.
export { getWalletToken, clearWalletToken } from "@/lib/web3/unified/base44Handshake";

export default IdentityProvider;