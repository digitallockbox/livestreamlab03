import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RevenuePumping({ transaction }) {
  if (!transaction) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-center h-32 text-center">
        <p className="text-sm text-muted-foreground">Waiting for transactions...</p>
      </div>
    );
  }

  const splits = {
    creator: (transaction.amount * 0.8).toFixed(2),
    platform: (transaction.amount * 0.15).toFixed(2),
    heirs: (transaction.amount * 0.05).toFixed(2),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-display font-semibold text-foreground">Revenue Alert</h3>
        </div>
        <Badge className="bg-accent/20 text-accent border-accent/30">{transaction.timestamp}</Badge>
      </div>

      {/* Transaction Details */}
      <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
        <p className="text-lg font-bold text-foreground">{transaction.description}</p>
        <p className="text-sm text-muted-foreground mt-1">Type: {transaction.type.replace(/_/g, " ").toUpperCase()}</p>
      </div>

      {/* AutoSplit Visualization */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AutoSplit Breakdown</p>

        {[
          { label: "Creator Payout", value: splits.creator, percent: 80, color: "bg-primary text-primary" },
          { label: "Platform Fee", value: splits.platform, percent: 15, color: "bg-accent text-accent" },
          { label: "Heir Distribution", value: splits.heirs, percent: 5, color: "bg-chart-3 text-chart-3" },
        ].map(split => (
          <div key={split.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{split.label}</span>
              <span className="font-bold text-foreground">${split.value}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${split.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${split.percent}%` }}
                transition={{ delay: 0.2, duration: 0.6 }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{split.percent}% allocation</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
        <p className="text-xs text-muted-foreground mb-1">Total Transaction</p>
        <p className="text-2xl font-bold text-primary">${transaction.amount.toFixed(2)} {transaction.currency}</p>
      </div>
    </motion.div>
  );
}