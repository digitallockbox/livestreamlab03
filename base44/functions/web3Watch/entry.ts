import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// Streak reward: consecutive-day watchers earn an extra $STREAMING bonus on claim.
// Bonus kicks in at a 3-day streak: bonus = min(streak * 2, 50) tokens.
const STREAK_THRESHOLD = 3;
const STREAK_BONUS_CAP = 50;
const computeStreakBonus = (streak) =>
  streak >= STREAK_THRESHOLD ? Math.min(streak * 2, STREAK_BONUS_CAP) : 0;

// Record that a viewer watched today (UTC). Updates/creates their ViewerStreak.
// Returns the current streak record.
const recordDailyWatch = async (base44, viewerWallet) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const existing = await base44.asServiceRole.entities.ViewerStreak
    .filter({ viewer_wallet: viewerWallet }, '-created_date', 1)
    .catch(() => []);
  const prev = existing[0];
  if (!prev) {
    return base44.asServiceRole.entities.ViewerStreak.create({
      viewer_wallet: viewerWallet,
      current_streak: 1,
      longest_streak: 1,
      last_watch_date: today,
      total_days_watched: 1
    });
  }
  if (prev.last_watch_date === today) return prev; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const continued = prev.last_watch_date === yesterday;
  const current = continued ? (prev.current_streak || 0) + 1 : 1;
  const longest = Math.max(prev.longest_streak || 0, current);
  return base44.asServiceRole.entities.ViewerStreak.update(prev.id, {
    current_streak: current,
    longest_streak: longest,
    last_watch_date: today,
    total_days_watched: (prev.total_days_watched || 0) + 1
  });
};

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
      // Mark today as a watched day so the streak grows for consecutive-day viewers.
      let streak = null;
      try { streak = await recordDailyWatch(base44, viewerWallet); } catch (_e) { /* fail open */ }
      return Response.json({ session, streak });
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
      const baseEarned = sessions.reduce((s, x) => s + (x.tokens_earned || 0), 0);
      if (baseEarned <= 0) return Response.json({ error: 'No tokens available to claim' }, { status: 400 });
      // Streak reward: consecutive-day viewers get an extra bonus on claim.
      let streakInfo = null;
      let streakBonus = 0;
      try {
        const existing = await base44.asServiceRole.entities.ViewerStreak.filter(
          { viewer_wallet: viewerWallet }, '-created_date', 1
        );
        streakInfo = existing[0] || null;
        streakBonus = computeStreakBonus(streakInfo?.current_streak || 0);
      } catch (_e) { /* fail open */ }
      const totalEarned = baseEarned + streakBonus;
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
      return Response.json({
        claimed: totalEarned,
        base_earned: baseEarned,
        streak_bonus: streakBonus,
        streak: streakInfo ? streakInfo.current_streak : 0,
        longest_streak: streakInfo ? streakInfo.longest_streak : 0,
        settlement: settle
      });
    }

    if (action === 'streak') {
      const wallet = (body.wallet || body.viewerWallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.ViewerStreak.filter(
        { viewer_wallet: wallet }, '-created_date', 1
      );
      const streak = existing[0] || null;
      if (!streak) return Response.json({ streak: { current_streak: 0, longest_streak: 0, total_days_watched: 0 } });
      return Response.json({ streak });
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