// ======================================================
// TRIDENTOS LIVE AUDIO INGEST ENGINE
// - Accepts live audio chunks per station
// - Buffers recent audio in memory
// - Exposes simple playback endpoint
// ======================================================

import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" })); // audio chunks as base64 or small binary

// In-memory audio buffers per station
// For real production you'd use Redis, Kafka, or a proper stream bus.
const audioBuffers = new Map();

// Utility: ensure station key
function normalizeStation(station) {
    return station.trim().toLowerCase().replace(/\s+/g, "-");
}

// ======================================================
// INGEST: POST /audio/ingest
// Body: { station: "name", chunk: "<base64 or small payload>" }
// ======================================================
app.post("/audio/ingest", (req, res) => {
    const { station: rawStation, chunk } = req.body;

    if (!rawStation || !chunk) {
        return res.status(400).json({ error: "Missing 'station' or 'chunk'" });
    }

    const station = normalizeStation(rawStation);

    if (!audioBuffers.has(station)) {
        audioBuffers.set(station, []);
    }

    const buf = audioBuffers.get(station);
    buf.push({
        chunk,
        ts: Date.now()
    });

    // Keep only last N chunks (simple ring buffer)
    if (buf.length > 500) {
        buf.splice(0, buf.length - 500);
    }

    return res.json({
        ok: true,
        station,
        bufferedChunks: buf.length
    });
});

// ======================================================
// PLAYBACK: GET /audio/play?station=...
// Returns latest buffered chunks (for a simple player)
// ======================================================
app.get("/audio/play", (req, res) => {
    const rawStation = req.query.station;

    if (!rawStation) {
        return res.status(400).json({ error: "Missing ?station=" });
    }

    const station = normalizeStation(rawStation);

    const buf = audioBuffers.get(station) || [];

    return res.json({
        station,
        chunkCount: buf.length,
        chunks: buf
    });
});

// ======================================================
// HEALTH: GET /audio/health
// ======================================================
app.get("/audio/health", (req, res) => {
    res.json({
        status: "ok",
        stations: Array.from(audioBuffers.keys())
    });
});

// ======================================================
// START LIVE AUDIO INGEST ENGINE
// ======================================================
const PORT = 8085;
app.listen(PORT, () => {
    console.log(`Live Audio Ingest Engine Online on port ${PORT}`);
});
