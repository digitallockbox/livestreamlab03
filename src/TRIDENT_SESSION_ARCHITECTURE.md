# TridentOS Session Isolation Architecture

## Security Boundary Implementation

This document outlines the isolated session architecture that enforces strict separation between creator and admin access at the API level.

## Core Principles

1. **Separate Sessions**: Creator and admin sessions use different JWT secrets, expiration times, and cookie names
2. **Path-Based Routing**: API endpoints are strictly partitioned by session type
3. **Defense in Depth**: Multiple validation layers (Base44 auth + session token + role verification)

## Session Types

### Creator Session
- **Duration**: 7 days
- **JWT Secret**: `CREATOR_JWT_SECRET`
- **Cookie Name**: `creator_session`
- **Access Paths**: `/creator/*`, `/wallet/*`, `/content/*`, `/store/*`, `/affiliates/*`, `/dashboard`
- **Roles**: `creator`, `user`

### Admin Session
- **Duration**: 1 day (shorter for security)
- **JWT Secret**: `ADMIN_JWT_SECRET`
- **Cookie Name**: `admin_session`
- **Access Paths**: `/admin/*`, `/founder/*`, `/overwatch/*`, `/ledger/*`, `/engine/*`, `/users/*`
- **Roles**: `admin`, `founder`

### Founder-Only Paths
- **Paths**: `/engine/restart`, `/ledger/process-payout`, `/founder/*`
- **Required Role**: `founder` (not just `admin`)

## Backend Implementation

### tridentProxy.js

The backend proxy enforces session isolation through:

1. **Base44 Authentication**: Verifies user is logged into Base44
2. **Session Token Validation**: Validates JWT token against appropriate secret
3. **Path-Based Access Control**: Routes request to correct session type
4. **Role Verification**: Checks explicit role for founder-only operations

```javascript
// Session validation flow
const requiredSession = getRequiredSessionType(path);

if (requiredSession === 'admin') {
  const validation = validateAdminSession(session_token);
  if (!validation.valid) return 401;
  
  if (isFounderOnlyPath(path) && validation.user.role !== 'founder') {
    return 403; // Forbidden
  }
}
```

## Frontend Integration

### Using tridentSession.js

```javascript
import { creatorLogin, adminLogin, callTridentAPI } from '@/lib/tridentSession';

// Creator login
const result = await creatorLogin('creator@example.com', 'password');
if (result.success) {
  window.location.href = result.redirect;
}

// Admin login
const result = await adminLogin('admin@example.com', 'password');
if (result.success) {
  window.location.href = result.redirect;
}

// API calls (session automatically included)
const dashboard = await callTridentAPI('/creator/dashboard');
const overwatch = await callTridentAPI('/admin/overwatch/status', 'GET', null, 'admin');
```

## Environment Variables

Required secrets (set in Trident backend, NOT in Base44):

```bash
CREATOR_JWT_SECRET=<strong-random-secret>
ADMIN_JWT_SECRET=<different-strong-random-secret>
NODE_ENV=production
```

## Security Features

1. **HTTP-Only Cookies**: Prevents XSS token theft
2. **SameSite Strict**: Prevents CSRF attacks
3. **Secure Flag**: Cookies only sent over HTTPS in production
4. **Different JWT Secrets**: Compromise of one doesn't affect the other
5. **Shorter Admin Tokens**: Reduced window for admin token abuse
6. **Explicit Role Checks**: Admin ≠ Founder for critical operations

## Request Flow

```
User → Base44 Frontend → tridentProxy (Base44 Function) → Trident API
         ↓                      ↓                            ↓
    Base44 Auth          Session Validation            Business Logic
    (user.role)          (JWT + Role Check)            (Path Execution)
```

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid session token |
| 403 | Valid token but insufficient role/privileges |
| 400 | Invalid path or request format |
| 500 | Backend error |

## Audit Trail

All requests through tridentProxy include:
- `X-Session-Type`: creator or admin
- `X-User-ID`: Base44 user ID
- `X-User-Email`: Base44 user email
- `X-Admin-ID`: Admin session ID (if admin)
- `X-Admin-Role`: Admin role (if admin)

## Production Checklist

- [ ] Set strong, unique `CREATOR_JWT_SECRET`
- [ ] Set strong, unique `ADMIN_JWT_SECRET`
- [ ] Enable HTTPS for secure cookies
- [ ] Configure CORS with specific origins
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up monitoring for failed auth attempts
- [ ] Regular secret rotation schedule
- [ ] Audit log for admin/founder operations

## Related Files

- `functions/tridentProxy.js` - Backend session guards
- `lib/tridentSession.js` - Frontend session management
- `lib/creatorApi.js` - Creator API wrappers
- `lib/adminApi.js` - Admin API wrappers (if exists)
- `pages/TridentLogin.jsx` - Login UI
- `pages/admin/AdminConsole.jsx` - Admin interface