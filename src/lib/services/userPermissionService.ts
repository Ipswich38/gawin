export interface UserData {
  id: string;
  email: string;
  full_name: string;
  isAnonymous?: boolean;
  isCreator?: boolean;
  credits_remaining: number;
  subscription_tier?: string;
}

export interface FeaturePermissions {
  // Core Features (Always Available)
  basicChat: boolean;
  textGeneration: boolean;

  // Premium Features (Restricted for Guests)
  researchMode: boolean;
  quizGenerator: boolean;
  creativeStudio: boolean;
  browserAutomation: boolean;
  memorySystem: boolean;
  consciousnessSystem: boolean;
  personalizedResponses: boolean;
  unlimitedChats: boolean;

  // Advanced Features (Creator Only)
  voiceMode: boolean; // 🎙️ Creator only - secret development
  visionControl: boolean; // 👁️ Creator only - secret development
  permissionsTab: boolean;
  adminDashboard: boolean;
  trainingMode: boolean;
  apiAccess: boolean;

  // Usage Limits
  dailyChatLimit: number;
  maxFileUploads: number;
  maxImageGenerations: number;
}

class UserPermissionService {
  private currentUser: UserData | null = null;

  // Initialize user from localStorage
  init(): void {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('gawin_user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          this.currentUser = null;
        }
      }
    }
  }

  // Get current user
  getCurrentUser(): UserData | null {
    if (!this.currentUser) {
      this.init();
    }
    return this.currentUser;
  }

  // Check if user is guest/anonymous
  isGuestUser(): boolean {
    const user = this.getCurrentUser();
    return !user || user.isAnonymous === true;
  }

  // Check if user is creator
  isCreator(): boolean {
    const user = this.getCurrentUser();
    return user?.isCreator === true;
  }

  // Check if user has premium access
  hasPremiumAccess(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Creator always has premium
    if (user.isCreator) return true;

    // Check subscription tier
    const premiumTiers = ['pro', 'premium', 'enterprise'];
    return premiumTiers.includes(user.subscription_tier || '');
  }

  // Get feature permissions for current user
  getFeaturePermissions(): FeaturePermissions {
    const user = this.getCurrentUser();
    const isGuest = this.isGuestUser();
    const isCreator = this.isCreator();
    const hasPremium = this.hasPremiumAccess();

    if (isCreator) {
      // Creator has access to everything
      return {
        basicChat: true,
        textGeneration: true,
        voiceMode: true,
        researchMode: true,
        quizGenerator: true,
        creativeStudio: true,
        visionControl: true,
        browserAutomation: true,
        memorySystem: true,
        consciousnessSystem: true,
        personalizedResponses: true,
        unlimitedChats: true,
        permissionsTab: true,
        adminDashboard: true,
        trainingMode: true,
        apiAccess: true,
        dailyChatLimit: -1, // Unlimited
        maxFileUploads: -1, // Unlimited
        maxImageGenerations: -1 // Unlimited
      };
    }

    if (isGuest) {
      // Guest users get very limited access
      return {
        basicChat: true,
        textGeneration: true,
        researchMode: false, // ❌ Premium feature
        quizGenerator: false, // ❌ Premium feature
        creativeStudio: false, // ❌ Premium feature
        browserAutomation: false, // ❌ Premium feature
        memorySystem: false, // ❌ Premium feature
        consciousnessSystem: false, // ❌ Premium feature
        personalizedResponses: false, // ❌ Premium feature
        unlimitedChats: false,
        voiceMode: false, // ❌ Creator only feature (hidden)
        visionControl: false, // ❌ Creator only feature (hidden)
        permissionsTab: false, // ❌ Creator only
        adminDashboard: false, // ❌ Creator only
        trainingMode: false, // ❌ Creator only
        apiAccess: false, // ❌ Creator only
        dailyChatLimit: 10, // Limited to 10 chats per day
        maxFileUploads: 3, // Limited file uploads
        maxImageGenerations: 2 // Limited image generations
      };
    }

    if (hasPremium) {
      // Premium users get most features (except voice and vision - creator only)
      return {
        basicChat: true,
        textGeneration: true,
        voiceMode: false, // ❌ Creator only feature
        researchMode: true,
        quizGenerator: true,
        creativeStudio: true,
        visionControl: false, // ❌ Creator only feature
        browserAutomation: true,
        memorySystem: true,
        consciousnessSystem: true,
        personalizedResponses: true,
        unlimitedChats: true,
        permissionsTab: false, // Creator only
        adminDashboard: false, // Creator only
        trainingMode: false, // Creator only
        apiAccess: false, // Creator only
        dailyChatLimit: 100,
        maxFileUploads: 20,
        maxImageGenerations: 15
      };
    }

    // Default registered users (free tier)
    return {
      basicChat: true,
      textGeneration: true,
      researchMode: false,
      quizGenerator: true, // Allow basic quiz generation
      creativeStudio: false,
      browserAutomation: false,
      memorySystem: false,
      consciousnessSystem: false,
      personalizedResponses: false,
      unlimitedChats: false,
      voiceMode: false, // ❌ Creator only feature (hidden)
      visionControl: false, // ❌ Creator only feature (hidden)
      permissionsTab: false,
      adminDashboard: false,
      trainingMode: false,
      apiAccess: false,
      dailyChatLimit: 25,
      maxFileUploads: 5,
      maxImageGenerations: 5
    };
  }

  // Check if specific feature is allowed
  canAccessFeature(feature: keyof FeaturePermissions): boolean {
    const permissions = this.getFeaturePermissions();
    const value = permissions[feature];
    return typeof value === 'boolean' ? value : true;
  }

  // Get usage limits
  getUsageLimit(limit: 'dailyChatLimit' | 'maxFileUploads' | 'maxImageGenerations'): number {
    const permissions = this.getFeaturePermissions();
    return permissions[limit];
  }

  // Get user tier display name
  getUserTierName(): string {
    if (this.isCreator()) return 'Creator';
    if (this.hasPremiumAccess()) return 'Premium';
    if (this.isGuestUser()) return 'Guest';
    return 'Free';
  }

  // Get features unavailable to current user (for upgrade prompts)
  getUnavailableFeatures(): string[] {
    const permissions = this.getFeaturePermissions();
    const unavailable: string[] = [];

    if (!permissions.voiceMode) unavailable.push('Voice Mode');
    if (!permissions.researchMode) unavailable.push('Research Mode');
    if (!permissions.creativeStudio) unavailable.push('Creative Studio');
    if (!permissions.visionControl) unavailable.push('Vision Control');
    if (!permissions.browserAutomation) unavailable.push('Browser Automation');
    if (!permissions.memorySystem) unavailable.push('Memory System');
    if (!permissions.consciousnessSystem) unavailable.push('AI Consciousness');

    return unavailable;
  }
}

// Export singleton instance
export const userPermissionService = new UserPermissionService();

// Initialize on import
if (typeof window !== 'undefined') {
  userPermissionService.init();
}