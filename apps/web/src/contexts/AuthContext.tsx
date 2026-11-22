import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<User>;
  registerAthlete: (data: any) => Promise<User>;
  registerSponsor: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const res = await api.post<{ user: User }>('/auth/login', credentials);
    if (!res.success || !res.data?.user) {
      throw new Error(res.error || 'Login failed');
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const registerAthlete = async (formData: any): Promise<User> => {
    const res = await api.post<{ user: User }>('/auth/register/athlete', formData);
    if (!res.success || !res.data?.user) {
      throw new Error(res.error || 'Athlete registration failed');
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const registerSponsor = async (formData: any): Promise<User> => {
    const res = await api.post<{ user: User }>('/auth/register/sponsor', formData);
    if (!res.success || !res.data?.user) {
      throw new Error(res.error || 'Sponsor registration failed');
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        registerAthlete,
        registerSponsor,
        logout,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
