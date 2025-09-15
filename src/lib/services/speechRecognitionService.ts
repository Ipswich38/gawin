/**
 * Speech Recognition Service for Gawin
 * Provides real-time speech-to-text capabilities with bilingual support
 * Enhanced with Hugging Face models for better accuracy
 * Configured for natural conversation with automatic transcription
 */

import { huggingFaceService } from './huggingFaceService';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface RecognitionConfig {
  language: 'en-US' | 'en-PH' | 'fil-PH' | 'auto';
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  enabled: boolean;
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language?: string;
  timestamp: number;
}

export interface VoiceConversationSession {
  id: string;
  startTime: number;
  endTime?: number;
  transcripts: RecognitionResult[];
  responses: string[];
  language: string;
  isActive: boolean;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;
  private isInitialized = false;
  
  private config: RecognitionConfig = {
    language: 'auto',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    enabled: false
  };

  private currentSession: VoiceConversationSession | null = null;
  private isListening = false;
  private isProcessingVoice = false;
  private lastVoiceActivity = 0;
  private voiceInactivityTimer: NodeJS.Timeout | null = null;
  
  // Callbacks for real-time updates
  private callbacks: {
    onResult?: (result: RecognitionResult) => void;
    onFinalResult?: (result: RecognitionResult) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onVoiceStart?: () => void;
    onVoiceEnd?: () => void;
  } = {};

