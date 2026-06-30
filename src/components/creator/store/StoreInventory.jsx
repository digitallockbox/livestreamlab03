import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Package, Star } from "lucide-react";
import { Card, Spinner, storeAPI } from "@/components/creator/os";

const usd = (n) => (n || n === 0 ? `$${Number(n).toFixed(2)}` : "—");

export default function StoreInventory({ wallet, reloadKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    storeAPI.list(wallet)
      .then((r) => setProducts(r.products || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [wallet, reloadKey]);

  const view = (p) => {
    if (!p.external_url) return;
    storeAPI.click({ title: p.name, url: p.external_url, source: p.source, asin: p.asin }).catch(() => {});
    window.open(p.external_url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <Spinner />;

  if (products.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No products in your inventory yet. Use "Add Product" to import from Amazon or create a custom one.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <Card key={p.id} className="flex flex-col gap-3">
          <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
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
  );
}