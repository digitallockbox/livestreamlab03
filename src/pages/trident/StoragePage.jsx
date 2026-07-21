import React from "react";
import { Loader2, Database } from "lucide-react";
import SnapshotGallery from "@/components/trident/storage/SnapshotGallery";
import SegmentList from "@/components/trident/storage/SegmentList";
import { useStorageData } from "@/state/trident/useTridentStores";

export default function StoragePage() {
  const { data, loading } = useStorageData();
  if (loading || !data) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Storage Viewer</h2>
      <div className="grid grid-cols-3 gap-3 max-w-md">
        <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Snapshots</p><p className="font-display font-bold">{data.snapshots.length}</p></div>
        <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Segments</p><p className="font-display font-bold">{data.segments.length}</p></div>
        <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Items</p><p className="font-display font-bold">{data.storageUsed}</p></div>
      </div>
      <SnapshotGallery snapshots={data.snapshots} />
      <SegmentList segments={data.segments} />
    </div>
  );
}