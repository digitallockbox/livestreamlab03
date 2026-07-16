import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// StreamChat — real-time chat panel for a live stream.
// Uses the StreamChat entity + built-in realtime subscriptions.
// No backend function needed: the entity SDK handles create + subscribe.
export default function StreamChat({ streamId, viewerWallet }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // Load existing messages for this stream.
  useEffect(() => {
    if (!streamId) return;
    let active = true;
    base44.entities.StreamChat.filter({ stream_id: streamId }, "created_date", 100)
      .then((data) => { if (active) setMessages(data || []); })
      .catch(() => { if (active) setMessages([]); });
    return () => { active = false; };
  }, [streamId]);

  // Subscribe to new messages in real-time.
  useEffect(() => {
    if (!streamId) return;
    const unsubscribe = base44.entities.StreamChat.subscribe((event) => {
      if (event.data?.stream_id !== streamId) return;
      if (event.type === "create") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === event.data.id)) return prev;
          return [...prev, event.data].slice(-100);
        });
      }
    });
    return unsubscribe;
  }, [streamId]);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !streamId || !viewerWallet) return;
    setSending(true);
    try {
      await base44.entities.StreamChat.create({
        stream_id: streamId,
        viewer_wallet: viewerWallet,
        message: text.trim(),
      });
      setText("");
    } catch (err) {
      console.warn("Chat send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const formatWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "anon");

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-[380px] lg:h-[calc(100vh-16rem)] lg:sticky lg:top-20">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Live Chat</h3>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Be the first to chat!
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium text-primary font-mono text-xs">{formatWallet(m.viewer_wallet)}: </span>
              <span className="text-foreground">{m.message}</span>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={viewerWallet ? "Say something..." : "Connect wallet to chat"}
          disabled={!viewerWallet}
          className="flex-1 rounded-md bg-muted border border-input px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !text.trim() || !viewerWallet}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1 disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
    </div>
  );
}