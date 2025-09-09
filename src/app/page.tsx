'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLandingPage from '@/components/ModernLandingPage';
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="font-serif text-2xl text-stone-900 mb-2">Welcome to Gawin</h1>
          <p className="text-stone-600">Your AI Learning Assistant</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/60 backdrop-blur-sm border-2 border-stone-200/50 rounded-2xl p-8">
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
                  className="w-full px-4 py-3 border-2 border-stone-200/50 rounded-xl focus:outline-none focus:border-stone-400/50 transition-colors"
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
                className="w-full px-4 py-3 border-2 border-stone-200/50 rounded-xl focus:outline-none focus:border-stone-400/50 transition-colors"
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
                className="w-full px-4 py-3 border-2 border-stone-200/50 rounded-xl focus:outline-none focus:border-stone-400/50 transition-colors"
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
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-200/50 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-stone-600 hover:text-stone-800 text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-stone-600 text-sm">⚡</span>
            </div>
            <p className="text-xs text-stone-600">Instant Help</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-stone-600 text-sm">🎯</span>
            </div>
            <p className="text-xs text-stone-600">Personalized</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-stone-600 text-sm">🛡️</span>
            </div>
            <p className="text-xs text-stone-600">Safe & Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function HomePage() {
  const { user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setCurrentView('landing');
  };

  // Handle login redirect
  const handleLogin = () => {
    // The AuthContext will automatically update when login succeeds
    setCurrentView('landing');
  };

  // Handle start chat
  const handleStartChat = () => {
    setCurrentView('chat');
  };

  // Handle back to landing
  const handleBackToLanding = () => {
    setCurrentView('landing');
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

  // Show appropriate view for authenticated users
  return (
    <>
      {currentView === 'landing' ? (
        <ModernLandingPage
          user={user}
          onLogin={handleLogin}
          onStartChat={handleStartChat}
        />
      ) : (
        <ModernChatInterface
          user={user}
          onLogout={handleLogout}
          onBackToLanding={handleBackToLanding}
        />
      )}
      
      {/* Behavior Service for authenticated users */}
      <BehaviorService>
        <div />
      </BehaviorService>
    </>
  );
}