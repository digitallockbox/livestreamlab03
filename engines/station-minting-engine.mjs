// ===============================================
// TRIDENTOS STATION MINTING ENGINE
// - Issues station IDs
// - Links them to Web3 identity (.livestreamlab)
// - Prepares routing metadata for TridentOS
// ===============================================

import fs from "fs";
import express from "express";

const app = express();
app.use(express.json());

// ---- Load Web3 Identity Config ----
const configPath = "C:/TridentOS/config/web3-identity.json";
let identityConfig = {};

try {
    const raw = fs.readFileSync(configPath, "utf8");
    identityConfig = JSON.parse(raw);
    console.log("Web3 Identity Config Loaded (Minting Engine)");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
    identityConfig = {
        Web3Identity: {
            TLD: ".livestreamlab",
            OwnerWallet: "0x0000000000000000000000000000000000000000",
            Minting: "Enabled",
            TenantIsolation: "Enabled",
            Description: "Fallback config (file missing)"
        },
        Routing: {
            Omega: "/api/omega?domain=",
            Sigma: "/api/sigma?domain=&region=",
            Autosplit: "/api/route?domain=",
            ZetaFailover: "/api/failover?domain=",
            Telemetry: "/api/telemetry",
            Engine: "/api/engine?id=",
            Fleet: "/api/fleet",
            Events: "/api/events"
        }
    };
}

const TLD = identityConfig.Web3Identity.TLD;
const OWNER = identityConfig.Web3Identity.OwnerWallet;
const routing = identityConfig.Routing;

// ---- In-memory registry (can later be moved to DB) ----
const stations = new Map();

// Utility: normalize station name
function normalizeStationName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

// ===============================================
// GET ALL STATIONS (for debugging / admin)
// ===============================================
app.get("/api/stations", (req, res) => {
    const list = [];
    for (const [key, value] of stations.entries()) {
        list.push(value);
    }
    res.json({ count: list.length, stations: list });
});

// ===============================================
// MINT NEW STATION
// ===============================================
app.post("/api/stations/mint", (req, res) => {
    const stationRaw = req.body.station;
    const ownerWallet = req.body.ownerWallet || OWNER;

    if (!stationRaw) {
        return res.status(400).json({ error: "Missing 'station' in body" });
    }

    const station = normalizeStationName(stationRaw);

    // Check if already exists
    if (stations.has(station)) {
        return res.json({
            minted: false,
            reason: "Station already exists",
            station,
            existing: stations.get(station)
        });
    }

    const identity = `${station}${TLD}`;

    const record = {
        station,
        identity,
        ownerWallet,
        tld: TLD,
        tenant: station,
        routing: {
            autosplit: `${routing.Autosplit}${station}`,
            omega: `${routing.Omega}${station}`,
            sigma_edge_atl: `${routing.Sigma.replace("domain=&region=", `domain=${station}&region=`)}edge-atl`,
            sigma_us_east_1: `${routing.Sigma.replace("domain=&region=", `domain=${station}&region=`)}us-east-1`,
            failover: `${routing.ZetaFailover}${station}`
        },
        createdAt: new Date().toISOString()
    };

    stations.set(station, record);

    return res.json({
        minted: true,
        station,
        identity,
        ownerWallet,
        routing: record.routing
    });
});

// ===============================================
// GET SINGLE STATION
// ===============================================
app.get("/api/stations/get", (req, res) => {
    const stationRaw = req.query.station;

    if (!stationRaw) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const station = normalizeStationName(stationRaw);

    if (!stations.has(station)) {
        return res.status(404).json({ error: "Station not found", station });
    }

    return res.json(stations.get(station));
});

// ===============================================
// DELETE STATION (admin)
// ===============================================
app.delete("/api/stations/delete", (req, res) => {
    const stationRaw = req.query.station;

    if (!stationRaw) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const station = normalizeStationName(stationRaw);

    if (!stations.has(station)) {
        return res.status(404).json({ error: "Station not found", station });
    }

    stations.delete(station);

    return res.json({ deleted: true, station });
});

// ===============================================
// START STATION MINTING ENGINE
// ===============================================
const PORT = 8096; // Station Minting Engine Port
app.listen(PORT, () => {
    console.log(`Station Minting Engine Online on port ${PORT}`);
});
