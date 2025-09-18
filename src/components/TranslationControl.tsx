'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Globe, Check, X, Settings } from 'lucide-react';
import { translationService, SupportedLanguage, TranslationSettings } from '@/lib/services/translationService';
import { hapticService } from '@/lib/services/hapticService';

interface TranslationControlProps {
  compact?: boolean;
  onTranslationToggle?: (enabled: boolean) => void;
}

const TranslationControl: React.FC<TranslationControlProps> = ({
  compact = false,
  onTranslationToggle
}) => {
  const [settings, setSettings] = useState<TranslationSettings>(translationService.getSettings());
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to translation settings changes
    const unsubscribe = translationService.subscribe(setSettings);

    // Load supported languages
    setSupportedLanguages(translationService.getSupportedLanguages());

    return unsubscribe;
  }, []);

  const handleToggleTranslation = () => {
    if (!settings.enabled) {
      // If enabling translation, show language selection first
      setShowLanguageModal(true);
    } else {
      // If disabling, turn off immediately
      const newEnabled = translationService.toggle();
      onTranslationToggle?.(newEnabled);
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    translationService.updateSettings({
      enabled: true,
      targetLanguage: languageCode
    });

    setShowLanguageModal(false);
    onTranslationToggle?.(true);

    // Trigger haptic feedback for successful selection
    hapticService.triggerSuccess();
  };

  const handleSettingsUpdate = (newSettings: Partial<TranslationSettings>) => {
    translationService.updateSettings(newSettings);
  };

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === settings.targetLanguage);
  };

  if (compact) {
    // Compact version for input area
    return (
      <>
        <div className="relative">
          <button
            onClick={handleToggleTranslation}
            className={`
              w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center
              transition-all duration-200
              ${settings.enabled
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/60 hover:text-gray-300'
              }
            `}
            title={settings.enabled
              ? `Translation ON → ${getCurrentLanguage()?.nativeName || 'Unknown'} (Braille: ⠇)`
              : 'Enable Translation (Braille: ⠇)'
            }
          >
            <Languages size={14} className="sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Active indicator */}
          {settings.enabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Quick language indicator */}
          {settings.enabled && getCurrentLanguage() && (
            <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 text-white rounded px-1 py-0.5 min-w-[16px] text-center leading-none">
              {getCurrentLanguage()?.flag}
            </div>
          )}
        </div>

        {/* Language Selection Modal */}
        <LanguageSelectionModal
          isVisible={showLanguageModal}
          languages={supportedLanguages}
          currentLanguage={settings.targetLanguage}
          onSelect={handleLanguageSelect}
          onClose={() => setShowLanguageModal(false)}
        />
      </>
    );
  }

  // Full version for other areas
  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Main Translation Toggle */}
        <button
          onClick={handleToggleTranslation}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${settings.enabled
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
            }
          `}
          title={settings.enabled ? 'Disable Translation' : 'Enable Translation'}
        >
          <Languages size={16} />
          <span className="hidden sm:inline">
            {settings.enabled ? 'Translate ON' : 'Translate'}
          </span>
          {settings.enabled && getCurrentLanguage() && (
            <span className="text-xs">→ {getCurrentLanguage()?.flag}</span>
          )}
        </button>

        {/* Settings Button */}
        {settings.enabled && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30
              transition-all duration-200
            "
            title="Translation Settings"
          >
            <Settings size={14} />
          </button>
        )}
      </div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isVisible={showLanguageModal}
        languages={supportedLanguages}
        currentLanguage={settings.targetLanguage}
        onSelect={handleLanguageSelect}
        onClose={() => setShowLanguageModal(false)}
      />

      {/* Settings Modal */}
      <TranslationSettingsModal
        isVisible={showSettingsModal}
        settings={settings}
        onUpdate={handleSettingsUpdate}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};

// Language Selection Modal Component
interface LanguageSelectionModalProps {
  isVisible: boolean;
  languages: SupportedLanguage[];
  currentLanguage: string;
  onSelect: (languageCode: string) => void;
  onClose: () => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isVisible,
  languages,
  currentLanguage,
  onSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group languages by priority
  const popularLanguages = filteredLanguages.filter(lang => lang.priority >= 8);
  const otherLanguages = filteredLanguages.filter(lang => lang.priority < 8);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-51 max-w-md mx-auto"
          >
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Globe size={20} />
                  <span>Select Language</span>
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-700">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                />
              </div>

              {/* Languages List */}
              <div className="flex-1 overflow-y-auto">
                {/* Popular Languages */}
                {popularLanguages.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                      Popular for Filipinos
                    </h4>
                    <div className="space-y-1">
                      {popularLanguages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => onSelect(language.code)}
                          className={`
                            w-full flex items-center space-x-3 p-3 rounded-lg transition-all
                            ${currentLanguage === language.code
                              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                              : 'hover:bg-gray-700/50 text-gray-300'
                            }
                          `}
                        >
                          <span className="text-xl">{language.flag}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{language.name}</div>
                            <div className="text-sm text-gray-400">{language.nativeName}</div>
                          </div>
                          {currentLanguage === language.code && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Languages */}
                {otherLanguages.length > 0 && (
                  <div className="p-4 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                      Other Languages
                    </h4>
                    <div className="space-y-1">
                      {otherLanguages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => onSelect(language.code)}
                          className={`
                            w-full flex items-center space-x-3 p-3 rounded-lg transition-all
                            ${currentLanguage === language.code
                              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                              : 'hover:bg-gray-700/50 text-gray-300'
                            }
                          `}
                        >
                          <span className="text-xl">{language.flag}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{language.name}</div>
                            <div className="text-sm text-gray-400">{language.nativeName}</div>
                          </div>
                          {currentLanguage === language.code && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Translation Settings Modal Component
interface TranslationSettingsModalProps {
  isVisible: boolean;
  settings: TranslationSettings;
  onUpdate: (settings: Partial<TranslationSettings>) => void;
  onClose: () => void;
}

const TranslationSettingsModal: React.FC<TranslationSettingsModalProps> = ({
  isVisible,
  settings,
  onUpdate,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-51 max-w-md mx-auto"
          >
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Translation Settings</span>
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Settings */}
              <div className="p-4 space-y-4">
                {/* Auto-detect Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Auto-detect Language</div>
                    <div className="text-sm text-gray-400">Automatically detect source language</div>
                  </div>
                  <button
                    onClick={() => onUpdate({ autoDetect: !settings.autoDetect })}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${settings.autoDetect ? 'bg-blue-600' : 'bg-gray-600'}
                    `}
                  >
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${settings.autoDetect ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                {/* Show Original Text */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Show Original</div>
                    <div className="text-sm text-gray-400">Display original text alongside translation</div>
                  </div>
                  <button
                    onClick={() => onUpdate({ showOriginal: !settings.showOriginal })}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${settings.showOriginal ? 'bg-blue-600' : 'bg-gray-600'}
                    `}
                  >
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${settings.showOriginal ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                {/* Real-time Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Real-time Translation</div>
                    <div className="text-sm text-gray-400">Translate messages as you type</div>
                  </div>
                  <button
                    onClick={() => onUpdate({ realTimeMode: !settings.realTimeMode })}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${settings.realTimeMode ? 'bg-blue-600' : 'bg-gray-600'}
                    `}
                  >
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${settings.realTimeMode ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TranslationControl;