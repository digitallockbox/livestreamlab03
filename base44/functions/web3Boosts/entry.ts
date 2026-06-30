import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cryptographically prove the caller owns the wallet in the payload.
const verifyOwnership = async (base44, body, requiredWallet) => {
  try {
    const res = await base44.functions.invoke('verifyWalletSignature', {
      wallet_address: body.auth_wallet, message: body.auth_message, signature: body.auth_signature, chain: body.chain
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