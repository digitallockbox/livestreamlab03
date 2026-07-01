import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, MousePointerClick, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD UTC

// Build a 30-day bucket array (oldest -> today) seeded with zero counts.
const buildBuckets = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ date: fmt(d), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), clicks: 0, conversions: 0 });
  }
  return days;
};

// AffiliatePerformanceChart — daily clicks and conversions over the last 30 days
// for the creator's affiliate links, sourced from the AffiliateEvent log.
export default function AffiliatePerformanceChart({ wallet }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ clicks: 0, conversions: 0 });

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    const since = fmt(new Date(Date.now() - 29 * 86400000));
    base44.entities.AffiliateEvent.filter({ creator_wallet: wallet }, "-created_date", 5000)
      .then((events) => {
        if (!active) return;
        const buckets = buildBuckets();
        const idx = new Map(buckets.map((b, i) => [b.date, i]));
        let tc = 0, tv = 0;
        for (const e of (events || [])) {
          const day = (e.created_date || "").slice(0, 10);
          if (day < since) continue;
          const i = idx.get(day);
          if (i == null) continue;
          if (e.event_type === "click") { buckets[i].clicks += 1; tc += 1; }
          else if (e.event_type === "conversion") { buckets[i].conversions += 1; tv += 1; }
        }
        setData(buckets);
        setTotals({ clicks: tc, conversions: tv });
      })
      .catch(() => { if (active) setData(buildBuckets()); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  const peak = useMemo(() => Math.max(1, ...data.map((d) => d.clicks + d.conversions)), [data]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-semibold">30-Day Performance</h3>
          <p className="text-xs text-muted-foreground">Daily clicks and conversions across your referral links.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5 text-primary" /> {totals.clicks} clicks</span>
          <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-accent" /> {totals.conversions} conversions</span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} interval={4} />
            <YAxis allowDecimals={false} domain={[0, peak]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, color: "hsl(var(--popover-foreground))" }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#clickGrad)" />
            <Area type="monotone" dataKey="conversions" name="Conversions" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#convGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}