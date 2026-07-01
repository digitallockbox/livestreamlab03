import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Social — follow/unfollow (wallet-signed) + social graph (open read).

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
    const action = body.action || 'graph';

    if (action === 'follow' || action === 'unfollow') {
      const followerWallet = (body.followerWallet || '').trim();
      const creatorWallet = (body.creatorWallet || '').trim();
      if (!followerWallet || !creatorWallet) {
        return Response.json({ error: 'followerWallet and creatorWallet are required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, followerWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

      const followerList = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: followerWallet });
      const follower = followerList[0];
      if (follower) {
        const graph = follower.social_graph || [];
        if (action === 'follow') {
          if (!graph.includes(creatorWallet)) {
            await base44.asServiceRole.entities.Web3Profile.update(follower.id, {
              social_graph: [...graph, creatorWallet],
              following: (follower.following || 0) + 1
            });
          }
        } else {
          if (graph.includes(creatorWallet)) {
            await base44.asServiceRole.entities.Web3Profile.update(follower.id, {
              social_graph: graph.filter((w) => w !== creatorWallet),
              following: Math.max((follower.following || 0) - 1, 0)
            });
          }
        }
      }

      const creatorList = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: creatorWallet });
      const creator = creatorList[0];
      if (creator) {
        const delta = action === 'follow' ? 1 : -1;
        await base44.asServiceRole.entities.Web3Profile.update(creator.id, {
          followers: Math.max((creator.followers || 0) + delta, 0)
        });
      }

      return Response.json({ following: action === 'follow' });
    }

    if (action === 'graph') {
      const wallet = (body.wallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: wallet });
      const profile = list[0];
      return Response.json({
        following: profile?.social_graph || [],
        following_count: profile?.following || 0,
        followers_count: profile?.followers || 0
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});