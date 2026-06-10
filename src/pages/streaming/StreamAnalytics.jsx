import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, DollarSign, Zap, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from "recharts";
import { creatorDashboardApi } from "@/lib/creatorApi";

const TOOLTIP_STYLE = { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" };
const GRID_COLOR = "hsl(230, 18%, 18%)";
const AXIS_COLOR = "hsl(220, 10%, 50%)";

export default function StreamAnalytics() {
  const location = useLocation();
  const streamId = location.state?.streamId;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorDashboardApi.analytics({ type: 'stream', stream_id: streamId });
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [streamId]);

  const viewerData = analytics?.viewer_history || [];
  const revenueData = analytics?.revenue_history || [];
  const chatData = analytics?.chat_history || [];
  const topSupporters = analytics?.top_supporters || [];
  const stats = analytics?.stats || {};

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Stream Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Friday Night Beats — Vol. 12 · Apr 4, 2026 · 2h 14m</p>
        </div>
        {/* Summary card */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-5 py-3">
          <p className="text-xs text-muted-foreground mb-1">Stream Summary</p>
          <p className="font-display font-bold text-foreground">Great performance! 🔥</p>
          <p className="text-xs text-accent mt-0.5">+24% vs last stream</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-7">
        {[
          { label: "Peak Viewers", value: stats.peak_viewers?.toLocaleString() || "0", icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Revenue", value: `$${stats.revenue?.toFixed(2) || "0"}`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
          { label: "$STREAMING Tips", value: `${stats.streaming_tips?.toLocaleString() || "0"} $STR`, icon: Zap, color: "text-chart-3", bg: "bg-chart-3/10" },
          { label: "Avg. Watch Time", value: `${stats.avg_watch_time || "0"} min`, icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
          { label: "Engagement Rate", value: `${stats.engagement_rate || "0"}%`, icon: TrendingUp, color: "text-chart-5", bg: "bg-chart-5/10" },
          { label: "Chat Messages", value: stats.chat_messages?.toLocaleString() || "0", icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="font-display font-bold text-lg text-foreground leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Viewer spikes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Viewer Spikes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={viewerData}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262,83%,62%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(262,83%,62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="time" stroke={AXIS_COLOR} fontSize={11} />
              <YAxis stroke={AXIS_COLOR} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="viewers" stroke="hsl(262,83%,62%)" fill="url(#vGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top supporters */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Top Supporters</h3>
          {topSupporters.length > 0 ? (
            <div className="space-y-3">
              {topSupporters.map((s, i) => (
                <div key={s.user} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-chart-3' : 'text-muted-foreground'}`}>#{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {s.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">@{s.user}</p>
                    <p className="text-xs text-accent">{s.total}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">${s.usd}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">No supporters yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue over time */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="time" stroke={AXIS_COLOR} fontSize={11} />
              <YAxis stroke={AXIS_COLOR} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="tips" fill="hsl(262,83%,62%)" radius={[3,3,0,0]} name="Tips $STR" />
              <Bar dataKey="gifts" fill="hsl(165,82%,51%)" radius={[3,3,0,0]} name="Gifts $STR" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chat activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Chat Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chatData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="time" stroke={AXIS_COLOR} fontSize={11} />
              <YAxis stroke={AXIS_COLOR} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="messages" stroke="hsl(45,93%,58%)" strokeWidth={2} dot={false} name="Messages/min" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}