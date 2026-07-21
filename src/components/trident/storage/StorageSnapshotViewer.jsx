import React, { useState, useEffect } from "react";
import {
  Database, Film, Download, Loader2, AlertCircle, X, Clock, HardDrive,
} from "lucide-react";
import { storageService } from "@/services/trident/storageService";
import { base44 } from "@/api/base44Client";

export default function StorageSnapshotViewer({ defaultStreamId = "stream1" }) {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(defaultStreamId);
  const [snapshots, setSnapshots] = useState([]);
  const [segments, setSegments] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  // Fetch available stream IDs for the dropdown
  useEffect(() => {
    base44.entities.Stream.filter({ status: "live" }, "-created_date", 50)
      .then((s) => {
        const ids = s.map((st) => st.id);
        if (ids.length > 0) {
          setStreams(ids);
          setSelectedStream(ids[0]);
        } else {
          setStreams([defaultStreamId]);
          setSelectedStream(defaultStreamId);
        }
      })
      .catch(() => {
        setStreams([defaultStreamId]);
        setSelectedStream(defaultStreamId);
      });
  }, [defaultStreamId]);

  // Fetch per-stream snapshots, segments, and engine status
  useEffect(() => {
    if (!selectedStream) return;
    setLoading(true);
    setError("");
    Promise.all([
      storageService.getSnapshots(selectedStream),
      storageService.getSegments(selectedStream),
      storageService.getStatus(),
    ])
      .then(([snapRes, segRes, statRes]) => {
        setSnapshots(snapRes.snapshots || []);
        setSegments(segRes.segments || []);
        setStatus(statRes);
        setActiveIdx(0);
      })
      .catch(() => setError("Failed to load storage data for this stream."))
      .finally(() => setLoading(false));
  }, [selectedStream]);

  const used = status?.storageUsedMB || 0;
  const available = status?.storageAvailableMB || 0;
  const total = used + available;
  const pct = total > 0 ? (used / total) * 100 : 0;

  // Timeline positions
  const times = snapshots.map((s) => new Date(s.time).getTime()).filter((t) => !isNaN(t));
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  const span = maxTime - minTime || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" /> Storage Snapshot Viewer
      </h2>

      {/* Stream Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Stream</label>
        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
        >
          {streams.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {/* Storage Status Panel */}
      {status && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Storage Status</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${status.status === "online" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
              {status.status}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{used} MB used</span>
            <span>{available} MB available</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{pct.toFixed(1)}% of {total} MB used</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Timeline Scrubber */}
          {snapshots.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display font-semibold text-sm mb-3 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Timeline
              </h3>
              <div className="relative h-12 flex items-center">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-border" />
                {snapshots.map((s, i) => {
                  const t = new Date(s.time).getTime();
                  const pos = isNaN(t) ? 0 : ((t - minTime) / span) * 100;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      style={{ left: `${pos}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${
                        i === activeIdx
                          ? "bg-primary border-primary scale-125"
                          : "bg-card border-muted-foreground hover:border-primary"
                      }`}
                      title={s.time ? new Date(s.time).toLocaleString() : `Snapshot ${i + 1}`}
                    />
                  );
                })}
              </div>
              {snapshots[activeIdx]?.time && (
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {new Date(snapshots[activeIdx].time).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Snapshot Gallery */}
          <div>
            <h3 className="font-display font-semibold mb-2">Snapshots</h3>
            {snapshots.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No snapshots available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {snapshots.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`rounded-lg border overflow-hidden text-left transition-all ${
                      i === activeIdx ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="aspect-video bg-muted">
                      {s.url ? (
                        <img src={s.url} alt={`Snapshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Database className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground">
                        {s.time ? new Date(s.time).toLocaleTimeString() : `#${i + 1}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Segment List */}
          <div>
            <h3 className="font-display font-semibold mb-2">HLS Segments</h3>
            {segments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <Film className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">No segments available.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {segments.map((s, i) => {
                  const fileName = s.url?.split("/").pop() || `seg-${String(i + 1).padStart(3, "0")}.ts`;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                      <Film className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs truncate">{fileName}</p>
                        <p className="text-xs text-muted-foreground">{s.duration}s</p>
                      </div>
                      <a
                        href={s.url}
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/15 text-primary text-xs hover:bg-primary/25 whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Snapshot Preview Modal */}
      {snapshots[activeIdx] && (
        <div
          onClick={() => setActiveIdx(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveIdx(null)}
              className="absolute -top-10 right-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            {snapshots[activeIdx].url ? (
              <img
                src={snapshots[activeIdx].url}
                alt="Snapshot preview"
                className="w-full rounded-lg max-h-[80vh] object-contain"
              />
            ) : (
              <div className="w-full h-64 bg-card rounded-lg flex items-center justify-center text-muted-foreground">
                <Database className="w-12 h-12" />
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground mt-3">
              {snapshots[activeIdx].time ? new Date(snapshots[activeIdx].time).toLocaleString() : `Snapshot ${activeIdx + 1}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}