// linkWallet — merges a wallet-native identity with a Base44 Web2 account.
// Requires both a valid wallet_token (proves wallet ownership) AND a Base44
// session (auth.me() — proves the Web2 account). Creates/updates a
// WalletIdentity record linking wallet_address → user_id so future
// getAuthContext calls resolve both identities together.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { wallet_token } = body;
    if (!wallet_token) {
      return Response.json({ error: 'wallet_token required' }, { status: 400 });
    }

    // Resolve the wallet from the wallet-native JWT.
    const ctxRes = await base44.functions.invoke('getAuthContext', { token: wallet_token });
    const ctx = ctxRes?.data || ctxRes;
    if (!ctx?.authenticated) {
      return Response.json({ error: 'Invalid or expired wallet token' }, { status: 401 });
    }

    // Require a Base44 Web2 session to merge with.
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (!user) {
      return Response.json({ error: 'Must be logged in with a Web2 account to link wallet' }, { status: 401 });
    }

    // Upsert the WalletIdentity link.
    const existing = await base44.asServiceRole.entities.WalletIdentity.filter(
      { wallet_address: ctx.wallet }, '-created_date', 1
    );
    if (existing && existing[0]) {
      await base44.asServiceRole.entities.WalletIdentity.update(existing[0].id, {
        user_id: user.id,
        merged_at: new Date().toISOString(),
      });
    } else {
      await base44.asServiceRole.entities.WalletIdentity.create({
        wallet_address: ctx.wallet,
        chain: ctx.chain || 'solana',
        user_id: user.id,
        merged_at: new Date().toISOString(),
      });
    }

    return Response.json({ ok: true, wallet: ctx.wallet, userId: user.id, merged: true });
  } catch (error) {
    console.error('linkWallet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});