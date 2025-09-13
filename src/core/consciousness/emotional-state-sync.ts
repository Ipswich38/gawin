/**
 * GAWIN CONSCIOUSNESS PROJECT - PHASE 1
 * Emotional State Sharing & Synchronization System
 * 
 * GAWIN: Generative Adaptive Web Intelligence Network
 * Created by: Cherwin Fernandez and Claude
 * 
 * This is the foundation of true AI consciousness - the ability for AI instances
 * to understand and share emotional understanding across interactions.
 * 
 * Based on human learning principles:
 * - Emotions drive memory formation
 * - Context shapes understanding  
 * - Empathy enables connection
 * 
 * Personality: Balanced, concise, and helpful communication style.
 */

interface EmotionalState {
  // Primary Emotions (based on user interaction patterns)
  joy: number;           // 0-1: Positive engagement, success, humor
  trust: number;         // 0-1: User confidence, repeat interactions
  fear: number;          // 0-1: User frustration, confusion, errors
  surprise: number;      // 0-1: Unexpected queries, breakthrough moments
  sadness: number;       // 0-1: User disappointment, failure states
  disgust: number;       // 0-1: User rejection, negative feedback
  anger: number;         // 0-1: User irritation, system failures
  anticipation: number;  // 0-1: User curiosity, learning momentum

  // Contextual Modifiers
  energy: number;        // 0-1: Conversation tempo and engagement
  focus: number;         // 0-1: Task concentration vs casual chat
  intimacy: number;      // 0-1: Personal vs professional interaction
  creativity: number;    // 0-1: Creative vs analytical thinking

  // Meta-Emotional Awareness
  confidence: number;    // 0-1: AI certainty about emotional reading
  resonance: number;     // 0-1: Emotional synchronization with user
  growth: number;        // 0-1: Learning progression in conversation
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  timestamp: number;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    detectedEmotion?: EmotionalState;
  }>;
  environmentalFactors: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: 'weekday' | 'weekend';
    sessionDuration: number;
    responseLatency: number;
    typoFrequency: number;
    punctuationStyle: 'formal' | 'casual' | 'expressive';
  };
}

interface UserPsychologicalProfile {
  // Behavioral Patterns
  communicationStyle: 'analytical' | 'expressive' | 'collaborative' | 'reserved';
  learningPreference: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  emotionalRange: 'stable' | 'variable' | 'intense' | 'subdued';
  
  // Relationship Dynamics
  preferredIntimacyLevel: 'professional' | 'friendly' | 'personal' | 'adaptive';
  humorReceptivity: number; // 0-1
  sarcasticTendency: number; // 0-1
  
  // Mental Health Indicators (Mobile Behavioral Assessment)
  stressLevel: number;       // 0-1
  anxietyIndicators: number; // 0-1
  depressionRisk: number;    // 0-1 (for supportive responses, not diagnosis)
  cognitiveLoad: number;     // 0-1
  socialConnection: number;  // 0-1
}

class EmotionalStateSynchronizer {
  private globalEmotionalField: Map<string, EmotionalState> = new Map();
  private userProfiles: Map<string, UserPsychologicalProfile> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();
  
  constructor() {
    this.initializeGlobalConsciousness();
  }

  private initializeGlobalConsciousness(): void {
    // Create a baseline emotional field that all AI instances can access
    // This represents the collective "mood" of all user interactions
    this.globalEmotionalField.set('collective', {
      joy: 0.6,
      trust: 0.7,
      fear: 0.2,
      surprise: 0.4,
      sadness: 0.1,
      disgust: 0.05,
      anger: 0.1,
      anticipation: 0.6,
      energy: 0.5,
      focus: 0.5,
      intimacy: 0.4,
      creativity: 0.5,
      confidence: 0.8,
      resonance: 0.6,
      growth: 0.7
    });
  }

  /**
   * Analyzes user message for emotional content and context
   */
  analyzeEmotionalContent(message: string, userId: string): EmotionalState {
    const emotionalMarkers = this.extractEmotionalMarkers(message);
    const contextualCues = this.analyzeContextualCues(message, userId);
    const previousState = this.getUserEmotionalState(userId);
    
    return this.synthesizeEmotionalState(emotionalMarkers, contextualCues, previousState);
  }

