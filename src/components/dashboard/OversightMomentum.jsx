import React from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Crown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const CHART_DATA = [
  { time: "0s", viewers: 2100 },
  { time: "30s", viewers: 2210 },
  { time: "1m", viewers: 2350 },
  { time: "1.5m", viewers: 2310 },
  { time: "2m", viewers: 2401 },
  { time: "2.5m", viewers: 2401 },
  { time: "3m", viewers: 2431 },
];

export default function OversightMomentum({ viewerCount, engagementVelocity, topFans }) {
  return (
    <div className="space-y-6">
      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">Live Viewers</p>
          </div>
          <motion.p className="text-3xl font-bold text-primary" key={viewerCount}>
            {viewerCount.toLocaleString()}
          </motion.p>
          <p className="text-xs text-accent mt-1">+4.2% from peak</p>
        </motion.div>

        <motion.div
          className="p-4 rounded-xl bg-accent/5 border border-accent/20"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground font-semibold">Engagement Velocity</p>
          </div>
          <motion.p className="text-3xl font-bold text-accent" key={engagementVelocity}>
            {engagementVelocity}
          </motion.p>
          <p className="text-xs text-chart-3 mt-1">Messages/min</p>
        </motion.div>
      </div>

      {/* Viewer Growth Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Viewer Growth (Last 3 min)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={CHART_DATA}>
            <Line
              type="monotone"
              dataKey="viewers"
              stroke="hsl(var(--primary))"
              dot={false}
              strokeWidth={2}
              animationDuration={300}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Fans Leaderboard */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Top Fans This Stream</p>
        </div>

        {topFans.map((fan, i) => (
          <motion.div
            key={fan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border/50"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">#{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">@{fan.name}</p>
              <p className="text-xs text-muted-foreground">{fan.engagement}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-accent">${fan.tips.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}