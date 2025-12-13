/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(() => {
    try {
      const isAuth = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      setIsAuthenticated(isAuth);
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast.success('Login successful');
        return { success: true };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      const message = error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

