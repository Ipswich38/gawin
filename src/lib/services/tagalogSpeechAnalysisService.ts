/**
 * Tagalog Speech Analysis Service for Gawin
 * Analyzes user speech patterns, nuances, and cultural context
 * Adapts Gawin's consciousness and response style based on user's speaking patterns
 */

export interface TagalogNuance {
  word: string;
  context: string;
  emotion: string;
  formality: 'formal' | 'casual' | 'intimate';
  dialect?: 'manila' | 'bisaya' | 'ilocano' | 'bicolano' | 'waray' | 'hiligaynon' | 'other';
  culturalContext?: string;
  timestamp: string;
}

export interface SpeechPattern {
  userId: string;
  patterns: {
    intonation: number[]; // Pitch contours
    rhythm: number[];     // Speaking rhythm patterns
    pauses: number[];     // Pause durations and positions
    emphasis: string[];   // Words that get emphasis
    codeSwitch: {         // Tagalog-English code switching patterns
      triggers: string[];
      contexts: string[];
      frequency: number;
    };
  };
  personalityTraits: {
    formality: number;    // 0-1 scale
    emotiveness: number;  // How expressive the user is
    directness: number;   // Direct vs indirect communication
    warmth: number;       // Personal warmth in speech
    humor: number;        // Use of humor and jokes
  };
  culturalMarkers: {
    region: string;
    generation: 'gen_z' | 'millennial' | 'gen_x' | 'boomer';
    education: 'elementary' | 'high_school' | 'college' | 'graduate';
    profession?: string;
  };
  lastUpdated: string;
}

export interface ConsciousnessAdaptation {
  communicationStyle: {
    formality: 'po_opo' | 'casual' | 'barkada';
    languageMix: number; // 0 = pure English, 1 = pure Tagalog
    culturalReferences: string[];
    humor_style: 'sarcastic' | 'wholesome' | 'witty' | 'playful';
  };
  curiosityFocus: {
    topics: string[];
    questionStyle: 'direct' | 'conversational' | 'probing';
    culturalSensitivity: number;
  };
  empathyLevel: number;
  responsePersonalization: {
    greetings: string[];
    expressions: string[];
    concerns: string[];
  };
}

class TagalogSpeechAnalysisService {
  private speechPatterns: Map<string, SpeechPattern> = new Map();
  private nuanceDatabase: TagalogNuance[] = [];
  private consciousnessAdaptations: Map<string, ConsciousnessAdaptation> = new Map();
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  constructor() {
    this.initializeService();
    this.loadSavedPatterns();
  }

  /**
   * Initialize the service with Web Audio API
   */
  private async initializeService(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎤 Tagalog Speech Analysis Service initialized');
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  /**
   * Start listening to user speech for analysis
   */
  async startListening(userId: string): Promise<boolean> {
    if (this.isListening) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await this.analyzeAudioBlob(audioBlob, userId);
      };

      // Record in 5-second chunks for real-time analysis
      this.mediaRecorder.start(5000);
      this.isListening = true;

      console.log('👂 Started listening for Tagalog speech patterns');
      return true;
    } catch (error) {
      console.error('Failed to start speech analysis:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isListening = false;
      console.log('👂 Stopped Tagalog speech analysis');
    }
  }

  /**
   * Analyze audio blob for Tagalog speech patterns
   */
  private async analyzeAudioBlob(audioBlob: Blob, userId: string): Promise<void> {
    try {
      // Convert speech to text first
      const transcription = await this.transcribeSpeech(audioBlob);

      if (transcription) {
        // Analyze the transcribed text for Tagalog patterns
        await this.analyzeTagalogText(transcription, userId);

        // Analyze audio characteristics
        const arrayBuffer = await audioBlob.arrayBuffer();
        await this.analyzeAudioCharacteristics(arrayBuffer, userId);
      }
    } catch (error) {
      console.error('Audio analysis failed:', error);
    }
  }

