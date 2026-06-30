import React from "react";
import { ShoppingBag, Tag } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
      <div className="aspect-square bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-1.5 flex-1 flex flex-col">
        <p className="font-medium leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs text-muted-foreground capitalize inline-flex items-center gap-1">
          <Tag className="w-3 h-3" /> {product.category || "uncategorized"}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display font-bold">${(product.price || 0).toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">{product.sales_count || 0} sold</span>
        </div>
      </div>
    </div>
  );
}