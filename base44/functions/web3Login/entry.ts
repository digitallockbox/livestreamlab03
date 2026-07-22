// web3Login — Phantom/MetaMask wallet handshake (challenge → sign → verify → identity).
//
// Response contract (sane, string-safe — never returns a raw object the frontend
// could render into JSX):
//   • challenge → { nonce, message }
//   • verify   → { identity: <Web3Profile>, session: <JWT> }   on success
//   • any error → { error: { message: "..." } }               with the right status
//
// `identity` is the creator's Web3Profile (the app stores it as the active session
// state — onboarding_completed, bound_domain, display_name, etc.). `session` is
// the wallet-native JWT the engine/proxy layer uses for authenticated calls.
//
// NOTE: Signature verification, nonce validation, and JWT issuance are inlined
// here rather than delegated to verifyWalletSignature via base44.functions.invoke,
// because backend functions cannot invoke other backend functions over HTTP in
// this environment. verifyWalletSignature is kept as the standalone reference.
import nacl from 'npm:tweetnacl@1.0.3';
import bs58 from 'npm:bs58@6.0.0';
import { ethers } from 'npm:ethers@6.13.4';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TOKEN_TTL_SEC = 24 * 60 * 60; // 24 hours

// String-safe error envelope. Always { error: { message: <string> } }.
const errorResponse = (message, status) =>
  Response.json({ error: { message: String(message || 'Unknown error') } }, { status });

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

// Verify the Ed25519 (Solana) or personal_sign (EVM) signature against the claimed wallet.
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
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    // Step 1 — issue a single-use nonce challenge stored in the Nonce entity.
    if (action === 'challenge') {
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      await base44.asServiceRole.entities.Nonce.create({
        nonce,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        consumed: false,
      });
      return Response.json({ nonce, message: nonce });
    }

    // Step 2 — verify the signature, consume the nonce, issue a wallet-native JWT,
    // and upsert the Web3Profile. Returns { identity, session }.
    if (action === 'verify') {
      const { wallet_address, message, signature, chain } = body;
      if (!wallet_address || !message || !signature) {
        return errorResponse('wallet_address, message, signature required', 400);
      }
      const normalized = chain === 'evm' ? String(wallet_address).toLowerCase() : wallet_address;

      // 2a — cryptographic signature verification.
      let ok = false;
      try {
        ok = verifySig(normalized, message, signature, chain);
      } catch (e) {
        return errorResponse('decode/verify failed: ' + e.message, 400);
      }
      if (!ok) return errorResponse('Invalid signature', 401);

      // 2b — replay protection via single-use nonce lookup + consume.
      const nonceRecords = await base44.asServiceRole.entities.Nonce.filter(
        { nonce: String(message), consumed: false },
        '-created_date',
        5
      );
      const record = nonceRecords && nonceRecords[0];
      if (!record) {
        return errorResponse('Nonce invalid or already used', 401);
      }
      if (new Date(record.expires_at).getTime() < Date.now()) {
        return errorResponse('Nonce expired', 401);
      }
      await base44.asServiceRole.entities.Nonce.update(record.id, { consumed: true });

      // 2c — ensure / upsert a WalletIdentity record for identity merging.
      try {
        const existing = await base44.asServiceRole.entities.WalletIdentity.filter(
          { wallet_address: normalized },
          '-created_date',
          1
        );
        if (!existing || !existing[0]) {
          await base44.asServiceRole.entities.WalletIdentity.create({
            wallet_address: normalized,
            chain: chain || 'solana',
            merged_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('web3Login: WalletIdentity upsert skipped:', e?.message);
      }

      // 2d — issue a wallet-native JWT (CREATOR_JWT_SECRET).
      const secret = Deno.env.get('CREATOR_JWT_SECRET');
      if (!secret) {
        console.error('web3Login: CREATOR_JWT_SECRET not set');
        return errorResponse('Server auth not configured', 500);
      }
      const session = await signJwt(
        { wallet: normalized, chain: chain || 'solana', sub: normalized },
        secret
      );

      // 2e — upsert the wallet's Web3Profile (this IS the `identity`).
      const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: normalized });
      let identity = existing[0];
      if (!identity) {
        const short = normalized.slice(0, 6) + '...' + normalized.slice(-4);
        identity = await base44.asServiceRole.entities.Web3Profile.create({
          wallet_address: normalized,
          display_name: short,
          avatar_url: '',
          bio: '',
          verified: true,
          verification_level: 'basic',
          badge_tier: 'bronze',
          followers: 0,
          following: 0,
          social_graph: [],
        });
      } else if (!identity.verified) {
        identity = await base44.asServiceRole.entities.Web3Profile.update(identity.id, {
          verified: true,
          verification_level: identity.verification_level === 'none' ? 'basic' : identity.verification_level,
        });
      }

      // Always return { identity, session }. No `error` key on success.
      return Response.json({ identity, session });
    }

    // Legacy: create/return a profile by address only (no signature) — backward compat.
    const wallet_address = (body.wallet_address || '').trim();
    if (!wallet_address) return errorResponse('wallet_address required', 400);
    const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address });
    let identity = existing[0];
    if (!identity) {
      const short = wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4);
      identity = await base44.asServiceRole.entities.Web3Profile.create({
        wallet_address,
        display_name: short,
        avatar_url: '',
        bio: '',
        verified: false,
        verification_level: 'none',
        badge_tier: 'bronze',
        followers: 0,
        following: 0,
        social_graph: [],
      });
    }
    return Response.json({ identity });
  } catch (error) {
    console.error('web3Login error:', error);
    return errorResponse(error.message, 500);
  }
});