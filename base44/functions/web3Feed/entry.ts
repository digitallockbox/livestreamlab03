import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Feed — create post (wallet-signed), get/view (open read).

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
    const action = body.action || 'get';

    if (action === 'create') {
      const authorWallet = (body.authorWallet || '').trim();
      const content = (body.content || '').trim();
      if (!authorWallet || !content) {
        return Response.json({ error: 'authorWallet and content are required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, authorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const post = await base44.asServiceRole.entities.Post.create({
        author_wallet: authorWallet,
        content,
        media_url: body.mediaUrl || ''
      });
      return Response.json({ post });
    }

    if (action === 'get') {
      const wallet = (body.wallet || '').trim();
      const query = wallet ? { author_wallet: wallet } : {};
      const posts = await base44.asServiceRole.entities.Post.filter(query, '-created_date', 50);
      return Response.json({ posts, count: posts.length });
    }

    if (action === 'view') {
      const postId = (body.postId || '').trim();
      if (!postId) return Response.json({ error: 'postId required' }, { status: 400 });
      const post = await base44.asServiceRole.entities.Post.get(postId);
      return Response.json({ post });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});