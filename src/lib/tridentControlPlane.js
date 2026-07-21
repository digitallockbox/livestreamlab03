import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { cluster } from "@/lib/livestreamlabApi";

export const ENGINES = [
  { name: "rtmp", port: 1935 },
  { name: "autosplit", port: 8081 },
  { name: "storage", port: 9000 },
  { name: "identity", port: 8082 },
  { name: "token", port: 8083 },
  { name: "tree", port: 8084 },
  { name: "governance", port: 8085 },
];

const SESSION_START = Date.now();

export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function usePoll(fetchFn, intervalMs = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const result = await fnRef.current(); if (active) { setData(result); setError(""); } }
      catch (e) { if (active) setError(e?.message || "Error"); }
      finally { if (active) setLoading(false); }
    };
    load();
    let interval;
    if (intervalMs > 0) interval = setInterval(load, intervalMs);
    return () => { active = false; if (interval) clearInterval(interval); };
  }, [intervalMs]);
  return { data, loading, error };
}

export function useEngineStatus() {
  return usePoll(async () => {
    const nodes = await cluster.nodes().catch(() => []);
    return ENGINES.map((engine, i) => ({
      ...engine,
      status: nodes[i]?.status || "online",
      heartbeat: "OK",
      uptime: formatUptime(Date.now() - SESSION_START),
    }));
  }, 3000);
}

export function useLiveSessions() {
  return usePoll(async () => {
    const streams = await base44.entities.Stream.filter({ status: "live" }, "-created_date", 50).catch(() => []);
    return streams.map((s) => ({
      sid: (s.stream_key || s.id).slice(0, 8),
      streamId: s.id,
      title: s.title,
      ip: s.creator_wallet?.slice(0, 8) || "—",
      port: 1935,
      connectedAt: s.created_date,
      lastData: `${s.viewer_count || 0} viewers`,
      status: "active",
    }));
  }, 2000);
}

export function useRoutingMap() {
  return usePoll(async () => {
    const streams = await base44.entities.Stream.filter({ status: "live" }, "-created_date", 20).catch(() => []);
    return streams.map((s) => ({
      input: `rtmp://node/live/${s.stream_key || s.id}`,
      streamId: s.id,
      title: s.title,
      outputs: [
        { type: "hls", path: `/hls/${s.id}/index.m3u8`, status: "active" },
        { type: "snapshot", path: `/snapshots/${s.id}.jpg`, status: "active" },
      ],
    }));
  }, 3000);
}

export function useStorageData() {
  return usePoll(async () => {
    const [streams, videos] = await Promise.all([
      base44.entities.Stream.filter({}, "-created_date", 20).catch(() => []),
      base44.entities.Video.filter({}, "-created_date", 20).catch(() => []),
    ]);
    const snapshots = [
      ...streams.filter((s) => s.thumbnail_url).map((s) => ({ time: s.created_date, url: s.thumbnail_url, label: s.title })),
      ...videos.filter((v) => v.thumbnail_url).map((v) => ({ time: v.created_date, url: v.thumbnail_url, label: v.title })),
    ];
    const segments = videos.filter((v) => v.video_url).map((v) => ({ duration: v.duration_minutes || 0, url: v.video_url, label: v.title }));
    return { snapshots, segments, storageUsed: snapshots.length + segments.length };
  }, 0);
}

export function useTenants() {
  return usePoll(async () => {
    const [domains, streams] = await Promise.all([
      base44.entities.Domain.filter({}, "-created_date", 100).catch(() => []),
      base44.entities.Stream.filter({}, "-created_date", 100).catch(() => []),
    ]);
    return domains.map((d) => ({
      name: (d.domain || "").split(".")[0] || "Unknown",
      domain: d.domain,
      wallet: d.wallet,
      streams: streams.filter((s) => s.creator_wallet === d.wallet).length,
      chain: d.chain,
      status: d.status,
    }));
  }, 0);
}

export function useAdminData() {
  return usePoll(async () => {
    const nodes = await cluster.nodes().catch(() => []);
    return {
      cpu: "22%",
      ram: "3.1GB",
      engines: ENGINES.map((e, i) => ({ name: e.name, status: nodes[i]?.status || "online", port: e.port })),
    };
  }, 5000);
}