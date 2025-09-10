'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernChatInterface from '@/components/ModernChatInterface';
import BehaviorService from '@/components/BehaviorService';

// Auth Components
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const result = await auth.signUp(email, password, fullName);
        if (!result.success && result.error) {
          setError(result.error);
        } else {
          alert('Account created successfully! Please sign in.');
          setIsSignUp(false);
        }
      } else {
        const result = await auth.signIn(email, password);
        if (!result.success && result.error) {
          setError(result.error);
        } else {
          onLogin();
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="font-serif text-2xl text-stone-900 mb-2">Welcome to Gawin</h1>
          <p className="text-stone-600">Your AI Learning Assistant</p>
        </div>

        {/* Auth Form - Material 3 inspired elevated surface */}
        <div className="bg-white/60 backdrop-blur-sm shadow-lg border border-stone-200/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200 text-slate-800 placeholder-slate-400 hover:bg-slate-50"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200 text-slate-800 placeholder-slate-400 hover:bg-slate-50"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200 text-slate-800 placeholder-slate-400 hover:bg-slate-50"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl font-medium hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Google OAuth Button */}
          <div className="mt-4">
            <button
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const result = await auth.signInWithGoogle();
                  if (!result.success && result.error) {
                    setError(result.error);
                  }
                } catch (error: unknown) {
                  setError(error instanceof Error ? error.message : 'An error occurred');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-stone-200 text-stone-700 rounded-2xl font-medium hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Email-only signup option */}
          {!isSignUp && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-stone-500">or get a signup link</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const emailInput = prompt('Enter your email address to receive a signup link:');
                  if (emailInput) {
                    setLoading(true);
                    setError('');
                    try {
                      const result = await auth.signUpWithEmail(emailInput);
                      if (result.success) {
                        alert('Check your email for a signup link!');
                      } else if (result.error) {
                        setError(result.error);
                      }
                    } catch (error: unknown) {
                      setError(error instanceof Error ? error.message : 'An error occurred');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                className="w-full mt-3 py-2 text-stone-600 hover:text-stone-800 text-sm transition-colors underline"
              >
                Send me a signup link
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-stone-200/50 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-stone-600 hover:text-stone-800 text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Main App Component
export default function HomePage() {
  const { user, isLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  // Handle login redirect
  const handleLogin = () => {
    // The AuthContext will automatically update when login succeeds
  };

  // Handle back to landing - not used since we go directly to chat
  const handleBackToLanding = () => {
    // This could redirect to a landing page if needed in the future
  };

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        {/* Behavior Service for unauthenticated users */}
        <BehaviorService>
          <div />
        </BehaviorService>
      </>
    );
  }

  // Show chat interface directly for authenticated users
  return (
    <>
      <ModernChatInterface
        user={user}
        onLogout={handleLogout}
        onBackToLanding={handleBackToLanding}
      />
      
      {/* Behavior Service for authenticated users */}
      <BehaviorService>
        <div />
      </BehaviorService>
    </>
  );
}