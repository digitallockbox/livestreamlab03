/**
 * TokenAnalyticsDashboard — $STREAMING token metrics layer for creators.
 *
 * Displays: token identity, current balance, lifetime + windowed earn/spend
 * stats, last payout timestamp, and recent ledger entries.
 *
 * Data comes from the useTokenAnalytics hook, which calls the backend
 * /api/token/analytics endpoint (fail-open to local computation).
 */
import React from "react";
import {
  Coins, TrendingUp, TrendingDown, Clock, Hash,
  ArrowDownLeft, RefreshCw,
} from "lucide-react";
import { useTokenAnalytics } from "@/hooks/web3/useTokenAnalytics";
import { useViewerWallet, Page, Card, Spinner } from "@/components/creator/os";

const fmtAmount = (v) => `${Number(v || 0).toLocaleString()} \u25CE`;
const fmtDate = (iso) => {
  if (!iso) return "\u2014";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};
const shortId = (id) => (id ? `${id.slice(0, 8)}\u2026${id.slice(-6)}` : "\u2014");

export default function TokenAnalyticsDashboard() {
  const { tokenIdentity, analytics30d, analytics7d, ledger, loading, error, refresh } =
    useTokenAnalytics();
  const wallet = useViewerWallet();

  if (!wallet)
    return (
      <Page title="Token Analytics">
        <Card>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view token analytics.
          </p>
        </Card>
      </Page>
    );

  if (loading && !analytics30d)
    return (
      <Page title="Token Analytics">
        <Spinner />
      </Page>
    );

  const a30 = analytics30d || {};
  const a7 = analytics7d || {};

  const statCards = [
    { label: "Lifetime Earned", value: fmtAmount(a30.total_earned), icon: TrendingUp, color: "text-accent" },
    { label: "Lifetime Spent", value: fmtAmount(a30.total_spent), icon: TrendingDown, color: "text-destructive" },
    { label: "30-Day Earned", value: fmtAmount(a30.window_earned), icon: ArrowDownLeft, color: "text-chart-3" },
    { label: "7-Day Earned", value: fmtAmount(a7.window_earned), icon: ArrowDownLeft, color: "text-chart-4" },
  ];

  return (
    <Page
      title="Token Analytics"
      subtitle="$STREAMING token balances, flows, and earnings per creator"
    >
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          {error} — showing fallback data
        </div>
      )}

      {/* Token identity */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {tokenIdentity?.token_name || "Streaming Token"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {shortId(tokenIdentity?.token_id)}
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </Card>

      {/* Balance hero */}
      <Card className="bg-gradient-card">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          <Hash className="w-3.5 h-3.5 text-accent" /> Current Balance
        </div>
        <p className="text-4xl font-display font-bold text-gradient-brand mt-2">
          {fmtAmount(a30.balance)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {tokenIdentity?.token_symbol || "$STREAMING"}
        </p>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} /> {s.label}
              </div>
              <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>
                {s.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Last payout */}
      <Card>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Last Payout</p>
            <p className="text-xs text-muted-foreground">
              {fmtDate(a30.lastpayoutat)}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent ledger entries */}
      {ledger.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold mb-3">Recent Token Events</h2>
          <div className="space-y-1">
            {ledger
              .slice(-10)
              .reverse()
              .map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.type === "earn"
                          ? "bg-accent/15 text-accent"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {entry.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.source}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      entry.type === "earn" ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {entry.type === "earn" ? "+" : "\u2212"}
                    {fmtAmount(entry.amount)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </Page>
  );
}