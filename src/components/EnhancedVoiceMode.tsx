/**
 * Enhanced Voice Mode Component
 * Advanced voice interaction with visual feedback and smart controls
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Waves,
  Circle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { speechRecognitionService } from '@/lib/services/speechRecognitionService';
import { hapticService } from '@/lib/services/hapticService';

interface EnhancedVoiceModeProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onSendMessage: (message: string) => void;
  isGawinSpeaking?: boolean;
  disabled?: boolean;
  className?: string;
}

interface VoiceSettings {
  autoSendDelay: number;
  noiseReduction: boolean;
  voiceSpeed: number;
  voiceVolume: number;
  language: string;
}

export default function EnhancedVoiceMode({
  onTranscript,
  onSendMessage,
  isGawinSpeaking = false,
  disabled = false,
  className = ''
}: EnhancedVoiceModeProps) {
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [isInputSupported, setIsInputSupported] = useState(false);
  const [inputError, setInputError] = useState<string>('');

  // Enhanced features
  const [showSettings, setShowSettings] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    autoSendDelay: 2000,
    noiseReduction: true,
    voiceSpeed: 1.0,
    voiceVolume: 0.8,
    language: 'en-US'
  });

  // Refs
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize voice capabilities
  useEffect(() => {
    setIsInputSupported(speechRecognitionService.isRecognitionSupported());

    // Initialize voice output
    import('@/lib/services/voiceService').then(({ voiceService }) => {
      setIsVoiceOutputEnabled(voiceService.isVoiceEnabled());
    });

    // Initialize audio visualization
    initializeAudioVisualization();

    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (voiceActivityTimeoutRef.current) clearTimeout(voiceActivityTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Set up speech recognition
  useEffect(() => {
    speechRecognitionService.setCallbacks({
      onStart: () => {
        setIsListening(true);
        setInputError('');
        hapticService.triggerStateChange(true);
      },

      onEnd: () => {
        setIsListening(false);
        setIsProcessingVoice(false);
        hapticService.triggerStateChange(false);
      },

      onError: (error: string) => {
        setInputError(error);
        setIsListening(false);
        setIsProcessingVoice(false);
        hapticService.triggerError();
      },

      onResult: (result) => {
        const transcript = result.transcript;
        setCurrentTranscript(transcript);
        onTranscript(transcript, result.isFinal);

        if (result.isFinal) {
          // Auto-send after delay
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          silenceTimeoutRef.current = setTimeout(() => {
            if (transcript.trim()) {
              onSendMessage(transcript.trim());
              setCurrentTranscript('');
            }
          }, voiceSettings.autoSendDelay);
        }
      },

      onVoiceStart: () => {
        setIsProcessingVoice(true);
      },

      onVoiceEnd: () => {
        setIsProcessingVoice(false);
      }
    });
  }, [onTranscript, onSendMessage, voiceSettings.autoSendDelay]);

  const initializeAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      startVoiceLevelMonitoring();
    } catch (error) {
      console.error('Failed to initialize audio visualization:', error);
    }
  };

  const startVoiceLevelMonitoring = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (analyserRef.current && isListening) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setVoiceLevel(average / 255);
      } else {
        setVoiceLevel(0);
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const handleVoiceToggle = async () => {
    if (!isInputSupported || disabled || isGawinSpeaking) return;

    hapticService.triggerHaptic('voice');

    if (isListening) {
      speechRecognitionService.stopListening();
    } else {
      const success = await speechRecognitionService.startListening();
      if (!success) {
        setInputError('Microphone access denied. Please check permissions.');
        hapticService.triggerError();
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
      } else {
        const success = await voiceService.enableVoice();
        setIsVoiceOutputEnabled(success);
        if (!success) {
          setInputError('Voice synthesis not supported in this browser.');
          hapticService.triggerError();
        }
      }
    } catch (error) {
      console.error('Voice output toggle failed:', error);
      hapticService.triggerError();
    }
  };

  const handleSendCurrentTranscript = () => {
    if (currentTranscript.trim()) {
      onSendMessage(currentTranscript.trim());
      setCurrentTranscript('');
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    }
  };

  const handleClearTranscript = () => {
    setCurrentTranscript('');
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getVoiceButtonClass = () => {
    if (!isInputSupported || disabled) {
      return 'voice-btn disabled';
    }
    if (isListening) {
      return `voice-btn listening ${isProcessingVoice ? 'processing' : ''}`;
    }
    return 'voice-btn';
  };

  return (
    <div className={`enhanced-voice-mode ${isExpanded ? 'expanded' : ''} ${className}`}>
      {/* Main Voice Controls */}
      <div className="voice-controls-container">
        <div className="primary-controls">
          {/* Voice Input Button */}
          <motion.button
            onClick={handleVoiceToggle}
            className={getVoiceButtonClass()}
            disabled={!isInputSupported || disabled || isGawinSpeaking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="voice-icon-container">
              {isListening ? (
                <motion.div
                  animate={{
                    scale: isProcessingVoice ? [1, 1.2, 1] : 1,
                    rotate: isProcessingVoice ? 360 : 0
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isProcessingVoice ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <Mic size={24} />
                </motion.div>
              ) : (
                <MicOff size={24} />
              )}

              {/* Voice Level Indicator */}
              {isListening && (
                <motion.div
                  className="voice-level-ring"
                  style={{
                    background: `conic-gradient(#00d4ff ${voiceLevel * 360}deg, transparent 0deg)`
                  }}
                  animate={{ rotate: isProcessingVoice ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isProcessingVoice ? Infinity : 0, ease: "linear" }}
                />
              )}
            </div>
          </motion.button>

          {/* Voice Output Toggle */}
          <motion.button
            onClick={handleVoiceOutputToggle}
            className={`voice-output-btn ${isVoiceOutputEnabled ? 'enabled' : 'disabled'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isVoiceOutputEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </motion.button>

          {/* Expand/Settings Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="settings-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={18} />
          </motion.button>
        </div>

        {/* Voice Visualization */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="voice-visualization"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="wave-container">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="wave-bar"
                    animate={{
                      scaleY: isProcessingVoice
                        ? [1, 1 + voiceLevel * 2, 1]
                        : 1
                    }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.1,
                      repeat: isProcessingVoice ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                    style={{
                      height: `${20 + voiceLevel * 40}px`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Transcript Display */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            className="transcript-display"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="transcript-content">
              <p className="transcript-text">{currentTranscript}</p>
              <div className="transcript-actions">
                <button
                  onClick={handleSendCurrentTranscript}
                  className="transcript-btn send-btn"
                  title="Send message"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={handleClearTranscript}
                  className="transcript-btn clear-btn"
                  title="Clear transcript"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Settings Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="voice-settings-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="settings-title">Voice Settings</h4>

            <div className="setting-group">
              <label className="setting-label">Auto-send delay (ms)</label>
              <input
                type="range"
                min="1000"
                max="5000"
                step="500"
                value={voiceSettings.autoSendDelay}
                onChange={(e) => updateVoiceSettings({ autoSendDelay: parseInt(e.target.value) })}
                className="setting-slider"
              />
              <span className="setting-value">{voiceSettings.autoSendDelay}ms</span>
            </div>

            <div className="setting-group">
              <label className="setting-label">Voice speed</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceSettings.voiceSpeed}
                onChange={(e) => updateVoiceSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="setting-slider"
              />
              <span className="setting-value">{voiceSettings.voiceSpeed}x</span>
            </div>

            <div className="setting-group">
              <label className="setting-label">Voice volume</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={voiceSettings.voiceVolume}
                onChange={(e) => updateVoiceSettings({ voiceVolume: parseFloat(e.target.value) })}
                className="setting-slider"
              />
              <span className="setting-value">{Math.round(voiceSettings.voiceVolume * 100)}%</span>
            </div>

            <div className="setting-group">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={voiceSettings.noiseReduction}
                  onChange={(e) => updateVoiceSettings({ noiseReduction: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                Enable noise reduction
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {inputError && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {inputError}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .enhanced-voice-mode {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px;
          margin: 8px 0;
          transition: all 0.3s ease;
        }

        .enhanced-voice-mode.expanded {
          background: rgba(0, 0, 0, 0.9);
          border-color: rgba(0, 212, 255, 0.3);
        }

        .voice-controls-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .primary-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .voice-btn {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .voice-btn:hover:not(.disabled) {
          transform: scale(1.05);
          border-color: rgba(0, 212, 255, 0.5);
          background: rgba(0, 212, 255, 0.1);
        }

        .voice-btn.listening {
          border-color: #00d4ff;
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
        }

        .voice-btn.processing {
          border-color: #ff4444;
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }

        .voice-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: rgba(128, 128, 128, 0.3);
          background: rgba(128, 128, 128, 0.1);
          color: #888;
        }

        .voice-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-level-ring {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          opacity: 0.8;
        }

        .voice-output-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-output-btn.enabled {
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .voice-output-btn:hover {
          transform: scale(1.05);
        }

        .settings-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .voice-visualization {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wave-container {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 60px;
        }

        .wave-bar {
          width: 4px;
          background: linear-gradient(to top, #00d4ff, #0099cc);
          border-radius: 2px;
          transform-origin: bottom;
        }

        .transcript-display {
          margin-top: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          overflow: hidden;
        }

        .transcript-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .transcript-text {
          flex: 1;
          color: white;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          word-wrap: break-word;
        }

        .transcript-actions {
          display: flex;
          gap: 8px;
        }

        .transcript-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .transcript-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .send-btn:hover {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
          color: #4caf50;
        }

        .clear-btn:hover {
          background: rgba(255, 152, 0, 0.2);
          border-color: rgba(255, 152, 0, 0.4);
          color: #ff9800;
        }

        .voice-settings-panel {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .settings-title {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .setting-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 12px;
        }

        .setting-label {
          color: white;
          font-size: 13px;
          font-weight: 500;
          min-width: 120px;
        }

        .setting-slider {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          cursor: pointer;
        }

        .setting-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00d4ff;
          cursor: pointer;
        }

        .setting-value {
          color: #00d4ff;
          font-size: 12px;
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .setting-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: white;
          font-size: 13px;
        }

        .setting-checkbox input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          background: transparent;
          position: relative;
          transition: all 0.2s ease;
        }

        .setting-checkbox input[type="checkbox"]:checked + .checkbox-custom {
          background: #00d4ff;
          border-color: #00d4ff;
        }

        .setting-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          color: #1a1a1a;
          font-size: 12px;
          font-weight: bold;
        }

        .error-message {
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 8px;
          color: #f44336;
          font-size: 13px;
          text-align: center;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .enhanced-voice-mode {
            padding: 12px;
          }

          .voice-btn {
            width: 56px;
            height: 56px;
          }

          .voice-output-btn {
            width: 44px;
            height: 44px;
          }

          .settings-btn {
            width: 36px;
            height: 36px;
          }

          .transcript-content {
            flex-direction: column;
            gap: 8px;
          }

          .transcript-actions {
            align-self: flex-end;
          }

          .setting-group {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .setting-label {
            min-width: auto;
          }

          .setting-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}