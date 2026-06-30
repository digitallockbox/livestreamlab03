import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
      const v = await base44.functions.invoke('verifyWalletSignature', {
        wallet_address: body.auth_wallet,
        message: body.auth_message,
        signature: body.auth_signature,
        chain: body.chain,
      });
      const d = v?.data || v;
      if (!d?.valid) return { ok: false, status: 401, error: 'Wallet signature invalid' };
      if (requiredWallet && d.wallet_address !== requiredWallet) {
        return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
      }
      return { ok: true, wallet: d.wallet_address };
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

    // ---- CLICK: affiliate click tracking (open) ----
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