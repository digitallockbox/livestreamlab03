// issueNonce — generates a single-use cryptographic challenge for wallet login.
// The nonce is stored in the Nonce entity with a 5-minute TTL and consumed by
// verifyWalletSignature after a valid signature is produced. This replaces
// the timestamp-only replay protection with a true single-use nonce.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let wallet_address = null;
    try {
      const body = await req.json().catch(() => ({}));
      wallet_address = body.wallet_address || null;
    } catch {}

    // 32 random bytes → hex string. Cryptographically secure.
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await base44.asServiceRole.entities.Nonce.create({
      nonce,
      wallet_address: wallet_address || undefined,
      expires_at,
      consumed: false,
    });

    return Response.json({ nonce, expires_at });
  } catch (error) {
    console.error('issueNonce error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});