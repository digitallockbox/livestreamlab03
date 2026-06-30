// verifyWalletSignature — pure crypto check that a Phantom Ed25519 signature
// was produced by the claimed wallet over the supplied message.
// Stateless replay protection via an embedded `ts:<ms>` timestamp in the message.
import nacl from 'npm:tweetnacl@1.0.3';
import bs58 from 'npm:bs58@6.0.0';

const FIVE_MIN = 5 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { wallet_address, message, signature } = body;
    if (!wallet_address || !message || !signature) {
      return Response.json({ valid: false, error: 'wallet_address, message, signature required' }, { status: 400 });
    }

    let ok = false;
    try {
      const msgBytes = new TextEncoder().encode(String(message));
      const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
      const pubKeyBytes = bs58.decode(wallet_address);
      ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    } catch (e) {
      return Response.json({ valid: false, error: 'decode/verify failed: ' + e.message }, { status: 400 });
    }
    if (!ok) return Response.json({ valid: false }, { status: 401 });

    const tsMatch = String(message).match(/ts:(\d+)/);
    if (tsMatch && Math.abs(Date.now() - Number(tsMatch[1])) > FIVE_MIN) {
      return Response.json({ valid: false, error: 'signature expired' }, { status: 401 });
    }

    return Response.json({ valid: true, wallet_address });
  } catch (error) {
    console.error('verifyWalletSignature error:', error);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});