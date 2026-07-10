/**
 * Base44 Identity Packet — frontend transport format.
 *
 * Packet shape: { w, s, n, v }
 *   w = wallet address (Base58 / hex)
 *   s = signature (Base58)
 *   n = nonce (UTF-8 string)
 *   v = protocol version (44)
 *
 * This module is pure: it builds packets and signs with Phantom.
 * Transport is handled by the base44Api connector in tridentApi.js
 * so the packet flows through the same authenticated proxy as everything else.
 */

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Base58-encode a Uint8Array (Bitcoin-style, with leading-zero handling).
 */
export function base58Encode(bytes) {
  const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (input.length === 0) return "";

  let x = BigInt(0);
  for (const b of input) {
    x = (x << BigInt(8)) + BigInt(b);
  }

  let result = "";
  while (x > 0) {
    const mod = x % BigInt(58);
    x = x / BigInt(58);
    result = BASE58_ALPHABET[Number(mod)] + result;
  }

  // leading zero bytes → leading "1" characters
  for (const b of input) {
    if (b === 0) result = "1" + result;
    else break;
  }

  return result;
}

/**
 * Build the compact Base44 identity packet.
 */
export function buildBase44Packet(wallet, signature, nonce) {
  return { w: wallet, s: signature, n: nonce, v: 44 };
}

/**
 * Connect to the Phantom injected provider and return the wallet address.
 */
export async function connectPhantom() {
  const provider = window.solana;
  if (!provider || !provider.isPhantom) {
    throw new Error("Phantom wallet not found");
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

/**
 * Sign a nonce with Phantom and return the wallet + Base58 signature.
 *
 * Phantom's signMessage returns a Uint8Array signature. We Base58-encode it
 * so the packet matches what a Solana-native backend expects (Ed25519 in Base58).
 */
export async function signNonceWithPhantom(nonce) {
  const provider = window.solana;
  if (!provider || !provider.signMessage) {
    throw new Error("Phantom signMessage not available");
  }
  const messageBytes = new TextEncoder().encode(nonce);
  const signed = await provider.signMessage(messageBytes, "utf8");
  return {
    wallet: signed.publicKey.toString(),
    signature: base58Encode(signed.signature),
  };
}

/**
 * Generate a client-side nonce for the login challenge.
 * Format: "login-<timestamp>" (matches the PowerShot convention).
 */
export function generateNonce() {
  return "login-" + Date.now();
}

/**
 * Full Base44 login flow — pure transport-free version.
 * Returns { packet, wallet } so the caller can send it via base44Api.
 *
 * Steps: connect Phantom → sign nonce → build packet.
 */
export async function prepareBase44Login(customNonce) {
  const nonce = customNonce || generateNonce();
  const wallet = await connectPhantom();
  const { signature } = await signNonceWithPhantom(nonce);
  const packet = buildBase44Packet(wallet, signature, nonce);
  return { packet, wallet, nonce };
}