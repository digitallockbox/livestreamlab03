// middleware/authGuards.js
import jwt from 'npm:jsonwebtoken@9.0.2';

const CREATOR_JWT_SECRET = process.env.CREATOR_JWT_SECRET || 'creator-secret-change-in-production';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production';

/**
 * Guard to ensure only valid creators/users can access creator routes
 */
export const requireCreator = (req, res, next) => {
  // Check for the specific creator session cookie/token
  const creatorSession = req.cookies?.creator_session || req.headers['x-creator-session'];

  if (!creatorSession) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Creator session missing or expired."
    });
  }

  // Validate session logic here (e.g., JWT verify or database session check)
  try {
    const decoded = jwt.verify(creatorSession, CREATOR_JWT_SECRET);
    req.creator = decoded; // Attach creator context to the request
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Invalid Creator session token." });
  }
};

/**
 * Guard to ensure only authenticated Admins/Founders can access admin routes
 */
export const requireAdmin = (req, res, next) => {
  // Check for the completely separate admin session cookie/token
  const adminSession = req.cookies?.admin_session || req.headers['x-admin-session'];

  if (!adminSession) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Admin session missing or expired."
    });
  }

  // Validate session logic here
  try {
    const decoded = jwt.verify(adminSession, ADMIN_JWT_SECRET);
    
    // Explicit role verification check for Overwatch/Ledger/Engine control
    if (decoded.role !== 'founder' && decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Access denied. Insufficient privileges." });
    }

    req.admin = decoded; // Attach admin/founder context to the request
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Invalid Admin session token." });
  }
};

/**
 * Helper to generate JWT tokens
 */
export const generateJWT = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Helper to verify JWT tokens
 */
export const verifySession = (token, secret) => {
  return jwt.verify(token, secret);
};