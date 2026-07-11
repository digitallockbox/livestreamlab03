/**
 * loginCreatorOS — top-level unified wallet login.
 *
 * Detects the available injected wallet provider, connects to it,
 * and returns a normalized { walletAddress, chain } tuple.
 *
 * Chain detection order:
 *   1. If window.solana.isPhantom is present → Solana / Phantom
 *   2. If window.ethereum is present → EVM / MetaMask
 *   3. Otherwise → throw with mobile deep-link guidance
 *
 * This module is pure — it does NOT call the backend or sign messages.
 * Use base44Handshake.js for the challenge/verify step.
 */

const MOBILE_METAMASK_DEEPLINK = "https://metamask.app.link/dapp/";
const MOBILE_PHANTOM_DEEPLINK = "https://phantom.app/ul/browse/";

/** Auto-detect which wallet provider is injected. Returns "solana" | "evm" | null. */
export function detectChain() {
  if (window.solana?.isPhantom) return "solana";
  if (window.ethereum) return "evm";
  return null;
}

/** Returns true if the user is on a mobile browser. */
export function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** Returns a mobile deep-link that opens the wallet's in-app browser on the current page. */
export function getMobileDeepLink(chain) {
  const currentUrl = window.location.origin + window.location.pathname;
  return chain === "evm"
    ? MOBILE_METAMASK_DEEPLINK + currentUrl
    : MOBILE_PHANTOM_DEEPLINK + encodeURIComponent(currentUrl);
}

/** Error sentinel thrown when no wallet is found on mobile (caller can redirect). */
export const NO_WALLET_MOBILE = "NO_WALLET_MOBILE";

/**
 * Connect to Phantom (Solana) via the injected provider.
 * @returns {Promise<{ walletAddress: string, chain: "solana" }>}
 */
export async function connectPhantom() {
  const provider = window.solana;
  if (!provider?.isPhantom) {
    if (isMobile()) throw new Error(NO_WALLET_MOBILE);
    throw new Error("Phantom not found. Install it at phantom.app");
  }
  const resp = await provider.connect();
  return { walletAddress: resp.publicKey.toString(), chain: "solana" };
}

/**
 * Target EVM chain for Creator OS — Ethereum mainnet.
 * Matches the WalletConnect configuration in walletConnectClient.js.
 */
export const TARGET_CHAIN_ID = 1;
const TARGET_CHAIN_HEX = "0x1";

const CHAIN_PARAMS = {
  1: {
    chainId: TARGET_CHAIN_HEX,
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.learnnear.me/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
};

/**
 * Ensure MetaMask is connected to the correct EVM chain (Ethereum mainnet).
 * If on the wrong chain, prompts the user to switch — and if the chain isn't
 * in their wallet, attempts to add it first.
 *
 * No-ops if window.ethereum is unavailable or already on the target chain.
 *
 * @param {number} [chainId=TARGET_CHAIN_ID] — target chain ID in decimal
 * @returns {Promise<void>}
 */
export async function ensureCorrectChain(chainId = TARGET_CHAIN_ID) {
  const eth = window.ethereum;
  if (!eth) return;

  const hexChainId = "0x" + chainId.toString(16);
  const currentChain = await eth.request({ method: "eth_chainId" }).catch(() => null);

  if (currentChain === hexChainId) return;

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError) {
    // Chain not added to wallet → add it, then switch
    if (switchError?.code === 4902 && CHAIN_PARAMS[chainId]) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [CHAIN_PARAMS[chainId]],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Connect to MetaMask (EVM) via window.ethereum.
 * Ensures the correct chain is selected before returning the address.
 * @returns {Promise<{ walletAddress: string, chain: "evm" }>}
 */
export async function connectMetaMask() {
  if (!window.ethereum) {
    if (isMobile()) throw new Error(NO_WALLET_MOBILE);
    throw new Error("MetaMask not found. Install it at metamask.io");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts?.length) throw new Error("No MetaMask account returned");
  await ensureCorrectChain();
  return { walletAddress: accounts[0], chain: "evm" };
}

/**
 * Connect via WalletConnect v2 (any EVM wallet through QR code or deep-link).
 * @returns {Promise<{ walletAddress: string, chain: "evm", provider: object }>}
 */
export async function connectWalletConnectEvm() {
  const { connectWalletConnect } = await import("@/lib/web3/evm/walletConnectClient");
  return connectWalletConnect();
}

/**
 * Unified login — connects the specified (or auto-detected) wallet.
 *
 * @param {string|null} preferredChain — "solana" | "evm" | "walletconnect" | null (auto-detect)
 * @returns {Promise<{ walletAddress: string, chain: "solana"|"evm", provider?: object }>}
 */
export async function loginCreatorOS(preferredChain = null) {
  const chain = preferredChain || detectChain();
  if (chain === "solana") return connectPhantom();
  if (chain === "evm") return connectMetaMask();
  if (chain === "walletconnect") return connectWalletConnectEvm();

  if (isMobile()) throw new Error(NO_WALLET_MOBILE);
  throw new Error("No wallet detected. Install Phantom or MetaMask.");
}