import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cryptographically prove the caller owns the wallet in the payload.
const verifyOwnership = async (base44, body, requiredWallet) => {
  if (!body.wallet_token) return { ok: false, status: 401, error: 'wallet_token required' };
  try {
    const res = await base44.functions.invoke('getAuthContext', { token: body.wallet_token });
    const d = res?.data || res;
    if (!d?.authenticated) return { ok: false, status: 401, error: 'Wallet token invalid or expired' };
    if (requiredWallet && d.wallet !== requiredWallet) {
      return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
    }
    return { ok: true, wallet_address: d.wallet, userId: d.userId || null };
  } catch (e) {
    return { ok: false, status: 401, error: 'Wallet token verification failed' };
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'start') {
      const { creatorWallet, title, category, description } = body;
      if (!creatorWallet || !title) {
        return Response.json({ error: 'creatorWallet and title required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const streamKey = crypto.randomUUID();
      const stream = await base44.asServiceRole.entities.Stream.create({
        title,
        creator_wallet: creatorWallet,
        category: category || 'other',
        description: description || '',
        status: 'live',
        stream_key: streamKey,
        viewer_count: 0,
        peak_viewers: 0,
        tips_earned: 0,
        duration_minutes: 0
      });
      return Response.json({
        id: stream.id,
        rtmpUrl: 'rtmp://ingest.livestreamlab.live/live',
        streamKey
      });
    }

    if (action === 'live') {
      const streams = await base44.asServiceRole.entities.Stream.filter(
        { status: 'live' }, '-created_date', 100
      );
      return Response.json({ streams });
    }

    if (action === 'past') {
      const query = { status: 'ended' };
      if (body.creatorWallet) query.creator_wallet = body.creatorWallet;
      const streams = await base44.asServiceRole.entities.Stream.filter(
        query, '-updated_date', 100
      );
      return Response.json({ streams });
    }

    if (action === 'end') {
      const { streamId } = body;
      if (!streamId) return Response.json({ error: 'streamId required' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.Stream.get(streamId);
      if (!existing) return Response.json({ error: 'Stream not found' }, { status: 404 });
      const v = await verifyOwnership(base44, body, existing.creator_wallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const started = new Date(existing.created_date).getTime();
      const minutes = Math.max(1, Math.round((Date.now() - started) / 60000));
      const updated = await base44.asServiceRole.entities.Stream.update(streamId, {
        status: 'ended',
        duration_minutes: minutes
      });
      return Response.json({ stream: updated });
    }

    if (action === 'analytics') {
      const { streamId } = body;
      if (!streamId) return Response.json({ error: 'streamId required' }, { status: 400 });
      const stream = await base44.asServiceRole.entities.Stream.get(streamId);

      const sessions = await base44.asServiceRole.entities.WatchSession.filter(
        { stream_id: streamId }, '-created_date', 500
      );
      const watchMinutes = sessions.reduce((a, s) => a + (s.minutes_watched || 0), 0);
      const totalViewers = sessions.length;
      const concurrentPeak = stream?.peak_viewers || 0;

      const boosts = await base44.asServiceRole.entities.Boost.filter(
        { stream_id: streamId }, '-created_date', 500
      );
      const boostsCount = boosts.length;
      const streamingEarned =
        boosts.reduce((a, b) => a + (b.amount || 0), 0) + (stream?.tips_earned || 0);

      let subsCount = 0;
      if (stream?.creator_wallet) {
        const subs = await base44.asServiceRole.entities.Subscription.filter(
          { creator_wallet: stream.creator_wallet, status: 'active' }, '-created_date', 500
        );
        subsCount = subs.length;
      }

      return Response.json({
        stream,
        concurrentPeak,
        totalViewers,
        watchMinutes,
        streamingEarned,
        boostsCount,
        subsCount
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});