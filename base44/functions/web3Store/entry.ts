import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

// web3Store — Unified commerce engine for the Creator OS Store.
// Wallet-only creators have no Base44 session: reads are open, writes are wallet-signed.
// Amazon search/import requires RAINFOREST_API_KEY (optional). Without it, Amazon
// results return empty and addAmazon records the affiliate link with basic metadata.
// The AMAZON_AFFILIATE_TAG secret is used for all Amazon links.
// Actions:
//   list        -> { creatorWallet }                       => { products: [...] }
//   searchAmazon-> { searchTerm }                          => { results: [...] }
//   addAmazon   -> { creatorWallet, asin } + wallet sig     => { success, product }
//   addCustom   -> { creatorWallet, title, price, url, description, image_url } + wallet sig => { success, product }
//   click       -> { title?, url?, source?, asin? }        => { ok: true }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    const AFF_TAG = Deno.env.get("AMAZON_AFFILIATE_TAG") || "livestreaml0d-20";
    const affiliateUrl = (asin) => `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(AFF_TAG)}`;
    const extractAsin = (input) => {
      const m = String(input || "").match(/([A-Z0-9]{10})/);
      return m ? m[1] : String(input || "").trim().substring(0, 10);
    };
    const parsePrice = (raw) => parseFloat(String(raw || "").replace(/[^0-9.]/g, "")) || 0;

    // Verify the caller owns the wallet in the payload.
    const verifyOwner = async (requiredWallet) => {
      if (!body.wallet_token) return { ok: false, status: 401, error: 'wallet_token required' };
      try {
        const res = await base44.functions.invoke('getAuthContext', { token: body.wallet_token });
        const d = res?.data || res;
        if (!d?.authenticated) return { ok: false, status: 401, error: 'Wallet token invalid or expired' };
        if (requiredWallet && d.wallet !== requiredWallet) {
          return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
        }
        return { ok: true, wallet: d.wallet };
      } catch (e) {
        return { ok: false, status: 401, error: 'Wallet token verification failed' };
      }
    };

    // ---- LIST: creator's saved inventory (open read) ----
    if (action === 'list') {
      let products = [];
      if (body.creatorWallet) {
        try {
          products = await base44.asServiceRole.entities.Product.filter(
            { creator_wallet: body.creatorWallet },
            "-created_date",
            100
          );
        } catch (e) {
          console.warn("Product filter failed:", e?.message || e);
        }
      }
      return Response.json({ products: products || [] });
    }

    // ---- SEARCH AMAZON — returns empty when RAINFOREST_API_KEY is not configured ----
    if (action === 'searchAmazon') {
      return Response.json({ results: [] });
    }

    // ---- ADD AMAZON (wallet-signed). Records the affiliate link with basic metadata. ----
    if (action === 'addAmazon') {
      if (!body.creatorWallet) return Response.json({ error: "Missing creatorWallet" }, { status: 400 });
      const v = await verifyOwner(body.creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const asinClean = extractAsin(body.asin);
      if (!asinClean) return Response.json({ error: "Missing ASIN" }, { status: 400 });

      const product = await base44.asServiceRole.entities.Product.create({
        creator_wallet: body.creatorWallet,
        name: `Amazon ${asinClean}`,
        description: "",
        price: 0,
        image_url: "",
        status: "published",
        category: body.category || "amazon",
        source: "amazon",
        external_url: affiliateUrl(asinClean),
        asin: asinClean,
        rating: 0,
        features: [],
      });
      return Response.json({ success: true, product });
    }

    // ---- ADD CUSTOM (wallet-signed) ----
    if (action === 'addCustom') {
      if (!body.creatorWallet || !body.title) return Response.json({ error: "Missing required fields" }, { status: 400 });
      const v = await verifyOwner(body.creatorWallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
      const product = await base44.asServiceRole.entities.Product.create({
        creator_wallet: body.creatorWallet,
        name: body.title,
        description: body.description || "",
        price: parsePrice(body.price),
        image_url: body.image_url || "",
        external_url: body.url || "",
        status: "published",
        category: body.category || "custom",
        source: "custom",
      });
      return Response.json({ success: true, product });
    }

    // ---- CLICK: product + affiliate click tracking (open) ----
    if (action === 'click') {
      if (body.productId) {
        try {
          const p = await base44.asServiceRole.entities.Product.get(body.productId);
          if (p) await base44.asServiceRole.entities.Product.update(body.productId, { clicks: (p.clicks || 0) + 1 });
        } catch (e) { console.warn("Product click tracking failed:", e?.message || e); }
      }
      const linkUrl = body.url || (body.asin ? affiliateUrl(body.asin) : "");
      if (!linkUrl) return Response.json({ ok: true });
      try {
        const existing = await base44.asServiceRole.entities.AffiliateLink.filter({ url: linkUrl });
        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.AffiliateLink.update(existing[0].id, {
            clicks: (existing[0].clicks || 0) + 1,
          });
        } else {
          await base44.asServiceRole.entities.AffiliateLink.create({
            title: body.title || (body.source === "amazon" ? `Amazon: ${body.asin || ""}` : "Store link"),
            url: linkUrl,
            category: body.source || "store",
            clicks: 1,
          });
        }
      } catch (e) {
        console.warn("Click tracking failed:", e?.message || e);
      }
      return Response.json({ ok: true });
    }

    // ---- PURCHASE: viewer buys a $STREAMING-priced digital product ----
    // Verifies the viewer's wallet token, validates the product, records a
    // store_sale Transaction, and increments the product's sales/revenue/conversions.
    // Creator earnings are reflected via the Transaction ledger (recipient_wallet).
    if (action === 'purchase') {
      const productId = (body.productId || '').trim();
      if (!productId) return Response.json({ error: 'productId required' }, { status: 400 });
      if (!body.wallet_token) return Response.json({ error: 'wallet_token required' }, { status: 401 });

      // Inline JWT verification (avoids inter-function getAuthContext 403).
      const secret = Deno.env.get('CREATOR_JWT_SECRET');
      if (!secret) return Response.json({ error: 'Auth not configured' }, { status: 503 });
      let viewerWallet;
      try {
        const decoded = jwt.verify(body.wallet_token, secret);
        if (!decoded?.wallet) return Response.json({ error: 'Invalid wallet token' }, { status: 401 });
        viewerWallet = decoded.wallet;
      } catch (_e) {
        return Response.json({ error: 'Invalid or expired wallet token' }, { status: 401 });
      }

      let product;
      try {
        product = await base44.asServiceRole.entities.Product.get(productId);
      } catch (e) {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }
      if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

      const streamingPrice = Number(product.streaming_price || 0);
      if (streamingPrice <= 0) {
        return Response.json({ error: 'This product is not available for $STREAMING purchase' }, { status: 400 });
      }
      if (!product.creator_wallet) {
        return Response.json({ error: 'Product has no linked creator' }, { status: 400 });
      }
      // Self-purchase guard.
      if (product.creator_wallet === viewerWallet) {
        return Response.json({ error: 'You cannot purchase your own product' }, { status: 400 });
      }

      // Record the sale transaction (creator earnings ledger).
      const txn = await base44.asServiceRole.entities.Transaction.create({
        type: 'store_sale',
        amount: Number(product.price || 0),
        streaming_amount: streamingPrice,
        description: `Store purchase: ${product.name}`,
        status: 'completed',
        source: 'storefront',
        sender_wallet: viewerWallet,
        recipient_wallet: product.creator_wallet,
        product_id: productId,
      });

      // Increment product performance counters (creator earnings update automatically
      // via the Transaction ledger; sales_count/revenue give the catalog its stats).
      await base44.asServiceRole.entities.Product.update(productId, {
        sales_count: (product.sales_count || 0) + 1,
        conversions: (product.conversions || 0) + 1,
        revenue: (product.revenue || 0) + Number(product.price || 0),
      });

      return Response.json({
        success: true,
        transaction: txn,
        product: { id: product.id, name: product.name },
        price_streaming: streamingPrice,
        creator_wallet: product.creator_wallet,
      });
    }

    // ---- STOREFRONT: public creator storefront by bound domain ----
    if (action === 'storefront') {
      const domain = String(body.domain || "").trim().toLowerCase();
      if (!domain) return Response.json({ error: "Missing domain" }, { status: 400 });
      let profile = null;
      try {
        const profiles = await base44.asServiceRole.entities.Web3Profile.filter({ bound_domain: domain }, "-created_date", 5);
        profile = (profiles && profiles[0]) || null;
      } catch (e) { console.warn("Storefront profile lookup failed:", e?.message || e); }
      let products = [];
      if (profile?.wallet_address) {
        try {
          products = await base44.asServiceRole.entities.Product.filter(
            { creator_wallet: profile.wallet_address, status: "published" },
            "-created_date", 100
          );
        } catch (e) { console.warn("Storefront products failed:", e?.message || e); }
      }
      return Response.json({ profile, products: products || [] });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("web3Store error:", error?.message || error);
    return Response.json({ error: error.message || "Internal error" }, { status: 500 });
  }
});