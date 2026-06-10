import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingBag, Zap, Edit3, MoreVertical, Search, Download, ShirtIcon, Loader2 } from "lucide-react";
import { creatorStoreApi } from "@/lib/creatorApi";

const STATUS_STYLES = {
  published: "bg-accent/10 text-accent border-accent/20",
  draft: "bg-muted text-muted-foreground border-border",
};

const TYPE_ICONS = {
  digital: Download,
  merch: ShirtIcon,
};

export default function ProductList() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorStoreApi.listProducts();
        setProducts(data);
      } catch (err) {
        console.error('Product list load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products
    .filter(p => {
      if (tab === "all") return true;
      if (tab === "draft" || tab === "published") return p.status === tab;
      if (tab === "streaming") return p.streaming_price > 0;
      if (tab === "digital") return p.type === "digital";
      if (tab === "merch") return p.type === "merch";
      return true;
    })
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = products.filter(p => p.status === "published").reduce((s, p) => s + (p.revenue || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your entire product catalog.</p>
        </div>
        <Link to="/store/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse"><div className="h-6 bg-muted rounded w-16 mb-2"></div><div className="h-4 bg-muted rounded w-12"></div></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Products", value: products.length },
            { label: "Published", value: products.filter(p => p.status === "published").length },
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}` },
            { label: "$STREAMING Enabled", value: products.filter(p => p.streaming_price > 0).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 bg-secondary border-border" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="streaming">$STREAMING</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="merch">Merch</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const TypeIcon = TYPE_ICONS[product.type] || ShoppingBag;
            return (
              <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
                {/* Image */}
                <div className="aspect-square bg-secondary flex items-center justify-center relative">
                  <TypeIcon className="w-12 h-12 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  <Badge className={`absolute top-2 left-2 text-xs border ${STATUS_STYLES[product.status]}`}>
                    {product.status}
                  </Badge>
                  {product.streaming_price > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-accent" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-sm font-bold text-foreground">${product.price}</span>
                      {product.streaming_price > 0 && (
                        <span className="text-xs text-accent ml-2">/ {product.streaming_price} $S</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{product.sales || 0} sold</span>
                  </div>
                </div>
                {/* Footer */}
                <div className="px-3 pb-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1.5 border-border">
                    <Edit3 className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {products.length} products</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="border-border">Previous</Button>
          <Button size="sm" variant="outline" className="border-border">Next</Button>
        </div>
      </div>
    </div>
  );
}