/**
 * Google Translate API Integration Endpoint
 * Provides translation services with fallback options
 */

import { NextRequest, NextResponse } from 'next/server';

interface TranslateRequest {
  text: string;
  source?: string; // Source language code (auto-detect if not provided)
  target: string;  // Target language code
  detectOnly?: boolean; // Only detect language, don't translate
}

interface TranslateResponse {
  success: boolean;
  translatedText?: string;
  detectedLanguage?: string;
  confidence?: number;
  originalText?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, source, target, detectOnly = false } = body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Text is required for translation'
      }, { status: 400 });
    }

    if (!target) {
      return NextResponse.json({
        success: false,
        error: 'Target language is required'
      }, { status: 400 });
    }

    // Try Google Translate API first
    try {
      const googleResult = await translateWithGoogle(text, source, target, detectOnly);
      return NextResponse.json(googleResult);
    } catch (googleError) {
      console.warn('Google Translate failed, trying fallback:', googleError);

      // Fallback to LibreTranslate
      try {
        const fallbackResult = await translateWithLibreTranslate(text, source, target, detectOnly);
        return NextResponse.json(fallbackResult);
      } catch (fallbackError) {
        console.error('All translation services failed:', fallbackError);

        // Final fallback: basic text processing
        return NextResponse.json({
          success: true,
          translatedText: detectOnly ? text : `[Translation unavailable] ${text}`,
          detectedLanguage: source || 'unknown',
          confidence: 0.1,
          originalText: text
        });
      }
    }

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Translate using Google Cloud Translate API
 */
async function translateWithGoogle(
  text: string,
  source?: string,
  target: string,
  detectOnly: boolean = false
): Promise<TranslateResponse> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    throw new Error('Google Translate API key not configured');
  }

  try {
    if (detectOnly) {
      // Language detection only
      const detectUrl = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`;
      const detectResponse = await fetch(detectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        }),
      });

      if (!detectResponse.ok) {
        throw new Error(`Google Detect API error: ${detectResponse.status}`);
      }

      const detectResult = await detectResponse.json();

      return {
        success: true,
        translatedText: text,
        detectedLanguage: detectResult.data?.detections?.[0]?.[0]?.language || 'unknown',
        confidence: detectResult.data?.detections?.[0]?.[0]?.confidence || 0.5,
        originalText: text
      };
    } else {
      // Translation
      const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const translateResponse = await fetch(translateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: source || undefined, // Let Google auto-detect if not provided
          target: target,
          format: 'text'
        }),
      });

      if (!translateResponse.ok) {
        throw new Error(`Google Translate API error: ${translateResponse.status}`);
      }

      const result = await translateResponse.json();

      return {
        success: true,
        translatedText: result.data?.translations?.[0]?.translatedText || text,
        detectedLanguage: result.data?.translations?.[0]?.detectedSourceLanguage || source || 'unknown',
        confidence: 0.9, // Google Translate generally high confidence
        originalText: text
      };
    }

  } catch (error) {
    console.error('Google Translate API error:', error);
    throw error;
  }
}

/**
 * Fallback translation using LibreTranslate
 */
async function translateWithLibreTranslate(
  text: string,
  source?: string,
  target: string,
  detectOnly: boolean = false
): Promise<TranslateResponse> {
  try {
    if (detectOnly) {
      // LibreTranslate detect endpoint
      const detectResponse = await fetch('https://libretranslate.de/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        }),
      });

      if (!detectResponse.ok) {
        throw new Error(`LibreTranslate Detect error: ${detectResponse.status}`);
      }

      const detectResult = await detectResponse.json();

      return {
        success: true,
        translatedText: text,
        detectedLanguage: detectResult[0]?.language || 'unknown',
        confidence: detectResult[0]?.confidence || 0.5,
        originalText: text
      };
    } else {
      // LibreTranslate translation
      const translateResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: source || 'auto',
          target: target,
          format: 'text'
        }),
      });

      if (!translateResponse.ok) {
        throw new Error(`LibreTranslate error: ${translateResponse.status}`);
      }

      const result = await translateResponse.json();

      return {
        success: true,
        translatedText: result.translatedText || text,
        detectedLanguage: result.detectedLanguage || source || 'unknown',
        confidence: 0.7, // Medium confidence for fallback
        originalText: text
      };
    }

  } catch (error) {
    console.error('LibreTranslate error:', error);
    throw error;
  }
}

/**
 * Get supported languages
 */
export async function GET(request: NextRequest) {
  try {
    // Return our curated list of popular languages for Filipino users
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    ];

    return NextResponse.json({
      success: true,
      languages: supportedLanguages,
      total: supportedLanguages.length
    });

  } catch (error) {
    console.error('Get languages error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch supported languages'
    }, { status: 500 });
  }
}