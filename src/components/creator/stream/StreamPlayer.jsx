import React, { useState, useRef, useEffect } from "react";
import { Users, Clock, Zap, Radio, StopCircle, Flame } from "lucide-react";
import ClaimButton from "@/components/creator/stream/ClaimButton";
import LiveLeaderboard from "@/components/creator/stream/LiveLeaderboard";
import StreamChat from "@/components/creator/stream/StreamChat";
import { useStreamPresence } from "@/components/creator/stream/useStreamPresence";

// Responsive stream viewing layout: video player + metadata + live chat.
// On desktop: player/metadata span 2 cols, chat sticks to the right.
// On mobile: everything stacks (player → metadata → chat).
const computeStreakBonus = (streak) => (streak >= 3 ? Math.min(streak * 2, 50) : 0);

export default function StreamPlayer({ stream, tokens, minutes, streak, onStop, wallet, onClaimed }) {
  const streakBonus = computeStreakBonus(streak || 0);
  const totalClaimable = (tokens || 0) + streakBonus;
  const liveViewerCount = useStreamPresence(stream?.id, wallet);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main: player + metadata */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <div className="text-center text-muted-foreground space-y-2">
              <Radio className="w-10 h-10 mx-auto text-destructive animate-pulse" />
              <p className="text-sm">LIVE · {(stream?.creator_wallet || "").slice(0, 8)}…</p>
            </div>
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">{stream?.title}</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1 break-all">{stream?.creator_wallet}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {streak >= 3 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-chart-3/15 text-chart-3 text-xs font-semibold border border-chart-3/30" title="Consecutive-day streak — bonus applies on claim">
                  <Flame className="w-3.5 h-3.5" /> {streak}-day streak
                </span>
              )}
              <ClaimButton viewerWallet={wallet} earned={tokens} streak={streak} onClaimed={onClaimed} />
              <button onClick={onStop} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/15 text-destructive text-sm hover:bg-destructive/25">
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Users className="w-3 h-3" /> Viewers</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5">{liveViewerCount}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Watched</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5">{minutes}m</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Zap className="w-3 h-3" /> Earned</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5 text-accent">{totalClaimable} ◎</p>
              {streakBonus > 0 && (
                <p className="text-[10px] text-chart-3 mt-0.5">+{streakBonus} streak</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: leaderboard + chat */}
      <div className="lg:col-span-1 space-y-4">
        <LiveLeaderboard streamId={stream?.id} creatorWallet={stream?.creator_wallet} />

        <StreamChat streamId={stream?.id} viewerWallet={wallet} />
      </div>
    </div>
  );
}