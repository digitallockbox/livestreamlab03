import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const wallet_address = (body.wallet_address || '').trim();
    if (!wallet_address) return Response.json({ error: 'wallet_address required' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address });
    let profile = existing[0];
    if (!profile) {
      const ens = body.ens_name || '';
      const short = wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4);
      profile = await base44.asServiceRole.entities.Web3Profile.create({
        wallet_address,
        ens_name: ens,
        display_name: ens || short,
        avatar_url: '',
        bio: '',
        verified: false,
        verification_level: 'none',
        badge_tier: 'bronze',
        followers: 0,
        following: 0,
        social_graph: []
      });
    }
    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});