import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { economyAPI, Page, Card, Spinner } from "@/components/creator/os";

export default function Economy() {
  const { balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    economyAPI.get().then((real) => { setData(real || {}); }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Page title="Creator Economy" subtitle="Revenue, streaming tokens, and transaction activity"><Spinner /></Page>;

  return (
    <Page title="Creator Economy" subtitle="Revenue, streaming tokens, and transaction activity">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <p className="text-xs text-muted-foreground">$STREAMING Balance</p>
          <button onClick={refreshBalance} className="text-xl sm:text-2xl font-display font-bold text-accent">
            {loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span>
          </button>
        </Card>
        <Card><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl sm:text-2xl font-display font-bold">${(data.total_revenue || 0).toFixed(2)}</p></Card>
        <Card><p className="text-xs text-muted-foreground">$STREAMING</p><p className="text-xl sm:text-2xl font-display font-bold text-accent">{(data.streaming_revenue || 0).toFixed(2)}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Boosts</p><p className="text-xl sm:text-2xl font-display font-bold">{(data.boosts_total || 0).toFixed(0)} ⚡</p></Card>
        <Card><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-xl sm:text-2xl font-display font-bold">{data.subscriber_count || 0}</p></Card>
      </div>
      <Card>
        <h3 className="font-display font-semibold mb-3">Revenue by Type</h3>
        {Object.keys(data.by_type || {}).length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : Object.entries(data.by_type).map(([type, amt]) => (
          <div key={type} className="flex justify-between items-center gap-3 py-1.5 border-b border-border/50 last:border-0 text-sm">
            <span className="text-muted-foreground capitalize">{type.replace(/_/g, " ")}</span>
            <span className="font-medium whitespace-nowrap">${amt.toFixed(2)}</span>
          </div>
        ))}
      </Card>
      <div className="flex flex-wrap gap-4">
        <Link to="/sales" className="text-primary hover:underline text-sm inline-flex items-center gap-1">Sales dashboard →</Link>
        <Link to="/payouts" className="text-primary hover:underline text-sm inline-flex items-center gap-1">Manage payouts →</Link>
      </div>
    </Page>
  );
}