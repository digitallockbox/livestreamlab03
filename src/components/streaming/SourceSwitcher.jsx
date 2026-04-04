import React, { useState } from "react";
import { Video, Monitor, Radio, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCES = [
  { id: "camera", label: "Live Camera", icon: Video, active: true },
  { id: "screen", label: "Screen Share", icon: Monitor, active: false },
  { id: "prerecorded", label: "Pre-Recorded", icon: Radio, active: false },
];

export default function SourceSwitcher() {
  const [activeSource, setActiveSource] = useState("camera");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Video className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">Source Control</h3>
      </div>
      <div className="space-y-2">
        {SOURCES.map(source => {
          const Icon = source.icon;
          const isActive = activeSource === source.id;
          return (
            <button
              key={source.id}
              onClick={() => setActiveSource(source.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary"
                  : "bg-secondary border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{source.label}</span>
              </div>
              {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}