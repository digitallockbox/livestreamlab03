/**
 * base44Handshake — frontend handshake wrapper for the Base44 identity packet.
 *
 * Flow: challenge → sign nonce → verify → persist token → return session.
 *
 * This module is pure (no React) and delegates signing to chain-specific signers.
 * The identity context (identity.jsx) calls this and manages React state.
 */
import { base44 } from "@/api/base44Client";

const WALLET_TOKEN_KEY = "trident_wallet_token";

// ─── Chain-specific signers ────────────────────────────────────────────────

async function signWithSolana(nonce) {
  if (!window.solana?.signMessage) {
    throw new Error("Phantom signMessage not available");
  }
  const encoded = new TextEncoder().encode(nonce);
  const { signature } = await window.solana.signMessage(encoded, "utf8");
  return btoa(String.fromCharCode(...signature));
}

async function signWithEvm(nonce, walletAddress, wcProvider) {
  // WalletConnect session: sign through the WC provider instead of window.ethereum
  if (wcProvider) {
    return wcProvider.request({
      method: "personal_sign",
      params: [nonce, walletAddress],
    });
  }
  // Injected EVM provider (MetaMask / MetaMask Mobile in-app browser)
  if (!window.ethereum) throw new Error("MetaMask not available");
  return window.ethereum.request({
    method: "personal_sign",
    params: [nonce, walletAddress],
  });
}

/**
 * Sign a nonce with the active chain's wallet.
 *
 * @param {string} nonce — challenge message from the backend
 * @param {string} chain — "solana" | "evm"
 * @param {string} walletAddress
 * @returns {Promise<string>} signature (base64 for Solana, hex for EVM)
 */
export async function signNonceForChain(nonce, chain, walletAddress, wcProvider) {
  if (chain === "solana") return signWithSolana(nonce);
  if (chain === "evm") return signWithEvm(nonce, walletAddress, wcProvider);
  throw new Error(`Unsupported chain: ${chain}`);
}

/**
 * Full Base44 identity handshake.
 *
 * Steps: request nonce challenge → sign with wallet → verify on backend → persist JWT.
 *
 * @param {string} walletAddress
 * @param {string} chain — "solana" | "evm"
 * @returns {Promise<{ profile: object, token: string }>}
 */
export async function base44Handshake(walletAddress, chain, wcProvider) {
  if (!walletAddress || !chain) {
    throw new Error("walletAddress and chain are required");
  }

  // 1. Request a nonce challenge from the backend
  const challenge = await base44.functions
    .invoke("web3Login", { action: "challenge" })
    .then((r) => r.data);

  // 2. Sign the nonce with the connected wallet (WC provider for WalletConnect)
  const signature = await signNonceForChain(challenge.message, chain, walletAddress, wcProvider);
  if (!signature) throw new Error("Signature rejected");

  // 3. Verify the signature → receive profile + wallet-native JWT
  const res = await base44.functions
    .invoke("web3Login", {
      action: "verify",
      chain,
      wallet_address: walletAddress,
      message: challenge.message,
      signature,
    })
    .then((r) => r.data);

  // 4. Persist the JWT so engine/proxy calls can use it
  if (res?.token) {
    try {
      localStorage.setItem(WALLET_TOKEN_KEY, res.token);
    } catch {
      /* storage may be blocked (private mode) — non-fatal */
    }
  }

  return { profile: res.profile, token: res.token };
}

// ─── Token persistence helpers (re-exported by identity.jsx) ───────────────

export const getWalletToken = () => {
  try {
    return localStorage.getItem(WALLET_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearWalletToken = () => {
  try {
    localStorage.removeItem(WALLET_TOKEN_KEY);
  } catch {
    /* no-op */
  }
};