import React from "react";
import { Zap, TrendingUp, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function StreamingEcosystemSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">$STREAMING Ecosystem</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            The Creator Economy, Reinvented
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            $STREAMING isn't just a token — it's the fuel that powers tips, unlocks, purchases, and payouts across the entire platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: TrendingUp, title: "Earn While You Create", desc: "Every stream, every video view, every sale generates $STREAMING rewards on top of your earnings." },
            { icon: Shield, title: "Sovereign Ownership", desc: "Your $STREAMING tokens are yours. No middleman, no platform lock-in, full control." },
            { icon: Globe, title: "Global Instant Payouts", desc: "Get paid instantly through CreatorVault. No 30-day waits, no minimum thresholds." },
            { icon: Zap, title: "Boost & Tip Economy", desc: "Fans boost your content and tip during streams using $STREAMING. Direct creator-to-fan value exchange." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4 p-6 rounded-2xl bg-card/50 border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}