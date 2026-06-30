import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const wallet = (await req.json().catch(() => ({}))).wallet;

    const allTxns = await base44.asServiceRole.entities.Transaction.list('-created_date', 200);
    // Scope economy to the caller's wallet when provided.
    const txns = wallet
      ? allTxns.filter((t) => !t.sender_wallet || !t.recipient_wallet || t.sender_wallet === wallet || t.recipient_wallet === wallet)
      : allTxns;
    const total = txns.reduce((s, t) => s + (t.amount || 0), 0);
    const streaming_total = txns.reduce((s, t) => s + (t.streaming_amount || 0), 0);
    const by_type = {};
    txns.forEach((t) => {
      if (t.type) by_type[t.type] = (by_type[t.type] || 0) + (t.amount || 0);
    });

    const boostTxns = txns.filter((t) => t.source === 'boost');
    const boosts_total = boostTxns.reduce((s, t) => s + (t.amount || 0), 0);
    const recent_boosts = boostTxns.slice(0, 5).map((t) => ({
      amount: t.amount,
      description: t.description,
      created_date: t.created_date
    }));

    const subTxns = txns.filter((t) => t.source === 'subscription');
    const subs_mrr = subTxns.reduce((s, t) => s + (t.amount || 0), 0);

    const saleTxns = txns.filter((t) => t.source === 'marketplace' && t.type === 'store_sale');
    const sales_total = saleTxns.reduce((s, t) => s + (t.amount || 0), 0);

    return Response.json({
      total_revenue: total,
      streaming_revenue: streaming_total,
      transaction_count: txns.length,
      boosts_total,
      boost_count: boostTxns.length,
      recent_boosts,
      subscriber_count: subTxns.length,
      subs_mrr,
      sales_count: saleTxns.length,
      sales_total,
      by_type,
      recent: txns.slice(0, 10)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});