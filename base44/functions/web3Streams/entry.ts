import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// Cryptographically prove the caller owns the wallet in the payload.
const verifyOwnership = async (base44, body, requiredWallet) => {
  if (!body.wallet_token) return { ok: false, status: 401, error: 'wallet_token required' };
  const secret = Deno.env.get('CREATOR_JWT_SECRET');
  if (!secret) return { ok: false, status: 503, error: 'Auth not configured' };
  let decoded;
  try { decoded = jwt.verify(body.wallet_token, secret); } catch (_e) {
    return { ok: false, status: 401, error: 'Wallet token invalid or expired' };
  }
  if (!decoded?.wallet) return { ok: false, status: 401, error: 'Wallet token invalid' };
  if (requiredWallet && decoded.wallet !== requiredWallet) {
    return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
  }
  let userId = decoded.userId || null;
  if (!userId) {
    try {
      const links = await base44.asServiceRole.entities.WalletIdentity.filter({ wallet_address: decoded.wallet }, '-created_date', 1);
      if (links && links[0]?.user_id) userId = links[0].user_id;
    } catch (_e) { /* non-fatal */ }
  }
  return { ok: true, wallet_address: decoded.wallet, userId };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'start') {
      const { creatorWallet, title, category, description, thumbnail_url } = body;
      if (!creatorWallet || !title) {
        return Response.json({ error: 'creatorWallet and title required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      let streamGateBlocked = false;
      try {
        const gate = await base44.functions.invoke('checkTokenGate', { wallet: creatorWallet, requiredAmount: 100 });
        const gd = gate?.data || gate;
        if (gd?.allowed === false) streamGateBlocked = true;
      } catch (_e) { /* fail open — gate unavailable */ }
      if (streamGateBlocked) return Response.json({ error: 'Insufficient $STREAMING to start a stream (requires 100)' }, { status: 403 });
      const streamKey = crypto.randomUUID();
      const stream = await base44.asServiceRole.entities.Stream.create({
        title,
        creator_wallet: creatorWallet,
        category: category || 'other',
        description: description || '',
        thumbnail_url: thumbnail_url || '',
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