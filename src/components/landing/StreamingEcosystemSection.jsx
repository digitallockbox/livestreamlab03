import React from "react";
import { Zap, TrendingUp, Shield, Globe, BarChart3, Users } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  { icon: TrendingUp, title: "Earn While You Create", desc: "Every stream, video view, and sale generates $STREAMING rewards stacked on top of your cash earnings." },
  { icon: Shield, title: "Sovereign Ownership", desc: "Your tokens are truly yours. No middleman, no platform lock-in, full custody and control at all times." },
  { icon: Globe, title: "Global Instant Payouts", desc: "CreatorVault pays you instantly. No 30-day holds, no minimums, no arbitrary deductions." },
  { icon: Zap, title: "Tip & Boost Economy", desc: "Fans send $STREAMING tips live and boost your content. Direct value exchange between creator and audience." },
  { icon: BarChart3, title: "Creator Intelligence", desc: "Full analytics dashboard — revenue cycles, audience spikes, affiliate conversions, and store performance." },
  { icon: Users, title: "Team Splits", desc: "Collaborate with your team and automatically split earnings by percentage — configured once, paid forever." },
];

export default function StreamingEcosystemSection() {
  return (
    <section id="ecosystem" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">$STREAMING Token Ecosystem</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Creator Economy,<br />Reinvented
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            $STREAMING isn't a gimmick — it's the economic layer that powers tips, unlocks, purchases, boosts, and payouts across every module.
          </p>
        </motion.div>

        {/* Token visual */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex justify-center mb-16">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 flex items-center justify-center shadow-2xl shadow-accent/20 border border-accent/30">
              <Zap className="w-12 h-12 text-accent" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
          </div>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl bg-card/60 border border-border hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <p.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}