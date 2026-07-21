import React from "react";

export default function SnapshotGallery({ snapshots }) {
  if (!snapshots || snapshots.length === 0) return null;
  return (
    <div>
      <h3 className="font-display font-semibold mb-2">Snapshots</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {snapshots.map((s, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <img src={s.url} alt={s.label} className="w-full h-24 object-cover" loading="lazy" />
            <p className="text-xs p-2 truncate">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}