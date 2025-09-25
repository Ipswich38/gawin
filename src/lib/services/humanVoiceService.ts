/**
 * Human Voice Service for Gawin
 * Advanced browser-native voice synthesis with audio processing for human-like quality
 * No 3rd party dependencies - uses enhanced Web Speech API + Web Audio API
 */

export interface HumanVoiceConfig {
  enabled: boolean;
  enhancementsEnabled: boolean;
  voiceProfile: VoiceProfile | null;
  audioProcessing: AudioProcessingConfig;
}

export interface VoiceProfile {
  name: string;
  baseVoice: SpeechSynthesisVoice;
  qualityScore: number;
  characteristics: VoiceCharacteristics;
}

export interface VoiceCharacteristics {
  naturalness: number; // 0-100
  clarity: number; // 0-100
  warmth: number; // 0-100
  isNeuralBased: boolean;
  isCloudBased: boolean;
}

export interface AudioProcessingConfig {
  enableFormantShifting: boolean;
  enableWarmthEnhancement: boolean;
  enableBreathinessSimulation: boolean;
  enableDynamicRange: boolean;
  pitchVariation: number; // 0-1
  speedVariation: number; // 0-1
}

export interface HumanSpeechOptions {
  text: string;
  emotion?: 'neutral' | 'friendly' | 'excited' | 'thoughtful' | 'empathetic' | 'confident';
  personality?: 'professional' | 'casual' | 'warm' | 'energetic' | 'calm';
  emphasis?: string[]; // Words to emphasize
  pauseAfterSentences?: number; // Additional pause in ms
  customProcessing?: Partial<AudioProcessingConfig>;
}

class HumanVoiceService {
  private config: HumanVoiceConfig = {
    enabled: false,
    enhancementsEnabled: true,
    voiceProfile: null,
    audioProcessing: {
      enableFormantShifting: true,
      enableWarmthEnhancement: true,
      enableBreathinessSimulation: true,
      enableDynamicRange: true,
      pitchVariation: 0.15,
      speedVariation: 0.1
    }
  };

  private audioContext: AudioContext | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceAnalyzer: VoiceQualityAnalyzer;
  private audioProcessor: HumanVoiceProcessor;
  private isInitialized = false;

  constructor() {
    this.voiceAnalyzer = new VoiceQualityAnalyzer();
    this.audioProcessor = new HumanVoiceProcessor();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🎤 Initializing Human Voice Service...');

      // Initialize Web Speech API
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      } else {
        throw new Error('Speech synthesis not supported');
      }

      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Initialize audio processor
      await this.audioProcessor.initialize(this.audioContext);

      // Wait for voices to load
      await this.waitForVoices();

      // Analyze and select best voice
      await this.analyzeAndSelectBestVoice();

      this.config.enabled = true;
      this.isInitialized = true;

