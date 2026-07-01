import React, { useEffect, useState } from "react";
import { Loader2, Radio, Calendar, Users, Zap, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIERS = [100, 500, 1000, 5000, 10000];
const nextTier = (peak) => TIERS.find((t) => t > peak) || TIERS[TIERS.length - 1];

// StreamMilestones — upcoming (non-ended) streams with an editable viewer goal
// and a milestone tier ladder showing progress toward the next tier.
export default function StreamMilestones({ wallet }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    base44.entities.Stream.filter({ creator_wallet: wallet }, "-created_date", 200)
      .then((d) => { if (active) setStreams((d || []).filter((s) => s.status !== "ended").slice(0, 12)); })
      .catch(() => { if (active) setStreams([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  };
  useEffect(() => load(), [wallet]);

  const setGoal = async (s, goal) => {
    const g = Number(goal) || 0;
    setStreams((prev) => prev.map((x) => (x.id === s.id ? { ...x, viewer_goal: g } : x)));
    await base44.entities.Stream.update(s.id, { viewer_goal: g });
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-chart-3" /> Upcoming Stream Milestones</h2>
      {streams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming streams. Schedule a stream to set milestones.</p>
      ) : (
        <div className="space-y-3">
          {streams.map((s) => {
            const peak = s.peak_viewers || s.viewer_count || 0;
            const goal = s.viewer_goal || 0;
            const tier = nextTier(peak);
            const pctGoal = goal > 0 ? Math.min(100, Math.round((peak / goal) * 100)) : 0;
            const pctTier = Math.min(100, Math.round((peak / tier) * 100));
            const live = s.status === "live";
            return (
              <div key={s.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio className={`w-4 h-4 shrink-0 ${live ? "text-accent animate-pulse" : "text-primary"}`} />
                    <p className="text-sm font-medium truncate">{s.title}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${live ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}>{live ? "Live" : "Scheduled"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Peak {peak.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {(s.tips_earned || 0).toLocaleString()} ◎</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(s.created_date).toLocaleDateString()}</span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Viewer goal</span>
                    <span>{peak.toLocaleString()} / {goal > 0 ? goal.toLocaleString() : "—"}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pctGoal}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-muted-foreground">Set goal</label>
                    <input type="number" min={0} value={goal} onChange={(e) => setGoal(s, e.target.value)} className="w-28 rounded-md border border-input bg-muted px-2 py-1 text-xs" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Next milestone tier</span>
                    <span>{tier.toLocaleString()} viewers</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pctTier}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}