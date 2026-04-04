import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StreamHealthMonitor from "./StreamHealthMonitor";
import PrivacyGates from "./PrivacyGates";
import SourceSwitcher from "./SourceSwitcher";
import MonetizationHooks from "./MonetizationHooks";

export default function StreamManager({ streamData = {}, onEndStream, onSettings }) {
  const [privacyMode, setPrivacyMode] = useState("public");
  const [showNukeWarning, setShowNukeWarning] = useState(false);

  const isLive = streamData?.status === "live";
  const uptime = streamData?.uptime || "00:00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-semibold text-destructive uppercase">LIVE</span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{streamData?.title || "Untitled Stream"}</h2>
          <p className="text-sm text-muted-foreground mt-1">Uptime: {uptime}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSettings}>Settings</Button>
          {showNukeWarning ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowNukeWarning(false)}>Cancel</Button>
              <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={onEndStream}>
                End Stream
              </Button>
            </motion.div>
          ) : (
            <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => setShowNukeWarning(true)}>
              <X className="w-3 h-3 mr-1" /> End Stream
            </Button>
          )}
        </div>
      </div>

      {/* Warning */}
      {showNukeWarning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">End Stream?</p>
            <p className="text-xs text-muted-foreground mt-1">This will flush the CDN cache and end the broadcast immediately.</p>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Health & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <StreamHealthMonitor streamData={streamData} />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <SourceSwitcher />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <PrivacyGates currentMode={privacyMode} onChange={setPrivacyMode} />
          </div>
        </div>

        {/* Right: Monetization */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <MonetizationHooks streamData={streamData} />
          
          {/* Projected Payout */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Projected Session Payout</p>
            <p className="text-2xl font-display font-bold text-primary">${streamData?.projectedPayout || "0.00"}</p>
            <p className="text-xs text-muted-foreground mt-1">Updated in real-time by Overwatch</p>
          </div>
        </div>
      </div>
    </div>
  );
}