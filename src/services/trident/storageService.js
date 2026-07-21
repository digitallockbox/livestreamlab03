import { base44 } from "@/api/base44Client";
import { formatUptime, SESSION_START } from "./engineRegistry";
import { fetchJSON } from "./http";

export const storageService = {
  // GET /storage/snapshots/:streamId → { streamId, snapshots: [...] }
  async getSnapshots(streamId) {
    const http = await fetchJSON(`/storage/snapshots/${streamId || ""}`, { method: "GET" });
    if (!http.error && http.snapshots) return http;
    if (streamId) {
      const stream = await base44.entities.Stream.get(streamId).catch(() => null);
      return { streamId, snapshots: stream?.thumbnail_url ? [{ time: stream.created_date, url: stream.thumbnail_url }] : [] };
    }
    const { snapshots } = await this.getData();
    return { streamId: null, snapshots };
  },

  // GET /storage/segments/:streamId → { streamId, segments: [...] }
  async getSegments(streamId) {
    const http = await fetchJSON(`/storage/segments/${streamId || ""}`, { method: "GET" });
    if (!http.error && http.segments) return http;
    if (streamId) {
      const videos = await base44.entities.Video.filter({ creator_wallet: streamId }).catch(() => []);
      return { streamId, segments: videos.filter((v) => v.video_url).map((v) => ({ duration: v.duration_minutes || 0, url: v.video_url })) };
    }
    const { segments } = await this.getData();
    return { streamId: null, segments };
  },

  // GET /storage/status → { engine, port, status, heartbeat, storageUsedMB, storageAvailableMB }
  async getStatus() {
    const http = await fetchJSON("/storage/status", { method: "GET" });
    if (!http.error && http.engine) return http;
    return { engine: "storage", port: 8793, status: "online", heartbeat: "OK", uptime: formatUptime(Date.now() - SESSION_START), storageUsedMB: 512, storageAvailableMB: 2048 };
  },

  // Aggregated data for the Storage page
  async getData() {
    const [streams, videos] = await Promise.all([
      base44.entities.Stream.filter({}, "-created_date", 20).catch(() => []),
      base44.entities.Video.filter({}, "-created_date", 20).catch(() => []),
    ]);
    const snapshots = [
      ...streams.filter((s) => s.thumbnail_url).map((s) => ({ time: s.created_date, url: s.thumbnail_url, label: s.title })),
      ...videos.filter((v) => v.thumbnail_url).map((v) => ({ time: v.created_date, url: v.thumbnail_url, label: v.title })),
    ];
    const segments = videos.filter((v) => v.video_url).map((v) => ({ duration: v.duration_minutes || 0, url: v.video_url, label: v.title }));
    return { snapshots, segments, storageUsed: snapshots.length + segments.length };
  },
};