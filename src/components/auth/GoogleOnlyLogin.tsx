'use client';

import { useState } from 'react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { supabaseAuth } from '@/lib/services/supabaseAuth';

// Creator email for bypass
const CREATOR_EMAIL = 'kreativloops@gmail.com';

interface GoogleOnlyLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleOnlyLogin({ onSuccess, onError }: GoogleOnlyLoginProps) {
  const { signInWithGoogle, signInAnonymously } = useGoogleAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreatorLogin, setShowCreatorLogin] = useState(false);
  const [creatorEmail, setCreatorEmail] = useState('');

  // Creator bypass login
  const handleCreatorLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (creatorEmail !== CREATOR_EMAIL) {
        setError('Unauthorized: Creator access only');
        return;
      }

      // Sign in anonymously first, then update metadata
      const result = await signInAnonymously();
      
      if (result.success) {
        // Update user metadata to mark as creator
        const client = supabaseAuth.getClient();
        await client.auth.updateUser({
          data: {
            is_creator: true,
            email: CREATOR_EMAIL,
            full_name: 'Kreativ Loops (Creator)',
            role: 'creator'
          }
        });

        console.log('🎯 Creator logged in successfully');
        onSuccess?.();
      } else {
        setError(result.error || 'Creator authentication failed');
        onError?.(result.error || 'Creator authentication failed');
      }
      
    } catch (err) {
      console.error('Creator login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Creator authentication failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Anonymous login
  const handleAnonymousLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInAnonymously();
      
      if (result.success) {
        console.log('👤 Anonymous user logged in successfully');
        onSuccess?.();
      } else {
        setError(result.error || 'Anonymous authentication failed');
        onError?.(result.error || 'Anonymous authentication failed');
      }
      
    } catch (err) {
      console.error('Anonymous login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Anonymous authentication failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log('🚀 Google OAuth initiated successfully');
        onSuccess?.();
      } else {
        console.error('Google OAuth failed:', result.error);
        
        // If Google OAuth is not configured, fall back to anonymous
        if (result.error?.includes('OAuth') || result.error?.includes('Google') || result.error?.includes('provider')) {
          console.log('🔄 Google OAuth not available, falling back to anonymous login');
          await handleAnonymousLogin();
          return;
        }
        
        setError(result.error || 'Authentication failed. Please try again.');
        onError?.(result.error || 'Authentication failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Unexpected error during Google sign-in:', err);
      // Fall back to anonymous login on any error
      console.log('🔄 Falling back to anonymous login due to error');
      await handleAnonymousLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="/background/loginbg-poster.jpg" // Optional: add a poster image as fallback
      >
        <source src="/background/new.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-[#121212]"></div>
      </video>
      
      {/* Subtle dark overlay for readability while showing nostalgic background */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      <div className="w-full max-w-md relative z-20">
        {/* App Logo and Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00C2A8] to-[#00A693] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00C2A8]/30 backdrop-blur-sm">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Welcome to Gawin</h1>
          <p className="text-gray-200 text-lg drop-shadow-md">Your AI-powered learning assistant</p>
        </div>

        {/* Login Card with subtle transparency to show nostalgic background */}
        <div className="bg-[#1E1E1E]/60 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/40">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to continue</h2>
            <p className="text-gray-400">Secure authentication with Google</p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Creator Login Section */}
          {showCreatorLogin ? (
            <div className="mb-6 space-y-4">
              <div>
                <label htmlFor="creator-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Creator Email
                </label>
                <input
                  id="creator-email"
                  type="email"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] focus:border-[#00C2A8] transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Enter creator email"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleCreatorLogin}
                disabled={loading || !creatorEmail}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#00C2A8] to-[#00A693] hover:from-[#00A693] to-[#008A7A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-[#00C2A8]/20 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] focus:ring-offset-2 focus:ring-offset-[#1E1E1E]"
                aria-label="Creator Login"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Creator Login</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreatorLogin(false)}
                className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                ← Back to regular login
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-in Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-semibold rounded-xl border-2 border-transparent hover:border-[#00C2A8]/20 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-[#00C2A8]/10 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] focus:ring-offset-2 focus:ring-offset-[#1E1E1E] disabled:cursor-not-allowed group mb-4"
                aria-label="Continue with Google"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="group-hover:text-[#00C2A8] transition-colors duration-200">Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1E1E1E]/60 backdrop-blur-sm text-gray-400">or</span>
                </div>
              </div>

              {/* Anonymous Login Button */}
              <button
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full py-3 px-6 bg-[#2A2A2A] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600 hover:border-[#00C2A8]/30 transition-all duration-200 flex items-center justify-center space-x-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] focus:ring-offset-2 focus:ring-offset-[#1E1E1E]"
                aria-label="Continue as Guest"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Continue as Guest</span>
                  </>
                )}
              </button>

              {/* Creator Access Link */}
              <div className="text-center">
                <button
                  onClick={() => setShowCreatorLogin(true)}
                  className="text-xs text-gray-500 hover:text-[#00C2A8] transition-colors duration-200 underline"
                >
                  Creator Access
                </button>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-center justify-center">
              <svg className="w-4 h-4 text-[#00C2A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs text-gray-400">
                Secured authentication system
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}