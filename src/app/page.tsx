'use client';

import { useEffect, useState } from 'react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import GoogleOnlyLogin from '@/components/auth/GoogleOnlyLogin';

// Main App Component
export default function HomePage() {
  const { user, isLoading } = useGoogleAuth();
  const [mounted, setMounted] = useState(false);
  const [forceShowLogin, setForceShowLogin] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Emergency fallback: force show login after 5 seconds
    const emergencyTimeout = setTimeout(() => {
      if (isLoading && !user) {
        console.log('🚨 Emergency timeout: forcing login display');
        setForceShowLogin(true);
      }
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, [isLoading, user]);

  // Handle successful login - redirect to dashboard
  const handleLoginSuccess = () => {
    console.log('✅ Login successful, redirecting to dashboard...');
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    console.error('❌ Login error:', error);
  };

  // Show loading while checking auth or mounting (unless forced to show login)
  if (!mounted || (isLoading && !forceShowLogin)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/20">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <svg className="animate-spin w-5 h-5 text-[#00C2A8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400">Initializing...</p>
          </div>
          <button
            onClick={() => setForceShowLogin(true)}
            className="px-4 py-2 bg-[#00C2A8] hover:bg-[#00A693] text-white rounded-lg text-sm transition-colors duration-200"
          >
            Skip to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/20">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show Google-only login for unauthenticated users
  return (
    <GoogleOnlyLogin
      onSuccess={handleLoginSuccess}
      onError={handleLoginError}
    />
  );
}