import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Image, Zap } from "lucide-react";

export default function AddProduct() {
  const [streamingPricing, setStreamingPricing] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Add Product</h1>
        <p className="text-muted-foreground mt-1">List a new product in your store.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div><Label>Product Name</Label><Input placeholder="Product name" className="mt-1.5 bg-secondary border-border" /></div>
        <div><Label>Description</Label><Textarea placeholder="Describe your product..." className="mt-1.5 bg-secondary border-border h-24" /></div>
        <div><Label>Price (USD)</Label><Input type="number" placeholder="0.00" className="mt-1.5 bg-secondary border-border w-40" /></div>
        <div>
          <Label>Product Files</Label>
          <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Upload digital product files</p>
          </div>
        </div>
        <div>
          <Label>Product Image</Label>
          <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Image className="w-6 h-6 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Upload product image</p>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">$STREAMING Price Option</p>
                <p className="text-xs text-muted-foreground">Allow purchase with $STREAMING</p>
              </div>
            </div>
            <Switch checked={streamingPricing} onCheckedChange={setStreamingPricing} />
          </div>
          {streamingPricing && (
            <div className="mt-4"><Label>$STREAMING Price</Label><Input type="number" placeholder="100" className="mt-1.5 bg-secondary border-border w-40" /></div>
          )}
        </div>
        <div className="flex gap-3"><Button variant="outline" className="flex-1">Save Draft</Button><Button className="flex-1 bg-primary hover:bg-primary/90">Publish Product</Button></div>
      </div>
    </div>
  );
}