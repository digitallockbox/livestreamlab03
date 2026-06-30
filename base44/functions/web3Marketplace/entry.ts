import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'add') {
      const creatorWallet = (body.creatorWallet || '').trim();
      const name = (body.name || '').trim();
      if (!creatorWallet || !name) {
        return Response.json({ error: 'creatorWallet and name are required' }, { status: 400 });
      }
      const product = await base44.asServiceRole.entities.Product.create({
        creator_wallet: creatorWallet,
        name,
        description: body.description || '',
        price: Number(body.price) || 0,
        streaming_price: Number(body.streamingPrice) || 0,
        image_url: body.imageUrl || '',
        file_url: body.fileUrl || '',
        category: body.category || '',
        status: 'published'
      });
      return Response.json({ product });
    }

    if (action === 'list') {
      const wallet = (body.creatorWallet || '').trim();
      if (!wallet) return Response.json({ error: 'creatorWallet required' }, { status: 400 });
      const products = await base44.asServiceRole.entities.Product.filter({ creator_wallet: wallet }, '-created_date', 50);
      const revenue = products.reduce((s, p) => s + (p.revenue || 0), 0);
      const sales = products.reduce((s, p) => s + (p.sales_count || 0), 0);
      return Response.json({ products, count: products.length, revenue, sales });
    }

    if (action === 'sales') {
      const wallet = (body.creatorWallet || '').trim();
      if (!wallet) return Response.json({ error: 'creatorWallet required' }, { status: 400 });
      const txns = await base44.asServiceRole.entities.Transaction.filter(
        { source: 'marketplace', type: 'store_sale' },
        '-created_date',
        50
      );
      return Response.json({ sales: txns, count: txns.length, total: txns.reduce((s, t) => s + (t.amount || 0), 0) });
    }

    if (action === 'buy') {
      const buyerWallet = (body.buyerWallet || '').trim();
      const productId = (body.productId || '').trim();
      if (!buyerWallet || !productId) {
        return Response.json({ error: 'buyerWallet and productId are required' }, { status: 400 });
      }
      const product = await base44.asServiceRole.entities.Product.get(productId);
      if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
      const transaction = await base44.asServiceRole.entities.Transaction.create({
        type: 'store_sale',
        amount: product.price || 0,
        streaming_amount: product.streaming_price || 0,
        description: `Sale: ${product.name}`,
        status: 'completed',
        source: 'marketplace'
      });
      await base44.asServiceRole.entities.Product.update(productId, {
        sales_count: (product.sales_count || 0) + 1,
        revenue: (product.revenue || 0) + (product.price || 0)
      });
      return Response.json({ transaction });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});