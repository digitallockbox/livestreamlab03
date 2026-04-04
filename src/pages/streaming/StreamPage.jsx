import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Heart, Zap, Send, Gift, Share2, Bell } from "lucide-react";
import TipModal from "@/components/streaming/TipModal";
import GiftModal from "@/components/streaming/GiftModal";
import { Link } from "react-router-dom";

const CHAT = [
  { user: "neon_wolf", msg: "Let's gooo 🔥", tip: null },
  { user: "pixelqueen", msg: "500 $STREAMING TIP! 💸", tip: "500 $STR" },
  { user: "darkbyte_", msg: "First time here — this is fire", tip: null },
  { user: "solarflare", msg: "The mix tonight is insane", tip: null },
  { user: "techghost", msg: "250 $STR tip incoming 🎯", tip: "250 $STR" },
  { user: "chill99", msg: "how long have you been streaming?", tip: null },
  { user: "mango_live", msg: "2 hours deep and I'm not leaving", tip: null },
  { user: "vaultking", msg: "GIFT 🎁 x3 drops!", tip: "150 $STR" },
  { user: "ravencode", msg: "peaked at 2.4k viewers tonight!", tip: null },
];

const RECOMMENDED = [
  { title: "Midnight Lo-Fi Session", creator: "@chillwave", viewers: "834" },
  { title: "Tech Talk Live", creator: "@devcast_", viewers: "612" },
  { title: "Art Speedrun #22", creator: "@pixelboss", viewers: "1,204" },
];

export default function StreamPage() {
  const [showTip, setShowTip] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main — player + info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Player */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-accent/5" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&q=70')] bg-cover bg-center opacity-15" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                  <Radio className="w-8 h-8 text-primary/60" />
                </div>
                <p className="text-sm text-muted-foreground">Video Player</p>
              </div>

              {/* Overlays */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-destructive text-white border-0 gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
                </Badge>
                <div className="bg-black/60 backdrop-blur rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-white">
                  <Users className="w-3 h-3" /> 2,431
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-1"><div className="bg-white rounded-full h-full w-1/3" /></div>
                  <span className="text-xs text-white/70">LIVE</span>
                </div>
              </div>
            </div>

            {/* Stream info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0">S</div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Late Night Beats — Deep House Mix</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground font-medium">ShadowCreator</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">Music</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border" onClick={() => setFollowed(!followed)}>
                  <Heart className={`w-4 h-4 ${followed ? 'fill-destructive text-destructive' : ''}`} />
                  {followed ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => setShowTip(true)} className="gap-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  <Zap className="w-4 h-4" /> Tip
                </Button>
                <Button size="sm" onClick={() => setShowGift(true)} variant="outline" className="gap-2 rounded-xl border-chart-3/30 text-chart-3 hover:bg-chart-3/10">
                  <Gift className="w-4 h-4" /> Gift
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deep house session every Friday midnight. Requests open in chat — tip 100+ $STREAMING to pin your request. <span className="text-foreground">$STREAMING Tips</span> go directly to my CreatorVault.
              </p>
            </div>

            {/* Recommended */}
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Recommended Streams</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RECOMMENDED.map((r) => (
                  <div key={r.title} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                      <Radio className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground truncate">{r.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{r.creator}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Users className="w-3 h-3" />{r.viewers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="bg-card border border-border rounded-2xl flex flex-col h-[680px] lg:h-auto">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
              <Badge variant="secondary" className="text-xs">2,431</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {CHAT.map((c, i) => (
                <div key={i} className={`text-sm ${c.tip ? 'bg-accent/8 border border-accent/15 rounded-lg px-3 py-2' : ''}`}>
                  <span className="font-semibold text-primary text-xs">@{c.user}</span>
                  {c.tip && <span className="ml-1.5 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">{c.tip}</span>}
                  <p className="text-xs mt-0.5 text-muted-foreground">{c.msg}</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Say something..."
                  className="bg-secondary border-border text-xs h-8"
                />
                <Button size="sm" className="bg-primary shrink-0 h-8 w-8 p-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTip && <TipModal onClose={() => setShowTip(false)} />}
      {showGift && <GiftModal onClose={() => setShowGift(false)} />}
    </div>
  );
}