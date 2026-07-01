import React, { useEffect, useMemo, useState } from "react";
import { Store as StoreIcon, Radio, Link2, Loader2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";

const SINCE = Date.now() - 30 * 86400000;

// EarningsSummary — aggregates the creator's earnings from store, streaming,
// and affiliate sources over the last 30 days, sourced from timestamped
// Transaction records where this wallet is the recipient.
const BUCKETS = {
  store: { label: "Store", icon: StoreIcon, types: ["store_sale", "video_unlock"], color: "text-chart-4", bg: "bg-chart-4/10", ring: "border-chart-4/20" },
  streaming: { label: "Streaming", icon: Radio, types: ["stream_tip", "audio_boost", "subscription", "podcast"], color: "text-accent", bg: "bg-accent/10", ring: "border-accent/20" },
  affiliate: { label: "Affiliate", icon: Link2, types: ["affiliate"], color: "text-chart-3", bg: "bg-chart-3/10", ring: "border-chart-3/20" },
};

export default function EarningsSummary() {
  const { walletAddress } = useIdentity();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.Transaction.filter({}, "-created_date", 500)
      .then((txs) => {
        if (!active) return;
        const out = (txs || []).filter((t) => {
          if (!t.created_date) return false;
          return new Date(t.created_date).getTime() >= SINCE && t.recipient_wallet === walletAddress;
        });
        setRows(out);
      })
      .catch(() => { if (active) setRows([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const summary = useMemo(() => {
    const totals = { store: { usd: 0, streaming: 0, count: 0 }, streaming: { usd: 0, streaming: 0, count: 0 }, affiliate: { usd: 0, streaming: 0, count: 0 } };
    for (const t of rows) {
      const key = Object.keys(BUCKETS).find((k) => BUCKETS[k].types.includes(t.type));
      if (!key) continue;
      totals[key].usd += Number(t.amount) || 0;
      totals[key].streaming += Number(t.streaming_amount) || 0;
      totals[key].count += 1;
    }
    const grand = { usd: totals.store.usd + totals.streaming.usd + totals.affiliate.usd, streaming: totals.store.streaming + totals.streaming.streaming + totals.affiliate.streaming, count: totals.store.count + totals.streaming.count + totals.affiliate.count };
    return { totals, grand };
  }, [rows]);

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Last 30 Days</h2>
          <p className="text-xs text-muted-foreground">Aggregated earnings across your store, streams, and affiliate links.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total earnings</p>
          <p className="text-2xl font-display font-bold text-gradient-brand">${summary.grand.usd.toFixed(2)}</p>
          <p className="text-xs text-accent font-medium">{summary.grand.streaming.toFixed(2)} ◎ $STREAMING</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(BUCKETS).map(([key, b]) => {
          const Icon = b.icon;
          const t = summary.totals[key];
          return (
            <div key={key} className={`rounded-xl border ${b.ring} ${b.bg} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${b.color}`} />
                <span className="text-sm font-medium text-foreground">{b.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.count} txn{t.count === 1 ? "" : "s"}</span>
              </div>
              <p className="text-xl font-display font-bold">${t.usd.toFixed(2)}</p>
              <p className="text-xs text-accent mt-0.5">{t.streaming.toFixed(2)} ◎ $STREAMING</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}