import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Passport — derived creator passport. Looked up by wallet_address (no Base44 session).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const TIERS = ['bronze', 'silver', 'gold', 'diamond'];
    const wallet = (body.wallet_address || '').trim();

    let profile = null;
    if (wallet) {
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: wallet });
      profile = list[0] || null;
    }

    const passport = profile ? {
      ...profile,
      badge_rank: TIERS.indexOf(profile.badge_tier || 'bronze') + 1,
      graph_size: (profile.social_graph || []).length,
      verified_badge: !!profile.verified
    } : null;

    return Response.json({ passport });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});