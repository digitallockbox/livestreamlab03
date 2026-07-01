// web3Login — Phantom wallet handshake (challenge → sign → verify → profile)
// Actions: challenge | verify | (legacy) login-by-address
// Crypto verification + nonce validation + JWT issuance are delegated to
// verifyWalletSignature — this function handles challenge issuance and
// Web3Profile provisioning only.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    // Step 1 — issue a single-use nonce challenge stored in the Nonce entity.
    // The raw nonce string IS the message the wallet signs; verifyWalletSignature
    // looks it up and consumes it, giving true replay protection.
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

    // Step 2 — verify the Ed25519 signature against the claimed wallet address.
    if (action === 'verify') {
      const { wallet_address, message, signature, chain } = body;
      if (!wallet_address || !message || !signature) {
        return Response.json({ error: 'wallet_address, message, signature required' }, { status: 400 });
      }
      const normalized = chain === 'evm' ? String(wallet_address).toLowerCase() : wallet_address;

      // Delegate signature verification + nonce validation + JWT issuance to
      // verifyWalletSignature — the single source of truth for wallet auth.
      const verifyRes = await base44.functions.invoke('verifyWalletSignature', {
        wallet_address: normalized,
        message,
        signature,
        chain,
      });
      const vData = verifyRes?.data || verifyRes;
      if (!vData?.valid || !vData?.token) {
        return Response.json({ error: vData?.error || 'Signature or nonce invalid' }, { status: 401 });
      }
      const token = vData.token;

      // Upsert the wallet's Web3Profile, marking it wallet-verified.
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