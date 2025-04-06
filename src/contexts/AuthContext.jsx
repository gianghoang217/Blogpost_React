import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Check if the user is already stored in localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
        // Persist user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (err) {
        console.error('Not authenticated', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch user if currentUser is not already set
    if (!currentUser) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [currentUser]); // This hook now depends on currentUser to avoid calling the API unnecessarily

  const login = async (email, password) => {
    setError(null);
    try {
      const user = await authService.login({ email, password });
      setCurrentUser(user);
      // Store the user in localStorage after successful login
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (err) {
      setError(err.response?.data || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      // Remove user from localStorage on logout
      localStorage.removeItem('currentUser');
    } catch (err) {
      setError(err.response?.data || 'Logout failed');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
