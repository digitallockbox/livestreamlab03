export const ENGINE_DEFS_BATCH_1 = [
  {
    id: 1,
    name: "identity-core",
    domain: "auth",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 5, max: 300, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.05, weight: 0.4 },
      { name: "cpu", higherIsBetter: false, min: 10, max: 95, weight: 0.3 }
    ]
  },

  {
    id: 2,
    name: "tenant-registry",
    domain: "multi-tenant",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 5, max: 250, weight: 0.3 },
      { name: "diskUsage", higherIsBetter: false, min: 40, max: 95, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.02, weight: 0.4 }
    ]
  },

  {
    id: 3,
    name: "autosplit-router",
    domain: "routing",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 1, max: 100, weight: 0.4 },
      { name: "queueDepth", higherIsBetter: false, min: 0, max: 500, weight: 0.3 },
      { name: "cpu", higherIsBetter: false, min: 10, max: 90, weight: 0.3 }
    ]
  },

  {
    id: 4,
    name: "graphic-render",
    domain: "graphics",
    metrics: [
      { name: "fps", higherIsBetter: true, min: 15, max: 120, weight: 0.4 },
      { name: "droppedFrames", higherIsBetter: false, min: 0, max: 10, weight: 0.3 },
      { name: "gpu", higherIsBetter: false, min: 20, max: 95, weight: 0.3 }
    ]
  },

  {
    id: 5,
    name: "fire-events",
    domain: "fire-life-safety",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 5, max: 200, weight: 0.3 },
      { name: "incidents", higherIsBetter: false, min: 0, max: 5, weight: 0.4 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.01, weight: 0.3 }
    ]
  },

  {
    id: 6,
    name: "nvr-stream",
    domain: "video",
    metrics: [
      { name: "fps", higherIsBetter: true, min: 10, max: 60, weight: 0.4 },
      { name: "packetLoss", higherIsBetter: false, min: 0, max: 0.05, weight: 0.3 },
      { name: "jitter", higherIsBetter: false, min: 0, max: 50, weight: 0.3 }
    ]
  },

  {
    id: 7,
    name: "rtsp-ingest",
    domain: "video",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 5, max: 250, weight: 0.4 },
      { name: "packetLoss", higherIsBetter: false, min: 0, max: 0.03, weight: 0.3 },
      { name: "cpu", higherIsBetter: false, min: 10, max: 90, weight: 0.3 }
    ]
  },

  {
    id: 8,
    name: "storage-core",
    domain: "storage",
    metrics: [
      { name: "diskUsage", higherIsBetter: false, min: 40, max: 98, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 2, max: 80, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.02, weight: 0.3 }
    ]
  },

  {
    id: 9,
    name: "logging-engine",
    domain: "observability",
    metrics: [
      { name: "throughput", higherIsBetter: true, min: 100, max: 5000, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 1, max: 50, weight: 0.3 },
      { name: "diskUsage", higherIsBetter: false, min: 30, max: 95, weight: 0.3 }
    ]
  },

  {
    id: 10,
    name: "metrics-engine",
    domain: "observability",
    metrics: [
      { name: "rps", higherIsBetter: true, min: 50, max: 2000, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 1, max: 40, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.01, weight: 0.3 }
    ]
  },

  {
    id: 11,
    name: "cache-engine",
    domain: "performance",
    metrics: [
      { name: "hitRate", higherIsBetter: true, min: 0.7, max: 1.0, weight: 0.5 },
      { name: "latency", higherIsBetter: false, min: 1, max: 20, weight: 0.3 },
      { name: "evictions", higherIsBetter: false, min: 0, max: 1000, weight: 0.2 }
    ]
  },

  {
    id: 12,
    name: "queue-engine",
    domain: "async",
    metrics: [
      { name: "queueDepth", higherIsBetter: false, min: 0, max: 10000, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 5, max: 300, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.02, weight: 0.3 }
    ]
  },

  {
    id: 13,
    name: "gpu-inference",
    domain: "ai",
    metrics: [
      { name: "throughput", higherIsBetter: true, min: 10, max: 1000, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 5, max: 200, weight: 0.3 },
      { name: "utilization", higherIsBetter: false, min: 30, max: 98, weight: 0.3 }
    ]
  },

  {
    id: 14,
    name: "video-transcode",
    domain: "media",
    metrics: [
      { name: "fps", higherIsBetter: true, min: 15, max: 120, weight: 0.4 },
      { name: "cpu", higherIsBetter: false, min: 20, max: 95, weight: 0.3 },
      { name: "droppedFrames", higherIsBetter: false, min: 0, max: 15, weight: 0.3 }
    ]
  },

  {
    id: 15,
    name: "alarm-router",
    domain: "fire-life-safety",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 1, max: 80, weight: 0.4 },
      { name: "incidents", higherIsBetter: false, min: 0, max: 3, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.01, weight: 0.3 }
    ]
  },

  {
    id: 16,
    name: "vesda-analytics",
    domain: "fire-life-safety",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 10, max: 300, weight: 0.3 },
      { name: "incidents", higherIsBetter: false, min: 0, max: 5, weight: 0.4 },
      { name: "cpu", higherIsBetter: false, min: 20, max: 90, weight: 0.3 }
    ]
  },

  {
    id: 17,
    name: "tenant-storage",
    domain: "multi-tenant",
    metrics: [
      { name: "diskUsage", higherIsBetter: false, min: 40, max: 98, weight: 0.4 },
      { name: "latency", higherIsBetter: false, min: 5, max: 120, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.02, weight: 0.3 }
    ]
  },

  {
    id: 18,
    name: "tenant-compute",
    domain: "multi-tenant",
    metrics: [
      { name: "cpu", higherIsBetter: false, min: 20, max: 95, weight: 0.4 },
      { name: "memory", higherIsBetter: false, min: 30, max: 95, weight: 0.3 },
      { name: "latency", higherIsBetter: false, min: 5, max: 200, weight: 0.3 }
    ]
  },

  {
    id: 19,
    name: "tenant-graphic",
    domain: "multi-tenant",
    metrics: [
      { name: "fps", higherIsBetter: true, min: 15, max: 90, weight: 0.4 },
      { name: "droppedFrames", higherIsBetter: false, min: 0, max: 10, weight: 0.3 },
      { name: "latency", higherIsBetter: false, min: 5, max: 150, weight: 0.3 }
    ]
  },

  {
    id: 20,
    name: "tenant-fire",
    domain: "multi-tenant",
    metrics: [
      { name: "latency", higherIsBetter: false, min: 1, max: 100, weight: 0.4 },
      { name: "incidents", higherIsBetter: false, min: 0, max: 4, weight: 0.3 },
      { name: "errorRate", higherIsBetter: false, min: 0, max: 0.01, weight: 0.3 }
    ]
  }
];
