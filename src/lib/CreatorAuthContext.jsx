import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const CreatorAuthContext = createContext(null);

export function CreatorAuthProvider({ children }) {
  const [creator, setCreator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCreator = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (user && (user.role === 'user' || user.role === 'creator')) {
        setCreator(user);
        setError(null);
      } else {
        setCreator(null);
        setError({ type: 'unauthorized', message: 'Creator access required' });
      }
    } catch (e) {
      setCreator(null);
      setError({ type: 'not_authenticated', message: 'Please log in' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  const login = async (email, password) => {
    const response = await base44.functions.invoke('tridentProxy', {
      method: 'POST',
      path: '/auth/creator/login',
      body: { email, password },
    });
    await loadCreator();
    navigate('/creator/dashboard');
    return response.data;
  };

  const logout = async () => {
    await base44.auth.logout('/creator/login');
    setCreator(null);
  };

  const value = {
    creator,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!creator,
    loadCreator,
  };

  return <CreatorAuthContext.Provider value={value}>{children}</CreatorAuthContext.Provider>;
}

export function useCreatorAuth() {
  const context = useContext(CreatorAuthContext);
  if (!context) {
    throw new Error('useCreatorAuth must be used within CreatorAuthProvider');
  }
  return context;
}