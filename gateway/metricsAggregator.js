// In-memory metrics store. Designed for single-threaded Node.js use.
// Each latency ring tracks the last LATENCY_WINDOW samples without O(n) shifts.
const LATENCY_WINDOW = 100;

const metrics = {
  requests: {},
  errors: {},
  // Circular buffer per engine: { buf, head, count }
  latencies: {},
  failovers: {},
  cacheMisses: {},
  // 'closed' = healthy (circuit complete), 'open' = failing, 'half_open' = recovering
  breakerStates: {}
};

function ensureEngine(engine) {
  if (!metrics.requests[engine]) metrics.requests[engine] = 0;
  if (!metrics.errors[engine]) metrics.errors[engine] = 0;
  if (!metrics.latencies[engine]) {
    metrics.latencies[engine] = { buf: new Array(LATENCY_WINDOW).fill(0), head: 0, count: 0 };
  }
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
  const ring = metrics.latencies[engine];
  ring.buf[ring.head] = ms;
  ring.head = (ring.head + 1) % LATENCY_WINDOW;
  if (ring.count < LATENCY_WINDOW) ring.count++;
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
    const ring = metrics.latencies[engine];
    let avgLatency = null;
    if (ring.count > 0) {
      let sum = 0;
      for (let i = 0; i < ring.count; i++) sum += ring.buf[i];
      avgLatency = Math.round(sum / ring.count);
    }

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
