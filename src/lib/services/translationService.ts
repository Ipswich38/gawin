/**
 * Translation Service for Gawin
 * Provides intelligent real-time translation with Google Translate integration
 * Focused on popular languages for Filipino users
 */

import { hapticService } from './hapticService';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  priority: number; // Higher priority = more commonly used
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  timestamp: number;
}

export interface TranslationSettings {
  enabled: boolean;
  autoDetect: boolean;
  targetLanguage: string;
  showOriginal: boolean;
  realTimeMode: boolean;
}

class TranslationService {
  private static instance: TranslationService;
  private settings: TranslationSettings;
  private translationHistory: TranslationResult[] = [];
  private subscribers: Array<(settings: TranslationSettings) => void> = [];

  // Popular languages for Filipino users (ordered by priority)
  private readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    // High Priority - Most Common
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', priority: 10 },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', priority: 10 },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', priority: 9 },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', priority: 9 },
    { code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳', priority: 9 },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', priority: 9 },

    // Medium Priority - Popular
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', priority: 8 },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', priority: 8 },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', priority: 8 },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', priority: 7 },

    // Additional Popular Languages
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', priority: 6 },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', priority: 6 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', priority: 6 },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', priority: 6 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', priority: 5 },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', priority: 5 },
  ];

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  constructor() {
    this.settings = {
      enabled: false,
      autoDetect: true,
      targetLanguage: 'en', // Default to English
      showOriginal: true,
      realTimeMode: false
    };

    this.loadSettings();
    console.log('🌐 Translation Service initialized with support for', this.SUPPORTED_LANGUAGES.length, 'languages');
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('gawin_translation_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load translation settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('gawin_translation_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save translation settings:', error);
    }
  }

  /**
   * Subscribe to translation settings changes
   */
  subscribe(callback: (settings: TranslationSettings) => void): () => void {
    this.subscribers.push(callback);
    callback(this.settings); // Send current state immediately

    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notify all subscribers of settings changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.settings));
  }

  /**
   * Get current translation settings
   */
  getSettings(): TranslationSettings {
    return { ...this.settings };
  }

  /**
   * Update translation settings
   */
  updateSettings(newSettings: Partial<TranslationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.notifySubscribers();

    // Trigger haptic feedback for settings change
    hapticService.triggerSuccess();

    console.log('🌐 Translation settings updated:', this.settings);
  }

  /**
   * Get supported languages sorted by priority
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.SUPPORTED_LANGUAGES].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get language by code
   */
  getLanguage(code: string): SupportedLanguage | undefined {
    return this.SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Detect language of text using multiple methods
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      // First try with our Filipino language detection
      const cleanText = text.toLowerCase().trim();

      // Filipino/Tagalog keywords
      const filipinoKeywords = [
        'ako', 'ikaw', 'siya', 'tayo', 'kayo', 'sila', 'ang', 'ng', 'sa', 'na', 'ay',
        'mga', 'kung', 'pero', 'kasi', 'para', 'hindi', 'oo', 'hindi', 'alam', 'gusto',
        'kamusta', 'salamat', 'mahal', 'pamilya', 'bahay', 'trabaho', 'pera', 'pagkain'
      ];

      const hasFilipino = filipinoKeywords.some(keyword => cleanText.includes(keyword));
      if (hasFilipino) {
        return 'tl';
      }

      // Try Google Translate API for detection
      const result = await this.callGoogleTranslate(text, 'auto', 'en', true);
      return result.detectedLanguage || 'en';

    } catch (error) {
      console.warn('Language detection failed, defaulting to English:', error);
      return 'en';
    }
  }

  /**
   * Translate text using Google Translate API
   */
  async translateText(text: string, targetLanguage?: string): Promise<TranslationResult> {
    const target = targetLanguage || this.settings.targetLanguage;
    const sourceLanguage = this.settings.autoDetect ? 'auto' : 'en';

    try {
      const result = await this.callGoogleTranslate(text, sourceLanguage, target);

      const translationResult: TranslationResult = {
        originalText: text,
        translatedText: result.translatedText,
        sourceLanguage: result.detectedLanguage || sourceLanguage,
        targetLanguage: target,
        confidence: result.confidence || 0.9,
        timestamp: Date.now()
      };

      // Store in history
      this.translationHistory.unshift(translationResult);
      if (this.translationHistory.length > 100) {
        this.translationHistory = this.translationHistory.slice(0, 100);
      }

      console.log('🌐 Translation completed:', {
        from: translationResult.sourceLanguage,
        to: translationResult.targetLanguage,
        confidence: translationResult.confidence
      });

      return translationResult;

    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error('Translation service temporarily unavailable');
    }
  }

  /**
   * Call Google Translate API
   */
  private async callGoogleTranslate(
    text: string,
    source: string,
    target: string,
    detectOnly: boolean = false
  ): Promise<{
    translatedText: string;
    detectedLanguage?: string;
    confidence?: number;
  }> {
    try {
      // Using Google Translate API via our backend
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: source === 'auto' ? undefined : source,
          target,
          detectOnly
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Translation failed');
      }

      return {
        translatedText: result.translatedText || text,
        detectedLanguage: result.detectedLanguage,
        confidence: result.confidence || 0.9
      };

    } catch (error) {
      console.error('Google Translate API call failed:', error);

      // Fallback to LibreTranslate or local translation
      return this.fallbackTranslation(text, source, target);
    }
  }

  /**
   * Fallback translation method when Google Translate is unavailable
   */
  private async fallbackTranslation(
    text: string,
    source: string,
    target: string
  ): Promise<{
    translatedText: string;
    detectedLanguage?: string;
    confidence?: number;
  }> {
    try {
      // Try LibreTranslate as fallback
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: source === 'auto' ? 'auto' : source,
          target: target,
          format: 'text'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          translatedText: result.translatedText || text,
          detectedLanguage: result.detectedLanguage,
          confidence: 0.7 // Lower confidence for fallback
        };
      }

      throw new Error('Fallback translation failed');

    } catch (error) {
      console.warn('Fallback translation failed:', error);

      // Final fallback: return original text with a note
      return {
        translatedText: `[Translation unavailable] ${text}`,
        detectedLanguage: source,
        confidence: 0.1
      };
    }
  }

  /**
   * Translate conversation messages in real-time
   */
  async translateConversation(messages: Array<{
    id: number;
    role: 'user' | 'assistant';
    content: string;
  }>): Promise<Array<{
    id: number;
    role: 'user' | 'assistant';
    content: string;
    translation?: string;
    originalContent?: string;
  }>> {
    if (!this.settings.enabled) {
      return messages;
    }

    const translatedMessages = await Promise.all(
      messages.map(async (message) => {
        try {
          const result = await this.translateText(message.content);
          return {
            ...message,
            translation: result.translatedText,
            originalContent: message.content
          };
        } catch (error) {
          console.warn('Failed to translate message:', message.id, error);
          return message;
        }
      })
    );

    return translatedMessages;
  }

  /**
   * Get translation history
   */
  getTranslationHistory(limit: number = 20): TranslationResult[] {
    return this.translationHistory.slice(0, limit);
  }

  /**
   * Clear translation history
   */
  clearHistory(): void {
    this.translationHistory = [];
    console.log('🗑️ Translation history cleared');
  }

  /**
   * Check if translation is enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Toggle translation on/off
   */
  toggle(): boolean {
    this.updateSettings({ enabled: !this.settings.enabled });

    // Trigger appropriate haptic feedback
    if (this.settings.enabled) {
      hapticService.triggerStateChange(true);
    } else {
      hapticService.triggerStateChange(false);
    }

    return this.settings.enabled;
  }

  /**
   * Get translation statistics
   */
  getStats(): {
    totalTranslations: number;
    languagePairs: Array<{ from: string; to: string; count: number }>;
    averageConfidence: number;
  } {
    const languagePairs: Map<string, number> = new Map();
    let totalConfidence = 0;

    this.translationHistory.forEach(translation => {
      const pair = `${translation.sourceLanguage}-${translation.targetLanguage}`;
      languagePairs.set(pair, (languagePairs.get(pair) || 0) + 1);
      totalConfidence += translation.confidence;
    });

    return {
      totalTranslations: this.translationHistory.length,
      languagePairs: Array.from(languagePairs.entries()).map(([pair, count]) => {
        const [from, to] = pair.split('-');
        return { from, to, count };
      }),
      averageConfidence: this.translationHistory.length > 0
        ? totalConfidence / this.translationHistory.length
        : 0
    };
  }
}

export const translationService = TranslationService.getInstance();