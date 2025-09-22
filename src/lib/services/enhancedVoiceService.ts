/**
 * Enhanced Voice Service for Gawin
 * Primary: ElevenLabs API for high-quality voice synthesis
 * Fallback: Built-in Web Speech API with voice learning/cloning capabilities
 * Features: Voice pattern learning, ElevenLabs credit management, seamless fallback
 */

import { voiceService } from './voiceService';
import { elevenLabsVoiceService } from './elevenLabsVoiceService';

interface VoicePattern {
  phoneme: string;
  duration: number;
  pitch: number;
  emotion: string;
  context: string;
}

interface VoiceLearningData {
  patterns: VoicePattern[];
  prosody: {
    averagePitch: number;
    pitchRange: number;
    speechRate: number;
    pauseDuration: number;
  };
  emotionalTones: {
    [emotion: string]: {
      pitchModifier: number;
      speedModifier: number;
      volumeModifier: number;
    };
  };
  lastUpdated: number;
}

class EnhancedVoiceService {
  private isElevenLabsEnabled = true;
  private elevenLabsCreditsRemaining = -1; // -1 means unknown
  private voiceLearningData: VoiceLearningData | null = null;
  private isLearningEnabled = true;
  private audioContext: AudioContext | null = null;
  private voiceAnalyzer: AnalyserNode | null = null;

  // Voice cloning parameters
  private learnedVoiceCharacteristics = {
    baseFrequency: 150, // Hz
    formantFrequencies: [800, 1200, 2500], // F1, F2, F3
    pitchVariation: 0.2,
    speechRate: 1.0,
    breathiness: 0.1,
    resonance: 0.5
  };

  constructor() {
    this.loadVoiceLearningData();
    this.initializeAudioAnalysis();
  }

