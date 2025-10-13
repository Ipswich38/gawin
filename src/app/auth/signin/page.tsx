'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, Mail, Sparkles } from 'lucide-react';
import { NotionCard, NotionButton } from '@/components/ui/NotionUI';

export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    try {
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: false
      });

      if (result?.error) {
        console.error('Sign in error:', result.error);
        setLoading(null);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Gawin</h1>
          <p className="text-gray-600">Your AI-powered agent platform</p>
        </div>

        <NotionCard className="space-y-6">
          <div className="space-y-4">
            <NotionButton
              variant="outline"
              className="w-full justify-center"
              onClick={() => handleSignIn('google')}
              disabled={loading !== null}
              icon={loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            >
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </NotionButton>

            <NotionButton
              variant="outline"
              className="w-full justify-center"
              onClick={() => handleSignIn('github')}
              disabled={loading !== null}
              icon={loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
            >
              {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </NotionButton>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-sm text-gray-500 mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Get started with 1000 free credits</span>
            </div>
            <p className="text-xs text-gray-400">
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
            </p>
          </div>
        </NotionCard>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Build powerful AI workflows with visual drag-and-drop
          </p>
        </div>
      </motion.div>
    </div>
  );
}