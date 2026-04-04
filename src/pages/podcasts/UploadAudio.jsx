import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Zap } from "lucide-react";

export default function UploadAudio() {
  const [monetize, setMonetize] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Upload Audio</h1>
        <p className="text-muted-foreground mt-1">Upload a new podcast episode.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div>
          <Label>Audio File</Label>
          <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">MP3, WAV, AAC — Max 500MB</p>
          </div>
        </div>
        <div><Label>Episode Title</Label><Input placeholder="Episode title" className="mt-1.5 bg-secondary border-border" /></div>
        <div><Label>Series</Label><Input placeholder="Series name (optional)" className="mt-1.5 bg-secondary border-border" /></div>
        <div><Label>Description</Label><Textarea placeholder="Episode description..." className="mt-1.5 bg-secondary border-border h-24" /></div>
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Enable Monetization</p>
                <p className="text-xs text-muted-foreground">Allow $STREAMING boosts</p>
              </div>
            </div>
            <Switch checked={monetize} onCheckedChange={setMonetize} />
          </div>
        </div>
        <div className="flex gap-3"><Button variant="outline" className="flex-1">Save Draft</Button><Button className="flex-1 bg-primary hover:bg-primary/90">Publish</Button></div>
      </div>
    </div>
  );
}