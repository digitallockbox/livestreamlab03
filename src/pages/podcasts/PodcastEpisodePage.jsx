import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Zap, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function PodcastEpisodePage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-8">
        {/* Episode Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Play className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Ep 14: Creator Economy</h1>
          <p className="text-muted-foreground mt-1">The Stream Show</p>
        </div>

        {/* Player */}
        <div className="bg-secondary/50 rounded-2xl border border-border p-6 mb-8">
          <Slider defaultValue={[35]} max={100} className="mb-4" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>15:42</span>
            <span>45:00</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon"><SkipBack className="w-5 h-5" /></Button>
            <Button size="icon" className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90">
              <Play className="w-6 h-6 text-primary-foreground" />
            </Button>
            <Button variant="ghost" size="icon"><SkipForward className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* Boost */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-5 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">Boost this Episode</p>
              <p className="text-xs text-muted-foreground">Support the creator with $STREAMING</p>
            </div>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Zap className="w-4 h-4" /> Boost
          </Button>
        </div>

        {/* Show Notes */}
        <div>
          <h3 className="font-display font-semibold text-foreground mb-3">Show Notes</h3>
          <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>In this episode, we dive deep into the creator economy and what it means for independent creators in 2026.</p>
            <p>Topics covered:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The rise of sovereign creator platforms</li>
              <li>How $STREAMING is changing monetization</li>
              <li>Building a sustainable creator business</li>
              <li>Community-driven growth strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}