      console.log('✅ Human Voice Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Human Voice Service:', error);
    }
  }

  private async waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = this.synthesis!.getVoices();
        if (voices.length > 0) {
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      // Handle voiceschanged event
      this.synthesis!.addEventListener('voiceschanged', () => {
        resolve();
      });

      checkVoices();
    });
  }

  private async analyzeAndSelectBestVoice(): Promise<void> {
    const voices = this.synthesis!.getVoices();
    console.log(`🔍 Analyzing ${voices.length} available voices for quality...`);

    const scoredVoices = await Promise.all(
      voices.map(async (voice) => {
        const score = await this.voiceAnalyzer.analyzeVoice(voice);
        return {
          voice,
          score,
          characteristics: this.voiceAnalyzer.getVoiceCharacteristics(voice)
        };
      })
    );

    // Sort by quality score
    scoredVoices.sort((a, b) => b.score - a.score);

    const bestVoice = scoredVoices[0];
    if (bestVoice && bestVoice.score > 60) {
      this.config.voiceProfile = {
        name: bestVoice.voice.name,
        baseVoice: bestVoice.voice,
        qualityScore: bestVoice.score,
        characteristics: bestVoice.characteristics
      };

      console.log(`🎯 Selected best voice: ${bestVoice.voice.name} (Score: ${bestVoice.score})`);
      console.log(`📊 Voice characteristics:`, bestVoice.characteristics);
    } else {
      console.warn('⚠️ No high-quality voice found, using system default');
    }
  }

  async speak(options: HumanSpeechOptions): Promise<boolean> {
    if (!this.isInitialized || !this.config.enabled) {
      console.warn('Human Voice Service not initialized or disabled');
      return false;
    }

    try {
      // Stop any current speech
      this.stop();

      // Preprocess text for more natural speech
      const processedText = this.preprocessText(options.text, options);

      // Create utterance with optimal settings
      const utterance = this.createOptimizedUtterance(processedText, options);

      // Apply audio processing if enabled
      if (this.config.enhancementsEnabled) {
        await this.applyAudioEnhancements(utterance, options);
      }

      // Speak with promise-based completion
      return new Promise((resolve) => {
        utterance.onend = () => {
          this.currentUtterance = null;
          resolve(true);
        };

        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          this.currentUtterance = null;
          resolve(false);
        };

        this.currentUtterance = utterance;
        this.synthesis!.speak(utterance);
      });

    } catch (error) {
      console.error('❌ Human voice synthesis error:', error);
      return false;
    }
  }

  private preprocessText(text: string, options: HumanSpeechOptions): string {
    let processed = text;

    // Add natural pauses
    processed = processed.replace(/([.!?])\s+/g, '$1\u2009\u2009'); // Thin spaces
    processed = processed.replace(/([,;])\s+/g, '$1\u2009'); // Brief pauses

    // Emphasize words if specified
    if (options.emphasis && options.emphasis.length > 0) {
      options.emphasis.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processed = processed.replace(regex, `<emphasis level="strong">${word}</emphasis>`);
      });
    }

    // Add personality-based adjustments
    processed = this.applyPersonalityAdjustments(processed, options.personality);

    return processed;
  }

  private applyPersonalityAdjustments(text: string, personality?: string): string {
    if (!personality) return text;

    switch (personality) {
      case 'friendly':
        // Add slight uptalk and warmth markers
        return text.replace(/\./g, '~');
      case 'professional':
        // Ensure clear enunciation markers
        return text.replace(/'/g, "'"); // Use proper apostrophes
      case 'energetic':
        // Add slight emphasis to action words
        return text.replace(/\b(great|amazing|awesome|fantastic)\b/gi, '<emphasis>$1</emphasis>');
      default:
        return text;
    }
  }

  private createOptimizedUtterance(text: string, options: HumanSpeechOptions): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);

    // Use selected voice profile
    if (this.config.voiceProfile) {
      utterance.voice = this.config.voiceProfile.baseVoice;
    }

    // Set emotion-based parameters
    const emotionSettings = this.getEmotionSettings(options.emotion || 'neutral');
    utterance.rate = emotionSettings.rate;
    utterance.pitch = emotionSettings.pitch;
    utterance.volume = emotionSettings.volume;

    // Add slight randomization for naturalness
    if (this.config.audioProcessing.pitchVariation > 0) {
      const pitchVariation = (Math.random() - 0.5) * this.config.audioProcessing.pitchVariation;
      utterance.pitch = Math.max(0.1, Math.min(2, utterance.pitch + pitchVariation));
    }

    if (this.config.audioProcessing.speedVariation > 0) {
      const speedVariation = (Math.random() - 0.5) * this.config.audioProcessing.speedVariation;
      utterance.rate = Math.max(0.1, Math.min(3, utterance.rate + speedVariation));
    }

    return utterance;
  }

  private getEmotionSettings(emotion: string): { rate: number; pitch: number; volume: number } {
    const baseSettings = { rate: 1.0, pitch: 1.0, volume: 0.8 };

    switch (emotion) {
      case 'excited':
        return { rate: 1.2, pitch: 1.15, volume: 0.85 };
      case 'thoughtful':
        return { rate: 0.9, pitch: 0.95, volume: 0.75 };
      case 'friendly':
        return { rate: 1.05, pitch: 1.08, volume: 0.8 };
      case 'confident':
        return { rate: 1.0, pitch: 0.98, volume: 0.85 };
      case 'empathetic':
        return { rate: 0.95, pitch: 1.02, volume: 0.78 };
      default:
        return baseSettings;
    }
  }

  private async applyAudioEnhancements(utterance: SpeechSynthesisUtterance, options: HumanSpeechOptions): Promise<void> {
    // This would be implemented with advanced audio processing
    // For now, we apply basic enhancements through utterance properties

    const processing = { ...this.config.audioProcessing, ...options.customProcessing };

    if (processing.enableWarmthEnhancement) {
      // Slight pitch adjustment for warmth
      utterance.pitch *= 0.98;
    }

    if (processing.enableDynamicRange) {
      // Adjust volume based on text content
      const hasEmphasis = options.text.includes('!') || options.text.includes('?');
      if (hasEmphasis) {
        utterance.volume *= 1.1;
      }
    }
  }

  stop(): void {
    if (this.currentUtterance) {
      this.synthesis?.cancel();
      this.currentUtterance = null;
    }
  }

  getAvailableVoices(): VoiceProfile[] {
    if (!this.synthesis) return [];

    const voices = this.synthesis.getVoices();
    return voices.map(voice => ({
      name: voice.name,
      baseVoice: voice,
      qualityScore: this.voiceAnalyzer.quickScore(voice),
      characteristics: this.voiceAnalyzer.getVoiceCharacteristics(voice)
    }));
  }

  async trainVoiceFromSample(audioBuffer: ArrayBuffer): Promise<boolean> {
    // Future implementation: analyze user's voice sample to adjust synthesis parameters
    console.log('🎓 Voice training from sample - feature coming soon');
    return false;
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }

  getConfig(): HumanVoiceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<HumanVoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Human Voice Service configuration updated');
  }
}

