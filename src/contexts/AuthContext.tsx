import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, AuthResponse } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (userData: any) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au démarrage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const signUp = async (userData: any): Promise<AuthResponse> => {
    const response = await authService.register(userData);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const signOut = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>): Promise<AuthResponse> => {
    const response = await authService.updateProfile(userData);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}