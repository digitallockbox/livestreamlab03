import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Flame, Users, Loader2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DAYS = 30;

// StreakTrendChart — 30-day viewer engagement trend for the CreatorVault.
// Cross-references WatchSession (creator-specific) with ViewerStreak (global
// per-viewer) to show: how many unique viewers were active each day, and the
// average streak length among those viewers. Helps the creator spot which
// weekdays pull the most engaged audiences.
export default function StreakTrendChart({ wallet }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [streaks, setStreaks] = useState([]);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      base44.entities.WatchSession.filter({ creator_wallet: wallet }, "-created_date", 500).catch(() => []),
      base44.entities.ViewerStreak.list("-created_date", 500).catch(() => []),
    ]).then(([sRes, stRes]) => {
      if (!active) return;
      setSessions(Array.isArray(sRes) ? sRes : []);
      setStreaks(Array.isArray(stRes) ? stRes : []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  // Map of viewer_wallet → streak record (for avg streak lookup).
  const streakByWallet = useMemo(() => {
    const m = new Map();
    for (const s of streaks) m.set(s.viewer_wallet, s);
    return m;
  }, [streaks]);

  // Set of viewers who have watched this creator (from WatchSession).
  const creatorViewers = useMemo(() => new Set(sessions.map((s) => s.viewer_wallet).filter(Boolean)), [sessions]);

  const series = useMemo(() => {
    const today = new Date();
    const buckets = new Map();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      buckets.set(d.toISOString().slice(0, 10), { viewers: new Set(), streakSum: 0, streakCount: 0 });
    }
    // Bucket ViewerStreak records by last_watch_date — only viewers who have
    // watched THIS creator (cross-referenced via WatchSession).
    for (const s of streaks) {
      if (!s.last_watch_date || !creatorViewers.has(s.viewer_wallet)) continue;
      const key = new Date(s.last_watch_date).toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (!b) continue;
      b.viewers.add(s.viewer_wallet);
      b.streakSum += Number(s.current_streak) || 0;
      b.streakCount += 1;
    }
    return Array.from(buckets.entries()).map(([day, b]) => ({
      day: day.slice(5),
      full: day,
      viewers: b.viewers.size,
      avgStreak: b.streakCount > 0 ? Math.round((b.streakSum / b.streakCount) * 10) / 10 : 0,
    }));
  }, [streaks, creatorViewers]);

  const peakDay = useMemo(() => series.reduce((m, p) => (p.viewers > m.viewers ? p : m), series[0] || { day: "—", viewers: 0, avgStreak: 0 }), [series]);
  const peakStreakDay = useMemo(() => series.reduce((m, p) => (p.avgStreak > m.avgStreak ? p : m), series[0] || { day: "—", avgStreak: 0 }), [series]);
  const totalActiveViewers = useMemo(() => creatorViewers.size, [creatorViewers]);

  // Derive the weekday name from the full ISO date for the peak day.
  const weekdayName = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-US", { weekday: "long" }); } catch { return ""; }
  };

  if (!wallet) return null;
  if (loading) return (
    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
  );

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5 text-primary" /> Peak Viewers</div>
          <p className="text-xl font-display font-bold text-primary mt-0.5">{peakDay.viewers}</p>
          <p className="text-[11px] text-muted-foreground">{weekdayName(peakDay.full)} · {peakDay.day}</p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flame className="w-3.5 h-3.5 text-accent" /> Top Avg Streak</div>
          <p className="text-xl font-display font-bold text-accent mt-0.5">{peakStreakDay.avgStreak}d</p>
          <p className="text-[11px] text-muted-foreground">{weekdayName(peakStreakDay.full)} · {peakStreakDay.day}</p>
        </div>
        <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5 text-chart-3" /> Unique Viewers</div>
          <p className="text-xl font-display font-bold text-chart-3 mt-0.5">{totalActiveViewers}</p>
          <p className="text-[11px] text-muted-foreground">Last {DAYS} days</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/70" /> Active Viewers
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-0.5 bg-accent" /> Avg Streak (days)
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Best engagement: <span className="text-primary font-medium">{weekdayName(peakDay.full)}</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="g_viewers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.85} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval={Math.floor(DAYS / 6)} />
          <YAxis
            yAxisId="viewers"
            stroke="hsl(var(--primary))"
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="streak"
            orientation="right"
            stroke="hsl(var(--accent))"
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(v, name) => [name === "Active Viewers" ? `${v} viewers` : `${v} days`, name]}
          />
          <Bar yAxisId="viewers" dataKey="viewers" fill="url(#g_viewers)" name="Active Viewers" radius={[3, 3, 0, 0]} maxBarSize={22} />
          <Line yAxisId="streak" type="monotone" dataKey="avgStreak" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} name="Avg Streak" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}