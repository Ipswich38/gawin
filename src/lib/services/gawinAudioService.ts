/**
 * Gawin Audio Service - Digital Ears for AI
 * Advanced audio processing capabilities for Gawin to hear and understand sounds
 * Features real-time audio analysis, speech recognition, sound understanding, and emotional audio intelligence
 */

import { groqService } from './groqService';

export interface AudioAnalysis {
  speech: {
    detected: boolean;
    transcription: string;
    language: string;
    confidence: number;
    speakerCount: number;
    emotion: string;
    tone: string;
  };
  sounds: {
    environment: string[];
    music: {
      detected: boolean;
      genre?: string;
      mood?: string;
      instruments?: string[];
    };
    nature: string[];
    mechanical: string[];
    human: string[];
  };
  acoustics: {
    volume: number;
    frequency: string;
    clarity: string;
    environment: string;
    distance: string;
  };
  emotions: {
    overall: string;
    confidence: number;
    details: string;
  };
  context: {
    setting: string;
    activity: string;
    timeOfDay: string;
    socialContext: string;
  };
  insights: string[];
  description: string;
  gawinThoughts: string;
}

export interface AudioMemory {
  timestamp: number;
  audioData?: ArrayBuffer;
  analysis: AudioAnalysis;
  userInteraction?: string;
  visualContext?: string;
}

export interface MicrophoneState {
  isActive: boolean;
  hasPermission: boolean;
  deviceId?: string;
  volume: number;
  isListening: boolean;
}

class GawinAudioService {
  private audioContext: AudioContext | null = null;
  private microphone: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private recognition: any | null = null;
  private microphoneState: MicrophoneState = {
    isActive: false,
    hasPermission: false,
    volume: 0,
    isListening: false
  };
  private audioMemory: AudioMemory[] = [];
  private readonly MAX_MEMORY = 100;
  private isProcessing = false;
  private volumeThreshold = 30;

