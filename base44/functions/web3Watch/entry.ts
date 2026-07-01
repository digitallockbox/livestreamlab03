import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'start';

    if (action === 'start') {
      const viewerWallet = (body.viewerWallet || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      if (!viewerWallet || !creatorWallet) {
        return Response.json({ error: 'viewerWallet and creatorWallet are required' }, { status: 400 });
      }
      let watchGateBlocked = false;
      try {
        const gate = await base44.functions.invoke('checkTokenGate', { wallet: viewerWallet, requiredAmount: 1 });
        const gd = gate?.data || gate;
        if (gd?.allowed === false) watchGateBlocked = true;
      } catch (_e) { /* fail open — gate unavailable */ }
      if (watchGateBlocked) return Response.json({ error: 'Insufficient $STREAMING to watch (requires 1)' }, { status: 403 });
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

    if (action === 'claim') {
      if (!body.wallet_token) return Response.json({ error: 'wallet_token required' }, { status: 400 });
      const viewerWallet = (body.viewerWallet || '').trim();
      if (!viewerWallet) return Response.json({ error: 'viewerWallet required' }, { status: 400 });
      // Inline JWT verification (avoids cross-function getAuthContext 403).
      const secret = Deno.env.get('CREATOR_JWT_SECRET');
      if (!secret) return Response.json({ error: 'Auth not configured' }, { status: 503 });
      let decoded;
      try { decoded = jwt.verify(body.wallet_token, secret); } catch (_e) {
        return Response.json({ error: 'Invalid or expired wallet token' }, { status: 401 });
      }
      if (!decoded?.wallet || decoded.wallet !== viewerWallet) {
        return Response.json({ error: 'Wallet not authorized' }, { status: 403 });
      }
      // End any active session so current earnings become claimable instantly.
      const active = await base44.asServiceRole.entities.WatchSession.filter(
        { viewer_wallet: viewerWallet, status: 'active' }, '-created_date', 50
      );
      for (const s of active) {
        await base44.asServiceRole.entities.WatchSession.update(s.id, { status: 'ended' });
      }
      const sessions = await base44.asServiceRole.entities.WatchSession.filter(
        { viewer_wallet: viewerWallet, status: 'ended' }, '-created_date', 100
      );
      const totalEarned = sessions.reduce((s, x) => s + (x.tokens_earned || 0), 0);
      if (totalEarned <= 0) return Response.json({ error: 'No tokens available to claim' }, { status: 400 });
      let settle;
      try {
        const settleRes = await base44.functions.invoke('buildSettlementTx', {
          wallet_token: body.wallet_token,
          recipientWallet: viewerWallet,
          amount: totalEarned,
          type: 'watch_to_earn',
        });
        settle = settleRes?.data || settleRes;
      } catch (e) {
        return Response.json({ error: 'Settlement service unavailable: ' + (e?.message || 'unknown') }, { status: 503 });
      }
      // Clear claimed sessions to prevent double-claiming.
      for (const s of sessions) {
        await base44.asServiceRole.entities.WatchSession.delete(s.id);
      }
      return Response.json({ claimed: totalEarned, settlement: settle });
    }

    if (action === 'leaderboard') {
      // Aggregate top earners across active watch sessions for a given stream.
      const streamId = (body.streamId || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      const filter = { status: 'active' };
      if (streamId) filter.stream_id = streamId;
      if (creatorWallet) filter.creator_wallet = creatorWallet;
      const sessions = await base44.asServiceRole.entities.WatchSession.filter(filter, '-tokens_earned', 100);
      // Merge by viewer wallet (a viewer may have one active session; sum defensively).
      const byWallet = new Map();
      for (const s of sessions) {
        const w = s.viewer_wallet;
        if (!w) continue;
        const prev = byWallet.get(w) || { viewer_wallet: w, tokens_earned: 0, minutes_watched: 0 };
        prev.tokens_earned += (s.tokens_earned || 0);
        prev.minutes_watched += (s.minutes_watched || 0);
        byWallet.set(w, prev);
      }
      const leaders = Array.from(byWallet.values())
        .sort((a, b) => (b.tokens_earned || 0) - (a.tokens_earned || 0))
        .slice(0, 10);
      return Response.json({ leaders, generated_at: Date.now() });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});