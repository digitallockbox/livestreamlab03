import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Badges — upgrade creator badge tier. Wallet-signed via wallet_token JWT
// (avoids cross-function verifyWalletSignature 403).

const TIERS = ['bronze', 'silver', 'gold', 'diamond'];

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
  return { ok: true, wallet_address: decoded.wallet };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const v = await verifyOwnership(base44, body);
    if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
    const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: v.wallet_address });
    if (!list[0]) return Response.json({ error: 'Profile not found' }, { status: 404 });
    const current = list[0].badge_tier || 'bronze';
    let next;
    if (body.tier && TIERS.includes(body.tier)) {
      next = body.tier;
    } else {
      const idx = TIERS.indexOf(current);
      next = TIERS[Math.min(idx + 1, TIERS.length - 1)];
    }
    const updated = await base44.asServiceRole.entities.Web3Profile.update(list[0].id, { badge_tier: next });
    return Response.json({ profile: updated, previous_tier: current, new_tier: next });
  } catch (error) {
    console.error('web3Badges error:', error?.message || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});