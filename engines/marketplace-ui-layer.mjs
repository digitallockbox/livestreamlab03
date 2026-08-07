// ======================================================
// TRIDENTOS MARKETPLACE UI LAYER
// - Frontend-friendly API wrapper
// - Aggregates data from multiple engines
// ======================================================

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Utility: fetch JSON safely
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (err) {
        return { error: `Cannot reach ${url}`, details: err.toString() };
    }
}

// ======================================================
// UI: LIST ALL STATIONS (with routing + premium flag)
// ======================================================
app.get("/ui/market/stations", async (req, res) => {
    const stations = await safeFetch("http://localhost:8096/api/stations");
    const premium = await safeFetch("http://localhost:8093/api/market/premium");

    const premiumSet = new Set(
        (premium.premiumStations || []).map(p => p.station)
    );

    const list = [];

    for (const s of stations.stations || []) {
        const route = await safeFetch(
            `http://localhost:8097/api/route?domain=${s.station}`
        );

        list.push({
            station: s.station,
            identity: s.identity,
            ownerWallet: s.ownerWallet,
            premium: premiumSet.has(s.station),
            routing: route
        });
    }

    res.json({
        count: list.length,
        stations: list
    });
});

// ======================================================
// UI: LIST PREMIUM STATIONS (with routing)
// ======================================================
app.get("/ui/market/premium", async (req, res) => {
    const premium = await safeFetch("http://localhost:8093/api/market/premium");

    const list = [];

    for (const p of premium.premiumStations || []) {
        const route = await safeFetch(
            `http://localhost:8097/api/route?domain=${p.station}`
        );

        list.push({
            station: p.station,
            identity: p.identity,
            price: p.price,
            note: p.note,
            routing: route
        });
    }

    res.json({
        count: list.length,
        premiumStations: list
    });
});

// ======================================================
// UI: CLAIM STATION (purchase)
// ======================================================
app.post("/ui/market/claim", async (req, res) => {
    const station = req.body.station;
    const wallet = req.body.wallet;

    if (!station || !wallet) {
        return res.status(400).json({ error: "Missing station or wallet" });
    }

    const claim = await safeFetch("http://localhost:8093/api/market/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station, wallet })
    });

    const route = await safeFetch(
        `http://localhost:8097/api/route?domain=${station}`
    );

    res.json({
        claimed: true,
        station,
        wallet,
        identity: claim.identity,
        premium: claim.premium,
        routing: route
    });
});

// ======================================================
// UI: GET USER PROFILE (wallet → station → routing)
// ======================================================
app.get("/ui/user/profile", async (req, res) => {
    const wallet = req.query.wallet;

    if (!wallet) {
        return res.status(400).json({ error: "Missing ?wallet=" });
    }

    const login = await safeFetch(
        `http://localhost:8094/api/web3/login/verify?wallet=${wallet}`
    );

    const stations = await safeFetch("http://localhost:8096/api/stations");

    const owned = (stations.stations || []).filter(
        s => s.ownerWallet === wallet.toLowerCase()
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
        wallet,
        stations: enriched,
        count: enriched.length
    });
});

// ======================================================
// START UI LAYER ENGINE
// ======================================================
const PORT = 8092;
app.listen(PORT, () => {
    console.log(`Marketplace UI Layer Online on port ${PORT}`);
});
