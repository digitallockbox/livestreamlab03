import React from "react";
import { Link } from "react-router-dom";
import { User, Palette, Shield, Bell, Link2 } from "lucide-react";
import { Page } from "@/components/creator/os";

const ITEMS = [
  { to: "/settings/profile", label: "Profile", desc: "Public creator profile", icon: User },
  { to: "/settings/branding", label: "Branding", desc: "Channel visual identity", icon: Palette },
  { to: "/settings/security", label: "Security", desc: "Password, 2FA, sessions", icon: Shield },
  { to: "/settings/notifications", label: "Notifications", desc: "What updates you receive", icon: Bell },
  { to: "/settings/connected", label: "Connected Accounts", desc: "OAuth integrations", icon: Link2 },
];

export default function Settings() {
  return (
    <Page title="Settings" subtitle="Manage your creator account">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ITEMS.map((i) => {
          const Icon = i.icon;
          return (
            <Link key={i.to} to={i.to} className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/50 transition-colors flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0"><Icon className="w-5 h-5" /></div>
              <div className="min-w-0">
                <p className="font-display font-semibold">{i.label}</p>
                <p className="text-xs text-muted-foreground">{i.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}