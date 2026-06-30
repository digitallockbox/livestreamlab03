import { ShoppingBag } from "lucide-react";

export default function MarketplaceCard({ sales = 0, total = 0 }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Marketplace Sales</h3>
      </div>
      <p className="text-2xl font-display font-bold">{sales}</p>
      <p className="text-xs text-muted-foreground">${(total || 0).toFixed(2)} revenue</p>
    </div>
  );
}