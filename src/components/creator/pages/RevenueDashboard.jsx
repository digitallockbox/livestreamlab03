import React, { useEffect, useMemo, useState } from "react";
import { Radio, Store as StoreIcon, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useViewerWallet, Page, Card, Spinner, streamsAPI, boostsAPI } from "@/components/creator/os";
import RevenueTrendChart from "@/components/creator/vault/RevenueTrendChart";
import EarningsBreakdown from "@/components/creator/payouts/EarningsBreakdown";

const DAYS = 30;

// Build a 30-day daily series from a list of { date, amount } events.
function buildDailySeries(events) {
  const today = new Date();
  const buckets = new Map();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const ev of events) {
    if (!ev?.date) continue;
    const key = new Date(ev.date).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + (ev.amount || 0));
  }
  return Array.from(buckets.entries()).map(([day, total]) => ({ day: day.slice(5), full: day, value: total }));
}

// Merge streaming + store series into a single dataset for the combined chart.
function buildCombinedData(streamSeries, storeSeries) {
  return streamSeries.map((s, i) => ({
    day: s.day,
    streaming: s.value,
    store: storeSeries[i]?.value || 0,
  }));
}

function pctChange(series) {
  const half = Math.floor(series.length / 2);
  const first = series.slice(0, half).reduce((s, p) => s + p.value, 0);
  const second = series.slice(half).reduce((s, p) => s + p.value, 0);
  if (first === 0) return second > 0 ? 100 : 0;
  return Math.round(((second - first) / first) * 100);
}

export default function RevenueDashboard() {
  const wallet = useViewerWallet();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      streamsAPI.past(wallet).catch(() => ({ streams: [] })),
      boostsAPI.list(wallet).catch(() => ({ boosts: [] })),
      base44.entities.Transaction.filter({ recipient_wallet: wallet }, "-created_date", 500).catch(() => []),
    ]).then(([sRes, bRes, tRes]) => {
      if (!active) return;
      setStreams(sRes?.streams || []);
      setBoosts(bRes?.boosts || []);
      setTxns(Array.isArray(tRes) ? tRes : []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  // Streaming events: stream tips + boost amounts
  const streamEvents = useMemo(() => [
    ...streams.map((s) => ({ date: s.created_date, amount: s.tips_earned || 0 })),
    ...boosts.map((b) => ({ date: b.created_date, amount: b.amount || 0 })),
  ], [streams, boosts]);

  // Store events: store_sale + video_unlock transactions (USD)
  const storeEvents = useMemo(() =>
    txns
      .filter((t) => t.type === "store_sale" || t.type === "video_unlock")
      .map((t) => ({ date: t.created_date, amount: Number(t.amount) || 0 })),
    [txns]);

  const streamSeries = useMemo(() => buildDailySeries(streamEvents), [streamEvents]);
  const storeSeries = useMemo(() => buildDailySeries(storeEvents), [storeEvents]);
  const combined = useMemo(() => buildCombinedData(streamSeries, storeSeries), [streamSeries, storeSeries]);

  const streamTotal = useMemo(() => streamSeries.reduce((s, d) => s + d.value, 0), [streamSeries]);
  const storeTotal = useMemo(() => storeSeries.reduce((s, d) => s + d.value, 0), [storeSeries]);
  const streamGrowth = pctChange(streamSeries);
  const storeGrowth = pctChange(storeSeries);

  // Best combined day
  const bestDay = useMemo(() => combined.reduce((m, d) => (d.streaming + d.store > (m?.streaming || 0) + (m?.store || 0) ? d : m), combined[0] || { day: "—" }), [combined]);

  if (!wallet) return <Page title="Revenue Trends"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view revenue trends.</p></Card></Page>;
  if (loading) return <Page title="Revenue Trends" subtitle="Streaming & store revenue — last 30 days"><Spinner /></Page>;

  return (
    <Page title="Revenue Trends" subtitle="Streaming & store revenue — last 30 days">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Radio className="w-3.5 h-3.5 text-accent" /> Streaming (30d)</div>
          <p className="text-2xl font-display font-bold text-accent mt-1">{streamTotal.toLocaleString()} ◎</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><StoreIcon className="w-3.5 h-3.5 text-chart-4" /> Store (30d)</div>
          <p className="text-2xl font-display font-bold text-chart-4 mt-1">${storeTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-chart-3" /> Streaming Growth</div>
          <p className={`text-2xl font-display font-bold mt-1 ${streamGrowth >= 0 ? "text-chart-3" : "text-destructive"}`}>{streamGrowth >= 0 ? "+" : ""}{streamGrowth}%</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-chart-3" /> Store Growth</div>
          <p className={`text-2xl font-display font-bold mt-1 ${storeGrowth >= 0 ? "text-chart-3" : "text-destructive"}`}>{storeGrowth >= 0 ? "+" : ""}{storeGrowth}%</p>
        </Card>
      </div>

      {/* Combined trend — both sources on one chart */}
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display font-semibold">Combined Revenue Trend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Streaming ($STREAMING) and store ($) side by side over the last {DAYS} days</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Streaming</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-chart-4" /> Store</span>
          </div>
        </div>
        <RevenueTrendChart data={combined} dataKey="streaming" color="--accent" unit="◎" height={280} />
        <div className="mt-4">
          <RevenueTrendChart data={combined} dataKey="store" color="--chart-4" unit="$" height={180} />
        </div>
      </Card>

      {/* Side-by-side individual charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-accent" />
            <div>
              <h2 className="font-display font-semibold">Streaming Revenue</h2>
              <p className="text-xs text-muted-foreground">Daily $STREAMING from tips & boosts</p>
            </div>
          </div>
          <RevenueTrendChart data={streamSeries.map((d) => ({ ...d, streaming: d.value }))} dataKey="streaming" color="--accent" unit="◎" />
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <StoreIcon className="w-4 h-4 text-chart-4" />
            <div>
              <h2 className="font-display font-semibold">Store Revenue</h2>
              <p className="text-xs text-muted-foreground">Daily USD from product sales & video unlocks</p>
            </div>
          </div>
          <RevenueTrendChart data={storeSeries.map((d) => ({ ...d, store: d.value }))} dataKey="store" color="--chart-4" unit="$" />
        </Card>
      </div>

      {/* Best day highlight */}
      <Card className="bg-gradient-card">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          <Calendar className="w-3.5 h-3.5" /> Best Revenue Day
        </div>
        <div className="flex items-baseline gap-4 mt-2 flex-wrap">
          <p className="text-3xl font-display font-bold text-gradient-brand">{bestDay.day}</p>
          <p className="text-sm text-accent">{(bestDay.streaming || 0).toLocaleString()} ◎ streaming</p>
          <p className="text-sm text-chart-4">${(bestDay.store || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} store</p>
        </div>
      </Card>

      {/* Earnings Attribution — per source, stream, viewer, product */}
      <EarningsBreakdown />
    </Page>
  );
}