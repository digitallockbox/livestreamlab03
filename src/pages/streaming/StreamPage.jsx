import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Heart, Gift, Zap, Send, Bell } from "lucide-react";
import TipModal from "@/components/streaming/TipModal";
import GiftModal from "@/components/streaming/GiftModal";

const MOCK_CHAT = [
  { user: "neon_wolf", msg: "🔥 insane stream!", type: "chat" },
  { user: "pixelqueen", msg: "tipped 250 $STREAMING!", type: "tip" },
  { user: "darkbyte_", msg: "First time here, love the vibes", type: "chat" },
  { user: "cyber_rex", msg: "gifted a ⚡ Lightning Bolt!", type: "gift" },
  { user: "viewer_99", msg: "What DAW are you using?", type: "chat" },
  { user: "shadow99", msg: "tipped 100 $STREAMING!", type: "tip" },
  { user: "luna_stream", msg: "This track is insane 🎵", type: "chat" },
  { user: "beta_user", msg: "Came from Twitter, glad I did", type: "chat" },
];

const RECOMMENDED = [
  { title: "Late Night Code", creator: "neonbyte_", viewers: 843, category: "Tech" },
  { title: "Chill Lofi Mix", creator: "lo_queen", viewers: 1204, category: "Music" },
  { title: "Strategy Masters", creator: "tactix_r", viewers: 562, category: "Gaming" },
];

export default function StreamPage() {
  const [tipOpen, setTipOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Left — player + info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Player */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-border">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&q=80')] bg-cover bg-center opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-9 h-9 text-primary/60" />
                  </div>
                  <p className="text-white/60 text-sm">Live Stream Player</p>
                </div>
              </div>
              {/* Live badge overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-destructive text-white border-0 gap-1.5 px-3 py-1 text-xs font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </Badge>
                <div className="bg-black/70 backdrop-blur rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-white">
                  <Users className="w-3 h-3" /> 2,431
                </div>
              </div>
            </div>

            {/* Stream info row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white flex-shrink-0">S</div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Friday Night Beats — Vol. 12</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted-foreground font-medium">ShadowCreator</span>
                    <span className="text-muted-foreground/40">·</span>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">Music</Badge>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground">Started 1h 24m ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setFollowed(!followed)}
                  className={`gap-2 rounded-xl border-border ${followed ? 'text-destructive border-destructive/40 bg-destructive/5' : ''}`}>
                  <Heart className={`w-4 h-4 ${followed ? 'fill-destructive text-destructive' : ''}`} />
                  {followed ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" onClick={() => setTipOpen(true)} className="gap-2 rounded-xl border-accent/30 text-accent hover:bg-accent/10">
                  <Zap className="w-4 h-4" /> Tip
                </Button>
                <Button variant="outline" onClick={() => setGiftOpen(true)} className="gap-2 rounded-xl border-chart-3/30 text-chart-3 hover:bg-chart-3/10">
                  <Gift className="w-4 h-4" /> Gift
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl border-border">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Late night beats, deep focus, and live creation. Join the session — drop requests in chat, tip to get your track featured, gift for a shoutout. Powered by <span className="text-accent font-semibold">$STREAMING</span>.
              </p>
            </div>

            {/* Recommended */}
            <div>
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Recommended Streams</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RECOMMENDED.map((s) => (
                  <div key={s.title} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/5 rounded-lg mb-2 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-primary/30" />
                    </div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{s.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{s.creator}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{s.viewers.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — chat */}
          <div className="bg-card border border-border rounded-2xl flex flex-col" style={{ height: '680px' }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="font-display font-semibold text-sm">Live Chat</h3>
              <span className="text-xs text-muted-foreground">2,431 watching</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {MOCK_CHAT.map((c, i) => (
                <div key={i} className={`text-xs rounded-lg px-2.5 py-1.5 ${c.type === 'tip' ? 'bg-accent/10 border border-accent/20' : c.type === 'gift' ? 'bg-chart-3/10 border border-chart-3/20' : ''}`}>
                  <span className={`font-semibold ${c.type === 'tip' ? 'text-accent' : c.type === 'gift' ? 'text-chart-3' : 'text-primary'}`}>@{c.user}</span>
                  <span className="text-foreground ml-1">{c.msg}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Say something..." className="bg-secondary border-border text-xs h-8" />
                <Button size="icon" className="bg-primary hover:bg-primary/90 h-8 w-8 shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setTipOpen(true)} className="flex-1 bg-accent/15 hover:bg-accent/25 text-accent border border-accent/20 gap-1.5 text-xs h-7">
                  <Zap className="w-3 h-3" /> Tip
                </Button>
                <Button size="sm" onClick={() => setGiftOpen(true)} className="flex-1 bg-chart-3/15 hover:bg-chart-3/25 text-chart-3 border border-chart-3/20 gap-1.5 text-xs h-7">
                  <Gift className="w-3 h-3" /> Gift
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TipModal open={tipOpen} onClose={() => setTipOpen(false)} />
      <GiftModal open={giftOpen} onClose={() => setGiftOpen(false)} />
    </div>
  );
}