/**
 * Voice Service for Gawin
 * Provides natural text-to-speech capabilities with personality-matched voice
 * Configured for male voice aged 22-28 with friendly, intelligent tone
 */

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
    rate: 0.95, // Slightly slower for clarity and friendliness
    pitch: 0.8, // Lower pitch for male voice (22-28 years)
    volume: 0.8,
    language: 'en-US'
  };

  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceQueue: SpeechOptions[] = [];
  private isInitialized = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();
    }
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

    // Priority order for male voices that sound young and friendly
    const preferredVoices = [
      // Modern English voices
      'Microsoft David - English (United States)',
      'Google US English Male',
      'Alex', // macOS
      'Microsoft Mark - English (United States)',
      'Daniel', // macOS UK
      'Tom', // macOS
      
      // Fallback to any male voice
      'Male',
      'Man',
      'David',
      'Mark',
      'Daniel',
      'Tom',
      'James',
      'Ryan',
      'Aaron'
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
    
    // Test voice with a greeting
    if (this.config.voice) {
      await this.speak({
        text: "Hello! I'm Gawin. I can now speak with you.",
        emotion: 'friendly'
      });
    }

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
   * Speak text with Gawin's voice
   */
  async speak(options: SpeechOptions): Promise<void> {
    if (!this.config.enabled || !this.synthesis || !this.config.voice) {
      console.log('🔇 Voice disabled or not available');
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
   * Speak immediately without queuing
   */
  private async speakNow(options: SpeechOptions): Promise<void> {
    if (!this.synthesis || !this.config.voice) return;

    // Clean text for speech (remove markdown, code blocks, etc.)
    const cleanText = this.cleanTextForSpeech(options.text);
    
    if (!cleanText.trim()) {
      // Continue processing queue
      setTimeout(() => this.processVoiceQueue(), 100);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    utterance.voice = this.config.voice;
    utterance.rate = this.adjustRateForEmotion(options.emotion);
    utterance.pitch = this.adjustPitchForEmotion(options.emotion);
    utterance.volume = this.config.volume;
    utterance.lang = options.language || this.config.language;

    // Set up event listeners
    utterance.onstart = () => {
      console.log('🎤 Gawin started speaking:', cleanText.substring(0, 50) + '...');
      this.callbacks.onStart?.();
    };

    utterance.onend = () => {
      console.log('🎤 Gawin finished speaking');
      this.currentUtterance = null;
      this.callbacks.onEnd?.();
      
      // Process next item in queue
      setTimeout(() => this.processVoiceQueue(), 200);
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      this.currentUtterance = null;
      this.callbacks.onError?.(event.error);
      
      // Continue processing queue even on error
      setTimeout(() => this.processVoiceQueue(), 500);
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
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
      
      // Clean up punctuation for natural pauses
      .replace(/[.]{2,}/g, '.') // Multiple periods
      .replace(/[!]{2,}/g, '!') // Multiple exclamations
      .replace(/[?]{2,}/g, '?') // Multiple questions
      
      .trim();
  }

  /**
   * Adjust speech rate based on emotion
   */
  private adjustRateForEmotion(emotion?: string): number {
    const baseRate = this.config.rate;
    
    switch (emotion) {
      case 'excited': return Math.min(1.2, baseRate + 0.2);
      case 'thoughtful': return Math.max(0.7, baseRate - 0.2);
      case 'empathetic': return Math.max(0.8, baseRate - 0.1);
      case 'friendly': return baseRate + 0.05;
      default: return baseRate;
    }
  }

  /**
   * Adjust pitch based on emotion
   */
  private adjustPitchForEmotion(emotion?: string): number {
    const basePitch = this.config.pitch;
    
    switch (emotion) {
      case 'excited': return Math.min(1.2, basePitch + 0.2);
      case 'friendly': return basePitch + 0.1;
      case 'thoughtful': return Math.max(0.6, basePitch - 0.1);
      case 'empathetic': return Math.max(0.7, basePitch - 0.05);
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
   * Test voice with sample text
   */
  async testVoice(): Promise<void> {
    await this.speak({
      text: "Hello! I'm Gawin, your AI learning companion. I'm here to help you learn and grow. How does my voice sound?",
      emotion: 'friendly',
      priority: 'high',
      interrupt: true
    });
  }
}

export const voiceService = new VoiceService();