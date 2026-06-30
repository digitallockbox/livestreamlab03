import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called by automation on stream create
    const { event, data, old_data } = await req.json();

    if (event?.type !== 'create' || !data) {
      return Response.json({ skipped: 'Not a create event' }, { status: 200 });
    }

    const stream = data;
    
    // Only notify if stream status is "live"
    if (stream.status !== 'live') {
      return Response.json({ skipped: 'Stream not live' }, { status: 200 });
    }

    // Get creator profile to find their email
    const creatorProfile = await base44.entities.Web3Profile.filter(
      { wallet_address: stream.creator_wallet },
      undefined,
      1
    ).then((profiles) => profiles[0]);

    if (!creatorProfile) {
      return Response.json({ skipped: 'Creator profile not found' }, { status: 200 });
    }

    // Get user by email to send notification
    // Note: We need to find the user record associated with this creator
    const users = await base44.entities.User.filter({}, undefined, 100);
    const creatorUser = users.find((u) => u.email === creatorProfile.user_email);

    if (!creatorUser?.email) {
      return Response.json({ skipped: 'Creator email not found' }, { status: 200 });
    }

    // Send notification email
    const subject = `🔴 You're Live: ${stream.title}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">You're Now Live!</h2>
        <p>Your stream "<strong>${stream.title}</strong>" has started.</p>
        <p style="color: #34d399; font-size: 18px;"><strong>Current Viewers: ${stream.viewer_count || 0}</strong></p>
        <p>Stream Category: ${stream.category || 'General'}</p>
        <p style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
          <strong>Quick Stats:</strong><br>
          • Status: Live<br>
          • Started: ${new Date(stream.created_date).toLocaleString()}<br>
        </p>
        <p style="margin-top: 20px;">
          <a href="https://www.livestreamlab.live/streams/${stream.id}/analytics" 
             style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; 
                    text-decoration: none; border-radius: 6px;">View Analytics</a>
        </p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          LiveStream Lab Notifications
        </p>
      </div>
    `;

    await base44.functions.invoke('sendStreamNotification', {
      to: creatorUser.email,
      subject,
      body,
    });

    return Response.json({ 
      success: true, 
      notified: creatorUser.email,
      streamId: stream.id 
    });
  } catch (error) {
    console.error('onStreamGoLive error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});