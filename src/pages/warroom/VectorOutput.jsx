import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const outputData = [
  { day: "Mon", tokens: 240 }, { day: "Tue", tokens: 480 }, { day: "Wed", tokens: 320 },
  { day: "Thu", tokens: 560 }, { day: "Fri", tokens: 720 }, { day: "Sat", tokens: 880 }, { day: "Sun", tokens: 640 },
];

export default function VectorOutput() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Vector Output</h1>
        <p className="text-muted-foreground mt-1">Daily $STREAMING token generation and output metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Daily Avg Output", value: "548 $STR" },
          { label: "Peak Day Output", value: "880 $STR" },
          { label: "Weekly Total", value: "3,840 $STR" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-accent mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-6">Token Output This Week</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={outputData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1e2030", border: "1px solid #2d3148", borderRadius: "12px", color: "#e2e8f0" }} />
            <Bar dataKey="tokens" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}