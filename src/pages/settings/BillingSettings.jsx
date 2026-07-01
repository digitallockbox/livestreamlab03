import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Wallet, Crown, ArrowUpRight, ArrowDownLeft, Loader2, Plus } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { useIdentity } from "@/lib/web3/identity";
import { base44 } from "@/api/base44Client";

const typeLabel = (t) => ({
  stream_tip: "Stream Tip",
  store_sale: "Store Sale",
  affiliate: "Affiliate",
  video_unlock: "Video Unlock",
  audio_boost: "Audio Boost",
  podcast: "Podcast",
  payout: "Payout",
  subscription: "Subscription",
  transfer: "Transfer",
  topup: "Top-Up",
}[t] || t);

// BillingSettings — plan, $STREAMING balance, payment method, and recent
// on-platform transactions. Consistent with the dark theme tokens.
export default function BillingSettings() {
  const { wallet, balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const { session } = useIdentity();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [inbound, outbound] = await Promise.all([
          base44.entities.Transaction.filter({ recipient_wallet: wallet }, "-created_date", 20).catch(() => []),
          base44.entities.Transaction.filter({ sender_wallet: wallet }, "-created_date", 20).catch(() => []),
        ]);
        if (!active) return;
        const merged = [...(inbound || []), ...(outbound || [])]
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 10);
        setTxs(merged);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [wallet]);

  const plan = session?.badge_tier || "bronze";

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">Plan, $STREAMING balance, and on-platform payment activity.</p>
      </div>

      {/* Plan + balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Crown className="w-3.5 h-3.5 text-chart-3" /> Current Plan
          </div>
          <p className="text-2xl font-display font-bold capitalize mt-2 text-gradient-brand">{plan}</p>
          <p className="text-xs text-muted-foreground mt-1">Creator badge tier · upgraded via Badges</p>
          <Link to="/badge" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3">
            Upgrade tier <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Wallet className="w-3.5 h-3.5 text-accent" /> $STREAMING Balance
          </div>
          <button onClick={refreshBalance} className="text-2xl font-display font-bold text-accent mt-2">
            {loadingBalance ? "…" : Number(balance).toLocaleString()} <span className="text-xs text-muted-foreground">◎ ↻</span>
          </button>
          <Link to="/topup" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3">
            <Plus className="w-3.5 h-3.5" /> Top Up Balance
          </Link>
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-3">
          <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="font-mono text-xs text-muted-foreground break-all mt-0.5">{wallet || "—"}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent shrink-0">Active</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link to="/payouts" className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors text-center">
          <p className="text-sm font-medium">Payouts</p>
          <p className="text-xs text-muted-foreground mt-0.5">Withdraw earnings</p>
        </Link>
        <Link to="/store/orders" className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors text-center">
          <p className="text-sm font-medium">Orders</p>
          <p className="text-xs text-muted-foreground mt-0.5">Store purchase history</p>
        </Link>
        <Link to="/vault" className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors text-center">
          <p className="text-sm font-medium">Vault</p>
          <p className="text-xs text-muted-foreground mt-0.5">Earnings dashboard</p>
        </Link>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display font-semibold mb-3">Recent Activity</h2>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {txs.map((t) => {
              const incoming = t.recipient_wallet === wallet;
              return (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {incoming ? <ArrowDownLeft className="w-4 h-4 text-accent shrink-0" /> : <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm truncate">{typeLabel(t.type)}</p>
                      <p className="text-xs text-muted-foreground">{t.created_date ? new Date(t.created_date).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap ${incoming ? "text-accent" : "text-foreground"}`}>
                    {incoming ? "+" : "−"}{Number(t.amount || 0).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}