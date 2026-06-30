import { Link } from "react-router-dom";
import { Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreator } from "@/hooks/web3/useCreator";
import { useMarketplace } from "@/hooks/web3/useMarketplace";

export default function MarketplaceProducts() {
  const { profile } = useCreator();
  const { products, loading } = useMarketplace(profile?.wallet_address);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Your marketplace catalog.</p>
        </div>
        <Link to="/web3/marketplace/add">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{p.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{p.status}</span>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{p.category || "uncategorized"}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-display font-bold">${(p.price || 0).toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">{p.sales_count || 0} sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}