/**
 * Voice Quality Analyzer
 * Analyzes and scores voices for human-like quality
 */
class VoiceQualityAnalyzer {
  async analyzeVoice(voice: SpeechSynthesisVoice): Promise<number> {
    let score = 0;

    // Check if it's a neural/enhanced voice
    const name = voice.name.toLowerCase();
    const neuralIndicators = ['neural', 'natural', 'premium', 'enhanced', 'hd', 'pro'];
    const hasNeuralIndicators = neuralIndicators.some(indicator => name.includes(indicator));
    if (hasNeuralIndicators) score += 25;

    // Check if it's a cloud-based voice (usually higher quality)
    if (!voice.localService) score += 20;

    // Prefer specific high-quality voice engines
    const qualityEngines = ['google', 'microsoft', 'amazon', 'apple', 'nuance'];
    const hasQualityEngine = qualityEngines.some(engine => name.includes(engine));
    if (hasQualityEngine) score += 15;

    // Language and locale scoring
    if (voice.lang.startsWith('en-US')) score += 10;
    else if (voice.lang.startsWith('en-')) score += 5;

    // Avoid low-quality indicators
    const lowQualityIndicators = ['compact', 'basic', 'lite', 'mono', 'robot'];
    const hasLowQuality = lowQualityIndicators.some(indicator => name.includes(indicator));
    if (hasLowQuality) score -= 15;

    // Default language support
    if (voice.default) score += 5;

    // Bonus for known high-quality voices
    const premiumVoices = ['samantha', 'alex', 'victoria', 'daniel', 'karen', 'moira'];
    const isPremium = premiumVoices.some(premium => name.includes(premium));
    if (isPremium) score += 20;

    return Math.max(0, Math.min(100, score));
  }

