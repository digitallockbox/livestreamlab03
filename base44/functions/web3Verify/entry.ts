import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Verify — mint verification level. Wallet-signed (no Base44 session required).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const v = await base44.functions.invoke('verifyWalletSignature', {
      wallet_address: body.auth_wallet,
      message: body.auth_message,
      signature: body.auth_signature,
      chain: body.chain,
    });
    const d = v?.data || v;
    if (!d?.valid) return Response.json({ error: 'Wallet signature invalid' }, { status: 401 });

    const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: d.wallet_address });
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