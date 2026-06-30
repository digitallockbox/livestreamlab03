import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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