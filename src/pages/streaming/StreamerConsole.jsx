import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Zap, Settings, Mic, MicOff, Camera, CameraOff, MonitorOff, Send } from "lucide-react";

export default function StreamerConsole() {
  return (
    <div className="p-4 lg:p-6 h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-destructive text-destructive-foreground border-0 gap-1.5 animate-pulse">
            <Radio className="w-3 h-3" /> LIVE
          </Badge>
          <span className="font-display font-semibold text-foreground">Friday Night Gaming</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">2,431</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">$127.50</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Video Preview */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="flex-1 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Live Preview</p>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center gap-3 p-4 border-t border-border">
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
              <Mic className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
              <Camera className="w-5 h-5" />
            </Button>
            <Button className="bg-destructive hover:bg-destructive/90 rounded-full px-6 h-12 font-semibold gap-2">
              <MonitorOff className="w-5 h-5" /> End Stream
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Chat + Tips */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Chat */}
          <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { user: "viewer123", msg: "Great stream! 🔥" },
                { user: "superfan", msg: "Tipping 50 $STREAMING!", color: "text-accent" },
                { user: "newuser", msg: "First time here, love it" },
                { user: "gamer_pro", msg: "What setup are you using?" },
                { user: "music_lover", msg: "The audio quality is amazing" },
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

          {/* Tips Panel */}
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="font-display font-semibold text-sm text-foreground">$STREAMING Tips</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[10, 50, 100, 500].map((amount) => (
                <Button key={amount} variant="outline" className="border-accent/20 hover:bg-accent/10 text-accent text-sm">
                  {amount} $S
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}