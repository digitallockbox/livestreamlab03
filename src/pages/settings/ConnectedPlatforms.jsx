import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Radio, Zap, Clock, ArrowLeft, Check } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { useIdentity } from "@/lib/web3/identity";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Page, Card } from "@/components/creator/os";
import { PLATFORMS } from "@/components/creator/pages/MultiPlatformBroadcast";

// ConnectedPlatforms — dedicated settings page for multi-platform broadcast
// connections. Connection flags + broadcast_all persist on the creator
// Web3Profile via the signed web3Profile update. The payout meter shows the
// real instant $STREAMING balance; external platform earnings are paid on
// delayed Net-30/60/90 cycles (estimated/pending, not fabricated here).
export default function ConnectedPlatforms() {
  const { profile, refresh } = useCreator();
  const { signedInvoke } = useIdentity();
  const { balance } = useStreamingIdentity();
  const [busy, setBusy] = useState(null);

  const connections = profile?.connections || {};
  const broadcastAll = !!profile?.broadcast_all;

  const setConnection = async (key, val) => {
    setBusy(key);
    try {
      await signedInvoke("web3Profile", {
        action: "update",
        connections: { ...connections, [key]: val },
      });
      refresh?.();
    } finally {
      setBusy(null);
    }
  };

  const setBroadcastAll = async (val) => {
    setBusy("broadcast_all");
    try {
      await signedInvoke("web3Profile", { action: "update", broadcast_all: val });
      refresh?.();
    } finally {
      setBusy(null);
    }
  };

  const connectedCount = PLATFORMS.filter((p) => connections[p.key]).length;

  return (
    <Page title="Connected Platforms" subtitle="Multi-platform broadcast, payouts & connection status">
      <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-primary" /> Platform Connections
          </h2>
          <span className="text-xs text-muted-foreground">{connectedCount}/{PLATFORMS.length} connected</span>
        </div>

        <div className="space-y-2">
          {PLATFORMS.map((p) => {
            const on = !!connections[p.key];
            return (
              <div key={p.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: p.color }}>
                    {p.letter}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{on ? "Syndication enabled" : "Not connected"}</p>
                  </div>
                </div>
                {on ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                    <button
                      onClick={() => setConnection(p.key, false)}
                      disabled={busy === p.key}
                      className="px-2.5 py-1 rounded-md border border-border text-xs hover:border-destructive/40 hover:text-destructive"
                    >
                      {busy === p.key ? <Loader2 className="w-3 h-3 animate-spin" /> : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConnection(p.key, true)}
                    disabled={busy === p.key}
                    className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90"
                  >
                    {busy === p.key ? <Loader2 className="w-3 h-3 animate-spin" /> : "Connect"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm pt-1">
          <input type="checkbox" checked={broadcastAll} onChange={(e) => setBroadcastAll(e.target.checked)} disabled={busy === "broadcast_all"} />
          Broadcast to all connected platforms
        </label>
        <p className="text-[11px] text-muted-foreground">When on, your LiveStreamLab master stream is syndicated to every connected platform.</p>
      </Card>

      {/* Real-time payout meter */}
      <Card className="space-y-3">
        <h2 className="font-display font-semibold text-sm">Payout Meter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
            <p className="text-xs flex items-center gap-1 text-accent"><Zap className="w-3.5 h-3.5" /> Instant · $STREAMING</p>
            <p className="text-2xl font-display font-bold text-accent mt-1">{Number(balance || 0).toLocaleString()} ◎</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">LiveStreamLab pays you in real-time via Base44 engines.</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> External · Net-30/60/90</p>
            <p className="text-2xl font-display font-bold mt-1 text-muted-foreground">Pending</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">External platform earnings are paid on delayed payout cycles.</p>
          </div>
        </div>
      </Card>
    </Page>
  );
}