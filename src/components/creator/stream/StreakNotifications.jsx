import React, { useEffect, useState } from "react";
import { Bell, Flame, Zap, X, CheckCheck, Loader2 } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { watchAPI } from "@/components/creator/os";

// StreakNotifications — in-app alert panel for watch-streak milestones.
// Shows unread streak-milestone notifications in the creator dashboard and
// lets the viewer dismiss/mark them as read. Polls for fresh notifications.
export default function StreakNotifications() {
  const { wallet } = useStreamingIdentity();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async (w) => {
    if (!w) { setLoading(false); return; }
    try {
      const res = await watchAPI.notifications(w);
      setNotifications(res.notifications || []);
      setUnread(res.unread || 0);
    } catch (_e) { /* fail open */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load(wallet);
    if (!wallet) return;
    const id = setInterval(() => load(wallet), 30000);
    return () => clearInterval(id);
  }, [wallet]);

  const markAllRead = async () => {
    if (!wallet || unread === 0) return;
    setBusy(true);
    try { await watchAPI.markRead(wallet); load(wallet); } finally { setBusy(false); }
  };

  if (loading || !wallet) return null;

  const recent = notifications.slice(0, 8);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted transition-colors"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Milestone Alerts</span>
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
                <Flame className="w-4 h-4 text-chart-3" />
                <span className="font-display font-semibold text-sm">Milestone Alerts</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Flame className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No milestone alerts yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Watch 7 days in a row or earn 100 $STREAMING to unlock your first!</p>
                </div>
              ) : recent.map((n) => (
                <div key={n.id} className={`px-4 py-3 ${n.read ? "bg-transparent" : (n.type === "token_milestone" ? "bg-primary/5" : "bg-chart-3/5")}`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-full ${n.type === "token_milestone" ? "bg-primary/15" : "bg-chart-3/15"} flex items-center justify-center shrink-0 mt-0.5`}>
                      {n.type === "token_milestone" ? <Zap className="w-3.5 h-3.5 text-primary" /> : <Flame className="w-3.5 h-3.5 text-chart-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
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