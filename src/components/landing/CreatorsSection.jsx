import React from "react";
import { Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const creators = [
  {
    name: "ShadowCreator",
    handle: "@shadowcreator",
    category: "Music & DJ",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
    earned: "$12,400",
    tokens: "48K $STR",
    quote: "I tripled my income in 3 months. CreatorVault changed everything.",
  },
  {
    name: "PixelQueen",
    handle: "@pixelqueen",
    category: "Gaming",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=80&q=80",
    earned: "$8,750",
    tokens: "31K $STR",
    quote: "The $STREAMING tip economy is insane. My streams earn 2x what they did on Twitch.",
  },
  {
    name: "NeonWolf",
    handle: "@neonwolf",
    category: "Tech & Code",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&q=80",
    earned: "$19,200",
    tokens: "72K $STR",
    quote: "I own my audience. My content. My payouts. This is what ownership feels like.",
  },
];

export default function CreatorsSection() {
  return (
    <section id="creators" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator Stories</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Creators. Real Revenue.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            These creators moved to LiveStreamLab and never looked back.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((c, i) => (
            <motion.div
              key={c.handle}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array(5).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-chart-3 fill-chart-3" />)}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{c.quote}"</p>

              <div className="flex items-center gap-3 mb-4">
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.handle} · {c.category}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-secondary rounded-xl px-3 py-2 text-center">
                  <p className="text-sm font-display font-bold text-foreground">{c.earned}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">USD Earned</p>
                </div>
                <div className="flex-1 bg-accent/10 rounded-xl px-3 py-2 text-center">
                  <p className="text-sm font-display font-bold text-accent flex items-center justify-center gap-1"><Zap className="w-3 h-3" />{c.tokens}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tokens</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}