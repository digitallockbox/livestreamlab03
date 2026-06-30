import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'me';

    if (action === 'me') {
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ created_by_id: user.id });
      return Response.json({ profile: list[0] || null });
    }
    if (action === 'get') {
      if (!body.wallet_address) return Response.json({ error: 'wallet_address required' }, { status: 400 });
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ wallet_address: body.wallet_address });
      return Response.json({ profile: list[0] || null });
    }
    if (action === 'update') {
      const list = await base44.asServiceRole.entities.Web3Profile.filter({ created_by_id: user.id });
      if (!list[0]) return Response.json({ error: 'Profile not found' }, { status: 404 });
      const patch = {};
      for (const k of ['display_name', 'avatar_url', 'bio', 'ens_name']) {
        if (body[k] !== undefined) patch[k] = body[k];
      }
      const updated = await base44.asServiceRole.entities.Web3Profile.update(list[0].id, patch);
      return Response.json({ profile: updated });
    }
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});