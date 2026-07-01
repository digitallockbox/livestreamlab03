import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Profile — wallet-owned creator profile reads/updates.
// Wallet-only creators have no Base44 session, so auth is via wallet signature,
// and profiles are looked up by wallet_address (not created_by_id).

const EDITABLE = ['display_name', 'avatar_url', 'banner_url', 'bio', 'ens_name', 'twitch_username', 'twitter_handle'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'me';

    const byWallet = async (wallet) => {
      if (!wallet) return null;
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: String(wallet).trim() });
      return list[0] || null;
    };

    // Public profile read (by wallet address).
    if (action === 'me' || action === 'get') {
      const wallet = body.wallet_address || '';
      return Response.json({ profile: await byWallet(wallet) });
    }

    // Wallet-signed profile update.
    if (action === 'update') {
      if (!body.wallet_token) return Response.json({ error: 'wallet_token required' }, { status: 401 });
      const ctxRes = await base44.functions.invoke('getAuthContext', { token: body.wallet_token });
      const ctx = ctxRes?.data || ctxRes;
      if (!ctx?.authenticated) return Response.json({ error: 'Wallet token invalid or expired' }, { status: 401 });
      const profile = await byWallet(ctx.wallet);
      if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
      const patch = {};
      for (const k of EDITABLE) if (body[k] !== undefined) patch[k] = body[k];
      const updated = await base44.asServiceRole.entities.Web3Profile.update(profile.id, patch);
      return Response.json({ profile: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('web3Profile error:', error?.message || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});