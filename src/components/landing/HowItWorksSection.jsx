import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Sliders, Zap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up free in under 60 seconds. No credit card required. Your creator profile is live instantly.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Sliders,
    step: "02",
    title: "Set Up Your Channels",
    description: "Configure your stream, upload your first video or podcast, and customize your creator store.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: Zap,
    step: "03",
    title: "Go Live & Publish",
    description: "Hit broadcast and your audience can tip you in $STREAMING tokens, buy your products, and subscribe.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
  },
  {
    icon: DollarSign,
    step: "04",
    title: "Get Paid Your Way",
    description: "Cash out to your bank, wallet, or hold $STREAMING tokens. CreatorVault tracks every cent.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Live in 4 Steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            From zero to earning in minutes. No technical knowledge required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl bg-card border ${s.border} hover:shadow-lg transition-all`}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-border z-10" />
              )}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center border ${s.border}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <span className={`font-display text-4xl font-bold ${s.color} opacity-20`}>{s.step}</span>
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/onboarding">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 px-8 font-semibold gap-2">
              Get Started Free <Zap className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}