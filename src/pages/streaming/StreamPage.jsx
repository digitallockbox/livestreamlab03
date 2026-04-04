import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Heart, Gift, Zap, Send } from "lucide-react";

export default function StreamPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            <div className="aspect-video bg-card border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <Radio className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Video Player</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Friday Night Gaming</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-destructive text-destructive-foreground border-0 gap-1 text-xs">
                    <Radio className="w-3 h-3" /> LIVE
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" /> 2,431 viewers
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Heart className="w-4 h-4" /> Follow
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl text-accent border-accent/30 hover:bg-accent/10">
                  <Zap className="w-4 h-4" /> Tip
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl text-chart-3 border-chart-3/30 hover:bg-chart-3/10">
                  <Gift className="w-4 h-4" /> Gift
                </Button>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-card border border-border rounded-2xl flex flex-col h-[600px]">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { user: "viewer123", msg: "Great stream! 🔥" },
                { user: "superfan", msg: "Tipping 50 $STREAMING!", color: "text-accent" },
                { user: "newuser", msg: "First time here" },
                { user: "gamer_pro", msg: "What's your setup?" },
                { user: "music_lover", msg: "Audio is crisp" },
                { user: "tech_guy", msg: "What GPU are you running?" },
                { user: "chill_vibes", msg: "Perfect evening stream" },
              ].map((chat, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-primary">@{chat.user}</span>{" "}
                  <span className={chat.color || "text-foreground"}>{chat.msg}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input placeholder="Say something..." className="bg-secondary border-border text-sm" />
                <Button size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}