import React from "react";
import { Zap, Play, ArrowRight, Radio, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/5 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[180px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-16">
        {/* Left — copy */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-7">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-semibold text-primary">The Sovereign Creator Platform</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.93] mb-6">
            <span className="text-foreground">Create.</span>
            <br />
            <span className="text-gradient-purple">Stream.</span>
            <br />
            <span className="text-accent">Own It All.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
            Stream live, publish videos, launch podcasts, sell products — and get paid with <span className="text-foreground font-semibold">$STREAMING tokens</span>. Your platform. Your rules. Your revenue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link to="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 px-7 font-semibold gap-2">
                Start Creating Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary gap-2 font-semibold">
              <Play className="w-4 h-4 text-accent fill-accent" /> Watch Demo
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {[
              { value: "10K+", label: "Creators" },
              { value: "$2.4M", label: "Paid Out" },
              { value: "50M+", label: "Views" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Live stream mockup */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="relative">
            {/* Card glow */}
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-95" />

            <div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
              {/* Stream preview */}
              <div className="bg-gradient-to-br from-primary/20 via-background to-accent/10 aspect-video flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80')] bg-cover bg-center opacity-20" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center">
                    <Radio className="w-6 h-6 text-primary" />
                  </div>
                  <div className="bg-destructive/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </div>
                </div>
              </div>

              {/* Stream info bar */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">ShadowCreator — Late Night Beats</p>
                  <p className="text-xs text-muted-foreground">Music • Started 42 min ago</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1,248</span>
                  <span className="flex items-center gap-1 text-accent font-semibold"><Zap className="w-3 h-3" /> 4,820</span>
                </div>
              </div>

              {/* Tip activity */}
              <div className="p-4 space-y-2">
                {[
                  { user: "neon_wolf", amount: "250 $STR", color: "text-accent" },
                  { user: "pixelqueen", amount: "100 $STR", color: "text-primary" },
                  { user: "darkbyte_", amount: "$5.00", color: "text-chart-3" },
                ].map((t) => (
                  <div key={t.user} className="flex items-center justify-between text-xs bg-secondary/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground"><span className="text-foreground font-medium">@{t.user}</span> tipped</span>
                    <span className={`font-bold ${t.color}`}>{t.amount}</span>
                  </div>
                ))}
                <button className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Send Tip
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}