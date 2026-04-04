import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share2, Zap, MessageSquare } from "lucide-react";

export default function VideoPlayer() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Player */}
      <div className="aspect-video bg-card border border-border rounded-2xl overflow-hidden flex items-center justify-center mb-6">
        <Play className="w-16 h-16 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">How I Built My Setup</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-muted-foreground">12.3K views</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">2 days ago</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-xl"><Heart className="w-4 h-4" /> Like</Button>
            <Button variant="outline" className="gap-2 rounded-xl"><Share2 className="w-4 h-4" /> Share</Button>
            <Button className="gap-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
              <Zap className="w-4 h-4" /> Unlock with 50 $S
            </Button>
          </div>

          {/* Comments */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground">Comments</h3>
              <span className="text-sm text-muted-foreground">24</span>
            </div>
            <div className="space-y-4">
              {[
                { user: "creator_fan", comment: "This is exactly what I needed! Great tutorial.", time: "1h ago" },
                { user: "tech_enthusiast", comment: "What monitor are you using? Looks amazing.", time: "3h ago" },
                { user: "beginner_dev", comment: "Super helpful, thanks for sharing!", time: "5h ago" },
              ].map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{c.user[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">@{c.user}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <div>
          <h3 className="font-display font-semibold text-foreground mb-4">Related Videos</h3>
          <div className="space-y-3">
            {["Advanced Editing Tutorial", "Gear Review 2026", "Behind the Scenes"].map((title, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="w-28 aspect-video bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">1.2K views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}