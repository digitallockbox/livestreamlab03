// refreshToken — exchanges a still-valid wallet-native JWT for a fresh one
// with a new 24h TTL. Lets wallet-only creators stay authenticated without
// re-signing a message every 24 hours. Called silently from the frontend.
import jwt from 'npm:jsonwebtoken@9.0.2';

const TOKEN_TTL_SEC = 24 * 60 * 60;

Deno.serve(async (req) => {
  try {
    let body = {};
    try { body = await req.json(); } catch {}
    const token = body.token;

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    const secret = Deno.env.get('CREATOR_JWT_SECRET');
    if (!secret) {
      console.error('refreshToken: CREATOR_JWT_SECRET not set');
      return Response.json({ error: 'Server auth not configured' }, { status: 500 });
    }

    // Verify the existing token. If it's invalid/expired, the caller must
    // re-authenticate via the full nonce → sign → verify flow.
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return Response.json({ error: 'Token invalid or expired — re-authentication required', reason: e.message }, { status: 401 });
    }

    if (!decoded?.wallet) {
      return Response.json({ error: 'Token has no wallet claim' }, { status: 400 });
    }

    // Issue a fresh token carrying the same identity claims.
    const newToken = jwt.sign(
      { wallet: decoded.wallet, chain: decoded.chain || 'solana', userId: decoded.userId || null },
      secret,
      { expiresIn: TOKEN_TTL_SEC }
    );

    return Response.json({ token: newToken, wallet: decoded.wallet });
  } catch (error) {
    console.error('refreshToken error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});