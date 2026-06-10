import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadAdmin = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (user && user.role === 'admin') {
        setAdmin(user);
        setError(null);
      } else {
        setAdmin(null);
        setError({ type: 'unauthorized', message: 'Admin access required' });
      }
    } catch (e) {
      setAdmin(null);
      setError({ type: 'not_authenticated', message: 'Please log in' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const login = async (email, password) => {
    const response = await base44.functions.invoke('tridentProxy', {
      method: 'POST',
      path: '/auth/admin/login',
      body: { email, password },
    });
    await loadAdmin();
    navigate('/admin/dashboard');
    return response.data;
  };

  const logout = async () => {
    await base44.auth.logout('/admin/login');
    setAdmin(null);
  };

  const value = {
    admin,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!admin,
    loadAdmin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}