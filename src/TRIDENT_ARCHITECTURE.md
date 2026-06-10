# Trident OS + LiveStreamLab - Production Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIDENT OS (Core Backend)                │
│                  api.trident-system.live                    │
├─────────────────────────────────────────────────────────────┤
│  Authentication: /auth/admin/login, /auth/creator/login     │
│  Admin APIs:     /api/admin/*                               │
│  Creator APIs:   /api/creator/*                             │
│  Ledger:         /ledger/*                                  │
│  Engine:         /engine/*                                  │
│  Nodes:          /nodes/*                                   │
│  Streams:        /streams/*                                 │
│  Explorer:       /explorer/*                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LiveStreamLab.live (Frontend App)              │
│                  livestreamlab.live                         │
├─────────────────────────────────────────────────────────────┤
│  Public Pages:  /, /explore, /user/:username               │
│  Creator App:   /creator/*                                 │
│  Admin App:     /admin/*                                   │
│  Viewer App:    /stream/*, /videos/*, /store/*             │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain Architecture

### TRIDENT OS (Backend Services)
**Primary Domains:**
- `api.trident-system.live` - Main API endpoint
- `trident.livestreamlab.live` - Alternative API domain
- `trident-system.live` - System services
- `tridentautosplit.com` - Auto-split service

**Purpose:** Core operating system providing authentication, data storage, settlement engine, and all backend services.

### LiveStreamLab.live (Frontend Application)
**Primary Domains:**
- `livestreamlab.live` - Main application
- `www.livestreamlab.live` - Redirect to main domain

**Purpose:** User-facing application for creators, viewers, and admins. Calls Trident OS for all data and operations.

---

## Authentication Flow

### Creator Authentication
```
1. Creator visits livestreamlab.live/creator/login
2. Enters email + password
3. LiveStreamLab → POST api.trident-system.live/auth/creator/login
4. Trident validates credentials
5. Trident → Returns creator_session JWT
6. LiveStreamLab stores session in cookie (domain: livestreamlab.live)
7. Creator dashboard loads with real data from Trident
```

### Admin Authentication
```
1. Admin visits livestreamlab.live/admin
2. Enters admin@livestreamlab.live + password
3. LiveStreamLab → POST api.trident-system.live/auth/admin/login
4. Trident validates admin credentials
5. Trident → Returns admin_session JWT
6. LiveStreamLab stores session in cookie (domain: livestreamlab.live)
7. TRIDENT-ADMIN loads with real metrics from Trident OS
```

---

## Session Isolation

### Admin Session
```javascript
{
  name: 'admin_session',
  domain: 'livestreamlab.live',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
}
```

**Access:**
- `/admin/*`
- `/trident/admin`
- `/engine/*`
- `/ledger/*`
- `/overwatch/*`

### Creator Session
```javascript
{
  name: 'creator_session',
  domain: 'livestreamlab.live',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
}
```

**Access:**
- `/creator/*`
- `/dashboard`
- `/upload`
- `/streams`
- `/earnings`
- `/store/*`
- `/affiliates/*`

**Sessions never overlap** - admin session cannot access creator routes and vice versa.

---

## API Endpoints

### Authentication
```
POST /auth/admin/login
POST /auth/creator/login
POST /auth/admin/logout
POST /auth/creator/logout
GET  /auth/admin/validate
GET  /auth/creator/validate
```

### Admin APIs
```
GET  /api/admin/metrics
GET  /api/admin/nodes
GET  /api/admin/streams
GET  /api/admin/ledger
GET  /api/admin/explorer
GET  /api/admin/users
POST /api/admin/users/ban
POST /api/admin/users/verify
```

### Creator APIs
```
GET  /api/creator/analytics
GET  /api/creator/earnings
GET  /api/creator/streams
GET  /api/creator/videos
POST /api/creator/upload
PUT  /api/creator/profile
GET  /api/creator/products
POST /api/creator/products
```

### Ledger & Engine
```
GET  /ledger/balance
GET  /ledger/transactions
POST /ledger/transfer
POST /ledger/settlement
GET  /engine/status
POST /engine/restart
POST /engine/mode
```

### Block Explorer
```
GET  /explorer/blocks
GET  /explorer/block/:height
GET  /explorer/transaction/:hash
GET  /explorer/address/:address
GET  /explorer/stats
```

---

## Admin Identity

**Root Admin Account:**
```
Email: Livestreamlab@livestreamlab.live
Role:  founder
Access: Full system access
```

**Restricted Access:**
Only `Livestreamlab@livestreamlab.live` can access:
- TRIDENT-ADMIN dashboard
- Overwatch monitoring
- Ledger controls
- Engine management
- Node status
- Block Explorer admin
- Routing registry
- Feature flags
- System restart

**Security:**
- Email is hardcoded in authentication
- Domain-restricted session
- 24-hour session expiry
- Audit logging on all actions

---

## Data Flow

### Creator Dashboard
```
Creator Browser
    ↓
LiveStreamLab.live (/creator/dashboard)
    ↓ (API call)
Trident OS (/api/creator/analytics)
    ↓ (database query)
PostgreSQL / Redis
    ↓ (response)
Trident OS → LiveStreamLab → Creator
```

### Admin Dashboard
```
Admin Browser
    ↓
LiveStreamLab.live (/admin)
    ↓ (API call)
Trident OS (/api/admin/metrics)
    ↓ (database query)
PostgreSQL / Redis
    ↓ (response)
Trident OS → LiveStreamLab → Admin
```

**Key Principle:**
- Trident OS = Source of truth
- LiveStreamLab = Presentation layer
- All data flows downward from Trident
- No data originates from LiveStreamLab

---

## Deployment Architecture

### Trident OS (External Node.js Backend)
```yaml
Services:
  - API Gateway (Express.js)
  - Authentication Service
  - Settlement Engine
  - Ingestion Worker
  - PostgreSQL Database
  - Redis Cache
  
Deployment:
  - VPS / Cloud Server
  - Docker Compose or Kubernetes
  - Domain: api.trident-system.live
  - SSL: Let's Encrypt
```

### LiveStreamLab (Base44 Frontend)
```yaml
Services:
  - React SPA
  - Backend Functions (Deno)
  - tridentProxy (API Gateway)
  
Deployment:
  - Base44 Platform
  - Custom Domain: livestreamlab.live
  - SSL: Base44 managed
```

---

## Environment Variables

### Trident OS (.env)
```env
# Server
NODE_ENV=production
PORT=3001
DOMAIN=trident-system.live

# Database
DATABASE_URL=postgresql://trident:password@localhost:5432/trident_prod
REDIS_URL=redis://localhost:6379

# Authentication
ADMIN_JWT_SECRET=<32+ chars>
CREATOR_JWT_SECRET=<32+ chars>
FOUNDER_JWT_SECRET=<32+ chars>

# Admin Identity
ADMIN_EMAIL=Livestreamlab@livestreamlab.live

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### LiveStreamLab (.env)
```env
VITE_TRIDENT_API=https://api.trident-system.live
VITE_BASE_URL=https://livestreamlab.live
VITE_ADMIN_EMAIL=Livestreamlab@livestreamlab.live
```

---

## Base44 Integration

### tridentProxy Function
```javascript
// functions/tridentProxy.js
const TRIDENT_BASE = "https://api.trident-system.live";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  const { method, path, body, session_token } = await req.json();
  
  // Validate session based on path
  const requiredSession = getRequiredSessionType(path);
  
  if (requiredSession === 'admin') {
    const validation = validateAdminSession(session_token);
    // Enforce admin email lock
    if (validation.user.email !== 'livestreamlab@livestreamlab.live') {
      return Response.json({ error: 'Admin access restricted' }, { status: 403 });
    }
  }
  
  // Forward to Trident OS
  const res = await fetch(`${TRIDENT_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Type': requiredSession,
      'X-User-ID': user.id,
      'X-User-Email': user.email
    },
    body: JSON.stringify(body)
  });
  
  return Response.json(await res.json());
});
```

---

## Routing Map

### Public Routes (No Auth)
```
/ → Landing page
/explore → Content discovery
/user/:username → Public creator profile
/stream/:id → Live stream viewer
/videos/:id → Video player
/store/product/:id → Product page
```

### Creator Routes (creator_session)
```
/creator/login → Creator login
/creator/dashboard → Dashboard
/creator/upload → Upload content
/creator/streams → Stream management
/creator/earnings → Earnings & payouts
/creator/store → Product management
/creator/affiliates → Affiliate links
```

### Admin Routes (admin_session)
```
/admin → TRIDENT-ADMIN dashboard
/admin/metrics → Platform metrics
/admin/nodes → Node status
/admin/ledger → Ledger controls
/admin/explorer → Block Explorer admin
/admin/users → User management
/admin/flags → Feature flags
```

---

## Security Model

### Session Validation
```javascript
// Every API call validates:
1. Session token exists
2. Token is not expired
3. Token domain matches livestreamlab.live
4. Token role matches route requirements
5. Admin email matches Livestreamlab@livestreamlab.live
```

### Domain Lock
```javascript
// All cookies set with:
domain: 'livestreamlab.live'
secure: true
sameSite: 'strict'
```

### API Rate Limiting
```javascript
// Prevent abuse:
- 100 requests per 15 minutes per IP
- Stricter limits on auth endpoints
- Separate limits for admin vs creator
```

---

## Monitoring & Logging

### Trident OS Logs
```
- All authentication attempts
- All admin actions
- All ledger transactions
- All engine operations
- Error rates and latency
- Node health status
```

### LiveStreamLab Logs
```
- Page views and navigation
- API call success/failure
- Session creation/destruction
- User interactions
- Performance metrics
```

---

## Summary

**Trident OS** = Core operating system (backend)
- Runs on `api.trident-system.live`
- Provides all APIs and data
- Manages authentication and sessions
- Controls ledger, engine, nodes

**LiveStreamLab.live** = User-facing application (frontend)
- Runs on `livestreamlab.live`
- Calls Trident OS for everything
- Displays data, handles user interactions
- No independent data storage

**Admin Identity** = `Livestreamlab@livestreamlab.live`
- Only account with admin access
- Full system control
- Domain and email locked

**Sessions** = Isolated by role
- Admin: 24 hours, admin-only routes
- Creator: 7 days, creator-only routes
- Never overlap

This is the final, correct, production architecture.