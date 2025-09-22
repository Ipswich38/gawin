/**
 * ElevenLabs Voice Service for Gawin
 * High-quality neural text-to-speech using ElevenLabs API
 * Voice ID: s2tgiTzhkPovTa6bxAlx
 */

export interface ElevenLabsConfig {
  voiceId: string;
  modelId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface TTSOptions {
  text: string;
  voiceSettings?: Partial<ElevenLabsConfig>;
  optimizeStreamingLatency?: number;
  outputFormat?: 'mp3_22050_32' | 'mp3_44100_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192';
}

class ElevenLabsVoiceService {
  private config: ElevenLabsConfig = {
    voiceId: 's2tgiTzhkPovTa6bxAlx', // Specified voice ID
    modelId: 'eleven_multilingual_v2', // Best quality model with multilingual support
    stability: 0.75, // Good balance for natural speech
    similarityBoost: 0.85, // High similarity for consistent voice
    style: 0.3, // Moderate style for engaging delivery
    useSpeakerBoost: true
  };

  private baseUrl = 'https://api.elevenlabs.io/v1';
  private isInitialized = false;
  private audioQueue: HTMLAudioElement[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the ElevenLabs service
   */
  private async initializeService(): Promise<void> {
    try {
      // Check if API key is available
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.warn('⚠️ ElevenLabs API key not found. Voice service will use fallback.');
        return;
      }

      // Test API connectivity
      await this.testConnection();
      this.isInitialized = true;
      console.log('✅ ElevenLabs voice service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs service:', error);
    }
  }

  /**
   * Get API key from environment
   */
  private getApiKey(): string | null {
    if (typeof window !== 'undefined') {
      // Client-side: check if API key is exposed (not recommended for production)
      return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || null;
    }
    // Server-side: use server environment variable
    return process.env.ELEVENLABS_API_KEY || null;
  }

  /**
   * Test API connection via our server route
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok || !data.configured) {
        throw new Error(data.error || 'API connection test failed');
      }

      console.log('✅ ElevenLabs API connection verified');
    } catch (error) {
      console.warn('⚠️ ElevenLabs API test failed, will fallback if needed:', error);
      // Don't throw here - allow service to initialize but mark as not ready
    }
  }

  /**
   * Generate speech using ElevenLabs API via our secure server route
   */
  async generateSpeech(options: TTSOptions): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
    duration?: number;
  }> {
    const startTime = Date.now();

    try {
      // Prepare voice settings
      const voiceSettings = {
        stability: options.voiceSettings?.stability ?? this.config.stability,
        similarity_boost: options.voiceSettings?.similarityBoost ?? this.config.similarityBoost,
        style: options.voiceSettings?.style ?? this.config.style,
        use_speaker_boost: options.voiceSettings?.useSpeakerBoost ?? this.config.useSpeakerBoost,
      };

      // Prepare request payload for our API route
      const payload = {
        text: options.text,
        voiceSettings,
        optimizeStreamingLatency: options.optimizeStreamingLatency,
        outputFormat: options.outputFormat || 'mp3_44100_128',
      };

      console.log('🎤 Generating speech with ElevenLabs...', {
        voiceId: this.config.voiceId,
        textLength: options.text.length,
        settings: voiceSettings
      });

      // Use our secure API route
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        console.error('❌ ElevenLabs API route error:', response.status, errorMessage);
        return { success: false, error: errorMessage };
      }

      // Convert response to audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const duration = Date.now() - startTime;

      console.log(`✅ ElevenLabs speech generated in ${duration}ms`);

      return {
        success: true,
        audioUrl,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ ElevenLabs generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Speak text using ElevenLabs voice
   */
  async speak(text: string, options: Partial<TTSOptions> = {}): Promise<void> {
    if (!text.trim()) {
      console.warn('⚠️ Empty text provided to speak');
      return;
    }

    try {
      // Clean text for speech
      const cleanedText = this.cleanTextForSpeech(text);

      // Generate speech
      const result = await this.generateSpeech({
        text: cleanedText,
        ...options,
      });

      if (!result.success || !result.audioUrl) {
        console.error('❌ Failed to generate speech:', result.error);
        this.callbacks.onError?.(result.error || 'Speech generation failed');
        return;
      }

      // Play the generated audio
      await this.playAudio(result.audioUrl);

    } catch (error) {
      console.error('❌ Speak error:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Speech error');
    }
  }

  /**
   * Play audio from URL
   */
  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      // Configure audio for optimal playback
      audio.preload = 'auto';
      audio.volume = 1.0;

      // Set up event listeners
      audio.onloadstart = () => {
        console.log('🎵 Audio loading started');
      };

      audio.oncanplaythrough = () => {
        console.log('🎵 Audio ready to play');
      };

      audio.onplay = () => {
        console.log('🎤 ElevenLabs voice started speaking');
        this.currentAudio = audio;
        this.callbacks.onStart?.();
      };

      audio.onended = () => {
        console.log('✅ ElevenLabs voice finished speaking');
        this.currentAudio = null;

        // Clean up audio URL
        URL.revokeObjectURL(audioUrl);

        this.callbacks.onEnd?.();
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        this.callbacks.onError?.('Audio playback failed');
        reject(error);
      };

      // Start playback
      audio.play().catch(error => {
        console.error('❌ Audio play failed:', error);
        this.callbacks.onError?.('Audio autoplay blocked - user interaction required');
        reject(error);
      });
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('🔇 ElevenLabs speech stopped');
    }

    // Clear audio queue
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  /**
   * Update voice configuration
   */
  setConfig(newConfig: Partial<ElevenLabsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🎙️ ElevenLabs config updated:', newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): ElevenLabsConfig {
    return { ...this.config };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.getApiKey();
  }

  /**
   * Clean text for optimal speech synthesis
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '[code block]') // Code blocks
      .replace(/#{1,6}\s*/g, '') // Headers
      .replace(/^\s*[-*+]\s+/gm, '') // List items
      .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists

