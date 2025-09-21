'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GawinIceCube } from './GawinIceCube';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ImmersiveVoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceInput: (text: string) => void;
  isProcessing?: boolean;
  aiResponse?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ImmersiveVoiceMode({
  isOpen,
  onClose,
  onVoiceInput,
  isProcessing = false,
  aiResponse
}: ImmersiveVoiceModeProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vibrationRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize voice systems
  useEffect(() => {
    if (!isOpen) return;

    const initializeVoice = async () => {
      try {
        // Initialize audio context for vibration sync
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Get user media for real-time audio analysis
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

        source.connect(analyserRef.current);
        startAudioAnalysis();

      } catch (error) {
        console.log('Audio setup optional, continuing without:', error);
      }
    };

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setState('listening');
          setIsListening(true);
          startVibrationSync();
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
          if (state === 'listening') {
            // Restart listening automatically unless user closed
            setTimeout(() => {
              if (isOpen && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 500);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('Microphone permission is required for voice mode');
            onClose();
          }
        };

        // Auto-start listening when opened
        setTimeout(() => {
          if (recognitionRef.current && isOpen) {
            recognitionRef.current.start();
          }
        }, 500);
      }

      synthRef.current = window.speechSynthesis;
    }

    initializeVoice();

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
      stopVibrationSync();
    };
  }, [isOpen]);

  // Real-time audio analysis for cube animation sync
  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average audio level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average / 255);

        animationRef.current = requestAnimationFrame(analyze);
      }
    };

    analyze();
  };

  // Vibration sync with audio levels
  const startVibrationSync = () => {
    if ('vibrate' in navigator) {
      vibrationRef.current = window.setInterval(() => {
        const intensity = Math.max(20, audioLevel * 100);
        navigator.vibrate(intensity);
      }, 200);
    }
  };

  const stopVibrationSync = () => {
    if (vibrationRef.current) {
      clearInterval(vibrationRef.current);
      vibrationRef.current = null;
    }
  };

  // Update state based on processing
  useEffect(() => {
    if (isProcessing) {
      setState('processing');
      stopVibrationSync();
    } else if (state === 'processing') {
      setState('listening');
      startVibrationSync();
    }
  }, [isProcessing]);

  // Handle new AI responses automatically
  useEffect(() => {
    if (aiResponse && aiResponse !== lastResponse && !isProcessing) {
      handleAIResponse(aiResponse);
    }
  }, [aiResponse, lastResponse, isProcessing]);

  const handleVoiceComplete = (text: string) => {
    setState('processing');
    setTranscript('');
    stopVibrationSync();

    // Send to parent component
    onVoiceInput(text);
  };

  // Handle AI response with voice synthesis
  const handleAIResponse = (response: string) => {
    setLastResponse(response);

    if (synthRef.current) {
      setState('speaking');

      const utterance = new SpeechSynthesisUtterance(response);

      // Configure voice for better quality
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Moira') ||
        voice.lang.startsWith('en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        // Vibration pattern for speaking
        if ('vibrate' in navigator) {
          const speakingPattern = [100, 50, 100, 50, 100];
          navigator.vibrate(speakingPattern);
        }
      };

      utterance.onend = () => {
        setState('listening');
        startVibrationSync();

        // Restart speech recognition
        setTimeout(() => {
          if (recognitionRef.current && isOpen) {
            recognitionRef.current.start();
          }
        }, 500);
      };

      utterance.onerror = () => {
        setState('listening');
        startVibrationSync();
      };

      synthRef.current.speak(utterance);
    }
  };

  // Handle cube click/tap
  const handleCubeInteraction = () => {
    if (state === 'listening') {
      // Restart listening or give feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    } else if (state === 'speaking') {
      // Stop speaking and restart listening
      if (synthRef.current) {
        synthRef.current.cancel();
        setState('listening');
        startVibrationSync();

        setTimeout(() => {
          if (recognitionRef.current && isOpen) {
            recognitionRef.current.start();
          }
        }, 300);
      }
    }
  };

  // Close on background tap
  const handleBackgroundTap = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onClick={handleBackgroundTap}
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Subtle animated particles */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-teal-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Main 3D Cube - Center Stage */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${1 + audioLevel * 0.2})`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div
            className="touch-manipulation"
            style={{
              width: 'min(85vw, 85vh, 500px)',
              height: 'min(85vw, 85vh, 500px)',
              minWidth: '280px',
              minHeight: '280px'
            }}
          >
            <GawinIceCube
              state={state}
              onClick={handleCubeInteraction}
            />
          </div>
        </motion.div>

        {/* Minimal state indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2"
          >
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                state === 'listening' ? 'bg-blue-400 animate-pulse' :
                state === 'processing' ? 'bg-amber-400 animate-bounce' :
                state === 'speaking' ? 'bg-green-400 animate-pulse' :
                'bg-gray-400'
              }`}
            />
            <span className="text-white text-sm opacity-60">
              {state === 'listening' ? 'Listening...' :
               state === 'processing' ? 'Processing...' :
               state === 'speaking' ? 'Speaking...' :
               'Ready'}
            </span>
          </motion.div>
        </div>

        {/* Close hint */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-white text-sm text-center"
          >
            Tap outside to exit
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}