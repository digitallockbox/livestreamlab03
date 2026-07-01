// verifyWalletSignature — pure crypto check that a Phantom Ed25519 (or EVM
// personal_sign) signature was produced by the claimed wallet over the supplied
// message, PLUS issuance of a wallet-native JWT auth token.
//
// Stateless replay protection via an embedded `ts:<ms>` timestamp in the message.
// No Base44 session / auth.me() dependency — the wallet IS the identity.
import nacl from 'npm:tweetnacl@1.0.3';
import bs58 from 'npm:bs58@6.0.0';
import { ethers } from 'npm:ethers@6.13.4';

const FIVE_MIN = 5 * 60 * 1000;
const TOKEN_TTL_SEC = 24 * 60 * 60; // 24 hours

// Base64url (no padding) encoder for JWT segments.
const b64url = (str) =>
  btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const b64urlBytes = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

// HS256 JWT signed with Web Crypto SubtleCrypto (no external dep).
async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + TOKEN_TTL_SEC };
  const enc = new TextEncoder();
  const headerSeg = b64url(JSON.stringify(header));
  const payloadSeg = b64url(JSON.stringify(fullPayload));
  const signingInput = `${headerSeg}.${payloadSeg}`;
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  const sigSeg = b64urlBytes(new Uint8Array(sigBuf));
  return `${signingInput}.${sigSeg}`;
}

// Verify the Ed25519 / EVM signature against the claimed wallet.
function verifySig(wallet_address, message, signature, chain) {
  if (chain === 'evm') {
    const recovered = ethers.verifyMessage(String(message), String(signature));
    return recovered.toLowerCase() === String(wallet_address).toLowerCase();
  }
  const msgBytes = new TextEncoder().encode(String(message));
  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  const pubKeyBytes = bs58.decode(wallet_address);
  return nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { wallet_address, message, signature, chain } = body;
    if (!wallet_address || !message || !signature) {
      return Response.json(
        { valid: false, error: 'wallet_address, message, signature required' },
        { status: 400 }
      );
    }

    // Step 1 — cryptographic signature verification (no session required).
    let ok = false;
    try {
      ok = verifySig(wallet_address, message, signature, chain);
    } catch (e) {
      return Response.json(
        { valid: false, error: 'decode/verify failed: ' + e.message },
        { status: 400 }
      );
    }
    if (!ok) return Response.json({ valid: false }, { status: 401 });

    // Step 2 — replay protection: timestamp embedded in the signed message.
    const tsMatch = String(message).match(/ts:(\d+)/) || String(message).match(/Timestamp: (\d+)/);
    if (tsMatch && Math.abs(Date.now() - Number(tsMatch[1])) > FIVE_MIN) {
      return Response.json({ valid: false, error: 'signature expired' }, { status: 401 });
    }

    // Step 3 — issue a wallet-native JWT. The wallet address is the identity.
    const normalized = chain === 'evm'
      ? String(wallet_address).toLowerCase()
      : wallet_address;
    const secret = Deno.env.get('CREATOR_JWT_SECRET');
    if (!secret) {
      console.error('verifyWalletSignature: CREATOR_JWT_SECRET not set');
      return Response.json({ valid: false, error: 'Server auth not configured' }, { status: 500 });
    }
    const token = await signJwt(
      { wallet: normalized, chain: chain || 'solana', sub: normalized },
      secret
    );

    return Response.json({ valid: true, wallet_address: normalized, token });
  } catch (error) {
    console.error('verifyWalletSignature error:', error);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});