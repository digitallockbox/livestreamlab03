import React, { useEffect, useMemo, useState } from "react";
import { Zap, TrendingUp, Radio, Flame, Loader2, Crown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useViewerWallet, Page, Card, Spinner, streamsAPI, boostsAPI } from "@/components/creator/os";

const DAYS = 30;

// Build a 30-day daily earnings series from dated earning events.
// Each event: { date (ISO), amount }. Buckets by UTC day key YYYY-MM-DD.
const buildDailySeries = (events) => {
  const today = new Date();
  const buckets = new Map();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const ev of events) {
    if (!ev?.date) continue;
    const key = new Date(ev.date).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + (ev.amount || 0));
  }
  return Array.from(buckets.entries()).map(([day, total]) => ({
    day: day.slice(5), // MM-DD for axis
    full: day,
    tokens: total,
  }));
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

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      streamsAPI.past(wallet).catch(() => ({ streams: [] })),
      boostsAPI.list(wallet).catch(() => ({ boosts: [] })),
    ]).then(([sRes, bRes]) => {
      if (!active) return;
      setStreams(sRes?.streams || []);
      setBoosts(bRes?.boosts || []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  // Earning events: stream tips + boosts (both in $STREAMING), keyed by created_date.
  const events = useMemo(() => {
    const streamEvents = streams.map((s) => ({ date: s.created_date, amount: s.tips_earned || 0, title: s.title }));
    const boostEvents = boosts.map((b) => ({ date: b.created_date, amount: b.amount || 0, title: "Boost" }));
    return [...streamEvents, ...boostEvents];
  }, [streams, boosts]);

  const totalStreaming = useMemo(() => events.reduce((s, e) => s + e.amount, 0), [events]);
  const series = useMemo(() => buildDailySeries(events), [events]);
  const last30 = useMemo(() => series.reduce((s, p) => s + p.tokens, 0), [series]);
  const growth = pctChange(series);
  const bestDay = useMemo(() => series.reduce((m, p) => (p.tokens > m.tokens ? p : m), series[0] || { day: "—", tokens: 0 }), [series]);
  const topBroadcasts = useMemo(
    () => [...streams].sort((a, b) => (b.tips_earned || 0) - (a.tips_earned || 0)).slice(0, 5),
    [streams]
  );

  if (!wallet) return <Page title="CreatorVault"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view your vault.</p></Card></Page>;
  if (loading) return <Page title="CreatorVault"><Spinner /></Page>;

  return (
    <Page title="CreatorVault" subtitle="Total $STREAMING earned across all broadcasts">
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
          <p className="text-2xl font-display font-bold text-accent mt-1">{last30.toLocaleString()} ◎</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-chart-3" /> 30-day Growth</div>
          <p className={`text-2xl font-display font-bold mt-1 ${growth >= 0 ? "text-chart-3" : "text-destructive"}`}>
            {growth >= 0 ? "+" : ""}{growth}%
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Crown className="w-3.5 h-3.5 text-chart-3" /> Best Day</div>
          <p className="text-2xl font-display font-bold mt-1">{bestDay.tokens.toLocaleString()} ◎</p>
          <p className="text-[11px] text-muted-foreground">{bestDay.day}</p>
        </Card>
      </div>

      {/* 30-day earnings growth chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Earnings Growth — Last {DAYS} Days</h2>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Flame className="w-3 h-3 text-chart-3" /> Daily $STREAMING</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="g_vault" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" vertical={false} />
            <XAxis dataKey="day" stroke="#4B5563" tick={{ fontSize: 11 }} interval={Math.floor(DAYS / 6)} />
            <YAxis stroke="#4B5563" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(v) => [`${Number(v).toLocaleString()} ◎`, "Earned"]}
            />
            <Area type="monotone" dataKey="tokens" stroke="#34D399" strokeWidth={2} fill="url(#g_vault)" name="Earned" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Top broadcasts */}
      <Card>
        <h2 className="font-display font-semibold mb-3">Top Broadcasts by $STREAMING</h2>
        {topBroadcasts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No broadcasts yet. Go live to start earning.</p>
        ) : (
          <div className="space-y-1">
            {topBroadcasts.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm truncate">{s.title || "Untitled"}</span>
                </div>
                <span className="text-accent text-sm font-medium whitespace-nowrap">{(s.tips_earned || 0).toLocaleString()} ◎</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}