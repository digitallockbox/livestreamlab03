import { base44 } from "@/api/base44Client";
import { formatUptime, SESSION_START } from "./engineRegistry";

export const rtmpService = {
  // GET /rtmp/sessions → { sessions: [...] }
  async getSessions() {
    const streams = await base44.entities.Stream.filter({ status: "live" }, "-created_date", 50).catch(() => []);
    return {
      sessions: streams.map((s) => ({
        sid: (s.stream_key || s.id).slice(0, 8),
        ip: s.creator_wallet?.slice(0, 8) || "—",
        port: 1935,
        connectedAt: s.created_date,
        lastData: `${s.viewer_count || 0} viewers`,
        status: "active",
        streamId: s.id,
        title: s.title,
      })),
    };
  },

  // GET /rtmp/status → { engine, port, status, heartbeat, uptime, sessionCount }
  async getStatus() {
    const { sessions } = await this.getSessions();
    return {
      engine: "rtmp",
      port: 1935,
      status: "online",
      heartbeat: "OK",
      uptime: formatUptime(Date.now() - SESSION_START),
      sessionCount: sessions.length,
    };
  },
};