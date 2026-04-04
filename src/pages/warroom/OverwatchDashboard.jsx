import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Users, ShieldAlert, Zap, Radio,
  AlertTriangle, CheckCircle2, Eye, BarChart3, MessageSquare,
  DollarSign, ArrowUpRight, ChevronRight, Activity, Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ── Creator Tier Config ───────────────────────────────────────────────────────
const TIERS = [
  { id: "prospect",  label: "The Prospect",  color: "text-muted-foreground", bg: "bg-secondary",        border: "border-border",          desc: "Building stability & initial fan acquisition." },
  { id: "partner",   label: "The Partner",   color: "text-chart-3",          bg: "bg-chart-3/10",       border: "border-chart-3/30",       desc: "Proven engagement. Unlocks Affiliate Marketplace & lower fees." },
  { id: "sovereign", label: "The Sovereign", color: "text-accent",           bg: "bg-accent/10",        border: "border-accent/30",        desc: "Top-tier. Unlocks $STREAMING staking & Priority Transcoding." },
];

// ── Health Metrics ────────────────────────────────────────────────────────────
const HEALTH = [
  { label: "Technical Health",  icon: Activity,      value: 94, color: "text-accent",   desc: "Bitrate stable · 0 dropped frames" },
  { label: "Engagement Health", icon: MessageSquare, value: 78, color: "text-primary",  desc: "Chat velocity: 42 msg/min · Emotion density: High" },
  { label: "Economic Health",   icon: DollarSign,    value: 81, color: "text-chart-3",  desc: "Tip velocity: $12/min · 3 store conversions" },
  { label: "Retention Health",  icon: Users,         value: 87, color: "text-chart-4",  desc: "Avg. watch time: 18m · Drop-off at 24m" },
];

// ── Co-Pilot Alerts ───────────────────────────────────────────────────────────
const ALERTS = [
  { type: "opportunity", icon: Target,       color: "text-accent",      border: "border-accent/30",      bg: "bg-accent/5",      msg: "Engagement is peaking. High probability of Storefront conversion — shout out the New Era Hoodie now." },
  { type: "whale",       icon: Zap,          color: "text-yellow-400",  border: "border-yellow-400/30",  bg: "bg-yellow-400/5",  msg: "A Whale (High $STREAMING holder) just joined the stream. Priority alert." },
  { type: "warning",     icon: AlertTriangle, color: "text-chart-3",    border: "border-chart-3/30",     bg: "bg-chart-3/5",     msg: "Chat sentiment trending down. Suggest switching to an interactive poll or Q&A segment." },
  { type: "shield",      icon: ShieldAlert,  color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5", msg: "Viewer count spiked +340 but chat velocity is near zero. Aegis flagged for bot investigation." },
];

// ── Projected Payout ─────────────────────────────────────────────────────────
const PROJECTION = {
  current: 284.50,
  projected: 520.00,
  streaming: 4200,
  confidence: 82,
};

function HealthBar({ value, color }) {
  return (
    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-1.5 rounded-full ${color.replace("text-", "bg-")}`}
      />
    </div>
  );
}

function ScoreDial({ score }) {
  const color = score >= 85 ? "text-accent" : score >= 65 ? "text-chart-3" : "text-destructive";
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`font-display text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-xs text-muted-foreground mt-1">Sovereign Score</div>
      <div className={`text-xs font-semibold mt-1 ${color}`}>
        {score >= 85 ? "SOVEREIGN" : score >= 65 ? "PARTNER" : "PROSPECT"}
      </div>
    </div>
  );
}

export default function OverwatchDashboard() {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const sovereignScore = 87;
  const activeTier = TIERS[2]; // Sovereign for demo

  const visibleAlerts = ALERTS.filter((_, i) => !dismissedAlerts.includes(i));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Overwatch Intelligence Engine</span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Creator Intelligence</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Your silent partner — segmentation, co-pilot alerts, and predictive payouts. All in real time.
          </p>
        </div>
        <Link to="/streaming/console">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Radio className="w-4 h-4" /> Streamer Console
          </Button>
        </Link>
      </div>

      {/* Top row: Score + Tier + Payout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Sovereign Score */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center col-span-1">
          <ScoreDial score={sovereignScore} />
        </motion.div>

        {/* Creator Tier */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 col-span-1">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Creator Tier</p>
          <div className="space-y-2">
            {TIERS.map(tier => (
              <div key={tier.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  tier.id === activeTier.id
                    ? `${tier.bg} ${tier.border}`
                    : "bg-secondary/30 border-transparent opacity-50"
                }`}>
                {tier.id === activeTier.id
                  ? <CheckCircle2 className={`w-4 h-4 ${tier.color} shrink-0`} />
                  : <div className="w-4 h-4 rounded-full border border-border shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${tier.id === activeTier.id ? tier.color : "text-muted-foreground"}`}>{tier.label}</p>
                  {tier.id === activeTier.id && <p className="text-xs text-muted-foreground truncate">{tier.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Projected Payout */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6 col-span-1">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Projected Session Payout</p>
          <div className="flex items-end gap-2 mb-1">
            <span className="font-display text-4xl font-bold text-accent">${PROJECTION.projected.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground mb-1.5">projected</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Current earned: <span className="text-foreground font-semibold">${PROJECTION.current.toFixed(2)}</span></p>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-semibold">+{PROJECTION.streaming.toLocaleString()} $STREAMING</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span>{PROJECTION.confidence}% confidence — based on current trajectory</span>
          </div>
        </motion.div>
      </div>

      {/* Health Metrics */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Data Ingestion Loop</h2>
          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs ml-auto">Live</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HEALTH.map(h => (
            <div key={h.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <h.icon className={`w-3.5 h-3.5 ${h.color}`} />
                  <span className="text-xs font-semibold text-foreground">{h.label}</span>
                </div>
                <span className={`text-sm font-bold font-display ${h.color}`}>{h.value}</span>
              </div>
              <HealthBar value={h.value} color={h.color} />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Co-Pilot Alerts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Co-Pilot Alerts</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{visibleAlerts.length} active</Badge>
        </div>
        <div className="space-y-3">
          {visibleAlerts.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 text-center text-sm text-muted-foreground">
              All clear — no active alerts.
            </div>
          )}
          {ALERTS.map((alert, i) => dismissedAlerts.includes(i) ? null : (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.bg} ${alert.border}`}>
              <alert.icon className={`w-4 h-4 mt-0.5 ${alert.color} shrink-0`} />
              <p className="text-sm text-foreground flex-1 leading-relaxed">{alert.msg}</p>
              <button onClick={() => setDismissedAlerts(p => [...p, i])}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0 mt-0.5">Dismiss</button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Aegis + Forbidden Behaviors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <h2 className="font-display font-semibold text-foreground">Aegis Collaboration</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "View-Bot Detection", status: "Monitoring", color: "text-accent", dot: "bg-accent" },
              { label: "Content Shield (TOS)", status: "Active", color: "text-accent", dot: "bg-accent" },
              { label: "Suspicious Spike Flag", status: "1 flagged", color: "text-destructive", dot: "bg-destructive animate-pulse" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Overwatch Guardrails</h2>
          </div>
          <div className="space-y-2">
            {[
              "Raw formulas never exposed — creators see the score only",
              "Discovery is deterministic — no Pay-to-Play bias",
              "Individual PII is never exported to third-party brokers",
            ].map(rule => (
              <div key={rule} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}