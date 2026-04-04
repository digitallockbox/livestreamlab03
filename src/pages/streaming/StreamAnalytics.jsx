import React from "react";
import { Users, DollarSign, Zap, TrendingUp, Clock, MessageCircle, Crown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from "recharts";

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)", fontSize: "12px" },
  cursor: { stroke: "hsl(230, 18%, 22%)" }
};

const viewerData = [
  { time: "0:00", viewers: 120 }, { time: "0:15", viewers: 340 }, { time: "0:30", viewers: 890 },
  { time: "0:45", viewers: 1400 }, { time: "1:00", viewers: 2100 }, { time: "1:15", viewers: 2431 },
  { time: "1:30", viewers: 1980 }, { time: "1:45", viewers: 1720 }, { time: "2:00", viewers: 1500 },
];

const revenueData = [
  { time: "0:00", tips: 0, gifts: 0 }, { time: "0:15", tips: 12, gifts: 5 },
  { time: "0:30", tips: 34, gifts: 18 }, { time: "0:45", tips: 55, gifts: 28 },
  { time: "1:00", tips: 82, gifts: 40 }, { time: "1:15", tips: 127, gifts: 62 },
  { time: "1:30", tips: 98, gifts: 51 }, { time: "1:45", tips: 75, gifts: 38 },
];

const chatData = [
  { time: "0:00", messages: 14 }, { time: "0:15", messages: 48 }, { time: "0:30", messages: 120 },
  { time: "0:45", messages: 200 }, { time: "1:00", messages: 340 }, { time: "1:15", messages: 420 },
  { time: "1:30", messages: 310 }, { time: "1:45", messages: 280 },
];

const supporters = [
  { rank: 1, user: "pixelqueen", amount: "1,200 $STR", usd: "$24.00" },
  { rank: 2, user: "neon_wolf", amount: "850 $STR", usd: "$17.00" },
  { rank: 3, user: "vaultking", amount: "640 $STR", usd: "$12.80" },
  { rank: 4, user: "techghost", amount: "500 $STR", usd: "$10.00" },
  { rank: 5, user: "solarflare", amount: "310 $STR", usd: "$6.20" },
];

const STATS = [
  { title: "Peak Viewers", value: "2,431", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { title: "Total Revenue", value: "$127.50", icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  { title: "$STREAMING Tips", value: "6,200 $STR", icon: Zap, color: "text-chart-3", bg: "bg-chart-3/10" },
  { title: "Duration", value: "2h 04m", icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
  { title: "Chat Messages", value: "4,812", icon: MessageCircle, color: "text-chart-5", bg: "bg-chart-5/10" },
  { title: "Avg Engagement", value: "87%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

export default function StreamAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Stream Analytics</h1>
        <p className="text-muted-foreground mt-1">Post-stream performance breakdown — Late Night Beats</p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-5 mb-6 flex flex-wrap gap-6 items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Stream Summary</p>
          <p className="font-display text-xl font-bold text-foreground">Late Night Beats — Deep House Mix</p>
          <p className="text-sm text-muted-foreground mt-0.5">Fri Apr 4, 2026 · 2h 04m · Music</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-destructive/20 text-destructive text-xs font-bold px-3 py-1 rounded-full">ENDED</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {STATS.map((s) => (
          <div key={s.title} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="font-display font-bold text-base text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Viewer spikes */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Viewer Spikes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={viewerData}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262,83%,62%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(262,83%,62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,18%,16%)" />
              <XAxis dataKey="time" stroke="hsl(220,10%,45%)" fontSize={11} />
              <YAxis stroke="hsl(220,10%,45%)" fontSize={11} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="viewers" stroke="hsl(262,83%,62%)" fill="url(#vGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Tips & Gifts Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,18%,16%)" />
              <XAxis dataKey="time" stroke="hsl(220,10%,45%)" fontSize={11} />
              <YAxis stroke="hsl(220,10%,45%)" fontSize={11} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="tips" name="Tips $STR" fill="hsl(262,83%,62%)" radius={[4,4,0,0]} />
              <Bar dataKey="gifts" name="Gifts $STR" fill="hsl(165,82%,51%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chat activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Chat Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,18%,16%)" />
              <XAxis dataKey="time" stroke="hsl(220,10%,45%)" fontSize={11} />
              <YAxis stroke="hsl(220,10%,45%)" fontSize={11} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="messages" name="Messages" stroke="hsl(45,93%,58%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top supporters */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-chart-3" />
            <h3 className="font-display font-semibold text-sm text-foreground">Top Supporters</h3>
          </div>
          <div className="space-y-3">
            {supporters.map((s) => (
              <div key={s.rank} className="flex items-center gap-3">
                <span className={`w-6 text-center text-xs font-bold ${s.rank === 1 ? 'text-chart-3' : s.rank === 2 ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                  #{s.rank}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-xs font-bold text-foreground">
                  {s.user[0].toUpperCase()}
                </div>
                <span className="flex-1 text-sm text-foreground font-medium">@{s.user}</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-accent">{s.amount}</p>
                  <p className="text-xs text-muted-foreground">{s.usd}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}