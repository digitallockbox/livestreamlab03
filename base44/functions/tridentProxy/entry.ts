/**
 * Trident Proxy — Backend Function with Isolated Session Guards
 * Routes Base44 → Trident API safely with separate creator/admin session validation.
 * 
 * Session Architecture:
 * - Creator Session: 7-day JWT, access to /creator/*, /wallet/*, /content/* endpoints
 * - Admin Session: 1-day JWT, access to /admin/*, /founder/*, /overwatch/* endpoints
 * - Founder Session: 1-day JWT with elevated privileges for /engine/*, /ledger/* control
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

const TRIDENT_BASE = "https://api.tridentsystem.live";

// Session type definitions
const CREATOR_PATHS = ['/creator/', '/wallet/', '/content/', '/store/', '/affiliates/', '/dashboard'];
const ADMIN_PATHS = ['/admin/', '/founder/', '/overwatch/', '/ledger/', '/engine/', '/users/'];
const FOUNDER_ONLY_PATHS = ['/engine/restart', '/ledger/process-payout', '/founder/'];

/**
 * Validate creator session token
 */
const validateCreatorSession = (token) => {
  try {
    const decoded = jwt.verify(token, Deno.env.get('CREATOR_JWT_SECRET') || 'creator-secret');
    if (decoded.role !== 'creator' && decoded.role !== 'user') {
      return { valid: false, error: 'Invalid role for creator session' };
    }
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired creator session token' };
  }
};

/**
 * Validate admin session token
 */
const validateAdminSession = (token) => {
  try {
    const decoded = jwt.verify(token, Deno.env.get('ADMIN_JWT_SECRET') || 'admin-secret');
    if (decoded.role !== 'admin' && decoded.role !== 'founder') {
      return { valid: false, error: 'Insufficient privileges for admin session' };
    }
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired admin session token' };
  }
};

/**
 * Determine required session type based on path
 */
const getRequiredSessionType = (path) => {
  if (ADMIN_PATHS.some(p => path.startsWith(p))) {
    return 'admin';
  }
  if (CREATOR_PATHS.some(p => path.startsWith(p))) {
    return 'creator';
  }
  return 'creator'; // Default to creator for other paths
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // First check Base44 authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized: Base44 authentication required' 
      }, { status: 401 });
    }

    const { method, path, body, session_token, formData } = await req.json();

    if (!path || !path.startsWith("/")) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    // Handle file uploads - pass through FormData or use regular JSON body
    const requestBody = formData ? formData : (body ? JSON.stringify(body) : undefined);
    const isFormData = !!formData;

    // Determine required session type
    const requiredSession = getRequiredSessionType(path);

    // Validate session token based on path requirements
    if (requiredSession === 'admin') {
      const validation = validateAdminSession(session_token);
      if (!validation.valid) {
        return Response.json({ 
          success: false, 
          error: validation.error 
        }, { status: 401 });
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
      "X-User-Email": user.email
    };
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    // Add admin context if applicable
    if (req.admin) {
      headers["X-Admin-ID"] = req.admin.id;
      headers["X-Admin-Role"] = req.admin.role;
    }

    // Forward request to Trident API
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