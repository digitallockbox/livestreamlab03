import React, { useMemo } from "react";
import { Package, TrendingUp, DollarSign, ShoppingCart, Trophy, Crown } from "lucide-react";

// ProductPerformanceTable — lists all store products ranked by total sales
// revenue, so the creator can see which products perform best at a glance.
export default function ProductPerformanceTable({ products, txns }) {
  // Aggregate store_sale + video_unlock revenue per product_id.
  const rows = useMemo(() => {
    const byId = new Map();
    for (const t of txns) {
      if (!t.product_id) continue;
      const pid = String(t.product_id);
      const prev = byId.get(pid) || { revenue: 0, count: 0 };
      prev.revenue += Number(t.amount) || 0;
      prev.count += 1;
      byId.set(pid, prev);
    }
    // Merge in product metadata for display.
    return [...products]
      .map((p) => {
        const r = byId.get(String(p.id)) || { revenue: 0, count: 0 };
        return {
          id: p.id,
          name: p.name || "Untitled",
          image_url: p.image_url,
          price: Number(p.price) || 0,
          status: p.status || "draft",
          revenue: r.revenue,
          sales: r.count,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [products, txns]);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalSales = rows.reduce((s, r) => s + r.sales, 0);
  const topProduct = rows[0]?.revenue > 0 ? rows[0] : null;
  const maxRevenue = topProduct?.revenue || 1;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Package className="w-3.5 h-3.5 text-chart-4" /> Products
          </div>
          <p className="text-lg font-display font-bold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <ShoppingCart className="w-3.5 h-3.5 text-chart-3" /> Units Sold
          </div>
          <p className="text-lg font-display font-bold text-chart-3">{totalSales}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <DollarSign className="w-3.5 h-3.5 text-accent" /> Revenue
          </div>
          <p className="text-lg font-display font-bold text-accent">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Product ranking list */}
      {rows.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No products yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add products to your store to track which ones sell best.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
              {r.image_url ? (
                <img src={r.image_url} alt={r.name} className="w-9 h-9 rounded-md object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  {i === 0 && topProduct && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-chart-3/15 text-chart-3 shrink-0">
                      <Crown className="w-2.5 h-2.5" /> Best
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">${r.price.toFixed(2)} list</span>
                  <span className="text-[11px] text-muted-foreground">{r.sales} sale{r.sales === 1 ? "" : "s"}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${r.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {r.status}
                  </span>
                </div>
                {/* Revenue bar */}
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-chart-4/70" style={{ width: `${(r.revenue / maxRevenue) * 100}%` }} />
                </div>
              </div>
              <p className="text-sm font-display font-bold text-accent whitespace-nowrap shrink-0">
                ${r.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}