/**
 * Unified Voice Control Component for Gawin
 * Combines voice input (speech-to-text) and voice output (text-to-speech) in one control
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Ear } from 'lucide-react';
import { speechRecognitionService, RecognitionResult } from '@/lib/services/speechRecognitionService';
import { hapticService } from '@/lib/services/hapticService';

interface UnifiedVoiceControlProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onSendMessage: (message: string) => void;
  isGawinSpeaking?: boolean;
  disabled?: boolean;
}

const UnifiedVoiceControl: React.FC<UnifiedVoiceControlProps> = ({
  onTranscript,
  onSendMessage,
  isGawinSpeaking = false,
  disabled = false
}) => {
  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isInputSupported, setIsInputSupported] = useState(false);
  const [inputError, setInputError] = useState<string>('');

  // Voice Output States
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);

  // Auto-send transcript after silence
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const voiceActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    setIsInputSupported(speechRecognitionService.isRecognitionSupported());

    // Initialize voice output state
    import('@/lib/services/voiceService').then(({ voiceService }) => {
      setIsVoiceOutputEnabled(voiceService.isVoiceEnabled());
    });

    // Setup speech recognition callbacks
    speechRecognitionService.setCallbacks({
      onResult: (result: RecognitionResult) => {
        if (!result.isFinal) {
          setCurrentTranscript(result.transcript);
          onTranscript(result.transcript, false);

          // Reset silence timer
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
        }
      },

      onFinalResult: (result: RecognitionResult) => {
        console.log('🎤 Final transcript:', result.transcript);
        setCurrentTranscript('');
        finalTranscriptRef.current = result.transcript;
        onTranscript(result.transcript, true);

        // Auto-send after 1 second of silence
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            onSendMessage(finalTranscriptRef.current.trim());
            finalTranscriptRef.current = '';
          }
        }, 1000);
      },

      onStart: () => {
        setIsListening(true);
        setInputError('');
        console.log('🎤 Voice input started');
      },

      onEnd: () => {
        setIsListening(false);
        setIsProcessingVoice(false);
        console.log('🎤 Voice input ended');
      },

      onError: (errorMsg: string) => {
        setInputError(errorMsg);
        setIsListening(false);
        setIsProcessingVoice(false);
      },

      onVoiceStart: () => {
        setIsProcessingVoice(true);
      },

      onVoiceEnd: () => {
        setIsProcessingVoice(false);

        // Start a timer to auto-send after voice stops
        if (voiceActivityTimeoutRef.current) {
          clearTimeout(voiceActivityTimeoutRef.current);
        }
      }
    });

    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (voiceActivityTimeoutRef.current) clearTimeout(voiceActivityTimeoutRef.current);
    };
  }, [onTranscript, onSendMessage]);

  const handleVoiceInputToggle = async () => {
    if (!isInputSupported || disabled || isGawinSpeaking) return;

    hapticService.triggerHaptic('voice');

    if (isListening) {
      speechRecognitionService.stopRecognition();
    } else {
      const success = await speechRecognitionService.startRecognition();
      if (!success) {
        setInputError('Microphone access denied. Please check permissions.');
        hapticService.triggerError();
      } else {
        setTimeout(() => hapticService.triggerStateChange(true), 100);
      }
    }
  };

  const handleVoiceOutputToggle = async () => {
    hapticService.triggerHaptic('voice');

    try {
      const { voiceService } = await import('@/lib/services/voiceService');

      if (isVoiceOutputEnabled) {
        voiceService.disableVoice();
        setIsVoiceOutputEnabled(false);
        setTimeout(() => hapticService.triggerStateChange(false), 100);
      } else {
        const success = await voiceService.enableVoice();
        setIsVoiceOutputEnabled(success);
        if (!success) {
          alert('Voice synthesis not supported in this browser.');
          hapticService.triggerError();
        } else {
          setTimeout(() => hapticService.triggerStateChange(true), 100);
        }
      }
    } catch (error) {
      console.error('Voice output toggle failed:', error);
      hapticService.triggerError();
    }
  };

  const getVoiceIcon = () => {
    if (!isInputSupported || disabled) {
      return (
        <div className="flex items-center space-x-1">
          <MicOff size={12} className="text-gray-500" />
          <VolumeX size={12} className="text-gray-500" />
        </div>
      );
    }

    if (isListening) {
      return (
        <div className="relative flex items-center space-x-1">
          <motion.div
            animate={{ scale: isProcessingVoice ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.6, repeat: isProcessingVoice ? Infinity : 0 }}
          >
            <Mic size={12} className={isProcessingVoice ? "text-red-400" : "text-green-400"} />
          </motion.div>
          <div className={`${isVoiceOutputEnabled ? 'text-green-400' : 'text-gray-400'}`}>
            {isVoiceOutputEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <Mic size={12} className="text-gray-300" />
        <div className={`${isVoiceOutputEnabled ? 'text-green-400' : 'text-gray-400'}`}>
          {isVoiceOutputEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </div>
      </div>
    );
  };

  const getButtonStyle = () => {
    if (!isInputSupported || disabled) {
      return 'bg-gray-500/20 cursor-not-allowed border-gray-500/30';
    }

    if (isListening) {
      return isProcessingVoice
        ? 'bg-red-500/30 border-red-400/50 shadow-lg shadow-red-400/20'
        : 'bg-green-500/30 border-green-400/50 shadow-lg shadow-green-400/20';
    }

    const outputColor = isVoiceOutputEnabled ? 'teal' : 'gray';
    return `bg-${outputColor}-600/20 border-${outputColor}-500/30 hover:bg-${outputColor}-600/30 hover:border-${outputColor}-400/50`;
  };

  if (!isInputSupported) {
    return (
      <div className="flex flex-col items-center space-y-1 opacity-50">
        <div className="w-12 h-12 rounded-full border-2 border-gray-500/30 bg-gray-500/20 flex items-center justify-center">
          <span className="text-xs text-gray-500">N/A</span>
        </div>
        <span className="text-xs text-gray-400">Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Main Voice Control Button */}
      <div className="relative">
        <button
          onClick={handleVoiceInputToggle}
          disabled={disabled || isGawinSpeaking}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
            ${getButtonStyle()}
            ${disabled || isGawinSpeaking ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={
            disabled ? 'Voice input disabled' :
            isGawinSpeaking ? 'Gawin is speaking...' :
            isListening ? 'Stop listening' : 'Start voice input'
          }
        >
          {getVoiceIcon()}

          {/* Voice level indicator */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20"
              animate={{
                scale: isProcessingVoice ? [1, 1.4, 1] : 1,
                opacity: isProcessingVoice ? [0.3, 0.6, 0.3] : 0.3
              }}
              transition={{
                duration: 0.8,
                repeat: isProcessingVoice ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Processing indicator */}
          {isListening && !isProcessingVoice && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Voice output indicator */}
          {isVoiceOutputEnabled && !isListening && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>

        {/* Listening status */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-300 whitespace-nowrap pointer-events-none"
          >
            listening...
          </motion.div>
        )}
      </div>

      {/* Voice Output Toggle (Small secondary button) */}
      <button
        onClick={handleVoiceOutputToggle}
        className={`
          w-6 h-6 rounded-lg flex items-center justify-center
          transition-all duration-200
          ${isVoiceOutputEnabled
            ? 'bg-teal-600 text-white shadow-lg'
            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/60 hover:text-gray-300'
          }
        `}
        title={isVoiceOutputEnabled ? 'Disable Voice Output' : 'Enable Voice Output'}
      >
        {isVoiceOutputEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
      </button>

      {/* Error Display */}
      {inputError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full mt-2 px-2 py-1 bg-red-600/90 text-white text-xs rounded backdrop-blur-sm"
        >
          {inputError}
        </motion.div>
      )}

      {/* Current Transcript Display */}
      {currentTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 px-3 py-1 bg-blue-600/90 text-white text-xs rounded-lg backdrop-blur-sm max-w-xs"
        >
          {currentTranscript}
        </motion.div>
      )}
    </div>
  );
};

export default UnifiedVoiceControl;