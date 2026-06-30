import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Radio, Eye, Video, ShoppingBag, Wallet, CreditCard, BarChart3, Newspaper, MessageSquare, Settings as SettingsIcon, Globe } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { useIdentity } from "@/lib/web3/identity";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/go-live", label: "Go Live", icon: Radio },
  { to: "/watch", label: "Watch", icon: Eye },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/marketplace", label: "Market", icon: ShoppingBag },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/domains", label: "Domains", icon: Globe },
  { to: "/economy", label: "Economy", icon: CreditCard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/feed", label: "Feed", icon: Newspaper },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function SharedLayout() {
  const { wallet, balance, connected } = useStreamingIdentity();
  const { session, chain } = useIdentity();
  const domain = session?.bound_domain;
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-sidebar/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/" className="font-display font-bold text-gradient-brand whitespace-nowrap">LiveStreamLab</Link>
          <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {NAV.map((n) => {
              const active = loc.pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {chain && (
              <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{chain}</span>
            )}
            {domain && (
              <span className="hidden lg:inline text-xs text-primary font-medium max-w-[140px] truncate">{domain}</span>
            )}
            {connected && wallet && (
              <span className="hidden md:inline text-xs text-muted-foreground font-mono">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span>
            )}
            <span className="text-sm font-display font-bold text-accent whitespace-nowrap">{balance} ◎</span>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}