import React from "react";
import { Radio, Video, Mic, ShoppingBag, Link2, Wallet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Radio,
    title: "Live Streaming",
    description: "Go live instantly with a professional console. Real-time chat, $STREAMING tips, and viewer analytics — all built in.",
    color: "text-primary",
    bg: "from-primary/15 to-primary/5",
    border: "hover:border-primary/40",
  },
  {
    icon: Video,
    title: "Video Uploads",
    description: "Publish free or premium videos. Gate content behind $STREAMING unlocks to monetize your best work.",
    color: "text-accent",
    bg: "from-accent/15 to-accent/5",
    border: "hover:border-accent/40",
  },
  {
    icon: Mic,
    title: "Podcasts & Audio",
    description: "Launch your audio brand. Monetize episodes with listener boosts and track performance with deep analytics.",
    color: "text-chart-3",
    bg: "from-chart-3/15 to-chart-3/5",
    border: "hover:border-chart-3/40",
  },
  {
    icon: ShoppingBag,
    title: "Creator Store",
    description: "Sell digital products, presets, and exclusives. Accept USD and $STREAMING. Zero platform cut on token sales.",
    color: "text-chart-4",
    bg: "from-chart-4/15 to-chart-4/5",
    border: "hover:border-chart-4/40",
  },
  {
    icon: Link2,
    title: "Affiliate Marketplace",
    description: "Share affiliate links and earn layered commissions. Bonus $STREAMING on every conversion you drive.",
    color: "text-chart-5",
    bg: "from-chart-5/15 to-chart-5/5",
    border: "hover:border-chart-5/40",
  },
  {
    icon: Wallet,
    title: "CreatorVault",
    description: "Your sovereign earnings hub. Every dollar, every token tracked — with team splits and instant payouts.",
    color: "text-primary",
    bg: "from-primary/15 to-primary/5",
    border: "hover:border-primary/40",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Modules</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything in One Place
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Six powerful modules. One creator OS. Built for creators who refuse to be owned by platforms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${f.bg} border border-border ${f.border} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center border border-border/60">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <ArrowRight className={`w-4 h-4 ${f.color} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200`} />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}