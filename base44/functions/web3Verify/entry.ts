import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Verify — mint verification level. Wallet-signed via wallet_token JWT
// (avoids cross-function verifyWalletSignature 403). The wallet_token is issued
// at login after signature verification, so it already proves wallet ownership.

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
    const v = await verifyOwnership(base44, body, body.wallet_address);
    if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
    const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: v.wallet_address });
    if (!list[0]) return Response.json({ error: 'Profile not found' }, { status: 404 });
    const level = body.level === 'full' ? 'full' : 'basic';
    const updated = await base44.asServiceRole.entities.Web3Profile.update(list[0].id, {
      verified: true,
      verification_level: level,
    });
    return Response.json({ profile: updated, level });
  } catch (error) {
    console.error('web3Verify error:', error?.message || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});