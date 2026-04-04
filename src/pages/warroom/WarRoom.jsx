import React from "react";
import { Zap, TrendingUp, Users, Radio, ShoppingCart, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { title: "Live Stream Hub", desc: "Go live and manage your active stream", icon: Radio, color: "text-primary", bg: "from-primary/20 to-primary/5", path: "/streaming/go-live" },
  { title: "Revenue Engine", desc: "Real-time revenue across all channels", icon: DollarSign, color: "text-accent", bg: "from-accent/20 to-accent/5", path: "/vault" },
  { title: "Audience Radar", desc: "Live viewer stats and engagement data", icon: Users, color: "text-chart-4", bg: "from-chart-4/20 to-chart-4/5", path: "/analytics" },
  { title: "$STREAMING Command", desc: "Manage your token ecosystem", icon: Zap, color: "text-yellow-400", bg: "from-yellow-400/20 to-yellow-400/5", path: "/vault" },
  { title: "Store Pulse", desc: "Real-time store orders and conversions", icon: ShoppingCart, color: "text-chart-5", bg: "from-chart-5/20 to-chart-5/5", path: "/store" },
  { title: "Growth Tracker", desc: "Follower trends and top content", icon: TrendingUp, color: "text-chart-3", bg: "from-chart-3/20 to-chart-3/5", path: "/analytics" },
];

export default function WarRoom() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent uppercase tracking-wider">Command Center</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">War Room</h1>
        <p className="text-muted-foreground mt-1">Your real-time creator command center — everything at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Link key={mod.title} to={mod.path} className="group block">
            <div className={`bg-gradient-to-br ${mod.bg} border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-200 hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-4">
                <mod.icon className={`w-7 h-7 ${mod.color}`} />
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{mod.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[{ label: "Live Viewers", value: "1,248", color: "text-accent" }, { label: "Today's Revenue", value: "$284.50", color: "text-primary" }, { label: "Active Orders", value: "7", color: "text-chart-3" }, { label: "$STREAMING Flow", value: "+420", color: "text-yellow-400" }].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-2xl font-display font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}