// identity.jsx
// Multi-chain identity context: tracks the active chain ("solana" | "evm"),
// the connected EVM address, a session token, and a unified nonce signer.
// Phantom (Solana) signing goes through the injected window.solana provider;
// MetaMask (EVM) signing uses window.ethereum personal_sign.
import React, { createContext, useContext, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const IdentityContext = createContext(null);

export function IdentityProvider({ children }) {
  const { publicKey } = useWallet();
  const [evmAddress, setEvmAddress] = useState("");
  const [chain, setChain] = useState("");        // "solana" | "evm" | ""
  const [session, setSession] = useState(null);

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
  const signNonce = async (nonce) => {
    if (chain === "solana") return await signSolana(nonce);
    if (chain === "evm") return await signEvm(nonce);
    throw new Error("No chain selected");
  };

  // Unified wallet address derived from the active chain.
  const walletAddress = chain === "solana" ? solanaAddress : evmAddress;

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