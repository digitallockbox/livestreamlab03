import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const claims = [
  { id: 1, title: "Stream Marathon Bonus", amount: 500, description: "Streamed 6+ hours in one session", status: "claimable" },
  { id: 2, title: "First Affiliate Sale", amount: 200, description: "Completed first affiliate conversion", status: "claimed" },
  { id: 3, title: "100 Video Views", amount: 100, description: "Reached 100 views on a single video", status: "claimable" },
  { id: 4, title: "5-Star Store Rating", amount: 150, description: "Received 5-star review on product", status: "pending" },
];

export default function ClaimCenter() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Claim Center</h1>
        <p className="text-muted-foreground mt-1">Claim your earned $STREAMING token rewards.</p>
      </div>
      <div className="space-y-3">
        {claims.map((claim) => (
          <div key={claim.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${claim.status === "claimable" ? "bg-accent/10" : "bg-muted"}`}>
                <Zap className={`w-5 h-5 ${claim.status === "claimable" ? "text-accent" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{claim.title}</p>
                <p className="text-xs text-muted-foreground">{claim.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-accent font-semibold text-sm">+{claim.amount} $STR</span>
              {claim.status === "claimable" ? (
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-8">Claim</Button>
              ) : (
                <Badge className={`border-0 text-xs ${claim.status === "claimed" ? "bg-muted text-muted-foreground" : "bg-chart-3/10 text-chart-3"}`}>{claim.status}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}