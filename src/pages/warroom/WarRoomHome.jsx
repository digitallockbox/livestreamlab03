import React from "react";
import { Shield, Zap, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/StatCard";

export default function WarRoomHome() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-bold text-foreground">War Room</h1>
            <Badge className="bg-accent/10 text-accent border-0">LIVE</Badge>
          </div>
          <p className="text-muted-foreground">$STREAMING token command center.</p>
        </div>
        <Button variant="outline" className="gap-2 border-border hover:bg-secondary"><RefreshCw className="w-4 h-4" /> Sync Now</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="$STREAMING Balance" value="12,480" icon={Zap} accent />
        <StatCard title="Pending Claims" value="3" icon={Shield} />
        <StatCard title="Cycle Progress" value="68%" icon={Activity} />
        <StatCard title="Next Payout" value="Apr 15" icon={Zap} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Active Streams</h3>
          <div className="space-y-3">
            {["Main Gaming Stream", "Podcast Live Q&A"].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-sm text-foreground">{s}</span>
                </div>
                <span className="text-xs text-muted-foreground">LIVE</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Token Activity</h3>
          <div className="space-y-3">
            {[
              { label: "Stream tip received", amount: "+120 $STREAMING" },
              { label: "Video unlock", amount: "+80 $STREAMING" },
              { label: "Affiliate bonus", amount: "+200 $STREAMING" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm text-muted-foreground">{a.label}</span>
                <span className="text-sm text-accent font-medium">{a.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}