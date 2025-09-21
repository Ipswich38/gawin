'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PremiumFeatureGateProps {
  featureName: string;
  description: string;
  onUpgrade?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function PremiumFeatureGate({
  featureName,
  description,
  onUpgrade,
  children,
  icon
}: PremiumFeatureGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Blurred content behind */}
      <div className="filter blur-sm pointer-events-none opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          {/* Premium Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {icon || (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          {/* Feature Name */}
          <h3 className="text-xl font-bold text-white mb-3">
            {featureName}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {/* Guest Limitation Message */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-amber-200 text-xs font-medium">Guest Mode Limitation</p>
                <p className="text-amber-300 text-xs">This feature requires an account to prevent unauthorized access</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Create Free Account</span>
              </button>
            )}

            {/* Alternative: Sign in */}
            <button
              onClick={() => {
                // Redirect to login
                window.location.href = '/';
              }}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200 text-sm"
            >
              Already have an account? Sign In
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs text-gray-400">
                Protected by advanced security measures
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}