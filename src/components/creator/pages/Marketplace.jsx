import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, DollarSign, TrendingUp, BarChart3, ShoppingBag } from "lucide-react";
import { useViewerWallet, marketplaceAPI, Page, Card, Spinner } from "@/components/creator/os";

export default function Marketplace() {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ count: 0, revenue: 0, sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    marketplaceAPI.list(wallet).then(setData).finally(() => setLoading(false));
  }, [wallet]);

  if (loading) return <Page title="Marketplace" subtitle="Manage your digital products and track sales"><Spinner /></Page>;

  const stats = [
    { label: "Products", value: data.count || 0, icon: Package, color: "text-primary" },
    { label: "Units Sold", value: data.sales || 0, icon: TrendingUp, color: "text-foreground" },
    { label: "Revenue", value: `$${(data.revenue || 0).toFixed(2)}`, icon: DollarSign, color: "text-accent" },
  ];

  return (
    <Page title="Marketplace" subtitle="Manage your digital products and track sales">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl sm:text-2xl font-display font-bold">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/marketplace/add" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
        <Link to="/marketplace/products" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
          <ShoppingBag className="w-4 h-4" /> Products
        </Link>
        <Link to="/marketplace/sales" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
          <BarChart3 className="w-4 h-4" /> Sales
        </Link>
      </div>
    </Page>
  );
}