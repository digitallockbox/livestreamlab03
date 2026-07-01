import React, { useState, useRef, useEffect } from "react";
import { Send, Users, Clock, Zap, Radio, StopCircle } from "lucide-react";
import ClaimButton from "@/components/creator/stream/ClaimButton";
import LiveLeaderboard from "@/components/creator/stream/LiveLeaderboard";

// Responsive stream viewing layout: video player + metadata + live chat.
// On desktop: player/metadata span 2 cols, chat sticks to the right.
// On mobile: everything stacks (player → metadata → chat).
export default function StreamPlayer({ stream, tokens, minutes, onStop, wallet, onClaimed }) {
  const [messages, setMessages] = useState([
    { id: 1, user: "alice", text: "Great stream! 🔥" },
    { id: 2, user: "bob", text: "Sending a boost" },
  ]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), user: "you", text: text.trim() }]);
    setText("");
  };

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
              <ClaimButton viewerWallet={wallet} earned={tokens} onClaimed={onClaimed} />
              <button onClick={onStop} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/15 text-destructive text-sm hover:bg-destructive/25">
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Users className="w-3 h-3" /> Viewers</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5">{stream?.viewer_count ?? 0}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Watched</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5">{minutes}m</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Zap className="w-3 h-3" /> Earned</p>
              <p className="font-display font-bold text-sm sm:text-base mt-0.5 text-accent">{tokens} ◎</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: leaderboard + chat */}
      <div className="lg:col-span-1 space-y-4">
        <LiveLeaderboard streamId={stream?.id} creatorWallet={stream?.creator_wallet} />

        <div className="rounded-2xl border border-border bg-card flex flex-col h-[380px] lg:h-[calc(100vh-16rem)] lg:sticky lg:top-20">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-sm">Live Chat</h3>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium text-primary">{m.user}: </span>
                <span className="text-foreground">{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something..." className="flex-1 rounded-md bg-muted border border-input px-3 py-1.5 text-sm focus:outline-none" />
            <button type="submit" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}