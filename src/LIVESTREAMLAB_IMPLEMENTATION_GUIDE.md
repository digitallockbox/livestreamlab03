# LiveStreamLab.live - Creator App Implementation Guide

## Overview
LiveStreamLab.live is a **creator-only application** built on Base44 (Vite + React) that connects to the Trident OS backend at `https://api.livestreamlab.live`.

---

## 1. Routing Structure

### Public Routes (No Authentication)
```
/ → Landing page
/explore → Content discovery
/user/:username → Public creator profile
/auth/login → Creator login
/auth/register → Creator registration
/onboarding → New creator onboarding
/stream/:id → Live stream viewer
/store/product/:id → Product page
/checkout → Checkout
```

### Creator Routes (Require creator_session)
All creator routes use the `/creator/*` prefix:

```
/creator/dashboard → Dashboard overview
/creator/streams → Streams hub
/creator/streams/go-live → Go Live page
/creator/streams/:id → Individual stream
/creator/streams/analytics → Stream analytics

/creator/videos → Video library
/creator/videos/upload → Upload video
/creator/videos/:id → Video player
/creator/videos/manager → Video manager
/creator/videos/analytics → Video analytics

/creator/audio → Audio/podcast library
/creator/audio/upload → Upload audio
/creator/audio/:id → Podcast episode
/creator/audio/manager → Podcast manager
/creator/audio/analytics → Podcast analytics

/creator/store → Store dashboard
/creator/store/products → Product list
/creator/store/add → Add product
/creator/store/orders → Orders

/creator/affiliates → Affiliate dashboard
/creator/affiliates/add → Add link
/creator/affiliates/links → Link list
/creator/affiliates/manager → Affiliate manager

/creator/vault → Vault overview
/creator/vault/transactions → Transactions
/creator/vault/payouts → Payout history
/creator/vault/team → Team splits

/creator/analytics → Analytics overview

/creator/settings → Settings (profile)
/creator/settings/profile → Profile settings
/creator/settings/security → Security settings
/creator/settings/branding → Branding settings
/creator/settings/notifications → Notification settings
/creator/settings/connected → Connected accounts
```

**Legacy Routes:** Old routes (e.g., `/dashboard`, `/videos`, `/store`) redirect to their `/creator/*` equivalents for backwards compatibility.

---

## 2. Backend API Integration

### Base URL
```javascript
const BASE_URL = 'https://api.livestreamlab.live';
```

### Authentication Flow
```javascript
// POST /auth/creator/login
const result = await authApi.creatorLogin({ email, password });
// Returns: { success: true, redirect: '/creator/dashboard' }
```

### Session Management
- **Cookie:** `creator_session` (JWT)
- **Domain:** `livestreamlab.live`
- **Expiry:** 7 days
- **HttpOnly:** true
- **Secure:** true
- **SameSite:** strict

### Backend Middleware (Express)
```typescript
async function requireCreator(req, res, next) {
  const token = req.cookies.creator_session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const session = await sessionService.verifyCreatorSession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  req.creator = { id: session.creatorId };
  next();
}
```

---

## 3. API Endpoints

### Dashboard
```
GET /creator/dashboard → { liveStreams, videoCount, vaultBalance, followers }
```

### Streams
```
GET  /creator/streams → { streams: [...] }
POST /creator/streams → { stream: {...} }
GET  /creator/streams/:id → { stream: {...} }
PUT  /creator/streams/:id → { stream: {...} }
```

### Videos
```
GET  /creator/videos → { videos: [...] }
POST /creator/videos/upload → { video: {...} }
GET  /creator/videos/:id → { video: {...} }
PUT  /creator/videos/:id → { video: {...} }
DELETE /creator/videos/:id → { success: true }
```

### Audio/Podcasts
```
GET  /creator/audio → { episodes: [...] }
POST /creator/audio/upload → { episode: {...} }
GET  /creator/audio/:id → { episode: {...} }
PUT  /creator/audio/:id → { episode: {...} }
```

### Store
```
GET  /creator/store → { products: [...], orders: [...] }
GET  /creator/store/products → { products: [...] }
POST /creator/store/add → { product: {...} }
PUT  /creator/store/products/:id → { product: {...} }
```

