import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Radio, Users, Clock, Zap, CheckCircle2 } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { useCreatorDashboard } from "@/hooks/web3/useCreatorDashboard";
import { Page, Card, useViewerWallet, streamsAPI, economyAPI } from "@/components/creator/os";
import EarningsSummary from "@/components/creator/pages/EarningsSummary";

// /creator/dashboard — a single-page overview of the creator's streams, earnings,
// audience, and monetization. Reuses the real data hooks (useCreatorDashboard,
// streamsAPI, economyAPI) and the shared os.jsx primitives. No phantom imports.
export default function CreatorDashboard() {
  const wallet = useViewerWallet();
  const { session } = useIdentity();
  const { dashboard, loading: dashLoading } = useCreatorDashboard();

  const [streams, setStreams] = useState([]);
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    Promise.all([
      streamsAPI.past(wallet).catch(() => ({ streams: [] })),
      economyAPI.get().catch(() => ({})),
    ]).then(([s, e]) => {
      if (!active) return;
      setStreams(s?.streams || []);
      setEconomy(e || {});
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wallet]);

  const stats = useMemo(() => {
    const totalStreams = streams.length;
    const watchMinutes = streams.reduce((a, s) => a + (s.duration_minutes || 0), 0);
    const followers = session?.followers || dashboard?.identity?.followers || 0;
    const streamingEarned = economy?.balance ?? 0;
    return { totalStreams, watchMinutes, followers, streamingEarned };
  }, [streams, economy, session, dashboard]);

  const recent = useMemo(() => [...streams].slice(0, 6), [streams]);

  if (!wallet) {
    return (
      <Page title="Creator Dashboard" subtitle="Connect your wallet to view your dashboard.">
        <Card><p className="text-sm text-muted-foreground">No wallet connected.</p></Card>
      </Page>
    );
  }

  return (
    <Page title="Creator Dashboard" subtitle="Overview of your streams, earnings, audience, and monetization.">
      {/* Wallet verified banner */}
      <Card className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Wallet Verified</span>
          <span className="text-xs text-muted-foreground font-mono break-all">{wallet}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent capitalize">
          {session?.badge_tier || "bronze"} tier
        </span>
      </Card>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Radio} label="Total Streams" value={stats.totalStreams} loading={loading || dashLoading} />
        <StatCard icon={Clock} label="Watch Time (min)" value={stats.watchMinutes.toLocaleString()} loading={loading || dashLoading} />
        <StatCard icon={Users} label="Followers" value={(stats.followers || 0).toLocaleString()} loading={loading || dashLoading} />
        <StatCard icon={Zap} label="$STREAMING Earned" value={Number(stats.streamingEarned || 0).toLocaleString()} accent loading={loading || dashLoading} />
      </div>

      {/* Recent streams table */}
      <Card>
        <h2 className="font-display font-semibold mb-3">Recent Streams</h2>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No streams yet. Go live to populate your dashboard.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Viewers</th>
                  <th className="py-2 pr-3 text-right">Duration (min)</th>
                  <th className="py-2 text-right">Tips ($STREAMING)</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 truncate max-w-[200px]">{s.title}</td>
                    <td className="py-2 pr-3 capitalize">{s.status}</td>
                    <td className="py-2 pr-3 text-right">{(s.peak_viewers || s.viewer_count || 0).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right">{s.duration_minutes || 0}</td>
                    <td className="py-2 text-right text-accent">{(s.tips_earned || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Earnings + monetization breakdown (reuses the real 30-day aggregator) */}
      <EarningsSummary />
    </Page>
  );
}

function StatCard({ icon: Icon, label, value, loading, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <p className={`text-2xl font-display font-bold ${accent ? "text-accent" : ""}`}>{value}</p>
      )}
    </div>
  );
}