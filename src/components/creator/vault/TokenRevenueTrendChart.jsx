/**
 * TokenRevenueTrendChart — 30-day $STREAMING token revenue trend.
 *
 * Buckets ledger "earn" entries by day so creators can see exactly when
 * earnings spike. Renders a bar+line composed chart: bars show daily earned
 * amounts, the line tracks cumulative total across the window.
 *
 * Uses the ledger entries already fetched by useTokenAnalytics.
 */
import React, { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";
import { Flame, TrendingUp, CalendarDays } from "lucide-react";

const DAYS = 30;
const fmtAmount = (v) => `${Number(v || 0).toLocaleString()} \u25CE`;

/**
 * Bucket ledger earn events into daily totals over the last N days.
 * Returns [{day, full, tokens, cumulative}] sorted ascending.
 */
function buildDailySeries(ledger) {
  const today = new Date();
  const buckets = new Map();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const entry of ledger) {
    if (!entry?.timestamp || entry.type !== "earn") continue;
    const key = new Date(entry.timestamp).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + (Number(entry.amount) || 0));
  }

  let running = 0;
  return Array.from(buckets.entries()).map(([day, tokens]) => {
    running += tokens;
    return { day: day.slice(5), full: day, tokens, cumulative: running };
  });
}

export default function TokenRevenueTrendChart({ ledger }) {
  const series = useMemo(() => buildDailySeries(ledger), [ledger]);

  const peak = useMemo(
    () => series.reduce((m, p) => Math.max(m, p.tokens), 0),
    [series]
  );
  const peakDay = useMemo(
    () => series.find((p) => p.tokens === peak) || null,
    [series, peak]
  );
  const total = useMemo(
    () => series.reduce((s, p) => s + p.tokens, 0),
    [series]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="w-3 h-3 text-chart-3" /> Daily $STREAMING Earned
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" /> Cumulative
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Peak day:{" "}
          <span className="text-chart-3 font-medium">{fmtAmount(peak)}</span>
          {peakDay && (
            <span className="ml-1 inline-flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="w-3 h-3" /> {peakDay.day}
            </span>
          )}
          {" \u00b7 "}Total:{" "}
          <span className="text-accent font-medium">{fmtAmount(total)}</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="g_token_daily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.85} />
              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            interval={Math.floor(DAYS / 6)}
          />
          <YAxis
            yAxisId="daily"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
          />
          <YAxis
            yAxisId="cumulative"
            orientation="right"
            stroke="hsl(var(--primary))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(v, name) => [fmtAmount(v), name]}
          />
          <Bar
            yAxisId="daily"
            dataKey="tokens"
            fill="url(#g_token_daily)"
            name="Daily Earned"
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
          <Line
            yAxisId="cumulative"
            type="monotone"
            dataKey="cumulative"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
            name="Cumulative"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}