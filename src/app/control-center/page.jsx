"use client";

import { useEffect, useState } from "react";
import {
  getSystemHealth,
  getEngineHealth,
  getOverviewAnalytics,
  getStreamAnalytics,
  getContentAnalytics,
  getCreators,
  activateEngine,
  getBootLogs,
} from "@/services/engine-bridge";
import { requireFounderSession } from "@/middleware/founderAuth";

export default function ControlCenterPage() {
  const [backendOffline, setBackendOffline] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [engineHealth, setEngineHealth] = useState(null);
  const [overview, setOverview] = useState(null);
  const [streamAnalytics, setStreamAnalytics] = useState(null);
  const [contentAnalytics, setContentAnalytics] = useState(null);
  const [creators, setCreators] = useState([]);
  const [bootLogs, setBootLogs] = useState([]);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    requireFounderSession();

    const loadAll = async () => {
      const sys = await getSystemHealth();
      const eng = await getEngineHealth();
      const ov = await getOverviewAnalytics();
      const sa = await getStreamAnalytics();
      const ca = await getContentAnalytics();
      const cr = await getCreators();
      const logs = await getBootLogs();

      setBackendOffline(!sys);
      setSystemHealth(sys);
      setEngineHealth(eng);
      setOverview(ov);
      setStreamAnalytics(sa);
      setContentAnalytics(ca);
      setCreators(cr || []);
      setBootLogs(logs || []);
    };

    loadAll();

    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleActivateEngine = async () => {
    setActivating(true);
    await activateEngine();
    const logs = await getBootLogs();
    setBootLogs(logs || []);
    setActivating(false);
  };

  const allEnginesOnline =
    engineHealth &&
    Object.values(engineHealth).every((status) => status === "online");

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 space-y-6 font-mono">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg tracking-[0.2em] uppercase text-slate-300">
            CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-500">
            LiveStreamLab.live — Founder Operations Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {backendOffline
              ? "BACKEND OFFLINE"
              : allEnginesOnline
              ? "LIVE ENGINE"
              : "ENGINE DEGRADED"}
          </span>

          <button
            onClick={handleActivateEngine}
            disabled={backendOffline || activating}
            className="text-[10px] px-3 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {activating ? "ACTIVATING…" : "ACTIVATE ENGINE"}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="SYSTEM HEALTH" data={systemHealth} />
        <Section title="ENGINE HEALTH" data={engineHealth} />
        <Section title="OVERVIEW ANALYTICS" data={overview} />
        <Section title="STREAM ANALYTICS" data={streamAnalytics} />
        <Section title="CONTENT ANALYTICS" data={contentAnalytics} />

        <section className="col-span-1 border border-slate-800 rounded-lg p-4 bg-slate-950/60">
          <h2 className="text-xs text-slate-400 mb-2">CREATORS</h2>
          <div className="text-[10px] bg-black/40 p-3 rounded-md max-h-64 overflow-y-auto space-y-1">
            {creators && creators.length > 0 ? (
              creators.map((c) => (
                <div
                  key={c.id || c.creatorId}
                  className="flex justify-between border-b border-slate-800/40 pb-1"
                >
                  <span className="text-slate-200">
                    {c.username || c.name || c.id}
                  </span>
                  <span className="text-slate-500">
                    {c.segment || c.status || "unknown"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-slate-500">…loading or none</span>
            )}
          </div>
        </section>

        <section className="col-span-1 border border-slate-800 rounded-lg p-4 bg-slate-950/60">
          <h2 className="text-xs text-slate-400 mb-2">BOOT SEQUENCE LOGS</h2>
          <div className="text-[10px] bg-black/40 p-3 rounded-md max-h-64 overflow-y-auto space-y-1">
            {bootLogs && bootLogs.length > 0 ? (
              bootLogs.map((line, idx) => (
                <div key={idx} className="text-slate-300">
                  {line}
                </div>
              ))
            ) : (
              <span className="text-slate-500">no logs yet</span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <section className="col-span-1 border border-slate-800 rounded-lg p-4 bg-slate-950/60">
      <h2 className="text-xs text-slate-400 mb-2">{title}</h2>
      <pre className="text-[10px] bg-black/40 p-3 rounded-md overflow-x-auto">
        {data ? JSON.stringify(data, null, 2) : "…loading"}
      </pre>
    </section>
  );
}
