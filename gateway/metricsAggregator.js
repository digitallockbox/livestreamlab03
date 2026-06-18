const metrics = {
  requests: {},
  errors: {},
  latencies: {},
  failovers: {},
  cacheMisses: {},
  breakerStates: {}
};

function ensureEngine(engine) {
  if (!metrics.requests[engine]) metrics.requests[engine] = 0;
  if (!metrics.errors[engine]) metrics.errors[engine] = 0;
  if (!metrics.latencies[engine]) metrics.latencies[engine] = [];
  if (!metrics.failovers[engine]) metrics.failovers[engine] = 0;
  if (!metrics.cacheMisses[engine]) metrics.cacheMisses[engine] = 0;
  if (!metrics.breakerStates[engine]) metrics.breakerStates[engine] = "closed";
}

export function recordRequest(engine) {
  ensureEngine(engine);
  metrics.requests[engine]++;
}

export function recordError(engine) {
  ensureEngine(engine);
  metrics.errors[engine]++;
}

export function recordLatency(engine, ms) {
  ensureEngine(engine);
  metrics.latencies[engine].push(ms);
  // Keep last 100 samples
  if (metrics.latencies[engine].length > 100) {
    metrics.latencies[engine].shift();
  }
}

export function recordFailover(engine) {
  ensureEngine(engine);
  metrics.failovers[engine]++;
}

export function recordCacheMiss(engine) {
  ensureEngine(engine);
  metrics.cacheMisses[engine]++;
}

export function setBreakerState(engine, state) {
  ensureEngine(engine);
  metrics.breakerStates[engine] = state;
}

export function getMetrics() {
  const result = {};

  const engines = new Set([
    ...Object.keys(metrics.requests),
    ...Object.keys(metrics.errors)
  ]);

  for (const engine of engines) {
    ensureEngine(engine);
    const lats = metrics.latencies[engine];
    const avgLatency =
      lats.length > 0
        ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length)
        : null;

    result[engine] = {
      requests: metrics.requests[engine],
      errors: metrics.errors[engine],
      failovers: metrics.failovers[engine],
      cacheMisses: metrics.cacheMisses[engine],
      avgLatencyMs: avgLatency,
      breakerState: metrics.breakerStates[engine]
    };
  }

  return result;
}
