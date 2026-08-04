import { useIdentity } from "@/lib/web3/identity";
import { useCreator } from "@/hooks/web3/useCreator";

// useTridentRouting — authenticated bridge to the Trident gateway.
// Every call goes through the tridentProxy backend function, which verifies
// your wallet JWT (CREATOR_JWT_SECRET) and forwards to api.livestreamlab.live
// with X-Wallet-Address / X-Wallet-Chain / X-Domain headers. No raw fetch,
// no fake wallet, no client-side encoder — the gateway derives routing from
// the signed identity the proxy already attached.
const TENANT_ID = "livestreamlab.live";

export function useTridentRouting() {
  const { signedInvoke, walletAddress } = useIdentity();
  const { refresh } = useCreator();

  // 1. Register tenant for this wallet (idempotent on the gateway).
  async function registerTenant() {
    if (!walletAddress) throw new Error("Wallet not connected");
    return await signedInvoke("tridentProxy", {
      method: "POST",
      path: "/api/tenant/register",
      body: { tenantId: TENANT_ID, wallet: walletAddress },
    });
  }

  // 2. Discover engines for this tenant.
  async function getEngines() {
    return await signedInvoke("tridentProxy", {
      method: "GET",
      path: `/api/engines?tenant=${encodeURIComponent(TENANT_ID)}`,
    });
  }

  // 3. Request a stream route from the gateway.
  async function routeStream(streamId, engineType = "compute") {
    if (!walletAddress || !streamId) throw new Error("Wallet and streamId required");
    return await signedInvoke("tridentProxy", {
      method: "POST",
      path: "/api/route",
      body: {
        tenant: TENANT_ID,
        engineType,
        streamId,
        nonce: Date.now().toString(),
        wallet: walletAddress,
      },
    });
  }

  // 4. Route + refresh creator profile so connection/broadcast state updates.
  async function startStream(streamId, engineType = "compute") {
    const route = await routeStream(streamId, engineType);
    await refresh?.();
    return route; // { node, gpuIndex, engineId, rtmpUrl, ingestUrl }
  }

  return { registerTenant, getEngines, routeStream, startStream };
}