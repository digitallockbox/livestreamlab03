import crypto from "crypto";

export function createTraceId() {
  return crypto.randomBytes(8).toString("hex"); // 16-char trace ID
}

export function attachTrace(headers, traceId) {
  return {
    ...headers,
    "x-trace-id": traceId
  };
}

