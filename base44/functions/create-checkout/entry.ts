import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PACKAGES = {
  starter: { coins: 500, usd: 5, label: "500 $STREAMING Coins" },
  popular: { coins: 1200, usd: 10, label: "1,200 $STREAMING Coins" },
  pro: { coins: 3500, usd: 25, label: "3,500 $STREAMING Coins" },
  whale: { coins: 8000, usd: 50, label: "8,000 $STREAMING Coins" }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pkg = PACKAGES[body.packageId];
    if (!pkg) return Response.json({ error: 'Invalid package selection.' }, { status: 400 });
    if (pkg.usd < 0.5) return Response.json({ error: 'Charge amount must be at least $0.50.' }, { status: 400 });

    const origin = req.headers.get('Origin') || req.headers.get('origin') || '';
    if (!origin) return Response.json({ error: 'Missing request origin.' }, { status: 400 });

    const apiKey = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const siteId = Deno.env.get('WIX_PAYMENTS_SITE_ID');
    if (!apiKey || !siteId) {
      console.error('create-checkout: missing Wix Payments env vars');
      return Response.json({ error: 'Payments are not configured.' }, { status: 500 });
    }

    const wixRes = await fetch('https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey, 'wix-site-id': siteId },
      body: JSON.stringify({
        cart: { items: [{ name: pkg.label, quantity: 1, price: pkg.usd.toFixed(2) }] },
        callbackUrls: {
          postFlowUrl: origin + '/',
          thankYouPageUrl: origin + '/topup/success'
        }
      })
    });

    const data = await wixRes.json();
    if (!wixRes.ok) {
      console.error('Wix checkout error:', JSON.stringify(data));
      const msg = data?.details?.applicationError?.description || data?.message || 'Checkout session could not be created.';
      return Response.json({ error: msg }, { status: 400 });
    }

    const session = data.checkoutSession;
    if (!session?.redirectUrl) {
      console.error('Wix checkout: no redirectUrl in response', JSON.stringify(data));
      return Response.json({ error: 'Checkout provider returned no redirect URL.' }, { status: 500 });
    }

    // Record a pending topup so the webhook can flip it to completed.
    await base44.asServiceRole.entities.Transaction.create({
      type: 'topup',
      amount: pkg.usd,
      streaming_amount: pkg.coins,
      status: 'pending',
      description: pkg.label,
      source: 'wix_payments',
      recipient_wallet: body.wallet || '',
      checkout_id: session.id
    });

    return Response.json({ redirectUrl: session.redirectUrl, checkoutId: session.id });
  } catch (error) {
    console.error('create-checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});