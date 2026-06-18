import { Router } from "express";
import crypto from "crypto";
import { getDB } from "../db/index.js";

const router = Router();

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { email, username } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email_required" });
  }

  try {
    const db = await getDB();
    const existing = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ error: "email_already_registered" });
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO users (id, provider, provider_id, name, email, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, "email", email, username || null, email, now]
    );

    const accessToken = generateToken();
    const refreshToken = generateToken();

    await db.run(
      "INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, ?)",
      [userId, refreshToken, now]
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_MS
    });

    res.status(201).json({ token: accessToken, userId, email });
  } catch (err) {
    res.status(500).json({ error: "signup_failed", message: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email_required" });
  }

  try {
    const db = await getDB();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ error: "user_not_found" });
    }

    const accessToken = generateToken();
    const refreshToken = generateToken();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, now]
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_MS
    });

    res.json({ token: accessToken, userId: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "login_failed", message: err.message });
  }
});

// GET /auth/verify
router.get("/verify", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "no_token" });
  }

  try {
    const db = await getDB();
    // Use the refresh token store to find the associated user; in production
    // this would verify a signed JWT. Here we treat the access token as an
    // opaque identifier looked up from a short-lived token table, but since
    // the current schema only has refresh_tokens we fall back to the cookie.
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: "session_expired" });
    }

    const row = await db.get(
      "SELECT rt.user_id, u.email, u.name FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = ?",
      [refreshToken]
    );

    if (!row) {
      return res.status(401).json({ error: "invalid_session" });
    }

    const founderEmail = process.env.FOUNDER_EMAIL;
    const isFounder = founderEmail ? row.email === founderEmail : false;

    res.json({ token, userId: row.user_id, email: row.email, founder: isFounder });
  } catch (err) {
    res.status(500).json({ error: "verify_failed", message: err.message });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: "no_refresh_token" });
  }

  try {
    const db = await getDB();
    const row = await db.get(
      "SELECT rt.id, rt.user_id, rt.created_at, u.email FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = ?",
      [refreshToken]
    );

    if (!row) {
      return res.status(401).json({ error: "invalid_refresh_token" });
    }

    const issuedAt = new Date(row.created_at).getTime();
    if (Date.now() - issuedAt > REFRESH_TOKEN_TTL_MS) {
      await db.run("DELETE FROM refresh_tokens WHERE id = ?", [row.id]);
      return res.status(401).json({ error: "refresh_token_expired" });
    }

    // Rotate refresh token
    const newRefreshToken = generateToken();
    const newAccessToken = generateToken();
    const now = new Date().toISOString();

    await db.run("DELETE FROM refresh_tokens WHERE id = ?", [row.id]);
    await db.run(
      "INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, ?)",
      [row.user_id, newRefreshToken, now]
    );

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_MS
    });

    res.json({ token: newAccessToken, userId: row.user_id, email: row.email });
  } catch (err) {
    res.status(500).json({ error: "refresh_failed", message: err.message });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    try {
      const db = await getDB();
      await db.run("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);
    } catch {
      // best-effort cleanup
    }
  }

  res.clearCookie("refresh_token");
  res.json({ ok: true });
});

export default router;
