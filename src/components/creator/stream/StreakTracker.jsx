import React, { useEffect, useState } from "react";
import { Flame, Trophy, CalendarDays, Loader2, Sparkles } from "lucide-react";
import { watchAPI } from "@/components/creator/os";

// StreakTracker — shows a viewer their consecutive-day watch streak with a
// celebratory badge once they hit a 7-day milestone.
const MILESTONE = 7;

export default function StreakTracker({ wallet }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const res = await watchAPI.streak(wallet);
        if (active) setStreak(res.streak || { current_streak: 0 });
      } catch (_e) { /* fail open */ }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [wallet]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const current = streak?.current_streak || 0;
  const longest = streak?.longest_streak || 0;
  const totalDays = streak?.total_days_watched || 0;
  const atMilestone = current >= MILESTONE;
  const daysToMilestone = Math.max(0, MILESTONE - current);
  const progress = Math.min(100, (current / MILESTONE) * 100);

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${atMilestone ? "border-chart-3/40 bg-gradient-to-br from-chart-3/10 to-primary/5 glow-green" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${atMilestone ? "text-chart-3" : current > 0 ? "text-chart-3/70" : "text-muted-foreground"}`} />
          <h3 className="font-display font-semibold text-sm">Watch Streak</h3>
        </div>
        {atMilestone && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-chart-3/20 text-chart-3 text-xs font-bold border border-chart-3/40 animate-pulse">
            <Sparkles className="w-3 h-3" /> {MILESTONE}-Day Milestone!
          </span>
        )}
      </div>

      {/* Big streak number */}
      <div className="flex items-end gap-2 mb-4">
        <span className={`font-display text-4xl font-extrabold leading-none ${atMilestone ? "text-chart-3" : "text-foreground"}`}>
          {current}
        </span>
        <span className="text-sm text-muted-foreground mb-1">day{current === 1 ? "" : "s"} in a row</span>
      </div>

      {/* Progress to 7-day milestone */}
      {!atMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{daysToMilestone} day{daysToMilestone === 1 ? "" : "s"} to milestone</span>
            <span className="font-mono">{current}/{MILESTONE}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-chart-3/60 to-chart-3 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Milestone badge — shown once 7 days reached */}
      {atMilestone && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-chart-3/10 border border-chart-3/30 p-3">
          <div className="w-11 h-11 rounded-full bg-chart-3/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-chart-3" />
          </div>
          <div>
            <p className="text-sm font-semibold text-chart-3">Milestone unlocked!</p>
            <p className="text-xs text-muted-foreground">You've watched {MILESTONE}+ days straight — bonus $STREAMING on every claim.</p>
          </div>
        </div>
      )}

      {/* Stats footer */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/60 p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1"><Trophy className="w-3 h-3" /> Longest</p>
          <p className="font-display font-bold text-sm mt-0.5">{longest} days</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Total</p>
          <p className="font-display font-bold text-sm mt-0.5">{totalDays} days</p>
        </div>
      </div>
    </div>
  );
}