import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const TIERS = ['bronze', 'silver', 'gold', 'diamond'];
    const list = await base44.asServiceRole.entities.Web3Profile.filter({ created_by_id: user.id });
    if (!list[0]) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const current = list[0].badge_tier || 'bronze';
    let next;
    if (body.tier && TIERS.includes(body.tier)) {
      next = body.tier;
    } else {
      const idx = TIERS.indexOf(current);
      next = TIERS[Math.min(idx + 1, TIERS.length - 1)];
    }
    const updated = await base44.asServiceRole.entities.Web3Profile.update(list[0].id, { badge_tier: next });
    return Response.json({ profile: updated, previous_tier: current, new_tier: next });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});