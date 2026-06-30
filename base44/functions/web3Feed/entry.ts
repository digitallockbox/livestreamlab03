import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Feed — create post (wallet-signed), get/view (open read).

const verifyOwnership = async (base44, body, requiredWallet) => {
  try {
    const res = await base44.functions.invoke('verifyWalletSignature', {
      wallet_address: body.auth_wallet, message: body.auth_message, signature: body.auth_signature, chain: body.chain
    });
    const d = res?.data || res;
    if (!d?.valid) return { ok: false, status: 401, error: 'Wallet signature invalid' };
    if (requiredWallet && d.wallet_address !== requiredWallet) return { ok: false, status: 403, error: 'Wallet not authorized' };
    return { ok: true, wallet_address: d.wallet_address };
  } catch (_e) {
    return { ok: false, status: 401, error: 'Wallet verification failed' };
  }
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