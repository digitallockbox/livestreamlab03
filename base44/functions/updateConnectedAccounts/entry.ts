import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { twitch, twitter } = await req.json();

    // Get the current user's Web3Profile
    const profiles = await base44.entities.Web3Profile.filter({}, undefined, 100);
    const profile = profiles.find((p) => p.wallet_address === user.full_name || p.wallet_address?.includes(user.email?.split('@')[0]));

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update the profile with connected accounts
    const updateData: Record<string, string | null> = {};
    if (twitch !== undefined) updateData.twitch = twitch;
    if (twitter !== undefined) updateData.twitter = twitter;

    await base44.entities.Web3Profile.update(profile.id, updateData);

    return Response.json({ success: true, twitch, twitter });
  } catch (error) {
    console.error('updateConnectedAccounts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});