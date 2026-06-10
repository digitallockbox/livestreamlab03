# Trident Platform - Production Configuration

## Domain & Identity Lock

**Primary Domain:** `https://livestreamlab.live`  
**API Domain:** `https://api.livestreamlab.live`  
**Admin Email:** `Livestreamlab@livestreamlab.live`

---

## Environment Variables

### Base44 Frontend (.env)
```env
VITE_API_URL=https://api.livestreamlab.live
VITE_BASE_URL=https://livestreamlab.live
VITE_ADMIN_EMAIL=Livestreamlab@livestreamlab.live
```

### Backend OS (.env)
```env
# Server
PORT=3001
NODE_ENV=production
DOMAIN=livestreamlab.live
API_URL=https://api.livestreamlab.live
BASE_URL=https://livestreamlab.live

# Admin Identity
ADMIN_EMAIL=Livestreamlab@livestreamlab.live

# Session Cookies
CREATOR_JWT_SECRET=your_creator_jwt_secret_min_32_chars
ADMIN_JWT_SECRET=your_admin_jwt_secret_min_32_chars
FOUNDER_JWT_SECRET=your_founder_jwt_secret_min_32_chars

# Database
DATABASE_URL=postgresql://user:password@host:5432/trident_prod

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Backend OS Implementation

### 1. Admin Authentication Lock

```javascript
// services/AuthService.js

export async function authenticateAdminUser(email, password) {
  // HARD LOCK: Only admin@livestreamlab.live can authenticate as admin
  if (email.toLowerCase() !== "livestreamlab@livestreamlab.live") {
    throw new Error("Unauthorized admin email - domain restriction enforced");
  }

  const admin = await db.user.findUnique({ 
    where: { email: email.toLowerCase() },
    include: { role: true }
  });
  
  if (!admin) {
    throw new Error("Admin account not found");
  }

  if (admin.role.name !== 'admin' && admin.role.name !== 'founder') {
    throw new Error("Insufficient privileges for admin access");
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    throw new Error("Invalid password");
  }

  // Generate admin session token
  const sessionToken = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role.name,
      domain: 'livestreamlab.live'
    },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { admin, sessionToken };
}
```

### 2. Domain Enforcement Middleware

```javascript
// middleware/domainLock.js

import { config } from '../config/index.js';

export function enforceDomain(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    const host = req.headers.host?.toLowerCase();
    
    // Allow only livestreamlab.live domains
    const allowedHosts = [
      'livestreamlab.live',
      'www.livestreamlab.live',
      'api.livestreamlab.live',
      'admin.livestreamlab.live'
    ];
    
    if (!allowedHosts.some(allowed => host === allowed || host?.endsWith(`.${allowed}`))) {
      return res.redirect(301, `https://livestreamlab.live${req.originalUrl}`);
    }
  }
  
  next();
}

// Trust proxy for correct host detection
app.set('trust proxy', 1);
app.use(enforceDomain);
```

### 3. Admin Session Cookie (Domain-Locked)

```javascript
// routes/admin/auth.js

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { admin, sessionToken } = await authenticateAdminUser(email, password);
    
    // Set domain-locked cookie
    res.cookie('admin_session', sessionToken, {
      domain: 'livestreamlab.live',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    
    res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role.name
      },
      redirect: '/admin'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_session', {
    domain: 'livestreamlab.live',
    path: '/'
  });
  
  res.json({ success: true });
});
```

### 4. Creator Session Cookie (Domain-Locked)

```javascript
// routes/creator/auth.js

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { creator, sessionToken } = await authenticateCreatorUser(email, password);
    
    // Set domain-locked cookie
    res.cookie('creator_session', sessionToken, {
      domain: 'livestreamlab.live',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    res.json({
      success: true,
      user: {
        id: creator.id,
        email: creator.email,
        role: 'creator'
      },
      redirect: '/creator/dashboard'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});
```

### 5. Admin Route Protection

```javascript
// middleware/requireAdmin.js

export function requireAdmin(req, res, next) {
  const token = req.cookies.admin_session;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    
    // Enforce domain lock
    if (decoded.domain !== 'livestreamlab.live') {
      return res.status(403).json({
        success: false,
        error: 'Invalid session domain'
      });
    }
    
    // Enforce admin email lock
    if (decoded.email !== 'livestreamlab@livestreamlab.live') {
      return res.status(403).json({
        success: false,
        error: 'Admin access restricted to platform owner'
      });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired admin session'
    });
  }
}
```

---

## Base44 Frontend Updates

### 1. Update tridentProxy Function

```javascript
// functions/tridentProxy.js

