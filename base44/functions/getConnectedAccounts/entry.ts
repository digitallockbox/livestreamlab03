import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user's Web3Profile
    const profiles = await base44.entities.Web3Profile.filter({}, undefined, 100);
    const profile = profiles.find((p) => p.wallet_address === user.full_name || p.wallet_address?.includes(user.email?.split('@')[0]));

    if (!profile) {
      return Response.json({ twitch: null, twitter: null });
    }

    return Response.json({
      twitch: profile.twitch || null,
      twitter: profile.twitter || null,
    });
  } catch (error) {
    console.error('getConnectedAccounts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});