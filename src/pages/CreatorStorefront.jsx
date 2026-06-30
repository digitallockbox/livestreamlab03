import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, ShoppingBag, Globe, Loader2 } from "lucide-react";
import { storeAPI } from "@/components/creator/os";

const usd = (n) => (n || n === 0 ? `$${Number(n).toFixed(2)}` : "—");

export default function CreatorStorefront() {
  const { domain } = useParams();
  const [data, setData] = useState({ profile: null, products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!domain) return;
    setLoading(true);
    storeAPI.storefront(domain)
      .then((r) => setData({ profile: r.profile, products: r.products || [] }))
      .catch(() => setError("Storefront unavailable"))
      .finally(() => setLoading(false));
  }, [domain]);

  const view = (p) => {
    storeAPI.click({ productId: p.id, title: p.name, url: p.external_url, source: p.source, asin: p.asin }).catch(() => {});
    if (p.external_url) window.open(p.external_url, "_blank", "noopener,noreferrer");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  const { profile, products } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-card">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to LiveStreamLab
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">{domain}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            {profile?.display_name || profile?.ens_name || (profile?.wallet_address ? `${profile.wallet_address.slice(0, 8)}…` : "Creator Store")}
          </h1>
          {profile?.bio && <p className="text-muted-foreground mt-2 max-w-xl">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Package className="w-4 h-4" /> {products.length} products</span>
            {profile?.verified && <span className="text-accent">✓ Verified</span>}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !profile ? (
          <div className="text-center py-16">
            <p className="text-lg font-display font-semibold">No store found at <span className="text-primary font-mono">{domain}</span></p>
            <p className="text-sm text-muted-foreground mt-1">This domain isn't bound to a creator yet.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">This creator hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
                <div className="aspect-square bg-muted">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-8 h-8" /></div>}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-1.5">
                  <p className="font-medium leading-tight line-clamp-2">{p.name}</p>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-display font-bold text-accent">{p.source === "own" && p.streaming_price ? `${p.streaming_price} ◎` : usd(p.price)}</span>
                    {p.external_url ? (
                      <button onClick={() => view(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90">View</button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{p.sales_count || 0} sold</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}