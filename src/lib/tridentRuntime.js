// Trident Runtime — real engine dispatch via the tridentProxy backend bridge.
//
// Keeps the typed EngineRegistry / ComputePayload / ComputeResult shape, but
// executeCompute is NOT a local mock: it forwards to the tridentProxy function,
// which verifies the wallet JWT (CREATOR_JWT_SECRET) and calls
// api.livestreamlab.live with X-Wallet-Address / X-Domain headers. Results come
// from the real gateway, never invented client-side.

const DEFAULT_ENGINES = [
  "identity",
  "minting",
  "autosplit",
  "marketplace",
  "dashboard",
  "ingest",
  "playback",
];

/**
 * @typedef {Object} EngineRegistry
 * @property {string} engine
 * @property {string[]} routes
 * @property {string[]} compute
 */

/**
 * @typedef {Object} ComputePayload
 * @property {string} engine
 * @property {string} action
 * @property {string} tenantId
 * @property {Record<string, unknown>} data
 */

/**
 * @typedef {Object} ComputeResult
 * @property {ComputePayload} received
 * @property {"ok"|"error"} status
 * @property {Record<string, unknown>} [result]
 * @property {string} [error]
 * @property {number} timestamp
 */

const TENANT_ID = "livestreamlab.live";

export class Base44Runtime {
  /**
   * @param {(payload: object) => Promise<any>} invoke  signedInvoke bound to "tridentProxy"
   */
  constructor(invoke) {
    if (typeof invoke !== "function") {
      throw new Error("Base44Runtime requires a real invoke (signedInvoke) function");
    }
    this.invoke = invoke;
    this.registries = new Map();
    for (const eng of DEFAULT_ENGINES) {
      this.registerEngine({ engine: eng, routes: [`/${eng}/*`], compute: [] });
    }
  }

  /** @param {EngineRegistry} registry */
  registerEngine(registry) {
    this.registries.set(registry.engine, registry);
  }

  /** @param {string} path @returns {EngineRegistry|null} */
  resolveEngineByRoute(path) {
    for (const registry of this.registries.values()) {
      if (registry.routes.some((p) => path.startsWith(p.replace("/*", "")))) {
        return registry;
      }
    }
    return null;
  }

  /**
   * Dispatch a compute call to a real engine via tridentProxy.
   * @param {string} route        gateway path, e.g. "/ingest/route"
   * @param {Omit<ComputePayload, "engine">} payload
   * @returns {Promise<ComputeResult>}
   */
  async dispatch(route, payload) {
    const registry = this.resolveEngineByRoute(route);
    const fullPayload = {
      engine: registry?.engine || "unknown",
      action: payload.action,
      tenantId: payload.tenantId || TENANT_ID,
      data: payload.data || {},
    };

    try {
      const res = await this.invoke({
        method: "POST",
        path: route,
        body: fullPayload,
      });
      return {
        received: fullPayload,
        status: "ok",
        result: (res && res.data) ? res.data : res,
        timestamp: Date.now(),
      };
    } catch (err) {
      return {
        received: fullPayload,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        timestamp: Date.now(),
      };
    }
  }
}

export { TENANT_ID };