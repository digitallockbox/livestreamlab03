import React from "react";
import { Download, Film } from "lucide-react";

export default function SegmentList({ segments }) {
  if (!segments || segments.length === 0) return null;
  return (
    <div>
      <h3 className="font-display font-semibold mb-2">Segments</h3>
      <div className="space-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
            <Film className="w-4 h-4 text-muted-foreground" />
            <span className="truncate flex-1">{s.label}</span>
            <span className="text-xs text-muted-foreground">{s.duration}m</span>
            <a href={s.url} target="_blank" rel="noreferrer" className="text-primary"><Download className="w-4 h-4" /></a>
          </div>
        ))}
      </div>
    </div>
  );
}