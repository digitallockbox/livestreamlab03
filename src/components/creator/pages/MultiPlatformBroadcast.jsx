import React, { useState } from "react";
import { Loader2, Zap, Clock, Radio } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { useIdentity } from "@/lib/web3/identity";
import { Card } from "@/components/creator/os";

// MultiPlatformBroadcast — multi-platform syndication panel.
// LiveStreamLab is the master stream; connected external platforms are
// syndicated. Connection flags persist on the creator Web3Profile; the
// "Broadcast Everywhere" toggle sets broadcast_all. Payout distinction:
// STREAMING tokens pay instantly, external platforms pay Net-30/60/90.
export const PLATFORMS = [
  { key: "youtube", label: "YouTube Live", color: "#FF0000", letter: "Y" },
  { key: "twitch", label: "Twitch", color: "#9146FF", letter: "T" },
  { key: "x", label: "X Live", color: "#111827", letter: "X" },
  { key: "tiktok", label: "TikTok Live", color: "#000000", letter: "Tk" },
  { key: "facebook", label: "Facebook Live", color: "#1877F2", letter: "F" },
  { key: "kick", label: "Kick", color: "#53FC18", letter: "K" },
];

export default function MultiPlatformBroadcast({ disabled }) {
  const { profile, refresh } = useCreator();
  const { signedInvoke } = useIdentity();
  const [busy, setBusy] = useState(null);
  const connections = profile?.connections || {};
  const broadcastAll = !!profile?.broadcast_all;

  const toggle = async (key) => {
    if (disabled) return;
    const next = { ...connections, [key]: !connections[key] };
    setBusy(key);
    try {
      await signedInvoke("web3Profile", {
        action: "update",
        connections: next,
      });
      refresh?.();
    } finally {
      setBusy(null);
    }
  };

  const setBroadcastAll = async (val) => {
    if (disabled) return;
    setBusy("broadcast_all");
    try {
      await signedInvoke("web3Profile", {
        action: "update",
        broadcast_all: val,
      });
      refresh?.();
    } finally {
      setBusy(null);
    }
  };

  const connectedCount = PLATFORMS.filter((p) => connections[p.key]).length;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-primary" /> Multi-Platform Broadcast
        </h2>
        <span className="text-[11px] text-muted-foreground">{connectedCount}/{PLATFORMS.length} connected</span>
      </div>

      <div className="space-y-2">
        {PLATFORMS.map((p) => {
          const on = !!connections[p.key];
          return (
            <div key={p.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.letter}
                </span>
                <span className="text-sm">{p.label}</span>
              </div>
              <button
                onClick={() => toggle(p.key)}
                disabled={busy === p.key || disabled}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors disabled:opacity-50 ${
                  on
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {busy === p.key ? <Loader2 className="w-3 h-3 animate-spin" /> : on ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm pt-1">
        <input
          type="checkbox"
          checked={broadcastAll}
          onChange={(e) => setBroadcastAll(e.target.checked)}
          disabled={busy === "broadcast_all" || disabled}
        />
        Broadcast to all connected platforms
      </label>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-2">
          <p className="text-[11px] flex items-center gap-1 text-accent"><Zap className="w-3 h-3" /> Instant</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">LiveStreamLab pays you in $STREAMING instantly.</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <p className="text-[11px] flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> Net-30/60/90</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">External platforms pay on delayed cycles.</p>
        </div>
      </div>
    </Card>
  );
}