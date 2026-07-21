import { base44 } from "@/api/base44Client";

export const tenantsService = {
  async getTenants() {
    const [domains, streams] = await Promise.all([
      base44.entities.Domain.filter({}, "-created_date", 100).catch(() => []),
      base44.entities.Stream.filter({}, "-created_date", 100).catch(() => []),
    ]);
    return domains.map((d) => ({
      name: (d.domain || "").split(".")[0] || "Unknown",
      domain: d.domain,
      wallet: d.wallet,
      streams: streams.filter((s) => s.creator_wallet === d.wallet).length,
      chain: d.chain,
      status: d.status,
    }));
  },
};