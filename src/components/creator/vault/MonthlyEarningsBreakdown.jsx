import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Radio, Store as StoreIcon, Link2, Crown, Loader2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MONTHS_BACK = 12;

// Revenue sources mapped to Transaction types. Streams are $STREAMING (◎);
// store & affiliate are USD ($). Clicks come from AffiliateEvent records.
const STREAM_TYPES = ["stream_tip", "audio_boost", "subscription", "podcast"];
const STORE_TYPES = ["store_sale", "video_unlock"];
const AFFILIATE_TYPES = ["affiliate"];

const SOURCES = {
  streams: { label: "Streams", icon: Radio, unit: "◎", color: "hsl(var(--accent))", text: "text-accent" },
  store: { label: "Store Sales", icon: StoreIcon, unit: "$", color: "hsl(var(--chart-4))", text: "text-chart-4" },
  affiliate: { label: "Affiliate", icon: Link2, unit: "$", color: "hsl(var(--chart-3))", text: "text-chart-3" },
};

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};

const fmt = (val, unit) =>
  unit === "$" ? `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `${Number(val).toLocaleString()} ◎`;

// MonthlyEarningsBreakdown — month-by-month revenue split across streams,
// store sales, and affiliate (commission + clicks), with a most-profitable
// channel highlight per month and over the full window.
export default function MonthlyEarningsBreakdown({ wallet }) {
  const [loading, setLoading] = useState(true);
  const [txns, setTxns] = useState([]);
  const [clickEvents, setClickEvents] = useState([]);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      base44.entities.Transaction.filter({ recipient_wallet: wallet }, "-created_date", 500).catch(() => []),
      base44.entities.AffiliateEvent.filter({ creator_wallet: wallet, event_type: "click" }, "-created_date", 500).catch(() => []),
    ]).then(([t, c]) => {
      if (!active) return;
      setTxns(Array.isArray(t) ? t : []);
      setClickEvents(Array.isArray(c) ? c : []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  // Build the last 12 months (oldest → newest).
  const months = useMemo(() => {
    const now = new Date();
    const out = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
      out.push(monthKey(d));
    }
    return out;
  }, []);

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - (MONTHS_BACK - 1));
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }, []);

  // Per-month aggregation.
  const rows = useMemo(() => {
    const byMonth = {};
    for (const key of months) {
      byMonth[key] = { streams: 0, store: 0, affiliate: 0, clicks: 0, streamsUsd: 0, storeUsd: 0, affiliateUsd: 0 };
    }
    for (const t of txns) {
      if (!t.created_date) continue;
      const td = new Date(t.created_date);
      if (td < cutoff) continue;
      const key = monthKey(td);
      if (!byMonth[key]) continue;
      const amt = Number(t.amount) || 0;
      const str = Number(t.streaming_amount) || 0;
      if (STREAM_TYPES.includes(t.type)) { byMonth[key].streams += str; byMonth[key].streamsUsd += amt; }
      else if (STORE_TYPES.includes(t.type)) { byMonth[key].store += amt; byMonth[key].storeUsd += amt; }
      else if (AFFILIATE_TYPES.includes(t.type)) { byMonth[key].affiliate += amt; byMonth[key].affiliateUsd += amt; }
    }
    for (const c of clickEvents) {
      if (!c.created_date) continue;
      const cd = new Date(c.created_date);
      if (cd < cutoff) continue;
      const key = monthKey(cd);
      if (byMonth[key]) byMonth[key].clicks += 1;
    }
    return months.map((key) => {
      const m = byMonth[key];
      // Most profitable channel by USD-normalized revenue.
      const scores = [
        { key: "streams", usd: m.streamsUsd, native: m.streams },
        { key: "store", usd: m.storeUsd, native: m.store },
        { key: "affiliate", usd: m.affiliateUsd, native: m.affiliate },
      ];
      scores.sort((a, b) => b.usd - a.usd);
      const top = scores[0].usd > 0 ? scores[0] : null;
      return { key, label: monthLabel(key), ...m, top };
    });
  }, [txns, clickEvents, months, cutoff]);

  // Window totals.
  const totals = useMemo(() => {
    const t = { streams: 0, store: 0, affiliate: 0, clicks: 0, streamsUsd: 0, storeUsd: 0, affiliateUsd: 0 };
    for (const r of rows) {
      t.streams += r.streams; t.store += r.store; t.affiliate += r.affiliate; t.clicks += r.clicks;
      t.streamsUsd += r.streamsUsd; t.storeUsd += r.storeUsd; t.affiliateUsd += r.affiliateUsd;
    }
    return t;
  }, [rows]);

  const overallTop = useMemo(() => {
    const scores = [
      { key: "streams", usd: totals.streamsUsd },
      { key: "store", usd: totals.storeUsd },
      { key: "affiliate", usd: totals.affiliateUsd },
    ].sort((a, b) => b.usd - a.usd);
    return scores[0].usd > 0 ? scores[0].key : null;
  }, [totals]);

  const chartData = useMemo(() => rows.map((r) => ({
    month: r.label.slice(0, 3),
    Streams: r.streams,
    Store: r.store,
    Affiliate: r.affiliate,
  })), [rows]);

  if (!wallet) return null;
  if (loading) return (
    <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading monthly breakdown…
    </div>
  );

  const hasData = rows.some((r) => r.streams || r.store || r.affiliate || r.clicks);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold">Monthly Revenue Breakdown</h2>
        </div>
        <span className="text-xs text-muted-foreground">Last {MONTHS_BACK} months</span>
      </div>

      {/* 12-month totals per channel + overall winner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {Object.entries(SOURCES).map(([k, s]) => {
          const Icon = s.icon;
          const val = k === "streams" ? totals.streams : k === "store" ? totals.store : totals.affiliate;
          const isTop = overallTop === k;
          return (
            <div key={k} className={`rounded-xl border p-3 ${isTop ? "border-chart-3/40 bg-chart-3/5" : "border-border bg-muted/30"} relative`}>
              {isTop && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-chart-3/15 text-chart-3">
                  <Crown className="w-3 h-3" /> Top
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </div>
              <p className={`text-lg font-display font-bold ${s.text}`}>{fmt(val, s.unit)}</p>
              {k === "affiliate" && <p className="text-[11px] text-muted-foreground mt-0.5">{totals.clicks} clicks</p>}
            </div>
          );
        })}
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Crown className="w-3.5 h-3.5 text-chart-3" /> Top Channel
          </div>
          <p className="text-lg font-display font-bold">{overallTop ? SOURCES[overallTop].label : "—"}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{overallTop ? "Most profitable 12-mo" : "No revenue yet"}</p>
        </div>
      </div>

      {/* Grouped bar chart — streams (◎, right axis) vs store & affiliate ($, left axis) */}
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="usd" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
            <YAxis yAxisId="str" orientation="right" stroke="hsl(var(--accent))" tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(v, name) => {
                const unit = name === "Streams" ? "◎" : "$";
                return [fmt(v, unit), name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="str" dataKey="Streams" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar yAxisId="usd" dataKey="Store" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar yAxisId="usd" dataKey="Affiliate" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">No revenue recorded in the last {MONTHS_BACK} months.</p>
      )}

      {/* Monthly table */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="font-medium py-2 px-2">Month</th>
              <th className="font-medium py-2 px-2 text-right">Streams (◎)</th>
              <th className="font-medium py-2 px-2 text-right">Store ($)</th>
              <th className="font-medium py-2 px-2 text-right">Affiliate ($)</th>
              <th className="font-medium py-2 px-2 text-right">Clicks</th>
              <th className="font-medium py-2 px-2">Top Channel</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map((r) => (
              <tr key={r.key} className="border-b border-border/40 last:border-0">
                <td className="py-2 px-2 whitespace-nowrap">{r.label}</td>
                <td className="py-2 px-2 text-right text-accent">{r.streams ? r.streams.toLocaleString() : "—"}</td>
                <td className="py-2 px-2 text-right text-chart-4">{r.store ? `$${r.store.toLocaleString()}` : "—"}</td>
                <td className="py-2 px-2 text-right text-chart-3">{r.affiliate ? `$${r.affiliate.toLocaleString()}` : "—"}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{r.clicks || "—"}</td>
                <td className="py-2 px-2">
                  {r.top ? (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${SOURCES[r.top.key].text} bg-muted`}>
                      <Crown className="w-3 h-3" /> {SOURCES[r.top.key].label}
                    </span>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}