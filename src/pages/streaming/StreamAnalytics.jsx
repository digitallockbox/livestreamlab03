import React from "react";
import { Users, DollarSign, Zap, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const viewerData = [
  { time: "0:00", viewers: 120 }, { time: "0:15", viewers: 340 }, { time: "0:30", viewers: 890 },
  { time: "0:45", viewers: 1200 }, { time: "1:00", viewers: 2100 }, { time: "1:15", viewers: 2431 },
  { time: "1:30", viewers: 1800 }, { time: "1:45", viewers: 1500 },
];

const revenueData = [
  { stream: "Stream 1", tips: 85, gifts: 40 }, { stream: "Stream 2", tips: 127, gifts: 65 },
  { stream: "Stream 3", tips: 210, gifts: 95 }, { stream: "Stream 4", tips: 160, gifts: 72 },
  { stream: "Stream 5", tips: 340, gifts: 120 },
];

export default function StreamAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Stream Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your streaming performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Peak Viewers" value="2,431" icon={Users} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatCard title="Total Revenue" value="$1,247" icon={DollarSign} iconColor="text-accent" iconBg="bg-accent/10" />
        <StatCard title="$STREAMING Tips" value="6,200" icon={Zap} iconColor="text-chart-3" iconBg="bg-chart-3/10" />
        <StatCard title="Engagement" value="87%" icon={TrendingUp} iconColor="text-chart-4" iconBg="bg-chart-4/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Viewer Spikes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={viewerData}>
              <defs>
                <linearGradient id="viewerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 18%, 18%)" />
              <XAxis dataKey="time" stroke="hsl(220, 10%, 50%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" }} />
              <Area type="monotone" dataKey="viewers" stroke="hsl(262, 83%, 58%)" fill="url(#viewerGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue by Stream</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 18%, 18%)" />
              <XAxis dataKey="stream" stroke="hsl(220, 10%, 50%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" }} />
              <Bar dataKey="tips" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gifts" fill="hsl(165, 82%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}