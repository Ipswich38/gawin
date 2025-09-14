'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseAuth, UserProfile } from '@/lib/services/supabaseAuth';

interface GoogleAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Initializing Google authentication...');
      
      // Add short timeout to prevent infinite loading
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 3000)
      );
      
      const authCheck = supabaseAuth.getCurrentUser();
      
      const currentUser = await Promise.race([authCheck, timeout]) as UserProfile | null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.email);
      } else {
        console.log('❌ No authenticated user found - showing login');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Set loading to false even on error so user can see login
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Initiating Google sign-in...');
      
      const result = await supabaseAuth.signInWithGoogle();
      
      if (result.success) {
        console.log('✅ Google OAuth initiated successfully');
        // Note: actual user setting will happen in auth state change listener
        return { success: true };
      } else {
        console.error('❌ Google OAuth failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('❌ Unexpected Google OAuth error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      console.log('👤 Signing in anonymously...');
      
      const result = await supabaseAuth.signInAnonymously();
      
      if (result.success) {
        console.log('✅ Anonymous sign-in successful');
        if (result.user) {
          setUser(result.user);
        }
        return { success: true };
      } else {
        console.error('❌ Anonymous sign-in failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Anonymous authentication failed';
      console.error('❌ Unexpected anonymous sign-in error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('🔓 Signing out user...');
      
      await supabaseAuth.signOut();
      setUser(null);
      
      console.log('✅ User signed out successfully');
      
      // Redirect to home/login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      console.log('🔄 Refreshing user profile...');
      const currentUser = await supabaseAuth.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        console.log('✅ User profile refreshed:', currentUser.email);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;

    const setupAuthListener = () => {
      const client = supabaseAuth.getClient();
      
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 Auth state changed:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('🔑 User signed in, refreshing profile...');
              await refreshUser();
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('🔓 User signed out, clearing state...');
            setUser(null);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            if (session?.user && !user) {
              await refreshUser();
            }
            break;
            
          default:
            break;
        }
      });

      return subscription;
    };

    const subscription = setupAuthListener();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshUser, user]);

  const contextValue: GoogleAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    refreshUser,
  };

  return (
    <GoogleAuthContext.Provider value={contextValue}>
      {children}
    </GoogleAuthContext.Provider>
  );
};