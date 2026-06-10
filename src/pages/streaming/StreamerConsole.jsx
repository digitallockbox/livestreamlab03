import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Zap, Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff, Send, Gift, Wifi, Loader2 } from "lucide-react";
import StreamManager from "@/components/streaming/StreamManager";
import { streamingApi } from "@/lib/tridentApi";

const MOCK_CHAT = [
  { user: "neon_wolf", msg: "🔥 Let's goooo!", type: "chat" },
  { user: "pixelqueen", msg: "tipped 250 $STREAMING!", type: "tip", amount: "250 $STR" },
  { user: "darkbyte_", msg: "First time catching you live, amazing!", type: "chat" },
  { user: "cyber_rex", msg: "gifted a ⚡ Lightning Bolt!", type: "gift" },
  { user: "viewer_99", msg: "What's your setup?", type: "chat" },
  { user: "shadow99", msg: "tipped 100 $STREAMING!", type: "tip", amount: "100 $STR" },
  { user: "luna_stream", msg: "This is incredible content 🎮", type: "chat" },
];

const RECENT_TIPS = [
  { user: "pixelqueen", amount: "250 $STR", time: "2s ago" },
  { user: "shadow99", amount: "100 $STR", time: "45s ago" },
  { user: "darkbyte_", amount: "$10.00", time: "2m ago" },
];

export default function StreamerConsole() {
  const location = useLocation();
  const navigate = useNavigate();
  const streamTitle = location.state?.title || "Friday Night Beats";
  const streamId    = location.state?.streamId ?? null;

  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [showManager, setShowManager] = useState(false);
  const [endingStream, setEndingStream] = useState(false);

  // Live stats from API
  const [liveStats, setLiveStats] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!streamId) return;
    const poll = async () => {
      try {
        const s = await streamingApi.status(streamId);
        setLiveStats(s);
      } catch { /* keep last known */ }
    };
    poll();
    pollRef.current = setInterval(poll, 15000);
    return () => clearInterval(pollRef.current);
  }, [streamId]);

  const handleEndStream = async () => {
    setEndingStream(true);
    try {
      if (streamId) await streamingApi.end({ stream_id: streamId });
    } catch { /* navigate anyway */ }
    navigate('/stream-analytics');
  };

  const viewers    = liveStats?.viewer_count  ?? 2431;
  const tipsEarned = liveStats?.tips_earned   ?? "$127.50";
  const uptime     = liveStats?.uptime        ?? "1:24:07";
  const bitrate    = liveStats?.bitrate       ?? "6.5 Mbps";

  const streamData = {
    title: streamTitle, status: "live",
    uptime, bitrate, framerate: "60 fps",
    droppedFrames: 0, latency: "2100ms",
    tipsEarned, storeSales: "$43.20",
    streamingTokens: "850", streakBonus: "1.2x", projectedPayout: "$234.80"
  };

  if (showManager) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => setShowManager(false)} className="mb-4">
          ← Back to Console
        </Button>
        <StreamManager 
          streamData={streamData} 
          onEndStream={handleEndStream}
          onSettings={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-destructive text-white border-0 gap-1.5 animate-pulse px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
          </Badge>
          <span className="font-display font-semibold text-foreground">{streamTitle}</span>
          <span className="text-xs text-muted-foreground">{streamData.uptime}</span>
        </div>
        <div className="flex items-center gap-5">
          {/* Health */}
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent font-medium">Excellent</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">{viewers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">{tipsEarned}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowManager(true)}>Manager</Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-0">

        {/* Video + controls */}
        <div className="lg:col-span-3 flex flex-col border-r border-border min-h-0">
          {/* Preview */}
          <div className="flex-1 bg-black flex items-center justify-center relative min-h-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&q=80')] bg-cover bg-center opacity-10" />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-9 h-9 text-primary/50" />
              </div>
              <p className="text-muted-foreground text-sm">Live Preview Feed</p>
            </div>

            {/* Overlay stats */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-black/70 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-white text-xs font-bold">REC</span>
              </div>
              <div className="bg-black/70 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-white font-medium">
                1080p · 6k
              </div>
            </div>

            {/* Stream health bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-accent" />
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1 rounded-full ${i <= 4 ? 'bg-accent' : 'bg-muted'}`} style={{ height: `${6 + i * 3}px` }} />)}
                </div>
                <span className="text-xs text-accent">Stream Health: Excellent</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 p-4 border-t border-border bg-card/40 flex-shrink-0">
            <button onClick={() => setMuted(!muted)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${muted ? 'bg-destructive/20 border-destructive/50 text-destructive' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={() => setCamOff(!camOff)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${camOff ? 'bg-destructive/20 border-destructive/50 text-destructive' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {camOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </button>
            <button onClick={() => setScreenShare(!screenShare)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${screenShare ? 'bg-primary/20 border-primary/50 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {screenShare ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
            </button>
            <Button onClick={handleEndStream} disabled={endingStream} className="bg-destructive hover:bg-destructive/90 rounded-full px-7 h-12 font-bold gap-2 shadow-lg shadow-destructive/25">
              {endingStream ? <Loader2 className="w-4 h-4 animate-spin" /> : <MonitorOff className="w-4 h-4" />}
              {endingStream ? 'Ending…' : 'End Stream'}
            </Button>
          </div>
        </div>

        {/* Right panel — chat + tips */}
        <div className="flex flex-col min-h-0 bg-card/30">

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-border">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="font-display font-semibold text-sm">Live Chat</h3>
              <span className="text-xs text-muted-foreground">2,431 watching</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {MOCK_CHAT.map((c, i) => (
                <div key={i} className={`text-xs rounded-lg px-2.5 py-1.5 ${c.type === 'tip' ? 'bg-accent/10 border border-accent/20' : c.type === 'gift' ? 'bg-chart-3/10 border border-chart-3/20' : 'bg-transparent'}`}>
                  <span className={`font-semibold ${c.type === 'tip' ? 'text-accent' : c.type === 'gift' ? 'text-chart-3' : 'text-primary'}`}>@{c.user}</span>
                  {c.type === 'tip' && <span className="text-accent ml-1 font-bold">+{c.amount}</span>}
                  {c.type !== 'tip' && <span className="text-foreground ml-1">{c.msg}</span>}
                </div>
              ))}
            </div>
            <div className="p-3 flex-shrink-0 border-t border-border">
              <div className="flex gap-2">
                <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Chat as host..." className="bg-secondary border-border text-xs h-8" />
                <Button size="icon" className="bg-primary hover:bg-primary/90 h-8 w-8 shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tips Panel */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">$STREAMING Tipping</span>
            </div>
            {/* Recent tips */}
            <div className="space-y-1.5 mb-3">
              {RECENT_TIPS.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-accent/5 border border-accent/10 rounded-lg px-2.5 py-1.5">
                  <span className="text-muted-foreground">@{t.user}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent">{t.amount}</span>
                    <span className="text-muted-foreground/50">{t.time}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Quick tip amounts */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[10, 50, 100, 500].map(a => (
                <button key={a} className="text-xs py-1.5 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/15 text-accent font-semibold transition-colors">
                  {a}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/20 gap-1.5 text-xs">
                <Zap className="w-3 h-3" /> Tip
              </Button>
              <Button size="sm" className="bg-chart-3/20 hover:bg-chart-3/30 text-chart-3 border border-chart-3/20 gap-1.5 text-xs">
                <Gift className="w-3 h-3" /> Gift
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}