import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// web3Store — Unified commerce engine for the Creator OS Store.
// Actions:
//   list        -> { creatorWallet }                       => { products: [...] }   (creator's saved inventory)
//   searchAmazon-> { searchTerm }                          => { results: [...] }     (Rainforest search, not saved)
//   addAmazon   -> { creatorWallet, asin }                  => { success, product }   (fetch full details, save with affiliate tag)
//   addCustom   -> { creatorWallet, title, price, url, description, image_url } => { success, product }
//   click       -> { title?, url?, source?, asin? }        => { ok: true }           (affiliate click tracking)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    const RAINFOREST_API_KEY = Deno.env.get("RAINFOREST_API_KEY");
    const AFF_TAG = Deno.env.get("AMAZON_AFFILIATE_TAG") || "livestreaml0d-20";

    const affiliateUrl = (asin) => `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(AFF_TAG)}`;
    const extractAsin = (input) => {
      const m = String(input || "").match(/([A-Z0-9]{10})/);
      return m ? m[1] : String(input || "").trim().substring(0, 10);
    };
    const parsePrice = (raw) => parseFloat(String(raw || "").replace(/[^0-9.]/g, "")) || 0;

    // ---- LIST: creator's saved inventory ----
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

    // ---- SEARCH AMAZON (Rainforest) ----
    if (action === 'searchAmazon') {
      let results = [];
      if (RAINFOREST_API_KEY && body.searchTerm) {
        try {
          const apiUrl = `https://api.rainforestapi.com/request?api_key=${encodeURIComponent(RAINFOREST_API_KEY)}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(body.searchTerm)}`;
          const res = await fetch(apiUrl, { method: "GET" });
          const json = await res.json();
          results = (json.search_results || []).slice(0, 12).map((item) => ({
            asin: item.asin,
            title: item.title || "Amazon product",
            price: (item.price && (item.price.raw || item.price.value)) || "",
            image_url: item.image || "",
            url: affiliateUrl(item.asin),
          }));
        } catch (e) {
          console.warn("Rainforest search failed:", e?.message || e);
        }
      }
      return Response.json({ results });
    }

    // ---- ADD AMAZON (full product lookup, save with affiliate tag) ----
    if (action === 'addAmazon') {
      if (!body.creatorWallet) return Response.json({ error: "Missing creatorWallet" }, { status: 400 });
      const asinClean = extractAsin(body.asin);
      if (!asinClean) return Response.json({ error: "Missing ASIN" }, { status: 400 });

      let title = `Amazon ${asinClean}`, price = "", description = "", image_url = "", rating = 0, features = [];
      if (RAINFOREST_API_KEY) {
        try {
          const apiUrl = `https://api.rainforestapi.com/request?api_key=${encodeURIComponent(RAINFOREST_API_KEY)}&type=product&amazon_domain=amazon.com&asin=${encodeURIComponent(asinClean)}`;
          const res = await fetch(apiUrl, { method: "GET" });
          const json = await res.json();
          const p = json.product || {};
          title = p.title || title;
          price = (p.buybox_winner?.price?.raw) || (p.buybox_winner?.price?.value != null ? String(p.buybox_winner.price.value) : "") || "";
          description = p.description || p.aplus_description || "";
          image_url = p.main_image || "";
          rating = Number(p.rating || 0);
          features = Array.isArray(p.feature_bullets) ? p.feature_bullets.slice(0, 8) : [];
        } catch (e) {
          console.warn("Rainforest product lookup failed:", e?.message || e);
        }
      }

      const product = await base44.asServiceRole.entities.Product.create({
        creator_wallet: body.creatorWallet,
        name: title,
        description,
        price: parsePrice(price),
        image_url,
        status: "published",
        category: body.category || "amazon",
        source: "amazon",
        external_url: affiliateUrl(asinClean),
        asin: asinClean,
        rating,
        features,
      });
      return Response.json({ success: true, product });
    }

    // ---- ADD CUSTOM ----
    if (action === 'addCustom') {
      if (!body.creatorWallet || !body.title) return Response.json({ error: "Missing required fields" }, { status: 400 });
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

    // ---- CLICK: affiliate click tracking ----
    if (action === 'click') {
      const linkUrl = body.url || (body.asin ? affiliateUrl(body.asin) : "");
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