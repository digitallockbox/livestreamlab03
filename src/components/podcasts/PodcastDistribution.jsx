import React, { useState } from "react";
import { Share2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PodcastDistribution() {
  const [feeds] = useState([
    { platform: "Apple Podcasts", status: "active", listeners: "2.4M", updated: "2 hours ago" },
    { platform: "Spotify", status: "active", listeners: "1.8M", updated: "2 hours ago" },
    { platform: "Google Podcasts", status: "active", listeners: "890k", updated: "3 hours ago" },
    { platform: "Amazon Music", status: "pending", listeners: "—", updated: "Waiting for sync" },
    { platform: "YouTube Music", status: "inactive", listeners: "—", updated: "Not configured" },
    { platform: "iHeartRadio", status: "inactive", listeners: "—", updated: "Not configured" },
  ]);

  const getStatusIcon = (status) => {
    if (status === "active") return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (status === "pending") return <Clock className="w-5 h-5 text-chart-3" />;
    return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusColor = (status) => {
    if (status === "active") return "bg-accent/5 border-accent/20";
    if (status === "pending") return "bg-chart-3/5 border-chart-3/20";
    return "bg-secondary border-border";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Podcast Distribution</h3>
      </div>

      {/* RSS Feed Info */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your RSS Feed</p>
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <code className="text-xs text-foreground font-mono flex-1 truncate">
            https://feeds.livestreamlab.live/podcast/creator-name
          </code>
          <button className="text-primary hover:text-primary/80 text-xs font-medium">Copy</button>
        </div>
      </div>

      {/* Distribution Platforms */}
      <div className="space-y-2">
        {feeds.map(feed => (
          <div key={feed.platform} className={`flex items-center gap-4 p-4 rounded-lg border ${getStatusColor(feed.status)}`}>
            {getStatusIcon(feed.status)}
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{feed.platform}</p>
              <p className="text-xs text-muted-foreground">{feed.updated}</p>
            </div>
            {feed.listeners !== "—" && (
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">{feed.listeners}</p>
                <p className="text-[10px] text-muted-foreground">listeners</p>
              </div>
            )}
            <Badge
              variant="outline"
              className={`text-xs ${
                feed.status === "active"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : feed.status === "pending"
                  ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {feed.status === "active" && "Synced"}
              {feed.status === "pending" && "Pending"}
              {feed.status === "inactive" && "Inactive"}
            </Badge>
          </div>
        ))}
      </div>

      {/* Submission Guide */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-2">Auto-Syndication</p>
        <p className="text-xs text-muted-foreground">Your podcast is automatically submitted to major directories. New episodes publish within 2 hours of upload.</p>
      </div>
    </div>
  );
}