import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Image, Zap, DollarSign, Globe, Users, Lock,
  Package, ShirtIcon, Download, CheckCircle2, X, ChevronDown
} from "lucide-react";

const CATEGORIES = ["Presets & LUTs", "Audio Samples", "Courses & Tutorials", "Templates", "eBooks & Guides", "Merch", "Bundles", "Other"];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", IconComp: Globe },
  { value: "subscribers", label: "Subscribers", IconComp: Users },
  { value: "private", label: "Private", IconComp: Lock },
];

const PRODUCT_TYPES = [
  { value: "digital", label: "Digital", IconComp: Download, desc: "File download" },
  { value: "merch", label: "Merch", IconComp: ShirtIcon, desc: "Physical item" },
  { value: "bundle", label: "Bundle", IconComp: Package, desc: "Multiple items" },
];

export default function AddProduct() {
  const [productType, setProductType] = useState("digital");
  const [visibility, setVisibility] = useState("public");
  const [streamingPrice, setStreamingPrice] = useState(false);
  const [inventory, setInventory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [imageDragging, setImageDragging] = useState(false);
  const [fileDragging, setFileDragging] = useState(false);
  const [streamingAmt, setStreamingAmt] = useState("");
  const [usdPrice, setUsdPrice] = useState("");

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Add Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product for your creator store.</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
          <Zap className="w-3 h-3" /> $STREAMING Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Images & Type */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product Image */}
          <div>
            <Label className="mb-2 block">Product Image</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setImageDragging(true); }}
              onDragLeave={() => setImageDragging(false)}
              onDrop={(e) => { e.preventDefault(); setImageDragging(false); const f = e.dataTransfer.files[0]; if (f) setImageFile(f); }}
              onClick={() => document.getElementById("img-input").click()}
              className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${imageDragging ? "border-primary bg-primary/10" : imageFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
            >
              <input id="img-input" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
              {imageFile ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-accent mb-2" />
                  <p className="text-sm font-medium text-foreground truncate max-w-[80%]">{imageFile.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setImageFile(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Image className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload product image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG · Recommended 1:1</p>
                </>
              )}
            </div>
          </div>

          {/* Product File (digital only) */}
          {productType === "digital" && (
            <div>
              <Label className="mb-2 block">Product File</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
                onDragLeave={() => setFileDragging(false)}
                onDrop={(e) => { e.preventDefault(); setFileDragging(false); const f = e.dataTransfer.files[0]; if (f) setProductFile(f); }}
                onClick={() => document.getElementById("file-input").click()}
                className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                  ${fileDragging ? "border-primary bg-primary/10" : productFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
              >
                <input id="file-input" type="file" className="hidden" onChange={(e) => setProductFile(e.target.files[0])} />
                {productFile ? (
                  <><CheckCircle2 className="w-6 h-6 text-accent mb-1" /><p className="text-xs text-foreground truncate max-w-[80%]">{productFile.name}</p></>
                ) : (
                  <><Upload className="w-6 h-6 text-muted-foreground mb-1" /><p className="text-xs text-muted-foreground">Upload digital file (ZIP, PDF…)</p></>
                )}
              </div>
            </div>
          )}

          {/* Product Type */}
          <div>
            <Label className="mb-2 block">Product Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map(({ value, label, IconComp, desc }) => (
                <button key={value} onClick={() => setProductType(value)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all
                    ${productType === value ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                  <IconComp className={`w-4 h-4 ${productType === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${productType === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <Label className="mb-2 block">Visibility</Label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map(({ value, label, IconComp }) => (
                <button key={value} onClick={() => setVisibility(value)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all
                    ${visibility === value ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                  <IconComp className={`w-4 h-4 ${visibility === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${visibility === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Details & Pricing */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <Label className="mb-1.5 block">Product Name</Label>
              <Input placeholder="e.g. Cinematic Preset Pack Vol.3" className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea placeholder="Describe what's included, who it's for, what they'll get..." className="bg-secondary border-border h-28 resize-none" />
            </div>
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <div className="relative">
                <select className="w-full h-9 px-3 rounded-md border border-input bg-secondary text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input type="number" value={usdPrice} onChange={(e) => setUsdPrice(e.target.value)} placeholder="24.99" className="bg-secondary border-border pl-8" />
                </div>
              </div>
              {productType === "merch" && (
                <div>
                  <Label className="mb-1.5 block">Inventory</Label>
                  <Input type="number" placeholder="50" className="bg-secondary border-border" />
                </div>
              )}
            </div>
          </div>

          {/* Pricing options */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold text-foreground">$STREAMING Pricing</h3>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Enable $STREAMING price</p>
                <p className="text-xs text-muted-foreground">Allow buyers to pay with $STREAMING tokens</p>
              </div>
              <Switch checked={streamingPrice} onCheckedChange={setStreamingPrice} />
            </div>
            {streamingPrice && (
              <div className="flex items-center gap-3 pl-1">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">$STREAMING price</Label>
                <div className="relative">
                  <Zap className="w-3.5 h-3.5 text-accent absolute left-2.5 top-2.5" />
                  <Input type="number" value={streamingAmt} onChange={(e) => setStreamingAmt(e.target.value)} placeholder="120" className="bg-secondary border-border h-9 text-sm pl-7 w-32" />
                </div>
              </div>
            )}
            {productType === "merch" && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Track Inventory</p>
                  <p className="text-xs text-muted-foreground">Limit stock and track quantities</p>
                </div>
                <Switch checked={inventory} onCheckedChange={setInventory} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border">Save as Draft</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 gap-2">
              <Upload className="w-4 h-4" /> Publish Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}