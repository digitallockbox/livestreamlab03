// ======================================================
// TRIDENTOS AUTOSPLIT TENANT ROUTER
// - Connects minted stations to compute engines
// - Integrates Omega, Sigma, Zeta routing
// - Produces full routing metadata for TridentOS
// ======================================================

import fs from "fs";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ---- Load Web3 Identity Config ----
const configPath = "C:/TridentOS/config/web3-identity.json";
let identityConfig = {};

try {
    const raw = fs.readFileSync(configPath, "utf8");
    identityConfig = JSON.parse(raw);
    console.log("Web3 Identity Config Loaded (Autosplit Router)");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
}

// ---- Load Minted Stations from Minting Engine ----
async function getStations() {
    try {
        const res = await fetch("http://localhost:8096/api/stations");
        const json = await res.json();
        return json.stations || [];
    } catch (err) {
        console.error("ERROR: Cannot load stations", err);
        return [];
    }
}

// ---- Routing Endpoints ----
const routing = identityConfig.Routing;

// ---- Autosplit Logic ----
async function autosplitRoute(station) {
    const domain = station;

    // Omega Load Balancer
    const omega = await fetch(`http://localhost:8099${routing.Omega}${domain}`)
        .then(r => r.json())
        .catch(() => ({ error: "Omega unavailable" }));

    // Sigma Region Router
    const sigma = await fetch(`http://localhost:8099${routing.Sigma.replace("domain=&region=", `domain=${domain}&region=`)}edge-atl`)
        .then(r => r.json())
        .catch(() => ({ error: "Sigma unavailable" }));

    // Zeta Failover
    const zeta = await fetch(`http://localhost:8099${routing.ZetaFailover}${domain}`)
        .then(r => r.json())
        .catch(() => ({ error: "Zeta unavailable" }));

    return {
        station,
        domain,
        omega,
        sigma,
        zeta,
        selectedEngine: omega?.selected || sigma?.selected || zeta?.fallback || "none"
    };
}

// ======================================================
// GET ROUTING FOR A STATION
// ======================================================
app.get("/api/route", async (req, res) => {
    const stationRaw = req.query.domain;

    if (!stationRaw) {
        return res.status(400).json({ error: "Missing ?domain=" });
    }

    const station = stationRaw.toLowerCase();

    const stations = await getStations();
    const exists = stations.find(s => s.station === station);

    if (!exists) {
        return res.status(404).json({ error: "Station not found", station });
    }

    const route = await autosplitRoute(station);

    return res.json(route);
});

// ======================================================
// GET ROUTING FOR ALL STATIONS
// ======================================================
app.get("/api/route/all", async (req, res) => {
    const stations = await getStations();
    const results = [];

    for (const s of stations) {
        const route = await autosplitRoute(s.station);
        results.push(route);
    }

    res.json({
        count: results.length,
        routes: results
    });
});

// ======================================================
// START AUTOSPLIT TENANT ROUTER
// ======================================================
const PORT = 8097;
app.listen(PORT, () => {
    console.log(`Autosplit Tenant Router Online on port ${PORT}`);
});
