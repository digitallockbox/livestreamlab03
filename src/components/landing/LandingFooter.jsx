import React from "react";
import { Zap } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">LiveStreamLab</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 LiveStreamLab.live — The Sovereign Creator Platform
        </p>
      </div>
    </footer>
  );
}