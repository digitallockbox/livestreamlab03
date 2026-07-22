#!/usr/bin/env node
/**
 * LiveStreamLab Platform Node Script
 * ─────────────────────────────────────────────────────────
 * Standalone gateway that registers all Trident engine nodes,
 * routes incoming requests to the correct engine port, and
 * exposes platform-level health + route-table endpoints.
 *
 * Replaces the broken PowerShell Handle-PlatformRoutes script.
 *
 * Run:
 *   node scripts/platform-node.js
 *
 * Env:
 *   PLATFORM_PORT       Gateway listen port   (default 8090)
 *   PLATFORM_HOST        Gateway bind host     (default 0.0.0.0)
 *   ENGINE_RTMP_PORT     RTMP engine port      (default 1935)
 *   ENGINE_IDENTITY_PORT Identity engine port (default 8791)
 *   ENGINE_STORAGE_PORT  Storage engine port   (default 8793)
 *   ENGINE_AUTOSPLIT_PORT Autosplit engine port(default 8790)
 *   ENGINE_TOKEN_PORT    Token engine port    (default 8792)
 *   ENGINE_TENANTS_PORT  Tenants engine port   (default 8794)
 *   ENGINE_ADMIN_PORT    Admin engine port    (default 8795)
 */

const http = require("http");

// ─── Engine node registry ─────────────────────────────────
const ENGINES = [
  { name: "rtmp",      port: Number(process.env.ENGINE_RTMP_PORT      || 1935), path: "/rtmp" },
  { name: "identity",  port: Number(process.env.ENGINE_IDENTITY_PORT  || 8791), path: "/identity" },
  { name: "storage",   port: Number(process.env.ENGINE_STORAGE_PORT   || 8793), path: "/storage" },
  { name: "autosplit", port: Number(process.env.ENGINE_AUTOSPLIT_PORT || 8790), path: "/autosplit" },
  { name: "token",     port: Number(process.env.ENGINE_TOKEN_PORT     || 8792), path: "/token" },
  { name: "tenants",    port: Number(process.env.ENGINE_TENANTS_PORT  || 8794), path: "/tenants" },
  { name: "admin",     port: Number(process.env.ENGINE_ADMIN_PORT     || 8795), path: "/admin" },
];

const PORT = Number(process.env.PLATFORM_PORT || 8090);
const HOST = process.env.PLATFORM_HOST || "0.0.0.0";
const startedAt = Date.now();

function uptimeMs() { return Date.now() - startedAt; }
function fmtUptime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Engine health probe ──────────────────────────────────
function probeEngine(engine) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: "127.0.0.1", port: engine.port, path: "/status", method: "GET", timeout: 2000 },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          resolve({ ...engine, status: res.statusCode === 200 ? "online" : "degraded", code: res.statusCode, uptime: fmtUptime(uptimeMs()) });
        });
      }
    );
    req.on("error", () => resolve({ ...engine, status: "offline", code: null, uptime: null }));
    req.on("timeout", () => { req.destroy(); resolve({ ...engine, status: "offline", code: null, uptime: null }); });
    req.end();
  });
}

// ─── Reverse proxy to engine ──────────────────────────────
function proxyToEngine(engine, req, res) {
  const proxyReq = http.request(
    { hostname: "127.0.0.1", port: engine.port, path: req.url, method: req.method, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );
  proxyReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: true, message: `Engine '${engine.name}' unreachable`, detail: err.message }));
  });
  req.pipe(proxyReq, { end: true });
}

// ─── Platform handlers ───────────────────────────────────
async function handlePlatform(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/platform/health") {
    const results = await Promise.all(ENGINES.map(probeEngine));
    const anyOffline = results.some((e) => e.status === "offline");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: anyOffline ? "degraded" : "operational",
      uptime: fmtUptime(uptimeMs()),
      engines: results,
    }));
    return true;
  }

  if (url.pathname === "/api/platform/routes") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ routes: ENGINES.map((e) => ({ engine: e.name, port: e.port, path: `/api${e.path}/` })) }));
    return true;
  }

  if (url.pathname === "/api/platform/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ platform: "LiveStreamLab", node: "platform-gateway", port: PORT, uptime: fmtUptime(uptimeMs()), engineCount: ENGINES.length }));
    return true;
  }

  return false;
}

// ─── Request router ───────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS for browser clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-session-token");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // Platform-level endpoints
  if (req.url.startsWith("/api/platform/")) {
    const handled = await handlePlatform(req, res);
    if (handled) return;
  }

  // Engine routing: /api/{engine}/...
  const match = req.url.match(/^\/api\/(\w+)(\/.*)?$/);
  if (match) {
    const engine = ENGINES.find((e) => e.name === match[1]);
    if (engine) { proxyToEngine(engine, req, res); return; }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: true, message: "No route matches", url: req.url }));
});

server.listen(PORT, HOST, () => {
  console.log(`\n  LiveStreamLab Platform Node`);
  console.log(`  ────────────────────────────`);
  console.log(`  Gateway:   http://${HOST}:${PORT}`);
  console.log(`  Engines:   ${ENGINES.length} registered`);
  ENGINES.forEach((e) => console.log(`    • ${e.name.padEnd(10)} :${e.port}  →  /api/${e.name}/`));
  console.log(`  Health:    GET /api/platform/health`);
  console.log(`  Routes:    GET /api/platform/routes`);
  console.log(`  ────────────────────────────\n`);
});

server.on("error", (err) => {
  console.error("Platform node failed to start:", err.message);
  process.exit(1);
});