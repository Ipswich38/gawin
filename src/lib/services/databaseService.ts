import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  credits_remaining: number;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications_enabled: boolean;
  ai_model_preference: string;
  tutor_mode_default: boolean;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  tags: string[];
}

export interface UsageRecord {
  id: string;
  user_id: string;
  action: 'chat' | 'image_generation' | 'ocr' | 'tutor_session';
  credits_used: number;
  metadata: any;
  created_at: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient;
  private isInitialized = false;

  private constructor() {
    // For development, we'll use environment variables
    // In production, you would set these in your hosting platform
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Only create Supabase client if we have valid environment variables
    if (supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co')) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      this.initializeDatabase();
    } else {
      console.log('🗄️ Supabase not configured, using local storage fallback');
      // Create a mock client to prevent errors
      this.supabase = {} as SupabaseClient;
      this.initializeLocalStorage();
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Check if we can connect to the database
      const { error } = await this.supabase.from('profiles').select('count').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is ok
        console.warn('Database connection issue:', error.message);
        // Fall back to local storage for development
        this.initializeLocalStorage();
      } else {
        this.isInitialized = true;
        console.log('🗄️ Database service initialized');
      }
    } catch (error) {
      console.warn('Database initialization failed, using local storage:', error);
      this.initializeLocalStorage();
    }
  }

  private initializeLocalStorage(): void {
    // Only initialize localStorage on client-side
    if (typeof window === 'undefined') {
      this.isInitialized = true;
      console.log('🗄️ Server-side: skipping localStorage initialization');
      return;
    }

    // Initialize local storage schema for development
    const schema = {
      users: [],
      conversations: [],
      usage_records: [],
      app_settings: {
        version: '1.0.0',
        initialized: true
      }
    };

    Object.keys(schema).forEach(key => {
      if (!localStorage.getItem(`gawin_${key}`)) {
        localStorage.setItem(`gawin_${key}`, JSON.stringify((schema as any)[key]));
      }
    });

    this.isInitialized = true;
    console.log('🗄️ Local storage database initialized');
  }

  // Authentication Methods
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Validate inputs
      const emailValidation = validationService.validateTextInput(email);
      const nameValidation = validationService.validateTextInput(fullName);

      if (!emailValidation.isValid) {
        return { user: null, error: emailValidation.errors.join(', ') };
      }

      if (!nameValidation.isValid) {
        return { user: null, error: nameValidation.errors.join(', ') };
      }

      if (password.length < 8) {
        return { user: null, error: 'Password must be at least 8 characters long' };
      }

      if (this.supabase) {
        const { data, error } = await this.supabase.auth.signUp({
          email: emailValidation.sanitized,
          password,
          options: {
            data: {
              full_name: nameValidation.sanitized,
            }
          }
        });

        if (error) {
          systemGuardianService.reportError(`Sign up failed: ${error.message}`, 'auth', 'medium');
          return { user: null, error: error.message };
        }

        if (data.user) {
          const newUser = await this.createUserProfile(data.user.id, emailValidation.sanitized, nameValidation.sanitized);
          return { user: newUser, error: null };
        }
      }

      // Fallback to local storage
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: emailValidation.sanitized,
        full_name: nameValidation.sanitized,
        subscription_tier: 'free',
        credits_remaining: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: false,
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications_enabled: true,
          ai_model_preference: 'gawin-search',
          tutor_mode_default: false
        }
      };

      if (typeof window !== 'undefined') {
        const users = JSON.parse(localStorage.getItem('gawin_users') || '[]');
        users.push(newUser);
        localStorage.setItem('gawin_users', JSON.stringify(users));
        localStorage.setItem('gawin_current_user', JSON.stringify(newUser));
      }

      return { user: newUser, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`Sign up error: ${errorMessage}`, 'auth', 'high');
      return { user: null, error: errorMessage };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Validate inputs
      const emailValidation = validationService.validateTextInput(email);
      if (!emailValidation.isValid) {
        return { user: null, error: 'Invalid email format' };
      }

      if (this.supabase) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: emailValidation.sanitized,
          password,
        });

        if (error) {
          systemGuardianService.reportError(`Sign in failed: ${error.message}`, 'auth', 'medium');
          return { user: null, error: error.message };
        }

        if (data.user) {
          const userProfile = await this.getUserProfile(data.user.id);
          return { user: userProfile, error: null };
        }
      }

      // Fallback to local storage
      if (typeof window !== 'undefined') {
        const users = JSON.parse(localStorage.getItem('gawin_users') || '[]');
        const user = users.find((u: User) => u.email === emailValidation.sanitized);
        
        if (user) {
          localStorage.setItem('gawin_current_user', JSON.stringify(user));
          return { user, error: null };
        }
      }

      return { user: null, error: 'Invalid credentials' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`Sign in error: ${errorMessage}`, 'auth', 'high');
      return { user: null, error: errorMessage };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
          return { error: error.message };
        }
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gawin_current_user');
      }
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMessage };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.supabase) {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        if (error || !user) {
          return null;
        }
        return await this.getUserProfile(user.id);
      }

      // Fallback to local storage
      if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem('gawin_current_user');
        return userJson ? JSON.parse(userJson) : null;
      }
      return null;
    } catch (error) {
      console.warn('Error getting current user:', error);
      return null;
    }
  }

  // User Profile Methods
  private async createUserProfile(userId: string, email: string, fullName: string): Promise<User> {
    const userProfile: User = {
      id: userId,
      email,
      full_name: fullName,
      subscription_tier: 'free',
      credits_remaining: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_verified: false,
      preferences: {
        theme: 'auto',
        language: 'en',
        notifications_enabled: true,
        ai_model_preference: 'gawin-search',
        tutor_mode_default: false
      }
    };

    if (this.supabase) {
      await this.supabase.from('profiles').insert([userProfile]);
    }

    return userProfile;
  }

  private async getUserProfile(userId: string): Promise<User | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as User;
    }

    // Fallback to local storage
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('gawin_users') || '[]');
      return users.find((user: User) => user.id === userId) || null;
    }
    return null;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ error: string | null }> {
    try {
      const sanitizedUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (this.supabase) {
        const { error } = await this.supabase
          .from('profiles')
          .update(sanitizedUpdates)
          .eq('id', userId);

        if (error) {
          return { error: error.message };
        }
      }

      // Update local storage
      if (typeof window !== 'undefined') {
        const users = JSON.parse(localStorage.getItem('gawin_users') || '[]');
        const userIndex = users.findIndex((user: User) => user.id === userId);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...sanitizedUpdates };
          localStorage.setItem('gawin_users', JSON.stringify(users));
        }
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMessage };
    }
  }

  // Conversation Methods
  async saveConversation(conversation: Omit<ConversationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string | null; error: string | null }> {
    try {
      const conversationRecord: ConversationRecord = {
        id: `conv_${Date.now()}`,
        ...conversation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('conversations')
          .insert([conversationRecord])
          .select()
          .single();

        if (error) {
          return { id: null, error: error.message };
        }

        return { id: data.id, error: null };
      }

      // Fallback to local storage
      if (typeof window !== 'undefined') {
        const conversations = JSON.parse(localStorage.getItem('gawin_conversations') || '[]');
        conversations.push(conversationRecord);
        localStorage.setItem('gawin_conversations', JSON.stringify(conversations));
      }

      return { id: conversationRecord.id, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { id: null, error: errorMessage };
    }
  }

  async getUserConversations(userId: string): Promise<ConversationRecord[]> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.warn('Error fetching conversations:', error);
          return [];
        }

        return data as ConversationRecord[];
      }

      // Fallback to local storage
      if (typeof window !== 'undefined') {
        const conversations = JSON.parse(localStorage.getItem('gawin_conversations') || '[]');
        return conversations.filter((conv: ConversationRecord) => conv.user_id === userId);
      }
      return [];
    } catch (error) {
      console.warn('Error getting user conversations:', error);
      return [];
    }
  }

  // Usage tracking
  async recordUsage(userId: string, action: UsageRecord['action'], creditsUsed: number, metadata: any = {}): Promise<void> {
    try {
      const usageRecord: UsageRecord = {
        id: `usage_${Date.now()}`,
        user_id: userId,
        action,
        credits_used: creditsUsed,
        metadata,
        created_at: new Date().toISOString(),
      };

      if (this.supabase) {
        await this.supabase.from('usage_records').insert([usageRecord]);
      }

      // Also update local storage
      if (typeof window !== 'undefined') {
        const usageRecords = JSON.parse(localStorage.getItem('gawin_usage_records') || '[]');
        usageRecords.push(usageRecord);
        localStorage.setItem('gawin_usage_records', JSON.stringify(usageRecords));
      }

      // Update user credits
      await this.updateUserCredits(userId, -creditsUsed);
    } catch (error) {
      console.warn('Error recording usage:', error);
    }
  }

  private async updateUserCredits(userId: string, creditChange: number): Promise<void> {
    const currentUser = await this.getUserProfile(userId);
    if (currentUser) {
      const newCredits = Math.max(0, currentUser.credits_remaining + creditChange);
      await this.updateUserProfile(userId, { credits_remaining: newCredits });
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.from('profiles').select('count').limit(1);
        if (error) {
          return { status: 'degraded', message: 'Database connection issues' };
        }
        return { status: 'healthy', message: 'Database operational' };
      }
      
      return { status: 'degraded', message: 'Using local storage fallback' };
    } catch (error) {
      return { status: 'offline', message: 'Database unavailable' };
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();