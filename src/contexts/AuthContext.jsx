import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  // Save token to localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  // Verify token and get user on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.auth.verify();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid or expired
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const data = await apiClient.auth.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await apiClient.auth.register(userData);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}






