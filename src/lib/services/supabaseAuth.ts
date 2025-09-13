'use client';

import { createClient, SupabaseClient, User, AuthError } from '@supabase/supabase-js';

// Database types for profiles table
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
  email_verified?: boolean;
  preferences?: Record<string, any>;
  credits?: number;
  subscription_tier?: string;
  last_login?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

class SupabaseAuthService {
  private supabase: SupabaseClient;
  private static instance: SupabaseAuthService;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      }
    });

    // Set up auth state change listener
    this.setupAuthListener();
  }

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  private setupAuthListener() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleUserSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleUserSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed for:', session.user.email);
      }
    });
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      // OAuth redirect initiated successfully
      return { success: true };

    } catch (error) {
      console.error('Unexpected Google OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Get current authenticated user with profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user found');
        return null;
      }

      // Get user profile from database
      const profile = await this.getUserProfile(user.id);
      
      if (!profile) {
        console.log('User authenticated but no profile found, creating profile...');
        // Create profile if it doesn't exist (fallback)
        const newProfile = await this.createUserProfile(user);
        return newProfile;
      }

      // Update last login
      await this.updateLastLogin(user.id);
      
      return profile;

    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile from profiles table
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create user profile after successful authentication
   */
  private async createUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const profileData = {
        user_id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        email_verified: user.email_confirmed_at !== null,
        preferences: {},
        credits: 100,
        subscription_tier: 'free',
        last_login: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      console.log('✅ User profile created successfully:', data.email);
      return data;

    } catch (error) {
      console.error('Unexpected error creating user profile:', error);
      return null;
    }
  }

  /**
   * Handle successful user sign-in
   */
  private async handleUserSignIn(user: User) {
    console.log('🔑 User signed in:', user.email);
    
    // Get or create user profile
    let profile = await this.getUserProfile(user.id);
    
    if (!profile) {
      profile = await this.createUserProfile(user);
    } else {
      // Update existing profile with latest info from OAuth
      await this.updateUserProfile(user.id, {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || profile.full_name,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || profile.avatar_url,
        email_verified: user.email_confirmed_at !== null,
        last_login: new Date().toISOString(),
      });
    }

    // Redirect to dashboard after successful login
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      // Already on main page, just refresh the app state
      window.location.reload();
    }
  }

  /**
   * Handle user sign-out
   */
  private handleUserSignOut() {
    console.log('🔓 User signed out');
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gawin_current_user');
    }
  }

  /**
   * Update user profile
   */
  private async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating user profile:', error);
      return false;
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('✅ User signed out successfully');
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Unexpected error getting session:', error);
      return null;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'Too many requests':
        return 'Too many login attempts. Please wait a few minutes and try again.';
      default:
        if (error.message.includes('Google OAuth')) {
          return 'Google authentication is not configured. Please contact support.';
        }
        return error.message || 'An error occurred during authentication. Please try again.';
    }
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

// Export singleton instance
export const supabaseAuth = SupabaseAuthService.getInstance();