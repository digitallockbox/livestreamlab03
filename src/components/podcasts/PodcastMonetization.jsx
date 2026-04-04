import React, { useState } from "react";
import { Zap, Radio, TrendingUp, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function PodcastMonetization() {
  const [monetization, setMonetization] = useState({
    type: "free-ads",
    sponsorshipRate: 5000,
    premiumTier: false,
    tokenBonus: 500,
  });

  const types = [
    {
      id: "free-ads",
      label: "Free + Dynamic Ads",
      desc: "AVOD with Overwatch optimization",
      icon: Radio,
      color: "text-chart-3",
    },
    {
      id: "sponsorship",
      label: "Sponsorship Model",
      desc: "Direct brand partnerships",
      icon: Gift,
      color: "text-accent",
    },
    {
      id: "premium-feed",
      label: "Premium Feed",
      desc: "Exclusive access to early episodes",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      id: "token-gated",
      label: "Token-Gated",
      desc: "Listener rewards via $STREAMING",
      icon: Zap,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="font-display font-semibold text-foreground">Podcast Monetization</h3>
      </div>

      {/* Monetization Types */}
      <div className="space-y-2">
        {types.map(type => {
          const Icon = type.icon;
          const isActive = monetization.type === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setMonetization({ ...monetization, type: type.id })}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary"
                  : "bg-secondary border-border hover:border-primary/50"
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${type.color}`} />
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </div>
              {isActive && <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />}
            </button>
          );
        })}
      </div>

      {/* Configuration */}
      {monetization.type === "sponsorship" && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <label className="text-xs font-semibold text-foreground block mb-2">Sponsorship Rate (CPM - per 1k listeners)</label>
          <Input
            type="number"
            value={monetization.sponsorshipRate}
            onChange={(e) => setMonetization({ ...monetization, sponsorshipRate: parseFloat(e.target.value) })}
            placeholder="5000"
            className="bg-secondary border-border"
          />
        </div>
      )}

      {monetization.type === "token-gated" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <label className="text-xs font-semibold text-foreground block mb-2">Listener Reward per Episode ($STREAMING)</label>
          <Input
            type="number"
            value={monetization.tokenBonus}
            onChange={(e) => setMonetization({ ...monetization, tokenBonus: parseInt(e.target.value) })}
            placeholder="500"
            className="bg-secondary border-border"
          />
        </div>
      )}

      {/* Ad Settings */}
      {monetization.type === "free-ads" && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border border-border" />
            <span className="text-sm font-semibold text-foreground">Host-read ads (Max $0.25/1k listeners)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border border-border" />
            <span className="text-sm font-semibold text-foreground">Dynamic mid-roll insertion</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded border border-border" />
            <span className="text-sm font-semibold text-foreground">Premium advertiser only (Higher rates)</span>
          </label>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">Overwatch handles monetization optimization. You keep 70% after platform fees.</p>
        </div>
      )}
    </div>
  );
}