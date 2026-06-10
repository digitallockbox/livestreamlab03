import React, { useState, useEffect } from "react";
import { Zap, Lock, ShoppingBag, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VODMonetization({ video }) {
  const [monetization, setMonetization] = useState({
    type: "free",
    adEnabled: true,
    rentalPrice: 2.99,
    purchasePrice: 9.99,
    tokenGateAmount: 1000,
  });

  useEffect(() => {
    if (video) {
      setMonetization({
        type: video.monetization_type || "free",
        adEnabled: video.ad_enabled ?? true,
        rentalPrice: video.rental_price || 2.99,
        purchasePrice: video.purchase_price || 9.99,
        tokenGateAmount: video.token_gate_amount || 1000,
      });
    }
  }, [video]);

  const types = [
    { id: "free", label: "Free (AVOD)", desc: "Ads only", icon: BarChart3, color: "text-muted-foreground" },
    { id: "rental", label: "Rental (TVOD)", desc: "$2.99 for 48h", icon: ShoppingBag, color: "text-chart-3" },
    { id: "purchase", label: "Purchase (TVOD)", desc: "$9.99 one-time", icon: ShoppingBag, color: "text-accent" },
    { id: "subscription", label: "Subscription (SVOD)", desc: "Creator pass only", icon: Lock, color: "text-primary" },
    { id: "token-gated", label: "Token-Gated", desc: "$STREAMING balance", icon: Zap, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="font-display font-semibold text-foreground">VOD Monetization</h3>
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
      {monetization.type === "rental" && (
        <div className="bg-chart-3/5 border border-chart-3/20 rounded-xl p-4">
          <label className="text-xs font-semibold text-foreground block mb-2">Rental Price (USD)</label>
          <Input
            type="number"
            value={monetization.rentalPrice}
            onChange={(e) => setMonetization({ ...monetization, rentalPrice: parseFloat(e.target.value) })}
            placeholder="2.99"
            className="bg-secondary border-border"
          />
        </div>
      )}

      {monetization.type === "purchase" && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <label className="text-xs font-semibold text-foreground block mb-2">Purchase Price (USD)</label>
          <Input
            type="number"
            value={monetization.purchasePrice}
            onChange={(e) => setMonetization({ ...monetization, purchasePrice: parseFloat(e.target.value) })}
            placeholder="9.99"
            className="bg-secondary border-border"
          />
        </div>
      )}

      {monetization.type === "token-gated" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <label className="text-xs font-semibold text-foreground block mb-2">Minimum $STREAMING Balance</label>
          <Input
            type="number"
            value={monetization.tokenGateAmount}
            onChange={(e) => setMonetization({ ...monetization, tokenGateAmount: parseInt(e.target.value) })}
            placeholder="1000"
            className="bg-secondary border-border"
          />
        </div>
      )}

      {/* Ads */}
      {monetization.type === "free" && (
        <div className="bg-card border border-border rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={monetization.adEnabled}
              onChange={(e) => setMonetization({ ...monetization, adEnabled: e.target.checked })}
              className="rounded border border-border"
            />
            <span className="text-sm font-semibold text-foreground">Enable Dynamic Ads (AVOD)</span>
          </label>
          <p className="text-xs text-muted-foreground mt-2">Overwatch optimizes ad placement for maximum revenue.</p>
        </div>
      )}
    </div>
  );
}