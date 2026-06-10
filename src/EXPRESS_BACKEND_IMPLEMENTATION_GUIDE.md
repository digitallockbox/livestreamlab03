# 🎥 LiveStreamLab Backend OS - Express Implementation Guide

## ⚠️ Important: This Code Goes in Your SEPARATE Express Backend Repo

**DO NOT** place these files in Base44's `functions/` folder. Base44 uses Deno, not Express/Node.js.

Create these files in your **separate Express backend repository** (the one running at `api.tridentsystem.live`).

---

## 📁 File Structure (Express Backend Repo)

```
backend-os/
├── middleware/
│   └── authGuards.js          ← Session isolation guards
├── routes/
│   ├── authRoutes.js          ← Isolated login endpoints
│   ├── creatorApi.js          ← Creator API routes
│   └── adminApi.js            ← Admin/Founder API routes
├── services/
│   ├── AuthService.js         ← User authentication logic
│   └── SessionService.js      ← JWT generation/verification
├── server.js                  ← Main Express app
├── package.json
└── .env                       ← JWT secrets (DO NOT COMMIT)
```

---

## 1. middleware/authGuards.js

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

## 2. routes/authRoutes.js

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

## 3. server.js

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

## 4. services/SessionService.js

```javascript
// services/SessionService.js
import jwt from "jsonwebtoken";

/**
 * Generate JWT token with specified secret and expiration
 */
export const generateJWT = (payload, secret, expiresIn = "1d") => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token and return decoded payload
 */
export const verifySession = (token, secret) => {
  return jwt.verify(token, secret);
};
```

---

## 5. services/AuthService.js

```javascript
// services/AuthService.js
import { db } from "../config/database.js"; // Your database connection

/**
 * Authenticate creator user
 * Replace with your actual authentication logic
 */
export const authenticateCreatorUser = async (email, password) => {
  // TODO: Implement your database lookup and password verification
  // Example:
  // const user = await db.users.findOne({ email });
  // if (!user || !await bcrypt.compare(password, user.password)) {
  //   throw new Error("Invalid credentials");
  // }
  // return { id: user.id, email: user.email, role: user.role };
  
  throw new Error("Not implemented - add your authentication logic");
};

/**
 * Authenticate admin/founder user
 * Replace with your actual authentication logic
 */
export const authenticateAdminUser = async (email, password) => {
  // TODO: Implement your database lookup and password verification
  throw new Error("Not implemented - add your authentication logic");
};
```

---

## 6. .env (DO NOT COMMIT)

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

## 7. package.json Dependencies

```json
{
  "name": "livestreamlab-backend-os",
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

## ✅ Base44 Frontend Integration (Already Done)

The Base44 frontend is already configured to work with this backend:

- ✅ `lib/tridentApi.js` - Updated with isolated auth endpoints
- ✅ `pages/TridentLogin.jsx` - Integrated with creator/admin login
- ✅ `lib/tridentSession.js` - Session manager using new endpoints

---

## 🔒 Security Architecture

| Feature | Implementation |
|---------|---------------|
| **Separate Sessions** | Creator (7d) vs Admin (1d) with different JWT secrets |
| **HTTP-Only Cookies** | Prevents XSS token theft |
| **SameSite Strict** | Prevents CSRF attacks |
| **Secure Flag** | HTTPS-only in production |
| **Path Isolation** | `/api/creator/*` vs `/api/admin/*` |
| **Role Verification** | Explicit founder/admin checks for critical operations |

---

## 🚀 Next Steps

1. **Create these files** in your Express backend repo
2. **Set environment variables** with strong JWT secrets
3. **Implement AuthService** with your database logic
4. **Deploy backend** to your hosting provider
5. **Update FRONTEND_URL** in .env to match your Base44 app URL

---

## 📋 API Endpoints Summary

### Public Auth
- `POST /auth/creator/login` - Creator login
- `POST /auth/admin/login` - Admin/Founder login
- `POST /auth/creator/logout` - Clear creator session
- `POST /auth/admin/logout` - Clear admin session
- `GET /auth/creator/validate` - Validate creator session
- `GET /auth/admin/validate` - Validate admin session

### Protected Routes
- `/api/creator/*` - Requires valid `creator_session` cookie
- `/api/admin/*` - Requires valid `admin_session` cookie + admin/founder role

---

**Base44 functions folder should ONLY contain:**
- `tridentProxy.js` - Your existing Deno-based proxy function

All Express backend code lives in your **separate backend repository**.