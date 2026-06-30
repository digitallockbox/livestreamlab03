import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const level = body.level === 'full' ? 'full' : 'basic';
    const list = await base44.asServiceRole.entities.Web3Profile.filter({ created_by_id: user.id });
    if (!list[0]) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const updated = await base44.asServiceRole.entities.Web3Profile.update(list[0].id, {
      verified: true,
      verification_level: level
    });
    return Response.json({ profile: updated, level });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});