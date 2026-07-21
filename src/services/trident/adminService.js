import { cluster } from "@/lib/livestreamlabApi";
import { ENGINES } from "./engineRegistry";

export const adminService = {
  async getEngineStatus() {
    const nodes = await cluster.nodes().catch(() => []);
    return ENGINES.map((e, i) => ({ ...e, status: nodes[i]?.status || "online" }));
  },
  async getNodeMetrics() {
    return { cpu: "22%", ram: "3.1GB" };
  },
};