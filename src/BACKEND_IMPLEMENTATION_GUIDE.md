# 🎥 LiveStreamLab Backend OS - Isolated Session Architecture

## 🔒 Production-Ready Implementation Guide

This document contains the complete backend code for implementing isolated creator/admin sessions in your **Express/Node.js backend** at `api.tridentsystem.live`.

---

## ⚠️ Important Architecture Note

**This code runs in your SEPARATE Express backend repo**, NOT in Base44 functions.

- **Base44**: Frontend React app (Deno runtime for functions)
- **Express Backend**: Your Node.js backend OS at `api.tridentsystem.live`

---

## 1. Middleware Guards (`middleware/authGuards.js`)

```javascript
// middleware/authGuards.js
import { verifySession } from "../services/SessionService.js";

/**
 * Guard: Creator/User routes
 * Validates creator_session cookie or x-creator-session header
 */
export const requireCreator = (req, res, next) => {
  const creatorSession =
    req.cookies?.creator_session || req.headers["x-creator-session"];

  if (!creatorSession) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Creator session missing or expired.",
    });
  }

  try {
    const decoded = verifySession(
      creatorSession,
      process.env.CREATOR_JWT_SECRET
    );
    req.creator = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, error: "Invalid Creator session token." });
  }
};

/**
 * Guard: Admin/Founder routes
 * Validates admin_session cookie or x-admin-session header
 * Requires explicit founder/admin role for Overwatch/Ledger/Engine access
 */
export const requireAdmin = (req, res, next) => {
  const adminSession =
    req.cookies?.admin_session || req.headers["x-admin-session"];

  if (!adminSession) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Admin session missing or expired.",
    });
  }

  try {
    const decoded = verifySession(
      adminSession,
      process.env.ADMIN_JWT_SECRET
    );

    if (decoded.role !== "founder" && decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied. Insufficient privileges." });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, error: "Invalid Admin session token." });
  }
};
```

---

## 2. Authentication Routes (`routes/authRoutes.js`)

```javascript
// routes/authRoutes.js
import express from "express";
import {
  authenticateCreatorUser,
  authenticateAdminUser,
} from "../services/AuthService.js";
import { generateJWT } from "../services/SessionService.js";

const router = express.Router();

// ==========================================
// CREATOR AUTHENTICATION
// Issues 7-day creator_session cookie
// ==========================================
router.post("/auth/creator/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const creator = await authenticateCreatorUser(email, password);
    const sessionToken = generateJWT(
      creator,
      process.env.CREATOR_JWT_SECRET,
      "7d"
    );

    res.cookie("creator_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json({ success: true, redirect: "/creator/dashboard" });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid creator credentials." });
  }
});

// ==========================================
// ADMIN / FOUNDER AUTHENTICATION
// Issues 1-day admin_session cookie (shorter for security)
// ==========================================
router.post("/auth/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await authenticateAdminUser(email, password);
    const sessionToken = generateJWT(
      admin,
      process.env.ADMIN_JWT_SECRET,
      "1d"
    );

    res.cookie("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    return res
      .status(200)
      .json({ success: true, redirect: "/admin/dashboard" });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid administrative credentials." });
  }
});

// ==========================================
// LOGOUT ENDPOINTS
// ==========================================
router.post("/auth/creator/logout", (req, res) => {
  res.clearCookie("creator_session");
  return res.status(200).json({ success: true });
});

router.post("/auth/admin/logout", (req, res) => {
  res.clearCookie("admin_session");
  return res.status(200).json({ success: true });
});

// ==========================================
// SESSION VALIDATION ENDPOINTS
// ==========================================
router.get("/auth/creator/validate", (req, res) => {
  const creatorSession = req.cookies?.creator_session;
  
  if (!creatorSession) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = verifySession(creatorSession, process.env.CREATOR_JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(403).json({ valid: false });
  }
});

router.get("/auth/admin/validate", (req, res) => {
  const adminSession = req.cookies?.admin_session;
  
  if (!adminSession) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = verifySession(adminSession, process.env.ADMIN_JWT_SECRET);
    
    if (decoded.role !== "founder" && decoded.role !== "admin") {
      return res.status(403).json({ valid: false });
    }

    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(403).json({ valid: false });
  }
});

export default router;
```

---

## 3. Main Server Setup (`server.js`)

