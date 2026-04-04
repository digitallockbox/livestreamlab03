import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MockDataPanel({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mock Transactions</p>
      {transactions.slice(-5).map((tx, i) => {
        const Icon = tx.status === "completed" ? CheckCircle2 : tx.status === "failed" ? AlertCircle : Clock;
        const color = tx.status === "completed" ? "text-accent" : tx.status === "failed" ? "text-destructive" : "text-primary";

        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-secondary rounded-lg p-3 border border-border/50"
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">{tx.item}</p>
                  <Badge className={`text-[10px] flex-shrink-0 ${
                    tx.status === "completed" ? "bg-accent/20 text-accent" : 
                    tx.status === "failed" ? "bg-destructive/20 text-destructive" :
                    "bg-primary/20 text-primary"
                  }`}>
                    {tx.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">${tx.amount.toFixed(2)} · {tx.paymentMethod}</p>
                {tx.status === "completed" && (
                  <div className="grid grid-cols-3 gap-2 text-[9px]">
                    <div className="bg-primary/10 rounded px-1.5 py-0.5">
                      <p className="text-primary font-bold">${tx.splits.creator.toFixed(2)}</p>
                      <p className="text-muted-foreground">Creator</p>
                    </div>
                    <div className="bg-accent/10 rounded px-1.5 py-0.5">
                      <p className="text-accent font-bold">${tx.splits.platform.toFixed(2)}</p>
                      <p className="text-muted-foreground">Platform</p>
                    </div>
                    <div className="bg-chart-3/10 rounded px-1.5 py-0.5">
                      <p className="text-chart-3 font-bold">${tx.splits.heirs.toFixed(2)}</p>
                      <p className="text-muted-foreground">Heirs</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}