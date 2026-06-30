import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called by automation on stream update
    const { event, data, old_data } = await req.json();

    if (event?.type !== 'update' || !data || !old_data) {
      return Response.json({ skipped: 'Not an update event' }, { status: 200 });
    }

    const stream = data;
    const prevStream = old_data;

    // Only process if status is "live"
    if (stream.status !== 'live') {
      return Response.json({ skipped: 'Stream not live' }, { status: 200 });
    }

    // Check for viewer milestones (10, 50, 100, 500, 1000, etc.)
    const currentViewers = stream.viewer_count || 0;
    const prevViewers = prevStream.viewer_count || 0;
    
    const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
    const reachedMilestone = milestones.find(
      (m) => prevViewers < m && currentViewers >= m
    );

    if (!reachedMilestone) {
      return Response.json({ skipped: 'No milestone reached' }, { status: 200 });
    }

    // Get creator profile
    const creatorProfile = await base44.entities.Web3Profile.filter(
      { wallet_address: stream.creator_wallet },
      undefined,
      1
    ).then((profiles) => profiles[0]);

    if (!creatorProfile) {
      return Response.json({ skipped: 'Creator profile not found' }, { status: 200 });
    }

    // Get user by email
    const users = await base44.entities.User.filter({}, undefined, 100);
    const creatorUser = users.find((u) => u.email === creatorProfile.user_email);

    if (!creatorUser?.email) {
      return Response.json({ skipped: 'Creator email not found' }, { status: 200 });
    }

    // Send milestone notification
    const subject = `🎉 Milestone Reached: ${reachedMilestone} Viewers!`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #34d399;">🎉 Viewer Milestone!</h2>
        <p>Your stream "<strong>${stream.title}</strong>" just reached 
           <strong style="color: #34d399; font-size: 24px;">${reachedMilestone} viewers</strong>!</p>
        
        <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(52,211,153,0.1)); 
                      border: 2px solid #34d399; border-radius: 12px; text-align: center;">
          <p style="font-size: 32px; margin: 0; color: #8b5cf6;"><strong>${currentViewers}</strong></p>
          <p style="margin: 5px 0 0 0; color: #6b7280;">Current Viewers</p>
        </div>

        <p style="margin-top: 20px;"><strong>Stream Details:</strong></p>
        <ul style="color: #4b5563;">
          <li>Peak Viewers: ${stream.peak_viewers || currentViewers}</li>
          <li>Duration: ${stream.duration_minutes || 0} minutes</li>
          <li>Category: ${stream.category || 'General'}</li>
        </ul>

        <p style="margin-top: 20px;">
          <a href="https://www.livestreamlab.live/streams/${stream.id}/analytics" 
             style="display: inline-block; padding: 12px 24px; background: #34d399; color: white; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Analytics</a>
        </p>

        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          LiveStream Lab Notifications<br>
          Keep up the great work! 🚀
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
      milestone: reachedMilestone,
      streamId: stream.id 
    });
  } catch (error) {
    console.error('onStreamMilestone error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});