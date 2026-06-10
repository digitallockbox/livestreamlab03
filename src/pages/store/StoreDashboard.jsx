import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, DollarSign, TrendingUp, Zap, Plus, Package,
  Eye, ArrowRight, BarChart2, Loader2
} from "lucide-react";
import { creatorStoreApi } from "@/lib/creatorApi";

export default function StoreDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorStoreApi.listProducts();
        setProducts(data);
      } catch (err) {
        console.error('Store dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = products.filter(p => p.status === "published").reduce((s, p) => s + (p.revenue || 0), 0);
  const totalSales = products.reduce((s, p) => s + (p.sales || 0), 0);
  const streamingEnabled = products.filter(p => p.streaming_price > 0).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Store Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor sales, orders, and $STREAMING commerce.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/store/products">
            <Button variant="outline" className="border-border gap-2"><Eye className="w-4 h-4" /> View Products</Button>
          </Link>
          <Link to="/store/add">
            <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse"><div className="h-9 w-9 rounded-xl bg-muted mb-3"></div><div className="h-6 bg-muted rounded w-20 mb-2"></div><div className="h-4 bg-muted rounded w-16"></div></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, sub: "All time", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: "Total Sales", value: totalSales.toString(), sub: "Units sold", icon: ShoppingBag, color: "text-accent", bg: "bg-accent/10" },
            { label: "$STREAMING Enabled", value: `${streamingEnabled} products`, sub: "Accepting tokens", icon: Zap, color: "text-chart-4", bg: "bg-chart-4/10" },
            { label: "Active Products", value: products.filter(p => p.status === "published").length.toString(), sub: `${products.filter(p => p.status === "draft").length} drafts`, icon: Package, color: "text-chart-3", bg: "bg-chart-3/10" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs text-accent mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Products */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Your Products</h3>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{products.length} products</Badge>
        </div>
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Sales</th>
                  <th className="pb-3 pr-4 font-medium">Revenue</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 10).map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs border-border">{product.category}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <span>${product.price}</span>
                        {product.streaming_price > 0 && (
                          <span className="text-xs text-accent">/ {product.streaming_price} $S</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-foreground">{product.sales || 0}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-foreground">${product.revenue?.toFixed(0) || "0"}</td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${product.status === "published" ? "bg-accent/10 text-accent border-accent/20" : "bg-muted text-muted-foreground border-border"}`}>
                        {product.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            No products yet. <Link to="/store/add" className="text-primary hover:underline">Add your first product</Link>
          </div>
        )}
        {products.length > 10 && (
          <Link to="/store/products">
            <Button variant="outline" className="w-full mt-4 border-border gap-2 text-xs">
              View All Products <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Add New Product", desc: "List a digital or physical product", icon: Plus, to: "/store/add", primary: true },
          { label: "View All Products", desc: "Manage your product catalog", icon: Package, to: "/store/products", primary: false },
          { label: "Analytics", desc: "Revenue & performance deep dive", icon: BarChart2, to: "/analytics", primary: false },
        ].map(({ label, desc, icon: Icon, to, primary }) => (
          <Link key={label} to={to}>
            <div className={`p-4 rounded-2xl border cursor-pointer transition-all hover:border-primary/30 ${primary ? "bg-primary/10 border-primary/20" : "bg-card border-border"}`}>
              <Icon className={`w-5 h-5 mb-2 ${primary ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm font-medium ${primary ? "text-primary" : "text-foreground"}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}