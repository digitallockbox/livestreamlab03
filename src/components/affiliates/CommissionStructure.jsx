import React, { useState } from "react";
import { Zap, Percent, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CommissionStructure() {
  const [commission, setCommission] = useState({
    baseRate: 5,
    streamingMultiplier: 1.5,
    topAffiliateBonus: 0.5,
    qualityBonus: 0.25,
  });

  const tiers = [
    { tier: "Bronze", minClicks: 0, rate: "5%", badge: "bg-yellow-600/20 text-yellow-600" },
    { tier: "Silver", minClicks: 5000, rate: "7%", badge: "bg-slate-400/20 text-slate-400" },
    { tier: "Gold", minClicks: 15000, rate: "10%", badge: "bg-yellow-500/20 text-yellow-500" },
    { tier: "Platinum", minClicks: 50000, rate: "15%", badge: "bg-primary/20 text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Commission Structure</h3>
      </div>

      {/* Commission Tiers */}
      <div className="space-y-2">
        {tiers.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                {t.tier}
                <Badge className={`text-xs ${t.badge}`}>{t.minClicks.toLocaleString()}+ clicks</Badge>
              </p>
            </div>
            <p className="text-lg font-bold text-primary">{t.rate}</p>
          </div>
        ))}
      </div>

      {/* Bonuses */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-accent" />
          <p className="font-semibold text-sm text-foreground">Performance Bonuses</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">$STREAMING Multiplier</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              value={commission.streamingMultiplier}
              onChange={(e) => setCommission({ ...commission, streamingMultiplier: parseFloat(e.target.value) })}
              className="bg-secondary border-border w-24"
            />
            <span className="text-xs text-muted-foreground">× base rate</span>
            <span className="text-sm font-semibold text-accent ml-auto">{(commission.baseRate * commission.streamingMultiplier).toFixed(2)}%</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">Top Affiliate Monthly Bonus</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              value={commission.topAffiliateBonus}
              onChange={(e) => setCommission({ ...commission, topAffiliateBonus: parseFloat(e.target.value) })}
              className="bg-secondary border-border w-24"
            />
            <span className="text-xs text-muted-foreground">% additional</span>
            <span className="text-sm font-semibold text-accent ml-auto">+{commission.topAffiliateBonus}%</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">Quality Score Bonus</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              value={commission.qualityBonus}
              onChange={(e) => setCommission({ ...commission, qualityBonus: parseFloat(e.target.value) })}
              className="bg-secondary border-border w-24"
            />
            <span className="text-xs text-muted-foreground">% for high conversion rate</span>
            <span className="text-sm font-semibold text-accent ml-auto">+{commission.qualityBonus}%</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
        <Zap className="w-4 h-4" /> Update Commission Rates
      </Button>
    </div>
  );
}