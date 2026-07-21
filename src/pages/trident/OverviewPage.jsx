import React from "react";
import { Loader2 } from "lucide-react";
import EngineCard from "@/components/trident/overview/EngineCard";
import NodeHealthCard from "@/components/trident/overview/NodeHealthCard";
import { useEngineStatus } from "@/state/trident/useTridentStores";

export default function OverviewPage() {
  const { data: engines, loading } = useEngineStatus();
  if (loading || !engines) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Engine Overview</h2>
      <NodeHealthCard engines={engines} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {engines.map((e) => <EngineCard key={e.name} engine={e} />)}
      </div>
    </div>
  );
}