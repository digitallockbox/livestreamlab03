import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'inbox';

    if (action === 'send') {
      const senderWallet = (body.senderWallet || '').trim();
      const recipientWallet = (body.recipientWallet || '').trim();
      const content = (body.content || '').trim();
      if (!senderWallet || !recipientWallet || !content) {
        return Response.json({ error: 'senderWallet, recipientWallet and content are required' }, { status: 400 });
      }
      const message = await base44.asServiceRole.entities.Message.create({
        sender_wallet: senderWallet,
        recipient_wallet: recipientWallet,
        content
      });
      return Response.json({ message });
    }

    if (action === 'inbox') {
      const wallet = (body.wallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const messages = await base44.asServiceRole.entities.Message.filter(
        { recipient_wallet: wallet },
        '-created_date',
        50
      );
      return Response.json({ messages, count: messages.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});