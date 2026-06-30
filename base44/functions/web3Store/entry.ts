import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Store — Creator store: own published products + Amazon affiliate catalog (Rainforest API).
// Actions:
//   list  -> { creatorWallet?, searchTerm? } => { products: [...] }  (own + amazon, affiliate tag baked into amazon urls)
//   click -> { title?, url?, source?, asin? } => { ok: true }        (records an affiliate click-through)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    const RAINFOREST_API_KEY = Deno.env.get("RAINFOREST_API_KEY");
    const AFF_TAG = Deno.env.get("AMAZON_AFFILIATE_TAG") || "";

    if (action === 'list') {
      // 1) Creator's own published products
      let ownProducts = [];
      if (body.creatorWallet) {
        try {
          ownProducts = await base44.asServiceRole.entities.Product.filter({
            creator_wallet: body.creatorWallet,
            status: "published",
          });
        } catch (e) {
          console.warn("Product filter failed:", e?.message || e);
        }
      }

      // 2) Amazon affiliate products via Rainforest search
      let amazonProducts = [];
      if (RAINFOREST_API_KEY) {
        try {
          const searchTerm = body.searchTerm || "streaming equipment";
          const apiUrl = `https://api.rainforestapi.com/request?api_key=${encodeURIComponent(RAINFOREST_API_KEY)}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(searchTerm)}`;
          const res = await fetch(apiUrl, { method: "GET" });
          const json = await res.json();
          amazonProducts = (json.search_results || []).slice(0, 12).map((item) => ({
            id: `amazon-${item.asin}`,
            source: "amazon",
            asin: item.asin,
            title: item.title || "Amazon product",
            price: (item.price && (item.price.raw || item.price.value)) || "",
            image_url: item.image || "",
            url: `https://www.amazon.com/dp/${item.asin}?tag=${encodeURIComponent(AFF_TAG)}`,
          }));
        } catch (e) {
          console.warn("Rainforest search failed:", e?.message || e);
        }
      }

      const products = [
        ...ownProducts.map((p) => ({ ...p, source: "own" })),
        ...amazonProducts,
      ];

      return Response.json({ products });
    }

    if (action === 'click') {
      const linkUrl = body.url || (body.asin ? `https://www.amazon.com/dp/${body.asin}?tag=${encodeURIComponent(AFF_TAG)}` : "");
      if (!linkUrl) return Response.json({ error: "Missing url" }, { status: 400 });

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

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("web3Store error:", error?.message || error);
    return Response.json({ error: error.message || "Internal error" }, { status: 500 });
  }
});