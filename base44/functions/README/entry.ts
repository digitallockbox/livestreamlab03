# TridentOS Express Backend

Isolated session architecture with separate creator and admin authentication guards.

## Architecture

- **Creator Session**: 7-day JWT, scoped to `/api/creator/*` routes
- **Admin Session**: 1-day JWT, scoped to `/api/admin/*` routes (founder/admin roles only)

## Setup

### 1. Install Dependencies

```bash
npm install express cookie-parser cors jsonwebtoken
```

### 2. Set Environment Variables

```bash
# Required Secrets
CREATOR_JWT_SECRET=your-super-secret-creator-key-change-in-production
ADMIN_JWT_SECRET=your-super-secret-admin-key-change-in-production
NODE_ENV=production
FRONTEND_URL=https://your-app.base44.app
PORT=5000
```

### 3. Run Server

```bash
node server.js
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/creator/login` | Creator login, issues `creator_session` cookie |
| POST | `/auth/admin/login` | Admin login, issues `admin_session` cookie |
| POST | `/auth/creator/logout` | Clear creator session |
| POST | `/auth/admin/logout` | Clear admin session |
| GET | `/auth/creator/validate` | Validate creator session |
| GET | `/auth/admin/validate` | Validate admin session |

### Creator API (Protected)

All endpoints require valid `creator_session` cookie or `x-creator-session` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creator/dashboard` | Creator dashboard data |
| GET | `/api/creator/wallet/balance` | Wallet balances |
| GET | `/api/creator/content/streams` | Creator's streams |
| GET | `/api/creator/content/videos` | Creator's videos |
| GET | `/api/creator/content/podcasts` | Creator's podcasts |
| GET | `/api/creator/store/products` | Creator's products |
| GET | `/api/creator/affiliates/links` | Creator's affiliate links |

### Admin API (Protected)

All endpoints require valid `admin_session` cookie or `x-admin-session` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard data |
| GET | `/api/admin/overwatch/status` | System status overview |
| GET | `/api/admin/ledger/transactions` | Transaction ledger |
| POST | `/api/admin/ledger/process-payout` | Process creator payout |
| GET | `/api/admin/engine/status` | Engine health status |
| POST | `/api/admin/engine/restart` | Restart engines (founder only) |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/creators` | List all creators |

## Security Features

1. **Isolated Sessions**: Creator and admin sessions use different JWT secrets and cookie names
2. **Role Verification**: Admin routes explicitly check for 'founder' or 'admin' roles
3. **Shorter Admin Token**: Admin tokens expire in 1 day vs 7 days for creators
4. **HTTP-Only Cookies**: Prevents XSS token theft
5. **SameSite Strict**: Prevents CSRF attacks
6. **Secure in Production**: Cookies only sent over HTTPS in production

## Frontend Integration Example

```javascript
// Login
const login = async (email, password, type) => {
  const res = await fetch(`/auth/${type}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success) {
    window.location.href = data.redirect;
  }
};

// API Call (cookies sent automatically with credentials: 'include')
const fetchCreatorData = async () => {
  const res = await fetch('/api/creator/dashboard', {
    credentials: 'include'
  });
  return await res.json();
};
```

## Production Deployment

1. Set strong, unique JWT secrets in environment variables
2. Enable HTTPS for secure cookie transmission
3. Configure CORS with specific frontend origins
4. Monitor failed authentication attempts
5. Implement rate limiting on auth endpoints
6. Add database integration for actual user authentication