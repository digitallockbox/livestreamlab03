import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Page, Card, streamsAPI } from "@/components/creator/os";

export default function Home() {
  const { wallet, balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => { streamsAPI.live().then((r) => setLiveCount((r.streams || []).length)); }, []);
  const tiles = [
    { to: "/go-live", label: "Go Live", desc: "Start a stream" },
    { to: "/watch", label: "Watch-to-Earn", desc: "Earn $STREAMING" },
    { to: "/wallet", label: "Wallet", desc: "Send / receive" },
    { to: "/profile", label: "Profile", desc: "Identity & badges" },
    { to: "/marketplace", label: "Marketplace", desc: "Sell products" },
    { to: "/videos", label: "Videos", desc: "Library & uploads" },
    { to: "/analytics", label: "Analytics", desc: "Streams + VOD" },
    { to: "/settings", label: "Settings", desc: "Account & branding" },
    { to: "/supabase", label: "Supabase", desc: "Browse Supabase data" },
    { to: "/boost", label: "Boosts", desc: "Support creators" },
    { to: "/subscriptions", label: "Subscriptions", desc: "Subscribe to creators" },
    { to: "/feed", label: "Feed", desc: "Posts & updates" },
    { to: "/messages", label: "Messages", desc: "Direct messages" },
    { to: "/economy", label: "Economy", desc: "Revenue overview" },
  ];
  return (
    <Page title="Creator OS" subtitle="Your Web3 creator ecosystem">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Connected wallet</p>
          <p className="font-mono text-sm break-all">{wallet}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <button onClick={refreshBalance} className="text-xl font-display font-bold text-accent">{loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span></button>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <p className="font-display font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
      <Card className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Live now</p>
        <Link to="/watch" className="text-sm text-primary hover:underline">{liveCount} streams · Watch &amp; earn →</Link>
      </Card>
    </Page>
  );
}