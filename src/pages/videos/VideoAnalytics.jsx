import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, DollarSign, Zap, TrendingUp, Users, Play, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const CHART_STYLE = {
  grid: "hsl(230, 18%, 18%)",
  axis: "hsl(220, 10%, 50%)",
  tooltip: { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" },
};

const VIEWS_DATA = [
  { day: "Mar 28", views: 4200, watchTime: 1.4 },
  { day: "Mar 29", views: 3800, watchTime: 1.2 },
  { day: "Mar 30", views: 5600, watchTime: 1.9 },
  { day: "Mar 31", views: 7200, watchTime: 2.4 },
  { day: "Apr 1", views: 9100, watchTime: 3.1 },
  { day: "Apr 2", views: 8400, watchTime: 2.8 },
  { day: "Apr 3", views: 10300, watchTime: 3.5 },
];

const REVENUE_DATA = [
  { week: "Wk 1", ppv: 120, streaming: 80, subscription: 200 },
  { week: "Wk 2", ppv: 180, streaming: 140, subscription: 210 },
  { week: "Wk 3", ppv: 95, streaming: 200, subscription: 215 },
  { week: "Wk 4", ppv: 230, streaming: 310, subscription: 220 },
];

const RETENTION_DATA = [
  { pct: "0%", viewers: 100 },
  { pct: "10%", viewers: 91 },
  { pct: "20%", viewers: 82 },
  { pct: "30%", viewers: 74 },
  { pct: "40%", viewers: 65 },
  { pct: "50%", viewers: 58 },
  { pct: "60%", viewers: 48 },
  { pct: "70%", viewers: 39 },
  { pct: "80%", viewers: 30 },
  { pct: "90%", viewers: 22 },
  { pct: "100%", viewers: 18 },
];

const TRAFFIC_SOURCES = [
  { name: "Direct / Organic", value: 42, color: "hsl(262, 83%, 62%)" },
  { name: "$STREAMING Feed", value: 28, color: "hsl(165, 82%, 51%)" },
  { name: "Search", value: 16, color: "hsl(45, 93%, 58%)" },
  { name: "External Share", value: 14, color: "hsl(200, 80%, 55%)" },
];

const TOP_VIDEOS = [
  { rank: 1, title: "My Growth Strategy This Year", views: 21000, revenue: 210, unlocks: 58, retention: 68 },
  { rank: 2, title: "Collab with @topCreator", views: 15600, revenue: 120, unlocks: 34, retention: 72 },
  { rank: 3, title: "How I Built My Creator Setup", views: 12300, revenue: 89.5, unlocks: 12, retention: 61 },
  { rank: 4, title: "Monetize with $STREAMING", views: 5200, revenue: 520, unlocks: 104, retention: 55 },
  { rank: 5, title: "Advanced Editing Tutorial", views: 3400, revenue: 340, unlocks: 89, retention: 63 },
];

const STATS = [
  { label: "Total Views", value: "66.4K", sub: "+18% this week", icon: Eye, color: "text-primary", bg: "bg-primary/10" },
  { label: "Watch Time", value: "247h", sub: "+9% this week", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  { label: "Revenue", value: "$1,324", sub: "+23% this week", icon: DollarSign, color: "text-chart-3", bg: "bg-chart-3/10" },
  { label: "$STREAMING Unlocks", value: "297", sub: "+41% this week", icon: Zap, color: "text-chart-4", bg: "bg-chart-4/10" },
  { label: "Subscribers Gained", value: "+842", sub: "This week", icon: Users, color: "text-chart-5", bg: "bg-chart-5/10" },
  { label: "Avg. Retention", value: "63%", sub: "+4pts this week", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

const PERIODS = ["7D", "30D", "90D", "All"];

export default function VideoAnalytics() {
  const [period, setPeriod] = useState("7D");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Video Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep performance insights for your video content.</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-accent mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Views + Watch Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Daily Views</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VIEWS_DATA}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 62%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262, 83%, 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="day" stroke={CHART_STYLE.axis} fontSize={11} />
              <YAxis stroke={CHART_STYLE.axis} fontSize={11} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} />
              <Area type="monotone" dataKey="views" stroke="hsl(262, 83%, 62%)" fill="url(#gViews)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Watch Time (hours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VIEWS_DATA}>
              <defs>
                <linearGradient id="gWatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(165, 82%, 51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(165, 82%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="day" stroke={CHART_STYLE.axis} fontSize={11} />
              <YAxis stroke={CHART_STYLE.axis} fontSize={11} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} />
              <Area type="monotone" dataKey="watchTime" stroke="hsl(165, 82%, 51%)" fill="url(#gWatch)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-chart-3" />
            <h3 className="font-display font-semibold text-foreground">Revenue by Source</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="week" stroke={CHART_STYLE.axis} fontSize={11} />
              <YAxis stroke={CHART_STYLE.axis} fontSize={11} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(220, 10%, 60%)" }} />
              <Bar dataKey="ppv" name="Pay-Per-View" fill="hsl(45, 93%, 58%)" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="subscription" name="Subscription" fill="hsl(262, 83%, 62%)" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="streaming" name="$STREAMING" fill="hsl(165, 82%, 51%)" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Audience Retention</h3>
            <span className="ml-auto text-xs text-muted-foreground">Avg. 63%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RETENTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="pct" stroke={CHART_STYLE.axis} fontSize={11} />
              <YAxis stroke={CHART_STYLE.axis} fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v) => [`${v}%`, "Viewers"]} />
              <Line type="monotone" dataKey="viewers" stroke="hsl(262, 83%, 62%)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="viewers" stroke="hsl(262, 83%, 62%)" strokeWidth={0} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Sources + Top Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Traffic Sources */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-chart-4" />
            <h3 className="font-display font-semibold text-foreground">Traffic Sources</h3>
          </div>
          <div className="flex items-center justify-center mb-4">
            <PieChart width={160} height={160}>
              <Pie data={TRAFFIC_SOURCES} cx={75} cy={75} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {TRAFFIC_SOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2.5">
            {TRAFFIC_SOURCES.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-muted-foreground">{name}</span>
                </div>
                <span className="font-medium text-foreground">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Videos */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Top Videos</h3>
          </div>
          <div className="space-y-3">
            {TOP_VIDEOS.map(({ rank, title, views, revenue, unlocks, retention }) => (
              <div key={rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${rank === 1 ? "bg-primary/20 text-primary" : rank === 2 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  {rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{title}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {(views / 1000).toFixed(1)}K</span>
                    <span className="flex items-center gap-0.5 text-accent"><Zap className="w-3 h-3" /> {unlocks} unlocks</span>
                    <span className="flex items-center gap-0.5 text-chart-3"><DollarSign className="w-3 h-3" /> ${revenue}</span>
                  </div>
                </div>
                <Badge className="bg-secondary text-muted-foreground border-border text-xs shrink-0">{retention}% ret.</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}