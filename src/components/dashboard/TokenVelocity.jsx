import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MAX_HISTORY = 20;

function Sparkline({ data, color = "#34d399" }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

export default function TokenVelocity({ tokenSettlements = [], realtimeTransaction = null }) {
  const [velocityHistory, setVelocityHistory] = useState([120, 145, 132, 168, 155, 190, 178, 210, 198, 225]);
  const [currentVelocity, setCurrentVelocity] = useState(225);
  const [totalSettled, setTotalSettled] = useState(48200);
  const [throughput, setThroughput] = useState(0); // tx/min
  const txCountRef = useRef(0);
  const windowRef = useRef([]);

  // Track throughput in a rolling 60s window
  useEffect(() => {
    const now = Date.now();
    windowRef.current.push(now);
    windowRef.current = windowRef.current.filter(t => now - t < 60000);
    setThroughput(windowRef.current.length);
  }, [realtimeTransaction]);

  // Update velocity when new tx comes in
  useEffect(() => {
    if (!realtimeTransaction) return;
    txCountRef.current++;
    const spike = realtimeTransaction.amount || 0;
    setCurrentVelocity(prev => {
      const next = Math.max(80, Math.round(prev + (spike * 0.1) + (Math.random() * 20 - 5)));
      setVelocityHistory(h => [...h.slice(-(MAX_HISTORY - 1)), next]);
      return next;
    });
    setTotalSettled(prev => prev + Math.round(spike * 0.4));
  }, [realtimeTransaction]);

  const prevVelocity = velocityHistory[velocityHistory.length - 2] || currentVelocity;
  const trending = currentVelocity >= prevVelocity;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">$STREAMING Token Velocity</p>
            <p className="text-xs text-muted-foreground">Real-time token throughput</p>
          </div>
        </div>
        <Badge className={`gap-1 text-[10px] ${trending ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
          {trending ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trending ? "Rising" : "Cooling"}
        </Badge>
      </div>

      {/* Main metric */}
      <div className="flex items-end justify-between">
        <div>
          <motion.p
            key={currentVelocity}
            initial={{ opacity: 0.5, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold font-mono text-accent"
          >
            {currentVelocity.toLocaleString()}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-0.5">tokens/min velocity</p>
        </div>
        <Sparkline data={velocityHistory} color={trending ? "#34d399" : "#f87171"} />
      </div>

      {/* Sub-metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold font-mono text-foreground">{totalSettled.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Settled</p>
        </div>
        <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold font-mono text-primary">{throughput}</p>
          <p className="text-[10px] text-muted-foreground">TX/min</p>
        </div>
        <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold font-mono text-chart-3">{txCountRef.current}</p>
          <p className="text-[10px] text-muted-foreground">Session TX</p>
        </div>
      </div>

      {/* Settlement ticker */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3" /> Live Settlements
        </p>
        <div className="space-y-1 max-h-28 overflow-hidden">
          <AnimatePresence initial={false}>
            {tokenSettlements.slice(0, 4).map((s, i) => (
              <motion.div key={`${s.user}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between text-[10px] bg-accent/5 border border-accent/10 rounded-lg px-2.5 py-1">
                <span className="text-primary font-medium">@{s.user}</span>
                <span className="text-accent font-bold">{s.amount}</span>
                <span className="text-muted-foreground/60">{s.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}