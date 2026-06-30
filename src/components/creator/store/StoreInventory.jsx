import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Package, Star, Search } from "lucide-react";
import { Card, Spinner, storeAPI } from "@/components/creator/os";

const usd = (n) => (n || n === 0 ? `$${Number(n).toFixed(2)}` : "—");

export default function StoreInventory({ wallet, reloadKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("new");

  const load = () => {
    setLoading(true);
    storeAPI.list(wallet)
      .then((r) => setProducts(r.products || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [wallet, reloadKey]);

  const filtered = useMemo(() => {
    let arr = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    if (cat !== "all") arr = arr.filter((p) => (p.category || "uncategorized") === cat);
    if (sort === "new") arr.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    else if (sort === "sales") arr.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    else if (sort === "revenue") arr.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    else if (sort === "clicks") arr.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    return arr;
  }, [products, query, cat, sort]);

  const view = (p) => {
    storeAPI.click({ productId: p.id, title: p.name, url: p.external_url, source: p.source, asin: p.asin }).catch(() => {});
    if (p.external_url) window.open(p.external_url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <Spinner />;

  if (products.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No products in your inventory yet. Use "Add Product" to import from Amazon or create a custom one.</p>
      </Card>
    );
  }

  const cats = Array.from(new Set(products.map((p) => p.category || "uncategorized")));

  return (
    <div className="space-y-4">
      <Card className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full rounded-md border border-input bg-muted pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
          <option value="new">Newest</option>
          <option value="sales">Top sellers</option>
          <option value="revenue">Top revenue</option>
          <option value="clicks">Most clicked</option>
        </select>
      </Card>

      {filtered.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">No products match your filters.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm line-clamp-2">{p.name}</p>
                {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                  <span className="text-accent font-medium text-sm">
                    {p.source === "own" ? (p.streaming_price ? `${p.streaming_price} ◎` : usd(p.price)) : usd(p.price)}
                  </span>
                  {p.rating > 0 && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" /> {p.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.clicks || 0} clicks · {p.conversions || 0} sales</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.source === "amazon" ? "bg-primary/15 text-primary" : p.source === "custom" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                  {p.source === "amazon" ? "Amazon" : p.source === "custom" ? "Custom" : "Own"}
                </span>
                {p.external_url ? (
                  <button onClick={() => view(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </button>
                ) : (
                  <Link to="/marketplace/products" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80">
                    <Package className="w-3.5 h-3.5" /> Manage
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}