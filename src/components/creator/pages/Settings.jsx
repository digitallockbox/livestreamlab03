import React from "react";
import { Link } from "react-router-dom";
import { User, Palette, Shield, Bell, Link2, CreditCard } from "lucide-react";
import { Page } from "@/components/creator/os";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { useIdentity } from "@/lib/web3/identity";

const ITEMS = [
  { to: "/settings/profile", label: "Account Preferences", desc: "Public creator profile", icon: User },
  { to: "/settings/billing", label: "Billing", desc: "Plan, balance & transactions", icon: CreditCard },
  { to: "/settings/branding", label: "Branding", desc: "Channel visual identity", icon: Palette },
  { to: "/settings/notifications", label: "Notifications", desc: "What updates you receive", icon: Bell },
  { to: "/settings/security", label: "Security", desc: "Password, 2FA, sessions", icon: Shield },
  { to: "/settings/connected", label: "Connected Accounts", desc: "OAuth integrations", icon: Link2 },
];

export default function Settings() {
  const { wallet, balance, connected } = useStreamingIdentity();
  const { session } = useIdentity();
  const plan = session?.badge_tier || "bronze";

  return (
    <Page title="Settings" subtitle="Manage your creator account in one place">
      {/* Account summary */}
      <div className="rounded-2xl border border-border bg-gradient-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Wallet</p>
            <p className="font-mono text-xs break-all mt-0.5">{connected ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="text-sm font-display font-semibold capitalize mt-0.5 text-gradient-brand">{plan}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">$STREAMING</p>
            <p className="text-sm font-display font-semibold text-accent mt-0.5">{Number(balance || 0).toLocaleString()} ◎</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Domain</p>
            <p className="text-sm text-primary truncate mt-0.5">{session?.bound_domain || "None"}</p>
          </div>
        </div>
      </div>

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