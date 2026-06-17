async function callEngine(engine, path, options = {}, incomingTraceId = null) {
  const instances = ENGINES[engine];
  let lastError = null;

  // TRACE ID
  const traceId = incomingTraceId || createTraceId();

  // Inject trace header
  options.headers = attachTrace(options.headers || {}, traceId);

  // METRICS + LOG
  recordRequest(engine);
  broadcastLog(engine, `[${traceId}] REQUEST ${path}`);

  for (let instanceIndex = 0; instanceIndex < instances.length; instanceIndex++) {
    const instance = instances[instanceIndex];

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        broadcastLog(engine, `[${traceId}] RETRY attempt ${attempt}`);

        const start = Date.now();
        const res = await fetch(`${instance}${path}`, options);
        const latency = Date.now() - start;

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // METRICS
        recordLatency(engine, latency);
        recordCacheMiss(engine);
        setBreakerState(engine, "closed");

        // LOG
        broadcastLog(engine, `[${traceId}] SUCCESS ${path} (${latency}ms)`);

        // RECOVERY
        markSuccess(engine);

        return data;

      } catch (err) {
        lastError = err;

        recordError(engine);
        broadcastLog(engine, `[${traceId}] FAIL ${path} (${err.message})`);
      }
    }

    // FAILOVER
    if (instanceIndex < instances.length - 1) {
      recordFailover(engine);
      broadcastLog(engine, `[${traceId}] FAILOVER to next instance`);
    }
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
