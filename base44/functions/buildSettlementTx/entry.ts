// buildSettlementTx — builds an unsigned Solana settlement transaction paying
// lamports (placeholder for now) from the platform wallet to a recipient.
// Used for watch_to_earn, creator_payout, and subscription_mint settlement.
//
// The returned transaction is unsigned — the PLATFORM_WALLET must sign it
// before broadcast. Full on-chain SPL settlement (real token transfers /
// minting) requires the watch-to-earn / payout SPL programs; until then this
// emits a SystemProgram lamport transfer as a verifiable placeholder so the
// full claim → build → sign → broadcast flow is wired end-to-end.
//
// Auth: verifies the wallet-native JWT inline (same CREATOR_JWT_SECRET as
// getAuthContext) to avoid the function-to-function invoke 403 that affects
// inter-function getAuthContext calls.
import jwt from 'npm:jsonwebtoken@9.0.2';
import { Connection, PublicKey, Transaction, SystemProgram } from 'npm:@solana/web3.js@1.98.4';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const wallet_token = body.wallet_token;
    const recipientWallet = body.recipientWallet;
    const amount = body.amount;
    const type = body.type;
    const sessionId = body.sessionId;

    if (!wallet_token) return Response.json({ error: 'wallet_token required' }, { status: 400 });
    if (!recipientWallet) return Response.json({ error: 'recipientWallet required' }, { status: 400 });

    // Verify the wallet-native JWT inline (mirrors getAuthContext).
    const secret = Deno.env.get('CREATOR_JWT_SECRET');
    if (!secret) {
      console.error('buildSettlementTx: CREATOR_JWT_SECRET not set');
      return Response.json({ error: 'Auth not configured' }, { status: 503 });
    }
    let decoded;
    try {
      decoded = jwt.verify(wallet_token, secret);
    } catch (e) {
      return Response.json({ error: 'Invalid or expired wallet token' }, { status: 401 });
    }
    if (!decoded?.wallet) return Response.json({ error: 'Invalid wallet token' }, { status: 401 });

    const platformWallet = Deno.env.get('PLATFORM_WALLET');
    if (!platformWallet) {
      return Response.json({
        error: 'PLATFORM_WALLET not configured. Set it in Settings → Environment Variables to enable on-chain settlement.',
        pending: 'spl_program'
      }, { status: 503 });
    }

    const lamports = Math.max(1, Math.floor(Number(amount) || 0));
    const rpc = Deno.env.get('SOLANA_RPC') || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, 'confirmed');

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(platformWallet),
        toPubkey: new PublicKey(recipientWallet),
        lamports,
      })
    );
    tx.feePayer = new PublicKey(platformWallet);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Base64-encode the unsigned transaction (chunked to avoid call-stack overflow).
    const bytes = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    const serialized = btoa(binary);

    return Response.json({
      transaction: serialized,
      recipient: recipientWallet,
      amount: lamports,
      type: type || 'watch_to_earn',
      sessionId: sessionId || null,
      note: 'Unsigned settlement transaction — platform wallet must sign before broadcast.'
    });
  } catch (error) {
    console.error('buildSettlementTx error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});