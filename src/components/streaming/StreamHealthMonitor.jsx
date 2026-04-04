import React from "react";
import { AlertCircle, TrendingUp, Zap, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StreamHealthMonitor({ streamData }) {
  const metrics = [
    { label: "Bitrate", value: streamData?.bitrate || "0 Mbps", status: streamData?.bitrate > 4 ? "good" : "warning" },
    { label: "Frame Rate", value: streamData?.framerate || "0 fps", status: streamData?.framerate >= 30 ? "good" : "warning" },
    { label: "Dropped Frames", value: streamData?.droppedFrames || "0", status: streamData?.droppedFrames === 0 ? "good" : "bad" },
    { label: "Latency", value: streamData?.latency || "0ms", status: streamData?.latency < 3000 ? "good" : "warning" },
  ];

  const statusColors = {
    good: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    bad: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">Technical Health</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.label} className={`border rounded-xl p-3 ${statusColors[m.status]}`}>
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-sm font-mono font-semibold mt-1">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}