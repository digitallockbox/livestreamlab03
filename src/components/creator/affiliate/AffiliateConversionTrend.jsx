import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Loader2, TrendingUp, Trophy, Link2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fmt = (d) => d.toISOString().slice(0, 10);

const buildBuckets = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ date: fmt(d), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), clicks: 0, conversions: 0, rate: 0 });
  }
  return days;
};

// AffiliateConversionTrend — daily click-to-conversion rate over the last 30 days
// plus a highlighted list of the creator's most successful referral links by rate.
export default function AffiliateConversionTrend({ wallet, links }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    const since = fmt(new Date(Date.now() - 29 * 86400000));
    base44.entities.AffiliateEvent.filter({ creator_wallet: wallet }, "-created_date", 5000)
      .then((events) => {
        if (!active) return;
        const buckets = buildBuckets();
        const idx = new Map(buckets.map((b, i) => [b.date, i]));
        for (const e of (events || [])) {
          const day = (e.created_date || "").slice(0, 10);
          if (day < since) continue;
          const i = idx.get(day);
          if (i == null) continue;
          if (e.event_type === "click") buckets[i].clicks += 1;
          else if (e.event_type === "conversion") buckets[i].conversions += 1;
        }
        for (const b of buckets) b.rate = b.clicks > 0 ? (b.conversions / b.clicks) * 100 : 0;
        setData(buckets);
      })
      .catch(() => { if (active) setData(buildBuckets()); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  const avgRate = useMemo(() => {
    const tC = data.reduce((s, d) => s + d.clicks, 0);
    const tV = data.reduce((s, d) => s + d.conversions, 0);
    return tC > 0 ? (tV / tC) * 100 : 0;
  }, [data]);

  const topLinks = useMemo(() => {
    return (links || [])
      .map((l) => {
        const clicks = l.clicks || 0;
        const conversions = l.conversions || 0;
        const rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        return { id: l.id, title: l.title || "Untitled", category: l.category, clicks, conversions, rate, commission: l.commission_earned || 0 };
      })
      .filter((l) => l.clicks > 0)
      .sort((a, b) => b.rate - a.rate || b.commission - a.commission)
      .slice(0, 3);
  }, [links]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Conversion rate over time */}
      <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Conversion Rate Trend</h3>
            <p className="text-xs text-muted-foreground">Daily click-to-conversion rate over the last 30 days.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">30-day avg {avgRate.toFixed(1)}%</span>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} interval={4} />
              <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, color: "hsl(var(--popover-foreground))" }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Conv. rate"]}
              />
              <ReferenceLine y={avgRate} stroke="hsl(var(--accent))" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 2.5, fill: "hsl(var(--primary))" }} activeDot={{ r: 4 }} name="Conv. rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top referral links */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold flex items-center gap-2 mb-1"><Trophy className="w-4 h-4 text-chart-3" /> Top Referral Links</h3>
        <p className="text-xs text-muted-foreground mb-4">Highest conversion rates across your portfolio.</p>
        {topLinks.length === 0 ? (
          <div className="text-center py-8">
            <Link2 className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No clicks recorded yet. Top performers appear as traffic comes in.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topLinks.map((l, i) => {
              const medal = ["text-chart-3", "text-muted-foreground", "text-chart-4"][i] || "text-muted-foreground";
              return (
                <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/60">
                  <span className={`text-lg font-display font-bold ${medal} leading-none mt-0.5`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{l.clicks} clicks</span><span>·</span>
                      <span>{l.conversions} conv.</span><span>·</span>
                      <span className="text-accent">${l.commission.toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-accent whitespace-nowrap">{l.rate.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}