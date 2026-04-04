import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const perks = [
  { icon: Zap, text: "Free forever plan" },
  { icon: Shield, text: "No platform tax" },
  { icon: DollarSign, text: "Instant payouts" },
];

export default function CTABanner() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-semibold text-primary">Join 10,000+ creators already earning</span>
          </div>

          <h2 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Platform.
            <br />
            <span className="text-gradient-brand">Your Revenue.</span>
          </h2>

          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop renting your audience from Big Tech. Own your stream, your store, your payouts — powered by $STREAMING tokens.
          </p>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <p.icon className="w-3.5 h-3.5 text-accent" />
                </div>
                {p.text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 px-9 font-bold text-base gap-2 h-13">
                Start Creating Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary font-semibold text-base px-9 gap-2 h-13">
                View API Docs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}