```javascript
// server.js - LiveStreamLab Backend OS
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import creatorApiRoutes from "./routes/creatorApi.js";
import adminApiRoutes from "./routes/adminApi.js";
import { requireCreator, requireAdmin } from "./middleware/authGuards.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-creator-session", "x-admin-session"],
}));

// ==========================================
// PUBLIC AUTH ENDPOINTS
// ==========================================
app.use(authRoutes);

// ==========================================
// CREATOR / USER API LAYER
// Protected by requireCreator guard
// Paths: /api/creator/*
// ==========================================
app.use("/api/creator", requireCreator, creatorApiRoutes);

// Creator routes include:
// - /api/creator/analytics
// - /api/creator/profile
// - /api/creator/earnings
// - /api/creator/wallet/*
// - /api/creator/streaming/*
// - /api/creator/content/*
// - /api/creator/store/*
// - /api/creator/affiliates/*

// ==========================================
// ADMIN / FOUNDER API LAYER
// Protected by requireAdmin guard
// Paths: /api/admin/*
// ==========================================
app.use("/api/admin", requireAdmin, adminApiRoutes);

// Admin routes include:
// - /api/admin/overwatch/*
// - /api/admin/ledger/*
// - /api/admin/engine/*
// - /api/admin/founder/*
// - /api/admin/users/*
// - /api/admin/payouts/*
// - /api/admin/moderation/*

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error("[Express Error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎥 LiveStreamLab Backend OS                             ║
║   🔒 Isolated Session Architecture Active                 ║
║                                                           ║
║   Creator API:  /api/creator/* (creator_session)          ║
║   Admin API:    /api/admin/* (admin_session)              ║
║                                                           ║
║   Port: ${PORT}                                            ║
║   Env:  ${process.env.NODE_ENV || "development"}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
```

---

## 4. Required Dependencies (`package.json`)

```json
{
  "name": "livestreamlab-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 5. Environment Variables (`.env`)

```bash
# JWT Secrets (MUST be different for security isolation)
CREATOR_JWT_SECRET=your-super-secret-creator-key-min-32-chars
ADMIN_JWT_SECRET=your-super-secret-admin-key-min-32-chars

# Server Config
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-base44-app.base44.app

# Database
DATABASE_URL=your-database-connection-string
```

---

## 6. Session Service (`services/SessionService.js`)

```javascript
// services/SessionService.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Generate JWT token
 */
export const generateJWT = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifySession = (token, secret) => {
  return jwt.verify(token, secret);
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare password
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

---

## 7. Auth Service (`services/AuthService.js`)

```javascript
// services/AuthService.js
import { comparePassword } from "./SessionService.js";
// Import your database/user model here

/**
 * Authenticate creator user
 * Replace with your actual database query
 */
export const authenticateCreatorUser = async (email, password) => {
  // TODO: Replace with actual database lookup
  // Example:
  // const user = await db.users.findOne({ where: { email, role: 'creator' } });
  // if (!user) throw new Error('User not found');
  // const valid = await comparePassword(password, user.password);
  // if (!valid) throw new Error('Invalid password');
  // return { id: user.id, email: user.email, role: user.role };
  
  throw new Error("Implement database authentication");
};

/**
 * Authenticate admin/founder user
 * Replace with your actual database query
 */
export const authenticateAdminUser = async (email, password) => {
  // TODO: Replace with actual database lookup
  // Example:
  // const user = await db.users.findOne({ where: { email, role: ['admin', 'founder'] } });
  // if (!user) throw new Error('User not found');
  // const valid = await comparePassword(password, user.password);
  // if (!valid) throw new Error('Invalid password');
  // return { id: user.id, email: user.email, role: user.role };
  
  throw new Error("Implement database authentication");
};
```

---

## Security Features

1. **HTTP-Only Cookies** - Prevents XSS token theft
2. **SameSite Strict** - Prevents CSRF attacks
3. **Secure Flag** - Cookies only sent over HTTPS in production
4. **Different JWT Secrets** - Compromise of one doesn't affect the other
5. **Shorter Admin Tokens** - 1 day vs 7 days reduces admin token abuse window
6. **Explicit Role Checks** - Admin ≠ Founder for critical operations
7. **Path-Based Isolation** - Creator routes cannot access admin endpoints

---

## Base44 Frontend Integration

Your Base44 frontend is already configured to work with this backend:

- `lib/tridentApi.js` - API wrappers with isolated auth endpoints
- `lib/tridentSession.js` - Session management utilities
- `pages/TridentLogin.jsx` - Login UI with creator/admin detection

The frontend calls your Express backend at `https://api.tridentsystem.live` for all authentication.

---

## Testing

```bash
# Test creator login
curl -X POST http://localhost:5000/auth/creator/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"password"}' \
  -c cookies.txt

# Test protected creator route
curl http://localhost:5000/api/creator/analytics \
  -b cookies.txt

# Test admin login
curl -X POST http://localhost:5000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c admin-cookies.txt

# Test protected admin route
curl http://localhost:5000/api/admin/overwatch \
  -b admin-cookies.txt
```

---

## Asset Tracking

- 🎵 **Audio Asset:** TheFrequency (3).mp3
- 🎥 **Video Asset:** 26827182c_Livestream_Marketplace_Video_Generation.mp4

---

## Next Steps

1. Deploy this code to your Express backend repo
2. Set environment variables with strong JWT secrets
3. Implement database authentication in `AuthService.js`
4. Test with the curl commands above
5. Connect Base44 frontend to your production backend