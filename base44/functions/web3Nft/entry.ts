import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import jwt from 'npm:jsonwebtoken@9.0.2';

// Off-chain NFT ledger for stream cover photos.
// Verifies wallet ownership via the creator JWT (same pattern as web3Streams),
// then records a StreamNft entry. On-chain SPL mint settlement is a future step.
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
    const action = body.action || 'mint';

    if (action === 'mint') {
      const { creatorWallet, streamId, imageUrl, title } = body;
      if (!creatorWallet || !streamId || !imageUrl) {
        return Response.json({ error: 'creatorWallet, streamId and imageUrl required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

      // Ensure the stream exists and belongs to the caller.
      const stream = await base44.asServiceRole.entities.Stream.get(streamId);
      if (!stream) return Response.json({ error: 'Stream not found' }, { status: 404 });
      if (stream.creator_wallet !== creatorWallet) {
        return Response.json({ error: 'Wallet not authorized for this stream' }, { status: 403 });
      }

      const nft = await base44.asServiceRole.entities.StreamNft.create({
        stream_id: streamId,
        creator_wallet: creatorWallet,
        title: title || stream.title || '',
        image_url: imageUrl,
        mint_status: 'minted',
        mint_address: `stream-nft:${streamId.slice(0, 8)}`
      });

      return Response.json({
        nft: { id: nft.id, mint_status: nft.mint_status, mint_address: nft.mint_address },
        on_chain: false,
        note: 'Off-chain NFT ledger recorded. On-chain SPL mint settlement is a future step.'
      });
    }

    if (action === 'list') {
      const { creatorWallet } = body;
      if (!creatorWallet) return Response.json({ error: 'creatorWallet required' }, { status: 400 });
      const v = await verifyOwnership(base44, body, creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const nfts = await base44.asServiceRole.entities.StreamNft.filter(
        { creator_wallet: creatorWallet }, '-created_date', 100
      );
      return Response.json({ nfts });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('web3Nft error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});