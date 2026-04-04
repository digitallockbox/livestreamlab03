import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap, Link as LinkIcon, Tag, Percent, Globe,
  ChevronDown, CheckCircle2, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["Tech", "Gaming", "Audio", "Streaming", "Lifestyle", "Fitness", "Finance", "Other"];

const PAYOUT_TYPES = [
  { value: "cps", label: "CPS — Cost per Sale", desc: "% of each sale value" },
  { value: "cpl", label: "CPL — Cost per Lead", desc: "Flat fee per sign-up" },
  { value: "cpa", label: "CPA — Cost per Action", desc: "Custom action trigger" },
];

export default function AddAffiliateLink() {
  const [streamingBonus, setStreamingBonus] = useState(false);
  const [streamingAmt, setStreamingAmt] = useState("");
  const [payoutType, setPayoutType] = useState("cps");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Link Added!</h2>
        <p className="text-muted-foreground mb-6">Your affiliate link is live and ready to track.</p>
        <div className="flex justify-center gap-3">
          <Link to="/affiliates">
            <Button variant="outline" className="border-border">Back to Dashboard</Button>
          </Link>
          <Button onClick={() => setSaved(false)} className="bg-primary hover:bg-primary/90">Add Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/affiliates">
          <Button variant="ghost" size="icon" className="text-muted-foreground"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Add Affiliate Link</h1>
          <p className="text-muted-foreground mt-1">Set up a new affiliate partnership with $STREAMING bonuses.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Link Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Link Details</h3>
          </div>
          <div>
            <Label className="mb-1.5 block">Link Title</Label>
            <Input placeholder="e.g. SecretLab Gaming Chair" className="bg-secondary border-border" />
          </div>
          <div>
            <Label className="mb-1.5 block">Affiliate URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="https://partner.example.com/ref/yourcode" className="bg-secondary border-border pl-9" />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Paste your full affiliate tracking URL here.</p>
          </div>
          <div>
            <Label className="mb-1.5 block">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea placeholder="What is this affiliate link for? Who does it benefit?" className="bg-secondary border-border resize-none h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <div className="relative">
                <select className="w-full h-9 px-3 rounded-md border border-input bg-secondary text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Commission Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input type="number" placeholder="5" className="bg-secondary border-border pl-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Payout Type */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-chart-3" />
            <h3 className="font-display font-semibold text-foreground">Payout Type</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PAYOUT_TYPES.map(({ value, label, desc }) => (
              <button key={value} onClick={() => setPayoutType(value)}
                className={`p-3 rounded-xl border text-left transition-all
                  ${payoutType === value ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                <p className={`text-sm font-semibold ${payoutType === value ? "text-primary" : "text-foreground"}`}>{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* $STREAMING Bonus */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">$STREAMING Bonus</h3>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
            <div>
              <p className="text-sm font-medium text-foreground">Enable $STREAMING bonus per conversion</p>
              <p className="text-xs text-muted-foreground mt-0.5">Viewers earn $STREAMING tokens when they convert through your link</p>
            </div>
            <Switch checked={streamingBonus} onCheckedChange={setStreamingBonus} />
          </div>
          {streamingBonus && (
            <div className="flex items-center gap-3 pl-1">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Bonus per conversion</Label>
              <div className="relative">
                <Zap className="w-3.5 h-3.5 text-accent absolute left-2.5 top-2.5" />
                <Input type="number" value={streamingAmt} onChange={(e) => setStreamingAmt(e.target.value)} placeholder="10" className="bg-secondary border-border h-9 text-sm pl-7 w-32" />
              </div>
              <span className="text-sm text-muted-foreground">$STREAMING / conversion</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/affiliates" className="flex-1">
            <Button variant="outline" className="w-full border-border">Cancel</Button>
          </Link>
          <Button onClick={() => setSaved(true)} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
            <CheckCircle2 className="w-4 h-4" /> Save Affiliate Link
          </Button>
        </div>
      </div>
    </div>
  );
}