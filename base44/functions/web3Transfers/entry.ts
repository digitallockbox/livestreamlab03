import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Transfers — record on-chain STREAMING transfer (wallet-signed), list (open read).

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
    const action = body.action;

    if (action === 'record') {
      const { sender, recipient, amount, signature } = body;
      if (!sender || !recipient || !amount) {
        return Response.json({ error: 'sender, recipient and amount required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, sender);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const tx = await base44.asServiceRole.entities.Transaction.create({
        type: 'transfer',
        sender_wallet: sender,
        recipient_wallet: recipient,
        amount: Number(amount),
        streaming_amount: Number(amount),
        description: 'STREAMING transfer',
        status: 'completed',
        source: signature || 'on-chain'
      });
      return Response.json({ transfer: tx });
    }

    if (action === 'list') {
      const { wallet } = body;
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const all = await base44.asServiceRole.entities.Transaction.filter(
        { type: 'transfer' }, '-created_date', 100
      );
      const transfers = all.filter(
        (t) => t.sender_wallet === wallet || t.recipient_wallet === wallet
      );
      return Response.json({ transfers });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});