// web3Login — Phantom/MetaMask wallet handshake (challenge → sign → verify → profile).
// Actions: challenge | verify | (legacy) login-by-address.
//
// NOTE: Signature verification, nonce validation, and JWT issuance are inlined
// here rather than delegated to verifyWalletSignature via base44.functions.invoke,
// because backend functions cannot invoke other backend functions over HTTP in this
// environment (the platform rejects nested calls with 403 "Backend functions cannot
// be accessed from the platform domain"). verifyWalletSignature is kept as the
// standalone reference implementation.
import nacl from 'npm:tweetnacl@1.0.3';
import bs58 from 'npm:bs58@6.0.0';
import { ethers } from 'npm:ethers@6.13.4';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
    // The raw nonce string IS the message the wallet signs; it is looked up and
    // consumed during verify, giving true replay protection.
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
    // and upsert the Web3Profile. All inlined (no nested function calls).
    if (action === 'verify') {
      const { wallet_address, message, signature, chain } = body;
      if (!wallet_address || !message || !signature) {
        return Response.json({ error: 'wallet_address, message, signature required' }, { status: 400 });
      }
      const normalized = chain === 'evm' ? String(wallet_address).toLowerCase() : wallet_address;

      // 2a — cryptographic signature verification.
      let ok = false;
      try {
        ok = verifySig(normalized, message, signature, chain);
      } catch (e) {
        return Response.json(
          { error: 'decode/verify failed: ' + e.message },
          { status: 400 }
        );
      }
      if (!ok) return Response.json({ error: 'Invalid signature' }, { status: 401 });

      // 2b — replay protection via single-use nonce lookup + consume.
      const nonceRecords = await base44.asServiceRole.entities.Nonce.filter(
        { nonce: String(message), consumed: false },
        '-created_date',
        5
      );
      const record = nonceRecords && nonceRecords[0];
      if (!record) {
        return Response.json({ error: 'Nonce invalid or already used' }, { status: 401 });
      }
      if (new Date(record.expires_at).getTime() < Date.now()) {
        return Response.json({ error: 'Nonce expired' }, { status: 401 });
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
        return Response.json({ error: 'Server auth not configured' }, { status: 500 });
      }
      const token = await signJwt(
        { wallet: normalized, chain: chain || 'solana', sub: normalized },
        secret
      );

      // 2e — upsert the wallet's Web3Profile, marking it wallet-verified.
      const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: normalized });
      let profile = existing[0];
      if (!profile) {
        const short = normalized.slice(0, 6) + '...' + normalized.slice(-4);
        profile = await base44.asServiceRole.entities.Web3Profile.create({
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
      } else if (!profile.verified) {
        profile = await base44.asServiceRole.entities.Web3Profile.update(profile.id, {
          verified: true,
          verification_level: profile.verification_level === 'none' ? 'basic' : profile.verification_level,
        });
      }
      return Response.json({ authenticated: true, profile, token });
    }

    // Legacy: create/return a profile by address only (no signature) — backward compat.
    const wallet_address = (body.wallet_address || '').trim();
    if (!wallet_address) return Response.json({ error: 'wallet_address required' }, { status: 400 });
    const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address });
    let profile = existing[0];
    if (!profile) {
      const short = wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4);
      profile = await base44.asServiceRole.entities.Web3Profile.create({
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
    return Response.json({ profile });
  } catch (error) {
    console.error('web3Login error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});