import React from "react";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Zap } from "lucide-react";

const cycles = [
  { id: "APR-2026", status: "active", start: "Apr 1, 2026", end: "Apr 30, 2026", earned: 8800, progress: 68 },
  { id: "MAR-2026", status: "completed", start: "Mar 1, 2026", end: "Mar 31, 2026", earned: 7200, progress: 100 },
  { id: "FEB-2026", status: "completed", start: "Feb 1, 2026", end: "Feb 28, 2026", earned: 6100, progress: 100 },
];

export default function CycleVisibility() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Cycle Visibility</h1>
        <p className="text-muted-foreground mt-1">View and track all payout cycles.</p>
      </div>
      <div className="space-y-4">
        {cycles.map((cycle) => (
          <div key={cycle.id} className={`bg-card border rounded-2xl p-6 ${cycle.status === "active" ? "border-primary/30" : "border-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">Cycle {cycle.id}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="w-3 h-3" />{cycle.start} → {cycle.end}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-accent font-semibold">
                  <Zap className="w-4 h-4" />${cycle.earned.toLocaleString()}
                </div>
                <Badge className={`border-0 text-xs mt-1 ${cycle.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{cycle.status}</Badge>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${cycle.status === "active" ? "bg-primary" : "bg-accent"}`} style={{ width: `${cycle.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{cycle.progress}% of cycle complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}