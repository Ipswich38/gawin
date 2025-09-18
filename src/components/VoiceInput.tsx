/**
 * Voice Input Component for Gawin
 * Provides microphone input with real-time transcription and voice conversation
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Languages, Loader } from 'lucide-react';
import { speechRecognitionService, RecognitionResult } from '@/lib/services/speechRecognitionService';
import { hapticService } from '@/lib/services/hapticService';

interface VoiceInputProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onSendMessage: (message: string) => void;
  isGawinSpeaking?: boolean;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  onSendMessage, 
  isGawinSpeaking = false,
  disabled = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string>('');

  // Auto-send transcript after silence
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const voiceActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    setIsSupported(speechRecognitionService.isRecognitionSupported());

    // Setup callbacks
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
        setError('');
        console.log('🎤 Voice input started');
      },
      
      onEnd: () => {
        setIsListening(false);
        setIsProcessingVoice(false);
        console.log('🎤 Voice input ended');
      },
      
      onError: (errorMsg: string) => {
        setError(errorMsg);
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
        
        voiceActivityTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            console.log('🚀 Auto-sending after voice inactivity:', finalTranscriptRef.current.trim());
            onSendMessage(finalTranscriptRef.current.trim());
            finalTranscriptRef.current = '';
            setCurrentTranscript('');
          }
        }, 2000); // 2 seconds after voice stops
      }
    });

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (voiceActivityTimeoutRef.current) {
        clearTimeout(voiceActivityTimeoutRef.current);
      }
    };
  }, [onTranscript, onSendMessage]);

  const handleMicToggle = async () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Trigger haptic feedback for microphone control
    hapticService.triggerHaptic('microphone');

    if (isListening) {
      speechRecognitionService.stopListening();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      // Additional haptic feedback for stopping
      setTimeout(() => hapticService.triggerStateChange(false), 100);
    } else {
      const success = await speechRecognitionService.startListening();
      if (!success) {
        setError('Microphone access denied. Please check permissions.');
        hapticService.triggerError();
      } else {
        // Additional haptic feedback for successful start
        setTimeout(() => hapticService.triggerStateChange(true), 100);
      }
    }
  };

  const handleLanguageSwitch = () => {
    speechRecognitionService.switchLanguage();
  };

  const getLanguageDisplay = () => {
    const config = speechRecognitionService.getConfig();
    switch (config.language) {
      case 'en-US': return 'EN';
      case 'en-PH': return 'EN-PH';
      case 'fil-PH': return 'TL';
      case 'auto': return '';
      default: return '';
    }
  };

  const getMicIcon = () => {
    if (!isSupported || disabled) {
      return <MicOff size={20} className="text-gray-500" />;
    }
    
    if (isListening) {
      return (
        <motion.div
          animate={{ scale: isProcessingVoice ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.6, repeat: isProcessingVoice ? Infinity : 0 }}
        >
          <Mic size={20} className="text-white" />
        </motion.div>
      );
    }
    
    return <Mic size={20} className="text-gray-300" />;
  };

  const getButtonStyle = () => {
    if (!isSupported || disabled) {
      return 'bg-gray-500/20 cursor-not-allowed border-gray-500/30';
    }
    
    if (isListening) {
      return isProcessingVoice 
        ? 'bg-red-500/30 border-red-400/50 shadow-lg shadow-red-400/20' 
        : 'bg-green-500/30 border-green-400/50 shadow-lg shadow-green-400/20';
    }
    
    return 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30';
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <MicOff size={16} />
        <span>Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Main Microphone Button */}
      <button
        onClick={handleMicToggle}
        disabled={disabled || isGawinSpeaking}
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 
          ${getButtonStyle()}
          ${disabled || isGawinSpeaking ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={
          disabled ? 'Voice input disabled' :
          isGawinSpeaking ? 'Gawin is speaking...' :
          isListening ? 'Stop listening (Braille: ⠍)' : 'Start voice input (Braille: ⠍)'
        }
      >
        {getMicIcon()}
        
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
      </button>

      {/* Language Selector */}
      <button
        onClick={handleLanguageSwitch}
        disabled={disabled || isListening}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
          ${disabled || isListening 
            ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 border border-gray-500/30'
          }
        `}
        title="Switch language (EN/TL/AUTO)"
      >
        <Languages size={14} />
        <span>{getLanguageDisplay()}</span>
      </button>

      {/* Status Display */}
      <AnimatePresence>
        {(currentTranscript || error || isListening) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 min-w-0"
          >
            {error ? (
              <div className="text-xs text-red-400 flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="truncate">{error}</span>
              </div>
            ) : currentTranscript ? (
              <div className="text-xs text-blue-300 flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="truncate italic">"{currentTranscript}"</span>
              </div>
            ) : isListening ? (
              <div className="text-xs text-green-300 flex items-center space-x-1">
                <Loader size={12} className="animate-spin" />
                <span>Listening...</span>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;