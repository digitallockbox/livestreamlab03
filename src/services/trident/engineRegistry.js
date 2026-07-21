export const ENGINES = [
  { name: "rtmp", port: 1935 },
  { name: "identity", port: 8791 },
  { name: "storage", port: 8793 },
  { name: "autosplit", port: 8790 },
  { name: "token", port: 8792 },
  { name: "tenants", port: 8794 },
];

export const SESSION_START = Date.now();

export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}