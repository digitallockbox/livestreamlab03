import React from "react";
import { Eye, Clock, DollarSign, Zap } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Video 1", views: 12300, unlocks: 45 },
  { name: "Video 2", views: 3400, unlocks: 120 },
  { name: "Video 3", views: 8900, unlocks: 23 },
  { name: "Video 4", views: 15600, unlocks: 67 },
  { name: "Video 5", views: 6700, unlocks: 34 },
];

export default function VideoAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Video Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your video content performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Views" value="148.2K" icon={Eye} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatCard title="Watch Time" value="342h" icon={Clock} iconColor="text-accent" iconBg="bg-accent/10" />
        <StatCard title="Revenue" value="$892.50" icon={DollarSign} iconColor="text-chart-3" iconBg="bg-chart-3/10" />
        <StatCard title="$STREAMING Unlocks" value="289" icon={Zap} iconColor="text-chart-4" iconBg="bg-chart-4/10" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Views & Unlocks by Video</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 18%, 18%)" />
            <XAxis dataKey="name" stroke="hsl(220, 10%, 50%)" fontSize={12} />
            <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" }} />
            <Bar dataKey="views" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="unlocks" fill="hsl(165, 82%, 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}