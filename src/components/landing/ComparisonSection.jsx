import React from "react";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

const rows = [
  { feature: "Platform fee on earnings", lsl: "0% on $STREAMING", them: "30–50%" },
  { feature: "Own your audience data", lsl: true, them: false },
  { feature: "Built-in crypto tipping", lsl: true, them: false },
  { feature: "Creator Store + Affiliates", lsl: true, them: false },
  { feature: "Team revenue splits", lsl: true, them: false },
  { feature: "Instant payout on demand", lsl: true, them: false },
  { feature: "Podcast + video + live in one", lsl: true, them: false },
  { feature: "White-label option", lsl: true, them: false },
  { feature: "War Room analytics", lsl: true, them: false },
];

const Cell = ({ value }) => {
  if (value === true) return <Check className="w-4 h-4 text-accent mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-semibold text-accent">{value}</span>;
};

export default function ComparisonSection() {
  return (
    <section className="py-28 px-6 bg-card/20 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why Switch</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            LiveStreamLab vs. The Rest
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Old platforms own your audience. We give it back to you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-secondary/50 border-b border-border">
            <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</div>
            <div className="p-4 text-center border-l border-border">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-sm font-bold text-foreground">LiveStreamLab</span>
              </div>
            </div>
            <div className="p-4 text-center border-l border-border">
              <span className="text-sm font-medium text-muted-foreground">Other Platforms</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
              <div className="p-4 text-sm text-foreground">{row.feature}</div>
              <div className="p-4 text-center border-l border-border flex items-center justify-center bg-primary/5">
                <Cell value={row.lsl} />
              </div>
              <div className="p-4 text-center border-l border-border flex items-center justify-center">
                <Cell value={row.them} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}