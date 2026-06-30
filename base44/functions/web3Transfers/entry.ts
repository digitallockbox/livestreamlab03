import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'record') {
      const { sender, recipient, amount, signature } = body;
      if (!sender || !recipient || !amount) {
        return Response.json({ error: 'sender, recipient and amount required' }, { status: 400 });
      }
      const tx = await base44.asServiceRole.entities.Transaction.create({
        type: 'transfer',
        sender_wallet: sender,
        recipient_wallet: recipient,
        amount: Number(amount),
        streaming_amount: Number(amount),
        description: 'STREAMING transfer',
        status: 'completed',
        source: signature || 'on-chain'
      });
      return Response.json({ transfer: tx });
    }

    if (action === 'list') {
      const { wallet } = body;
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const all = await base44.asServiceRole.entities.Transaction.filter(
        { type: 'transfer' }, '-created_date', 100
      );
      const transfers = all.filter(
        (t) => t.sender_wallet === wallet || t.recipient_wallet === wallet
      );
      return Response.json({ transfers });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});