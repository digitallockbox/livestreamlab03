import React from "react";
import { Link } from "react-router-dom";
import { Loader2, GitBranch, ExternalLink } from "lucide-react";
import AutosplitRoutingMap from "@/components/trident/autosplit/AutosplitRoutingMap";
import { useRoutingMap } from "@/state/trident/useTridentStores";

export default function AutosplitPage() {
  const { data: routes, loading } = useRoutingMap();
  if (loading && !routes) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> Autosplit Routing Map</h2>
      <AutosplitRoutingMap routes={routes || []} />
      <Link to="/trident/autosplit/workers" className="text-primary hover:underline text-sm inline-flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" /> Open Worker Load →
      </Link>
    </div>
  );
}