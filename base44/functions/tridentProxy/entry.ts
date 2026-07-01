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

const TRIDENT_BASE = "https://api.livestreamlab.live"; // Production domain

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

// Resolve a wallet-native JWT (issued by verifyWalletSignature) into a wallet
// identity context. Returns { wallet, chain } on success, null otherwise.
// This lets wallet-only creators authenticate WITHOUT a Base44 session.
const resolveWalletToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, Deno.env.get('CREATOR_JWT_SECRET') || 'creator-secret');
    if (!decoded?.wallet) return null;
    return { wallet: decoded.wallet, chain: decoded.chain || 'solana' };
  } catch {
    return null;
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { method, path, body, session_token, wallet_token, formData } = await req.json();

    if (!path || !path.startsWith("/")) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    // Handle file uploads - pass through FormData or use regular JSON body
    const requestBody = formData ? formData : (body ? JSON.stringify(body) : undefined);
    const isFormData = !!formData;

    // Determine required session type
    const requiredSession = getRequiredSessionType(path);

    // --- Wallet-native auth path (no Base44 session required) ---
    // Wallet-only creators pass a wallet_token JWT; resolve it into a wallet
    // identity and accept it as a valid creator-level session.
    let walletCtx = null;
    if (wallet_token) {
      walletCtx = await resolveWalletToken(wallet_token);
    }
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    // Admin paths still require a traditional admin session (wallet tokens
    // never grant admin privileges).
    if (requiredSession === 'admin') {
      const validation = validateAdminSession(session_token);
      if (!validation.valid) {
        return Response.json({ success: false, error: validation.error }, { status: 401 });
      }
      if (FOUNDER_ONLY_PATHS.some(p => path.startsWith(p) || path === p)) {
        if (validation.user.email !== 'livestreamlab@livestreamlab.live') {
          return Response.json({ success: false, error: 'Admin access restricted to platform owner' }, { status: 403 });
        }
        if (validation.user.role !== 'founder') {
          return Response.json({ success: false, error: 'Forbidden: Founder privileges required' }, { status: 403 });
        }
      }
      req.admin = validation.user;
    } else {
      // Creator path: accept wallet JWT first, fall back to traditional session.
      if (!walletCtx && !session_token) {
        return Response.json({ success: false, error: 'Authentication required (wallet token or session)' }, { status: 401 });
      }
      if (!walletCtx) {
        const validation = validateCreatorSession(session_token);
        if (!validation.valid) {
          return Response.json({ success: false, error: validation.error }, { status: 401 });
        }
        req.creator = validation.user;
      }
    }

    // Build headers with session context and domain lock
    const headers = {
      "X-Session-Type": requiredSession,
      "X-Domain": "livestreamlab.live"
    };
    if (user) {
      headers["X-User-ID"] = user.id;
      headers["X-User-Email"] = user.email;
    }
    if (walletCtx) {
      headers["X-Wallet-Address"] = walletCtx.wallet;
      headers["X-Wallet-Chain"] = walletCtx.chain;
    }

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    // Add admin context if applicable
    if (req.admin) {
      headers["X-Admin-ID"] = req.admin.id;
      headers["X-Admin-Role"] = req.admin.role;
      headers["X-Admin-Email"] = req.admin.email;
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
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});