import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.0';

Deno.serve(async (req) => {
  try {
    const pubKey = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!pubKey) {
      console.error('wix-payments-webhook: missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return new Response('verification key not configured', { status: 500 });
    }

    const text = await req.text();
    let rawPayload;
    try {
      rawPayload = jwt.verify(text, pubKey, { algorithms: ['RS256'] });
    } catch (e) {
      console.error('wix-payments-webhook: JWT verify failed:', e.message);
      return new Response('invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const base44 = createClientFromRequest(req);
      const pending = await base44.asServiceRole.entities.Transaction.filter({ checkout_id: checkoutId });
      const tx = pending[0];
      if (tx && tx.status !== 'completed') {
        await base44.asServiceRole.entities.Transaction.update(tx.id, {
          status: 'completed',
          amount: Number(order.priceSummary?.total?.amount ?? tx.amount)
        });
        console.log(`Topup credited: checkout ${checkoutId} -> ${tx.id}`);
      } else if (!tx) {
        console.warn(`Topup webhook: no pending transaction for checkout ${checkoutId}`);
      }
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('wix-payments-webhook error:', error);
    return new Response('error', { status: 500 });
  }
});