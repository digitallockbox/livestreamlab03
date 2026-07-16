import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Package, Star, Zap, ShoppingCart, ExternalLink, Download,
  CheckCircle2, Share2, Loader2, TrendingUp, MousePointerClick, ShoppingBag, Tag, CreditCard,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const usd = (n) => (Number(n) > 0 ? `$${Number(n).toFixed(2)}` : "—");
const SOURCE_LABEL = { own: "Own Product", amazon: "Amazon Affiliate", custom: "Custom Link" };

// ProductDetail — dedicated page showing full item details for a single Product.
// Reads by id from the URL. Displays image, name, description, features, pricing
// (USD + $STREAMING), performance stats, and buy/view-external actions. Includes
// related products from the same creator.
export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    if (!productId) return;
    let active = true;
    setLoading(true);
    setNotFound(false);
    base44.entities.Product.get(productId)
      .then((p) => {
        if (!active) return;
        if (!p) { setNotFound(true); return; }
        setProduct(p);
        // Load related products from the same creator (excluding this one).
        if (p.creator_wallet) {
          base44.entities.Product.filter({ creator_wallet: p.creator_wallet, status: "published" }, "-sales_count", 5)
            .then((items) => {
              if (active) setRelated((items || []).filter((x) => x.id !== productId).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  const trackClick = async () => {
    if (!product) return;
    try {
      await base44.entities.Product.update(product.id, { clicks: (product.clicks || 0) + 1 });
    } catch (_e) { /* non-blocking */ }
  };

  const openExternal = () => {
    if (!product?.external_url) return;
    trackClick();
    window.open(product.external_url, "_blank", "noopener,noreferrer");
  };

  const buyWithCard = async () => {
    if (!product) return;
    if ((product.price || 0) < 0.5) { setCardError("Minimum purchase is $0.50"); return; }
    setCardBusy(true);
    setCardError("");
    try {
      const res = await base44.functions.invoke("create-checkout", {
        items: [{ name: product.name, price: String(product.price), quantity: 1 }],
        productId: product.id,
        creatorWallet: product.creator_wallet,
      });
      const url = res?.redirectUrl || res?.url || res?.checkoutSession?.redirectUrl;
      if (url) window.location.href = url;
      else setCardError("Checkout session could not be created.");
    } catch (e) {
      setCardError(e?.message || "Checkout failed. Please try again.");
    } finally {
      setCardBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-5xl mx-auto p-4 py-20 text-center space-y-3">
        <Package className="w-10 h-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Link to="/store" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
      </div>
    );
  }

  const features = Array.isArray(product.features) ? product.features : [];
  const hasStreaming = (product.streaming_price || 0) > 0;
  const isOwn = product.source === "own";
  const hasExternal = !!product.external_url;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/store" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Store
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-20 h-20 text-muted-foreground/30" />
            )}
            <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full ${product.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground border border-border"}`}>
              {product.status}
            </span>
            {hasStreaming && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                <Zap className="w-3 h-3" /> $STREAMING
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{SOURCE_LABEL[product.source] || product.source}</span>
              {product.category && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{product.category}</span>}
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {features.length > 0 && (
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              {isOwn && (product.price || 0) > 0 && (
                <span className="text-3xl font-display font-bold text-foreground">{usd(product.price)}</span>
              )}
              {!isOwn && <span className="text-3xl font-display font-bold text-foreground">{usd(product.price)}</span>}
              {hasStreaming && (
                <span className="inline-flex items-center gap-1.5 text-accent font-medium">
                  <Zap className="w-4 h-4" /> {product.streaming_price} $STREAMING
                </span>
              )}
            </div>

            <div className="space-y-2">
              {isOwn && hasExternal && (
                <button onClick={openExternal} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                  <ExternalLink className="w-4 h-4" /> View Product
                </button>
              )}
              {isOwn && !hasExternal && (product.file_url || hasStreaming) && (
                <Link to={`/store/${product.id}/checkout`} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                  {product.file_url ? <><Download className="w-4 h-4" /> Download</> : <><ShoppingCart className="w-4 h-4" /> Buy with $STREAMING</>}
                </Link>
              )}
              {isOwn && (product.price || 0) > 0 && (
                <button onClick={buyWithCard} disabled={cardBusy} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 disabled:opacity-50">
                  {cardBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {cardBusy ? "Redirecting…" : `Buy with Card · ${usd(product.price)}`}
                </button>
              )}
              {cardError && <p className="text-xs text-destructive">{cardError}</p>}
              {!isOwn && hasExternal && (
                <button onClick={openExternal} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                  <ExternalLink className="w-4 h-4" /> Buy on {product.source === "amazon" ? "Amazon" : "External Site"}
                </button>
              )}
              {hasExternal && (
                <button onClick={openExternal} variant="outline" className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md border border-accent/30 text-accent text-sm hover:bg-accent/10">
                  <Zap className="w-4 h-4" /> {hasStreaming ? `Buy with ${product.streaming_price} $STREAMING` : "View Deal"}
                </button>
              )}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-md border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-muted">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                {product.file_url && (
                  <a href={product.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-md border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-muted">
                    <Download className="w-4 h-4" /> Preview
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Performance stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Sales</p>
              <p className="font-display font-bold text-sm mt-0.5">{product.sales_count || 0}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Clicks</p>
              <p className="font-display font-bold text-sm mt-0.5">{product.clicks || 0}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Revenue</p>
              <p className="font-display font-bold text-sm mt-0.5 text-accent">{usd(product.revenue)}</p>
            </div>
          </div>

          {product.asin && (
            <p className="text-xs text-muted-foreground">ASIN: <span className="font-mono">{product.asin}</span></p>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-4">More from this creator</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} to={`/store/${p.id}`} className="block">
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors group h-full">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-foreground">{usd(p.price)}</span>
                      {(p.streaming_price || 0) > 0 && <span className="text-xs text-accent inline-flex items-center gap-0.5"><Zap className="w-3 h-3" /> {p.streaming_price}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}