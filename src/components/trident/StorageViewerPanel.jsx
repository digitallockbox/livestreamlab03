import React from "react";
import { Loader2, Database, Download, Film } from "lucide-react";
import { useStorageData } from "@/lib/tridentControlPlane";

export default function StorageViewerPanel() {
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
      {data.snapshots.length > 0 && (
        <div>
          <h3 className="font-display font-semibold mb-2">Snapshots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.snapshots.map((s, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <img src={s.url} alt={s.label} className="w-full h-24 object-cover" loading="lazy" />
                <p className="text-xs p-2 truncate">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.segments.length > 0 && (
        <div>
          <h3 className="font-display font-semibold mb-2">Segments</h3>
          <div className="space-y-1">
            {data.segments.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                <Film className="w-4 h-4 text-muted-foreground" />
                <span className="truncate flex-1">{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.duration}m</span>
                <a href={s.url} target="_blank" rel="noreferrer" className="text-primary"><Download className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}