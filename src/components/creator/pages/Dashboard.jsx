import React, { useEffect, useState } from "react";
import { Radio, ShoppingBag, Store as StoreIcon, BarChart3, Globe, Settings as SettingsIcon, Megaphone } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Card, streamsAPI } from "@/components/creator/os";
import Streams from "@/components/creator/pages/Streams";
import Marketplace from "@/components/creator/pages/Marketplace";
import Economy from "@/components/creator/pages/Economy";
import Domains from "@/components/creator/pages/Domains";
import Settings from "@/components/creator/pages/Settings";
import Store from "@/components/creator/pages/Store";
import ShoutoutBoard from "@/components/creator/pages/ShoutoutBoard";
import StreakNotifications from "@/components/creator/stream/StreakNotifications";
import ShoutoutAlerts from "@/components/creator/stream/ShoutoutAlerts";
import EarningsSummary from "@/components/creator/pages/EarningsSummary";

const MODULES = [
  { key: "streams", label: "Streams", icon: Radio, Component: Streams },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, Component: Marketplace },
  { key: "store", label: "Store", icon: StoreIcon, Component: Store },
  { key: "earnings", label: "Earnings", icon: BarChart3, Component: Economy },
  { key: "shoutouts", label: "Shoutouts", icon: Megaphone, Component: ShoutoutBoard },
  { key: "domain", label: "Domain", icon: Globe, Component: Domains },
  { key: "settings", label: "Settings", icon: SettingsIcon, Component: Settings },
];

function IdentityHeader() {
  const { walletAddress, chain, session } = useIdentity();
  const { balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    streamsAPI.live().then((r) => setLiveCount((r.streams || []).length)).catch(() => {});
  }, []);

  const domain = session?.bound_domain;
  const complete = session?.onboarding_completed;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display font-bold text-lg">Creator Identity</h2>
        <div className="flex items-center gap-2">
          <StreakNotifications />
          <ShoutoutAlerts />
          <span className={`text-xs px-2 py-0.5 rounded-full ${complete ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
            {complete ? "Onboarding Complete" : "Pending Domain Verification"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Wallet</p>
          <p className="font-mono text-xs break-all">{walletAddress || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Chain</p>
          <p className="capitalize">{chain || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Domain</p>
          <p className="text-primary truncate">{domain || "No domain bound"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">$STREAMING Balance</p>
          <button onClick={refreshBalance} className="text-lg font-display font-bold text-accent">
            {loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span>
          </button>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Live now</p>
          <p className="text-lg font-display font-bold">{liveCount}</p>
        </div>
        <div className="rounded-lg bg-muted p-3 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium mt-1">{complete ? "Ready" : "Finish onboarding"}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [page, setPage] = useState("streams");
  const active = MODULES.find((m) => m.key === page) || MODULES[0];
  const ActiveComponent = active.Component;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] gap-4 sm:gap-6">
        <aside className="lg:sticky lg:top-20 self-start">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isActive = page === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setPage(m.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap shrink-0 transition-colors border ${isActive ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"}`}
                >
                  <Icon className="w-4 h-4" /> {m.label}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="space-y-4 min-w-0">
          <IdentityHeader />
          <EarningsSummary />
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}