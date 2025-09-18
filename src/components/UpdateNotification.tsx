/**
 * Update Notification Component
 * Shows when new updates are available for Gawin
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdateNotificationProps {
  isVisible: boolean;
  onApply?: () => void;
  onDismiss?: () => void;
  autoApplySeconds?: number;
}

export default function UpdateNotification({
  isVisible,
  onApply,
  onDismiss,
  autoApplySeconds = 10
}: UpdateNotificationProps) {
  const [countdown, setCountdown] = useState(autoApplySeconds);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoApplySeconds);
      setIsApplying(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleApplyUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoApplySeconds]);

  const handleApplyUpdate = async () => {
    setIsApplying(true);
    try {
      await onApply?.();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsApplying(false);
    }
  };

  const handleDismiss = () => {
    setIsApplying(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-[9999] max-w-sm"
        >
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    🚀
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    Update Available!
                  </h3>
                  <p className="text-white/80 text-sm">
                    New features and improvements are ready
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/60 hover:text-white/80 transition-colors p-1"
                  disabled={isApplying}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {!isApplying ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                      <span>Auto-applying in:</span>
                      <span className="font-mono font-bold text-white">
                        {countdown}s
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-white/60 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(countdown / autoApplySeconds) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyUpdate}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Update Now
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 text-white/80 hover:text-white transition-colors text-sm"
                    >
                      Later
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-white/30 border-t-white"
                  />
                  <p className="text-white font-medium">Applying update...</p>
                  <p className="text-white/70 text-sm mt-1">
                    Please wait while we refresh Gawin
                  </p>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}