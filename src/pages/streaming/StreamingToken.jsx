import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Lock, ShoppingBag, Star, TrendingUp, Gift,
  CheckCircle2, ArrowUpRight, Copy, Check, Shield,
  Coins, Radio, Video, Mic2, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CONTRACT = "8jExKCc1Y4LEjVjBLRGZEeY7vWBVzr9iTPRKh8Jzmoon";

// ── Token Use Cases ───────────────────────────────────────────────────────────
const USE_CASES = [
  {
    icon: Radio,
    label: "Stream Tips",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    desc: "Viewers send $STREAMING tips directly to creators. Omega routes the split instantly — no 30-day holds.",
    example: "Send 500 $STREAMING → Creator receives 475, platform takes 25."
  },
  {
    icon: Lock,
    label: "Token-Gated Content",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    desc: "Creators set a $STREAMING minimum balance to unlock premium videos, podcasts, or live streams.",
    example: "Hold 1,000 $STREAMING → Unlock exclusive member-only episodes."
  },
  {
    icon: ShoppingBag,
    label: "Marketplace Gas",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    desc: "$STREAMING is accepted as currency across the entire store and affiliate marketplace.",
    example: "Pay 2,500 $STREAMING → Receive Beat Pack Vol.1 instantly."
  },
  {
    icon: Star,
    label: "Staking Rewards",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    desc: "Sovereign-tier creators stake $STREAMING to earn platform yield and AutoSplit multipliers.",
    example: "Stake 10,000 $STREAMING → Earn 8% APY + 1.2x AutoSplit bonus."
  },
  {
    icon: TrendingUp,
    label: "Boost & Discovery",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    desc: "Burn $STREAMING to boost content visibility in the discovery feed. Fully labeled as Promoted.",
    example: "Burn 500 $STREAMING → 24h featured placement in category feed."
  },
  {
    icon: Gift,
    label: "PPV & Unlocks",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    desc: "Pay-per-view streams and one-time video unlocks can be purchased entirely in $STREAMING.",
    example: "Pay 300 $STREAMING → Watch exclusive PPV event live."
  },
];

// ── Token Flow Steps ──────────────────────────────────────────────────────────
const TOKEN_FLOW = [
  { step: "01", label: "Viewer buys $STREAMING", desc: "On any DEX or directly within the platform wallet." },
  { step: "02", label: "Token enters the ecosystem", desc: "Tips, unlocks, purchases, boosts, or staking." },
  { step: "03", label: "Omega routes the split", desc: "Creator share, platform fee, and team splits — instantly settled." },
  { step: "04", label: "Creator withdraws or stakes", desc: "Convert to USD, hold for staking yield, or reinvest into boosts." },
];

// ── Tier Gating ───────────────────────────────────────────────────────────────
const TIER_GATES = [
  { tier: "Prospect",  hold: "0",       features: ["Basic tips", "Store purchases", "PPV unlocks"], color: "text-muted-foreground", bg: "bg-secondary" },
  { tier: "Partner",   hold: "1,000",   features: ["All Prospect features", "Affiliate Marketplace", "Token-gated content"], color: "text-chart-3", bg: "bg-chart-3/10" },
  { tier: "Sovereign", hold: "10,000",  features: ["All Partner features", "Staking rewards", "Priority Transcoding", "AutoSplit multiplier"], color: "text-accent", bg: "bg-accent/10" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function StreamingToken() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Web3 Layer — Section 7</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">$STREAMING Integration</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          The $STREAMING token is woven into every layer of the platform — tips, unlocks, marketplace gas, staking, and discovery boosts.
        </p>

        {/* Contract Address */}
        <div className="flex items-center gap-3 mt-4 bg-card border border-border rounded-xl px-4 py-3 w-fit">
          <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Solana SPL Token Contract</p>
            <code className="text-xs font-mono text-foreground">{CONTRACT}</code>
          </div>
          <CopyButton text={CONTRACT} />
          <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs ml-1">Mainnet</Badge>
        </div>
      </motion.div>

      {/* Use Cases Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display font-semibold text-foreground mb-4">Token Use Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className={`bg-card border ${uc.border} rounded-2xl p-5 hover:scale-[1.01] transition-transform`}>
              <div className={`w-9 h-9 rounded-xl ${uc.bg} flex items-center justify-center mb-4`}>
                <uc.icon className={`w-4 h-4 ${uc.color}`} />
              </div>
              <h3 className={`font-display font-semibold text-sm ${uc.color} mb-1`}>{uc.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{uc.desc}</p>
              <div className="bg-secondary/60 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground/80 italic">{uc.example}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Token Flow */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-foreground mb-6">Token Flow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOKEN_FLOW.map((step, i) => (
            <div key={step.step} className="relative">
              <div className="text-3xl font-display font-bold text-border mb-2">{step.step}</div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{step.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < TOKEN_FLOW.length - 1 && (
                <ArrowUpRight className="hidden lg:block absolute top-2 -right-2 w-4 h-4 text-muted-foreground rotate-45" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tier Gating */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display font-semibold text-foreground mb-4">Token-Gated Tier Unlocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIER_GATES.map(tier => (
            <div key={tier.tier} className={`${tier.bg} border border-border rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-display font-bold text-base ${tier.color}`}>{tier.tier}</span>
                <Badge className="bg-secondary text-muted-foreground border-border text-xs">
                  Hold {tier.hold} $STREAMING
                </Badge>
              </div>
              <ul className="space-y-2">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${tier.color} shrink-0`} />
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Guardrails */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Web3 Guardrails</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "No Pay-to-Play Discovery", desc: "Boosts are always labeled Promoted. Organic reach is never suppressed." },
            { label: "No PII Token Linking", desc: "Token wallets are pseudonymous. Individual identity is never linked to on-chain data." },
            { label: "Omega Settled Instantly", desc: "All token transactions clear through Omega in real time. No 30-day payment holds." },
          ].map(g => (
            <div key={g.label} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/10 via-yellow-400/5 to-accent/10 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-foreground text-lg">Ready to activate your $STREAMING wallet?</p>
          <p className="text-sm text-muted-foreground mt-1">Connect your Solana wallet to start earning, staking, and unlocking premium features.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/vault">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Zap className="w-4 h-4" /> Open Vault
            </Button>
          </Link>
          <Link to="/api-docs">
            <Button variant="outline" className="gap-2">
              <ArrowUpRight className="w-4 h-4" /> API Docs
            </Button>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}