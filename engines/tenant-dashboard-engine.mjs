// ======================================================
// TRIDENTOS TENANT DASHBOARD ENGINE
// - Aggregates tenant data (wallets, stations, routing)
// - Provides dashboard-friendly APIs
// ======================================================

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Utility: safe JSON fetch
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (err) {
        return { error: `Cannot reach ${url}`, details: err.toString() };
    }
}

// ======================================================
// DASHBOARD: ALL TENANTS (wallet → stations → routing)
// ======================================================
app.get("/dashboard/tenants", async (req, res) => {
    const stationsData = await safeFetch("http://localhost:8096/api/stations");
    const stations = stationsData.stations || [];

    const tenants = new Map();

    for (const s of stations) {
        const wallet = (s.ownerWallet || "unknown").toLowerCase();
        if (!tenants.has(wallet)) {
            tenants.set(wallet, {
                wallet,
                stations: []
            });
        }

        const route = await safeFetch(
            `http://localhost:8097/api/route?domain=${s.station}`
        );

        tenants.get(wallet).stations.push({
            station: s.station,
            identity: s.identity,
            routing: route
        });
    }

    res.json({
        count: tenants.size,
        tenants: Array.from(tenants.values())
    });
});

// ======================================================
// DASHBOARD: SINGLE TENANT BY WALLET
// ======================================================
app.get("/dashboard/tenant", async (req, res) => {
    const wallet = req.query.wallet;

    if (!wallet) {
        return res.status(400).json({ error: "Missing ?wallet=" });
    }

    const stationsData = await safeFetch("http://localhost:8096/api/stations");
    const stations = stationsData.stations || [];

    const owned = stations.filter(
        s => (s.ownerWallet || "").toLowerCase() === wallet.toLowerCase()
    );

    const enriched = [];

    for (const s of owned) {
        const route = await safeFetch(
            `http://localhost:8097/api/route?domain=${s.station}`
        );

        enriched.push({
            station: s.station,
            identity: s.identity,
            routing: route
        });
    }

    res.json({
        wallet: wallet.toLowerCase(),
        stationCount: enriched.length,
        stations: enriched
    });
});

// ======================================================
// DASHBOARD: STATION DETAIL
// ======================================================
app.get("/dashboard/station", async (req, res) => {
    const station = req.query.station;

    if (!station) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const stationsData = await safeFetch("http://localhost:8096/api/stations");
    const stations = stationsData.stations || [];

    const record = stations.find(s => s.station === station.toLowerCase());

    if (!record) {
        return res.status(404).json({ error: "Station not found", station });
    }

    const route = await safeFetch(
        `http://localhost:8097/api/route?domain=${record.station}`
    );

    const premium = await safeFetch("http://localhost:8093/api/market/premium");
    const premiumFlag = (premium.premiumStations || []).some(
        p => p.station === record.station
    );

    res.json({
        station: record.station,
        identity: record.identity,
        ownerWallet: record.ownerWallet,
        premium: premiumFlag,
        routing: route
    });
});

// ======================================================
// START TENANT DASHBOARD ENGINE
// ======================================================
const PORT = 8091;
app.listen(PORT, () => {
    console.log(`Tenant Dashboard Engine Online on port ${PORT}`);
});
