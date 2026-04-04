import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingBag, DollarSign, Zap, Search, Edit3, MoreVertical, Package, TrendingUp } from "lucide-react";

const MOCK_PRODUCTS = [
  { id: 1, name: "Preset Pack v2",         price: 24.99, streamingPrice: 120, status: "published", sales: 18, revenue: 449.82, category: "Preset Pack",    hasStreaming: true },
  { id: 2, name: "Audio Samples Pack",     price: 14.99, streamingPrice: 80,  status: "published", sales: 12, revenue: 179.88, category: "Audio Pack",     hasStreaming: true },
  { id: 3, name: "Editing Course",         price: 49.99, streamingPrice: 0,   status: "published", sales: 8,  revenue: 399.92, category: "Course",         hasStreaming: false },
  { id: 4, name: "Template Bundle",        price: 9.99,  streamingPrice: 50,  status: "draft",     sales: 0,  revenue: 0,      category: "Template",       hasStreaming: true },
  { id: 5, name: "Lightroom Presets",      price: 19.99, streamingPrice: 95,  status: "published", sales: 22, revenue: 439.78, category: "Preset Pack",    hasStreaming: true },
  { id: 6, name: "Creator Merch — Hoodie", price: 45.00, streamingPrice: 0,   status: "published", sales: 5,  revenue: 225.00, category: "Merchandise",    hasStreaming: false },
  { id: 7, name: "Workflow Masterclass",   price: 79.99, streamingPrice: 300, status: "draft",     sales: 0,  revenue: 0,      category: "Course",         hasStreaming: true },
  { id: 8, name: "Brand Kit — Pro",        price: 34.99, streamingPrice: 160, status: "published", sales: 9,  revenue: 314.91, category: "Digital Download",hasStreaming: true },
];

const STATUS_STYLES = {
  published: "bg-accent/10 text-accent border-accent/20",
  draft:     "bg-muted text-muted-foreground border-border",
};

const SUMMARY = [
  { label: "Total Products", value: "8",       icon: Package,    color: "text-primary" },
  { label: "Published",      value: "6",       icon: ShoppingBag,color: "text-accent" },
  { label: "Total Revenue",  value: "$2,009",  icon: DollarSign, color: "text-chart-3" },
  { label: "$STREAMING",     value: "6 items", icon: Zap,        color: "text-chart-4" },
];

export default function ProductList() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_PRODUCTS
    .filter(p => {
      if (tab === "all")       return true;
      if (tab === "streaming") return p.hasStreaming;
      return p.status === tab || p.category.toLowerCase().includes(tab);
    })
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SUMMARY.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-display font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 bg-secondary border-border" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All ({MOCK_PRODUCTS.length})</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="streaming">$STREAMING</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
              <div className="aspect-square bg-secondary relative flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                <Badge className={`absolute top-2 left-2 text-xs border ${STATUS_STYLES[product.status]}`}>
                  {product.status}
                </Badge>
                {product.hasStreaming && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-accent" />
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <h3 className="text-sm font-medium text-foreground line-clamp-1 mt-0.5">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">${product.price}</span>
                  {product.hasStreaming && <span className="text-xs text-accent">{product.streamingPrice} $S</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" /> {product.sales} sales
                  {product.revenue > 0 && <><span>·</span><span className="text-chart-3">${product.revenue.toFixed(0)}</span></>}
                </div>
              </div>
              <div className="px-3 pb-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1.5 border-border">
                  <Edit3 className="w-3 h-3" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {MOCK_PRODUCTS.length} products</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="border-border">Previous</Button>
          <Button size="sm" variant="outline" className="border-border">Next</Button>
        </div>
      </div>
    </div>
  );
}