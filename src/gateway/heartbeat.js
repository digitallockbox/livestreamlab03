import { createTraceId, attachTrace } from "./trace.js";
import { broadcastLog } from "./logServer.js";

const engineState = {};

export function initHeartbeat(engine, instances) {
  if (!engineState[engine]) {
    engineState[engine] = instances.map(url => ({
      url,
      healthy: true,
      score: 100,
      lastCheck: null
    }));
  }
}

async function checkInstance(engine, instanceObj) {
  const traceId = createTraceId();

  try {
    const res = await fetch(`${instanceObj.url}/health`, {
      headers: attachTrace({}, traceId)
    });

    instanceObj.lastCheck = Date.now();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // SUCCESS
    instanceObj.score = Math.min(100, instanceObj.score + 10);
    instanceObj.healthy = true;

    broadcastLog(engine, `[${traceId}] HEARTBEAT OK ${instanceObj.url}`);

  } catch (err) {
    instanceObj.lastCheck = Date.now();

    // FAILURE
    instanceObj.score = Math.max(0, instanceObj.score - 25);

    broadcastLog(engine, `[${traceId}] HEARTBEAT FAIL ${instanceObj.url} (${err.message})`);

    if (instanceObj.score <= 30) {
      instanceObj.healthy = false;
      broadcastLog(engine, `[${traceId}] QUARANTINE ${instanceObj.url}`);
    }
  }
}

export function startHeartbeatMonitor() {
  setInterval(async () => {
    for (const engine of Object.keys(engineState)) {
      for (const instanceObj of engineState[engine]) {
        await checkInstance(engine, instanceObj);

        // Auto‑reintroduce if recovered
        if (!instanceObj.healthy && instanceObj.score >= 70) {
          instanceObj.healthy = true;
          broadcastLog(engine, `[${createTraceId()}] REINTRODUCE ${instanceObj.url}`);
        }
      }
    }
  }, 5000);
}

export function getHealthyInstances(engine) {
  return engineState[engine].filter(i => i.healthy).map(i => i.url);
}
