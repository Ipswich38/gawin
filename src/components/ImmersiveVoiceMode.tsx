'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GawinIceCube } from './GawinIceCube';
import { elevenLabsVoiceService } from '@/lib/services/elevenLabsVoiceService';

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

  // New subtitle and karaoke states
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [karaokeWords, setKaraokeWords] = useState<string[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [allSubtitles, setAllSubtitles] = useState<string[]>([]); // Store all Gawin messages

  const recognitionRef = useRef<any>(null);
  const elevenLabsRef = useRef(elevenLabsVoiceService);
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

      // Initialize ElevenLabs voice service
      elevenLabsRef.current.setCallbacks({
        onStart: () => {
          console.log('🎤 ElevenLabs voice started');
        },
        onEnd: () => {
          console.log('✅ ElevenLabs voice finished');
          setState('listening');
          startVibrationSync();

          // Clear karaoke
          if (subtitlesEnabled) {
            setTimeout(() => {
              setCurrentSubtitle('');
              setKaraokeWords([]);
              setCurrentWordIndex(0);
            }, 2000);
          }

          // Restart speech recognition
          setTimeout(() => {
            if (recognitionRef.current && isOpen && isMicEnabled) {
              recognitionRef.current.start();
            }
          }, 500);
        },
        onError: (error) => {
          console.error('❌ ElevenLabs voice error:', error);
          setState('listening');
          startVibrationSync();
        }
      });
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
      if (elevenLabsRef.current) {
        elevenLabsRef.current.stop();
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

  // Handle AI response with voice synthesis and karaoke
  const handleAIResponse = (response: string) => {
    setLastResponse(response);

    // Always store subtitle when subtitles are enabled
    if (subtitlesEnabled) {
      setAllSubtitles(prev => [...prev, response]);
    }

    // Set current subtitle and karaoke words for current response
    const words = response.split(' ').filter(word => word.trim());
    setKaraokeWords(words);
    setCurrentWordIndex(0);
    setCurrentSubtitle(response);

    // Use ElevenLabs for high-quality voice synthesis
    if (elevenLabsRef.current) {
      setState('speaking');

      // Vibration pattern for speaking
      if ('vibrate' in navigator) {
        const speakingPattern = [100, 50, 100, 50, 100];
        navigator.vibrate(speakingPattern);
      }

      // Start karaoke word highlighting
      if (subtitlesEnabled && karaokeWords.length > 0) {
        startKaraokeAnimation();
      }

      // Detect emotion from response for better voice expression
      const detectEmotion = (text: string): 'neutral' | 'friendly' | 'excited' | 'thoughtful' | 'empathetic' => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('!') && (lowerText.includes('great') || lowerText.includes('awesome'))) {
          return 'excited';
        }
        if (lowerText.includes('sorry') || lowerText.includes('understand')) {
          return 'empathetic';
        }
        if (lowerText.includes('think') || lowerText.includes('analyze')) {
          return 'thoughtful';
        }
        if (lowerText.includes('hello') || lowerText.includes('welcome')) {
          return 'friendly';
        }
        return 'neutral';
      };

      const emotion = detectEmotion(response);
      const emotionSettings = elevenLabsRef.current.getEmotionSettings(emotion);

      // Use ElevenLabs with emotion-appropriate settings
      elevenLabsRef.current.speak(response, {
        voiceSettings: emotionSettings,
        outputFormat: 'mp3_44100_128', // High quality
        optimizeStreamingLatency: 2, // Optimize for faster playback
      }).catch((error) => {
        console.error('❌ ElevenLabs speech failed:', error);
        // Fallback to continue listening
        setState('listening');
        startVibrationSync();
        setCurrentSubtitle('');
      });
    }
  };

  // Karaoke word animation
  const startKaraokeAnimation = () => {
    if (!karaokeWords.length) return;

    const wordDuration = 600; // ms per word
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < karaokeWords.length) {
        setCurrentWordIndex(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, wordDuration);

    // Clean up when speaking ends
    setTimeout(() => {
      clearInterval(interval);
    }, karaokeWords.length * wordDuration + 1000);
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
      if (elevenLabsRef.current) {
        elevenLabsRef.current.stop();
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

  // Handle close button click
  const handleCloseClick = () => {
    onClose();
  };

  // Clear all subtitles
  const clearAllSubtitles = () => {
    setAllSubtitles([]);
    setCurrentSubtitle('');
    setKaraokeWords([]);
    setCurrentWordIndex(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        {/* Close Button - Top Right */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleCloseClick}
          className="absolute top-6 right-6 z-50 p-3 bg-black/60 backdrop-blur-md rounded-full border border-gray-600/30 hover:bg-black/80 hover:border-gray-500/50 transition-all duration-200"
          title="Close Voice Mode and Return to Chat"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
        {/* Subtitle Display - Show all Gawin messages when enabled */}
        {subtitlesEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-20 left-4 right-4 z-20 max-h-[60vh] overflow-y-auto"
          >
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 max-w-4xl mx-auto space-y-4">
              {/* Show all stored subtitles */}
              {allSubtitles.map((subtitle, index) => (
                <div key={index} className="text-white text-2xl font-serif leading-relaxed text-center border-b border-gray-600/30 last:border-b-0 pb-4 last:pb-0">
                  {index === allSubtitles.length - 1 && state === 'speaking' ? (
                    // Current speaking message with karaoke effect
                    <div>
                      {karaokeWords.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className={`inline-block mr-2 transition-all duration-300 ${
                            wordIndex <= currentWordIndex
                              ? 'text-teal-400 scale-110 shadow-lg'
                              : 'text-white/70'
                          }`}
                          style={{
                            textShadow: wordIndex <= currentWordIndex ? '0 0 10px rgba(20, 184, 166, 0.5)' : 'none'
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    // Previous messages in normal serif font
                    <div className="text-white/90">
                      {subtitle}
                    </div>
                  )}
                </div>
              ))}

              {/* Show current subtitle if no stored subtitles yet */}
              {allSubtitles.length === 0 && currentSubtitle && (
                <div className="text-white text-2xl font-serif leading-relaxed text-center">
                  {state === 'speaking' ? (
                    <div>
                      {karaokeWords.map((word, index) => (
                        <span
                          key={index}
                          className={`inline-block mr-2 transition-all duration-300 ${
                            index <= currentWordIndex
                              ? 'text-teal-400 scale-110 shadow-lg'
                              : 'text-white/70'
                          }`}
                          style={{
                            textShadow: index <= currentWordIndex ? '0 0 10px rgba(20, 184, 166, 0.5)' : 'none'
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/90">
                      {currentSubtitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* Background Video - Same as main app */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background/loginbg.mp4" type="video/mp4" />
          <div className="absolute inset-0 bg-gray-900"></div>
        </video>

        {/* Subtle overlay for cube visibility */}
        <div className="absolute inset-0 bg-black/40 z-5"></div>

        {/* Enhanced ambient particles over video */}
        <div className="absolute inset-0 z-10 opacity-30">
          {Array.from({ length: 30 }, (_, i) => (
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
          onClick={handleCubeInteraction}
          onTouchEnd={handleCubeInteraction}
        >
          <div
            className="touch-manipulation"
            style={{
              // Smaller cube when subtitles are enabled for karaoke mode
              width: subtitlesEnabled && state === 'speaking' ? 'min(40vw, 40vh, 200px)' : 'min(85vw, 85vh, 500px)',
              height: subtitlesEnabled && state === 'speaking' ? 'min(40vw, 40vh, 200px)' : 'min(85vw, 85vh, 500px)',
              minWidth: subtitlesEnabled && state === 'speaking' ? '120px' : '280px',
              minHeight: subtitlesEnabled && state === 'speaking' ? '120px' : '280px',
              transition: 'all 0.5s ease-in-out'
            }}
          >
            <motion.div
              animate={{
                y: subtitlesEnabled && state === 'speaking' && currentWordIndex >= 0
                  ? [0, -20, 0] : 0
              }}
              transition={{
                duration: 0.6,
                repeat: subtitlesEnabled && state === 'speaking' ? Infinity : 0,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="w-full h-full"
            >
              <GawinIceCube
                state={state}
                onClick={handleCubeInteraction}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Control Buttons */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-6 bg-black/60 backdrop-blur-md rounded-full px-6 py-3"
          >
            {/* Microphone Toggle */}
            <button
              onClick={() => {
                setIsMicEnabled(!isMicEnabled);
                if (!isMicEnabled && recognitionRef.current && state === 'listening') {
                  recognitionRef.current.start();
                } else if (isMicEnabled && recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }}
              className={`p-3 rounded-full transition-all duration-300 ${
                isMicEnabled
                  ? 'bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/30'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={`${isMicEnabled ? 'Disable' : 'Enable'} Microphone`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                {isMicEnabled ? (
                  <path
                    d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2ZM19 11C19 15.18 15.84 18.5 12 18.5C8.16 18.5 5 15.18 5 11H7C7 14.08 9.24 16.5 12 16.5C14.76 16.5 17 14.08 17 11H19ZM12 21V23H8V21H12ZM16 21V23H12V21H16Z"
                    fill="currentColor"
                  />
                ) : (
                  <path
                    d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2ZM19 11C19 15.18 15.84 18.5 12 18.5C8.16 18.5 5 15.18 5 11H7C7 14.08 9.24 16.5 12 16.5C14.76 16.5 17 14.08 17 11H19ZM12 21V23H8V21H12ZM16 21V23H12V21H16ZM2 2L22 22L20.5 23.5L2 4.5L2 2Z"
                    fill="currentColor"
                  />
                )}
              </svg>
            </button>

            {/* Subtitle Toggle */}
            <button
              onClick={() => {
                setSubtitlesEnabled(!subtitlesEnabled);
                if (subtitlesEnabled) {
                  // Clear subtitles when disabling
                  clearAllSubtitles();
                }
              }}
              className={`p-3 rounded-full transition-all duration-300 ${
                subtitlesEnabled
                  ? 'bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/30'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title="Toggle Subtitles"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM4 18V6H20V18H4ZM6 10H8V12H6V10ZM6 14H12V16H6V14ZM14 14H18V16H14V14ZM10 10H18V12H10V10Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {/* Clear Subtitles Button - Only show when subtitles enabled and there are messages */}
            {subtitlesEnabled && allSubtitles.length > 0 && (
              <button
                onClick={clearAllSubtitles}
                className="p-3 rounded-full transition-all duration-300 bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/30"
                title="Clear All Subtitles"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M19 7L18.36 6.64L12 10.76L5.64 6.64L5 7L11.28 11.12L5 15.24L5.64 15.86L12 11.74L18.36 15.86L19 15.24L12.72 11.12L19 7Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
          </motion.div>
        </div>

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

        {/* Voice Mode Title */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="text-white text-lg font-semibold text-center"
          >
            Voice Mode
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}