/**
 * Trident Session Manager
 * Handles isolated creator and admin session authentication
 */
import { base44 } from '@/api/base44Client';

const TRIDENT_API_BASE = 'https://api.tridentsystem.live';

/**
 * Login as creator - issues 7-day creator_session
 */
export const creatorLogin = async (email, password) => {
  try {
    const response = await fetch(`${TRIDENT_API_BASE}/auth/creator/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store session token for tridentProxy calls
      sessionStorage.setItem('creator_session', data.session_token);
      return { success: true, redirect: data.redirect, user: data.user };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Login as admin/founder - issues 1-day admin_session
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${TRIDENT_API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store session token for tridentProxy calls
      sessionStorage.setItem('admin_session', data.session_token);
      return { success: true, redirect: data.redirect, user: data.user };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout creator session
 */
export const creatorLogout = async () => {
  try {
    await fetch(`${TRIDENT_API_BASE}/auth/creator/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    sessionStorage.removeItem('creator_session');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout admin session
 */
export const adminLogout = async () => {
  try {
    await fetch(`${TRIDENT_API_BASE}/auth/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    sessionStorage.removeItem('admin_session');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate creator session
 */
export const validateCreatorSession = async () => {
  try {
    const response = await fetch(`${TRIDENT_API_BASE}/auth/creator/validate`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.valid;
  } catch (error) {
    return false;
  }
};

/**
 * Validate admin session
 */
export const validateAdminSession = async () => {
  try {
    const response = await fetch(`${TRIDENT_API_BASE}/auth/admin/validate`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.valid;
  } catch (error) {
    return false;
  }
};

/**
 * Call Trident API through tridentProxy with session token
 */
export const callTridentAPI = async (path, method = 'GET', body = null, sessionType = 'creator') => {
  const sessionToken = sessionType === 'admin' 
    ? sessionStorage.getItem('admin_session')
    : sessionStorage.getItem('creator_session');

  const response = await base44.functions.invoke('tridentProxy', {
    method,
    path,
    body,
    session_token: sessionToken
  });

  return response.data;
};

/**
 * Get current session info
 */
export const getCurrentSession = () => {
  const creatorSession = sessionStorage.getItem('creator_session');
  const adminSession = sessionStorage.getItem('admin_session');
  
  if (adminSession) {
    return { type: 'admin', token: adminSession };
  }
  if (creatorSession) {
    return { type: 'creator', token: creatorSession };
  }
  return { type: null, token: null };
};