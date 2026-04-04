import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingBag, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const mockProducts = [
  { id: 1, name: "Preset Pack v2", price: 24.99, streamingPrice: 120, status: "published", sales: 18, image: "" },
  { id: 2, name: "Audio Samples Pack", price: 14.99, streamingPrice: 80, status: "published", sales: 12, image: "" },
  { id: 3, name: "Editing Course", price: 49.99, streamingPrice: 0, status: "published", sales: 8, image: "" },
  { id: 4, name: "New Template Pack", price: 9.99, streamingPrice: 50, status: "draft", sales: 0, image: "" },
];

export default function ProductList() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? mockProducts : mockProducts.filter((p) => p.status === tab);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-display text-3xl font-bold text-foreground">Products</h1><p className="text-muted-foreground mt-1">All your store products.</p></div>
        <Link to="/store/add-product"><Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Product</Button></Link>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-secondary"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="published">Published</TabsTrigger><TabsTrigger value="draft">Drafts</TabsTrigger></TabsList>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all cursor-pointer">
            <div className="h-40 bg-secondary flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground text-sm">{product.name}</h3>
                <Badge className={`border-0 text-xs ${product.status === "published" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{product.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">${product.price}</span>
                <span className="text-xs text-muted-foreground">{product.sales} sales</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}