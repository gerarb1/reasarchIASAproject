import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type UserProfile } from '../../../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (userData: any) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  /** Dev-only: Override user role for UI simulation */
  overrideRole: (role: UserProfile['role']) => void;
  /** Whether dev role selector is enabled */
  isRoleSelectorEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_SELECTOR_ENABLED = import.meta.env.VITE_ENABLE_ROLE_SELECTOR === 'true';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attempt to restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.getProfile()
        .then(profile => {
          setUser(profile);
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const registerUser = async (userData: any) => {
    return api.register(userData);
  };

  const refreshProfile = async () => {
    if (token) {
      const profile = await api.getProfile();
      setUser(profile);
    }
  };

  /**
   * Dev-only: Override the user's role in React state.
   * This mutates the UI and sidebar behavior without affecting
   * the real auth token or backend calls.
   */
  const overrideRole = useCallback((role: UserProfile['role']) => {
    if (!ROLE_SELECTOR_ENABLED) return;
    setUser(prev => prev ? { ...prev, role } : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        registerUser,
        refreshProfile,
        overrideRole,
        isRoleSelectorEnabled: ROLE_SELECTOR_ENABLED,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