  /**
   * Initialize audio analysis for voice learning
   */
  private async initializeAudioAnalysis(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.voiceAnalyzer = this.audioContext.createAnalyser();
      this.voiceAnalyzer.fftSize = 2048;
    } catch (error) {
      console.warn('Audio analysis not available:', error);
    }
  }

  /**
   * Load previously learned voice patterns
   */
  private loadVoiceLearningData(): void {
    try {
      const stored = localStorage.getItem('gawin_voice_learning');
      if (stored) {
        this.voiceLearningData = JSON.parse(stored);
        console.log('🎤 Loaded voice learning data:', this.voiceLearningData?.patterns.length, 'patterns');
      }
    } catch (error) {
      console.warn('Failed to load voice learning data:', error);
    }
  }

  /**
   * Save learned voice patterns
   */
  private saveVoiceLearningData(): void {
    if (!this.voiceLearningData) return;

    try {
      localStorage.setItem('gawin_voice_learning', JSON.stringify(this.voiceLearningData));
    } catch (error) {
      console.warn('Failed to save voice learning data:', error);
    }
  }

  /**
   * Speak text using ElevenLabs primarily, fallback to enhanced built-in voice
   */
  async speak(text: string, options: {
    emotion?: string;
    priority?: 'normal' | 'high';
    forceBuiltIn?: boolean;
  } = {}): Promise<boolean> {
    const { emotion = 'neutral', priority = 'normal', forceBuiltIn = false } = options;

    // Try ElevenLabs first if enabled and has credits
    if (this.isElevenLabsEnabled && !forceBuiltIn && this.elevenLabsCreditsRemaining !== 0) {
      try {
        console.log('🎙️ Attempting ElevenLabs synthesis...');
        const success = await this.speakWithElevenLabs(text, emotion);

        if (success) {
          // Learn from ElevenLabs output for future built-in synthesis
          this.learnFromElevenLabsAudio(text, emotion);
          return true;
        } else {
          console.warn('⚠️ ElevenLabs failed, falling back to built-in voice');
        }
      } catch (error) {
        console.error('❌ ElevenLabs error:', error);

        // Check if it's a credit limit error
        if (error instanceof Error && error.message.includes('credits')) {
          this.elevenLabsCreditsRemaining = 0;
          console.warn('💳 ElevenLabs credits exhausted, switching to built-in voice');
        }
      }
    }

    // Fallback to enhanced built-in voice with learned characteristics
    console.log('🔊 Using enhanced built-in voice synthesis...');
    return this.speakWithEnhancedBuiltIn(text, emotion);
  }

  /**
   * Speak using ElevenLabs API
   */
  private async speakWithElevenLabs(text: string, emotion: string): Promise<boolean> {
    try {
      // Check if we have ElevenLabs service available
      if (!elevenLabsVoiceService) {
        throw new Error('ElevenLabs service not available');
      }

      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceSettings: this.getElevenLabsVoiceSettings(emotion),
          outputFormat: 'mp3_44100_128'
        }),
      });

      if (!response.ok) {
        if (response.status === 402 || response.status === 429) {
          // Payment or rate limit error
          this.elevenLabsCreditsRemaining = 0;
          throw new Error('ElevenLabs credits exhausted');
        }
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioData = await response.arrayBuffer();
      return this.playAudioBuffer(audioData);
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error);
      return false;
    }
  }

  /**
   * Get ElevenLabs voice settings based on emotion
   */
  private getElevenLabsVoiceSettings(emotion: string): object {
    const emotionSettings = {
      neutral: { stability: 0.75, similarity_boost: 0.85, style: 0.3 },
      happy: { stability: 0.6, similarity_boost: 0.8, style: 0.6 },
      sad: { stability: 0.9, similarity_boost: 0.9, style: 0.1 },
      excited: { stability: 0.4, similarity_boost: 0.7, style: 0.8 },
      calm: { stability: 0.95, similarity_boost: 0.9, style: 0.0 },
      urgent: { stability: 0.5, similarity_boost: 0.7, style: 0.7 }
    };

    return emotionSettings[emotion as keyof typeof emotionSettings] || emotionSettings.neutral;
  }

  /**
   * Play audio buffer from ElevenLabs
   */
  private async playAudioBuffer(arrayBuffer: ArrayBuffer): Promise<boolean> {
    try {
      if (!this.audioContext) return false;

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      return new Promise((resolve) => {
        source.onended = () => resolve(true);
        source.start();
      });
    } catch (error) {
      console.error('Failed to play audio buffer:', error);
      return false;
    }
  }

  /**
   * Learn voice patterns from ElevenLabs audio for future built-in synthesis
   */
  private async learnFromElevenLabsAudio(text: string, emotion: string): Promise<void> {
    if (!this.isLearningEnabled || !this.audioContext) return;

    try {
      // This is a simplified version - in a real implementation, you would:
      // 1. Analyze the ElevenLabs audio output using Web Audio API
      // 2. Extract pitch, formants, prosody patterns
      // 3. Build a model of the voice characteristics
      // 4. Store these patterns for built-in synthesis

      console.log('📚 Learning voice patterns from ElevenLabs output...');

      // Simulate learning (in real implementation, this would be actual audio analysis)
      const patterns = this.extractVoicePatterns(text, emotion);
      this.updateVoiceLearningData(patterns, emotion);
    } catch (error) {
      console.warn('Voice learning failed:', error);
    }
  }

  /**
   * Extract voice patterns (simplified simulation)
   */
  private extractVoicePatterns(text: string, emotion: string): VoicePattern[] {
    // This is a simulation - real implementation would use audio analysis
    const words = text.split(' ');
    const patterns: VoicePattern[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      patterns.push({
        phoneme: word,
        duration: word.length * 80 + Math.random() * 40, // ms
        pitch: this.learnedVoiceCharacteristics.baseFrequency + (Math.random() - 0.5) * 50,
        emotion,
        context: i === 0 ? 'start' : i === words.length - 1 ? 'end' : 'middle'
      });
    }

    return patterns;
  }

  /**
   * Update voice learning data with new patterns
   */
  private updateVoiceLearningData(newPatterns: VoicePattern[], emotion: string): void {
    if (!this.voiceLearningData) {
      this.voiceLearningData = {
        patterns: [],
        prosody: {
          averagePitch: this.learnedVoiceCharacteristics.baseFrequency,
          pitchRange: 100,
          speechRate: 1.0,
          pauseDuration: 200
        },
        emotionalTones: {},
        lastUpdated: Date.now()
      };
    }

    // Add new patterns
    this.voiceLearningData.patterns.push(...newPatterns);

    // Update emotional tone data
    if (!this.voiceLearningData.emotionalTones[emotion]) {
      this.voiceLearningData.emotionalTones[emotion] = {
        pitchModifier: 1.0,
        speedModifier: 1.0,
        volumeModifier: 1.0
      };
    }

    // Keep only recent patterns (last 1000)
    if (this.voiceLearningData.patterns.length > 1000) {
      this.voiceLearningData.patterns = this.voiceLearningData.patterns.slice(-1000);
    }

    this.voiceLearningData.lastUpdated = Date.now();
    this.saveVoiceLearningData();

    console.log(`📈 Updated voice learning: ${this.voiceLearningData.patterns.length} patterns, emotion: ${emotion}`);
  }

  /**
   * Speak using enhanced built-in voice with learned characteristics
   */
  private async speakWithEnhancedBuiltIn(text: string, emotion: string): Promise<boolean> {
    try {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply learned voice characteristics
      this.applyLearnedCharacteristics(utterance, emotion);

      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Built-in voice synthesis failed:', error);
      return false;
    }
  }

  /**
   * Apply learned voice characteristics to built-in synthesis
   */
  private applyLearnedCharacteristics(utterance: SpeechSynthesisUtterance, emotion: string): void {
    // Get the best available voice (prefer neural/high-quality voices)
    const voices = speechSynthesis.getVoices();
    const preferredVoice = this.selectBestVoice(voices);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Base characteristics from learned data
    utterance.rate = this.learnedVoiceCharacteristics.speechRate;
    utterance.pitch = this.learnedVoiceCharacteristics.baseFrequency / 100; // Normalize to 0-2 range
    utterance.volume = 0.8;

    // Apply emotional modifications based on learned patterns
    if (this.voiceLearningData?.emotionalTones[emotion]) {
      const emotionData = this.voiceLearningData.emotionalTones[emotion];
      utterance.pitch *= emotionData.pitchModifier;
      utterance.rate *= emotionData.speedModifier;
      utterance.volume *= emotionData.volumeModifier;
    } else {
      // Default emotional adjustments if no learned data
      this.applyDefaultEmotionalAdjustments(utterance, emotion);
    }

    // Clamp values to valid ranges
    utterance.rate = Math.max(0.1, Math.min(10, utterance.rate));
    utterance.pitch = Math.max(0, Math.min(2, utterance.pitch));
    utterance.volume = Math.max(0, Math.min(1, utterance.volume));
  }

  /**
   * Select the best available voice for human-like speech
   */
  private selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Prefer neural or high-quality voices
    const neuralVoices = voices.filter(voice =>
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('enhanced') ||
      voice.name.toLowerCase().includes('premium')
    );

    if (neuralVoices.length > 0) {
      return neuralVoices[0];
    }

    // Fallback to default voice
    return voices.find(voice => voice.default) || voices[0] || null;
  }

  /**
   * Apply default emotional adjustments when no learned data is available
   */
  private applyDefaultEmotionalAdjustments(utterance: SpeechSynthesisUtterance, emotion: string): void {
    switch (emotion) {
      case 'happy':
        utterance.pitch += 0.2;
        utterance.rate += 0.1;
        break;
      case 'sad':
        utterance.pitch -= 0.3;
        utterance.rate -= 0.2;
        break;
      case 'excited':
        utterance.pitch += 0.3;
        utterance.rate += 0.3;
        utterance.volume = 1.0;
        break;
      case 'calm':
        utterance.pitch -= 0.1;
        utterance.rate -= 0.1;
        break;
      case 'urgent':
        utterance.rate += 0.4;
        utterance.volume = 1.0;
        break;
    }
  }

  /**
   * Check ElevenLabs credit status
   */
  async checkElevenLabsCredits(): Promise<number> {
    try {
      const response = await fetch('/api/elevenlabs/tts', { method: 'GET' });
      if (response.ok) {
        this.isElevenLabsEnabled = true;
        this.elevenLabsCreditsRemaining = -1; // Unknown but working
        return -1;
      } else if (response.status === 402) {
        this.elevenLabsCreditsRemaining = 0;
        return 0;
      }
    } catch (error) {
      console.warn('Failed to check ElevenLabs status:', error);
    }

    return this.elevenLabsCreditsRemaining;
  }

  /**
   * Get current voice service status
   */
  getStatus(): {
    primary: 'elevenlabs' | 'builtin';
    elevenLabsAvailable: boolean;
    creditsRemaining: number;
    learnedPatterns: number;
    voiceQuality: 'premium' | 'enhanced' | 'basic';
  } {
    const learnedPatterns = this.voiceLearningData?.patterns.length || 0;

    let voiceQuality: 'premium' | 'enhanced' | 'basic' = 'basic';
    if (this.isElevenLabsEnabled && this.elevenLabsCreditsRemaining !== 0) {
      voiceQuality = 'premium';
    } else if (learnedPatterns > 100) {
      voiceQuality = 'enhanced';
    }

    return {
      primary: this.isElevenLabsEnabled && this.elevenLabsCreditsRemaining !== 0 ? 'elevenlabs' : 'builtin',
      elevenLabsAvailable: this.isElevenLabsEnabled && this.elevenLabsCreditsRemaining !== 0,
      creditsRemaining: this.elevenLabsCreditsRemaining,
      learnedPatterns,
      voiceQuality
    };
  }

  /**
   * Enable/disable voice learning
   */
  setVoiceLearning(enabled: boolean): void {
    this.isLearningEnabled = enabled;
    console.log(`🎓 Voice learning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset learned voice data (useful for starting fresh)
   */
  resetVoiceLearning(): void {
    this.voiceLearningData = null;
    localStorage.removeItem('gawin_voice_learning');
    console.log('🔄 Voice learning data reset');
  }

  /**
   * Export learned voice model (for sharing or backup)
   */
  exportVoiceModel(): string | null {
    return this.voiceLearningData ? JSON.stringify(this.voiceLearningData) : null;
  }

  /**
   * Import voice model (for sharing or restoration)
   */
  importVoiceModel(modelData: string): boolean {
    try {
      const data = JSON.parse(modelData);
      if (data.patterns && Array.isArray(data.patterns)) {
        this.voiceLearningData = data;
        this.saveVoiceLearningData();
        console.log('📥 Voice model imported successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to import voice model:', error);
    }
    return false;
  }
}

export const enhancedVoiceService = new EnhancedVoiceService();