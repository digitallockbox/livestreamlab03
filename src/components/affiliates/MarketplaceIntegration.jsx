import React, { useState } from "react";
import { ShoppingBag, Link2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MarketplaceIntegration() {
  const [products] = useState([
    {
      id: 1,
      name: "Creator Starter Pack",
      category: "bundle",
      affiliateRate: "10%",
      sales: 145,
      revenue: "$4,350",
      status: "featured",
    },
    {
      id: 2,
      name: "Premium Streaming Setup",
      category: "hardware",
      affiliateRate: "8%",
      sales: 87,
      revenue: "$8,700",
      status: "active",
    },
    {
      id: 3,
      name: "Audio Pro Toolkit",
      category: "software",
      affiliateRate: "12%",
      sales: 234,
      revenue: "$5,616",
      status: "active",
    },
    {
      id: 4,
      name: "Lighting & Backdrop Kit",
      category: "hardware",
      affiliateRate: "9%",
      sales: 156,
      revenue: "$3,900",
      status: "active",
    },
  ]);

  const categoryIcons = {
    bundle: ShoppingBag,
    hardware: ShoppingBag,
    software: ShoppingBag,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Marketplace Products</h3>
      </div>

      {/* Products Table */}
      <div className="space-y-2">
        {products.map(product => (
          <div key={product.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{product.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="capitalize">{product.category}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {product.affiliateRate}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{product.sales} sales</p>
              <p className="text-sm font-semibold text-accent mt-0.5">{product.revenue}</p>
            </div>
            {product.status === "featured" && (
              <Badge className="ml-4 bg-accent/10 text-accent border-accent/20 text-xs">Featured</Badge>
            )}
          </div>
        ))}
      </div>

      {/* Marketplace Stats */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm text-foreground">Affiliate-Driven Sales</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-lg font-bold text-primary">$26,566</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unique Affiliates</p>
            <p className="text-lg font-bold text-primary">187</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg. Order Value</p>
            <p className="text-lg font-bold text-primary">$183.40</p>
          </div>
        </div>
      </div>
    </div>
  );
}