import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Upload, ImageIcon, Zap, DollarSign, Package, Globe,
  Users, Lock, ChevronDown, CheckCircle2, X, Tag, Layers
} from "lucide-react";

const CATEGORIES = ["Digital Download", "Preset Pack", "Course / Tutorial", "Template", "Audio Pack", "Merchandise", "Membership", "Other"];

const VISIBILITY_OPTIONS = [
  { value: "public",      label: "Public",      IconComp: Globe,  desc: "Anyone can buy" },
  { value: "subscribers", label: "Subscribers", IconComp: Users,  desc: "Subs only" },
  { value: "private",     label: "Private",     IconComp: Lock,   desc: "Hidden" },
];

export default function AddProduct() {
  const [name, setName]                     = useState("");
  const [description, setDescription]       = useState("");
  const [price, setPrice]                   = useState("");
  const [category, setCategory]             = useState("");
  const [visibility, setVisibility]         = useState("public");
  const [streamingEnabled, setStreaming]    = useState(false);
  const [streamingPrice, setStreamingPrice] = useState("");
  const [inventoryEnabled, setInventory]    = useState(false);
  const [inventory, setInventoryCount]      = useState("");
  const [productFile, setProductFile]       = useState(null);
  const [imageFile, setImageFile]           = useState(null);
  const [fileDrag, setFileDrag]             = useState(false);
  const [imgDrag, setImgDrag]               = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Add Product</h1>
          <p className="text-muted-foreground mt-1">List a new product in your CreatorVault store.</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
          <Zap className="w-3 h-3" /> $STREAMING Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left — Uploads + Visibility */}
        <div className="lg:col-span-2 space-y-5">

          {/* Product Image */}
          <div>
            <Label className="mb-2 block">Product Image</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setImgDrag(true); }}
              onDragLeave={() => setImgDrag(false)}
              onDrop={(e) => { e.preventDefault(); setImgDrag(false); const f = e.dataTransfer.files[0]; if (f) setImageFile(f); }}
              onClick={() => document.getElementById("img-input").click()}
              className={`h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative
                ${imgDrag ? "border-primary bg-primary/10" : imageFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
            >
              <input id="img-input" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
              {imageFile ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-accent mb-2" />
                  <p className="text-xs text-foreground truncate max-w-[80%]">{imageFile.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setImageFile(null); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload product image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG — 1:1 recommended</p>
                </>
              )}
            </div>
          </div>

          {/* Digital File */}
          <div>
            <Label className="mb-2 block">Product File <span className="text-muted-foreground text-xs">(digital)</span></Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setFileDrag(true); }}
              onDragLeave={() => setFileDrag(false)}
              onDrop={(e) => { e.preventDefault(); setFileDrag(false); const f = e.dataTransfer.files[0]; if (f) setProductFile(f); }}
              onClick={() => document.getElementById("file-input").click()}
              className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative
                ${fileDrag ? "border-primary bg-primary/10" : productFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
            >
              <input id="file-input" type="file" className="hidden" onChange={(e) => setProductFile(e.target.files[0])} />
              {productFile ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-accent mb-1" />
                  <p className="text-xs text-foreground truncate max-w-[80%]">{productFile.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setProductFile(null); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">ZIP, PDF, MP3, etc.</p>
                </>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <Label className="mb-2 block">Visibility</Label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map(({ value, label, IconComp }) => (
                <button key={value} onClick={() => setVisibility(value)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all
                    ${visibility === value ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                  <IconComp className={`w-4 h-4 ${visibility === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${visibility === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Details + Pricing + Monetization */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <Label className="mb-1.5 block">Product Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name..." className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what's included, format, usage..." className="bg-secondary border-border h-28 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border pl-8" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-secondary text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Monetization Options */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold text-foreground">Monetization Options</h3>
            </div>

            {/* $STREAMING Toggle */}
            <div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">$STREAMING Unlock</p>
                    <p className="text-xs text-muted-foreground">Allow purchase with $STREAMING tokens</p>
                  </div>
                </div>
                <Switch checked={streamingEnabled} onCheckedChange={setStreaming} />
              </div>
              {streamingEnabled && (
                <div className="mt-2 pl-2 flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">$STREAMING price</Label>
                  <Input type="number" value={streamingPrice} onChange={(e) => setStreamingPrice(e.target.value)} placeholder="100" className="bg-secondary border-border h-8 text-sm w-28" />
                </div>
              )}
            </div>

            {/* Inventory Toggle */}
            <div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Inventory Limit</p>
                    <p className="text-xs text-muted-foreground">For physical / limited merch</p>
                  </div>
                </div>
                <Switch checked={inventoryEnabled} onCheckedChange={setInventory} />
              </div>
              {inventoryEnabled && (
                <div className="mt-2 pl-2 flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Stock qty</Label>
                  <Input type="number" value={inventory} onChange={(e) => setInventoryCount(e.target.value)} placeholder="50" className="bg-secondary border-border h-8 text-sm w-28" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border">Save as Draft</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 gap-2">
              <Package className="w-4 h-4" /> Publish Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}