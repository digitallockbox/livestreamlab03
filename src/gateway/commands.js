import { createTraceId } from "./trace.js";
import { broadcastLog } from "./logServer.js";
import { markFailureAndMaybeRecover } from "./autoRecovery.js";

export async function restartEngine(engine, instanceUrl) {
  const traceId = createTraceId();

  broadcastLog(engine, `[${traceId}] RESTART COMMAND → ${instanceUrl}`);

  try {
    const res = await fetch(`${instanceUrl}/admin/restart`, { method: "POST" });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    broadcastLog(engine, `[${traceId}] RESTART SUCCESS`);
    return { ok: true };

  } catch (err) {
    broadcastLog(engine, `[${traceId}] RESTART FAIL (${err.message})`);

    // fallback to auto‑recovery
    await markFailureAndMaybeRecover(engine, `${instanceUrl}/admin/restart`);

    return { ok: false, error: err.message };
  }
}
