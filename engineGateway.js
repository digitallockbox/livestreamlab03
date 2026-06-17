import { createTraceId, attachTrace } from "./trace";
import { markFailureAndMaybeRecover, markSuccess } from "./autoRecovery";
import { broadcastLog } from "./logServer";

async function callEngine(engine, path, options = {}, incomingTraceId = null) {
  const instances = ENGINES[engine];
  let lastError = null;

  // TRACE ID (generate or reuse)
  const traceId = incomingTraceId || createTraceId();

  // Inject trace header
  options.headers = attachTrace(options.headers || {}, traceId);

  broadcastLog(engine, `[${traceId}] REQUEST ${path}`);

  for (let instance of instances) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        broadcastLog(engine, `[${traceId}] RETRY attempt ${attempt}`);

        const res = await fetch(`${instance}${path}`, options);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // SUCCESS
        markSuccess(engine);
        broadcastLog(engine, `[${traceId}] SUCCESS ${path}`);

        return data;

      } catch (err) {
        lastError = err;
        broadcastLog(engine, `[${traceId}] FAIL ${path} (${err.message})`);
      }
    }

    // FAILOVER
    broadcastLog(engine, `[${traceId}] FAILOVER to next instance`);
  }

  // ALL INSTANCES FAILED → AUTO‑RECOVERY
  const instanceBaseUrl = instances[0].replace(/\/engine.*/, "");

  broadcastLog(engine, `[${traceId}] AUTO-RECOVERY triggered`);

  await markFailureAndMaybeRecover(
    engine,
    `${instanceBaseUrl}/admin/restart`
  );

  return { error: "engine_unreachable", detail: lastError?.message };
}
