/**
 * Real-time Translation Hook for Gawin
 * Provides intelligent conversation translation with context awareness
 */

import { useState, useEffect, useCallback } from 'react';
import { translationService, TranslationSettings, TranslationResult } from '@/lib/services/translationService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  translation?: TranslationResult;
  originalContent?: string;
}

interface UseTranslationResult {
  settings: TranslationSettings;
  isTranslating: boolean;
  translateMessage: (message: string) => Promise<TranslationResult | null>;
  translateMessages: (messages: Message[]) => Promise<Message[]>;
  getTranslatedContent: (message: Message) => string;
  shouldShowOriginal: (message: Message) => boolean;
  updateSettings: (settings: Partial<TranslationSettings>) => void;
  clearTranslations: () => void;
}

export function useTranslation(): UseTranslationResult {
  const [settings, setSettings] = useState<TranslationSettings>(translationService.getSettings());
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, TranslationResult>>(new Map());

  useEffect(() => {
    // Subscribe to translation settings changes
    const unsubscribe = translationService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  /**
   * Generate cache key for translation
   */
  const getCacheKey = useCallback((text: string, targetLanguage: string): string => {
    return `${text}:${targetLanguage}`;
  }, []);

  /**
   * Translate a single message with caching
   */
  const translateMessage = useCallback(async (message: string): Promise<TranslationResult | null> => {
    if (!settings.enabled || !message.trim()) {
      return null;
    }

    const cacheKey = getCacheKey(message, settings.targetLanguage);

    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);

    try {
      const result = await translationService.translateText(message, settings.targetLanguage);

      // Cache the result
      setTranslationCache(prev => new Map(prev).set(cacheKey, result));

      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [settings.enabled, settings.targetLanguage, translationCache, getCacheKey]);

  /**
   * Translate multiple messages (for conversation history)
   */
  const translateMessages = useCallback(async (messages: Message[]): Promise<Message[]> => {
    if (!settings.enabled) {
      return messages;
    }

    setIsTranslating(true);

    try {
      const translatedMessages = await Promise.all(
        messages.map(async (message) => {
          try {
            const translation = await translateMessage(message.content);

            if (translation) {
              return {
                ...message,
                translation,
                originalContent: message.content
              };
            }

            return message;
          } catch (error) {
            console.warn('Failed to translate message:', message.id, error);
            return message;
          }
        })
      );

      return translatedMessages;
    } finally {
      setIsTranslating(false);
    }
  }, [settings.enabled, translateMessage]);

  /**
   * Get the appropriate content to display (translated or original)
   */
  const getTranslatedContent = useCallback((message: Message): string => {
    if (!settings.enabled) {
      return message.content;
    }

    // If translation exists and is different from original, show translation
    if (message.translation && message.translation.translatedText !== message.content) {
      return message.translation.translatedText;
    }

    return message.content;
  }, [settings.enabled]);

  /**
   * Determine if original text should be shown alongside translation
   */
  const shouldShowOriginal = useCallback((message: Message): boolean => {
    if (!settings.enabled || !settings.showOriginal) {
      return false;
    }

    // Show original if translation exists and is different
    return !!(
      message.translation &&
      message.translation.translatedText !== message.content &&
      message.translation.confidence > 0.3 // Only if we're reasonably confident
    );
  }, [settings.enabled, settings.showOriginal]);

  /**
   * Update translation settings
   */
  const updateSettings = useCallback((newSettings: Partial<TranslationSettings>) => {
    translationService.updateSettings(newSettings);
  }, []);

  /**
   * Clear all cached translations
   */
  const clearTranslations = useCallback(() => {
    setTranslationCache(new Map());
    translationService.clearHistory();
  }, []);

  return {
    settings,
    isTranslating,
    translateMessage,
    translateMessages,
    getTranslatedContent,
    shouldShowOriginal,
    updateSettings,
    clearTranslations
  };
}

/**
 * Enhanced Translation Hook with Intelligent Context Awareness
 * Provides smarter translation based on conversation context and user patterns
 */
export function useIntelligentTranslation(): UseTranslationResult & {
  detectUserLanguagePattern: (messages: Message[]) => Promise<string>;
  getContextualTranslation: (message: string, conversationContext: Message[]) => Promise<TranslationResult | null>;
  suggestBetterTranslation: (original: string, translation: string) => Promise<string>;
} {
  const baseTranslation = useTranslation();
  const [userLanguagePattern, setUserLanguagePattern] = useState<string>('en');

  /**
   * Analyze user's language patterns from conversation history
   */
  const detectUserLanguagePattern = useCallback(async (messages: Message[]): Promise<string> => {
    try {
      // Analyze recent user messages to detect primary language
      const userMessages = messages
        .filter(msg => msg.role === 'user')
        .slice(-10) // Last 10 user messages
        .map(msg => msg.content);

      if (userMessages.length === 0) {
        return 'en';
      }

      // Detect language for each message and find the most common
      const languageDetections = await Promise.all(
        userMessages.map(async (message) => {
          try {
            return await translationService.detectLanguage(message);
          } catch {
            return 'en';
          }
        })
      );

      // Count language occurrences
      const languageCounts = languageDetections.reduce((counts, lang) => {
        counts[lang] = (counts[lang] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      // Find most common language
      const primaryLanguage = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'en';

      setUserLanguagePattern(primaryLanguage);
      return primaryLanguage;

    } catch (error) {
      console.warn('Language pattern detection failed:', error);
      return 'en';
    }
  }, []);

  /**
   * Get contextual translation that considers conversation flow
   */
  const getContextualTranslation = useCallback(async (
    message: string,
    conversationContext: Message[]
  ): Promise<TranslationResult | null> => {
    if (!baseTranslation.settings.enabled) {
      return null;
    }

    try {
      // Detect user's primary language pattern
      const primaryLanguage = await detectUserLanguagePattern(conversationContext);

      // Get recent conversation context for better translation
      const recentContext = conversationContext
        .slice(-5)
        .map(msg => msg.content)
        .join(' ');

      // Enhanced message with context for better translation
      const contextualMessage = recentContext.length > 0
        ? `Context: ${recentContext.slice(-200)}... Current message: ${message}`
        : message;

      // Use the base translation but with detected user language as source
      const result = await translationService.translateText(contextualMessage, baseTranslation.settings.targetLanguage);

      // Extract just the translated current message part
      if (result.translatedText.includes('Current message:')) {
        const translatedPart = result.translatedText.split('Current message:')[1]?.trim();
        if (translatedPart) {
          return {
            ...result,
            translatedText: translatedPart,
            originalText: message
          };
        }
      }

      return result;

    } catch (error) {
      console.warn('Contextual translation failed, falling back to basic:', error);
      return baseTranslation.translateMessage(message);
    }
  }, [baseTranslation, detectUserLanguagePattern]);

  /**
   * Suggest better translation using AI enhancement
   */
  const suggestBetterTranslation = useCallback(async (
    original: string,
    translation: string
  ): Promise<string> => {
    try {
      // Use Groq to enhance translation quality
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: `You are a professional translator. Improve this translation to be more natural, contextually appropriate, and culturally sensitive. Keep the same meaning but make it sound more native.

Language Context: Translating for Filipino users who commonly use English, Filipino, Korean, Japanese, Spanish, French, Thai, Indonesian, Vietnamese, Mandarin.

Original: "${original}"
Current Translation: "${translation}"

Provide only the improved translation, nothing else.`
          }, {
            role: 'user',
            content: `Improve this translation: "${translation}"`
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const improvedTranslation = result.choices?.[0]?.message?.content?.trim();

        if (improvedTranslation && improvedTranslation !== translation) {
          return improvedTranslation;
        }
      }

      return translation;
    } catch (error) {
      console.warn('Translation enhancement failed:', error);
      return translation;
    }
  }, []);

  return {
    ...baseTranslation,
    detectUserLanguagePattern,
    getContextualTranslation,
    suggestBetterTranslation
  };
}