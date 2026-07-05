import React, { useEffect, useState } from "react";
import { Megaphone, Flame, X, CheckCheck, Loader2, ExternalLink } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { watchAPI } from "@/components/creator/os";

// ShoutoutAlerts — creator-facing panel that surfaces viewers who just hit a
// 7-day (or multiple) watch streak. Polls every 60s so the creator can give
// them a shoutout during their next stream.
export default function ShoutoutAlerts() {
  const { wallet } = useStreamingIdentity();
  const [shoutouts, setShoutouts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async (w) => {
    if (!w) { setLoading(false); return; }
    try {
      const res = await watchAPI.shoutouts(w);
      setShoutouts(res.shoutouts || []);
      setUnread(res.unread || 0);
    } catch (_e) { /* fail open */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load(wallet);
    if (!wallet) return;
    const id = setInterval(() => load(wallet), 60000);
    return () => clearInterval(id);
  }, [wallet]);

  const markAllRead = async () => {
    if (!wallet || unread === 0) return;
    setBusy(true);
    try { await watchAPI.markShoutoutsRead(wallet); load(wallet); } finally { setBusy(false); }
  };

  if (loading || !wallet) return null;

  const recent = shoutouts.slice(0, 10);
  const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md border border-chart-3/30 bg-chart-3/10 text-chart-3 text-sm hover:bg-chart-3/20 transition-colors"
      >
        <Megaphone className="w-4 h-4" />
        <span className="hidden sm:inline">Shoutouts</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-chart-3 text-background text-[10px] font-bold border border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-40 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-chart-3" />
                <span className="font-display font-semibold text-sm">Viewer Shoutouts</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Flame className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No shoutout alerts yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">When a viewer hits a 7-day watch streak, they'll appear here for your next stream.</p>
                </div>
              ) : recent.map((n) => (
                <div key={n.id} className={`px-4 py-3 ${n.read ? "bg-transparent" : "bg-chart-3/5"}`}>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-chart-3/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="w-3.5 h-3.5 text-chart-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      {n.viewer_wallet && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[11px] font-mono text-muted-foreground">{shortAddr(n.viewer_wallet)}</span>
                          <a
                            href={`https://solscan.io/account/${n.viewer_wallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary inline-flex items-center gap-0.5 hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> View
                          </a>
                        </div>
                      )}
                      {n.created_date && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(n.created_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-chart-3 shrink-0 mt-2" />}
                  </div>
                </div>
              ))}
            </div>

            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={busy}
                className="w-full px-4 py-2.5 border-t border-border text-sm text-primary hover:bg-muted/50 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all read
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}