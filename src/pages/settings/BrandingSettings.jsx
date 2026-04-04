import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function BrandingSettings() {
  const [color, setColor] = useState("#7c3aed");
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Channel Branding</h1>
        <p className="text-muted-foreground mt-1">Customize your channel's visual identity.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div>
          <Label>Channel Banner</Label>
          <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Upload banner (1920×480 recommended)</p>
          </div>
        </div>
        <div>
          <Label>Channel Logo</Label>
          <div className="mt-1.5 h-24 w-24 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label>Accent Color</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
            <Input value={color} onChange={e => setColor(e.target.value)} className="bg-secondary border-border w-36 font-mono" />
          </div>
        </div>
        <div><Label>Channel Tagline</Label><Input className="mt-1.5 bg-secondary border-border" placeholder="Your short tagline..." /></div>
        <Button className="bg-primary hover:bg-primary/90">Save Branding</Button>
      </div>
    </div>
  );
}