'use client';

import { useState, useEffect } from 'react';
import { initializeGradeASystems } from '@/lib/initialization/gradeAInit';

// Creator email for bypass
const CREATOR_EMAIL = 'kreativloops@gmail.com';

// Simple login component directly in page
export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreatorLogin, setShowCreatorLogin] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [gradeAStatus, setGradeAStatus] = useState<string>('Initializing Grade A systems...');

  // Initialize Grade A systems on component mount
  useEffect(() => {
    const initSystems = async () => {
      try {
        const status = await initializeGradeASystems();
        setGradeAStatus(`🏆 Grade ${status.overallGrade} System Ready (${status.initializationTime.toFixed(0)}ms)`);
      } catch (error) {
        setGradeAStatus('⚠️ System initialization issue');
      }
    };

    initSystems();
  }, []);

  // Simple anonymous login - just redirect to dashboard
  const handleAnonymousLogin = () => {
    setLoading(true);
    console.log('👤 Anonymous user logging in...');
    
    // Set anonymous user in localStorage
    localStorage.setItem('gawin_user', JSON.stringify({
      id: 'anon-' + Date.now(),
      email: 'anonymous@gawin.local',
      full_name: 'Anonymous User',
      isAnonymous: true,
      credits_remaining: 50
    }));
    
    // Redirect to dashboard immediately
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  // Creator bypass login
  const handleCreatorLogin = () => {
    setLoading(true);
    setError('');

    console.log('🎯 Creator logging in...');
    
    // Set creator user in localStorage
    localStorage.setItem('gawin_user', JSON.stringify({
      id: 'creator-001',
      email: CREATOR_EMAIL,
      full_name: 'Kreativ Loops (Creator)',
      isCreator: true,
      credits_remaining: 10000,
      subscription_tier: 'enterprise'
    }));
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  // Show Google login modal
  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  // Handle Google login with email
  const handleGoogleWithEmail = () => {
    setLoading(true);
    setError('');

    if (!userEmail) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    console.log(`🚀 Google login with email: ${userEmail}`);

    // Check if this is the creator email
    if (userEmail === CREATOR_EMAIL) {
      console.log('🎯 Creator logged in via Google');
      localStorage.setItem('gawin_user', JSON.stringify({
        id: 'creator-001',
        email: CREATOR_EMAIL,
        full_name: 'Kreativ Loops (Creator)',
        isCreator: true,
        credits_remaining: 10000,
        subscription_tier: 'enterprise'
      }));
    } else {
      console.log('👤 Regular user logged in via Google');
      localStorage.setItem('gawin_user', JSON.stringify({
        id: 'google-' + Date.now(),
        email: userEmail,
        full_name: 'Google User',
        credits_remaining: 100
      }));
    }

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowGoogleModal(false);
    setUserEmail('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        {/* App Logo and Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Welcome to Gawin</h1>
          <p className="text-gray-600 text-lg" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Your intelligent AI assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-xl text-gray-900 mb-2" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Sign in to continue</h2>
            <p className="text-gray-600" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Simple authentication system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
              role="alert"
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
              <div className="text-center mb-6">
                <h3 className="text-lg text-gray-900 mb-2" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Creator Access</h3>
                <p className="text-gray-600 text-sm">Sign in with kreativloops@gmail.com</p>
              </div>

              <button
                onClick={handleCreatorLogin}
                disabled={loading}
                className="w-full py-4 px-6 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-semibold rounded-xl border-2 border-transparent hover:border-[#00C2A8]/20 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-[#00C2A8]/10 disabled:cursor-not-allowed group"
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

              <button
                onClick={() => setShowCreatorLogin(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to regular login
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-in Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 px-6 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-semibold rounded-xl border-2 border-transparent hover:border-[#00C2A8]/20 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-[#00C2A8]/10 disabled:cursor-not-allowed group mb-4"
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
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
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

            </>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-600">
            Click any button to access Gawin AI
          </p>
          <button
            onClick={() => setShowCreatorLogin(true)}
            className="text-xs text-gray-700 hover:text-gray-900 transition-colors duration-200 mt-2"
          >
            Creator Access
          </button>
        </div>
      </div>

      {/* Google Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Continue with Google</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Input Option */}
              <div>
                <h4 className="text-gray-900 mb-4 text-center" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Enter your email to sign in</h4>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}
                  />
                  <button
                    onClick={handleGoogleWithEmail}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-semibold rounded-xl border-2 border-transparent hover:border-[#00C2A8]/20 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-[#00C2A8]/10 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">or</span>
                </div>
              </div>

              {/* Guest Option */}
              <div>
                <h4 className="text-gray-900 mb-4 text-center" style={{fontFamily: 'Avenir, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400}}>Continue without account</h4>
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleAnonymousLogin();
                  }}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Continue as Guest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}