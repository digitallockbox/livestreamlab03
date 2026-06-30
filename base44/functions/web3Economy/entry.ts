import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const txns = await base44.asServiceRole.entities.Transaction.list('-created_date', 100);
    const total = txns.reduce((s, t) => s + (t.amount || 0), 0);
    const streaming_total = txns.reduce((s, t) => s + (t.streaming_amount || 0), 0);
    const by_type = {};
    txns.forEach((t) => {
      if (t.type) by_type[t.type] = (by_type[t.type] || 0) + (t.amount || 0);
    });

    return Response.json({
      total_revenue: total,
      streaming_revenue: streaming_total,
      transaction_count: txns.length,
      by_type,
      recent: txns.slice(0, 10)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});