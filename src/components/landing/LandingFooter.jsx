import React from "react";
import { Radio, Zap, Twitter, Youtube, Github, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { EMAILS } from "@/lib/constants/emails";

const links = {
  Platform: [
    { label: "Live Streaming", href: "#features" },
    { label: "Video Uploads", href: "#features" },
    { label: "Creator Store", href: "#features" },
    { label: "Podcasts", href: "#features" },
    { label: "Affiliates", href: "#features" },
  ],
  Token: [
    { label: "$STREAMING Token", href: "#ecosystem" },
    { label: "CreatorVault", href: "#ecosystem" },
    { label: "Tip Economy", href: "#ecosystem" },
    { label: "Team Splits", href: "#ecosystem" },
    { label: "API Docs", href: "#features" },
  ],
  Contact: [
    { label: "General", href: `mailto:${EMAILS.contact}` },
    { label: "Creator Support", href: `mailto:${EMAILS.support}` },
    { label: "Billing & Payouts", href: `mailto:${EMAILS.billing}` },
    { label: "Security", href: `mailto:${EMAILS.security}` },
    { label: "Operators", href: `mailto:${EMAILS.operators}` },
  ],
};

const SOCIAL_ICONS = [Twitter, Youtube, Github, MessageCircle, Send];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/30 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-foreground">LiveStreamLab</span>
                <span className="text-primary text-xs font-bold">.live</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-xs">
              The sovereign creator platform. Stream, monetize, and own every dollar you earn.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_ICONS.map((SocialIcon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <SocialIcon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">{section}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 LiveStreamLab.live — All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-accent" />
            <span>Powered by <span className="text-accent font-semibold">$STREAMING</span></span>
          </div>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}