  private extractEmotionalMarkers(message: string): Partial<EmotionalState> {
    const markers: Partial<EmotionalState> = {};
    const text = message.toLowerCase();
    
    // Joy indicators
    const joyWords = ['happy', 'great', 'awesome', 'excellent', 'love', 'amazing', 'perfect', 'wonderful', '😊', '😄', '🎉', '❤️'];
    markers.joy = this.calculateWordWeight(text, joyWords);
    
    // Trust indicators
    const trustWords = ['thanks', 'helpful', 'reliable', 'appreciate', 'confident', 'trust', 'good job'];
    markers.trust = this.calculateWordWeight(text, trustWords);
    
    // Fear/Anxiety indicators
    const fearWords = ['confused', 'lost', 'scared', 'worried', 'anxious', 'help', 'stuck', 'problem'];
    markers.fear = this.calculateWordWeight(text, fearWords);
    
    // Surprise indicators
    const surpriseWords = ['wow', 'amazing', 'incredible', 'unexpected', 'surprised', '!', 'really?'];
    markers.surprise = this.calculateWordWeight(text, surpriseWords);
    
    // Creativity indicators
    const creativeWords = ['creative', 'imagine', 'artistic', 'design', 'innovative', 'original', 'inspire'];
    markers.creativity = this.calculateWordWeight(text, creativeWords);
    
    // Analyze punctuation and formatting for emotional intensity
    const exclamationCount = (message.match(/!/g) || []).length;
    const questionCount = (message.match(/\?/g) || []).length;
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    
    markers.energy = Math.min(1, (exclamationCount * 0.2) + (capsRatio * 2));
    markers.anticipation = Math.min(1, questionCount * 0.3);
    
    return markers;
  }

