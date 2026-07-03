import React, { useEffect, useMemo, useState } from "react";
import { Zap, TrendingUp, Radio, Flame, Loader2, Crown, Store as StoreIcon, Link2, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useViewerWallet, Page, Card, Spinner, streamsAPI, boostsAPI } from "@/components/creator/os";
import EarningsTrendChart from "@/components/creator/vault/EarningsTrendChart";
import MonthlyEarningsBreakdown from "@/components/creator/vault/MonthlyEarningsBreakdown";
import StreakTrendChart from "@/components/creator/vault/StreakTrendChart";
import GlanceSummary from "@/components/creator/pages/GlanceSummary";

const DAYS = 30;

// Revenue sources — each maps a set of Transaction types to a single bucket.
// streams → $STREAMING (◎); store & affiliate → USD ($).
const SOURCES = {
  streams: {
    key: "streams", label: "Streams", icon: Radio, types: ["stream_tip", "audio_boost", "subscription", "podcast"],
    unit: "◎", color: "text-accent", bg: "bg-accent/10", ring: "border-accent/30",
  },
  store: {
    key: "store", label: "Store Sales", icon: StoreIcon, types: ["store_sale", "video_unlock"],
    unit: "$", color: "text-chart-4", bg: "bg-chart-4/10", ring: "border-chart-4/30",
  },
  affiliate: {
    key: "affiliate", label: "Affiliate", icon: Link2, types: ["affiliate"],
    unit: "$", color: "text-chart-3", bg: "bg-chart-3/10", ring: "border-chart-3/30",
  },
};

const FILTERS = [
  { key: "all", label: "All Sources" },
  { key: "streams", label: "Streams" },
  { key: "store", label: "Store" },
  { key: "affiliate", label: "Affiliate" },
];

const buildDailySeries = (events) => {
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
  return Array.from(buckets.entries()).map(([day, total]) => ({ day: day.slice(5), full: day, tokens: total }));
};

const pctChange = (series) => {
  const half = Math.floor(series.length / 2);
  const first = series.slice(0, half).reduce((s, p) => s + p.tokens, 0);
  const second = series.slice(half).reduce((s, p) => s + p.tokens, 0);
  if (first === 0) return second > 0 ? 100 : 0;
  return Math.round(((second - first) / first) * 100);
};

