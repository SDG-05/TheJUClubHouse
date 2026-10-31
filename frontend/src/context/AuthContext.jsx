import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ju_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const verifySession = useCallback(async () => {
    const token = localStorage.getItem('ju_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('ju_user', JSON.stringify(res.data));
    } catch {
      localStorage.removeItem('ju_access_token');
      localStorage.removeItem('ju_refresh_token');
      localStorage.removeItem('ju_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    const { access, refresh, user: loggedInUser } = res.data;
    localStorage.setItem('ju_access_token', access);
    localStorage.setItem('ju_refresh_token', refresh);
    localStorage.setItem('ju_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    const res = await apiClient.post('/auth/register/', { name, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('ju_access_token');
    localStorage.removeItem('ju_refresh_token');
    localStorage.removeItem('ju_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    verifySession,
    refreshUser: verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
