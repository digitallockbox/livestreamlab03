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
    const action = body.action || 'list';

    if (action === 'send') {
      const viewerWallet = (body.viewerWallet || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      const amount = Number(body.amount) || 0;
      if (!viewerWallet || !creatorWallet || amount <= 0) {
        return Response.json({ error: 'viewerWallet, creatorWallet and a positive amount are required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, viewerWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      let boostGateBlocked = false;
      try {
        const gate = await base44.functions.invoke('checkTokenGate', { wallet: viewerWallet, requiredAmount: 5 });
        const gd = gate?.data || gate;
        if (gd?.allowed === false) boostGateBlocked = true;
      } catch (_e) { /* fail open — gate unavailable */ }
      if (boostGateBlocked) return Response.json({ error: 'Insufficient $STREAMING to boost (requires 5)' }, { status: 403 });
      const boost = await base44.asServiceRole.entities.Boost.create({
        viewer_wallet: viewerWallet,
        creator_wallet: creatorWallet,
        amount,
        stream_id: body.stream_id || '',
        message: body.message || ''
      });
      const transaction = await base44.asServiceRole.entities.Transaction.create({
        type: 'stream_tip',
        amount,
        streaming_amount: amount,
        description: `Boost from ${viewerWallet.slice(0, 6)}... to ${creatorWallet.slice(0, 6)}...`,
        status: 'completed',
        source: 'boost'
      });
      return Response.json({ boost, transaction });
    }

    if (action === 'list') {
      const wallet = (body.wallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const boosts = await base44.asServiceRole.entities.Boost.filter({ creator_wallet: wallet }, '-created_date', 50);
      const total = boosts.reduce((s, b) => s + (b.amount || 0), 0);
      return Response.json({ boosts, total, count: boosts.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});