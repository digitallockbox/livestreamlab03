import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Eye, DollarSign, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creatorApi } from "@/lib/tridentApi";

const FALLBACK_REVENUE = [
  { month: "Oct", revenue: 1200 }, { month: "Nov", revenue: 1900 },
  { month: "Dec", revenue: 2400 }, { month: "Jan", revenue: 2100 },
  { month: "Feb", revenue: 3200 }, { month: "Mar", revenue: 2900 },
  { month: "Apr", revenue: 3800 },
];

const FALLBACK_SOURCES = [
  { name: "Streams", value: 2400 }, { name: "Store", value: 1100 },
  { name: "Videos", value: 880 }, { name: "Podcasts", value: 420 },
  { name: "Affiliates", value: 340 },
];

const STAT_CONFIG = [
  { key: "total_revenue", title: "Total Revenue", format: (v) => `$${(+v || 0).toLocaleString()}`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  { key: "total_viewers", title: "Total Viewers", format: (v) => (+v || 0).toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { key: "total_views", title: "Total Views", format: (v) => (+v >= 1000 ? `${(+v/1000).toFixed(0)}K` : String(+v || 0)), icon: Eye, color: "text-chart-4", bg: "bg-chart-4/10" },
  { key: "avg_session_minutes", title: "Avg. Session", format: (v) => `${+v || 0} min`, icon: TrendingUp, color: "text-chart-3", bg: "bg-chart-3/10" },
];

export default function AnalyticsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await creatorApi.analytics({});
      setData(res);
      setLastFetched(new Date());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const revenueData = data?.revenue_over_time || FALLBACK_REVENUE;
  const sourceData = data?.revenue_by_source || FALLBACK_SOURCES;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1">
            {lastFetched ? `Live data · updated ${lastFetched.toLocaleTimeString()}` : "Platform-wide performance at a glance."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 border-border">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CONFIG.map((s) => {
          const rawValue = data?.[s.key];
          const display = rawValue != null ? s.format(rawValue) : "—";
          const trend = data?.[`${s.key}_trend`] ?? null;
          return (
            <div key={s.key} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                {trend && <span className="text-xs text-accent font-medium">{trend}</span>}
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{loading ? "…" : display}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262 83% 62%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262 83% 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 18% 17%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 48%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 10% 48%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(230 22% 10%)", border: "1px solid hsl(230 18% 17%)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(262 83% 62%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue by Source</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 18% 17%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(220 10% 48%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(220 10% 48%)", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: "hsl(230 22% 10%)", border: "1px solid hsl(230 18% 17%)", borderRadius: 12 }} />
              <Bar dataKey="value" fill="hsl(165 82% 51%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}