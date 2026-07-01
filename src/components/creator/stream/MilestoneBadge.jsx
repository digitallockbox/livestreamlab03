import React, { useEffect, useState } from "react";
import { Flame, Trophy, Loader2 } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { watchAPI } from "@/components/creator/os";

const MILESTONE = 7;

// MilestoneBadge — renders an animated 7-day watch-streak badge in the viewer
// profile once the viewer has reached the milestone. Styled for the dark theme
// dashboard (glow-green accent, gradient ring). Hidden until the milestone is hit.
export default function MilestoneBadge() {
  const { wallet } = useStreamingIdentity();
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const res = await watchAPI.streak(wallet);
        if (active) setStreak(res.streak || { current_streak: 0, longest_streak: 0, total_days_watched: 0 });
      } catch (_e) { /* fail open */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [wallet]);

  if (loading) {
    return <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /></div>;
  }

  const current = streak?.current_streak || 0;
  const longest = streak?.longest_streak || 0;
  if (longest < MILESTONE) return null;

  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-chart-3/40 bg-gradient-to-br from-chart-3/15 to-primary/5 px-3.5 py-2 glow-green">
      <div className="relative w-9 h-9 shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-chart-3/40 to-chart-3/10 animate-pulse" />
        <div className="relative w-9 h-9 rounded-full bg-chart-3/20 flex items-center justify-center border border-chart-3/50">
          <Trophy className="w-4 h-4 text-chart-3" />
        </div>
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-chart-3" />
          <span className="text-sm font-display font-bold text-chart-3">{MILESTONE}-Day Streak</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {current >= MILESTONE
            ? `On a ${current}-day streak — bonus $STREAMING active`
            : `Best streak ${longest} days · milestone reached`}
        </p>
      </div>
    </div>
  );
}