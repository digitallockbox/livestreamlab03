import { base44 } from "@/api/base44Client";

export const rtmpService = {
  async getLiveSessions() {
    const streams = await base44.entities.Stream.filter({ status: "live" }, "-created_date", 50).catch(() => []);
    return streams.map((s) => ({
      sid: (s.stream_key || s.id).slice(0, 8),
      streamId: s.id,
      title: s.title,
      ip: s.creator_wallet?.slice(0, 8) || "—",
      port: 1935,
      connectedAt: s.created_date,
      lastData: `${s.viewer_count || 0} viewers`,
      status: "active",
    }));
  },
  async endSession(streamId) {
    return base44.entities.Stream.update(streamId, { status: "ended" });
  },
};