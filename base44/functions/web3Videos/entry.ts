import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cryptographically prove the caller owns the wallet in the payload.
const verifyOwnership = async (base44, body, requiredWallet) => {
  try {
    const res = await base44.functions.invoke('verifyWalletSignature', {
      wallet_address: body.auth_wallet, message: body.auth_message, signature: body.auth_signature
    });
    const d = res?.data || res;
    if (!d?.valid) return { ok: false, status: 401, error: 'Wallet signature invalid' };
    if (requiredWallet && d.wallet_address !== requiredWallet) {
      return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
    }
    return { ok: true, wallet_address: d.wallet_address };
  } catch (e) {
    return { ok: false, status: 401, error: 'Wallet verification failed' };
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'list') {
      const q = body.creatorWallet ? { creator_wallet: body.creatorWallet } : {};
      const videos = await base44.asServiceRole.entities.Video.filter(q, '-created_date', 100);
      return Response.json({ videos });
    }

    if (action === 'get') {
      const video = await base44.asServiceRole.entities.Video.get(body.id);
      return Response.json({ video });
    }

    if (action === 'create') {
      if (!body.creatorWallet) return Response.json({ error: 'creatorWallet required' }, { status: 400 });
      const v = await verifyOwnership(base44, body, body.creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const video = await base44.asServiceRole.entities.Video.create({
        creator_wallet: body.creatorWallet,
        title: body.title,
        description: body.description || '',
        thumbnail_url: body.thumbnail_url || '',
        video_url: body.video_url || '',
        status: body.status || 'draft',
        is_premium: !!body.is_premium,
        unlock_price: Number(body.unlock_price) || 0
      });
      return Response.json({ video });
    }

    if (action === 'update') {
      const existing = await base44.asServiceRole.entities.Video.get(body.id);
      if (!existing) return Response.json({ error: 'Video not found' }, { status: 404 });
      const v = await verifyOwnership(base44, body, existing.creator_wallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const patch = {};
      for (const k of ['title', 'description', 'thumbnail_url', 'video_url', 'status']) {
        if (body[k] !== undefined) patch[k] = body[k];
      }
      if (body.is_premium !== undefined) patch.is_premium = !!body.is_premium;
      if (body.unlock_price !== undefined) patch.unlock_price = Number(body.unlock_price);
      const video = await base44.asServiceRole.entities.Video.update(body.id, patch);
      return Response.json({ video });
    }

    if (action === 'delete') {
      const existing = await base44.asServiceRole.entities.Video.get(body.id);
      if (!existing) return Response.json({ error: 'Video not found' }, { status: 404 });
      const v = await verifyOwnership(base44, body, existing.creator_wallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      await base44.asServiceRole.entities.Video.delete(body.id);
      return Response.json({ ok: true });
    }

    if (action === 'analytics') {
      const videos = await base44.asServiceRole.entities.Video.filter(
        { creator_wallet: body.creatorWallet }, '-created_date', 100
      );
      const totals = videos.reduce((a, v) => ({
        views: a.views + (v.views || 0),
        watch_time_hours: a.watch_time_hours + (v.watch_time_hours || 0),
        revenue: a.revenue + (v.revenue || 0),
        streaming_unlocks: a.streaming_unlocks + (v.streaming_unlocks || 0)
      }), { views: 0, watch_time_hours: 0, revenue: 0, streaming_unlocks: 0 });
      return Response.json({ totals, count: videos.length, videos });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('web3Videos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});