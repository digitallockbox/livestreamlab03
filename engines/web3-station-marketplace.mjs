// ======================================================
// TRIDENTOS WEB3 STATION MARKETPLACE
// - Lists stations
// - Marks premium stations
// - Assigns stations to wallets (sale/claim)
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
    console.log("Web3 Identity Config Loaded (Marketplace)");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
}

const TLD = identityConfig.Web3Identity.TLD;

// ---- In-memory premium registry ----
const premiumStations = new Map();

// Utility: normalize station name
function normalizeStationName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

// ---- Load stations from Minting Engine ----
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

// ======================================================
// LIST ALL STATIONS (with premium flag)
// ======================================================
app.get("/api/market/stations", async (req, res) => {
    const stations = await getStations();
    const list = stations.map(s => ({
        station: s.station,
        identity: s.identity,
        ownerWallet: s.ownerWallet,
        tld: TLD,
        premium: premiumStations.has(s.station),
        premiumMeta: premiumStations.get(s.station) || null
    }));

    res.json({
        count: list.length,
        stations: list
    });
});

// ======================================================
// MARK STATION AS PREMIUM (admin)
// ======================================================
app.post("/api/market/premium", (req, res) => {
    const stationRaw = req.body.station;
    const price = req.body.price || "0";
    const note = req.body.note || "";

    if (!stationRaw) {
        return res.status(400).json({ error: "Missing 'station'" });
    }

    const station = normalizeStationName(stationRaw);

    premiumStations.set(station, {
        station,
        price,
        note,
        tld: TLD,
        identity: `${station}${TLD}`
    });

    return res.json({
        premium: true,
        station,
        price,
        note
    });
});

// ======================================================
// LIST PREMIUM STATIONS
// ======================================================
app.get("/api/market/premium", (req, res) => {
    const list = [];
    for (const [key, value] of premiumStations.entries()) {
        list.push(value);
    }

    res.json({
        count: list.length,
        premiumStations: list
    });
});

// ======================================================
// CLAIM / ASSIGN STATION TO WALLET (sale)
// ======================================================
app.post("/api/market/claim", async (req, res) => {
    const stationRaw = req.body.station;
    const wallet = req.body.wallet;

    if (!stationRaw || !wallet) {
        return res.status(400).json({ error: "Missing 'station' or 'wallet'" });
    }

    const station = normalizeStationName(stationRaw);
    const key = wallet.toLowerCase();

    // Load stations
    const stations = await getStations();
    const existing = stations.find(s => s.station === station);

    if (!existing) {
        return res.status(404).json({ error: "Station not found", station });
    }

    // In a real system, you'd enforce payment / on-chain transfer here.

    // For now, just "assign" by calling minting engine with new owner
    const mintRes = await fetch("http://localhost:8096/api/stations/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            station,
            ownerWallet: key
        })
    });

    const mintData = await mintRes.json();

    return res.json({
        claimed: true,
        station,
        wallet: key,
        identity: mintData.identity || `${station}${TLD}`,
        premium: premiumStations.has(station),
        routing: mintData.routing || null
    });
});

// ======================================================
// START WEB3 STATION MARKETPLACE ENGINE
// ======================================================
const PORT = 8093;
app.listen(PORT, () => {
    console.log(`Web3 Station Marketplace Online on port ${PORT}`);
});