export default function CreatorVault() {
  const wallet = useViewerWallet();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      streamsAPI.past(wallet).catch(() => ({ streams: [] })),
      boostsAPI.list(wallet).catch(() => ({ boosts: [] })),
      base44.entities.Transaction.filter({ recipient_wallet: wallet }, "-created_date", 500).catch(() => []),
      base44.entities.Product.filter({ creator_wallet: wallet }, "-created_date", 200).catch(() => []),
      base44.entities.AffiliateLink.filter({ creator_wallet: wallet }, "-created_date", 200).catch(() => []),
    ]).then(([sRes, bRes, tRes, pRes, lRes]) => {
      if (!active) return;
      setStreams(sRes?.streams || []);
      setBoosts(bRes?.boosts || []);
      setTxns(Array.isArray(tRes) ? tRes : []);
      setProducts(Array.isArray(pRes) ? pRes : []);
      setLinks(Array.isArray(lRes) ? lRes : []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  // Incoming earnings transactions belonging to this wallet.
  const incoming = useMemo(() => txns.filter((t) => t.recipient_wallet === wallet), [txns, wallet]);

  // Per-source totals. Streams measured in $STREAMING; store/affiliate in USD.
  const sourceTotals = useMemo(() => {
    const out = { streams: { value: 0, count: 0 }, store: { value: 0, count: 0 }, affiliate: { value: 0, count: 0 } };
    for (const t of incoming) {
      for (const s of Object.values(SOURCES)) {
        if (s.types.includes(t.type)) {
          const amt = s.unit === "◎" ? (Number(t.streaming_amount) || 0) : (Number(t.amount) || 0);
          out[s.key].value += amt;
          out[s.key].count += 1;
        }
      }
    }
    return out;
  }, [incoming]);

  // Most profitable source by USD-normalized score (streams counted at their
  // USD amount field when present, else treated as 0 — keeps a single currency).
  const mostProfitable = useMemo(() => {
    const usdScore = { streams: 0, store: sourceTotals.store.value, affiliate: sourceTotals.affiliate.value };
    for (const t of incoming) {
      if (SOURCES.streams.types.includes(t.type)) usdScore.streams += Number(t.amount) || 0;
    }
    const entries = Object.entries(usdScore);
    entries.sort((a, b) => b[1] - a[1]);
    return { key: entries[0][0], score: entries[0][1] };
  }, [incoming, sourceTotals]);

  // Events that feed the chart, filtered by the active source.
  const chartEvents = useMemo(() => {
    if (filter === "all") {
      const streamEvents = streams.map((s) => ({ date: s.created_date, amount: s.tips_earned || 0 }));
      const boostEvents = boosts.map((b) => ({ date: b.created_date, amount: b.amount || 0 }));
      return [...streamEvents, ...boostEvents];
    }
    const s = SOURCES[filter];
    return incoming
      .filter((t) => s.types.includes(t.type))
      .map((t) => ({ date: t.created_date, amount: s.unit === "◎" ? (Number(t.streaming_amount) || 0) : (Number(t.amount) || 0) }));
  }, [filter, incoming, streams, boosts]);

  const chartUnit = filter === "all" || filter === "streams" ? "◎" : "$";

  const totalStreaming = useMemo(() => {
    const streamEvents = streams.map((s) => ({ amount: s.tips_earned || 0 }));
    const boostEvents = boosts.map((b) => ({ amount: b.amount || 0 }));
    return [...streamEvents, ...boostEvents].reduce((s, e) => s + e.amount, 0);
  }, [streams, boosts]);
  const monetizedRate = streams.length ? (streams.filter((s) => (s.tips_earned || 0) > 0).length / streams.length) * 100 : 0;
  const series = useMemo(() => buildDailySeries(chartEvents), [chartEvents]);
  const last30 = useMemo(() => series.reduce((s, p) => s + p.tokens, 0), [series]);
  const growth = pctChange(series);
  const bestDay = useMemo(() => series.reduce((m, p) => (p.tokens > m.tokens ? p : m), series[0] || { day: "—", tokens: 0 }), [series]);

  // Top items per source.
  const topItems = useMemo(() => {
    if (filter === "store") {
      const byId = new Map();
      for (const t of incoming.filter((t) => SOURCES.store.types.includes(t.type))) {
        const pid = t.product_id || "—";
        byId.set(pid, (byId.get(pid) || 0) + (Number(t.amount) || 0));
      }
      const nameFor = (id) => products.find((p) => p.id === id)?.name || (id === "—" ? "Direct sale" : `Product ${String(id).slice(0, 6)}`);
      return [...byId.entries()].map(([id, amt]) => ({ label: nameFor(id), value: amt })).sort((a, b) => b.value - a.value).slice(0, 5);
    }
    if (filter === "affiliate") {
      return [...links].map((l) => ({ label: l.title || "Untitled link", value: Number(l.commission_earned) || 0, clicks: Number(l.clicks) || 0 })).sort((a, b) => b.value - a.value).slice(0, 5);
    }
    // all + streams → top broadcasts
    return [...streams].sort((a, b) => (b.tips_earned || 0) - (a.tips_earned || 0)).slice(0, 5).map((s) => ({ label: s.title || "Untitled", value: s.tips_earned || 0 }));
  }, [filter, incoming, products, links, streams]);

  const fmtValue = (val, unit) => (unit === "$" ? `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `${Number(val).toLocaleString()} ◎`);

  if (!wallet) return <Page title="CreatorVault"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view your vault.</p></Card></Page>;
  if (loading) return <Page title="CreatorVault"><Spinner /></Page>;

  return (
    <Page title="CreatorVault" subtitle="Revenue breakdown across streams, store, and affiliate sources">
      <GlanceSummary
        wallet={wallet}
        earningsValue={`${totalStreaming.toLocaleString()} ◎`}
        earningsSub="Total $STREAMING earned"
        conversionRate={monetizedRate}
        conversionSub="Tipped broadcasts"
      />

      {/* Source filter + profitability comparison */}
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display font-semibold">Revenue by Source</h2>
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(SOURCES).map((s) => {
            const Icon = s.icon;
            const t = sourceTotals[s.key];
            const isTop = mostProfitable.key === s.key;
            return (
              <div key={s.key} className={`rounded-xl border ${s.ring} ${s.bg} p-4 relative`}>
                {isTop && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-chart-3/15 text-chart-3">
                    <Trophy className="w-3 h-3" /> Top
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.count} txn{t.count === 1 ? "" : "s"}</span>
                </div>
                <p className={`text-xl font-display font-bold ${s.color}`}>{fmtValue(t.value, s.unit)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Hero total */}
      <Card className="bg-gradient-card">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          <Zap className="w-3.5 h-3.5 text-accent" /> Total $STREAMING Earned
        </div>
        <p className="text-4xl font-display font-bold text-gradient-brand mt-2">{totalStreaming.toLocaleString()} ◎</p>
        <p className="text-xs text-muted-foreground mt-1">From {streams.length} broadcast{streams.length === 1 ? "" : "s"} + {boosts.length} boost{boosts.length === 1 ? "" : "s"}</p>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Radio className="w-3.5 h-3.5 text-primary" /> Broadcasts</div>
          <p className="text-2xl font-display font-bold mt-1">{streams.length}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-accent" /> Last 30 days</div>
          <p className="text-2xl font-display font-bold text-accent mt-1">{fmtValue(last30, chartUnit)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-chart-3" /> 30-day Growth</div>
          <p className={`text-2xl font-display font-bold mt-1 ${growth >= 0 ? "text-chart-3" : "text-destructive"}`}>
            {growth >= 0 ? "+" : ""}{growth}%
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Crown className="w-3.5 h-3.5 text-chart-3" /> Best Day</div>
          <p className="text-2xl font-display font-bold mt-1">{fmtValue(bestDay.tokens, chartUnit)}</p>
          <p className="text-[11px] text-muted-foreground">{bestDay.day}</p>
        </Card>
      </div>

      {/* Filtered 30-day earnings chart */}
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display font-semibold">
            {filter === "all" ? `Earnings Growth — Last ${DAYS} Days` : `${SOURCES[filter].label} Revenue — Last ${DAYS} Days`}
          </h2>
          <span className="text-xs text-muted-foreground">Showing: {FILTERS.find((f) => f.key === filter).label}</span>
        </div>
        <EarningsTrendChart series={series} days={DAYS} unit={chartUnit} />
      </Card>

      {/* Viewer streak engagement — daily active viewers + avg streak length */}
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display font-semibold">Viewer Streak Engagement</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Daily active viewers and average streak length — spot your best days to go live</p>
          </div>
        </div>
        <StreakTrendChart wallet={wallet} />
      </Card>

      {/* Monthly breakdown — streams / store / affiliate by month */}
      <MonthlyEarningsBreakdown wallet={wallet} />

      {/* Top items for the active source */}
      <Card>
        <h2 className="font-display font-semibold mb-3">
          {filter === "store" ? "Top Products by Revenue" : filter === "affiliate" ? "Top Affiliate Links by Commission" : "Top Broadcasts by $STREAMING"}
        </h2>
        {topItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filter === "store" ? "No store sales yet." : filter === "affiliate" ? "No affiliate links yet." : "No broadcasts yet. Go live to start earning."}
          </p>
        ) : (
          <div className="space-y-1">
            {topItems.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm truncate">{it.label}</span>
                  {it.clicks != null && <span className="text-[11px] text-muted-foreground shrink-0">{it.clicks} clicks</span>}
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${filter === "store" || filter === "affiliate" ? "text-chart-3" : "text-accent"}`}>
                  {filter === "store" || filter === "affiliate" ? fmtValue(it.value, "$") : fmtValue(it.value, "◎")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}