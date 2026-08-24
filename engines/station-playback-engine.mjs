// ======================================================
// TRIDENTOS STATION PLAYBACK ENGINE
// - Reads buffered audio from ingest engine
// - Exposes playback endpoints per station
// ======================================================

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Utility: normalize station name
function normalizeStation(station) {
    return station.trim().toLowerCase().replace(/\s+/g, "-");
}

// Utility: safe fetch
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (err) {
        return { error: `Cannot reach ${url}`, details: err.toString() };
    }
}

// ======================================================
// GET /playback/json?station=...
// Returns JSON of buffered chunks (for JS players)
// ======================================================
app.get("/playback/json", async (req, res) => {
    const rawStation = req.query.station;
    if (!rawStation) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const station = normalizeStation(rawStation);

    const data = await safeFetch(
        `http://localhost:8085/audio/play?station=${station}`
    );

    res.json({
        station,
        chunkCount: data.chunkCount || 0,
        chunks: data.chunks || [],
    });
});

// ======================================================
// GET /playback/raw?station=...
// Example raw stream endpoint (concatenated chunks)
// NOTE: This is a simple demo; real streaming would use
// proper audio framing and content-type.
// ======================================================
app.get("/playback/raw", async (req, res) => {
    const rawStation = req.query.station;
    if (!rawStation) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const station = normalizeStation(rawStation);

    const data = await safeFetch(
        `http://localhost:8085/audio/play?station=${station}`
    );

    const chunks = data.chunks || [];

    // Assume chunks are base64-encoded audio segments
    const buffers = chunks.map(c => Buffer.from(c.chunk, "base64"));
    const combined = Buffer.concat(buffers);

    res.setHeader("Content-Type", "application/octet-stream");
    res.send(combined);
});

// ======================================================
// HEALTH: GET /playback/health
// ======================================================
app.get("/playback/health", (req, res) => {
    res.json({
        status: "ok",
        source: "http://localhost:8085/audio/play?station=...",
    });
});

// ======================================================
// START STATION PLAYBACK ENGINE
// ======================================================
const PORT = 8086;
app.listen(PORT, () => {
    console.log(`Station Playback Engine Online on port ${PORT}`);
});
