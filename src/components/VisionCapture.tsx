'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { visionService, VisionAnalysis } from '@/lib/services/visionService';

interface VisionCaptureProps {
  onVisionAnalysis?: (analysis: VisionAnalysis) => void;
  onVisionContext?: (context: string) => void;
}

const VisionCapture: React.FC<VisionCaptureProps> = ({ 
  onVisionAnalysis, 
  onVisionContext 
}) => {
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [attentionLevel, setAttentionLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<VisionAnalysis | null>(null);

  const handleVisionAnalysis = (analysis: VisionAnalysis) => {
    setLastAnalysis(analysis);
    
    if (analysis.emotions) {
      setCurrentEmotion(analysis.emotions.dominant);
      setEmotionConfidence(analysis.emotions.confidence);
    }
    
    setAttentionLevel(analysis.attentionLevel);
    
    // Generate context for Gawin
    const context = visionService.generateVisionPromptContext(analysis);
    if (context && onVisionContext) {
      onVisionContext(context);
    }

    if (onVisionAnalysis) {
      onVisionAnalysis(analysis);
    }
  };

  const handleEnableVision = () => {
    if (!hasConsent) {
      setShowConsentModal(true);
    } else {
      startVisionSystem();
    }
  };

  const handleConsentGiven = async () => {
    setHasConsent(true);
    setShowConsentModal(false);
    await startVisionSystem();
  };

  const startVisionSystem = async () => {
    setIsInitializing(true);
    
    try {
      const cameraAccess = await visionService.requestCameraAccess(true);
      
      if (cameraAccess) {
        await visionService.startAnalysis(handleVisionAnalysis);
        setIsVisionEnabled(true);
        console.log('👁️ Vision system activated - Gawin can now see you');
      } else {
        console.log('❌ Camera access denied');
      }
    } catch (error) {
      console.error('Vision system error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopVisionSystem = () => {
    visionService.disconnect();
    setIsVisionEnabled(false);
    setCurrentEmotion('neutral');
    setEmotionConfidence(0);
    setAttentionLevel('medium');
    setLastAnalysis(null);
    console.log('👁️ Vision system deactivated');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      visionService.disconnect();
    };
  }, []);

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'happy': return 'text-yellow-400';
      case 'sad': return 'text-blue-400';
      case 'angry': return 'text-red-400';
      case 'surprised': return 'text-purple-400';
      case 'fearful': return 'text-orange-400';
      case 'disgusted': return 'text-green-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getAttentionColor = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
    }
  };

  return (
    <>
      {/* Vision Control Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={isVisionEnabled ? stopVisionSystem : handleEnableVision}
          disabled={isInitializing}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${isVisionEnabled 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
              : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30'
            }
            ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={isVisionEnabled ? 'Stop Vision' : 'Enable Vision'}
        >
          {isInitializing ? (
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          ) : isVisionEnabled ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
          <span className="hidden sm:inline">
            {isInitializing ? 'Starting...' : isVisionEnabled ? 'Vision On' : 'Enable Vision'}
          </span>
        </button>

        {/* Privacy Indicator */}
        {isVisionEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1 text-xs text-gray-400"
          >
            <Shield size={12} />
            <span className="hidden sm:inline">Client-side only</span>
          </motion.div>
        )}
      </div>

      {/* Vision Status Display */}
      <AnimatePresence>
        {isVisionEnabled && lastAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 right-4 bg-black/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-3 space-y-2 text-xs"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${lastAnalysis.faceDetected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-gray-300">
                {lastAnalysis.faceDetected ? 'Face detected' : 'No face detected'}
              </span>
            </div>

            {lastAnalysis.emotions && (
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-400">Emotion:</span>
                <span className={`font-medium capitalize ${getEmotionColor(currentEmotion)}`}>
                  {currentEmotion} ({Math.round(emotionConfidence * 100)}%)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between space-x-3">
              <span className="text-gray-400">Attention:</span>
              <span className={`font-medium capitalize ${getAttentionColor(attentionLevel)}`}>
                {attentionLevel}
              </span>
            </div>

            {lastAnalysis.gestures && lastAnalysis.gestures.detected.length > 0 && (
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-400">Gestures:</span>
                <span className="text-purple-400 text-xs">
                  {lastAnalysis.gestures.detected.join(', ')}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <Camera className="text-teal-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Enable Gawin Vision</h3>
                  <p className="text-gray-400 text-sm">Give Gawin the ability to see you</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">What Gawin will see:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Your facial expressions and emotions</li>
                      <li>• Basic gestures and attention level</li>
                      <li>• Visual context for better responses</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Shield size={16} className="text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Privacy guarantees:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• All processing happens on your device</li>
                      <li>• No video data is stored or transmitted</li>
                      <li>• You can stop at any time</li>
                      <li>• No recording or screenshots</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConsentGiven}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
                >
                  Enable Vision
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisionCapture;