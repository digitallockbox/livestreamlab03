import React from "react";
import { Zap, ShoppingBag, TrendingUp, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MonetizationHooks({ streamData }) {
  const events = [
    { icon: Gift, label: "Tips Earned", value: streamData?.tipsEarned || "$0", color: "text-primary" },
    { icon: ShoppingBag, label: "Store Sales", value: streamData?.storeSales || "$0", color: "text-accent" },
    { icon: Zap, label: "$STREAMING", value: streamData?.streamingTokens || "0", color: "text-yellow-400" },
    { icon: TrendingUp, label: "Streak Bonus", value: streamData?.streakBonus || "0%", color: "text-chart-3" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="font-semibold text-sm text-foreground">Real-Time Monetization</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {events.map((e, i) => {
          const Icon = e.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${e.color}`} />
                <span className="text-xs text-muted-foreground">{e.label}</span>
              </div>
              <p className={`text-base font-semibold ${e.color}`}>{e.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}