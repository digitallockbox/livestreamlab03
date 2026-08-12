import React from "react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Creator",
    price: "Free",
    sub: "Forever",
    description: "Everything you need to start building your sovereign creator business.",
    features: ["Live streaming (up to 2hr)", "Video uploads (5GB)", "Podcast publishing", "Creator Store (10 products)", "Affiliate links", "CreatorVault basic"],
    cta: "Start Free",
    ctaPath: "/enter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    sub: "per month",
    description: "Unlock the full power of LiveStreamLab with advanced monetization tools.",
    features: ["Unlimited live streaming", "Unlimited video & audio", "Advanced analytics", "Creator Store (unlimited)", "Team splits (up to 5)", "Priority payouts", "$STREAMING bonus earnings", "Custom channel branding"],
    cta: "Go Pro",
    ctaPath: "/enter",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$99",
    sub: "per month",
    description: "For professional studios and high-volume creator operations.",
    features: ["Everything in Pro", "Team splits (unlimited)", "White-label options", "API access", "Dedicated support", "Custom payout schedules", "War Room operator tools"],
    cta: "Contact Us",
    ctaPath: "/enter",
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Plans</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">No hidden fees. No platform tax. Keep what you earn.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl border transition-all ${plan.highlight ? "bg-primary/10 border-primary/40 shadow-xl shadow-primary/10" : "bg-card border-border"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">{plan.sub}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-primary" : "text-accent"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={plan.ctaPath} className="block">
                <Button className={`w-full gap-2 font-semibold ${plan.highlight ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/25" : "bg-secondary hover:bg-secondary/80 text-foreground"}`}>
                  {plan.highlight && <Zap className="w-4 h-4" />}
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}