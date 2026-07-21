import React from "react";
import { Link } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
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
      <Link to="/trident/engines" className="text-primary hover:underline text-sm inline-flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" /> Open Engine Overview Dashboard →
      </Link>
    </div>
  );
}