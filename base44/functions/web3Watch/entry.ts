import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'start';

    if (action === 'start') {
      const viewerWallet = (body.viewerWallet || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      if (!viewerWallet || !creatorWallet) {
        return Response.json({ error: 'viewerWallet and creatorWallet are required' }, { status: 400 });
      }
      const session = await base44.asServiceRole.entities.WatchSession.create({
        viewer_wallet: viewerWallet,
        creator_wallet: creatorWallet,
        stream_id: body.streamId || '',
        tokens_earned: 0,
        minutes_watched: 0,
        status: 'active'
      });
      return Response.json({ session });
    }

    if (action === 'tick') {
      const sessionId = (body.sessionId || '').trim();
      if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 });
      const session = await base44.asServiceRole.entities.WatchSession.get(sessionId);
      if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
      const minutes = (session.minutes_watched || 0) + 1;
      const tokens = (session.tokens_earned || 0) + 1;
      const updated = await base44.asServiceRole.entities.WatchSession.update(sessionId, {
        minutes_watched: minutes,
        tokens_earned: tokens
      });
      return Response.json({ session: updated });
    }

    if (action === 'end') {
      const sessionId = (body.sessionId || '').trim();
      if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.WatchSession.update(sessionId, { status: 'ended' });
      return Response.json({ session: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});