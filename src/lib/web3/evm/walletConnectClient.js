/**
 * WalletConnect v2 client for EVM wallet connections.
 *
 * Provides a singleton EthereumProvider that opens the WalletConnect modal,
 * letting users connect any EVM wallet (mobile or desktop) via QR code or
 * deep-link. The connected provider also supports personal_sign for the
 * Base44 handshake.
 *
 * Requires a WalletConnect project ID — get one at cloud.walletconnect.com
 * and set VITE_WALLETCONNECT_PROJECT_ID in your .env.
 */
import EthereumProvider from "@walletconnect/ethereum-provider";

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";
const CHAIN_ID = 1; // Ethereum mainnet

let _provider = null;

/** Lazily initialize the WalletConnect EthereumProvider singleton. */
export async function getWalletConnectProvider() {
  if (_provider) return _provider;
  if (!PROJECT_ID) {
    throw new Error(
      "WalletConnect project ID not set. Set VITE_WALLETCONNECT_PROJECT_ID in your .env (get one at cloud.walletconnect.com)."
    );
  }
  _provider = await EthereumProvider.init({
    projectId: PROJECT_ID,
    chains: [CHAIN_ID],
    optionalChains: [137, 42161, 10, 8453],
    showQrModal: true,
    metadata: {
      name: "LiveStreamLab Creator OS",
      description: "Web3 creator streaming platform powered by Trident OS + Base44",
      url: typeof window !== "undefined" ? window.location.origin : "https://livestreamlab.live",
      icons: ["https://livestreamlab.live/logo.png"],
    },
  });
  return _provider;
}

/**
 * Connect via WalletConnect — opens the QR modal and resolves with the
 * selected account.
 * @returns {Promise<{ walletAddress: string, chain: "evm", provider: object }>}
 */
export async function connectWalletConnect() {
  const provider = await getWalletConnectProvider();
  const accounts = await provider.enable();
  if (!accounts?.length) throw new Error("WalletConnect: no account returned");
  return { walletAddress: accounts[0], chain: "evm", provider };
}

/** Sign a message via WalletConnect personal_sign. */
export async function signWithWalletConnect(provider, message, walletAddress) {
  return provider.request({
    method: "personal_sign",
    params: [message, walletAddress],
  });
}

/** Disconnect the active WalletConnect session. */
export async function disconnectWalletConnect() {
  if (!_provider) return;
  try {
    await _provider.disconnect();
  } finally {
    _provider = null;
  }
}