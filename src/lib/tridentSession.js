/**
 * Trident Session Manager
 * Handles isolated creator and admin session authentication
 */
import { authApi } from '@/lib/tridentApi';

/**
 * Login as creator - issues 7-day creator_session cookie
 */
export const creatorLogin = async (email, password) => {
  try {
    const result = await authApi.creatorLogin({ email, password });
    
    if (result.success) {
      // Session cookie is set by backend automatically
      return { success: true, redirect: result.redirect, user: result.user };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Login as admin/founder - issues 1-day admin_session cookie
 */
export const adminLogin = async (email, password) => {
  try {
    const result = await authApi.adminLogin({ email, password });
    
    if (result.success) {
      return { success: true, redirect: result.redirect, user: result.user };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout creator session
 */
export const creatorLogout = async () => {
  try {
    await authApi.creatorLogout();
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
    await authApi.adminLogout();
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
    const result = await authApi.validateCreator();
    return result.valid;
  } catch (error) {
    return false;
  }
};

/**
 * Validate admin session
 */
export const validateAdminSession = async () => {
  try {
    const result = await authApi.validateAdmin();
    return result.valid;
  } catch (error) {
    return false;
  }
};

/**
 * Get current session type
 */
export const getCurrentSessionType = async () => {
  const adminValid = await validateAdminSession();
  if (adminValid) return 'admin';
  
  const creatorValid = await validateCreatorSession();
  if (creatorValid) return 'creator';
  
  return null;
};