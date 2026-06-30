import React from "react";
import { Link } from "react-router-dom";
import { Radio, Users, Clock } from "lucide-react";

export default function StreamCard({ stream }) {
  const isLive = stream.status === "live";
  return (
    <Link
      to={`/streams/${stream.id}/analytics`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
    >
      <div className="relative aspect-video bg-muted">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Radio className="w-8 h-8" />
          </div>
        )}
        {isLive ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/80 text-foreground text-xs font-medium capitalize">
            {stream.status || "ended"}
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {stream.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{(stream.creator_wallet || "").slice(0, 8)}…</span>
          {typeof stream.viewer_count === "number" && (
            <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {stream.viewer_count}</span>
          )}
          {typeof stream.duration_minutes === "number" && stream.duration_minutes > 0 && (
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {stream.duration_minutes}m</span>
          )}
        </div>
      </div>
    </Link>
  );
}