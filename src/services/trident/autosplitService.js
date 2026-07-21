import { base44 } from "@/api/base44Client";
import { formatUptime, SESSION_START } from "./engineRegistry";

export const autosplitService = {
  // GET /autosplit/routes → { routes: [{ input, outputs }] }
  async getRoutes() {
    const streams = await base44.entities.Stream.filter({ status: "live" }, "-created_date", 20).catch(() => []);
    return {
      routes: streams.map((s) => ({
        input: `rtmp://node/live/${s.stream_key || s.id}`,
        streamId: s.id,
        title: s.title,
        outputs: [
          { type: "hls", path: `/hls/${s.id}/index.m3u8`, status: "active" },
          { type: "snapshot", path: `/snapshots/${s.id}.jpg`, status: "active" },
        ],
      })),
    };
  },

  // GET /autosplit/status → { engine, port, status, workers, activeStreams, heartbeat }
  async getStatus() {
    const { routes } = await this.getRoutes();
    return {
      engine: "autosplit",
      port: 8790,
      status: "online",
      workers: 4,
      activeStreams: routes.length,
      heartbeat: "OK",
      uptime: formatUptime(Date.now() - SESSION_START),
    };
  },

  async getWorkers() {
    return [
      { id: "worker-1", load: 35, status: "active" },
      { id: "worker-2", load: 28, status: "active" },
    ];
  },
};