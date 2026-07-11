import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS = 30;

const fmtStr = (v) => `${Number(v).toLocaleString()} ◎`;
const fmtUsd = (v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// RevenueTrendChart — clean, simple 30-day area chart for a single revenue source.
// `dataKey` is the property name in the chart data; `color` is the hsl token;
// `unit` controls formatting ("◎" | "$").
export default function RevenueTrendChart({ data, dataKey, color, unit, height = 220 }) {
  const total = useMemo(() => data.reduce((s, d) => s + (d[dataKey] || 0), 0), [data, dataKey]);
  const peak = useMemo(() => data.reduce((m, d) => Math.max(m, d[dataKey] || 0), 0), [data, dataKey]);
  const fmt = unit === "$" ? fmtUsd : fmtStr;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Peak: <span className="font-medium text-foreground">{fmt(peak)}</span></span>
        <span>Total: <span className="font-medium text-foreground">{fmt(total)}</span></span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`hsl(var(${color}))`} stopOpacity={0.7} />
              <stop offset="100%" stopColor={`hsl(var(${color}))`} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval={Math.floor(DAYS / 5)} />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(v) => [fmt(v), "Revenue"]}
          />
          <Area type="monotone" dataKey={dataKey} stroke={`hsl(var(${color}))`} strokeWidth={2} fill={`url(#grad_${dataKey})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}