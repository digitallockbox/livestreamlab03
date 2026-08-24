// ===============================================
// TRIDENTOS WEB3 LOGIN ENGINE
// - Verifies wallet ownership via signature
// - Links wallet to .livestreamlab identity
// ===============================================

import fs from "fs";
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// Load Web3 Identity Config
const configPath = "C:/TridentOS/config/web3-identity.json";
let identityConfig = {};

try {
    const raw = fs.readFileSync(configPath, "utf8");
    identityConfig = JSON.parse(raw);
    console.log("Web3 Identity Config Loaded (Login Engine)");
} catch (err) {
    console.error("ERROR: Cannot load Web3 Identity Config", err);
}

const TLD = identityConfig.Web3Identity.TLD;

// In-memory session store (replace with Redis/DB later)
const sessions = new Map();

// Generate nonce
function generateNonce() {
    return crypto.randomBytes(16).toString("hex");
}

// ===============================================
// STEP 1: REQUEST NONCE
// ===============================================
app.post("/api/web3/login/nonce", (req, res) => {
    const wallet = req.body.wallet;

    if (!wallet) {
        return res.status(400).json({ error: "Missing 'wallet' in body" });
    }

    const nonce = generateNonce();
    sessions.set(wallet.toLowerCase(), { nonce, verified: false });

    return res.json({
        wallet,
        nonce,
        message: `Sign this message to login: ${nonce}`
    });
});

// ===============================================
// STEP 2: VERIFY SIGNATURE (placeholder)
// ===============================================
// NOTE: This is a stub. Real implementation would use
// ecrecover / ethers.js / web3.js to verify the signature.
app.post("/api/web3/login/verify", (req, res) => {
    const wallet = req.body.wallet;
    const signature = req.body.signature;

    if (!wallet || !signature) {
        return res.status(400).json({ error: "Missing 'wallet' or 'signature'" });
    }

    const key = wallet.toLowerCase();
    const session = sessions.get(key);

    if (!session) {
        return res.status(400).json({ error: "No nonce for this wallet" });
    }

    // Placeholder: accept any signature for now
    session.verified = true;

    const identity = `${key}${TLD}`;

    return res.json({
        verified: true,
        wallet: key,
        identity,
        tld: TLD,
        sessionToken: crypto.randomBytes(24).toString("hex")
    });
});

// ===============================================
// START WEB3 LOGIN ENGINE
// ===============================================
const PORT = 8098;
app.listen(PORT, () => {
    console.log(`Web3 Login Engine Online on port ${PORT}`);
});
