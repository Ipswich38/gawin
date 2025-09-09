'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { databaseService, User } from '../lib/services/databaseService';
import { systemGuardianService } from '../lib/services/systemGuardianService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await databaseService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        console.log('🔐 User authenticated:', currentUser.email);
        systemGuardianService.trackOperation('user_session_restore', 100, true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      systemGuardianService.reportError(
        `Auth initialization failed: ${error}`,
        'auth',
        'medium'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { user: newUser, error } = await databaseService.signUp(email, password, fullName);
      
      if (error) {
        systemGuardianService.reportError(`Sign up failed: ${error}`, 'auth', 'medium');
        return { success: false, error };
      }
      
      if (newUser) {
        setUser(newUser);
        systemGuardianService.trackOperation('user_signup', 200, true);
        console.log('✅ User signed up successfully:', newUser.email);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error during sign up' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`Sign up error: ${errorMessage}`, 'auth', 'high');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: signedInUser, error } = await databaseService.signIn(email, password);
      
      if (error) {
        systemGuardianService.reportError(`Sign in failed: ${error}`, 'auth', 'medium');
        return { success: false, error };
      }
      
      if (signedInUser) {
        setUser(signedInUser);
        systemGuardianService.trackOperation('user_signin', 150, true);
        console.log('✅ User signed in successfully:', signedInUser.email);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error during sign in' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`Sign in error: ${errorMessage}`, 'auth', 'high');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await databaseService.signOut();
      setUser(null);
      systemGuardianService.trackOperation('user_signout', 50, true);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      systemGuardianService.reportError(`Sign out error: ${error}`, 'auth', 'low');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await databaseService.updateUserProfile(user.id, updates);
      
      if (error) {
        return { success: false, error };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      systemGuardianService.trackOperation('profile_update', 100, true);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`Profile update error: ${errorMessage}`, 'auth', 'medium');
      return { success: false, error: errorMessage };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;
      
      const refreshedUser = await databaseService.getCurrentUser();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};