import React, { useEffect, useState } from "react";
import { Trophy, Zap, Loader2 } from "lucide-react";
import { watchAPI } from "@/components/creator/os";

// LiveLeaderboard — shows the top viewers currently earning the most
// $STREAMING during the active broadcast. Polls every 15s for near-real-time
// updates while a stream is being watched.
const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function LiveLeaderboard({ streamId, creatorWallet }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await watchAPI.leaderboard(streamId, creatorWallet);
        if (active) setLeaders(res.leaders || []);
      } catch (_e) {
        /* fail open — keep last known board */
      } finally {
        if (active) setLoading(false);
      }
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => { active = false; clearInterval(id); };
  }, [streamId, creatorWallet]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-chart-3" />
        <h3 className="font-display font-semibold text-sm">Top Earners</h3>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> live
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : leaders.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No active earners yet. Start watching to climb the board.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {leaders.map((l, i) => (
            <li
              key={l.viewer_wallet}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 ${i === 0 ? "bg-chart-3/10" : "hover:bg-muted/60"}`}
            >
              <span className="w-6 text-center text-xs font-mono font-semibold">
                {i < 3 ? RANK_MEDALS[i] : i + 1}
              </span>
              <span className="flex-1 min-w-0 font-mono text-xs truncate" title={l.viewer_wallet}>
                {l.viewer_wallet?.slice(0, 6)}…{l.viewer_wallet?.slice(-4)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                {l.minutes_watched || 0}m
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent">
                <Zap className="w-3 h-3" /> {l.tokens_earned || 0}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}