import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Zap, ShoppingCart, Star, Download, CheckCircle2,
  Share2, Bell, Package, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const RELATED = [
  { id: 2, name: "Audio Samples Pack", price: 14.99, streamingPrice: 80, sales: 12 },
  { id: 3, name: "Editing Course", price: 49.99, streamingPrice: null, sales: 8 },
  { id: 6, name: "LUT Bundle Pro", price: 34.99, streamingPrice: 160, sales: 6 },
  { id: 8, name: "Brand Kit Vol.1", price: 19.99, streamingPrice: 90, sales: 9 },
];

const FEATURES = [
  "50+ professional color grading presets",
  "Compatible with Premiere Pro, DaVinci Resolve, Final Cut",
  "Instant digital download after purchase",
  "Lifetime updates included",
  "Step-by-step installation guide",
];

export default function ProductPage() {
  const [subscribed, setSubscribed] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
          <span>/</span>
          <span className="text-foreground">Preset Pack v2</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-card border border-border rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <ShoppingBag className="w-24 h-24 text-muted-foreground/30" />
              <Badge className="absolute top-4 left-4 bg-accent/20 text-accent border-accent/30 gap-1">
                <Zap className="w-3 h-3" /> $STREAMING
              </Badge>
              <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30">
                Bestseller
              </Badge>
            </div>
            {/* Thumbnails row */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl bg-secondary border ${i === 0 ? "border-primary/50" : "border-border hover:border-primary/30"} flex items-center justify-center cursor-pointer transition-all`}>
                  <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-secondary text-muted-foreground border-border text-xs">Presets & LUTs</Badge>
                <Badge className="bg-secondary text-muted-foreground border-border text-xs">Digital</Badge>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground leading-tight">Preset Pack v2</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-sm text-muted-foreground">4.9 (128 reviews)</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">18 sold</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Professional-grade color grading presets for your creative workflow. Perfect for YouTube, Instagram, and short-form content. Achieve cinematic looks in seconds.
            </p>

            {/* Features */}
            <div className="space-y-2">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display font-bold text-foreground">$24.99</span>
                <span className="text-sm text-muted-foreground line-through">$39.99</span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">-38%</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-accent font-medium">120 $STREAMING</span>
                <span className="text-muted-foreground">alternative price</span>
              </div>

              <div className="space-y-3 pt-2">
                <Button className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart — $24.99
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 text-accent border-accent/30 hover:bg-accent/10">
                  <Zap className="w-5 h-5" /> Buy with 120 $STREAMING
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4" /> Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Creator Card */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-display font-bold text-primary">S</div>
                <div>
                  <p className="text-sm font-medium text-foreground">@SamsCreates</p>
                  <p className="text-xs text-muted-foreground">48.2K followers · 8 products</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setSubscribed(!subscribed)}
                className={subscribed ? "bg-secondary text-foreground border border-border" : "bg-primary hover:bg-primary/90"}>
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                {subscribed ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground text-xl">Related Products</h2>
            <Link to="/store/products">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">View All <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {RELATED.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group">
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground">${p.price}</span>
                    {p.streamingPrice && <span className="text-xs text-accent">/ {p.streamingPrice} $S</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}