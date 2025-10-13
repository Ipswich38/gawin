'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { NotionCard, NotionButton } from '@/components/ui/NotionUI';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
      default:
        return 'An error occurred during authentication. Please try again.';
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
        <NotionCard className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Error
            </h1>
            <p className="text-gray-600">
              {getErrorMessage(error)}
            </p>
          </div>

          <div className="space-y-3">
            <NotionButton
              variant="primary"
              className="w-full justify-center"
              onClick={() => router.push('/auth/signin')}
            >
              Try Again
            </NotionButton>

            <NotionButton
              variant="ghost"
              className="w-full justify-center"
              onClick={() => router.push('/')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Home
            </NotionButton>
          </div>
        </NotionCard>
      </motion.div>
    </div>
  );
}