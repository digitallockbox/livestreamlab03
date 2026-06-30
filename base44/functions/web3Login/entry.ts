// web3Login — Phantom wallet handshake (challenge → sign → verify → profile)
// Actions: challenge | verify | (legacy) login-by-address
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import nacl from 'npm:tweetnacl@1.0.3';
import bs58 from 'npm:bs58@6.0.0';

const FIVE_MIN = 5 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    // Step 1 — issue a challenge the wallet must sign.
    if (action === 'challenge') {
      const nonce = crypto.randomUUID();
      const timestamp = Date.now();
      const message = `Sign in to LiveStreamLab\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      return Response.json({ nonce, timestamp, message });
    }

    // Step 2 — verify the Ed25519 signature against the claimed wallet address.
    if (action === 'verify') {
      const { wallet_address, message, signature } = body;
      if (!wallet_address || !message || !signature) {
        return Response.json({ error: 'wallet_address, message, signature required' }, { status: 400 });
      }

      let ok = false;
      try {
        const msgBytes = new TextEncoder().encode(message);
        const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
        const pubKeyBytes = bs58.decode(wallet_address);
        ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
      } catch (e) {
        return Response.json({ error: 'Signature verification failed: ' + e.message }, { status: 400 });
      }
      if (!ok) return Response.json({ error: 'Invalid signature' }, { status: 401 });

      // Replay protection: timestamp embedded in the signed message must be recent.
      const tsMatch = String(message).match(/Timestamp: (\d+)/);
      if (!tsMatch) return Response.json({ error: 'Missing timestamp' }, { status: 400 });
      if (Math.abs(Date.now() - Number(tsMatch[1])) > FIVE_MIN) {
        return Response.json({ error: 'Nonce expired' }, { status: 401 });
      }

      // Upsert the wallet's Web3Profile, marking it wallet-verified.
      const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address });
      let profile = existing[0];
      if (!profile) {
        const short = wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4);
        profile = await base44.asServiceRole.entities.Web3Profile.create({
          wallet_address,
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
      return Response.json({ authenticated: true, profile });
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