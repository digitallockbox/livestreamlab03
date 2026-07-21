import { base44 } from "@/api/base44Client";

export const storageService = {
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