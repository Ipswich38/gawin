'use client';

import { useEffect, useState } from 'react';
import MobileChatInterface from '@/components/MobileChatInterface';
import { User } from '@/lib/services/databaseService';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('gawin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle logout - simple localStorage clear
  const handleLogout = () => {
    localStorage.removeItem('gawin_user');
    window.location.href = '/';
  };

  // Handle back to landing
  const handleBackToLanding = () => {
    // Stay on dashboard since this is our main app page
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/20">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/';
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

  // Convert simple user to User format for MobileChatInterface
  const legacyUser: User = {
    id: user.id,
    email: user.email,
    full_name: user.full_name || '',
    avatar_url: undefined,
    subscription_tier: (user.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
    credits_remaining: user.credits_remaining || 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_verified: false,
    preferences: {
      theme: 'dark' as const,
      language: 'en',
      notifications_enabled: true,
      ai_model_preference: 'llama-3.1-70b-versatile',
      tutor_mode_default: false
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