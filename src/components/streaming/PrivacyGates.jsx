import React, { useState } from "react";
import { Lock, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PRIVACY_MODES = [
  { id: "public", label: "Public", desc: "Anyone can discover and watch", icon: Globe, color: "text-accent" },
  { id: "unlisted", label: "Unlisted", desc: "Only with link, not in discovery", icon: Users, color: "text-chart-3" },
  { id: "token-gated", label: "Token-Gated", desc: "Viewers must hold $STREAMING", icon: Lock, color: "text-primary" },
];

export default function PrivacyGates({ currentMode = "public", onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">Privacy & Access</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PRIVACY_MODES.map(mode => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange?.(mode.id)}
              className={`border rounded-xl p-2.5 text-center transition-all ${
                isActive
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary"
                  : "bg-secondary border-border hover:border-primary/50"
              }`}
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${mode.color}`} />
              <p className="text-xs font-semibold text-foreground">{mode.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{mode.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}