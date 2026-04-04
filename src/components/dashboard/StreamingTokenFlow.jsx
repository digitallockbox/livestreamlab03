import React from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

export default function StreamingTokenFlow({ tokenSettlements }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="font-display font-semibold text-foreground">$STREAMING Token Flow</h3>
      </div>

      {/* Scrolling Ticker */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden p-4 h-32">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10" />

        {/* Ticker content */}
        <motion.div
          className="space-y-3"
          animate={{ y: [0, -100, -200, -300, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        >
          {[...tokenSettlements, ...tokenSettlements].map((settlement, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">@{settlement.user}</p>
                <p className="text-xs text-muted-foreground">{settlement.time}</p>
              </div>
              <p className="text-sm font-bold text-primary flex items-center gap-1">
                +{settlement.amount}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "24h Volume", value: "$12,450" },
          { label: "Active Wallets", value: "2,341" },
          { label: "Avg. Transaction", value: "$45.20" },
        ].map(stat => (
          <div key={stat.label} className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-sm font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Flow visualization */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-chart-3/5 border border-primary/10 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="text-center">
            <p className="font-semibold text-foreground">Wallet Balance</p>
            <p className="text-lg font-bold text-primary mt-1">8,450 $STR</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
          <div className="text-center">
            <p className="font-semibold text-foreground">Pending Payout</p>
            <p className="text-lg font-bold text-accent mt-1">2,340 $STR</p>
          </div>
        </div>
      </div>
    </div>
  );
}