import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Zap, Link as LinkIcon } from "lucide-react";

export default function AddAffiliateLink() {
  const [streamingBonus, setStreamingBonus] = useState(false);
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Add Affiliate Link</h1>
        <p className="text-muted-foreground mt-1">Add a new affiliate partnership link.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div><Label>Link Title</Label><Input className="mt-1.5 bg-secondary border-border" placeholder="e.g. Gaming Chair - SecretLab" /></div>
        <div>
          <Label>Affiliate URL</Label>
          <div className="relative mt-1.5">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 bg-secondary border-border" placeholder="https://..." />
          </div>
        </div>
        <div>
          <Label>Category</Label>
          <Select>
            <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="streaming">Streaming</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Commission Rate (%)</Label><Input type="number" className="mt-1.5 bg-secondary border-border w-32" placeholder="5" /></div>
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">$STREAMING Bonus</p>
                <p className="text-xs text-muted-foreground">Earn extra $STREAMING per conversion</p>
              </div>
            </div>
            <Switch checked={streamingBonus} onCheckedChange={setStreamingBonus} />
          </div>
          {streamingBonus && (
            <div className="mt-4"><Label>Bonus per conversion ($STREAMING)</Label><Input type="number" className="mt-1.5 bg-secondary border-border w-40" placeholder="10" /></div>
          )}
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90">Save Affiliate Link</Button>
      </div>
    </div>
  );
}