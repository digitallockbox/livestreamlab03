// getAuthContext — unified identity resolver for wallet-native auth.
// Decodes the wallet JWT issued by verifyWalletSignature and returns a context
// object { wallet, chain } that protected routes can use without a Base44 session.
//
// Invocation: base44.functions.invoke('getAuthContext', { token })
// Returns: { authenticated: true, wallet, chain } | { authenticated: false }
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
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

    return Response.json({
      authenticated: true,
      wallet: decoded.wallet,
      chain: decoded.chain || 'solana',
      userId: decoded.userId || null,
    });
  } catch (error) {
    // Invalid/expired token — not an error, just unauthenticated.
    return Response.json({ authenticated: false, error: error.message });
  }
});