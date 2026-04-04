import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Image, Zap } from "lucide-react";

export default function UploadVideo() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Upload Video</h1>
        <p className="text-muted-foreground mt-1">Upload and monetize your video content.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div>
          <Label>Video File</Label>
          <div className="mt-1.5 h-40 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM — Max 10GB</p>
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input placeholder="Video title" className="mt-1.5 bg-secondary border-border" />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea placeholder="Describe your video..." className="mt-1.5 bg-secondary border-border h-24" />
        </div>

        <div>
          <Label>Thumbnail</Label>
          <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Image className="w-6 h-6 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Upload thumbnail (1280×720)</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Monetization</h3>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Premium Content</p>
                <p className="text-xs text-muted-foreground">Require $STREAMING to unlock</p>
              </div>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>
          {isPremium && (
            <div className="mt-4">
              <Label>Unlock Price ($STREAMING)</Label>
              <Input type="number" placeholder="50" className="mt-1.5 bg-secondary border-border w-32" />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1">Save as Draft</Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90">Publish Video</Button>
        </div>
      </div>
    </div>
  );
}