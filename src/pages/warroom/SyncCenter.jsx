import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const syncItems = [
  { label: "Stream earnings sync", status: "synced", time: "2 mins ago" },
  { label: "Store transactions sync", status: "synced", time: "5 mins ago" },
  { label: "Affiliate commissions sync", status: "pending", time: "Pending" },
  { label: "Video unlock revenue sync", status: "synced", time: "12 mins ago" },
  { label: "Podcast revenue sync", status: "error", time: "Failed" },
];

export default function SyncCenter() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Sync Center</h1>
          <p className="text-muted-foreground mt-1">Monitor real-time sync status for all revenue streams.</p>
        </div>
        <Button onClick={handleSync} className="bg-primary hover:bg-primary/90 gap-2">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing..." : "Sync All"}
        </Button>
      </div>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {syncItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              {item.status === "synced" ? <Check className="w-4 h-4 text-accent" /> : item.status === "pending" ? <Clock className="w-4 h-4 text-chart-3" /> : <RefreshCw className="w-4 h-4 text-destructive" />}
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{item.time}</span>
              <Badge className={`border-0 text-xs ${item.status === "synced" ? "bg-accent/10 text-accent" : item.status === "pending" ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive"}`}>{item.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}