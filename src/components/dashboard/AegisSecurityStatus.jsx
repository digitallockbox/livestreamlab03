import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AegisSecurityStatus({ systemHealth }) {
  const [handshakeActive, setHandshakeActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setHandshakeActive(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const checks = [
    { name: "Trident Shield Handshake", status: "active", time: "Connected 45s ago" },
    { name: "Aegis Fraud Detection", status: "active", time: "0 anomalies detected" },
    { name: "Overwatch Segmentation", status: "active", time: "Segment: Gold" },
    { name: "Omega Payout Verification", status: "active", time: "No pending disputes" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 flex items-start gap-4">
        <motion.div
          className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Shield className="w-6 h-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground">System Secure</h3>
            <Badge className="bg-accent text-white border-0 gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Trident OS connection established. All engines operational.
          </p>
          <p className="text-xs text-accent mt-2 font-mono">Uptime: 99.98% | Last verified 3s ago</p>
        </div>
      </div>

      {/* Handshake Indicator */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ opacity: [0.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <p className="text-sm font-semibold text-foreground">Trident Shield Handshake</p>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>→ Initiating secure tunnel to Aegis...</p>
          <motion.p key={handshakeActive ? "active" : "inactive"}>
            {handshakeActive ? "✓ Symmetric key exchange" : "○ Awaiting response"}
          </motion.p>
          <p>← Connection verified</p>
        </div>
      </div>

      {/* Security Checks */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Engine Status</p>
        {checks.map((check, i) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-accent/10"
          >
            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{check.name}</p>
              <p className="text-xs text-muted-foreground">{check.time}</p>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs flex-shrink-0">
              OK
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}