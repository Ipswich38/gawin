'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GawinIceCube } from './GawinIceCube';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceInput: (text: string) => void;
  isProcessing?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceOverlay({ isOpen, onClose, onVoiceInput, isProcessing = false }: VoiceOverlayProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vibrationRef = useRef<number | null>(null);

  // Initialize speech recognition and audio context
  useEffect(() => {
    if (!isOpen) return;

    const initializeVoice = async () => {
      try {
        // Initialize audio context for vibration feedback
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Get user media for feedback
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

      } catch (error) {
        console.log('Audio setup optional, continuing without:', error);
      }
    };

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setState('listening');
          setIsListening(true);
          startVibrationFeedback();
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript) {
            handleVoiceComplete(finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          stopVibrationFeedback();
          if (state === 'listening') {
            setState('idle');
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          stopVibrationFeedback();
          setState('idle');
        };
      }
    }

    initializeVoice();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopVibrationFeedback();
    };
  }, [isOpen]);

  // Update state based on processing
  useEffect(() => {
    if (isProcessing) {
      setState('processing');
    } else if (state === 'processing') {
      setState('idle');
    }
  }, [isProcessing]);

  const startVibrationFeedback = () => {
    // Gentle vibration pattern for voice feedback
    if ('vibrate' in navigator) {
      vibrationRef.current = window.setInterval(() => {
        navigator.vibrate(50); // Short gentle vibration
      }, 500);
    }
  };

  const stopVibrationFeedback = () => {
    if (vibrationRef.current) {
      clearInterval(vibrationRef.current);
      vibrationRef.current = null;
    }
  };

  const handleVoiceComplete = (text: string) => {
    setState('processing');
    setTranscript(text);
    stopVibrationFeedback();

    // Send to parent component (same chat API)
    onVoiceInput(text);

    // Clear transcript after sending
    setTimeout(() => {
      setTranscript('');
      setState('idle');
    }, 1000);
  };

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening && state === 'idle' && !isProcessing) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Gawin is responding...';
      default: return 'Tap to speak';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-sm w-full border border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Voice Mode Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Voice Mode</h2>
            <p className="text-gray-400 text-sm">Talk with Gawin hands-free</p>
          </div>

          {/* 3D Cube Animation */}
          <div className="flex justify-center mb-6">
            <GawinIceCube
              state={state}
              onClick={isListening ? handleStopListening : handleStartListening}
            />
          </div>

          {/* State Text */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-white">{getStateText()}</p>
            {transcript && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-teal-200 text-sm">{transcript}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={isProcessing}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-600 disabled:text-gray-300'
              }`}
            >
              {isListening ? 'Stop' : 'Listen'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>

          {/* Accessibility Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Voice input syncs with your current chat • Gentle vibration feedback included
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}