const TRIDENT_BASE = "https://api.livestreamlab.live"; // Production domain

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check Base44 authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized: Base44 authentication required' 
      }, { status: 401 });
    }

    const { method, path, body, session_token, formData } = await req.json();

    // Validate path
    if (!path || !path.startsWith("/")) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    // Handle file uploads
    const requestBody = formData ? formData : (body ? JSON.stringify(body) : undefined);
    const isFormData = !!formData;

    // Determine required session type
    const requiredSession = getRequiredSessionType(path);

    // Validate session token
    if (requiredSession === 'admin') {
      const validation = validateAdminSession(session_token);
      if (!validation.valid) {
        return Response.json({ 
          success: false, 
          error: validation.error 
        }, { status: 401 });
      }
      
      // Enforce admin email lock
      if (validation.user.email !== 'livestreamlab@livestreamlab.live') {
        return Response.json({ 
          success: false, 
          error: 'Admin access restricted to platform owner' 
        }, { status: 403 });
      }
      
      // Additional founder-only path check
      if (FOUNDER_ONLY_PATHS.some(p => path.startsWith(p) || path === p)) {
        if (validation.user.role !== 'founder') {
          return Response.json({ 
            success: false, 
            error: 'Forbidden: Founder privileges required' 
          }, { status: 403 });
        }
      }
      
      req.admin = validation.user;
    } else {
      const validation = validateCreatorSession(session_token);
      if (!validation.valid) {
        return Response.json({ 
          success: false, 
          error: validation.error 
        }, { status: 401 });
      }
      req.creator = validation.user;
    }

    // Build headers with session context
    const headers = { 
      "X-Session-Type": requiredSession,
      "X-User-ID": user.id,
      "X-User-Email": user.email,
      "X-Domain": "livestreamlab.live"
    };
    
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (req.admin) {
      headers["X-Admin-ID"] = req.admin.id;
      headers["X-Admin-Role"] = req.admin.role;
      headers["X-Admin-Email"] = req.admin.email;
    }

    // Forward request to production Trident API
    const res = await fetch(`${TRIDENT_BASE}${path}`, {
      method: method || "GET",
      headers,
      body: requestBody,
    });

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });

  } catch (error) {
    console.error('TridentProxy error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
```

### 2. Update Admin Login Page

```javascript
// pages/TridentAdmin.jsx or pages/admin/AdminLogin.jsx

const ADMIN_CONFIG = {
  email: 'Livestreamlab@livestreamlab.live',
  domain: 'livestreamlab.live',
  apiBase: 'https://api.livestreamlab.live'
};

export default function TridentAdmin() {
  const [email, setEmail] = useState(ADMIN_CONFIG.email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Enforce admin email
      if (email.toLowerCase() !== ADMIN_CONFIG.email.toLowerCase()) {
        throw new Error('Admin access restricted to platform owner');
      }

      const response = await base44.functions.invoke('tridentProxy', {
        method: 'POST',
        path: '/auth/admin/login',
        body: { email: email.toLowerCase(), password },
      });

      if (response.data.success) {
        // Store session token
        sessionStorage.setItem('admin_session', response.data.user.sessionToken);
        window.location.href = '/admin';
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              TRIDENT ADMIN
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Platform Owner Authentication
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ADMIN_CONFIG.domain}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Admin Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_CONFIG.email}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Login to Admin Console'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Restricted access • Platform owner only
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              {ADMIN_CONFIG.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Update Admin Console Header

```javascript
// pages/admin/AdminConsole.jsx

const PLATFORM_CONFIG = {
  domain: 'livestreamlab.live',
  adminEmail: 'Livestreamlab@livestreamlab.live',
  apiBase: 'https://api.livestreamlab.live'
};

// In the header section:
<div className="flex items-center gap-2">
  <Badge className="bg-primary/10 text-primary border-primary/30">
    {PLATFORM_CONFIG.domain}
  </Badge>
  <Badge className="bg-accent/10 text-accent border-accent/20">
    Admin: {PLATFORM_CONFIG.adminEmail}
  </Badge>
</div>
```

---

## DNS Configuration

### Required DNS Records

```
Type    Name                        Value                       TTL
---------------------------------------------------------------------------
A       livestreamlab.live          YOUR_FRONTEND_IP            3600
A       api.livestreamlab.live      YOUR_BACKEND_IP             3600
A       admin.livestreamlab.live    YOUR_FRONTEND_IP (optional) 3600
CNAME   www.livestreamlab.live      livestreamlab.live          3600
```

### SSL/TLS Certificates

Use Let's Encrypt or your hosting provider:

```bash
# For backend server (api.livestreamlab.live)
certbot --nginx -d api.livestreamlab.live

# For frontend (livestreamlab.live)
certbot --nginx -d livestreamlab.live -d www.livestreamlab.live
```

---

## Verification Checklist

- [ ] Admin login only accepts `Livestreamlab@livestreamlab.live`
- [ ] All cookies are domain-locked to `livestreamlab.live`
- [ ] API calls route to `https://api.livestreamlab.live`
- [ ] Frontend redirects non-domain requests to `livestreamlab.live`
- [ ] Admin sessions expire after 24 hours
- [ ] Creator sessions expire after 7 days
- [ ] DNS records point to correct servers
- [ ] SSL certificates are valid for all domains
- [ ] Admin dashboard displays real production data
- [ ] No mock data in any admin views

---

## Production Deployment Commands

### Backend OS

```bash
# Set environment variables
export NODE_ENV=production
export DOMAIN=livestreamlab.live
export ADMIN_EMAIL=Livestreamlab@livestreamlab.live
export DATABASE_URL=postgresql://...

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

### Base44 Frontend

1. Update `.env` with production URLs
2. Deploy to Base44 platform
3. Configure custom domain: `livestreamlab.live`
4. Enable HTTPS

---

**Platform Identity Locked:**
- Domain: `livestreamlab.live`
- Admin: `Livestreamlab@livestreamlab.live`
- API: `api.livestreamlab.live`
- Sessions: Domain-restricted
- Data: Production only