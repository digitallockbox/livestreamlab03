import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_PRICES = { basic: 4.99, plus: 9.99, premium: 19.99 };

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
    const action = body.action || 'list';

    if (action === 'subscribe') {
      const subscriberWallet = (body.subscriberWallet || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      const tier = body.tier || 'basic';
      if (!subscriberWallet || !creatorWallet) {
        return Response.json({ error: 'subscriberWallet and creatorWallet are required' }, { status: 400 });
      }
      if (!TIER_PRICES[tier]) {
        return Response.json({ error: 'Invalid tier' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, subscriberWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const TIER_GATE = { basic: 10, plus: 50, premium: 100 };
      let subGateBlocked = false;
      try {
        const gate = await base44.functions.invoke('checkTokenGate', { wallet: subscriberWallet, requiredAmount: TIER_GATE[tier] || 10 });
        const gd = gate?.data || gate;
        if (gd?.allowed === false) subGateBlocked = true;
      } catch (_e) { /* fail open — gate unavailable */ }
      if (subGateBlocked) return Response.json({ error: 'Insufficient $STREAMING for ' + tier + ' subscription (requires ' + (TIER_GATE[tier] || 10) + ')' }, { status: 403 });
      const price = TIER_PRICES[tier];
      const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const subscription = await base44.asServiceRole.entities.Subscription.create({
        subscriber_wallet: subscriberWallet,
        creator_wallet: creatorWallet,
        tier,
        price_monthly: price,
        status: 'active',
        renews_at: renewsAt
      });
      const transaction = await base44.asServiceRole.entities.Transaction.create({
        type: 'subscription',
        amount: price,
        streaming_amount: 0,
        description: `${tier} subscription to ${creatorWallet.slice(0, 6)}...`,
        status: 'completed',
        source: 'subscription'
      });
      return Response.json({ subscription, transaction });
    }

    if (action === 'list') {
      const wallet = (body.wallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const subscribers = await base44.asServiceRole.entities.Subscription.filter(
        { creator_wallet: wallet, status: 'active' },
        '-created_date',
        50
      );
      const mrr = subscribers.reduce((s, sub) => s + (sub.price_monthly || 0), 0);
      return Response.json({ subscribers, count: subscribers.length, mrr });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});