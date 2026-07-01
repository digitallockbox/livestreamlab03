import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Headphones, DollarSign, Mic2, TrendingUp, Loader2, BarChart3, ArrowLeft } from "lucide-react";
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";

const DAYS = 30;
const usd = (n) => `$${Number(n || 0).toFixed(2)}`;

// PodcastAnalytics — total listens and revenue per episode, with a 30-day
// trend. Dark theme + recharts tokens, matching the other dashboards.
export default function PodcastAnalytics() {
  const { walletAddress } = useIdentity();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.PodcastEpisode.filter({ creator_wallet: walletAddress }, "-created_date", 500)
      .then((d) => { if (active) setEpisodes(d || []); })
      .catch(() => { if (active) setEpisodes([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const cutoff = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - DAYS); return d; }, []);

  const last30 = useMemo(() => episodes.filter((e) => new Date(e.created_date) >= cutoff), [episodes, cutoff]);

  const totalListens = useMemo(() => episodes.reduce((s, e) => s + (e.listens || 0), 0), [episodes]);
  const totalRevenue = useMemo(() => episodes.reduce((s, e) => s + (e.revenue || 0), 0), [episodes]);
  const recentListens = useMemo(() => last30.reduce((s, e) => s + (e.listens || 0), 0), [last30]);
  const recentRevenue = useMemo(() => last30.reduce((s, e) => s + (e.revenue || 0), 0), [last30]);
  const avgListens = episodes.length ? Math.round(totalListens / episodes.length) : 0;

  // Daily trend attributed by episode created_date within the 30-day window.
  const daily = useMemo(() => {
    const buckets = new Map();
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); buckets.set(d.toISOString().slice(0, 10), { listens: 0, revenue: 0 }); }
    for (const e of last30) {
      const key = new Date(e.created_date).toISOString().slice(0, 10);
      if (buckets.has(key)) { const b = buckets.get(key); b.listens += (e.listens || 0); b.revenue += (e.revenue || 0); }
    }
    return Array.from(buckets.entries()).map(([day, v]) => ({ day: day.slice(5), ...v }));
  }, [last30]);

  // Per-episode breakdown sorted by listens.
  const perEpisode = useMemo(
    () => [...episodes].map((e) => ({ name: (e.title || "Untitled").slice(0, 20), listens: e.listens || 0, revenue: e.revenue || 0 })).sort((a, b) => b.listens - a.listens),
    [episodes]
  );

  const kpis = [
    { label: "Total Listens", value: totalListens.toLocaleString(), icon: Headphones, color: "text-chart-4", bg: "bg-chart-4/10" },
    { label: "Total Revenue", value: usd(totalRevenue), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
    { label: "Listens (30d)", value: recentListens.toLocaleString(), icon: TrendingUp, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Revenue (30d)", value: usd(recentRevenue), icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Episodes (30d)", value: last30.length, icon: Mic2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Listens / Ep", value: avgListens.toLocaleString(), icon: BarChart3, color: "text-chart-2", bg: "bg-chart-2/10" },
  ];

  if (!walletAddress) return <div className="p-6 max-w-3xl mx-auto"><p className="text-sm text-muted-foreground">Connect your wallet to view analytics.</p></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">Podcast Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Total listens and revenue per episode — last {DAYS} days.</p>
        </div>
        <Link to="/podcasts/manage" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm hover:bg-muted">
          <ArrowLeft className="w-4 h-4" /> Back to Manager
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : episodes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No episodes yet to analyze.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}><Icon className={`w-4 h-4 ${color}`} /></div>
                <p className="text-xl font-display font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* 30-day trend: listens bars + revenue line */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-4">Listens &amp; Revenue — Last {DAYS} Days</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={daily} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g_plistens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval={Math.floor(DAYS / 6)} />
                <YAxis yAxisId="l" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" stroke="hsl(var(--accent))" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                <Bar yAxisId="l" dataKey="listens" fill="url(#g_plistens)" name="Listens" radius={[3, 3, 0, 0]} maxBarSize={22} />
                <Line yAxisId="r" type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} name="Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Per-episode listens */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-4">Listens per Episode</h2>
            <ResponsiveContainer width="100%" height={Math.max(200, perEpisode.length * 34)}>
              <BarChart layout="vertical" data={perEpisode} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g_pelistens" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                <Bar dataKey="listens" fill="url(#g_pelistens)" name="Listens" radius={[0, 3, 3, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-episode revenue */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-4">Revenue per Episode</h2>
            <ResponsiveContainer width="100%" height={Math.max(200, perEpisode.length * 34)}>
              <BarChart layout="vertical" data={perEpisode} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g_perev" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} itemStyle={{ color: "hsl(var(--foreground))" }} formatter={(v) => usd(v)} />
                <Bar dataKey="revenue" fill="url(#g_perev)" name="Revenue" radius={[0, 3, 3, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}