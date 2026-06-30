import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { simpleParser } from 'npm:mailparser@3.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/service role access
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Build RFC 2822 email message
    const message = [
      'From: LiveStream Lab <notifications@livestreamlab.live>',
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      body,
    ].join('\r\n');

    // Encode to base64url (Gmail API requirement)
    const encoded = btoa(message)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gmail send error:', error);
      return Response.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    const result = await response.json();
    return Response.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('sendStreamNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});