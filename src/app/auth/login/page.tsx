'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Try test login first
      const testResponse = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        if (testData.success) {
          // Store session data
          localStorage.setItem('user', JSON.stringify(testData.user));
          localStorage.setItem('session', JSON.stringify(testData.session));
          
          // Redirect to main app
          window.location.href = '/';
          return;
        }
      }

      // If test login fails, try regular Supabase login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store session data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('session', JSON.stringify(data.session));
        
        // Redirect to main app
        window.location.href = '/';
      } else {
        if (data.needsVerification) {
          // Redirect to verification page
          window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
        } else {
          alert(data.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setLoading(true);
    
    try {
      console.log(`🧪 Attempting test login: ${testEmail}`);
      
      // Try test login directly
      const testResponse = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        if (testData.success) {
          console.log(`✅ Test login successful:`, testData);
          
          // Store session data
          localStorage.setItem('user', JSON.stringify(testData.user));
          localStorage.setItem('session', JSON.stringify(testData.session));
          
          // Redirect to main app
          window.location.href = '/';
          return;
        }
      }

      const errorData = await testResponse.json();
      console.error(`❌ Test login failed:`, errorData);
      alert(`Test login failed: ${errorData.error || 'Unknown error'}`);
      
    } catch (error) {
      console.error('Test login error:', error);
      alert('Test login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbeb' }}>
      {/* Clean Navigation Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>
                  Gawin
                </h1>
                <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signup">
                <button className="text-sm opacity-60 hover:opacity-80 transition-opacity" style={{ color: '#051a1c' }}>
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-normal mb-3" style={{ color: '#051a1c' }}>Welcome back</h1>
            <p className="opacity-60" style={{ color: '#051a1c' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm opacity-70 mb-3" style={{ color: '#051a1c' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-sm"
                style={{ color: '#051a1c' }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm opacity-70 mb-3" style={{ color: '#051a1c' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-sm"
                style={{ color: '#051a1c' }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all text-base font-medium shadow-lg"
              style={{ backgroundColor: '#051a1c' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Test Accounts Section */}
          <div className="mt-10 bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
            <p className="text-sm opacity-60 text-center mb-4" style={{ color: '#051a1c' }}>
              Development Test Accounts
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleTestLogin('admin@kreativloops.com', 'admin123')}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 transition-all disabled:opacity-50 shadow-sm"
              >
                <div className="font-medium" style={{ color: '#051a1c' }}>Admin Account</div>
                <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>admin@kreativloops.com</div>
              </button>
              <button
                onClick={() => handleTestLogin('user@kreativloops.com', 'user123')}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 transition-all disabled:opacity-50 shadow-sm"
              >
                <div className="font-medium" style={{ color: '#051a1c' }}>User Account</div>
                <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>user@kreativloops.com</div>
              </button>
              <button
                onClick={() => handleTestLogin('demo@kreativloops.com', 'demo123')}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 transition-all disabled:opacity-50 shadow-sm"
              >
                <div className="font-medium" style={{ color: '#051a1c' }}>Demo Account</div>
                <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>demo@kreativloops.com</div>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm opacity-60" style={{ color: '#051a1c' }}>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="opacity-100 hover:underline font-medium" style={{ color: '#051a1c' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}