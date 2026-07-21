import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HardDrive, AlertCircle, Film, Camera, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { storageService } from "@/services/trident/storageService";

export default function StorageSegmentTimeline({ defaultStreamId = "stream1" }) {
  const [streamId, setStreamId] = useState(defaultStreamId);
  const [segments, setSegments] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSeg, setSelectedSeg] = useState(null);
  const [snapshotPreview, setSnapshotPreview] = useState(null);
  const [scrubberPos, setScrubberPos] = useState(0);

  const timelineRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [segRes, snapRes, statRes] = await Promise.all([
        storageService.getSegments(streamId),
        storageService.getSnapshots(streamId),
        storageService.getStatus(),
      ]);
      setSegments(segRes.segments || []);
      setSnapshots(snapRes.snapshots || []);
      setStatus(statRes);
      setError("");
      setScrubberPos(0);
      setSelectedSeg(null);
    } catch {
      setError("Failed to fetch storage data.");
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => { load(); }, [load]);

  // Compute cumulative durations for positioning
  const totalDuration = segments.reduce((a, s) => a + (s.duration || 0), 0);
  const segPositions = [];
  let acc = 0;
  segments.forEach((s, i) => {
    const dur = s.duration || 0;
    segPositions.push({ start: acc, end: acc + dur, index: i, seg: s });
    acc += dur;
  });

  // Convert snapshot timestamps to timeline positions
  const snapshotPositions = snapshots.map((snap) => {
    if (snap.time && totalDuration > 0) {
      const t = new Date(snap.time).getTime();
      const ratio = Math.min(1, Math.max(0, t % 1000000 / 1000000));
      return { ...snap, pos: ratio * totalDuration };
    }
    return { ...snap, pos: Math.random() * totalDuration };
  });

  const handleScrubber = (e) => {
    if (!timelineRef.current || totalDuration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
    const ratio = x / rect.width;
    const time = ratio * totalDuration;
    setScrubberPos(time);
    // Snap to nearest segment
    const nearest = segPositions.reduce((closest, sp) => {
      return Math.abs(sp.start + (sp.end - sp.start) / 2 - time) < Math.abs(closest.start + (closest.end - closest.start) / 2 - time) ? sp : closest;
    }, segPositions[0]);
    if (nearest) setSelectedSeg({ index: nearest.index, ...nearest.seg });
  };

  const usedMB = status?.storageUsedMB || 0;
  const availMB = status?.storageAvailableMB || 0;
  const totalMB = usedMB + availMB;
  const usedPct = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Film className="w-5 h-5 text-primary" /> Storage Segment Timeline
      </h2>

      {/* Storage Status Header */}
      {status && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-4 text-sm">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.status === "online" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.status === "online" ? "bg-accent animate-pulse" : "bg-destructive"}`} />
                {status.status?.toUpperCase() || "—"}
              </span>
              <div><span className="text-muted-foreground">Engine: </span><span className="font-medium">{status.engine}</span></div>
            </div>
            <div className="text-sm text-muted-foreground">
              <HardDrive className="w-3.5 h-3.5 inline mr-1" />
              {usedMB.toLocaleString()} MB / {totalMB.toLocaleString()} MB
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{usedPct.toFixed(1)}% used · {availMB.toLocaleString()} MB available</p>
        </div>
      )}

      {/* Stream Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Stream</label>
        <input
          value={streamId}
          onChange={(e) => setStreamId(e.target.value)}
          placeholder="streamId"
          className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
        />
        <button onClick={load} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">Reload</button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading timeline…</p>
      ) : segments.length === 0 ? (
        <div className="py-12 text-center">
          <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No segments available.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{segments.length} segments · {totalDuration.toFixed(1)}s total</span>
            <span>Scrubber: {scrubberPos.toFixed(1)}s</span>
          </div>

          {/* Timeline Track */}
          <div
            ref={timelineRef}
            className="relative h-16 rounded-lg bg-muted overflow-hidden cursor-pointer select-none"
            onMouseDown={handleScrubber}
          >
            {/* Segment bars */}
            <div className="absolute inset-0 flex">
              {segPositions.map((sp) => {
                const widthPct = totalDuration > 0 ? ((sp.end - sp.start) / totalDuration) * 100 : 100 / segments.length;
                const isSel = selectedSeg && sp.index === selectedSeg.index;
                return (
                  <div
                    key={sp.index}
                    onClick={(e) => { e.stopPropagation(); setSelectedSeg({ index: sp.index, ...sp.seg }); setScrubberPos(sp.start + (sp.end - sp.start) / 2); }}
                    title={`${sp.seg.label || sp.seg.url || "segment-" + sp.index} · ${(sp.seg.duration || 0).toFixed(1)}s`}
                    className={`h-full border-r border-border/50 transition-colors ${isSel ? "bg-primary" : "bg-primary/30 hover:bg-primary/50"}`}
                    style={{ width: `${widthPct}%` }}
                  />
                );
              })}
            </div>

            {/* Snapshot markers */}
            {snapshotPositions.map((snap, i) => {
              const leftPct = totalDuration > 0 ? (snap.pos / totalDuration) * 100 : 0;
              return (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSnapshotPreview(snap); }}
                  title={snap.label || "Snapshot"}
                  className="absolute top-0 -translate-x-1/2 z-10 text-yellow-500 hover:text-yellow-600"
                  style={{ left: `${leftPct}%` }}
                >
                  <Camera className="w-4 h-4" />
                </button>
              );
            })}

            {/* Scrubber handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground z-20 pointer-events-none"
              style={{ left: `${totalDuration > 0 ? (scrubberPos / totalDuration) * 100 : 0}%` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-card shadow" />
            </div>
          </div>

          {/* Timeline nav */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => {
                const idx = selectedSeg?.index ?? 0;
                const next = Math.max(0, idx - 1);
                const sp = segPositions[next];
                if (sp) { setSelectedSeg({ index: next, ...sp.seg }); setScrubberPos(sp.start + (sp.end - sp.start) / 2); }
              }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => {
                const idx = selectedSeg?.index ?? -1;
                const next = Math.min(segments.length - 1, idx + 1);
                const sp = segPositions[next];
                if (sp) { setSelectedSeg({ index: next, ...sp.seg }); setScrubberPos(sp.start + (sp.end - sp.start) / 2); }
              }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Segment Detail Panel */}
      {selectedSeg && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm inline-flex items-center gap-1.5">
              <Film className="w-4 h-4 text-primary" /> Segment #{selectedSeg.index}
            </h3>
            <button onClick={() => setSelectedSeg(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">File Name</p>
              <p className="font-mono text-xs truncate">{selectedSeg.label || `segment-${selectedSeg.index}.ts`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{(selectedSeg.duration || 0).toFixed(1)}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">URL</p>
              <p className="font-mono text-xs truncate">{selectedSeg.url || "—"}</p>
            </div>
          </div>
          {selectedSeg.url && (
            <a
              href={selectedSeg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            >
              <Download className="w-4 h-4" /> Download Segment
            </a>
          )}
        </div>
      )}

      {/* Snapshot Preview Modal */}
      <Dialog open={!!snapshotPreview} onOpenChange={(open) => { if (!open) setSnapshotPreview(null); }}>
        <DialogContent className="sm:max-w-md">
          {snapshotPreview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-yellow-500" />
                  {snapshotPreview.label || "Snapshot"}
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                {snapshotPreview.url ? (
                  <img src={snapshotPreview.url} alt={snapshotPreview.label || "Snapshot"} className="w-full rounded-lg" />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {snapshotPreview.time && (
                  <p className="text-xs text-muted-foreground mt-2">{new Date(snapshotPreview.time).toLocaleString()}</p>
                )}
              </div>
              <DialogFooter>
                <a
                  href={snapshotPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 w-full justify-center"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}