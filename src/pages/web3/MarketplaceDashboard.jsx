import { Link } from "react-router-dom";
import { Plus, Package, BarChart3, Loader2 } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { useMarketplace } from "@/hooks/web3/useMarketplace";
import { Button } from "@/components/ui/button";

export default function MarketplaceDashboard() {
  const { profile } = useCreator();
  const { products, count, revenue, sales, loading } = useMarketplace(profile?.wallet_address);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your digital products and track sales.</p>
        </div>
        <Link to="/web3/marketplace/add">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Products" value={count} />
        <Stat label="Units Sold" value={sales} />
        <Stat label="Revenue" value={`$${revenue.toFixed(2)}`} accent />
        <Stat label="Active" value={products.filter((p) => p.status === "published").length} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Recent Products</h2>
          <Link to="/web3/marketplace/products" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet. Add your first product to get started.</p>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.category || "uncategorized"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">${(p.price || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{p.sales_count || 0} sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/web3/marketplace/products" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
          <Package className="w-5 h-5 text-primary mb-2" />
          <p className="font-medium">Manage Products</p>
          <p className="text-xs text-muted-foreground">View and edit your catalog</p>
        </Link>
        <Link to="/web3/marketplace/sales" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
          <BarChart3 className="w-5 h-5 text-primary mb-2" />
          <p className="font-medium">Sales History</p>
          <p className="text-xs text-muted-foreground">Track your sales transactions</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-display font-bold mt-1 ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}