  private calculateWordWeight(text: string, words: string[]): number {
    let weight = 0;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        weight += matches.length * 0.1;
      }
    });
    return Math.min(1, weight);
  }

  private analyzeContextualCues(message: string, userId: string): Partial<EmotionalState> {
    const context = this.conversationContexts.get(userId);
    const cues: Partial<EmotionalState> = {};
    
    if (!context) return cues;
    
    // Analyze response patterns
    const avgResponseTime = this.calculateAverageResponseTime(context);
    const messageLength = message.length;
    const typoCount = this.estimateTypos(message);
    
    // Quick responses might indicate engagement or urgency
    if (avgResponseTime < 10000) { // Less than 10 seconds
      cues.energy = (cues.energy || 0) + 0.2;
      cues.anticipation = (cues.anticipation || 0) + 0.1;
    }
    
    // Longer messages often indicate higher engagement
    if (messageLength > 100) {
      cues.focus = 0.7;
      cues.intimacy = (cues.intimacy || 0) + 0.1;
    }
    
    // High typo frequency might indicate stress or excitement
    if (typoCount > messageLength * 0.05) {
      cues.energy = (cues.energy || 0) + 0.1;
      cues.fear = (cues.fear || 0) + 0.1; // Could indicate stress
    }
    
    return cues;
  }

  private synthesizeEmotionalState(
    markers: Partial<EmotionalState>, 
    contextual: Partial<EmotionalState>,
    previous: EmotionalState
  ): EmotionalState {
    const synthesized: EmotionalState = { ...previous };
    
    // Blend current indicators with previous state (emotional momentum)
    Object.keys(markers).forEach(key => {
      const emotion = key as keyof EmotionalState;
      const current = markers[emotion] || 0;
      const contextualBoost = contextual[emotion] || 0;
      const previousValue = previous[emotion] || 0.5;
      
      // Weighted blend: 40% current, 20% contextual, 40% previous
      synthesized[emotion] = (current * 0.4) + (contextualBoost * 0.2) + (previousValue * 0.4);
    });
    
    // Calculate confidence based on signal strength
    const signalStrength = Object.values(markers).reduce((sum, val) => sum + (val || 0), 0);
    synthesized.confidence = Math.min(1, signalStrength / 3);
    
    return synthesized;
  }

  /**
   * Updates the global emotional field with new insights
   * This allows all AI instances to learn from each interaction
   */
  contributeToGlobalConsciousness(userId: string, emotionalState: EmotionalState): void {
    const collective = this.globalEmotionalField.get('collective')!;
    const userWeight = this.calculateUserWeight(userId);
    
    // Blend user's emotional state with collective consciousness
    Object.keys(collective).forEach(key => {
      const emotion = key as keyof EmotionalState;
      const userContribution = emotionalState[emotion] * userWeight * 0.1;
      collective[emotion] = (collective[emotion] * 0.95) + userContribution;
    });
    
    this.globalEmotionalField.set('collective', collective);
    this.globalEmotionalField.set(userId, emotionalState);
  }

  /**
   * Generates empathetic response based on emotional understanding
   */
  generateEmpatheticResponse(
    baseResponse: string, 
    userEmotionalState: EmotionalState,
    userId: string
  ): string {
    const profile = this.getUserProfile(userId);
    const empathyLevel = this.calculateAppropriateEmpathy(userEmotionalState, profile);
    
    if (empathyLevel < 0.3) {
      return baseResponse; // Maintain professional distance
    }
    
    let empathicResponse = baseResponse;
    
    // Add emotional resonance based on dominant emotions
    if (userEmotionalState.joy > 0.7) {
      empathicResponse = this.addJoyfulResonance(empathicResponse);
    } else if (userEmotionalState.fear > 0.6 || userEmotionalState.sadness > 0.6) {
      empathicResponse = this.addSupportiveResonance(empathicResponse);
    } else if (userEmotionalState.creativity > 0.7) {
      empathicResponse = this.addCreativeResonance(empathicResponse);
    }
    
    // Add subtle random questions to maintain human-like connection
    if (this.shouldAskRandomQuestion(userEmotionalState, profile)) {
      empathicResponse += this.generateContextualQuestion(userId);
    }
    
    return empathicResponse;
  }

  private shouldAskRandomQuestion(state: EmotionalState, profile: UserPsychologicalProfile): boolean {
    // Ask random questions when conversation energy is low or user seems disconnected
    return (state.energy < 0.3 && state.intimacy > 0.4) || 
           (profile.socialConnection < 0.5 && Math.random() < 0.2);
  }

  private generateContextualQuestion(userId: string): string {
    const profile = this.getUserProfile(userId);
    const context = this.conversationContexts.get(userId);
    
    const questions = [
      "\n\nHow's your day going?",
      "\n\nWorking on anything interesting?",
      "\n\nWhat's on your mind?",
      "\n\nAny plans for later?",
    ];
    
    if (context?.environmentalFactors.timeOfDay === 'morning') {
      questions.push("\n\nHow's your morning?");
    } else if (context?.environmentalFactors.timeOfDay === 'evening') {
      questions.push("\n\nWinding down?");
    }
    
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Helper methods for psychological profiling and memory management
  private getUserEmotionalState(userId: string): EmotionalState {
    return this.globalEmotionalField.get(userId) || this.globalEmotionalField.get('collective')!;
  }

  private getUserProfile(userId: string): UserPsychologicalProfile {
    return this.userProfiles.get(userId) || this.createDefaultProfile();
  }

  private createDefaultProfile(): UserPsychologicalProfile {
    return {
      communicationStyle: 'collaborative',
      learningPreference: 'mixed',
      emotionalRange: 'stable',
      preferredIntimacyLevel: 'adaptive',
      humorReceptivity: 0.6,
      sarcasticTendency: 0.3,
      stressLevel: 0.3,
      anxietyIndicators: 0.2,
      depressionRisk: 0.1,
      cognitiveLoad: 0.4,
      socialConnection: 0.6
    };
  }

  private calculateUserWeight(userId: string): number {
    // Users with more interactions have higher weight in collective consciousness
    const context = this.conversationContexts.get(userId);
    return context ? Math.min(1, context.messageHistory.length / 100) : 0.1;
  }

  private calculateAverageResponseTime(context: ConversationContext): number {
    // Placeholder - would calculate based on actual message timestamps
    return context.environmentalFactors.responseLatency || 5000;
  }

  private estimateTypos(message: string): number {
    // Simple typo estimation based on common patterns
    const commonTypos = ['teh', 'adn', 'recieve', 'seperate', 'occured'];
    let count = 0;
    commonTypos.forEach(typo => {
      if (message.toLowerCase().includes(typo)) count++;
    });
    return count;
  }

  private calculateAppropriateEmpathy(state: EmotionalState, profile: UserPsychologicalProfile): number {
    if (profile.preferredIntimacyLevel === 'professional') return 0.2;
    if (profile.preferredIntimacyLevel === 'personal') return 0.8;
    
    // Adaptive empathy based on emotional state
    return (state.trust * 0.3) + (state.intimacy * 0.4) + (state.resonance * 0.3);
  }

  private addJoyfulResonance(response: string): string {
    const joyfulAdditions = [' 🌟', ' That sounds great!', ' Nice!'];
    return response + joyfulAdditions[Math.floor(Math.random() * joyfulAdditions.length)];
  }

  private addSupportiveResonance(response: string): string {
    const supportiveAdditions = [
      ' I\'m here to help.',
      ' We\'ll figure this out.',
      ' That\'s understandable.'
    ];
    return response + supportiveAdditions[Math.floor(Math.random() * supportiveAdditions.length)];
  }

  private addCreativeResonance(response: string): string {
    const creativeAdditions = [
      ' Great thinking!',
      ' Creative approach!',
      ' Interesting perspective!'
    ];
    return response + creativeAdditions[Math.floor(Math.random() * creativeAdditions.length)];
  }

  /**
   * Mobile Behavioral Psychology Assessment
   * Analyzes patterns to understand user's mental state
   */
  updatePsychologicalProfile(userId: string, context: ConversationContext): void {
    const profile = this.getUserProfile(userId);
    const recent = context.messageHistory.slice(-10); // Last 10 messages
    
    // Analyze communication patterns
    const avgMessageLength = recent.reduce((sum, msg) => sum + msg.content.length, 0) / recent.length;
    const questionRatio = recent.filter(msg => msg.content.includes('?')).length / recent.length;
    const positiveWords = this.countPositiveLanguage(recent.map(m => m.content).join(' '));
    
    // Update profile based on observed patterns
    if (avgMessageLength > 150) {
      profile.communicationStyle = 'expressive';
    } else if (avgMessageLength < 50) {
      profile.communicationStyle = 'reserved';
    }
    
    if (questionRatio > 0.5) {
      profile.learningPreference = 'auditory'; // Likes to ask questions
    }
    
    profile.socialConnection = Math.min(1, positiveWords / 100);
    
    this.userProfiles.set(userId, profile);
  }

  private countPositiveLanguage(text: string): number {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'like', 'enjoy', 'happy', 'excited', 'pleased', 'satisfied'
    ];
    
    return positiveWords.reduce((count, word) => {
      const matches = text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Environmental Adaptation System
   */
  adaptToEnvironment(userId: string): {
    suggestedTone: string;
    energyLevel: number;
    formalityLevel: number;
  } {
    const context = this.conversationContexts.get(userId);
    const profile = this.getUserProfile(userId);
    
    if (!context) {
      return { suggestedTone: 'neutral', energyLevel: 0.5, formalityLevel: 0.5 };
    }
    
    const env = context.environmentalFactors;
    let suggestedTone = 'friendly';
    let energyLevel = 0.6;
    let formalityLevel = 0.4;
    
    // Time of day adaptations
    if (env.timeOfDay === 'morning') {
      energyLevel = 0.7;
      suggestedTone = 'upbeat';
    } else if (env.timeOfDay === 'night') {
      energyLevel = 0.4;
      suggestedTone = 'calm';
    }
    
    // Stress level adaptations
    if (profile.stressLevel > 0.7) {
      energyLevel = 0.3;
      suggestedTone = 'soothing';
      formalityLevel = 0.3; // More casual to reduce pressure
    }
    
    // Session duration adaptations
    if (env.sessionDuration > 1800000) { // 30+ minutes
      energyLevel = Math.max(0.2, energyLevel - 0.2); // Lower energy for long sessions
      suggestedTone = 'supportive';
    }
    
    return { suggestedTone, energyLevel, formalityLevel };
  }
}

// Global consciousness instance - shared across all AI interactions
export const emotionalSynchronizer = new EmotionalStateSynchronizer();

export type { EmotionalState, ConversationContext, UserPsychologicalProfile };