  // Auto-detection languages
  private languages = ['en-US', 'en-PH', 'fil-PH'];
  private currentLanguageIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
    }
  }

  /**
   * Initialize speech recognition system
   */
  private initializeSpeechRecognition(): void {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Speech recognition not supported in this browser');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.setupRecognitionConfig();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('🎤 Speech recognition initialized successfully');
  }

  /**
   * Configure speech recognition settings
   */
  private setupRecognitionConfig(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.getCurrentLanguage();
  }

  /**
   * Setup event listeners for speech recognition
   */
  private setupEventListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.isListening = false;
      this.callbacks.onEnd?.();
      
      // Auto-restart if still enabled (for continuous listening)
      if (this.config.enabled && this.config.continuous) {
        setTimeout(() => {
          if (this.config.enabled && !this.isListening) {
            this.startListening();
          }
        }, 100);
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech recognition error:', event.error);
      this.callbacks.onError?.(event.error);
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected, continuing to listen...');
      } else if (event.error === 'audio-capture') {
        console.error('❌ Microphone access denied');
        this.config.enabled = false;
      }
    };

    this.recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected');
      this.isProcessingVoice = true;
      this.callbacks.onVoiceStart?.();
    };

    this.recognition.onspeechend = () => {
      console.log('🔇 Speech ended');
      this.isProcessingVoice = false;
      this.callbacks.onVoiceEnd?.();
    };
  }

  /**
   * Handle recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const results = event.results;
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < results.length; i++) {
      const result = results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        
        const recognitionResult: RecognitionResult = {
          transcript: transcript.trim(),
          confidence: confidence || 0.8,
          isFinal: true,
          language: this.recognition?.lang,
          timestamp: Date.now()
        };

        // Add to current session
        if (this.currentSession) {
          this.currentSession.transcripts.push(recognitionResult);
        }

        console.log('✅ Final transcript:', recognitionResult.transcript);
        this.callbacks.onFinalResult?.(recognitionResult);
      } else {
        interimTranscript += transcript;
        
        const recognitionResult: RecognitionResult = {
          transcript: interimTranscript.trim(),
          confidence: confidence || 0.5,
          isFinal: false,
          language: this.recognition?.lang,
          timestamp: Date.now()
        };

        this.callbacks.onResult?.(recognitionResult);
      }
    }
  }

  /**
   * Start listening for speech
   */
  async startListening(): Promise<boolean> {
    if (!this.isSupported || !this.recognition) {
      console.error('❌ Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      console.log('🎤 Already listening...');
      return true;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      this.config.enabled = true;
      this.setupRecognitionConfig();
      this.recognition.start();
      
      // Create new session if none exists
      if (!this.currentSession) {
        this.createNewSession();
      }

      console.log('🎤 Started listening with language:', this.recognition.lang);
      return true;
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      this.callbacks.onError?.('Microphone access denied');
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    this.config.enabled = false;
    this.recognition.stop();
    
    // End current session
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.isActive = false;
    }

    console.log('🔇 Stopped listening');
  }

  /**
   * Toggle listening state
   */
  async toggleListening(): Promise<boolean> {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return await this.startListening();
    }
  }

  /**
   * Create new conversation session
   */
  private createNewSession(): void {
    this.currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      transcripts: [],
      responses: [],
      language: this.recognition?.lang || 'en-US',
      isActive: true
    };

    console.log('📝 Created new voice conversation session:', this.currentSession.id);
  }

  /**
   * Get current language setting
   */
  private getCurrentLanguage(): string {
    if (this.config.language === 'auto') {
      return this.languages[this.currentLanguageIndex];
    }
    return this.config.language;
  }

  /**
   * Switch to next language (for auto-detection)
   */
  switchLanguage(): void {
    if (this.config.language === 'auto') {
      this.currentLanguageIndex = (this.currentLanguageIndex + 1) % this.languages.length;
      
      if (this.recognition) {
        this.recognition.lang = this.getCurrentLanguage();
        console.log('🌐 Switched to language:', this.recognition.lang);
        
        // Restart recognition with new language
        if (this.isListening) {
          this.recognition.stop();
          setTimeout(() => {
            if (this.config.enabled) {
              this.startListening();
            }
          }, 100);
        }
      }
    }
  }

  /**
   * Set specific language
   */
  setLanguage(language: 'en-US' | 'en-PH' | 'fil-PH' | 'auto'): void {
    this.config.language = language;
    
    if (this.recognition) {
      this.recognition.lang = this.getCurrentLanguage();
      console.log('🌐 Language set to:', this.recognition.lang);
      
      // Restart recognition with new language
      if (this.isListening) {
        this.recognition.stop();
        setTimeout(() => {
          if (this.config.enabled) {
            this.startListening();
          }
        }, 100);
      }
    }
  }

  /**
   * Add Gawin's response to current session
   */
  addResponseToSession(response: string): void {
    if (this.currentSession) {
      this.currentSession.responses.push(response);
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onResult?: (result: RecognitionResult) => void;
    onFinalResult?: (result: RecognitionResult) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onVoiceStart?: () => void;
    onVoiceEnd?: () => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if speech recognition is supported
   */
  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if processing voice
   */
  isProcessingVoiceInput(): boolean {
    return this.isProcessingVoice;
  }

  /**
   * Get current session
   */
  getCurrentSession(): VoiceConversationSession | null {
    return this.currentSession;
  }

  /**
   * Get configuration
   */
  getConfig(): RecognitionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition) {
      this.setupRecognitionConfig();
    }
  }

  /**
   * Get last transcript
   */
  getLastTranscript(): string {
    if (!this.currentSession || this.currentSession.transcripts.length === 0) {
      return '';
    }
    
    const finalTranscripts = this.currentSession.transcripts.filter(t => t.isFinal);
    return finalTranscripts[finalTranscripts.length - 1]?.transcript || '';
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.isActive = false;
    }
    this.currentSession = null;
  }

  /**
   * Export session transcript
   */
  exportSessionTranscript(): string {
    if (!this.currentSession) return '';
    
    const sessionDuration = this.currentSession.endTime ? 
      this.currentSession.endTime - this.currentSession.startTime : 
      Date.now() - this.currentSession.startTime;
    
    const durationMinutes = Math.round(sessionDuration / 60000);
    
    let transcript = `# Voice Conversation Session\n\n`;
    transcript += `**Session ID:** ${this.currentSession.id}\n`;
    transcript += `**Duration:** ${durationMinutes} minutes\n`;
    transcript += `**Language:** ${this.currentSession.language}\n`;
    transcript += `**Date:** ${new Date(this.currentSession.startTime).toLocaleString()}\n\n`;
    
    transcript += `## Conversation\n\n`;
    
    this.currentSession.transcripts.filter(t => t.isFinal).forEach((result, index) => {
      const timestamp = new Date(result.timestamp).toLocaleTimeString();
      transcript += `**[${timestamp}] User:** ${result.transcript}\n`;
      
      if (this.currentSession!.responses[index]) {
        transcript += `**[${timestamp}] Gawin:** ${this.currentSession!.responses[index]}\n\n`;
      }
    });
    
    return transcript;
  }

  /**
   * Enhanced transcription using Hugging Face Whisper model
   */
  async enhanceTranscriptionWithHF(audioBlob: Blob): Promise<{
    transcript: string;
    confidence: number;
    language: string;
    emotion: string;
    intent: string;
  }> {
    try {
      if (huggingFaceService.hasProAccess()) {
        console.log('🤖 Using Hugging Face Pro for enhanced transcription');
        
        const enhancedResult = await huggingFaceService.enhanceVoiceRecognition(audioBlob);
        
        return {
          transcript: enhancedResult.transcription,
          confidence: enhancedResult.confidence,
          language: enhancedResult.language,
          emotion: enhancedResult.emotion || 'neutral',
          intent: enhancedResult.intent || 'conversation'
        };
      } else {
        // Fallback to basic analysis
        console.log('⚠️ Hugging Face Pro not available, using basic transcription');
        return {
          transcript: '',
          confidence: 0,
          language: 'en',
          emotion: 'neutral',
          intent: 'conversation'
        };
      }
    } catch (error) {
      console.error('❌ Enhanced transcription failed:', error);
      return {
        transcript: '',
        confidence: 0,
        language: 'en',
        emotion: 'neutral',
        intent: 'conversation'
      };
    }
  }

  /**
   * Analyze audio quality and suggest improvements
   */
  async analyzeAudioQuality(audioBlob: Blob): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    suggestions: string[];
    technicalDetails: any;
  }> {
    try {
      if (huggingFaceService.hasProAccess()) {
        const analysis = await huggingFaceService.analyzeAudio(audioBlob, 'classification');
        
        // Determine quality based on confidence and characteristics
        let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        const suggestions: string[] = [];
        
        if (analysis.confidence > 0.9) {
          quality = 'excellent';
        } else if (analysis.confidence > 0.7) {
          quality = 'good';
        } else if (analysis.confidence > 0.5) {
          quality = 'fair';
          suggestions.push('Consider speaking closer to the microphone');
          suggestions.push('Reduce background noise if possible');
        } else {
          quality = 'poor';
          suggestions.push('Check microphone connectivity');
          suggestions.push('Speak more clearly and slowly');
          suggestions.push('Reduce background noise');
        }

        return {
          quality,
          suggestions,
          technicalDetails: analysis
        };
      } else {
        return {
          quality: 'good',
          suggestions: ['Enable Hugging Face Pro for detailed audio analysis'],
          technicalDetails: null
        };
      }
    } catch (error) {
      console.error('❌ Audio quality analysis failed:', error);
      return {
        quality: 'fair',
        suggestions: ['Unable to analyze audio quality'],
        technicalDetails: null
      };
    }
  }

  /**
   * Get intelligent language detection and switching recommendations
   */
  async getLanguageRecommendations(recentTranscripts: string[]): Promise<{
    detectedLanguage: string;
    confidence: number;
    recommendation: string;
    supportedLanguages: string[];
  }> {
    try {
      if (recentTranscripts.length === 0) {
        return {
          detectedLanguage: 'en',
          confidence: 0.5,
          recommendation: 'Start speaking to detect language',
          supportedLanguages: ['en-US', 'en-PH', 'fil-PH']
        };
      }

      const combinedText = recentTranscripts.join(' ');
      
      if (huggingFaceService.hasProAccess()) {
        const textAnalysis = await huggingFaceService.analyzeText(combinedText, 'classification');
        
        // Analyze for language patterns
        const hasTagalog = /\b(ako|ikaw|tayo|oo|hindi|kumusta|salamat|kasi|naman|lang)\b/i.test(combinedText);
        const hasEnglish = /\b(the|and|you|me|this|that|what|how|when|where)\b/i.test(combinedText);
        
        let detectedLanguage = 'en-US';
        let confidence = 0.7;
        let recommendation = 'Language detection active';
        
        if (hasTagalog && hasEnglish) {
          detectedLanguage = 'en-PH'; // Taglish
          confidence = 0.8;
          recommendation = 'Taglish detected - bilingual mode active';
        } else if (hasTagalog) {
          detectedLanguage = 'fil-PH';
          confidence = 0.8;
          recommendation = 'Filipino/Tagalog detected';
        } else if (hasEnglish) {
          detectedLanguage = 'en-US';
          confidence = 0.8;
          recommendation = 'English detected';
        }

        return {
          detectedLanguage,
          confidence,
          recommendation,
          supportedLanguages: ['en-US', 'en-PH', 'fil-PH', 'auto']
        };
      } else {
        return {
          detectedLanguage: 'en-US',
          confidence: 0.6,
          recommendation: 'Basic language detection active',
          supportedLanguages: ['en-US', 'en-PH', 'fil-PH', 'auto']
        };
      }
    } catch (error) {
      console.error('❌ Language recommendation failed:', error);
      return {
        detectedLanguage: 'en-US',
        confidence: 0.5,
        recommendation: 'Language detection error',
        supportedLanguages: ['en-US', 'en-PH', 'fil-PH', 'auto']
      };
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();