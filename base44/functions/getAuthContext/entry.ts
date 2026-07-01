// getAuthContext — unified identity resolver for wallet-native auth.
// Decodes the wallet JWT issued by verifyWalletSignature, resolves any merged
// Web2↔Web3 identity via the WalletIdentity entity, and returns a context
// object { wallet, chain, userId } that protected routes can use without a
// Base44 session. This is the central auth layer for all engine routes.
//
// Invocation: base44.functions.invoke('getAuthContext', { token })
// Returns: { authenticated: true, wallet, chain, userId, merged } | { authenticated: false }
import jwt from 'npm:jsonwebtoken@9.0.2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = body.token || '';
    if (!token) return Response.json({ authenticated: false });

    const secret = Deno.env.get('CREATOR_JWT_SECRET');
    if (!secret) {
      console.error('getAuthContext: CREATOR_JWT_SECRET not set');
      return Response.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, secret);
    if (!decoded?.wallet) return Response.json({ authenticated: false });

    // resolveIdentity: if the JWT already carries a userId (merged account),
    // use it; otherwise look up the WalletIdentity link for this wallet.
    let userId = decoded.userId || null;
    let merged = false;
    if (!userId) {
      try {
        const links = await base44.asServiceRole.entities.WalletIdentity.filter(
          { wallet_address: decoded.wallet },
          '-created_date',
          1
        );
        if (links && links[0]?.user_id) {
          userId = links[0].user_id;
          merged = true;
        }
      } catch (e) {
        // non-fatal — wallet-only identity is still valid
        console.warn('getAuthContext: WalletIdentity lookup skipped:', e?.message);
      }
    } else {
      merged = true;
    }

    return Response.json({
      authenticated: true,
      wallet: decoded.wallet,
      chain: decoded.chain || 'solana',
      userId,
      merged,
    });
  } catch (error) {
    // Invalid/expired token — not an error, just unauthenticated.
    return Response.json({ authenticated: false, error: error.message });
  }
});