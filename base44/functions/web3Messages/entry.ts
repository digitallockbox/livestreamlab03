import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Messages — send (wallet-signed), inbox (open read).

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
    const action = body.action || 'inbox';

    if (action === 'send') {
      const senderWallet = (body.senderWallet || '').trim();
      const recipientWallet = (body.recipientWallet || '').trim();
      const content = (body.content || '').trim();
      if (!senderWallet || !recipientWallet || !content) {
        return Response.json({ error: 'senderWallet, recipientWallet and content are required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, senderWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
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