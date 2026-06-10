# 🚀 Quick Start: Isolated Session Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Base44 Frontend (React)                      │
│  pages/TridentLogin.jsx → lib/tridentApi.js → fetch() calls    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│           Express Backend (api.tridentsystem.live)              │
│  server.js → authRoutes.js → authGuards.js → creatorApi.js     │
│                          → adminApi.js → services/              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Isolation Matrix

| Session Type | Cookie Name | JWT Secret | Duration | Access |
|-------------|-------------|------------|----------|---------|
| **Creator** | `creator_session` | `CREATOR_JWT_SECRET` | 7 days | `/api/creator/*` |
| **Admin** | `admin_session` | `ADMIN_JWT_SECRET` | 1 day | `/api/admin/*` |

---

## Files to Create in Express Backend Repo

```
backend/
├── middleware/
│   └── authGuards.js          # requireCreator, requireAdmin
├── routes/
│   ├── authRoutes.js          # Login/logout/validate endpoints
│   ├── creatorApi.js          # Creator API routes
│   └── adminApi.js            # Admin API routes
├── services/
│   ├── AuthService.js         # authenticateCreatorUser, authenticateAdminUser
│   └── SessionService.js      # generateJWT, verifySession
├── server.js                  # Main Express app
├── .env                       # Environment variables
└── package.json               # Dependencies
```

---

## Environment Variables Required

```bash
# JWT Secrets (MUST be different - use 32+ character random strings)
CREATOR_JWT_SECRET=super-secret-creator-key-change-this
ADMIN_JWT_SECRET=super-secret-admin-key-change-this

# Server Config
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-base44-app.base44.app

# Database
DATABASE_URL=your-database-connection-string
```

---

## Base44 Frontend Status ✅

Your Base44 frontend is already configured:

- ✅ `lib/tridentApi.js` - Updated with isolated auth endpoints
- ✅ `lib/tridentSession.js` - Session management utilities
- ✅ `pages/TridentLogin.jsx` - Integrated with creator/admin login
- ✅ `functions/tridentProxy.js` - Backend proxy for API calls

---

## Testing Flow

1. **Creator Login**
   ```
   User enters credentials → TridentLogin.jsx
   → authApi.creatorLogin({email, password})
   → POST https://api.tridentsystem.live/auth/creator/login
   → Backend sets creator_session cookie (7 days)
   → Redirect to /dashboard
   ```

2. **Admin Login**
   ```
   User enters credentials → TridentLogin.jsx
   → authApi.adminLogin({email, password})
   → POST https://api.tridentsystem.live/auth/admin/login
   → Backend sets admin_session cookie (1 day)
   → Redirect to /admin
   ```

3. **API Calls**
   ```
   Frontend call → fetch('/api/creator/...') with credentials: 'include'
   → Express receives creator_session cookie
   → requireCreator guard validates JWT
   → creatorApi.js route handler executes
   ```

---

## Security Checklist

- [ ] Set strong, unique `CREATOR_JWT_SECRET` (32+ chars)
- [ ] Set strong, unique `ADMIN_JWT_SECRET` (different from creator)
- [ ] Enable HTTPS for secure cookie transmission
- [ ] Configure CORS with specific origins
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up monitoring for failed auth attempts
- [ ] Regular secret rotation schedule
- [ ] Audit log for admin/founder operations

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Cookies not being set | Check `credentials: 'include'` in fetch calls |
| CORS errors | Add your Base44 domain to CORS origin whitelist |
| Session validation fails | Verify JWT secrets match between frontend/backend |
| 401 Unauthorized | Check cookie name matches (creator_session vs admin_session) |

---

## Next Steps

1. Copy code from `BACKEND_IMPLEMENTATION_GUIDE.md` to your Express backend repo
2. Install dependencies: `npm install`
3. Set environment variables with strong secrets
4. Implement database authentication in `AuthService.js`
5. Deploy to your backend hosting
6. Test login flows with Base44 frontend

---

## Asset Tracking

- 🎵 **Audio Asset:** TheFrequency (3).mp3
- 🎥 **Video Asset:** 26827182c_Livestream_Marketplace_Video_Generation.mp4