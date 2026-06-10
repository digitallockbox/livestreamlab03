# LiveStreamLab Backend OS - Session Isolation Architecture

## 🔒 Security Overview

This backend implements **isolated session architecture** with hard security boundaries between creator and admin access at the API level.

## Session Types

| Session Type | Duration | JWT Secret | Cookie Name | Access Paths |
|-------------|----------|------------|-------------|--------------|
| **Creator** | 7 days | `CREATOR_JWT_SECRET` | `creator_session` | `/api/creator/*` |
| **Admin** | 1 day | `ADMIN_JWT_SECRET` | `admin_session` | `/api/admin/*` |

## File Structure

```
backend/
├── middleware/
│   └── authGuards.js          # requireCreator, requireAdmin guards
├── routes/
│   ├── authRoutes.js          # Isolated login/logout/validate endpoints
│   ├── creatorApi.js          # Creator-facing API routes
│   └── adminApi.js            # Admin/Founder API routes
├── services/
│   ├── AuthService.js         # authenticateCreatorUser, authenticateAdminUser
│   └── SessionService.js      # generateJWT, verifySession
├── server.js                  # Main Express application
└── .env                       # Environment variables (JWT secrets)
```

## Authentication Flow

### Creator Login
```
POST /auth/creator/login
Body: { email, password }
→ authenticateCreatorUser()
→ generateJWT(creator, CREATOR_JWT_SECRET, '7d')
→ Set cookie: creator_session
→ Response: { success: true, redirect: '/creator/dashboard' }
```

### Admin Login
```
POST /auth/admin/login
Body: { email, password }
→ authenticateAdminUser()
→ generateJWT(admin, ADMIN_JWT_SECRET, '1d')
→ Set cookie: admin_session
→ Response: { success: true, redirect: '/admin/dashboard' }
```

### Protected Route Access
```
GET /api/creator/analytics
Headers: Cookie: creator_session=eyJ...
→ requireCreator middleware
→ verifySession(token, CREATOR_JWT_SECRET)
→ req.creator = decoded
→ Next: creatorApiRoutes
```

## Environment Variables

Required secrets (set in `.env`):

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

## Security Features

1. **HTTP-Only Cookies** - Prevents XSS token theft
2. **SameSite Strict** - Prevents CSRF attacks
3. **Secure Flag** - Cookies only sent over HTTPS in production
4. **Different JWT Secrets** - Compromise of one doesn't affect the other
5. **Shorter Admin Tokens** - 1 day vs 7 days reduces admin token abuse window
6. **Explicit Role Checks** - Admin ≠ Founder for critical operations
7. **Path-Based Isolation** - Creator routes cannot access admin endpoints

## API Endpoints

### Public Auth
- `POST /auth/creator/login` - Creator login
- `POST /auth/admin/login` - Admin/Founder login
- `POST /auth/creator/logout` - Clear creator session
- `POST /auth/admin/logout` - Clear admin session
- `GET /auth/creator/validate` - Validate creator session
- `GET /auth/admin/validate` - Validate admin session

### Creator API (Protected)
- `/api/creator/analytics`
- `/api/creator/profile`
- `/api/creator/earnings`
- `/api/creator/wallet/*`
- `/api/creator/streaming/*`
- `/api/creator/content/*`
- `/api/creator/store/*`
- `/api/creator/affiliates/*`

### Admin API (Protected)
- `/api/admin/overwatch/*`
- `/api/admin/ledger/*`
- `/api/admin/engine/*`
- `/api/admin/founder/*`
- `/api/admin/users/*`
- `/api/admin/payouts/*`
- `/api/admin/moderation/*`

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Missing or expired session cookie |
| 403 | Invalid token or insufficient privileges |
| 500 | Server error |

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

## Production Checklist

- [ ] Set strong, unique `CREATOR_JWT_SECRET` (min 32 chars)
- [ ] Set strong, unique `ADMIN_JWT_SECRET` (min 32 chars)
- [ ] Enable HTTPS for secure cookies
- [ ] Configure CORS with specific origins
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up monitoring for failed auth attempts
- [ ] Regular secret rotation schedule
- [ ] Audit log for admin/founder operations
- [ ] Database session backup (optional)

## Related Files

- `middleware/authGuards.js` - Session validation guards
- `routes/authRoutes.js` - Authentication endpoints
- `services/AuthService.js` - User authentication logic
- `services/SessionService.js` - JWT generation/verification
- `routes/creatorApi.js` - Creator API routes
- `routes/adminApi.js` - Admin API routes