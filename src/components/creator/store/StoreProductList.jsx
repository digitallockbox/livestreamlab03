import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Package, Star, Zap, ExternalLink, Loader2, ShoppingBag, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner } from "@/components/creator/os";

const usd = (n) => (Number(n) > 0 ? `$${Number(n).toFixed(2)}` : "—");

const SOURCE_STYLE = {
  amazon: "bg-primary/15 text-primary",
  custom: "bg-accent/15 text-accent",
  own: "bg-muted text-muted-foreground",
};

// StoreProductList — clean catalog grid of the creator's digital products.
// Bound to the Product entity (filtered by creator_wallet). Search, category,
// source, and status filters + sort. Each card links to the product detail page.
export default function StoreProductList() {
  const { walletAddress } = useIdentity();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.Product.filter({ creator_wallet: walletAddress }, "-created_date", 200)
      .then((data) => { if (active) setProducts(data || []); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const filtered = useMemo(() => {
    let arr = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    if (cat !== "all") arr = arr.filter((p) => p.category === cat);
    if (source !== "all") arr = arr.filter((p) => p.source === source);
    if (status !== "all") arr = arr.filter((p) => p.status === status);
    if (sort === "new") arr.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    else if (sort === "sales") arr.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    else if (sort === "revenue") arr.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    else if (sort === "clicks") arr.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    else if (sort === "price") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    return arr;
  }, [products, query, cat, source, status, sort]);

  const stats = useMemo(() => ({
    total: products.length,
    published: products.filter((p) => p.status === "published").length,
    revenue: products.reduce((s, p) => s + (p.revenue || 0), 0),
    streaming: products.filter((p) => (p.streaming_price || 0) > 0).length,
  }), [products]);

  if (!walletAddress) return <Page title="Store"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view your store.</p></Card></Page>;
  if (loading) return <Page title="Store"><Spinner /></Page>;

  return (
    <Page title="Store" subtitle="Your digital product catalog for viewers">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Package className="w-3.5 h-3.5 text-primary" /> Total Products</div>
          <p className="text-2xl font-display font-bold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShoppingBag className="w-3.5 h-3.5 text-accent" /> Published</div>
          <p className="text-2xl font-display font-bold mt-1 text-accent">{stats.published}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag className="w-3.5 h-3.5 text-chart-3" /> Revenue</div>
          <p className="text-2xl font-display font-bold mt-1">{usd(stats.revenue)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-primary" /> $STREAMING Priced</div>
          <p className="text-2xl font-display font-bold mt-1 text-primary">{stats.streaming}</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full rounded-md border border-input bg-muted pl-9 pr-3 py-2 text-sm focus:outline-none" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="all">All sources</option>
          <option value="own">Own</option>
          <option value="amazon">Amazon</option>
          <option value="custom">Custom</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="new">Newest</option>
          <option value="sales">Top sellers</option>
          <option value="revenue">Top revenue</option>
          <option value="clicks">Most clicked</option>
          <option value="price">Price (low→high)</option>
        </select>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">{products.length === 0 ? "No products yet." : "No products match your filters."}</p>
          <p className="text-xs text-muted-foreground">{products.length === 0 ? "Add products from the Store tab to start selling." : "Try adjusting your search or filters."}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/store/${p.id}`} className="block">
              <Card className="flex flex-col gap-3 h-full hover:border-primary/40 transition-colors group">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Package className="w-10 h-10 text-muted-foreground/40" />
                  )}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full capitalize ${SOURCE_STYLE[p.source] || SOURCE_STYLE.own}`}>
                    {p.source || "own"}
                  </span>
                  {p.status === "draft" && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Draft</span>
                  )}
                  {(p.streaming_price || 0) > 0 && (
                    <span className="absolute bottom-2 right-2 w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center" title="$STREAMING priced">
                      <Zap className="w-3 h-3 text-accent" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm line-clamp-2">{p.name}</p>
                  {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <span className="text-accent font-medium text-sm">
                      {p.source === "own" && (p.streaming_price ? `${p.streaming_price} ◎` : usd(p.price))}
                      {p.source !== "own" && usd(p.price)}
                    </span>
                    {p.rating > 0 && (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-500" /> {p.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.sales_count || 0} sold · {p.clicks || 0} clicks</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">Showing {filtered.length} of {products.length} products</p>
    </Page>
  );
}