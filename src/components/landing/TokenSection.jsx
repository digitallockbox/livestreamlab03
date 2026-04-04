import React from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, ShoppingBag, Radio, Lock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const usecases = [
  { icon: Radio, title: "Tip Streamers Live", desc: "Send $STREAMING tokens during any live broadcast. Creators receive 100% — zero platform cut.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Lock, title: "Unlock Premium Content", desc: "Gate videos, podcasts, and downloads behind $STREAMING. Fans pay once, own access forever.", color: "text-accent", bg: "bg-accent/10" },
  { icon: ShoppingBag, title: "Power the Creator Store", desc: "Every product in the store accepts $STREAMING at a discount rate. Creators incentivize token spending.", color: "text-chart-3", bg: "bg-chart-3/10" },
  { icon: TrendingUp, title: "Earn Bonus Multipliers", desc: "Hold and stake $STREAMING to unlock higher commission tiers, priority payouts, and platform perks.", color: "text-chart-4", bg: "bg-chart-4/10" },
];

export default function TokenSection() {
  return (
    <section id="ecosystem" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">$STREAMING Token</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              The Currency of
              <br />
              <span className="text-gradient-brand">Creator Economy</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              $STREAMING is the native utility token that powers every transaction on LiveStreamLab. Tips, unlocks, store purchases, affiliate bonuses — all flow through one token economy.
            </p>

            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Token Address (Solana)</p>
                <code className="text-xs font-mono text-foreground truncate block">8jExKCc1Y4LEjVjBLRGZEeY7vWBVzr9iTPRKh8Jzmoon</code>
              </div>
              <Badge className="bg-accent/10 text-accent border-accent/20 shrink-0">SPL</Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              {["0% creator fee", "Instant settlement", "Solana speed"].map(tag => (
                <span key={tag} className="text-xs bg-secondary border border-border rounded-full px-3 py-1.5 text-muted-foreground">{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* Right — use cases */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {usecases.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${u.bg} flex items-center justify-center mb-4`}>
                  <u.icon className={`w-5 h-5 ${u.color}`} />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-2">{u.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}