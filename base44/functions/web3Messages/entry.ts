import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Messages — send (wallet-signed), inbox (open read).

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