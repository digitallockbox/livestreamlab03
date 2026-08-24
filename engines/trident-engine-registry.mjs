// ======================================================
// TRIDENTOS ENGINE REGISTRY
// - Central registry of all engines
// - Health checks
// - Metadata for each engine
// ======================================================

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ---- Define your engines here ----
const engines = [
    {
        name: "Web3 Identity Engine",
        key: "web3-identity",
        port: 8095,
        healthPath: "/api/web3/tld"
    },
    {
        name: "Station Minting Engine",
        key: "station-minting",
        port: 8096,
        healthPath: "/api/stations"
    },
    {
        name: "Autosplit Tenant Router",
        key: "autosplit-router",
        port: 8097,
        healthPath: "/api/route/all"
    },
    {
        name: "Web3 Login Flow Engine",
        key: "web3-login-flow",
        port: 8094,
        healthPath: "/api/web3/login/nonce"
    },
    {
        name: "Web3 Station Marketplace",
        key: "station-marketplace",
        port: 8093,
        healthPath: "/api/market/stations"
    },
    {
        name: "Marketplace UI Layer",
        key: "marketplace-ui",
        port: 8092,
        healthPath: "/ui/market/stations"
    },
    {
        name: "Tenant Dashboard Engine",
        key: "tenant-dashboard",
        port: 8091,
        healthPath: "/dashboard/tenants"
    },
    {
        name: "Live Audio Ingest Engine",
        key: "audio-ingest",
        port: 8085,
        healthPath: "/audio/health"
    }
];

// ---- Helper: health check one engine ----
async function checkEngine(engine) {
    const url = `http://localhost:${engine.port}${engine.healthPath}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        return {
            name: engine.name,
            key: engine.key,
            port: engine.port,
            healthPath: engine.healthPath,
            status: "online",
            responseSample: json
        };
    } catch (err) {
        return {
            name: engine.name,
            key: engine.key,
            port: engine.port,
            healthPath: engine.healthPath,
            status: "offline",
            error: err.toString()
        };
    }
}

// ======================================================
// GET: /registry/engines
// List all engines with basic metadata
// ======================================================
app.get("/registry/engines", (req, res) => {
    res.json({
        count: engines.length,
        engines
    });
});

// ======================================================
// GET: /registry/health
// Full health check of all engines
// ======================================================
app.get("/registry/health", async (req, res) => {
    const results = [];
    for (const e of engines) {
        const r = await checkEngine(e);
        results.push(r);
    }

    res.json({
        checked: results.length,
        engines: results
    });
});

// ======================================================
// GET: /registry/engine?key=...
// Single engine detail + health
// ======================================================
app.get("/registry/engine", async (req, res) => {
    const key = req.query.key;
    if (!key) {
        return res.status(400).json({ error: "Missing ?key=" });
    }

    const engine = engines.find(e => e.key === key);
    if (!engine) {
        return res.status(404).json({ error: "Engine not found", key });
    }

    const health = await checkEngine(engine);

    res.json({
        engine,
        health
    });
});

// ======================================================
// START ENGINE REGISTRY
// ======================================================
const PORT = 8090;
app.listen(PORT, () => {
    console.log(`TridentOS Engine Registry Online on port ${PORT}`);
});