      // Remove special characters and emojis
      .replace(/[📹👁️🖥️😊🎯⚡💻📝🧠🌌🎨✍️🌟🤖]/g, '')
      .replace(/\|/g, '. ') // Pipe separators
      .replace(/\n+/g, '. ') // Multiple newlines
      .replace(/\s+/g, ' ') // Multiple spaces

      // Fix common speech issues
      .replace(/\b(https?:\/\/[^\s]+)/g, 'link') // URLs
      .replace(/\b\d{4,}/g, (match) => match.split('').join(' ')) // Long numbers
      .replace(/([a-z])([A-Z])/g, '$1 $2') // CamelCase

      // Optimize for natural speech flow
      .replace(/([.!?])\s+([A-Z])/g, '$1 $2') // Natural pause between sentences
      .replace(/,\s+/g, ', ') // Ensure comma spacing
      .replace(/;\s+/g, '; ') // Semicolon pauses
      .replace(/:\s+/g, ': ') // Colon pauses

      // Clean up excessive punctuation
      .replace(/[.]{2,}/g, '.')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')

      .trim();
  }

  /**
   * Get voice settings optimized for different emotions
   */
  getEmotionSettings(emotion: 'neutral' | 'friendly' | 'excited' | 'thoughtful' | 'empathetic'): Partial<ElevenLabsConfig> {
    const settings = {
      neutral: {
        stability: 0.75,
        similarityBoost: 0.85,
        style: 0.3,
      },
      friendly: {
        stability: 0.7,
        similarityBoost: 0.8,
        style: 0.4,
      },
      excited: {
        stability: 0.6,
        similarityBoost: 0.75,
        style: 0.5,
      },
      thoughtful: {
        stability: 0.8,
        similarityBoost: 0.9,
        style: 0.2,
      },
      empathetic: {
        stability: 0.75,
        similarityBoost: 0.85,
        style: 0.35,
      },
    };

    return settings[emotion] || settings.neutral;
  }

  /**
   * Test the ElevenLabs service
   */
  async test(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing ElevenLabs voice service...');

      const result = await this.generateSpeech({
        text: 'Hello! This is a test of the ElevenLabs voice service for Gawin AI.',
        outputFormat: 'mp3_22050_32', // Lower quality for faster testing
      });

      if (result.success) {
        console.log('✅ ElevenLabs test successful!');
        // Optionally play the test audio
        if (result.audioUrl) {
          await this.playAudio(result.audioUrl);
        }
        return { success: true };
      } else {
        console.error('❌ ElevenLabs test failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ ElevenLabs test error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get available voices (requires API call)
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error('API key not available');
      }

      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('❌ Failed to get available voices:', error);
      return [];
    }
  }
}

export const elevenLabsVoiceService = new ElevenLabsVoiceService();