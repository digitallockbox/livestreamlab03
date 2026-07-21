import React from "react";
import { useEngineStatus } from "@/state/trident/useTridentStores";

export default function EngineStatusMini() {
  const { data: engines } = useEngineStatus();
  const online = (engines || []).filter((e) => e.status === "online").length;
  const total = engines?.length || 7;
  return (
    <div>
      <p className="text-xs text-muted-foreground">Engines</p>
      <p className="font-display font-bold">{online}/{total} Online</p>
      <div className="flex gap-0.5 mt-1">
        {(engines || []).map((e, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${e.status === "online" ? "bg-accent" : "bg-destructive"}`} />
        ))}
      </div>
    </div>
  );
}