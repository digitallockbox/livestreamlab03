import React from "react";
import { Loader2, GitBranch } from "lucide-react";
import AutosplitRoutingMap from "@/components/trident/autosplit/AutosplitRoutingMap";
import { useRoutingMap } from "@/state/trident/useTridentStores";

export default function AutosplitPage() {
  const { data: routes, loading } = useRoutingMap();
  if (loading && !routes) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> Autosplit Routing Map</h2>
      <AutosplitRoutingMap routes={routes || []} />
    </div>
  );
}