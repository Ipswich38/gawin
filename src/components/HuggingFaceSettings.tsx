/**
 * Hugging Face Settings Component
 * Allows users to configure their Pro API key for enhanced capabilities
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, X, Info, Zap, Eye, Mic } from 'lucide-react';
import { huggingFaceService } from '@/lib/services/huggingFaceService';

interface HuggingFaceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const HuggingFaceSettings: React.FC<HuggingFaceSettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [hasProAccess, setHasProAccess] = useState(false);

  useEffect(() => {
    // Check current status
    setHasProAccess(huggingFaceService.hasProAccess());
  }, []);

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Set the API key
      huggingFaceService.setApiKey(apiKey.trim());
      
      // Test the API key with a health check
      const healthCheck = await huggingFaceService.healthCheck();
      
      if (healthCheck.status === 'healthy') {
        setValidationStatus('valid');
        setHasProAccess(true);
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setValidationStatus('invalid');
        setHasProAccess(false);
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      setValidationStatus('invalid');
      setHasProAccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveKey = () => {
    huggingFaceService.setApiKey('');
    setApiKey('');
    setHasProAccess(false);
    setValidationStatus('idle');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Hugging Face Pro</h3>
                  <p className="text-sm text-gray-400">Enhanced AI capabilities</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status */}
            <div className="mb-6">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                hasProAccess 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-gray-800 border border-gray-700'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  hasProAccess ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {hasProAccess ? 'Pro Access Active' : 'Basic Access Only'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {hasProAccess 
                      ? 'Enhanced vision, audio, and text analysis available'
                      : 'Limited to basic functionality'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Pro Features Include:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Advanced object detection & scene analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mic className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">High-quality Whisper transcription</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Emotion detection & intent analysis</span>
                </div>
              </div>
            </div>

            {/* API Key Input */}
            {!hasProAccess && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Hugging Face API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="hf_..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                  />
                  {validationStatus === 'valid' && (
                    <Check className="absolute right-3 top-2.5 w-5 h-5 text-green-400" />
                  )}
                  {validationStatus === 'invalid' && (
                    <X className="absolute right-3 top-2.5 w-5 h-5 text-red-400" />
                  )}
                </div>
                
                {validationStatus === 'invalid' && (
                  <p className="text-xs text-red-400 mt-1">
                    Invalid API key. Please check and try again.
                  </p>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                  <p className="font-medium mb-1">Get your free API key:</p>
                  <p>Visit huggingface.co → Settings → Access Tokens → Create new token</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {hasProAccess ? (
                <button
                  onClick={handleRemoveKey}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Remove Key
                </button>
              ) : (
                <button
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey.trim() || isValidating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Validating...' : 'Save & Activate'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HuggingFaceSettings;