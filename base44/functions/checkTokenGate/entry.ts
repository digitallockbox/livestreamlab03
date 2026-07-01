// checkTokenGate — real on-chain SPL token balance check against STREAMING_MINT.
// Returns { allowed, balance, required }. Fails OPEN (allowed: true + warning)
// when the mint is unconfigured or the RPC lookup errors, so a misconfigured
// mint never locks out every user. Once the real mint is set and the wallet
// genuinely holds 0 tokens, allowed is false and the gate enforces.
//
// No auth required — this is a public on-chain read. Called by engine
// functions (web3Streams, web3Watch, web3Boosts, web3Subscriptions) to enforce
// token-gated permissions before write operations.
import { Connection, PublicKey } from 'npm:@solana/web3.js@1.98.4';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const wallet = (body.wallet || '').trim();
    const requiredAmount = Number(body.requiredAmount) || 0;
    const mint = (body.mint || Deno.env.get('STREAMING_MINT') || '').trim();

    if (!wallet) return Response.json({ allowed: false, error: 'wallet required' }, { status: 400 });
    if (!mint) return Response.json({ allowed: true, balance: 0, warning: 'STREAMING_MINT not configured — gating skipped' });
    if (requiredAmount <= 0) return Response.json({ allowed: true, balance: 0, warning: 'no token requirement' });

    const rpc = 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, 'confirmed');

    let balance = 0;
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(wallet),
        { mint: new PublicKey(mint) }
      );
      if (accounts.value.length > 0) {
        balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
      }
    } catch (e) {
      // Fail open on RPC / mint errors so a broken RPC doesn't lock everyone out.
      return Response.json({ allowed: true, balance: 0, warning: 'balance lookup failed: ' + (e?.message || 'unknown') });
    }

    return Response.json({ allowed: balance >= requiredAmount, balance, required: requiredAmount, mint });
  } catch (error) {
    return Response.json({ allowed: true, balance: 0, warning: error?.message || 'gate error' });
  }
});