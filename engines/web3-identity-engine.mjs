// ===============================================
// TRIDENTOS WEB3 IDENTITY ENGINE
// ===============================================

import fs from "fs";
import express from "express";
import path from "path";

const app = express();
app.use(express.json());

// Load Web3 Identity Config
const configPath = "C:/TridentOS/config/web3-identity.json";
let identityConfig = {};

try {
    const raw = fs.readFileSync(configPath, "utf8");
    identityConfig = JSON.parse(raw);
    console.log("Web3 Identity Config Loaded");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
}

// Extract values
const TLD = identityConfig.Web3Identity.TLD;
const OWNER = identityConfig.Web3Identity.OwnerWallet;

// ===============================================
// VALIDATE A USER'S STATION IDENTITY
// ===============================================
app.get("/api/web3/validate", (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.json({ error: "Missing ?id=" });
    }

    if (!id.endsWith(TLD)) {
        return res.json({
            valid: false,
            reason: "Identity does not match TLD",
            tld: TLD
        });
    }

    return res.json({
        valid: true,
        identity: id,
        tld: TLD,
        owner: OWNER,
        tenant: id.replace(TLD, "").replace(".", "")
    });
});

// ===============================================
// MINT A NEW STATION IDENTITY
// (This does NOT mint on-chain; it registers inside TridentOS)
// ===============================================
app.post("/api/web3/mint", (req, res) => {
    const station = req.body.station;

    if (!station) {
        return res.json({ error: "Missing station name" });
    }

    const fullIdentity = `${station}${TLD}`;

    return res.json({
        minted: true,
        identity: fullIdentity,
        owner: OWNER,
        tenant: station,
        routing: {
            autosplit: `/api/route?domain=${station}`,
            omega: `/api/omega?domain=${station}`,
            sigma: `/api/sigma?domain=${station}&region=edge-atl`,
            failover: `/api/failover?domain=${station}`
        }
    });
});

// ===============================================
// GET TLD INFO
// ===============================================
app.get("/api/web3/tld", (req, res) => {
    res.json({
        tld: TLD,
        owner: OWNER,
        minting: identityConfig.Web3Identity.Minting,
        tenantIsolation: identityConfig.Web3Identity.TenantIsolation,
        description: identityConfig.Web3Identity.Description
    });
});

// ===============================================
// START ENGINE
// ===============================================
const PORT = 8095; // Web3 Identity Engine Port
app.listen(PORT, () => {
    console.log(`Web3 Identity Engine Online on port ${PORT}`);
});
