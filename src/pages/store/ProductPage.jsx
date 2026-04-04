import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Zap, ShoppingCart, Star, CheckCircle2,
  Share2, Heart, Package, Bell, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const RELATED = [
  { id: 2, name: "Audio Samples Pack",  price: 14.99, streamingPrice: 80,  hasStreaming: true },
  { id: 5, name: "Lightroom Presets",   price: 19.99, streamingPrice: 95,  hasStreaming: true },
  { id: 8, name: "Brand Kit — Pro",     price: 34.99, streamingPrice: 160, hasStreaming: true },
];

const INCLUDES = [
  "50+ professional color grading presets",
  "20 cinematic overlay effects",
  "10 custom LUTs for video editing",
  "Compatible with Lightroom, Premiere Pro, DaVinci",
  "Lifetime access & free updates",
];

const REVIEWS = [
  { user: "creator_pro", rating: 5, comment: "Absolutely transformed my workflow. Worth every token.", time: "2d ago" },
  { user: "visual_lab",  rating: 5, comment: "Best preset pack I've ever used. The LUTs are incredible.", time: "5d ago" },
  { user: "photog_99",   rating: 4, comment: "Great quality, easy to apply. Would love more skin-tone options.", time: "1w ago" },
];

export default function ProductPage() {
  const [liked, setLiked]           = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Preset Pack v2</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Product Image */}
          <div className="space-y-3">
            <div className="aspect-square bg-card border border-border rounded-2xl flex items-center justify-center relative overflow-hidden">
              <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
              <Badge className="absolute top-4 left-4 bg-primary/10 text-primary border-primary/20">Preset Pack</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-card border border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors">
                  <Package className="w-5 h-5 text-muted-foreground/40" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">Digital Download</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1"><Zap className="w-2.5 h-2.5" />$STREAMING</Badge>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground leading-tight">Preset Pack v2</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Professional-grade presets for your creative workflow. Includes 50+ color grading presets, cinematic LUTs, and overlay effects — built for creators who demand quality.
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-chart-3 fill-chart-3" />)}
              </div>
              <span className="text-sm text-muted-foreground">4.8 · 47 reviews</span>
            </div>

            {/* Price */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-display font-bold text-foreground">$24.99</span>
                  <span className="text-sm text-muted-foreground ml-2">USD</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent font-semibold">
                    <Zap className="w-4 h-4" /> 120 $STREAMING
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Token alternative</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <Button
                  className={`w-full h-12 text-base gap-2 transition-all ${addedToCart ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90"}`}
                  onClick={() => setAddedToCart(!addedToCart)}
                >
                  {addedToCart ? <><CheckCircle2 className="w-5 h-5" /> Added to Cart</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-accent/30 text-accent hover:bg-accent/10">
                  <Zap className="w-5 h-5" /> Buy with $STREAMING
                </Button>
              </div>
            </div>

            {/* What's Included */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">What's included</p>
              <div className="space-y-2">
                {INCLUDES.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={() => setLiked(!liked)}>
                <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : ""}`} /> {liked ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" className="border-border gap-1.5">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Creator Card */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-lg">S</div>
            <div>
              <p className="font-medium text-foreground">@SamsCreates</p>
              <p className="text-xs text-muted-foreground">48.2K subscribers · 14 products</p>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2 rounded-xl">
            <Bell className="w-4 h-4" /> Subscribe
          </Button>
        </div>

        {/* Reviews */}
        <div className="mb-10">
          <h3 className="font-display font-semibold text-foreground text-lg mb-4">Reviews</h3>
          <div className="space-y-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">{r.user[0].toUpperCase()}</div>
                    <span className="text-sm font-medium text-foreground">@{r.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 text-chart-3 fill-chart-3" />)}</div>
                    <span className="text-xs text-muted-foreground">{r.time}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-4">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RELATED.map(p => (
              <Link key={p.id} to={`/store/product/${p.id}`}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="aspect-square bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{p.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold text-foreground">${p.price}</span>
                      {p.hasStreaming && <span className="text-xs text-accent flex items-center gap-0.5"><Zap className="w-3 h-3" />{p.streamingPrice} $S</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}