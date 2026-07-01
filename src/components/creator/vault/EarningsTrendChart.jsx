import React, { useMemo } from "react";
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Flame, TrendingUp } from "lucide-react";

// EarningsTrendChart — visual 30-day $STREAMING earnings trend for the CreatorVault.
// Daily performance is shown as accent-colored bars; cumulative total growth
// rides as a primary-purple line on a second axis. Uses dark theme tokens.
export default function EarningsTrendChart({ series, days = 30 }) {
  // Build cumulative running total for the growth line.
  const data = useMemo(() => {
    let running = 0;
    return series.map((p) => {
      running += p.tokens;
      return { ...p, cumulative: running };
    });
  }, [series]);

  const peak = useMemo(
    () => series.reduce((m, p) => Math.max(m, p.tokens), 0),
    [series]
  );
  const total = useMemo(
    () => series.reduce((s, p) => s + p.tokens, 0),
    [series]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="w-3 h-3 text-chart-3" /> Daily $STREAMING
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" /> Cumulative
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Peak day: <span className="text-chart-3 font-medium">{peak.toLocaleString()} ◎</span> · Total: <span className="text-accent font-medium">{total.toLocaleString()} ◎</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="g_daily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.85} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval={Math.floor(days / 6)} />
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
            formatter={(v, name) => [`${Number(v).toLocaleString()} ◎`, name]}
          />
          <Bar yAxisId="daily" dataKey="tokens" fill="url(#g_daily)" name="Daily" radius={[3, 3, 0, 0]} maxBarSize={22} />
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