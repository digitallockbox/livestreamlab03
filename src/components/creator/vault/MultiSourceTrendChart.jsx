import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Radio, Store as StoreIcon, Link2, TrendingUp } from "lucide-react";

const DAYS = 30;

const SOURCES = [
  { key: "streams", label: "Streams", icon: Radio, color: "hsl(var(--accent))", unit: "◎" },
  { key: "store", label: "Store", icon: StoreIcon, color: "hsl(var(--chart-4))", unit: "$" },
  { key: "affiliate", label: "Affiliate", icon: Link2, color: "hsl(var(--chart-3))", unit: "$" },
];

const fmt = (v, unit) =>
  unit === "$" ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `${Number(v).toLocaleString()} ◎`;

// MultiSourceTrendChart — 30-day revenue trend with one line per source
// (streams ◎, store $, affiliate $) so the creator can compare growth
// trajectories across all channels on a single chart. Streams use the
// right axis (◎); store & affiliate use the left axis ($).
export default function MultiSourceTrendChart({ series }) {
  // series: { streams: [{day,total}], store: [...], affiliate: [...] }
  const data = useMemo(() => {
    const today = new Date();
    const buckets = new Map();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { day: key.slice(5), Streams: 0, Store: 0, Affiliate: 0 });
    }
    for (const s of SOURCES) {
      const src = series[s.key] || [];
      for (const p of src) {
        if (!p?.day) continue;
        const key = p.day.length === 10 ? p.day : p.full;
        if (!key) continue;
        const b = buckets.get(key);
        if (b) b[s.key === "streams" ? "Streams" : s.key === "store" ? "Store" : "Affiliate"] = p.total || 0;
      }
    }
    return Array.from(buckets.values());
  }, [series]);

  const totals = useMemo(() => ({
    streams: data.reduce((s, d) => s + d.Streams, 0),
    store: data.reduce((s, d) => s + d.Store, 0),
    affiliate: data.reduce((s, d) => s + d.Affiliate, 0),
  }), [data]);

  // Growth %: compare last 7 days vs prior 7 days for each source.
  const growth = useMemo(() => {
    const calc = (arr) => {
      const recent = arr.slice(-7).reduce((s, d) => s + d, 0);
      const prior = arr.slice(-14, -7).reduce((s, d) => s + d, 0);
      if (prior === 0) return recent > 0 ? 100 : 0;
      return Math.round(((recent - prior) / prior) * 100);
    };
    return {
      streams: calc(data.map((d) => d.Streams)),
      store: calc(data.map((d) => d.Store)),
      affiliate: calc(data.map((d) => d.Affiliate)),
    };
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const g = growth[s.key];
            return (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3 h-3" style={{ color: s.color }} />
                {s.label}
                <span className={`font-medium ${g >= 0 ? "text-chart-3" : "text-destructive"}`}>
                  {g >= 0 ? "+" : ""}{g}%
                </span>
              </span>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 7-day vs prior 7-day
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval={Math.floor(DAYS / 6)} />
          <YAxis
            yAxisId="usd"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
          />
          <YAxis
            yAxisId="str"
            orientation="right"
            stroke="hsl(var(--accent))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
          />
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(v, name) => {
              const unit = name === "Streams" ? "◎" : "$";
              return [fmt(v, unit), name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="str" type="monotone" dataKey="Streams" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} name="Streams" />
          <Line yAxisId="usd" type="monotone" dataKey="Store" stroke="hsl(var(--chart-4))" strokeWidth={2.5} dot={false} name="Store" />
          <Line yAxisId="usd" type="monotone" dataKey="Affiliate" stroke="hsl(var(--chart-3))" strokeWidth={2.5} dot={false} name="Affiliate" />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 pt-1">
        {SOURCES.map((s) => (
          <div key={s.key} className="rounded-lg bg-muted/40 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label} (30d)</p>
            <p className="text-sm font-display font-bold mt-0.5" style={{ color: s.color }}>
              {fmt(totals[s.key], s.unit)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}