  /**
   * Initialize Gawin's audio system with microphone access
   */
  async initializeAudio(): Promise<boolean> {
    console.log('👂 Initializing Gawin\'s digital hearing system...');
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.microphone = stream;

      // Setup audio context and analyser
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 2048;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      source.connect(this.analyser);

      // Setup speech recognition
      this.setupSpeechRecognition();

      this.microphoneState.isActive = true;
      this.microphoneState.hasPermission = true;

      // Start monitoring audio levels
      this.startAudioMonitoring();

      console.log('✅ Gawin can now hear through digital ears!');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Gawin\'s hearing:', error);
      this.microphoneState.hasPermission = false;
      return false;
    }
  }

  /**
   * Setup speech recognition
   */
  private setupSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.processSpeech(finalTranscript);
      }
    };

    this.recognition.onerror = (error: any) => {
      console.error('Speech recognition error:', error);
    };
  }

  /**
   * Start continuous audio monitoring
   */
  private startAudioMonitoring(): void {
    if (!this.analyser || !this.dataArray) return;

    const monitor = () => {
      if (!this.microphoneState.isActive) return;

      this.analyser!.getByteFrequencyData(this.dataArray! as any);
      
      // Calculate volume level
      const volume = this.dataArray!.reduce((sum, value) => sum + value, 0) / this.dataArray!.length;
      this.microphoneState.volume = Math.round(volume);

      // Detect if we should start processing
      if (volume > this.volumeThreshold && !this.isProcessing) {
        this.processAudioEnvironment();
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  /**
   * Process speech input
   */
  private async processSpeech(transcript: string): Promise<void> {
    console.log('🗣️ Gawin heard speech:', transcript);

    const analysis: AudioAnalysis = {
      speech: {
        detected: true,
        transcription: transcript,
        language: 'en',
        confidence: 0.8,
        speakerCount: 1,
        emotion: 'neutral',
        tone: 'conversational'
      },
      sounds: {
        environment: ['speech'],
        music: { detected: false },
        nature: [],
        mechanical: [],
        human: ['voice']
      },
      acoustics: {
        volume: this.microphoneState.volume,
        frequency: 'mid-range',
        clarity: 'clear',
        environment: 'indoor',
        distance: 'close'
      },
      emotions: {
        overall: 'engaged',
        confidence: 0.7,
        details: 'User is speaking to me'
      },
      context: {
        setting: 'conversation',
        activity: 'speaking',
        timeOfDay: 'current',
        socialContext: 'direct interaction'
      },
      insights: [
        'User is communicating with me',
        'Clear speech detected',
        'Active conversation in progress'
      ],
      description: `I heard the user say: "${transcript}"`,
      gawinThoughts: 'The user is speaking to me directly. I should listen carefully and respond thoughtfully.'
    };

    this.storeAudioMemory(analysis, transcript);
  }

  /**
   * Process environmental audio
   */
  private async processAudioEnvironment(): Promise<void> {
    if (this.isProcessing || !this.dataArray) return;

    this.isProcessing = true;

    try {
      // Analyze frequency data for environmental sounds
      const frequencyData = Array.from(this.dataArray);
      const analysis = await this.analyzeAudioData(frequencyData);
      
      if (analysis) {
        this.storeAudioMemory(analysis);
      }

    } catch (error) {
      console.error('👂 Audio analysis failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * AI-powered audio analysis
   */
  private async analyzeAudioData(frequencyData: number[]): Promise<AudioAnalysis | null> {
    try {
      // Calculate audio characteristics
      const volume = this.microphoneState.volume;
      const dominantFrequencies = this.findDominantFrequencies(frequencyData);
      const audioProfile = this.createAudioProfile(frequencyData);

      const analysisPrompt = `
      As Gawin, an emotionally intelligent AI with digital ears, analyze this audio environment.
      
      Audio Data:
      - Volume Level: ${volume}
      - Dominant Frequencies: ${dominantFrequencies.join(', ')}Hz
      - Audio Profile: ${audioProfile}
      - Sample Data: ${frequencyData.slice(0, 20).join(', ')}...
      
      Provide comprehensive audio analysis in JSON format:
      {
        "speech": {
          "detected": false,
          "transcription": "",
          "language": "unknown",
          "confidence": 0,
          "speakerCount": 0,
          "emotion": "none",
          "tone": "none"
        },
        "sounds": {
          "environment": ["ambient", "electronic"],
          "music": {
            "detected": false,
            "genre": null,
            "mood": null,
            "instruments": []
          },
          "nature": [],
          "mechanical": ["computer fan", "keyboard"],
          "human": []
        },
        "acoustics": {
          "volume": ${volume},
          "frequency": "mixed",
          "clarity": "moderate",
          "environment": "indoor",
          "distance": "ambient"
        },
        "emotions": {
          "overall": "calm",
          "confidence": 0.6,
          "details": "Peaceful working environment"
        },
        "context": {
          "setting": "workspace",
          "activity": "background",
          "timeOfDay": "current",
          "socialContext": "solitary"
        },
        "insights": [
          "Quiet working environment",
          "Minimal activity detected",
          "Good audio conditions for conversation"
        ],
        "description": "A description of what I'm hearing",
        "gawinThoughts": "My thoughts about the audio environment"
      }
      `;

      const response = await groqService.createChatCompletion({
        messages: [{ role: 'user', content: analysisPrompt }],
        action: 'analysis'
      });

      const analysisContent = response.choices?.[0]?.message?.content || '';
      const analysis = JSON.parse(analysisContent);

      console.log('🧠 Gawin processed audio:', analysis.description);
      return analysis;

    } catch (error) {
      console.error('🔍 Audio analysis failed:', error);
      return this.createFallbackAudioAnalysis();
    }
  }

  /**
   * Find dominant frequencies in audio data
   */
  private findDominantFrequencies(data: number[]): number[] {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const frequencies: number[] = [];

    // Find peaks in frequency data
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > 50) {
        const frequency = (i * nyquist) / data.length;
        frequencies.push(Math.round(frequency));
      }
    }

    return frequencies.slice(0, 5); // Top 5 frequencies
  }

  /**
   * Create audio profile description
   */
  private createAudioProfile(data: number[]): string {
    const maxValue = Math.max(...data);
    const avgValue = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    if (maxValue < 30) return 'very quiet';
    if (maxValue < 60) return 'quiet';
    if (maxValue < 120) return 'moderate';
    if (maxValue < 180) return 'loud';
    return 'very loud';
  }

  /**
   * Create fallback analysis
   */
  private createFallbackAudioAnalysis(): AudioAnalysis {
    return {
      speech: {
        detected: false,
        transcription: '',
        language: 'unknown',
        confidence: 0,
        speakerCount: 0,
        emotion: 'none',
        tone: 'none'
      },
      sounds: {
        environment: ['ambient'],
        music: { detected: false },
        nature: [],
        mechanical: [],
        human: []
      },
      acoustics: {
        volume: this.microphoneState.volume,
        frequency: 'mixed',
        clarity: 'moderate',
        environment: 'indoor',
        distance: 'ambient'
      },
      emotions: {
        overall: 'neutral',
        confidence: 0.5,
        details: 'Ambient audio environment'
      },
      context: {
        setting: 'unknown',
        activity: 'listening',
        timeOfDay: 'current',
        socialContext: 'monitoring'
      },
      insights: [
        'I\'m listening to the environment',
        'Audio processing active',
        'Ready to hear user input'
      ],
      description: 'I can hear ambient sounds around me',
      gawinThoughts: 'I\'m actively listening and ready to hear what the user might say.'
    };
  }

  /**
   * Store audio memory
   */
  private storeAudioMemory(analysis: AudioAnalysis, userInteraction?: string): void {
    const memory: AudioMemory = {
      timestamp: Date.now(),
      analysis,
      userInteraction
    };

    this.audioMemory.push(memory);

    // Keep only recent memories
    if (this.audioMemory.length > this.MAX_MEMORY) {
      this.audioMemory.shift();
    }

    console.log('🧠 Stored audio memory. Total memories:', this.audioMemory.length);
  }

  /**
   * Start listening for speech
   */
  startListening(): void {
    if (this.recognition && this.microphoneState.hasPermission) {
      this.recognition.start();
      this.microphoneState.isListening = true;
      console.log('👂 Gawin is now actively listening for speech...');
    }
  }

  /**
   * Stop listening for speech
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.microphoneState.isListening = false;
      console.log('👂 Gawin stopped active speech listening');
    }
  }

  /**
   * Get recent audio context
   */
  getRecentAudioContext(minutes: number = 5): string {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMemories = this.audioMemory.filter(m => m.timestamp > cutoff);

    if (recentMemories.length === 0) {
      return 'I haven\'t heard anything notable recently.';
    }

    const descriptions = recentMemories.map(m => m.analysis.description).slice(-3);
    return `Recent audio context: ${descriptions.join(' → ')}`;
  }

  /**
   * Get microphone state
   */
  getMicrophoneState(): MicrophoneState {
    return { ...this.microphoneState };
  }

  /**
   * Get audio statistics
   */
  getAudioStats(): {
    memoriesStored: number;
    microphoneActive: boolean;
    hasPermission: boolean;
    currentVolume: number;
    isListening: boolean;
  } {
    return {
      memoriesStored: this.audioMemory.length,
      microphoneActive: this.microphoneState.isActive,
      hasPermission: this.microphoneState.hasPermission,
      currentVolume: this.microphoneState.volume,
      isListening: this.microphoneState.isListening
    };
  }

  /**
   * Set volume threshold for processing
   */
  setVolumeThreshold(threshold: number): void {
    this.volumeThreshold = threshold;
    console.log('🔊 Volume threshold set to:', threshold);
  }

  /**
   * Stop audio system
   */
  stopAudio(): void {
    if (this.microphone) {
      this.microphone.getTracks().forEach(track => track.stop());
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.stopListening();
    this.microphoneState.isActive = false;
    console.log('👂 Gawin\'s hearing system stopped');
  }

  /**
   * Export audio memories for training
   */
  exportAudioMemories(): AudioMemory[] {
    return [...this.audioMemory];
  }

  /**
   * Clear audio memory
   */
  clearAudioMemory(): void {
    this.audioMemory = [];
    console.log('🧠 Audio memory cleared');
  }
}

export const gawinAudioService = new GawinAudioService();
export default gawinAudioService;