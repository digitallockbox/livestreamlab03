// ======================================================
// TRIDENTOS WEB3 LOGIN FLOW (FULL VERSION)
// - Wallet login
// - Station binding
// - Automatic station minting
// - Autosplit routing activation
// ======================================================

import fs from "fs";
import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ---- Load Web3 Identity Config ----
const configPath = "C:/TridentOS/config/web3-identity.json";
let identityConfig = {};

try {
    const raw = fs.readFileSync(configPath, "utf8");
    identityConfig = JSON.parse(raw);
    console.log("Web3 Identity Config Loaded (Login Flow)");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
}

const TLD = identityConfig.Web3Identity.TLD;

// ---- In-memory session store ----
const sessions = new Map();

// Generate nonce
function generateNonce() {
    return crypto.randomBytes(16).toString("hex");
}

// ======================================================
// STEP 1: REQUEST NONCE
// ======================================================
app.post("/api/web3/login/nonce", (req, res) => {
    const wallet = req.body.wallet;

    if (!wallet) {
        return res.status(400).json({ error: "Missing 'wallet'" });
    }

    const nonce = generateNonce();
    sessions.set(wallet.toLowerCase(), { nonce, verified: false });

    return res.json({
        wallet,
        nonce,
        message: `Sign this message to login: ${nonce}`
    });
});

// ======================================================
// STEP 2: VERIFY SIGNATURE (placeholder)
// ======================================================
app.post("/api/web3/login/verify", async (req, res) => {
    const wallet = req.body.wallet;
    const signature = req.body.signature;

    if (!wallet || !signature) {
        return res.status(400).json({ error: "Missing wallet or signature" });
    }

    const key = wallet.toLowerCase();
    const session = sessions.get(key);

    if (!session) {
        return res.status(400).json({ error: "No nonce for this wallet" });
    }

    // Placeholder: accept any signature
    session.verified = true;

    // ======================================================
    // STEP 3: CHECK IF USER ALREADY HAS A STATION
    // ======================================================
    const stationsRes = await fetch("http://localhost:8096/api/stations");
    const stationsData = await stationsRes.json();
    const existingStation = stationsData.stations.find(s => s.ownerWallet === key);

    let stationRecord;

    if (existingStation) {
        stationRecord = existingStation;
    } else {
        // ======================================================
        // STEP 4: AUTO-MINT NEW STATION FOR USER
        // ======================================================
        const stationName = `user-${key.slice(2, 8)}`;

        const mintRes = await fetch("http://localhost:8096/api/stations/mint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                station: stationName,
                ownerWallet: key
            })
        });

        stationRecord = await mintRes.json();
    }

    // ======================================================
    // STEP 5: ACTIVATE AUTOSPLIT ROUTING FOR USER'S STATION
    // ======================================================
    const routeRes = await fetch(
        `http://localhost:8097/api/route?domain=${stationRecord.station}`
    );
    const routeData = await routeRes.json();

    // ======================================================
    // STEP 6: RETURN FULL TENANT PROFILE
    // ======================================================
    return res.json({
        verified: true,
        wallet: key,
        identity: `${key}${TLD}`,
        station: stationRecord.station,
        stationIdentity: stationRecord.identity,
        routing: routeData,
        sessionToken: crypto.randomBytes(24).toString("hex")
    });
});

// ======================================================
// START WEB3 LOGIN FLOW ENGINE
// ======================================================
const PORT = 8094;
app.listen(PORT, () => {
    console.log(`Web3 Login Flow Engine Online on port ${PORT}`);
});
