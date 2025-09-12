'use client';

import React, { useState, useEffect } from 'react';

interface AccessibilitySettings {
  brailleMode: boolean;
  voiceOutput: boolean;
  highContrast: boolean;
  screenReader: boolean;
  largeText: boolean;
}

interface AccessibilityControlPanelProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

export default function AccessibilityControlPanel({ onSettingsChange }: AccessibilityControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    brailleMode: false,
    voiceOutput: false,
    highContrast: false,
    screenReader: false,
    largeText: false
  });

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gawin-accessibility-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        onSettingsChange(parsedSettings);
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }
  }, [onSettingsChange]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gawin-accessibility-settings', JSON.stringify(settings));
      onSettingsChange(settings);
      
      // Apply document-level accessibility settings
      applyGlobalAccessibilitySettings(settings);
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }, [settings, onSettingsChange]);

  const applyGlobalAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.style.setProperty('--accessibility-bg', '#000000');
      root.style.setProperty('--accessibility-text', '#ffffff');
      root.style.setProperty('--accessibility-primary', '#00ff00');
      root.style.setProperty('--accessibility-secondary', '#ffff00');
      document.body.classList.add('accessibility-high-contrast');
    } else {
      root.style.removeProperty('--accessibility-bg');
      root.style.removeProperty('--accessibility-text');
      root.style.removeProperty('--accessibility-primary');
      root.style.removeProperty('--accessibility-secondary');
      document.body.classList.remove('accessibility-high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.style.setProperty('--accessibility-font-scale', '1.4');
      document.body.classList.add('accessibility-large-text');
    } else {
      root.style.removeProperty('--accessibility-font-scale');
      document.body.classList.remove('accessibility-large-text');
    }

    // Voice output
    if (settings.voiceOutput && 'speechSynthesis' in window) {
      // Announce accessibility changes
      const msg = new SpeechSynthesisUtterance('Accessibility settings updated');
      msg.volume = 0.7;
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }

    // Screen reader optimizations
    if (settings.screenReader) {
      document.body.classList.add('accessibility-screen-reader');
      // Add more semantic markup and ARIA labels
    } else {
      document.body.classList.remove('accessibility-screen-reader');
    }
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const speakText = (text: string) => {
    if (settings.voiceOutput && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.volume = 0.8;
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <>
      {/* Main Accessibility Toggle Button - positioned opposite to sidebar */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          speakText(isOpen ? 'Accessibility panel closed' : 'Accessibility panel opened');
        }}
        className={`fixed top-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          settings.highContrast 
            ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
            : 'bg-teal-600 text-white hover:bg-teal-700'
        } ${isOpen ? 'rotate-180' : ''}`}
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="transition-transform duration-300"
        >
          {/* Universal accessibility symbol */}
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v20"/>
          <path d="M8 8l8 8"/>
          <path d="m8 16 8-8"/>
        </svg>
      </button>

      {/* Accessibility Control Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Panel */}
          <div 
            className={`fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border transition-all duration-300 ${
              settings.highContrast 
                ? 'bg-black text-white border-yellow-400' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}
            role="dialog"
            aria-labelledby="accessibility-panel-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className={`p-6 border-b ${settings.highContrast ? 'border-yellow-400' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 
                  id="accessibility-panel-title" 
                  className="text-xl font-semibold flex items-center gap-3"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2v20" stroke="white" strokeWidth="2"/>
                    <path d="M8 8l8 8" stroke="white" strokeWidth="2"/>
                    <path d="m8 16 8-8" stroke="white" strokeWidth="2"/>
                  </svg>
                  Accessibility
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.highContrast 
                      ? 'hover:bg-gray-800' 
                      : 'hover:bg-gray-100'
                  }`}
                  aria-label="Close accessibility panel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <p className={`text-sm mt-2 ${settings.highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Customize your accessibility experience
              </p>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Braille Mode */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      settings.highContrast ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">⠃</span>
                    </div>
                    <div>
                      <div className="font-medium">Braille Keyboard</div>
                      <div className={`text-sm ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        On-screen Braille input
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.brailleMode}
                      onChange={() => {
                        toggleSetting('brailleMode');
                        speakText(settings.brailleMode ? 'Braille mode disabled' : 'Braille mode enabled');
                      }}
                      className="sr-only"
                      tabIndex={0}
                      aria-describedby="braille-description"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.brailleMode 
                        ? (settings.highContrast ? 'bg-yellow-400' : 'bg-teal-600') 
                        : (settings.highContrast ? 'bg-gray-700' : 'bg-gray-300')
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.brailleMode ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>

              {/* Voice Output */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      settings.highContrast ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">🔊</span>
                    </div>
                    <div>
                      <div className="font-medium">Voice Output</div>
                      <div className={`text-sm ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        Spoken feedback and narration
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.voiceOutput}
                      onChange={() => {
                        toggleSetting('voiceOutput');
                        // This will be announced by the effect
                      }}
                      className="sr-only"
                      tabIndex={0}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.voiceOutput 
                        ? (settings.highContrast ? 'bg-yellow-400' : 'bg-teal-600') 
                        : (settings.highContrast ? 'bg-gray-700' : 'bg-gray-300')
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.voiceOutput ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>

              {/* High Contrast */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      settings.highContrast ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">⚫</span>
                    </div>
                    <div>
                      <div className="font-medium">High Contrast</div>
                      <div className={`text-sm ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        Enhanced visibility mode
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={() => {
                        toggleSetting('highContrast');
                        speakText(settings.highContrast ? 'High contrast disabled' : 'High contrast enabled');
                      }}
                      className="sr-only"
                      tabIndex={0}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.highContrast 
                        ? 'bg-yellow-400'
                        : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>

              {/* Screen Reader */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      settings.highContrast ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">👁️</span>
                    </div>
                    <div>
                      <div className="font-medium">Screen Reader</div>
                      <div className={`text-sm ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        Enhanced semantic markup
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.screenReader}
                      onChange={() => {
                        toggleSetting('screenReader');
                        speakText(settings.screenReader ? 'Screen reader mode disabled' : 'Screen reader mode enabled');
                      }}
                      className="sr-only"
                      tabIndex={0}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.screenReader 
                        ? (settings.highContrast ? 'bg-yellow-400' : 'bg-teal-600') 
                        : (settings.highContrast ? 'bg-gray-700' : 'bg-gray-300')
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.screenReader ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>

              {/* Large Text */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      settings.highContrast ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg font-bold">A</span>
                    </div>
                    <div>
                      <div className="font-medium">Large Text</div>
                      <div className={`text-sm ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        Increase font size
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.largeText}
                      onChange={() => {
                        toggleSetting('largeText');
                        speakText(settings.largeText ? 'Large text disabled' : 'Large text enabled');
                      }}
                      className="sr-only"
                      tabIndex={0}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.largeText 
                        ? (settings.highContrast ? 'bg-yellow-400' : 'bg-teal-600') 
                        : (settings.highContrast ? 'bg-gray-700' : 'bg-gray-300')
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.largeText ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${settings.highContrast ? 'border-yellow-400' : 'border-gray-200'}`}>
              <div className={`text-xs ${settings.highContrast ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                Accessibility settings are saved locally and persist across sessions
              </div>
            </div>
          </div>
        </>
      )}

      {/* Global CSS for accessibility features */}
      <style jsx global>{`
        .accessibility-high-contrast {
          filter: contrast(1.5);
        }
        
        .accessibility-large-text {
          font-size: calc(1rem * var(--accessibility-font-scale, 1));
        }
        
        .accessibility-large-text h1 { font-size: calc(2rem * var(--accessibility-font-scale, 1)); }
        .accessibility-large-text h2 { font-size: calc(1.5rem * var(--accessibility-font-scale, 1)); }
        .accessibility-large-text h3 { font-size: calc(1.25rem * var(--accessibility-font-scale, 1)); }
        .accessibility-large-text p { font-size: calc(1rem * var(--accessibility-font-scale, 1)); }
        
        .accessibility-screen-reader *:focus {
          outline: 3px solid #ffff00 !important;
          outline-offset: 2px !important;
        }
        
        /* Enhanced focus styles for accessibility */
        .accessibility-screen-reader button:focus,
        .accessibility-screen-reader input:focus,
        .accessibility-screen-reader textarea:focus,
        .accessibility-screen-reader select:focus {
          box-shadow: 0 0 0 3px rgba(255, 255, 0, 0.5) !important;
        }
      `}</style>
    </>
  );
}