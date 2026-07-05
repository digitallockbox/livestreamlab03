import React, { useEffect, useState } from "react";
import { Megaphone, Flame, ExternalLink, Loader2, CheckCheck, Trophy } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Card } from "@/components/creator/os";
import { watchAPI } from "@/components/creator/os";

// ShoutoutBoard — full-page list of every viewer who has reached a 7-day
// (or multiple) watch streak on this creator's channel. Pulled from
// viewer_streak notifications addressed to the creator wallet.
export default function ShoutoutBoard() {
  const { wallet } = useStreamingIdentity();
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shoutingOut, setShoutingOut] = useState(null);
  const [shouted, setShouted] = useState({});

  const load = async (w) => {
    if (!w) { setLoading(false); return; }
    try {
      const res = await watchAPI.shoutouts(w);
      setShoutouts(res.shoutouts || []);
    } catch (_e) { /* fail open */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(wallet); }, [wallet]);

  const handleShoutout = async (viewerWallet, notifId) => {
    if (!wallet || !viewerWallet) return;
    setShoutingOut(notifId);
    try {
      await watchAPI.shoutoutViewer(wallet, viewerWallet);
      setShouted((s) => ({ ...s, [notifId]: true }));
    } finally { setShoutingOut(null); }
  };

  const markAllRead = async () => {
    if (!wallet) return;
    setBusy(true);
    try { await watchAPI.markShoutoutsRead(wallet); load(wallet); } finally { setBusy(false); }
  };

  const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";
  const unread = shoutouts.filter((s) => !s.read).length;

  if (!wallet) return <Card><p className="text-sm text-muted-foreground">Connect your wallet to view shoutouts.</p></Card>;
  if (loading) return <Card><div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div></Card>;

  const topStreak = shoutouts.reduce((m, s) => Math.max(m, Number(s.milestone) || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-chart-3/15 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Viewer Shoutouts</h2>
              <p className="text-xs text-muted-foreground">Viewers who hit a 7-day watch streak — give them a shoutout on your next stream</p>
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted disabled:opacity-50">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />} Mark all read
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Shoutouts</p>
            <p className="text-2xl font-display font-bold mt-0.5">{shoutouts.length}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Unread</p>
            <p className="text-2xl font-display font-bold text-chart-3 mt-0.5">{unread}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Top Streak</p>
            <p className="text-2xl font-display font-bold text-accent mt-0.5 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> {topStreak}d
            </p>
          </div>
        </div>
      </Card>

      {shoutouts.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Flame className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No shoutout-worthy streaks yet.</p>
            <p className="text-xs text-muted-foreground mt-1">When a viewer watches 7 days in a row, they'll show up here for your next broadcast.</p>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-border/50">
            {shoutouts.map((n) => (
              <div key={n.id} className={`flex items-center gap-3 px-4 py-3 ${n.read ? "" : "bg-chart-3/5"}`}>
                <div className="w-9 h-9 rounded-full bg-chart-3/15 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-chart-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {n.viewer_wallet && (
                      <span className="text-[11px] font-mono text-muted-foreground">{shortAddr(n.viewer_wallet)}</span>
                    )}
                    {n.created_date && (
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(n.created_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {n.viewer_wallet && (
                      <a href={`https://solscan.io/account/${n.viewer_wallet}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary inline-flex items-center gap-0.5 hover:underline">
                        <ExternalLink className="w-2.5 h-2.5" /> View
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleShoutout(n.viewer_wallet, n.id)}
                    disabled={shoutingOut === n.id || shouted[n.id]}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-chart-3/15 text-chart-3 text-xs font-medium border border-chart-3/30 hover:bg-chart-3/25 disabled:opacity-50 transition-colors"
                  >
                    {shoutingOut === n.id ? <Loader2 className="w-3 h-3 animate-spin" /> : shouted[n.id] ? <CheckCheck className="w-3 h-3" /> : <Megaphone className="w-3 h-3" />}
                    {shouted[n.id] ? "Sent" : "Shoutout"}
                  </button>
                  <span className="text-lg font-display font-bold text-chart-3">{Number(n.milestone) || 7}d</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-chart-3" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}