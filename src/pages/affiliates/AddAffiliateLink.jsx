import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Link as LinkIcon, Tag, ChevronDown, CheckCircle2, ArrowLeft, Loader2, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";

const CATEGORIES = ["Tech", "Gaming", "Audio", "Streaming", "Lifestyle", "Fitness", "Finance", "Other"];

// AddAffiliateLink — create a new referral link bound to the connected creator.
// Persists to the AffiliateLink entity with creator_wallet so the dashboard
// can filter and report per-link clicks, conversions, and commission.
export default function AddAffiliateLink() {
  const navigate = useNavigate();
  const { walletAddress } = useIdentity();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Tech");
  const [streamingBonus, setStreamingBonus] = useState(false);
  const [streamingAmt, setStreamingAmt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!walletAddress) { setError("Connect your wallet first."); return; }
    if (!title.trim() || !url.trim()) { setError("Title and URL are required."); return; }
    setSaving(true);
    setError("");
    try {
      await base44.entities.AffiliateLink.create({
        title: title.trim(),
        url: url.trim(),
        category,
        creator_wallet: walletAddress,
        clicks: 0,
        conversions: 0,
        commission_earned: 0,
        streaming_bonus: streamingBonus ? (Number(streamingAmt) || 0) : 0,
      });
      navigate("/affiliates");
    } catch (e) {
      setError(e?.message || "Failed to save link.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/affiliates" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Add Affiliate Link</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up a referral link to track clicks and commission.</p>
        </div>
      </div>

      {/* Link details */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold">Link Details</h3>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Link Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SecretLab Gaming Chair" className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Affiliate URL</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://partner.example.com/ref/yourcode" className="w-full rounded-md border border-input bg-secondary pl-9 pr-3 py-2 text-sm focus:outline-none" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Paste your full affiliate tracking URL.</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Category</label>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm appearance-none focus:outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* $STREAMING bonus */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="font-display font-semibold">$STREAMING Bonus</h3>
        </div>
        <label className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20 cursor-pointer">
          <div>
            <p className="text-sm font-medium">Enable $STREAMING bonus per conversion</p>
            <p className="text-xs text-muted-foreground mt-0.5">Track a token bonus awarded on each conversion.</p>
          </div>
          <input type="checkbox" checked={streamingBonus} onChange={(e) => setStreamingBonus(e.target.checked)} className="w-4 h-4 accent-accent" />
        </label>
        {streamingBonus && (
          <div className="flex items-center gap-3 pl-1">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Bonus per conversion</label>
            <div className="relative">
              <Zap className="w-3.5 h-3.5 text-accent absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input type="number" value={streamingAmt} onChange={(e) => setStreamingAmt(e.target.value)} placeholder="10" className="rounded-md border border-input bg-secondary h-9 text-sm pl-7 w-32 focus:outline-none" />
            </div>
            <span className="text-sm text-muted-foreground">$STREAMING / conversion</span>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/affiliates" className="flex-1 h-11 inline-flex items-center justify-center rounded-md border border-border text-sm hover:bg-muted">Cancel</Link>
        <button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()} className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Link
        </button>
      </div>
    </div>
  );
}