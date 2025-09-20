'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceModeIcon } from './ui/LineIcons';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceModePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceMessage: (message: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceModePopup({ isOpen, onClose, onVoiceMessage }: VoiceModePopupProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio context and speech recognition
  useEffect(() => {
    if (!isOpen) return;

    const initializeAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Get user media for voice isolation
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        });

        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        // Voice isolation filter
        const highpass = audioContextRef.current.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 80; // Remove low-frequency noise

        const lowpass = audioContextRef.current.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 8000; // Remove high-frequency noise

        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(analyserRef.current);

        startAudioAnalysis();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
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
            handleVoiceInput(finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (state === 'listening') {
            setState('idle');
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          setState('idle');
        };
      }

      synthRef.current = window.speechSynthesis;
    }

    initializeAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isOpen]);

  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);

      // Calculate average audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average / 255);

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const handleVoiceInput = async (text: string) => {
    setState('processing');
    setTranscript(text);

    // Send to parent component for processing
    onVoiceMessage(text);

    // For now, simulate AI response - in real implementation this would come from the chat system
    try {
      // This would be replaced with actual AI response from your existing chat system
      const response = `I heard you say: "${text}". Let me help you with that.`;
      setAiResponse(response);

      if (synthRef.current) {
        setState('speaking');
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.onend = () => setState('idle');
        synthRef.current.speak(utterance);
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setState('idle');
    }
  };

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening && state === 'idle') {
      setTranscript('');
      setAiResponse('');
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'listening': return '#60a5fa'; // blue
      case 'processing': return '#f59e0b'; // amber
      case 'speaking': return '#10b981'; // emerald
      default: return '#e5e7eb'; // gray
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Ready to listen';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <VoiceModeIcon size={24} className="text-teal-400" />
              <h2 className="text-2xl font-bold text-white">Voice Mode</h2>
            </div>
            <p className="text-gray-400 text-sm">Talk with Gawin hands-free</p>
          </div>

          {/* Voice Visualization */}
          <div className="flex flex-col items-center mb-8">
            {/* Animated Voice Circle */}
            <div className="relative mb-6">
              <div
                className="w-32 h-32 rounded-full border-4 transition-all duration-300 flex items-center justify-center cursor-pointer"
                style={{
                  borderColor: getStateColor(),
                  backgroundColor: `${getStateColor()}20`,
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  color: getStateColor(),
                }}
                onClick={isListening ? handleStopListening : handleStartListening}
              >
                <VoiceModeIcon
                  size={48}
                  className="transition-colors duration-300"
                />
              </div>

              {/* Pulse animation for listening state */}
              {state === 'listening' && (
                <div className="absolute inset-0 rounded-full animate-ping border-4 opacity-30"
                     style={{ borderColor: getStateColor() }} />
              )}
            </div>

            {/* State Text */}
            <p className="text-lg font-medium text-white mb-2">{getStateText()}</p>

            {/* Audio Visualization */}
            {(state === 'listening' || state === 'speaking') && (
              <div className="flex items-end justify-center h-16 space-x-1 mb-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-teal-400/60 to-transparent rounded-t-full transition-all duration-75"
                    style={{
                      width: '3px',
                      height: `${Math.max(4, (audioLevel * 60 + Math.random() * 20) * (0.5 + Math.sin(Date.now() * 0.01 + i * 0.2) * 0.5))}px`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">You said:</h3>
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                <p className="text-white text-sm">{transcript}</p>
              </div>
            </div>
          )}

          {/* AI Response Display */}
          {aiResponse && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Gawin responds:</h3>
              <div className="bg-teal-900/20 rounded-xl p-3 border border-teal-700/50">
                <p className="text-teal-100 text-sm">{aiResponse}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={state === 'processing' || state === 'speaking'}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-600 disabled:text-gray-300'
              }`}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Click the microphone icon or "Start Listening" to begin voice interaction
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}