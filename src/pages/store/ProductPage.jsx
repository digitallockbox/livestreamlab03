import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, ShoppingCart } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-card border border-border rounded-2xl flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Preset Pack v2</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Professional-grade presets for your creative workflow. Includes 50+ color grading presets, overlays, and effects.
            </p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-display font-bold text-foreground">$24.99</span>
            <span className="text-sm text-accent font-medium">or 120 $STREAMING</span>
          </div>
          <div className="space-y-3">
            <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-base gap-2">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
            <Button variant="outline" className="w-full h-12 text-base gap-2 text-accent border-accent/30 hover:bg-accent/10">
              <Zap className="w-5 h-5" /> Buy with $STREAMING
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}