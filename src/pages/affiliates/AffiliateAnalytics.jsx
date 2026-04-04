import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", clicks: 320, commission: 42 },
  { day: "Tue", clicks: 580, commission: 68 },
  { day: "Wed", clicks: 410, commission: 55 },
  { day: "Thu", clicks: 720, commission: 91 },
  { day: "Fri", clicks: 890, commission: 104 },
  { day: "Sat", clicks: 660, commission: 80 },
  { day: "Sun", clicks: 700, commission: 88 },
];

export default function AffiliateAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Analytics</h1>
        <p className="text-muted-foreground mt-1">Clicks and commission trends this week.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-6">Clicks & Commissions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1e2030", border: "1px solid #2d3148", borderRadius: "12px", color: "#e2e8f0" }} />
            <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" fill="url(#clickGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="commission" stroke="#34d399" fill="url(#commGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}