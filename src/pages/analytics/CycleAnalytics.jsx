import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/ui/StatCard";
import { Zap, DollarSign, TrendingUp } from "lucide-react";

const breakdown = [
  { name: "Stream Tips", value: 3400, color: "#8b5cf6" },
  { name: "Video Unlocks", value: 2100, color: "#34d399" },
  { name: "Store Sales", value: 1800, color: "#f59e0b" },
  { name: "Affiliates", value: 900, color: "#38bdf8" },
  { name: "Podcast", value: 600, color: "#f43f5e" },
];

export default function CycleAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Cycle Analytics</h1>
        <p className="text-muted-foreground mt-1">Revenue breakdown for the current payout cycle.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Cycle Revenue" value="$8,800" icon={DollarSign} accent />
        <StatCard title="$STREAMING Earned" value="4,400" icon={Zap} />
        <StatCard title="Cycle Growth" value="+14%" icon={TrendingUp} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-6">Revenue Sources</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                {breakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e2030", border: "1px solid #2d3148", borderRadius: "12px", color: "#e2e8f0" }} />
              <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Source Breakdown</h3>
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}