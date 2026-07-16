import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2, TrendingUp, Radio, ShoppingBag, Zap, CreditCard, Video, Eye,
  Clock, Package,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Card } from "@/components/creator/os";
import { aggregateEarnings } from "@/lib/earningsEngine";

const TYPE_META = {
  stream_tip: { label: "Stream Tips", icon: Radio, color: "text-accent" },
  store_sale: { label: "Store Sales", icon: ShoppingBag, color: "text-chart-4" },
  subscription: { label: "Subscriptions", icon: CreditCard, color: "text-primary" },
  video_unlock: { label: "Video Unlocks", icon: Video, color: "text-chart-3" },
  audio_boost: { label: "Boosts (50%)", icon: Zap, color: "text-chart-5" },
  affiliate: { label: "Affiliate", icon: TrendingUp, color: "text-chart-2" },
  podcast: { label: "Podcast", icon: Package, color: "text-chart-3" },
  watch_time: { label: "Watch Time", icon: Clock, color: "text-chart-4" },
};

const usd = (n) => `$${Number(n || 0).toFixed(2)}`;

// EarningsBreakdown — per-source earnings attribution dashboard.
// Fetches Transactions + WatchSessions for the current period and breaks
// earnings down by type, stream, viewer, and product.
export default function EarningsBreakdown() {
  const { wallet } = useStreamingIdentity();
  const [transactions, setTransactions] = useState([]);
  const [watchSessions, setWatchSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    Promise.all([
      base44.entities.Transaction.filter({ recipient_wallet: wallet, status: "completed" }, "-created_date", 500)
        .then((data) => (data || []).filter((t) => {
          const d = new Date(t.created_date);
          return d >= periodStart && d <= periodEnd;
        }))
        .catch(() => []),
      base44.entities.WatchSession.filter({ creator_wallet: wallet, status: "ended" }, "-created_date", 500)
        .then((data) => (data || []).filter((ws) => {
          const d = new Date(ws.created_date);
          return d >= periodStart && d <= periodEnd;
        }))
        .catch(() => []),
    ]).then(([txs, sessions]) => {
      if (!active) return;
      setTransactions(txs);
      setWatchSessions(sessions);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  const earnings = useMemo(() => aggregateEarnings(transactions, watchSessions), [transactions, watchSessions]);

  const topStreams = useMemo(() =>
    Object.entries(earnings.byStream).sort((a, b) => b[1] - a[1]).slice(0, 5), [earnings]);

  const topViewers = useMemo(() =>
    Object.entries(earnings.byViewer).sort((a, b) => b[1] - a[1]).slice(0, 5), [earnings]);

  const topProducts = useMemo(() =>
    Object.entries(earnings.byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5), [earnings]);

  if (loading) return <Card><div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Card>;
  if (!wallet) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card">
        <p className="text-xs text-muted-foreground">Earnings Attribution — Current Period</p>
        <p className="text-3xl font-display font-bold text-gradient-brand mt-1">{usd(earnings.total)}</p>
        <p className="text-xs text-muted-foreground mt-1">{transactions.length} transactions · {watchSessions.length} watch sessions</p>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-3">Earnings by Source</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(earnings.byType).map(([type, amount]) => {
            const meta = TYPE_META[type] || { label: type, icon: TrendingUp, color: "text-muted-foreground" };
            const Icon = meta.icon;
            return (
              <div key={type} className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Icon className={`w-3 h-3 ${meta.color}`} /> {meta.label}</p>
                <p className="font-display font-bold text-lg">{usd(amount)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Radio className="w-4 h-4 text-accent" /> Top Streams</h3>
          {topStreams.length === 0 ? <p className="text-sm text-muted-foreground">No stream earnings yet.</p> : (
            <div className="space-y-2">
              {topStreams.map(([id, amount]) => (
                <div key={id} className="flex justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground truncate">{id.slice(0, 12)}…</span>
                  <span className="font-semibold text-accent">{usd(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Top Viewers</h3>
          {topViewers.length === 0 ? <p className="text-sm text-muted-foreground">No viewer earnings yet.</p> : (
            <div className="space-y-2">
              {topViewers.map(([addr, amount]) => (
                <div key={addr} className="flex justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground truncate">{addr.slice(0, 10)}…</span>
                  <span className="font-semibold">{usd(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-chart-4" /> Top Products</h3>
          {topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No product earnings yet.</p> : (
            <div className="space-y-2">
              {topProducts.map(([id, amount]) => (
                <div key={id} className="flex justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground truncate">{id.slice(0, 12)}…</span>
                  <span className="font-semibold text-chart-4">{usd(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}