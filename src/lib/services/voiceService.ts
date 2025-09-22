/**
 * Voice Service for Gawin
 * Provides natural text-to-speech capabilities with personality-matched voice
 * Configured for male voice aged 22-28 with friendly, intelligent tone
 * Integrated with Enhanced Voice Service for ElevenLabs primary + built-in fallback
 */

import { huggingFaceService } from './huggingFaceService';
import { naturalTTSService } from './naturalTTSService';
import { autonomyService } from './autonomyService';
import { filipinoLanguageService } from './filipinoLanguageService';
import { enhancedVoiceService } from './enhancedVoiceService';

export interface VoiceConfig {
  enabled: boolean;
  autoSpeak: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  language: 'en-US' | 'en-PH' | 'fil-PH';
}

export interface SpeechOptions {
  text: string;
  interrupt?: boolean;
  priority?: 'low' | 'normal' | 'high';
  emotion?: 'neutral' | 'friendly' | 'excited' | 'thoughtful' | 'empathetic';
  language?: 'en-US' | 'en-PH' | 'fil-PH';
}

class VoiceService {
  private config: VoiceConfig = {
    enabled: false,
    autoSpeak: true,
    voice: null,
    rate: 1.1, // More natural conversational pacing (160-180 WPM equivalent)
    pitch: 1.05, // Slightly higher for more youthful, less robotic sound
    volume: 0.85, // Slightly lower for more natural speaking volume
    language: 'en-US'
  };

  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceQueue: SpeechOptions[] = [];
  private isInitialized = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isMobile = false;
  private hasUserInteracted = false;
  private audioContext: AudioContext | null = null;
  private callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();
      this.detectMobile();
      this.setupMobileAudioHandling();
    }
  }

  /**
   * Detect mobile device
   */
  private detectMobile(): void {
    if (typeof window === 'undefined') return;
    
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   /Mobi|Android/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0);
    
    console.log('📱 Device detection:', this.isMobile ? 'Mobile' : 'Desktop');
  }

  /**
   * Setup mobile audio handling
   */
  private setupMobileAudioHandling(): void {
    if (typeof window === 'undefined' || !this.isMobile) return;

    // Create audio context for mobile audio unlocking
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not available:', error);
    }

    // Listen for user interactions to unlock audio
    const unlockAudio = () => {
      console.log('🔓 Mobile audio unlocked by user interaction');
      this.hasUserInteracted = true;
      
      // Try to resume audio context
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('🎵 AudioContext resumed');
        }).catch(error => {
          console.warn('Failed to resume AudioContext:', error);
        });
      }

      // Remove listeners after first interaction
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // Add event listeners for user interactions
    document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    document.addEventListener('touchend', unlockAudio, { once: true, passive: true });
    document.addEventListener('click', unlockAudio, { once: true, passive: true });
    document.addEventListener('keydown', unlockAudio, { once: true, passive: true });
  }

  /**
   * Initialize voice system and load available voices
   */
  private async initializeVoices(): Promise<void> {
    if (!this.synthesis) return;

    // Wait for voices to load
    const loadVoices = () => {
      this.availableVoices = this.synthesis!.getVoices();
      this.selectOptimalVoice();
      this.isInitialized = true;
      console.log('🎤 Voice system initialized with', this.availableVoices.length, 'voices');
    };

    // Some browsers load voices asynchronously
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', loadVoices);
      // Fallback timeout
      setTimeout(loadVoices, 1000);
    } else {
      loadVoices();
    }
  }

  /**
   * Select the best voice for Gawin's personality (male, 22-28 years old)
   */
  private selectOptimalVoice(): void {
    if (!this.availableVoices.length) return;

    // Priority order for mid-20s friendly male voices (warm, slightly husky, approachable)
    const preferredVoices = [
      // Top priority: Natural, friendly, mid-20s sounding voices
      'Alex', // macOS - very natural, warm tone
      'Microsoft Guy - English (United States)', // Natural and friendly
      'Microsoft Adrian - English (United States)', // Warm, approachable
      'Google US English Male', // Clear, natural
      'Microsoft Ryan - English (United States)', // Young, energetic
      'Tom', // macOS - casual, friendly
      'Fred', // macOS - relaxed, conversational
      'Daniel', // macOS UK - warm accent
      
      // Secondary: Good quality voices
      'Microsoft Mark - English (United States)',
      'Microsoft Jacob - English (United States)',
      'Microsoft Connor - English (Ireland)', // Irish accent can be warm
      'Microsoft Liam - English (Canada)', // Canadian accent
      
      // Fallback voices
      'Microsoft David - English (United States)',
      'Male',
      'Man',
      'Guy',
      'Adrian',
      'Ryan',
      'Connor',
      'Liam',
      'Jacob'
    ];

    // First, try to find voices by exact name match
    for (const voiceName of preferredVoices) {
      const voice = this.availableVoices.find(v => 
        v.name.includes(voiceName) && 
        (v.lang.startsWith('en-') || v.lang.startsWith('fil-'))
      );
      if (voice) {
        this.config.voice = voice;
        console.log('🎙️ Selected optimal voice:', voice.name, voice.lang);
        return;
      }
    }

    // Fallback: find any male-sounding voice
    const maleVoice = this.availableVoices.find(v => 
      (v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('man') ||
       v.name.toLowerCase().includes('david') ||
       v.name.toLowerCase().includes('mark') ||
       v.name.toLowerCase().includes('daniel') ||
       v.name.toLowerCase().includes('tom') ||
       v.name.toLowerCase().includes('alex')) &&
      (v.lang.startsWith('en-') || v.lang.startsWith('fil-'))
    );

    if (maleVoice) {
      this.config.voice = maleVoice;
      console.log('🎙️ Selected fallback male voice:', maleVoice.name, maleVoice.lang);
    } else {
      // Last resort: use first English voice
      const englishVoice = this.availableVoices.find(v => v.lang.startsWith('en-'));
      if (englishVoice) {
        this.config.voice = englishVoice;
        console.log('🎙️ Selected default English voice:', englishVoice.name, englishVoice.lang);
      }
    }
  }

  /**
   * Enable voice output
   */
  async enableVoice(): Promise<boolean> {
    if (!this.synthesis) {
      console.error('❌ Speech synthesis not supported');
      return false;
    }

    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.config.enabled = true;
    console.log('🔊 Gawin voice enabled');

    return true;
  }

  /**
   * Disable voice output
   */
  disableVoice(): void {
    this.config.enabled = false;
    this.stopSpeaking();
    console.log('🔇 Gawin voice disabled');
  }

  /**
   * Check if voice is enabled
   */
  isVoiceEnabled(): boolean {
    return this.config.enabled && this.synthesis !== null;
  }

  /**
   * Enable voice for mobile after user interaction
   */
  enableVoiceForMobile(): void {
    if (this.isMobile && !this.hasUserInteracted) {
      this.hasUserInteracted = true;
      console.log('🔓 Voice enabled for mobile by user interaction');
    }
  }

  /**
   * Check if voice is ready for mobile
   */
  isVoiceReadyForMobile(): boolean {
    return !this.isMobile || this.hasUserInteracted;
  }

  /**
   * Speak text with Gawin's voice
   */
  async speak(options: SpeechOptions): Promise<void> {
    if (!this.config.enabled || !this.synthesis || !this.config.voice) {
      console.log('🔇 Voice disabled or not available');
      return;
    }

    // For mobile devices, check if user has interacted
    if (this.isMobile && !this.hasUserInteracted) {
      console.log('📱 Mobile voice requires user interaction first');
      this.callbacks.onError?.('Please tap the screen to enable voice on mobile');
      return;
    }

    // Stop current speech if interruption requested
    if (options.interrupt) {
      this.stopSpeaking();
    }

    // Queue high priority messages
    if (options.priority === 'high') {
      this.voiceQueue.unshift(options);
    } else {
      this.voiceQueue.push(options);
    }

    // Process queue if not currently speaking
    if (!this.currentUtterance) {
      await this.processVoiceQueue();
    }
  }

  /**
   * Process the voice queue
   */
  private async processVoiceQueue(): Promise<void> {
    if (this.voiceQueue.length === 0 || !this.synthesis) return;

    const nextSpeech = this.voiceQueue.shift()!;
    await this.speakNow(nextSpeech);
  }

  /**
   * Speak immediately without queuing using natural TTS with autonomous optimization
   */
  private async speakNow(options: SpeechOptions): Promise<void> {
    const processedText = this.cleanTextForSpeech(options.text);
    
    if (!processedText.trim()) {
      // Continue processing queue
      setTimeout(() => this.processVoiceQueue(), 50);
      return;
    }

    try {
      console.log('🎤 Starting optimized natural TTS synthesis...');
      
      // Get autonomous adaptations for current context
      const context = {
        userEmotion: options.emotion,
        conversationTopic: this.inferTopic(processedText),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
      };
      
      // Apply autonomous contextual adaptations
      await autonomyService.adaptToContext(context);
      
      // Configure natural TTS with autonomous optimizations
      const ttsConfig = {
        voice: this.selectNaturalVoice(options.emotion),
        provider: this.selectBestProvider(),
        stability: this.getStabilityForEmotion(options.emotion),
        similarityBoost: 0.8,
        style: this.getStyleForEmotion(options.emotion)
      };

      naturalTTSService.setConfig(ttsConfig);
      
      // Use Enhanced Voice Service (ElevenLabs primary, built-in fallback with learning)
      const voiceResult = await Promise.race([
        enhancedVoiceService.speak(processedText, {
          emotion: options.emotion || 'neutral',
          priority: (options.priority === 'low') ? 'normal' : (options.priority || 'normal')
        }),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Voice synthesis timeout')), 6000)
        )
      ]);

      if (voiceResult) {
        console.log('✅ Enhanced voice synthesis completed successfully');

        // Continue processing queue after a short delay
        setTimeout(() => this.processVoiceQueue(), 100);
        return;
      }

      // If enhanced voice service fails, fallback to original method
      console.warn('⚠️ Enhanced voice service failed, using fallback...');

      // Original natural TTS fallback
      const result = await Promise.race([
        naturalTTSService.generateSpeech(processedText, ttsConfig),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('TTS timeout')), 6000)
        )
      ]);

      if (result.success && result.audioUrl) {
        // Play the natural TTS audio
        const audio = new Audio(result.audioUrl);
        
        // Preload audio for faster playback
        audio.preload = 'auto';
        
        audio.onplay = () => {
          console.log(`🎤 Gawin started speaking (${result.provider} Natural TTS):`, processedText.substring(0, 50) + '...');
          this.callbacks.onStart?.();
        };

        audio.onended = () => {
          console.log(`✅ Gawin finished speaking (${result.provider} - ${result.duration}ms)`);
          this.currentUtterance = null;
          this.callbacks.onEnd?.();
          
          // Clean up audio URL
          if (result.audioUrl) {
            URL.revokeObjectURL(result.audioUrl);
          }
          
          // Process next item in queue immediately
          this.processVoiceQueue();
        };

        audio.onerror = (error) => {
          console.error('❌ Natural TTS audio playback error:', error);
          this.callbacks.onError?.('Audio playback failed');
          this.currentUtterance = null;
          setTimeout(() => this.processVoiceQueue(), 200);
        };

        // Store reference for stopping capability
        this.currentUtterance = { audio } as any;
        
        // Start playback immediately
        try {
          await audio.play();
        } catch (playError) {
          console.warn('Audio autoplay blocked, user interaction required');
          
          // For mobile devices, show user interaction required message
          if (this.isMobile && !this.hasUserInteracted) {
            console.log('📱 Mobile audio requires user interaction - waiting for touch/click');
            this.callbacks.onError?.('Mobile audio requires user interaction. Please tap the screen to enable voice.');
            
            // Store audio for later playback when user interacts
            const playAfterInteraction = () => {
              if (this.hasUserInteracted) {
                audio.play().catch(error => {
                  console.error('Failed to play audio after interaction:', error);
                });
              }
            };
            
            // Try again after a short delay
            setTimeout(playAfterInteraction, 500);
          }
        }
        return;
      }
      
      // If natural TTS failed, log the error
      console.error('❌ Natural TTS failed:', result.error);
      this.callbacks.onError?.(result.error || 'Natural TTS failed');
      
    } catch (error) {
      console.error('❌ Natural TTS error:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'TTS error');
    }
    
    // Continue processing queue even on failure
    this.currentUtterance = null;
    setTimeout(() => this.processVoiceQueue(), 200);
  }


  /**
   * Select the best natural voice for more human-like speech
   */
  private selectBestNaturalVoice(languageDetection: any): SpeechSynthesisVoice | null {
    const voices = this.synthesis?.getVoices() || [];
    
    // Prioritize highest quality voices for natural speech
    const premiumVoiceNames = [
      'Samantha', 'Alex', 'Victoria', 'Daniel', 'Karen', 'Moira', 'Rishi',
      'Google', 'Microsoft', 'Natural', 'Neural', 'Premium', 'Enhanced'
    ];
    
    // First try to find premium voices
    for (const voiceName of premiumVoiceNames) {
      const voice = voices.find(v => 
        v.name.includes(voiceName) && 
        v.lang.startsWith('en') &&
        !v.name.toLowerCase().includes('compact') // Avoid compact versions
      );
      if (voice) {
        console.log(`🎵 Selected premium natural voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }
    
    // Fallback to non-robotic sounding voices
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      !v.name.toLowerCase().includes('robot') &&
      !v.name.toLowerCase().includes('compact') &&
      !v.name.toLowerCase().includes('monotone')
    );
    
    if (naturalVoice) {
      console.log(`🎵 Selected natural fallback voice: ${naturalVoice.name} (${naturalVoice.lang})`);
      return naturalVoice;
    }
    
    return null;
  }

  /**
   * Get emotion-based rate multiplier for more expressive speech
   */
  private getEmotionRateMultiplier(emotion?: string): number {
    switch (emotion) {
      case 'excited': return 1.2;
      case 'calm': return 0.9;
      case 'friendly': return 1.05;
      case 'confident': return 1.1;
      default: return 1.0;
    }
  }

  /**
   * Get emotion-based pitch multiplier for more expressive speech
   */
  private getEmotionPitchMultiplier(emotion?: string): number {
    switch (emotion) {
      case 'excited': return 1.15;
      case 'calm': return 0.95;
      case 'friendly': return 1.08;
      case 'confident': return 1.05;
      default: return 1.0;
    }
  }

  /**
   * Select natural voice based on emotion - optimized for Filipino mid-20s speakers
   */
  private selectNaturalVoice(emotion?: string): string {
    // Optimized for sexy, athletic, humble voice with smiling warmth
    const maleVoices = {
      excited: 'Josh',    // Gentle excitement - athletic but humble enthusiasm
      friendly: 'Josh',   // Warm, smiling friendliness - willing to chat
      thoughtful: 'Josh', // Relaxed, thoughtful analysis - no rush
      empathetic: 'Josh', // Humble, caring understanding - genuine warmth
      confident: 'Josh',  // Athletic but humble confidence - never arrogant
      default: 'Josh'     // Sexy, athletic, humble conversationalist
    };
    
    // Alternative female voices for variety (if needed later)
    const femaleVoices = {
      excited: 'Emily',   // Friendly, energetic
      friendly: 'Bella', // Warm, professional, approachable
      thoughtful: 'Grace', // Elegant, sophisticated  
      empathetic: 'Sarah', // Versatile, natural, relatable
      confident: 'Nicole', // Confident, engaging
      default: 'Bella'    // Perfect for Filipino mid-20s female
    };
    
    // For now, use male voices for Gawin (can be configurable later)
    return maleVoices[emotion as keyof typeof maleVoices] || maleVoices.default;
  }

  /**
   * Select best TTS provider based on availability
   */
  private selectBestProvider(): 'elevenlabs' | 'openai' | 'azure' | 'browser' {
    // Check for API keys and return best available provider
    if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY) {
      return 'elevenlabs';
    }
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY) {
      return 'openai';
    }
    if (process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || process.env.AZURE_SPEECH_KEY) {
      return 'azure';
    }
    return 'browser';
  }

  /**
   * Get stability setting for emotion - optimized for Filipino natural speech
   */
  private getStabilityForEmotion(emotion?: string): number {
    // Adjusted for slower, humble, relaxed delivery with athletic warmth
    const stabilityMap = {
      excited: 0.65,  // Higher stability for calm, not rushed excitement
      friendly: 0.7,   // Very stable for relaxed, smiling friendliness
      thoughtful: 0.75, // High stability for unhurried, thoughtful responses
      empathetic: 0.8,  // Very stable for gentle, humble empathy
      confident: 0.7,   // High stability for humble athletic confidence
      default: 0.7      // Higher default for relaxed, slower delivery
    };
    
    return stabilityMap[emotion as keyof typeof stabilityMap] || stabilityMap.default;
  }

  /**
   * Get style setting for emotion - optimized for Filipino attractiveness
   */
  private getStyleForEmotion(emotion?: string): number {
    // Adjusted for humble, sexy, athletic personality with smiling warmth
    const styleMap = {
      excited: 0.2,     // Low style for humble, gentle excitement
      friendly: 0.3,    // Moderate style for warm, smiling friendliness
      thoughtful: 0.15, // Very low style for humble, relaxed contemplation
      empathetic: 0.25, // Low style for genuine, humble empathy
      confident: 0.2,   // Low style for humble athletic confidence
      default: 0.25     // Low default for humble, willing-to-talk warmth
    };
    
    return styleMap[emotion as keyof typeof styleMap] || styleMap.default;
  }

  /**
   * Enhanced speak method with Tagalog fluency
   */
  async speakWithTagalogFluency(text: string, options: { 
    preferTagalog?: boolean; 
    emotion?: SpeechOptions['emotion'];
    priority?: SpeechOptions['priority'];
  } = {}): Promise<void> {
    // Detect language and enhance with Filipino service
    const languageDetection = filipinoLanguageService.detectLanguage(text);
    
    let processedText = text;
    
    // If user prefers Tagalog or text is already in Filipino, enhance with natural Tagalog
    if (options.preferTagalog || languageDetection.primary === 'filipino' || languageDetection.primary === 'tagalog') {
      // Generate fluent Tagalog response
      processedText = filipinoLanguageService.generateTagalogResearchResponse(text, 'general');
      
      // Optimize pronunciation for better Tagalog speech
      processedText = filipinoLanguageService.optimizeTagalogPronunciation(processedText);
    } else if (languageDetection.mixedLanguage || languageDetection.primary === 'taglish') {
      // Generate natural Taglish for code-switching
      processedText = filipinoLanguageService.generateNaturalTaglish(text, 0.5);
    }

    // Select appropriate voice and language settings
    const speechLanguage = this.mapLanguageToSpeechLang(languageDetection.primary);
    
    await this.speak({
      text: processedText,
      emotion: options.emotion || this.detectEmotionFromTextEnhanced(processedText),
      language: speechLanguage,
      priority: options.priority || 'normal'
    });
  }

  /**
   * Clean text for natural speech
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
      
      // Remove special characters and formatting
      .replace(/[📹👁️🖥️😊🎯⚡💻📝🧠🌌🎨✍️🌟]/g, '') // Emojis
      .replace(/\|/g, '. ') // Pipe separators
      .replace(/\n+/g, '. ') // Multiple newlines
      .replace(/\s+/g, ' ') // Multiple spaces
      
      // Fix common speech issues
      .replace(/\b(https?:\/\/[^\s]+)/g, 'link') // URLs
      .replace(/\b\d{4,}/g, (match) => match.split('').join(' ')) // Long numbers
      .replace(/([a-z])([A-Z])/g, '$1 $2') // CamelCase
      
      // Add natural breathing pauses for longer sentences
      .replace(/([.!?])\s+([A-Z])/g, '$1 $2') // Natural pause between sentences
      .replace(/,\s+/g, ', ') // Ensure comma spacing for natural pauses
      .replace(/;\s+/g, '; ') // Semicolon pauses
      
      // Clean up punctuation for natural pauses
      .replace(/[.]{2,}/g, '.') // Multiple periods
      .replace(/[!]{2,}/g, '!') // Multiple exclamations
      .replace(/[?]{2,}/g, '?') // Multiple questions
      
      // Add micro-pauses for better phrasing
      .replace(/\b(however|therefore|moreover|furthermore|additionally|meanwhile|consequently)\b/gi, '$1,')
      
      .trim();
  }

  /**
   * Adjust speech rate based on emotion (more human-like variations)
   */
  private adjustRateForEmotion(emotion?: string): number {
    const baseRate = this.config.rate;
    
    switch (emotion) {
      case 'excited': return Math.min(1.3, baseRate + 0.15);
      case 'thoughtful': return Math.max(0.9, baseRate - 0.15);
      case 'empathetic': return Math.max(0.95, baseRate - 0.1);
      case 'friendly': return baseRate + 0.1;
      default: return baseRate;
    }
  }

  /**
   * Adjust pitch based on emotion (optimized for younger, more human sound)
   */
  private adjustPitchForEmotion(emotion?: string): number {
    const basePitch = this.config.pitch;
    
    switch (emotion) {
      case 'excited': return Math.min(1.4, basePitch + 0.15);
      case 'friendly': return Math.min(1.3, basePitch + 0.05);
      case 'thoughtful': return Math.max(1.0, basePitch - 0.15);
      case 'empathetic': return Math.max(1.1, basePitch - 0.05);
      default: return basePitch;
    }
  }

  /**
   * Stop current speech
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.voiceQueue = [];
      console.log('🔇 Speech stopped');
    }
  }

  /**
   * Pause speech
   */
  pauseSpeaking(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
      console.log('⏸️ Speech paused');
    }
  }

  /**
   * Resume speech
   */
  resumeSpeaking(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
      console.log('▶️ Speech resumed');
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Set voice configuration
   */
  setConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.language) {
      // Find voice for new language
      const voice = this.availableVoices.find(v => 
        v.lang.startsWith(newConfig.language!.split('-')[0])
      );
      if (voice) {
        this.config.voice = voice;
      }
    }
    
    console.log('🎙️ Voice config updated:', newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.availableVoices];
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
   * Auto-speak based on language detection
   */
  async autoSpeak(text: string, language: 'english' | 'filipino' | 'taglish' = 'english'): Promise<void> {
    if (!this.config.autoSpeak) return;

    const emotion = this.detectEmotionFromText(text);
    const speechLanguage = this.mapLanguageToSpeechLang(language);

    await this.speak({
      text,
      emotion,
      language: speechLanguage,
      priority: 'normal'
    });
  }

  /**
   * Detect emotion from text content
   */
  private detectEmotionFromText(text: string): SpeechOptions['emotion'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('!') && (lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('amazing'))) {
      return 'excited';
    }
    if (lowerText.includes('sorry') || lowerText.includes('understand') || lowerText.includes('feel')) {
      return 'empathetic';
    }
    if (lowerText.includes('think') || lowerText.includes('consider') || lowerText.includes('analyze')) {
      return 'thoughtful';
    }
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('welcome')) {
      return 'friendly';
    }
    
    return 'neutral';
  }

  /**
   * Map language detection to speech language
   */
  private mapLanguageToSpeechLang(language: string): 'en-US' | 'en-PH' | 'fil-PH' {
    switch (language) {
      case 'filipino':
      case 'tagalog':
        return 'fil-PH';
      case 'taglish':
        return 'en-PH';
      default:
        return 'en-US';
    }
  }

  /**
   * Test voice with sample text using natural TTS and autonomous features
   */
  async testVoice(): Promise<void> {
    console.log('🧪 Testing enhanced natural TTS voice with autonomy...');
    
    // Initialize autonomy service
    await autonomyService.initialize();
    
    // Test the natural TTS service directly
    try {
      const result = await naturalTTSService.test();
      if (result.success) {
        console.log(`✅ Natural TTS test successful with ${result.provider}!`);
      } else {
        console.warn(`⚠️ Natural TTS test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Natural TTS test error:', error);
    }

    // Test enhanced Tagalog capabilities
    await this.speak({
      text: "Kumusta! Ako si Gawin, may natural voice na ako ngayon. Masayang makipag-usap sa inyo, mga kaibigan!",
      emotion: 'friendly',
      priority: 'high',
      interrupt: true
    });
    
    // Get consciousness report
    const consciousnessReport = autonomyService.getConsciousnessReport();
    console.log('🌟 Gawin Consciousness Report:', consciousnessReport);
  }

  /**
   * Detect language in text for better prosody
   */
  private detectLanguage(text: string): { primary: string; hasTagalog: boolean; hasEnglish: boolean; mixedLanguage: boolean } {
    const tagalogWords = [
      'kumusta', 'salamat', 'oo', 'hindi', 'tara', 'kaya', 'naman', 'lang', 'mga', 'ang', 'ng', 'sa', 'ko', 'mo', 'niya',
      'tayo', 'kayo', 'sila', 'ako', 'ikaw', 'siya', 'kami', 'tayong', 'kayong', 'silang', 'ito', 'iyan', 'iyon',
      'dito', 'diyan', 'doon', 'galing', 'pupunta', 'dating', 'kasi', 'pero', 'tapos', 'habang', 'kahit', 'para',
      'gusto', 'ayaw', 'mahal', 'galit', 'tuwa', 'lungkot', 'takot', 'sulit', 'maganda', 'pangit', 'mabait', 'masama'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const tagalogCount = words.filter(word => tagalogWords.includes(word.replace(/[^\w]/g, ''))).length;
    const englishCount = words.filter(word => /^[a-z]+$/.test(word) && !tagalogWords.includes(word)).length;
    
    const hasTagalog = tagalogCount > 0;
    const hasEnglish = englishCount > 0;
    const mixedLanguage = hasTagalog && hasEnglish;

    let primary = 'english';
    if (tagalogCount > englishCount && hasTagalog) {
      primary = 'tagalog';
    } else if (mixedLanguage) {
      primary = 'taglish';
    }

    return { primary, hasTagalog, hasEnglish, mixedLanguage };
  }

  /**
   * Prepare text for speech with natural prosody and SSML-like enhancements
   */
  private prepareTextForSpeech(text: string, languageDetection: any, emotion?: string): string {
    // First, clean the text
    let processedText = this.cleanTextForSpeech(text);

    // Add natural pauses and emphasis based on content
    processedText = this.addNaturalProsody(processedText, languageDetection, emotion);

    return processedText;
  }

  /**
   * Add natural prosody patterns for more human-like speech
   */
  private addNaturalProsody(text: string, languageDetection: any, emotion?: string): string {
    let result = text;

    // Add micro-pauses before important words
    result = result.replace(/\b(hey|hello|hi|kumusta|salamat|thank you|please|tara|let's|imagine|tell me)\b/gi, (match) => {
      return `${match}`; // Browser TTS doesn't support custom pauses, but we can adjust pacing
    });

    // Handle Filipino interjections naturally
    result = result.replace(/\b(oo|hindi|kasi|naman|lang|talaga)\b/gi, (match) => {
      return match; // Keep natural Filipino rhythm
    });

    // Add friendly emphasis patterns
    if (emotion === 'friendly') {
      result = result.replace(/\b(great|awesome|nice|good|excellent|galing|maganda)\b/gi, (match) => {
        return match; // Emphasize positive words
      });
    }

    // Handle code-switching transitions smoothly
    if (languageDetection.mixedLanguage) {
      // Add slight pauses at language boundaries for smoother transitions
      result = result.replace(/([a-z]+)\s+(kumusta|tara|kasi|naman|lang)/gi, '$1 $2');
      result = result.replace(/(kumusta|salamat|oo|hindi)\s+([a-z]+)/gi, '$1 $2');
    }

    return result;
  }

  /**
   * Adjust speech rate based on language and emotion
   */
  private adjustRateForLanguageAndEmotion(language: string, emotion?: string): number {
    let baseRate = this.config.rate;

    // Adjust base rate for language
    switch (language) {
      case 'tagalog':
        baseRate = this.config.rate * 1.02; // Slightly faster syllabic rate for Tagalog
        break;
      case 'taglish':
        baseRate = this.config.rate * 1.0; // Maintain conversational pace for code-switching
        break;
      default:
        baseRate = this.config.rate;
    }

    // Apply emotion adjustments
    switch (emotion) {
      case 'excited': return Math.min(1.2, baseRate + 0.12);
      case 'thoughtful': return Math.max(0.85, baseRate - 0.12);
      case 'empathetic': return Math.max(0.9, baseRate - 0.08);
      case 'friendly': return baseRate + 0.06;
      default: return baseRate;
    }
  }

  /**
   * Adjust pitch based on language and emotion
   */
  private adjustPitchForLanguageAndEmotion(language: string, emotion?: string): number {
    let basePitch = this.config.pitch;

    // Adjust base pitch for language characteristics
    switch (language) {
      case 'tagalog':
        basePitch = this.config.pitch + 0.05; // Slightly higher for melodic Tagalog phrasing
        break;
      case 'taglish':
        basePitch = this.config.pitch + 0.02; // Slight adjustment for natural code-switching
        break;
      default:
        basePitch = this.config.pitch;
    }

    // Apply emotion adjustments
    switch (emotion) {
      case 'excited': return Math.min(1.15, basePitch + 0.12);
      case 'friendly': return Math.min(1.05, basePitch + 0.06);
      case 'thoughtful': return Math.max(0.88, basePitch - 0.08);
      case 'empathetic': return Math.max(0.92, basePitch - 0.04);
      default: return basePitch;
    }
  }

  /**
   * Map detected language to voice language code with autonomous enhancement
   */
  private mapLanguageToVoiceLang(detectedLanguage: string, providedLanguage?: string): string {
    if (providedLanguage) {
      return providedLanguage;
    }

    switch (detectedLanguage) {
      case 'tagalog':
      case 'filipino':
        return 'fil-PH';
      case 'taglish':
      case 'mixed':
        return 'en-PH';
      default:
        return 'en-US';
    }
  }

  /**
   * Infer conversation topic for autonomous adaptation
   */
  private inferTopic(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('code') || lowerText.includes('programming')) return 'tech';
    if (lowerText.includes('feeling') || lowerText.includes('emotion')) return 'emotional';
    if (lowerText.includes('work') || lowerText.includes('business')) return 'professional';
    if (lowerText.includes('fun') || lowerText.includes('joke')) return 'casual';
    if (lowerText.includes('learn') || lowerText.includes('study')) return 'educational';
    
    return 'general';
  }

  /**
   * Add natural variation to voice parameters to reduce robotic sound
   */
  private addNaturalVariation(baseValue: number, type: 'rate' | 'pitch'): number {
    // Add small random variation (±3-5%) to make voice sound more natural
    const variationAmount = type === 'rate' ? 0.04 : 0.03; // Slightly more variation for rate
    const variation = (Math.random() - 0.5) * 2 * variationAmount;
    const result = baseValue + (baseValue * variation);
    
    // Ensure values stay within reasonable bounds
    if (type === 'rate') {
      return Math.max(0.7, Math.min(1.4, result));
    } else {
      return Math.max(0.8, Math.min(1.3, result));
    }
  }

  /**
   * Enhanced emotion detection with Filipino language support
   */
  private detectEmotionFromTextEnhanced(text: string): SpeechOptions['emotion'] {
    const lowerText = text.toLowerCase();
    
    // Excited indicators
    if (lowerText.includes('!') && (
      lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('amazing') ||
      lowerText.includes('galing') || lowerText.includes('astig') || lowerText.includes('wow')
    )) {
      return 'excited';
    }

    // Empathetic indicators
    if (lowerText.includes('sorry') || lowerText.includes('understand') || lowerText.includes('feel') ||
        lowerText.includes('pasensya') || lowerText.includes('intindi') || lowerText.includes('naiintindihan')) {
      return 'empathetic';
    }

    // Thoughtful indicators
    if (lowerText.includes('think') || lowerText.includes('consider') || lowerText.includes('analyze') ||
        lowerText.includes('isip') || lowerText.includes('pag-isipan')) {
      return 'thoughtful';
    }

    // Friendly indicators
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('welcome') ||
        lowerText.includes('kumusta') || lowerText.includes('kamusta') || lowerText.includes('tara')) {
      return 'friendly';
    }

    return 'neutral';
  }
}

export const voiceService = new VoiceService();