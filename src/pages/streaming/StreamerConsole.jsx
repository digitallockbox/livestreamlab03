import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Radio, Users, Zap, Mic, MicOff, Camera, CameraOff,
  Monitor, MonitorOff, Send, Settings, Signal, Clock, Gift
} from "lucide-react";
import TipModal from "@/components/streaming/TipModal";
import GiftModal from "@/components/streaming/GiftModal";

const CHAT = [
  { user: "neon_wolf", msg: "Let's gooo 🔥", tip: null },
  { user: "pixelqueen", msg: "500 $STREAMING TIP!", tip: "500 $STR", color: "text-accent" },
  { user: "darkbyte_", msg: "First time watching — loving it", tip: null },
  { user: "solarflare", msg: "Audio is crisp tonight", tip: null },
  { user: "techghost", msg: "250 $STREAMING TIP!", tip: "250 $STR", color: "text-accent" },
  { user: "chill99", msg: "What's the setup?", tip: null },
  { user: "mango_live", msg: "Been here 2 hours already lol", tip: null },
  { user: "vaultking", msg: "100 $STREAMING GIFT 🎁", tip: "100 $STR", color: "text-chart-3" },
];

export default function StreamerConsole() {
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-destructive text-white border-0 gap-1.5 animate-pulse px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE
          </Badge>
          <span className="font-display font-semibold text-foreground hidden sm:block">Late Night Beats</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>1:24:07</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">2,431</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-semibold text-accent">$127.50</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Signal className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 font-medium">Excellent</span>
          </div>
          <Button size="sm" variant="outline" className="border-border gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" /> Settings
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-0">
        {/* Left: Preview + controls */}
        <div className="lg:col-span-3 flex flex-col border-r border-border min-h-0">
          {/* Video preview */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Radio className="w-9 h-9 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground">Live Preview Window</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Camera feed appears here</p>
            </div>

            {/* Stream health overlay */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(b => (
                  <div key={b} className={`w-1 rounded-sm ${b <= 4 ? 'bg-green-400' : 'bg-muted'}`} style={{ height: `${b * 4}px` }} />
                ))}
              </div>
              <span className="text-xs text-green-400 font-medium">6000 kbps</span>
            </div>

            {/* Viewer overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground font-semibold">2,431 watching</span>
            </div>
          </div>

          {/* Controls bar */}
          <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMuted(!muted)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${muted ? 'bg-destructive/20 border-destructive/40 text-destructive' : 'border-border text-muted-foreground hover:text-foreground hover:border-border/60'}`}
              >
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${!camOn ? 'bg-destructive/20 border-destructive/40 text-destructive' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setScreenShare(!screenShare)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${screenShare ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                {screenShare ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
              </button>
            </div>

            <Button className="bg-destructive hover:bg-destructive/90 gap-2 font-bold px-8 shadow-lg shadow-destructive/20">
              <Radio className="w-4 h-4" /> End Stream
            </Button>

            <div className="flex items-center gap-2">
              <Button onClick={() => setShowTip(true)} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 gap-2 text-sm">
                <Zap className="w-4 h-4" /> Tip Panel
              </Button>
              <Button onClick={() => setShowGift(true)} variant="outline" className="border-chart-3/30 text-chart-3 hover:bg-chart-3/10 gap-2 text-sm">
                <Gift className="w-4 h-4" /> Gift Panel
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Chat + Tips */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
              <Badge variant="secondary" className="text-xs px-2 py-0">2,431</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {CHAT.map((c, i) => (
                <div key={i} className={`text-sm ${c.tip ? 'bg-accent/5 border border-accent/15 rounded-lg px-3 py-2' : ''}`}>
                  <span className="font-semibold text-primary text-xs">@{c.user}</span>
                  {c.tip && <span className="ml-1.5 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">{c.tip}</span>}
                  <p className={`text-xs mt-0.5 ${c.color || 'text-muted-foreground'}`}>{c.msg}</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Reply to chat..."
                  className="bg-secondary border-border text-xs h-8"
                />
                <Button size="sm" className="bg-primary shrink-0 h-8 w-8 p-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Tips */}
          <div className="border-t border-border p-4 bg-gradient-to-br from-accent/5 to-primary/5 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-foreground">Recent Tips</span>
            </div>
            <div className="space-y-1.5">
              {[
                { user: "pixelqueen", amount: "500 $STR" },
                { user: "techghost", amount: "250 $STR" },
                { user: "vaultking", amount: "100 $STR" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">@{t.user}</span>
                  <span className="text-accent font-bold">{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTip && <TipModal onClose={() => setShowTip(false)} />}
      {showGift && <GiftModal onClose={() => setShowGift(false)} />}
    </div>
  );
}