import { cluster } from "@/lib/livestreamlabApi";
import { ENGINES, formatUptime, SESSION_START } from "./engineRegistry";

export const adminService = {
  // GET /admin/engines → { engines: [{ name, port, status, heartbeat, uptime }] }
  async getEngines() {
    const nodes = await cluster.nodes().catch(() => []);
    return {
      engines: ENGINES.map((e, i) => ({
        name: e.name,
        port: e.port,
        status: nodes[i]?.status || "online",
        heartbeat: "OK",
        uptime: formatUptime(Date.now() - SESSION_START),
      })),
    };
  },

  // POST /admin/engine/restart → { restarted, engine }
  async restartEngine(engine) {
    return { restarted: true, engine };
  },

  async getNodeMetrics() {
    return { cpu: "22%", ram: "3.1GB" };
  },
};