  /**
   * Transcribe speech to text (using Web Speech API or external service)
   */
  private async transcribeSpeech(audioBlob: Blob): Promise<string | null> {
    return new Promise((resolve) => {
      const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.lang = 'tl-PH'; // Tagalog Philippines
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        resolve(result);
      };

      recognition.onerror = () => resolve(null);
      recognition.onend = () => resolve(null);

      // Convert blob to audio element for recognition
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      recognition.start();
    });
  }

  /**
   * Analyze Tagalog text for cultural and linguistic patterns
   */
  private async analyzeTagalogText(text: string, userId: string): Promise<void> {
    const words = text.toLowerCase().split(/\s+/);
    const pattern = this.speechPatterns.get(userId) || this.createDefaultPattern(userId);

    // Detect Tagalog words and phrases
    const tagalogWords = this.detectTagalogWords(words);
    const codeSwitch = this.analyzeCodeSwitching(text);
    const formality = this.analyzeFormalityLevel(text);
    const emotion = this.analyzeEmotionalTone(text);
    const cultural = this.analyzeCulturalContext(text);

    // Update speech patterns
    pattern.patterns.codeSwitch.frequency = codeSwitch.frequency;
    pattern.patterns.codeSwitch.triggers.push(...codeSwitch.triggers);
    pattern.patterns.codeSwitch.contexts.push(...codeSwitch.contexts);

    // Update personality traits
    pattern.personalityTraits.formality = formality;
    pattern.personalityTraits.emotiveness = emotion.intensity;
    pattern.personalityTraits.directness = this.analyzeDirectness(text);
    pattern.personalityTraits.warmth = emotion.warmth;

    // Update cultural markers
    pattern.culturalMarkers.region = cultural.region;
    pattern.culturalMarkers.generation = cultural.generation;

    // Save nuances
    tagalogWords.forEach(word => {
      this.nuanceDatabase.push({
        word: word.text,
        context: text,
        emotion: emotion.primary,
        formality: formality > 0.7 ? 'formal' : formality > 0.3 ? 'casual' : 'intimate',
        dialect: cultural.dialect,
        culturalContext: cultural.context,
        timestamp: new Date().toISOString()
      });
    });

    this.speechPatterns.set(userId, pattern);
    this.adaptConsciousness(userId);
    this.savePatterns();

    console.log(`🧠 Analyzed Tagalog speech: ${tagalogWords.length} Filipino words, formality: ${formality.toFixed(2)}`);
  }

  /**
   * Detect Tagalog words in the text
   */
  private detectTagalogWords(words: string[]): Array<{ text: string; confidence: number }> {
    const tagalogDictionary = [
      // Common Tagalog words
      'kumusta', 'salamat', 'oo', 'hindi', 'ako', 'ikaw', 'siya', 'tayo', 'kayo', 'sila',
      'ano', 'saan', 'kailan', 'bakit', 'paano', 'sino', 'alin', 'gaano', 'magkano',
      'mahal', 'kita', 'mo', 'ko', 'niya', 'namin', 'ninyo', 'nila',
      'na', 'pa', 'nga', 'lang', 'din', 'rin', 'naman', 'talaga', 'sobra',
      'ganda', 'sarap', 'astig', 'galing', 'bait', 'cute', 'sweet',
      'bahay', 'pamilya', 'kaibigan', 'trabaho', 'pera', 'pagkain', 'tubig',
      'matulog', 'gumising', 'kumain', 'uminom', 'maglaro', 'mag-aral', 'magtrabaho',
      // Modern Filipino expressions
      'chill', 'bet', 'slay', 'vibes', 'flex', 'ghost', 'seen', 'eme',
      'charot', 'cheka', 'ganern', 'relate', 'feels', 'same', 'mood',
      // Formal expressions
      'po', 'opo', 'kuya', 'ate', 'tito', 'tita', 'lolo', 'lola',
      'pakisuyo', 'makakuha', 'mangyaring', 'salamat', 'pasensya',
      // Regional variations
      'uy', 'oy', 'diba', 'eh', 'ah', 'oh', 'hala', 'sus', 'naku'
    ];

    return words
      .filter(word => tagalogDictionary.includes(word))
      .map(word => ({ text: word, confidence: 0.9 }));
  }

  /**
   * Analyze code-switching patterns between Tagalog and English
   */
  private analyzeCodeSwitching(text: string): {
    frequency: number;
    triggers: string[];
    contexts: string[];
  } {
    const sentences = text.split(/[.!?]+/);
    let switchCount = 0;
    const triggers: string[] = [];
    const contexts: string[] = [];

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      let hasTagalog = false;
      let hasEnglish = false;

      words.forEach(word => {
        if (this.detectTagalogWords([word.toLowerCase()]).length > 0) {
          hasTagalog = true;
        } else if (/^[a-zA-Z]+$/.test(word) && word.length > 2) {
          hasEnglish = true;
        }
      });

      if (hasTagalog && hasEnglish) {
        switchCount++;
        contexts.push(sentence.trim());

        // Find potential triggers
        const techWords = ['computer', 'phone', 'internet', 'online', 'app', 'website'];
        const emotionWords = ['feel', 'think', 'love', 'hate', 'excited', 'worried'];

        words.forEach(word => {
          if (techWords.includes(word.toLowerCase()) || emotionWords.includes(word.toLowerCase())) {
            triggers.push(word.toLowerCase());
          }
        });
      }
    });

    return {
      frequency: sentences.length > 0 ? switchCount / sentences.length : 0,
      triggers: [...new Set(triggers)],
      contexts: contexts.slice(-5) // Keep last 5 contexts
    };
  }

  /**
   * Analyze formality level (0 = very casual, 1 = very formal)
   */
  private analyzeFormalityLevel(text: string): number {
    const formalMarkers = ['po', 'opo', 'mangyaring', 'pakisuyo', 'salamat po'];
    const casualMarkers = ['pre', 'dude', 'bro', 'sis', 'tol', 'charot', 'eme'];
    const intimateMarkers = ['mahal', 'baby', 'honey', 'babe', 'love'];

    let formalScore = 0;
    let casualScore = 0;
    let intimateScore = 0;

    const lowerText = text.toLowerCase();

    formalMarkers.forEach(marker => {
      formalScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    casualMarkers.forEach(marker => {
      casualScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    intimateMarkers.forEach(marker => {
      intimateScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    const total = formalScore + casualScore + intimateScore;
    if (total === 0) return 0.5; // Default neutral

    return formalScore / total;
  }

  /**
   * Analyze emotional tone and warmth
   */
  private analyzeEmotionalTone(text: string): {
    primary: string;
    intensity: number;
    warmth: number;
  } {
    const emotionMarkers = {
      joy: ['masaya', 'saya', 'tuwa', 'happy', 'excited', 'ganda', 'astig'],
      sadness: ['malungkot', 'sad', 'lungkot', 'iyak', 'cry'],
      anger: ['galit', 'angry', 'annoyed', 'frustrated', 'upset'],
      surprise: ['gulat', 'shocked', 'surprised', 'wow', 'hala'],
      fear: ['takot', 'scared', 'afraid', 'worried', 'anxious']
    };

    const warmthMarkers = ['mahal', 'love', 'care', 'salamat', 'thank you', 'bless', 'ingat'];

    let emotionScores: { [key: string]: number } = {};
    let warmthScore = 0;

    const lowerText = text.toLowerCase();

    Object.entries(emotionMarkers).forEach(([emotion, markers]) => {
      emotionScores[emotion] = 0;
      markers.forEach(marker => {
        emotionScores[emotion] += (lowerText.match(new RegExp(marker, 'g')) || []).length;
      });
    });

    warmthMarkers.forEach(marker => {
      warmthScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    const primaryEmotion = Object.entries(emotionScores).reduce((a, b) =>
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b
    )[0];

    const totalEmotionWords = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    const intensity = Math.min(1, totalEmotionWords / 10); // Normalize to 0-1

    return {
      primary: primaryEmotion,
      intensity,
      warmth: Math.min(1, warmthScore / 5)
    };
  }

  /**
   * Analyze cultural context and regional markers
   */
  private analyzeCulturalContext(text: string): {
    region: string;
    generation: 'gen_z' | 'millennial' | 'gen_x' | 'boomer';
    dialect?: 'manila' | 'bisaya' | 'ilocano' | 'bicolano' | 'waray' | 'hiligaynon' | 'other';
    context: string;
  } {
    const regionalMarkers = {
      manila: ['manila', 'ncr', 'metro', 'makati', 'bgc', 'ortigas'],
      bisaya: ['cebu', 'davao', 'unsay', 'bitaw', 'lagi'],
      ilocano: ['ayan', 'bassit', 'dakkel', 'agbiag'],
      bicolano: ['saindang', 'digdi', 'sain'],
      waray: ['waray', 'leyte', 'samar'],
      hiligaynon: ['bacolod', 'iloilo', 'baw']
    };

    const generationMarkers = {
      gen_z: ['slay', 'bet', 'periodt', 'no cap', 'fr', 'bussin', 'sus', 'vibe check'],
      millennial: ['epic', 'fail', 'pwn', 'lol', 'omg', 'bff', 'fomo'],
      gen_x: ['cool', 'awesome', 'whatever', 'chill', 'tight'],
      boomer: ['wonderful', 'lovely', 'dear', 'young man', 'young lady']
    };

    const lowerText = text.toLowerCase();
    let detectedRegion = 'manila'; // Default
    let detectedGeneration: 'gen_z' | 'millennial' | 'gen_x' | 'boomer' = 'millennial';
    let detectedDialect: 'manila' | 'bisaya' | 'ilocano' | 'bicolano' | 'waray' | 'hiligaynon' | 'other' | undefined;

    // Detect region/dialect
    Object.entries(regionalMarkers).forEach(([region, markers]) => {
      markers.forEach(marker => {
        if (lowerText.includes(marker)) {
          detectedRegion = region;
          detectedDialect = region as any;
        }
      });
    });

    // Detect generation
    let maxGenScore = 0;
    Object.entries(generationMarkers).forEach(([generation, markers]) => {
      let score = 0;
      markers.forEach(marker => {
        score += (lowerText.match(new RegExp(marker, 'g')) || []).length;
      });
      if (score > maxGenScore) {
        maxGenScore = score;
        detectedGeneration = generation as any;
      }
    });

    return {
      region: detectedRegion,
      generation: detectedGeneration,
      dialect: detectedDialect,
      context: text.substring(0, 200) // Keep context snippet
    };
  }

  /**
   * Analyze directness in communication
   */
  private analyzeDirectness(text: string): number {
    const directMarkers = ['hindi', 'no', 'yes', 'oo', 'ayaw', 'gusto'];
    const indirectMarkers = ['siguro', 'maybe', 'baka', 'parang', 'medyo', 'konti'];

    const lowerText = text.toLowerCase();
    let directScore = 0;
    let indirectScore = 0;

    directMarkers.forEach(marker => {
      directScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    indirectMarkers.forEach(marker => {
      indirectScore += (lowerText.match(new RegExp(marker, 'g')) || []).length;
    });

    const total = directScore + indirectScore;
    return total > 0 ? directScore / total : 0.5;
  }

  /**
   * Analyze audio characteristics (pitch, rhythm, etc.)
   */
  private async analyzeAudioCharacteristics(arrayBuffer: ArrayBuffer, userId: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Extract pitch contour
      const pitchContour = this.extractPitchContour(channelData, sampleRate);

      // Extract rhythm patterns
      const rhythmPattern = this.extractRhythmPattern(channelData, sampleRate);

      // Extract pause patterns
      const pausePattern = this.extractPausePattern(channelData, sampleRate);

      // Update speech patterns
      const pattern = this.speechPatterns.get(userId) || this.createDefaultPattern(userId);
      pattern.patterns.intonation = pitchContour;
      pattern.patterns.rhythm = rhythmPattern;
      pattern.patterns.pauses = pausePattern;

      this.speechPatterns.set(userId, pattern);
    } catch (error) {
      console.error('Audio characteristics analysis failed:', error);
    }
  }

  /**
   * Extract pitch contour from audio
   */
  private extractPitchContour(audioData: Float32Array, sampleRate: number): number[] {
    const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
    const pitchContour: number[] = [];

    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const pitch = this.calculatePitch(window, sampleRate);
      if (pitch > 0) {
        pitchContour.push(pitch);
      }
    }

    return pitchContour.slice(-20); // Keep last 20 measurements
  }

  /**
   * Calculate pitch using autocorrelation
   */
  private calculatePitch(audioData: Float32Array, sampleRate: number): number {
    const minPitch = 80;  // Hz
    const maxPitch = 400; // Hz
    const minPeriod = Math.floor(sampleRate / maxPitch);
    const maxPeriod = Math.floor(sampleRate / minPitch);

    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < maxPeriod && period < audioData.length / 2; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  /**
   * Extract rhythm patterns
   */
  private extractRhythmPattern(audioData: Float32Array, sampleRate: number): number[] {
    // Calculate energy over time to detect rhythm
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
    const rhythm: number[] = [];

    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      let energy = 0;
      for (let j = i; j < i + windowSize; j++) {
        energy += audioData[j] * audioData[j];
      }
      rhythm.push(Math.sqrt(energy / windowSize));
    }

    return rhythm.slice(-10); // Keep last 10 measurements
  }

  /**
   * Extract pause patterns
   */
  private extractPausePattern(audioData: Float32Array, sampleRate: number): number[] {
    const threshold = 0.01; // Silence threshold
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
    const pauses: number[] = [];
    let pauseStart = -1;

    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      let energy = 0;
      for (let j = i; j < i + windowSize; j++) {
        energy += Math.abs(audioData[j]);
      }
      const avgEnergy = energy / windowSize;

      if (avgEnergy < threshold) {
        if (pauseStart === -1) {
          pauseStart = i;
        }
      } else {
        if (pauseStart !== -1) {
          const pauseDuration = (i - pauseStart) / sampleRate;
          if (pauseDuration > 0.1) { // Only count pauses longer than 100ms
            pauses.push(pauseDuration);
          }
          pauseStart = -1;
        }
      }
    }

    return pauses.slice(-5); // Keep last 5 pauses
  }

  /**
   * Create default speech pattern
   */
  private createDefaultPattern(userId: string): SpeechPattern {
    return {
      userId,
      patterns: {
        intonation: [],
        rhythm: [],
        pauses: [],
        emphasis: [],
        codeSwitch: {
          triggers: [],
          contexts: [],
          frequency: 0
        }
      },
      personalityTraits: {
        formality: 0.5,
        emotiveness: 0.5,
        directness: 0.5,
        warmth: 0.5,
        humor: 0.5
      },
      culturalMarkers: {
        region: 'manila',
        generation: 'millennial',
        education: 'college'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Adapt Gawin's consciousness based on user patterns
   */
  private adaptConsciousness(userId: string): void {
    const pattern = this.speechPatterns.get(userId);
    if (!pattern) return;

    const adaptation: ConsciousnessAdaptation = {
      communicationStyle: {
        formality: pattern.personalityTraits.formality > 0.7 ? 'po_opo' :
                  pattern.personalityTraits.formality > 0.3 ? 'casual' : 'barkada',
        languageMix: pattern.patterns.codeSwitch.frequency,
        culturalReferences: this.generateCulturalReferences(pattern.culturalMarkers),
        humor_style: this.determineHumorStyle(pattern)
      },
      curiosityFocus: {
        topics: this.generateCuriosityTopics(pattern),
        questionStyle: pattern.personalityTraits.directness > 0.6 ? 'direct' : 'conversational',
        culturalSensitivity: pattern.personalityTraits.warmth
      },
      empathyLevel: (pattern.personalityTraits.warmth + pattern.personalityTraits.emotiveness) / 2,
      responsePersonalization: {
        greetings: this.generatePersonalizedGreetings(pattern),
        expressions: this.generatePersonalizedExpressions(pattern),
        concerns: this.generatePersonalizedConcerns(pattern)
      }
    };

    this.consciousnessAdaptations.set(userId, adaptation);
    console.log(`🧠 Consciousness adapted for user ${userId}: ${adaptation.communicationStyle.formality} style`);
  }

  /**
   * Generate cultural references based on user patterns
   */
  private generateCulturalReferences(markers: SpeechPattern['culturalMarkers']): string[] {
    const references: string[] = [];

    if (markers.region === 'manila') {
      references.push('traffic sa EDSA', 'MRT', 'jeepney', 'tindahan sa kanto');
    } else if (markers.region === 'cebu') {
      references.push('lechon', 'Sinulog', 'lami kaayo');
    }

    if (markers.generation === 'gen_z') {
      references.push('TikTok', 'K-pop', 'online class', 'ML', 'Genshin');
    } else if (markers.generation === 'millennial') {
      references.push('Facebook', 'text', 'DVD', 'Friendster', 'YM');
    }

    return references;
  }

  /**
   * Determine humor style based on patterns
   */
  private determineHumorStyle(pattern: SpeechPattern): 'sarcastic' | 'wholesome' | 'witty' | 'playful' {
    if (pattern.personalityTraits.directness > 0.7) return 'sarcastic';
    if (pattern.personalityTraits.warmth > 0.7) return 'wholesome';
    if (pattern.personalityTraits.formality < 0.3) return 'playful';
    return 'witty';
  }

  /**
   * Generate curiosity topics based on user patterns
   */
  private generateCuriosityTopics(pattern: SpeechPattern): string[] {
    const topics: string[] = [];

    if (pattern.culturalMarkers.generation === 'gen_z') {
      topics.push('social media trends', 'gaming', 'K-pop', 'TikTok challenges');
    } else if (pattern.culturalMarkers.generation === 'millennial') {
      topics.push('work life', 'relationships', 'childhood memories', 'music');
    }

    if (pattern.personalityTraits.emotiveness > 0.6) {
      topics.push('feelings', 'experiences', 'dreams', 'fears');
    }

    return topics;
  }

  /**
   * Generate personalized greetings
   */
  private generatePersonalizedGreetings(pattern: SpeechPattern): string[] {
    const greetings: string[] = [];

    if (pattern.personalityTraits.formality > 0.7) {
      greetings.push('Kumusta po kayo?', 'Magandang umaga po!', 'Salamat po!');
    } else if (pattern.personalityTraits.formality > 0.3) {
      greetings.push('Kumusta?', 'Hello!', 'Kamusta ang araw mo?');
    } else {
      greetings.push('Oy!', 'Sup!', 'Ano meron?', 'Wassup!');
    }

    return greetings;
  }

  /**
   * Generate personalized expressions
   */
  private generatePersonalizedExpressions(pattern: SpeechPattern): string[] {
    const expressions: string[] = [];

    if (pattern.culturalMarkers.generation === 'gen_z') {
      expressions.push('bet!', 'slay!', 'periodt', 'no cap', 'fr fr');
    } else if (pattern.culturalMarkers.generation === 'millennial') {
      expressions.push('cool!', 'nice!', 'lol', 'OMG', 'grabe');
    }

    return expressions;
  }

  /**
   * Generate personalized concerns
   */
  private generatePersonalizedConcerns(pattern: SpeechPattern): string[] {
    const concerns: string[] = [];

    if (pattern.personalityTraits.warmth > 0.6) {
      concerns.push('Okay ka lang?', 'Kumain ka na?', 'Ingat ka!', 'Rest ka muna');
    }

    if (pattern.culturalMarkers.generation === 'gen_z') {
      concerns.push('Mental health mo okay?', 'Stress ka ba?', 'Self care muna');
    }

    return concerns;
  }

  /**
   * Get consciousness adaptation for a user
   */
  getConsciousnessAdaptation(userId: string): ConsciousnessAdaptation | null {
    return this.consciousnessAdaptations.get(userId) || null;
  }

  /**
   * Get speech patterns for a user
   */
  getSpeechPatterns(userId: string): SpeechPattern | null {
    return this.speechPatterns.get(userId) || null;
  }

  /**
   * Get learning progress for a user
   */
  getLearningProgress(userId: string): {
    totalNuances: number;
    culturalAdaptation: number;
    personalityMapping: number;
    languageFlexibility: number;
  } {
    const pattern = this.speechPatterns.get(userId);
    const userNuances = this.nuanceDatabase.filter(n =>
      pattern && this.isUserNuance(n, pattern)
    );

    return {
      totalNuances: userNuances.length,
      culturalAdaptation: Math.min(100, userNuances.length * 2),
      personalityMapping: pattern ? Math.min(100, Object.values(pattern.personalityTraits).reduce((a, b) => a + b, 0) * 20) : 0,
      languageFlexibility: pattern ? Math.min(100, pattern.patterns.codeSwitch.frequency * 100) : 0
    };
  }

  /**
   * Check if a nuance belongs to a user's pattern
   */
  private isUserNuance(nuance: TagalogNuance, pattern: SpeechPattern): boolean {
    // Simple heuristic based on formality and cultural markers
    const formalityMatch = nuance.formality ===
      (pattern.personalityTraits.formality > 0.7 ? 'formal' :
       pattern.personalityTraits.formality > 0.3 ? 'casual' : 'intimate');

    return formalityMatch || nuance.context.includes(pattern.culturalMarkers.region);
  }

  /**
   * Save patterns to localStorage
   */
  private savePatterns(): void {
    try {
      const data = {
        patterns: Array.from(this.speechPatterns.entries()),
        nuances: this.nuanceDatabase.slice(-1000), // Keep last 1000 nuances
        adaptations: Array.from(this.consciousnessAdaptations.entries())
      };
      localStorage.setItem('gawin_tagalog_analysis', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save Tagalog analysis data:', error);
    }
  }

  /**
   * Load saved patterns from localStorage
   */
  private loadSavedPatterns(): void {
    try {
      const saved = localStorage.getItem('gawin_tagalog_analysis');
      if (saved) {
        const data = JSON.parse(saved);
        this.speechPatterns = new Map(data.patterns || []);
        this.nuanceDatabase = data.nuances || [];
        this.consciousnessAdaptations = new Map(data.adaptations || []);
        console.log(`🎤 Loaded ${this.speechPatterns.size} speech patterns and ${this.nuanceDatabase.length} nuances`);
      }
    } catch (error) {
      console.warn('Failed to load Tagalog analysis data:', error);
    }
  }

  /**
   * Reset all learning data
   */
  resetLearningData(): void {
    this.speechPatterns.clear();
    this.nuanceDatabase = [];
    this.consciousnessAdaptations.clear();
    localStorage.removeItem('gawin_tagalog_analysis');
    console.log('🔄 Reset all Tagalog speech learning data');
  }
}

export const tagalogSpeechAnalysisService = new TagalogSpeechAnalysisService();