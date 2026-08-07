const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8092;
const JWT_SECRET = "tridentos-tenant-secret";

app.use(cors());
app.use(bodyParser.json());

// In-memory tenant user store
const tenants = {};

function ensureTenant(tenantId) {
    if (!tenants[tenantId]) {
        tenants[tenantId] = { users: {} };
    }
}

// Root status
app.get("/", (req, res) => {
    res.json({ engine: "identity", port: PORT, status: "active" });
});

// Register user
app.post("/tenant/:tenantId/identity/register", (req, res) => {
    const { tenantId } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    ensureTenant(tenantId);

    if (tenants[tenantId].users[username]) {
        return res.status(409).json({ error: "user already exists" });
    }

    tenants[tenantId].users[username] = { password };
    res.json({ tenantId, username, status: "registered" });
});

// Login user
app.post("/tenant/:tenantId/identity/login", (req, res) => {
    const { tenantId } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    ensureTenant(tenantId);

    const user = tenants[tenantId].users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign(
        { tenantId, username },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ tenantId, username, token });
});

// Verify token
app.post("/tenant/:tenantId/identity/verify", (req, res) => {
    const { tenantId } = req.params;
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "token required" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        if (payload.tenantId !== tenantId) {
            return res.status(403).json({ error: "tenant mismatch" });
        }

        res.json({ valid: true, tenantId: payload.tenantId, username: payload.username });
    } catch (err) {
        res.status(401).json({ valid: false, error: "invalid or expired token" });
    }
});

app.listen(PORT, () => {
    console.log(`Identity Engine running on port ${PORT}`);
});

