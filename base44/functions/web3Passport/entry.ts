import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const TIERS = ['bronze', 'silver', 'gold', 'diamond'];
    let profile = null;

    if (user) {
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ created_by_id: user.id });
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