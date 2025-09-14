'use client';

import React, { useState, useEffect } from 'react';

interface AccessibilitySettings {
  brailleMode: boolean;
}

interface AccessibilityControlPanelProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

export default function AccessibilityControlPanel({ onSettingsChange }: AccessibilityControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    brailleMode: false
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
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }, [settings, onSettingsChange]);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openDeviceSettings = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // Try to open iOS Settings app (may not work due to security restrictions)
      window.location.href = 'App-Prefs:root=ACCESSIBILITY';
    } else if (isAndroid) {
      // Try to open Android accessibility settings
      window.location.href = 'intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end';
    } else {
      // For desktop, show instructions
      alert('Please open your system accessibility settings:\n\n• Windows: Settings > Ease of Access\n• Mac: System Preferences > Accessibility\n• Linux: Settings > Universal Access');
    }
  };

  return (
    <>
      {/* Main Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
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
            className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300"
            role="dialog"
            aria-labelledby="accessibility-panel-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
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
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close accessibility panel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-2 text-gray-600">
                Gawin's innovative accessibility features
              </p>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Braille Keyboard - Our Innovation */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-100">
                      <span className="text-lg">⠃</span>
                    </div>
                    <div>
                      <div className="font-medium">Braille Keyboard</div>
                      <div className="text-sm text-gray-500">
                        Innovative on-screen Braille input
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.brailleMode}
                      onChange={() => toggleSetting('brailleMode')}
                      className="sr-only"
                      tabIndex={0}
                      aria-describedby="braille-description"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.brailleMode ? 'bg-teal-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.brailleMode ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
                <div className="mt-2 ml-13 text-xs text-teal-600 font-medium">
                  ✨ Exclusive Gawin Innovation
                </div>
              </div>

              {/* Device Settings Guidance */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">Additional Accessibility Features</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      For voice output, high contrast, large text, and screen reader support, use your device's built-in accessibility settings:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• <strong>iOS:</strong> Settings → Accessibility</li>
                      <li>• <strong>Android:</strong> Settings → Accessibility</li>
                      <li>• <strong>Windows:</strong> Settings → Ease of Access</li>
                      <li>• <strong>Mac:</strong> System Preferences → Accessibility</li>
                    </ul>
                    <button
                      onClick={openDeviceSettings}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Open Device Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Why Device Settings */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100 flex-shrink-0 mt-0.5">
                    <span className="text-xs">💡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-800">
                      <strong>Why use device settings?</strong> Your device's accessibility features work across all apps and are optimized for your specific needs. This ensures consistency and the best experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Braille keyboard settings are saved locally
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}