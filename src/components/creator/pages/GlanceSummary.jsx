import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";

// GlanceSummary — a 3-card at-a-glance strip showing total earnings, a
// conversion rate, and the connected wallet's active watch streak.
// Earnings + conversion values are passed in by each dashboard; the streak
// is fetched here from the ViewerStreak entity so both dashboards stay DRY.
export default function GlanceSummary({ wallet, earningsValue, earningsSub, conversionRate, conversionSub }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    base44.entities.ViewerStreak.filter({ viewer_wallet: wallet })
      .then((r) => { if (active) setStreak((r && r[0]) || null); })
      .catch(() => { if (active) setStreak(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  const current = streak?.current_streak || 0;
  const longest = streak?.longest_streak || 0;

  const cards = [
    { icon: Zap, label: "Total Earnings", value: earningsValue, sub: earningsSub, color: "text-accent", bg: "bg-accent/10", ring: "border-accent/20" },
    { icon: TrendingUp, label: "Conversion Rate", value: `${Number(conversionRate || 0).toFixed(1)}%`, sub: conversionSub, color: "text-chart-3", bg: "bg-chart-3/10", ring: "border-chart-3/20" },
    { icon: Flame, label: "Active Streak", value: loading ? "…" : `${current} day${current === 1 ? "" : "s"}`, sub: longest ? `Best ${longest}d` : "Keep it going", color: "text-primary", bg: "bg-primary/10", ring: "border-primary/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`rounded-2xl border ${c.ring} ${c.bg} p-4`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className={`w-4 h-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-display font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}