### Affiliates
```
GET  /creator/affiliates → { links: [...], stats: {...} }
POST /creator/affiliates/add → { link: {...} }
PUT  /creator/affiliates/links/:id → { link: {...} }
```

### Vault
```
GET  /creator/vault → { balance, splits, payouts }
GET  /creator/vault/transactions → { transactions: [...] }
GET  /creator/vault/payouts → { payouts: [...] }
GET  /creator/vault/team → { splits: [...] }
POST /creator/vault/team → { splits: [...] }
```

### Settings
```
GET  /creator/settings/profile → { profile: {...} }
POST /creator/settings/profile → { profile: {...} }
PUT  /creator/settings/branding → { branding: {...} }
PUT  /creator/settings/security → { success: true }
```

---

## 4. Frontend Implementation

### API Client (lib/tridentApi.js)
```javascript
const BASE_URL = 'https://api.livestreamlab.live';

async function call(path, body = {}, method = 'POST', includeCredentials = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
    credentials: includeCredentials ? 'include' : 'omit',
  });

  if (!res.ok) {
    throw new Error(`[TridentAPI] ${path} → ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  creatorLogin: (body) => call('/auth/creator/login', body, 'POST', true),
  // ...
};

export const creatorApi = {
  analytics: (body) => call('/creator/analytics', body),
  // ...
};
```

### Usage in Pages
```javascript
import { creatorApi } from '@/lib/tridentApi';

// In component
const data = await creatorApi.analytics({});
```

---

## 5. Layout & Navigation

### Sidebar Navigation (components/layout/AppLayout.jsx)
Organized by section:
- **Dashboard** → Overview, Analytics
- **Streams** → Go Live, All Streams, Analytics
- **Videos** → Library, Upload, Manager, Analytics
- **Audio** → Library, Upload, Manager, Analytics
- **Store** → Dashboard, Products, Add, Orders
- **Affiliates** → Dashboard, Add Link, Links, Manager
- **Vault** → Overview, Transactions, Payouts, Team Splits
- **Settings** → Profile, Branding, Security, Notifications, Connected

---

## 6. Security

### Domain Lock
- All cookies scoped to `livestreamlab.live`
- All API calls to `https://api.livestreamlab.live`
- No cross-origin requests allowed

### Session Isolation
- Creator sessions (`creator_session`) separate from admin sessions
- Backend middleware enforces role-based access
- Frontend routes guarded by authentication checks

### API Security
- All creator endpoints require `requireCreator` middleware
- JWT validation on every request
- Rate limiting on auth endpoints
- CORS restricted to `*.livestreamlab.live`

---

## 7. Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://api.livestreamlab.live
```

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
SESSION_EXPIRY=604800000  # 7 days
CORS_ORIGIN=https://livestreamlab.live
```

---

## 8. File Structure

```
src/
├── App.jsx → Main router
├── components/
│   └── layout/
│       └── AppLayout.jsx → Creator sidebar + header
├── lib/
│   └── tridentApi.js → API client
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── TridentLogin.jsx
│   ├── streaming/
│   ├── videos/
│   ├── podcasts/
│   ├── store/
│   ├── affiliates/
│   ├── vault/
│   └── settings/
└── functions/
    └── tridentProxy.js → Backend proxy (optional)
```

---

## 9. Deployment

### Frontend (Base44)
- Deployed on Base44 platform
- Vite build process
- React 18 + React Router v6

### Backend (Express)
- Deployed separately (e.g., Railway, Render, AWS)
- Node.js + Express
- PostgreSQL database
- Redis for session storage (optional)

---

## 10. Summary

**LiveStreamLab.live** is now a fully operational creator-only app with:
- ✅ Clean `/creator/*` routing structure
- ✅ Backend API integration at `api.livestreamlab.live`
- ✅ Secure session management with `creator_session` cookies
- ✅ Complete creator dashboard, streaming, video, audio, store, affiliate, and vault features
- ✅ Production-ready security with domain lock and role-based access

All routes are configured in `App.jsx`, navigation in `AppLayout.jsx`, and API calls proxy through `lib/tridentApi.js` to the Trident OS backend.