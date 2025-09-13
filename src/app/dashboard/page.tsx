'use client';

import { useEffect, useState } from 'react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import MobileChatInterface from '@/components/MobileChatInterface';
import { User } from '@/lib/services/databaseService';

export default function DashboardPage() {
  const { user, isLoading, signOut } = useGoogleAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  // Handle back to landing - redirect to dashboard
  const handleBackToLanding = () => {
    // Stay on dashboard since this is our main app page
  };

  // Show loading while checking auth or mounting
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/20">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin w-5 h-5 text-[#00C2A8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/20">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Convert UserProfile to User format for MobileChatInterface
  const legacyUser: User = {
    id: user.user_id,
    email: user.email,
    full_name: user.full_name || '',
    avatar_url: user.avatar_url || undefined,
    subscription_tier: (user.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
    credits_remaining: user.credits || 100,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    email_verified: user.email_verified || false,
    preferences: {
      theme: 'dark' as const,
      language: 'en',
      notifications_enabled: true,
      ai_model_preference: 'llama-3.1-70b-versatile',
      tutor_mode_default: false,
      ...user.preferences
    }
  };

  // Show main chat interface for authenticated users
  return (
    <MobileChatInterface
      user={legacyUser}
      onLogout={handleLogout}
      onBackToLanding={handleBackToLanding}
    />
  );
}