import React from "react";
import { Radio, Video, Mic, ShoppingBag, LinkIcon, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Radio,
    title: "Live Streaming",
    description: "Go live instantly. Earn real-time tips in $STREAMING from your audience.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Video,
    title: "Video Uploads",
    description: "Upload premium content. Gate behind $STREAMING or offer free to grow your base.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Mic,
    title: "Podcasts & Audio",
    description: "Launch your podcast series. Monetize episodes with listener boosts.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: ShoppingBag,
    title: "Creator Store",
    description: "Sell digital products, merch, and exclusives. Accept $STREAMING payments.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: LinkIcon,
    title: "Affiliate Marketplace",
    description: "Share links, earn commissions. Get bonus $STREAMING on every conversion.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
  {
    icon: Wallet,
    title: "CreatorVault",
    description: "Your sovereign wallet. Track every dollar and $STREAMING token in one place.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Create & Earn
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One platform, infinite possibilities. Build your creator empire with tools designed for sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}