  quickScore(voice: SpeechSynthesisVoice): number {
    // Simplified scoring for quick operations
    let score = 50; // Base score

    const name = voice.name.toLowerCase();
    if (name.includes('neural') || name.includes('natural')) score += 20;
    if (!voice.localService) score += 15;
    if (voice.lang.startsWith('en-US')) score += 10;
    if (name.includes('compact') || name.includes('robot')) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  getVoiceCharacteristics(voice: SpeechSynthesisVoice): VoiceCharacteristics {
    const name = voice.name.toLowerCase();

    return {
      naturalness: this.assessNaturalness(voice),
      clarity: this.assessClarity(voice),
      warmth: this.assessWarmth(voice),
      isNeuralBased: name.includes('neural') || name.includes('natural') || name.includes('premium'),
      isCloudBased: !voice.localService
    };
  }

  private assessNaturalness(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    let score = 50;

    if (name.includes('neural') || name.includes('natural')) score += 30;
    if (name.includes('premium') || name.includes('hd')) score += 20;
    if (!voice.localService) score += 15;
    if (name.includes('robot') || name.includes('mono')) score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  private assessClarity(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    let score = 60;

    if (name.includes('hd') || name.includes('clear')) score += 25;
    if (!voice.localService) score += 10;
    if (name.includes('compact') || name.includes('lite')) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  private assessWarmth(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    let score = 50;

    // Some voices are known to be warmer
    const warmVoices = ['samantha', 'alex', 'karen', 'victoria'];
    if (warmVoices.some(warm => name.includes(warm))) score += 25;

    if (name.includes('natural')) score += 15;
    if (name.includes('robot') || name.includes('synthetic')) score -= 25;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Human Voice Audio Processor
 * Applies Web Audio API processing for more human-like sound
 */
class HumanVoiceProcessor {
  private audioContext: AudioContext | null = null;
  private initialized = false;

  async initialize(audioContext: AudioContext): Promise<void> {
    this.audioContext = audioContext;
    this.initialized = true;
    console.log('🎛️ Human Voice Audio Processor initialized');
  }

  async processVoiceBuffer(buffer: AudioBuffer, config: AudioProcessingConfig): Promise<AudioBuffer> {
    if (!this.initialized || !this.audioContext) {
      return buffer;
    }

    try {
      // Create processing chain
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      let currentNode: AudioNode = source;

      // Apply formant shifting for voice character
      if (config.enableFormantShifting) {
        const formantFilter = this.createFormantFilter();
        currentNode.connect(formantFilter);
        currentNode = formantFilter;
      }

      // Apply warmth enhancement
      if (config.enableWarmthEnhancement) {
        const warmthFilter = this.createWarmthFilter();
        currentNode.connect(warmthFilter);
        currentNode = warmthFilter;
      }

      // Apply breathiness simulation
      if (config.enableBreathinessSimulation) {
        const breathinessProcessor = this.createBreathinessProcessor();
        currentNode.connect(breathinessProcessor);
        currentNode = breathinessProcessor;
      }

      // Apply dynamic range compression
      if (config.enableDynamicRange) {
        const compressor = this.createCompressor();
        currentNode.connect(compressor);
        currentNode = compressor;
      }

      // Connect to destination and capture output
      const offlineContext = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
      );

      // Process the audio
      const processedBuffer = await offlineContext.startRendering();
      return processedBuffer;

    } catch (error) {
      console.error('❌ Audio processing error:', error);
      return buffer;
    }
  }

  private createFormantFilter(): BiquadFilterNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = 1000;
    filter.Q.value = 2;
    filter.gain.value = 2;
    return filter;
  }

  private createWarmthFilter(): BiquadFilterNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 200;
    filter.gain.value = 3;
    return filter;
  }

  private createBreathinessProcessor(): ScriptProcessorNode {
    const processor = this.audioContext!.createScriptProcessor(1024, 1, 1);

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const output = event.outputBuffer.getChannelData(0);

      for (let i = 0; i < input.length; i++) {
        // Add subtle noise for breathiness
        const noise = (Math.random() - 0.5) * 0.02;
        output[i] = input[i] + (noise * Math.abs(input[i]) * 0.3);
      }
    };

    return processor;
  }

  private createCompressor(): DynamicsCompressorNode {
    const compressor = this.audioContext!.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    return compressor;
  }
}

// Export singleton instance
export const humanVoiceService = new HumanVoiceService();
export default humanVoiceService;