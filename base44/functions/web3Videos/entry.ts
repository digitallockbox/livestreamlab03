import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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