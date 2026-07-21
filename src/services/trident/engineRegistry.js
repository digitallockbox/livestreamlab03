export const ENGINES = [
  { name: "rtmp", port: 1935 },
  { name: "autosplit", port: 8081 },
  { name: "storage", port: 9000 },
  { name: "identity", port: 8082 },
  { name: "token", port: 8083 },
  { name: "tree", port: 8084 },
  { name: "governance", port: 8085 },
];

export const SESSION_START = Date.now();

export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}