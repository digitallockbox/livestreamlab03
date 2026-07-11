import React, { useEffect, useState } from "react";
import { Users, Crown } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { subscriptionsAPI, Card, Spinner } from "@/components/creator/os";

const TIERS = [
  { key: "basic", label: "Basic", price: 5, color: "text-muted-foreground" },
  { key: "plus", label: "Plus", price: 15, color: "text-primary" },
  { key: "premium", label: "Premium", price: 30, color: "text-accent" },
];

export default function SubscriptionsModule() {
  const { walletAddress } = useIdentity();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    subscriptionsAPI.list(walletAddress)
      .then((r) => setSubs(r.subscriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (loading) return <Spinner />;

  const active = subs.filter((s) => s.status === "active");
  const monthlyRevenue = active.reduce((sum, s) => {
    const tier = TIERS.find((t) => t.key === s.tier);
    return sum + (tier?.price || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Active Subs</p>
          </div>
          <p className="text-2xl font-display font-bold">{active.length}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground">Monthly Rev</p>
          </div>
          <p className="text-2xl font-display font-bold">${monthlyRevenue}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total Subs</p>
          </div>
          <p className="text-2xl font-display font-bold">{subs.length}</p>
        </Card>
      </div>
      <Card>
        <h3 className="font-display font-bold text-lg mb-4">Subscription Tiers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIERS.map((t) => {
            const count = active.filter((s) => s.tier === t.key).length;
            return (
              <div key={t.key} className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className={`font-display font-bold ${t.color}`}>{t.label}</p>
                <p className="text-2xl font-display font-bold mt-1">${t.price}<span className="text-xs text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mt-2">{count} subscriber{count !== 1 ? "s" : ""}</p>
              </div>
            );
          })}
        </div>
      </Card>
      {subs.length > 0 && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Subscribers</h3>
          <div className="space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs truncate">{s.subscriber_wallet}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {s.status}
                  </span>
                </div>
                <span className="text-sm text-primary capitalize">{s.tier}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}