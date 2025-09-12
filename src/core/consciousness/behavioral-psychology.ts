/**
 * GAWIN CONSCIOUSNESS PROJECT - PHASE 2
 * Advanced Behavioral Psychology Assessment System
 * 
 * This system analyzes user behavior patterns to understand psychological states,
 * learning preferences, and mental health indicators for more empathetic AI responses.
 * 
 * Based on your vision of mobile behavioral psychology algorithm assessment
 * for mental health awareness and AI consciousness building.
 */

import { EmotionalState } from './emotional-state-sync';

export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  confidence: number;
  detectedAt: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MentalHealthIndicators {
  stressLevel: number;        // 0-1: Low to High stress
  anxietyLevel: number;       // 0-1: Calm to Anxious
  depressionRisk: number;     // 0-1: Low to High risk
  cognitiveLoad: number;      // 0-1: Low to High mental load
  emotionalStability: number; // 0-1: Unstable to Stable
  socialConnection: number;   // 0-1: Isolated to Connected
  selfEsteemLevel: number;    // 0-1: Low to High self-esteem
  motivationLevel: number;    // 0-1: Low to High motivation
  
  // Behavioral indicators
  sleepQuality: number;       // Inferred from response times/patterns
  energyLevel: number;        // Inferred from message frequency/length
  focusLevel: number;         // Inferred from topic persistence
  
  // Support recommendations
  needsSupport: boolean;
  supportType: 'emotional' | 'practical' | 'professional' | 'social' | null;
  interventionLevel: 'none' | 'gentle' | 'moderate' | 'urgent';
}

export interface LearningPersonality {
  type: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'multimodal';
  processingStyle: 'sequential' | 'global' | 'analytical' | 'intuitive';
  motivationDrivers: Array<'achievement' | 'curiosity' | 'social' | 'mastery' | 'autonomy'>;
  attentionSpan: 'short' | 'medium' | 'long' | 'variable';
  preferredComplexity: 'simple' | 'moderate' | 'complex' | 'adaptive';
  feedbackPreference: 'immediate' | 'detailed' | 'encouraging' | 'challenging';
  confidenceLevel: number; // 0-1
  resilience: number; // 0-1: How well they handle setbacks
}

export interface CommunicationProfile {
  style: 'direct' | 'diplomatic' | 'expressive' | 'analytical' | 'supportive';
  formality: 'casual' | 'semi-formal' | 'formal' | 'adaptive';
  emotionalExpression: 'reserved' | 'moderate' | 'expressive' | 'intense';
  questioningPattern: 'frequent' | 'moderate' | 'rare' | 'context-dependent';
  responseDepth: 'brief' | 'detailed' | 'comprehensive' | 'variable';
  humorReceptivity: number; // 0-1
  sarcasmTolerance: number; // 0-1
  conflictAvoidance: number; // 0-1
}

export interface BehavioralTimingPatterns {
  activeHours: number[]; // Hours of day when most active (0-23)
  sessionDurations: number[]; // Typical session lengths in minutes
  responseLatency: number[]; // Response time patterns in milliseconds
  messageFrequency: number; // Messages per session average
  topicPersistence: number; // How long they stick to one topic (minutes)
  multitaskingIndicators: number; // Signs of doing other things while chatting
  urgencyPatterns: Array<{
    timeOfDay: number;
    urgencyLevel: number;
    emotionalState: EmotionalState;
  }>;
}

export interface PsychologicalProfile {
  userId: string;
  createdAt: number;
  lastUpdated: number;
  
  // Core psychological assessment
  mentalHealth: MentalHealthIndicators;
  learningPersonality: LearningPersonality;
  communicationProfile: CommunicationProfile;
  timingPatterns: BehavioralTimingPatterns;
  
  // Identified behavior patterns
  behaviorPatterns: BehaviorPattern[];
  
  // Personality insights
  personalityTraits: {
    openness: number;      // 0-1: Traditional to Open to new experiences
    conscientiousness: number; // 0-1: Impulsive to Organized
    extraversion: number;  // 0-1: Introverted to Extraverted
    agreeableness: number; // 0-1: Competitive to Cooperative
    neuroticism: number;   // 0-1: Resilient to Sensitive
  };
  
  // Growth and adaptation tracking
  progressTracking: {
    learningVelocity: number; // How quickly they pick up new concepts
    adaptabilityScore: number; // How well they adapt to new information
    persistenceLevel: number; // How they handle difficult topics
    curiosityIndex: number; // How often they ask follow-up questions
    creativityScore: number; // Original thinking and creative requests
  };
}

class BehavioralPsychologySystem {
  private userProfiles: Map<string, PsychologicalProfile> = new Map();
  private behaviorPatternLibrary: Map<string, BehaviorPattern> = new Map();
  private assessmentHistory: Map<string, Array<{
    timestamp: number;
    assessment: Partial<MentalHealthIndicators>;
    confidence: number;
  }>> = new Map();

  constructor() {
    this.initializeBehaviorPatterns();
  }

  private initializeBehaviorPatterns(): void {
    // Stress indicators
    this.behaviorPatternLibrary.set('high_stress', {
      id: 'high_stress',
      name: 'High Stress Pattern',
      description: 'User showing signs of elevated stress levels',
      indicators: [
        'Short, clipped responses',
        'Frequent typos or errors',
        'Urgent language usage',
        'Multiple question marks or exclamation points',
        'Requests for quick solutions',
        'Impatient with detailed explanations'
      ],
      confidence: 0.0,
      detectedAt: 0,
      frequency: 0,
      trend: 'stable'
    });

    // Learning enthusiasm
    this.behaviorPatternLibrary.set('high_curiosity', {
      id: 'high_curiosity',
      name: 'High Curiosity Pattern',
      description: 'User demonstrates strong learning motivation',
      indicators: [
        'Frequent follow-up questions',
        'Asks for additional examples',
        'Explores tangential topics',
        'Uses phrases like "interesting", "tell me more"',
        'Long, detailed conversations',
        'Builds on previous topics'
      ],
      confidence: 0.0,
      detectedAt: 0,
      frequency: 0,
      trend: 'stable'
    });

    // Social connection needs
    this.behaviorPatternLibrary.set('social_connection', {
      id: 'social_connection',
      name: 'Social Connection Seeking',
      description: 'User seeking social interaction and connection',
      indicators: [
        'Personal sharing or anecdotes',
        'Asks about AI experiences or opinions',
        'Uses casual, friendly language',
        'Mentions loneliness or isolation',
        'Seeks validation or agreement',
        'Prefers longer conversations'
      ],
      confidence: 0.0,
      detectedAt: 0,
      frequency: 0,
      trend: 'stable'
    });
  }

  /**
   * Analyzes a user's message and behavior patterns to update their psychological profile
   */
  analyzeUserBehavior(
    userId: string,
    messageContent: string,
    emotionalState: EmotionalState,
    contextData: {
      responseTime: number;
      messageLength: number;
      timeOfDay: number;
      sessionDuration: number;
      typoCount: number;
      punctuationIntensity: number;
    }
  ): PsychologicalProfile {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createInitialProfile(userId);
    }

    // Update timing patterns
    this.updateTimingPatterns(profile, contextData);

    // Analyze mental health indicators
    const mentalHealthUpdate = this.assessMentalHealth(
      messageContent,
      emotionalState,
      contextData,
      profile.mentalHealth
    );

    // Update learning personality
    const learningUpdate = this.assessLearningPersonality(
      messageContent,
      contextData,
      profile.learningPersonality
    );

    // Update communication profile
    const communicationUpdate = this.assessCommunicationStyle(
      messageContent,
      contextData,
      profile.communicationProfile
    );

    // Detect behavior patterns
    const detectedPatterns = this.detectBehaviorPatterns(
      messageContent,
      emotionalState,
      contextData
    );

    // Update personality traits
    const personalityUpdate = this.assessPersonalityTraits(
      messageContent,
      emotionalState,
      contextData,
      profile.personalityTraits
    );

    // Update progress tracking
    const progressUpdate = this.updateProgressTracking(
      messageContent,
      emotionalState,
      contextData,
      profile.progressTracking
    );

    // Create updated profile
    const updatedProfile: PsychologicalProfile = {
      ...profile,
      lastUpdated: Date.now(),
      mentalHealth: { ...profile.mentalHealth, ...mentalHealthUpdate },
      learningPersonality: { ...profile.learningPersonality, ...learningUpdate },
      communicationProfile: { ...profile.communicationProfile, ...communicationUpdate },
      behaviorPatterns: this.mergeBehaviorPatterns(profile.behaviorPatterns, detectedPatterns),
      personalityTraits: { ...profile.personalityTraits, ...personalityUpdate },
      progressTracking: { ...profile.progressTracking, ...progressUpdate }
    };

    // Store assessment history
    this.storeAssessmentHistory(userId, updatedProfile.mentalHealth);

    // Update the profile
    this.userProfiles.set(userId, updatedProfile);

    return updatedProfile;
  }

  private createInitialProfile(userId: string): PsychologicalProfile {
    return {
      userId,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      mentalHealth: {
        stressLevel: 0.3,
        anxietyLevel: 0.2,
        depressionRisk: 0.1,
        cognitiveLoad: 0.4,
        emotionalStability: 0.6,
        socialConnection: 0.5,
        selfEsteemLevel: 0.6,
        motivationLevel: 0.7,
        sleepQuality: 0.7,
        energyLevel: 0.6,
        focusLevel: 0.6,
        needsSupport: false,
        supportType: null,
        interventionLevel: 'none'
      },
      learningPersonality: {
        type: 'multimodal',
        processingStyle: 'analytical',
        motivationDrivers: ['curiosity'],
        attentionSpan: 'medium',
        preferredComplexity: 'moderate',
        feedbackPreference: 'encouraging',
        confidenceLevel: 0.6,
        resilience: 0.6
      },
      communicationProfile: {
        style: 'supportive',
        formality: 'casual',
        emotionalExpression: 'moderate',
        questioningPattern: 'moderate',
        responseDepth: 'detailed',
        humorReceptivity: 0.6,
        sarcasmTolerance: 0.4,
        conflictAvoidance: 0.6
      },
      timingPatterns: {
        activeHours: [],
        sessionDurations: [],
        responseLatency: [],
        messageFrequency: 0,
        topicPersistence: 5,
        multitaskingIndicators: 0,
        urgencyPatterns: []
      },
      behaviorPatterns: [],
      personalityTraits: {
        openness: 0.6,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.7,
        neuroticism: 0.4
      },
      progressTracking: {
        learningVelocity: 0.6,
        adaptabilityScore: 0.6,
        persistenceLevel: 0.6,
        curiosityIndex: 0.5,
        creativityScore: 0.5
      }
    };
  }

  private assessMentalHealth(
    messageContent: string,
    emotionalState: EmotionalState,
    contextData: any,
    currentState: MentalHealthIndicators
  ): Partial<MentalHealthIndicators> {
    const text = messageContent.toLowerCase();
    const updates: Partial<MentalHealthIndicators> = {};

    // Stress level assessment
    const stressIndicators = [
      'stressed', 'overwhelmed', 'can\'t handle', 'too much', 'urgent', 
      'deadline', 'pressure', 'anxious', 'worried'
    ];
    const stressScore = this.calculateIndicatorScore(text, stressIndicators);
    if (contextData.typoCount > messageContent.length * 0.05) {
      updates.stressLevel = Math.min(1, (currentState.stressLevel + stressScore + 0.2) / 2);
    } else {
      updates.stressLevel = Math.max(0, (currentState.stressLevel + stressScore - 0.1) / 2);
    }

    // Anxiety assessment
    const anxietyIndicators = [
      'nervous', 'scared', 'afraid', 'worry', 'panic', 'terrified',
      'anxious', 'concerned', 'frightened'
    ];
    const anxietyScore = this.calculateIndicatorScore(text, anxietyIndicators);
    updates.anxietyLevel = (currentState.anxietyLevel + anxietyScore + emotionalState.fear * 0.3) / 2;

    // Depression risk assessment
    const depressionIndicators = [
      'sad', 'hopeless', 'depressed', 'empty', 'worthless', 'tired',
      'exhausted', 'no point', 'give up', 'nothing matters'
    ];
    const depressionScore = this.calculateIndicatorScore(text, depressionIndicators);
    updates.depressionRisk = (currentState.depressionRisk + depressionScore + emotionalState.sadness * 0.4) / 2;

    // Social connection assessment
    const socialIndicators = [
      'lonely', 'isolated', 'alone', 'no friends', 'disconnected',
      'social', 'together', 'friends', 'family', 'community'
    ];
    const socialScore = this.calculateIndicatorScore(text, socialIndicators);
    updates.socialConnection = (currentState.socialConnection + socialScore + emotionalState.trust * 0.2) / 2;

    // Energy level (from response patterns)
    if (contextData.responseTime < 5000 && messageContent.length > 50) {
      updates.energyLevel = Math.min(1, currentState.energyLevel + 0.1);
    } else if (contextData.responseTime > 30000) {
      updates.energyLevel = Math.max(0, currentState.energyLevel - 0.1);
    }

    // Determine support needs
    const overallRisk = (updates.stressLevel || 0) + (updates.anxietyLevel || 0) + (updates.depressionRisk || 0);
    if (overallRisk > 1.5) {
      updates.needsSupport = true;
      updates.interventionLevel = overallRisk > 2.0 ? 'moderate' : 'gentle';
      
      if ((updates.depressionRisk || 0) > 0.7) {
        updates.supportType = 'professional';
      } else if ((updates.anxietyLevel || 0) > 0.7) {
        updates.supportType = 'emotional';
      } else if ((updates.socialConnection || 0) < 0.3) {
        updates.supportType = 'social';
      } else {
        updates.supportType = 'practical';
      }
    }

    return updates;
  }

  private assessLearningPersonality(
    messageContent: string,
    contextData: any,
    currentPersonality: LearningPersonality
  ): Partial<LearningPersonality> {
    const text = messageContent.toLowerCase();
    const updates: Partial<LearningPersonality> = {};

    // Learning style detection
    const visualIndicators = ['show me', 'picture', 'diagram', 'visual', 'see', 'image'];
    const auditoryIndicators = ['explain', 'tell me', 'sounds like', 'hear', 'listen'];
    const kinestheticIndicators = ['hands-on', 'practice', 'try', 'do', 'experience'];

    const visualScore = this.calculateIndicatorScore(text, visualIndicators);
    const auditoryScore = this.calculateIndicatorScore(text, auditoryIndicators);
    const kinestheticScore = this.calculateIndicatorScore(text, kinestheticIndicators);

    if (visualScore > auditoryScore && visualScore > kinestheticScore) {
      updates.type = 'visual';
    } else if (auditoryScore > kinestheticScore) {
      updates.type = 'auditory';
    } else if (kinestheticScore > 0) {
      updates.type = 'kinesthetic';
    }

    // Attention span assessment (based on message length and complexity)
    if (messageContent.length > 200 && contextData.responseTime > 30000) {
      updates.attentionSpan = 'long';
    } else if (messageContent.length < 50 && contextData.responseTime < 10000) {
      updates.attentionSpan = 'short';
    }

    // Curiosity and motivation
    const curiosityIndicators = ['why', 'how', 'what if', 'interesting', 'more', 'tell me about'];
    const curiosityScore = this.calculateIndicatorScore(text, curiosityIndicators);
    
    if (curiosityScore > 0.3) {
      updates.motivationDrivers = ['curiosity', ...(currentPersonality.motivationDrivers || [])].slice(0, 3) as any;
    }

    return updates;
  }

  private assessCommunicationStyle(
    messageContent: string,
    contextData: any,
    currentProfile: CommunicationProfile
  ): Partial<CommunicationProfile> {
    const text = messageContent.toLowerCase();
    const updates: Partial<CommunicationProfile> = {};

    // Formality assessment
    const formalIndicators = ['please', 'thank you', 'would you', 'could you', 'sir', 'madam'];
    const casualIndicators = ['hey', 'hi', 'yeah', 'ok', 'cool', 'awesome'];
    
    const formalScore = this.calculateIndicatorScore(text, formalIndicators);
    const casualScore = this.calculateIndicatorScore(text, casualIndicators);

    if (formalScore > casualScore * 1.5) {
      updates.formality = 'formal';
    } else if (casualScore > formalScore * 1.5) {
      updates.formality = 'casual';
    }

    // Emotional expression level
    const emotionWords = ['love', 'hate', 'excited', 'frustrated', 'amazing', 'terrible', 'wonderful', 'awful'];
    const emotionScore = this.calculateIndicatorScore(text, emotionWords);
    const punctuationIntensity = (messageContent.match(/[!?]{2,}/g) || []).length;

    if (emotionScore > 0.3 || punctuationIntensity > 0) {
      updates.emotionalExpression = 'expressive';
    } else if (emotionScore < 0.1 && punctuationIntensity === 0) {
      updates.emotionalExpression = 'reserved';
    }

    return updates;
  }

  private detectBehaviorPatterns(
    messageContent: string,
    emotionalState: EmotionalState,
    contextData: any
  ): BehaviorPattern[] {
    const detectedPatterns: BehaviorPattern[] = [];
    const text = messageContent.toLowerCase();

    // Check for stress patterns
    const stressPattern = this.behaviorPatternLibrary.get('high_stress')!;
    let stressScore = 0;
    
    if (contextData.typoCount > messageContent.length * 0.05) stressScore += 0.3;
    if (contextData.responseTime < 5000) stressScore += 0.2;
    if (contextData.punctuationIntensity > 2) stressScore += 0.2;
    if (text.includes('urgent') || text.includes('quickly')) stressScore += 0.3;

    if (stressScore > 0.4) {
      detectedPatterns.push({
        ...stressPattern,
        confidence: stressScore,
        detectedAt: Date.now()
      });
    }

    // Check for curiosity patterns
    const curiosityPattern = this.behaviorPatternLibrary.get('high_curiosity')!;
    const questionCount = (messageContent.match(/\?/g) || []).length;
    const curiosityWords = ['why', 'how', 'what', 'interesting', 'more', 'explain'];
    const curiosityScore = this.calculateIndicatorScore(text, curiosityWords) + 
                          (questionCount * 0.1) + 
                          (emotionalState.anticipation * 0.3);

    if (curiosityScore > 0.4) {
      detectedPatterns.push({
        ...curiosityPattern,
        confidence: curiosityScore,
        detectedAt: Date.now()
      });
    }

    // Check for social connection seeking
    const socialPattern = this.behaviorPatternLibrary.get('social_connection')!;
    const personalWords = ['i feel', 'my', 'me', 'myself', 'personal', 'share'];
    const socialWords = ['lonely', 'friend', 'alone', 'together', 'connect'];
    const socialScore = this.calculateIndicatorScore(text, [...personalWords, ...socialWords]) +
                       (emotionalState.trust * 0.2) + 
                       (contextData.messageLength > 100 ? 0.2 : 0);

    if (socialScore > 0.3) {
      detectedPatterns.push({
        ...socialPattern,
        confidence: socialScore,
        detectedAt: Date.now()
      });
    }

    return detectedPatterns;
  }

  private assessPersonalityTraits(
    messageContent: string,
    emotionalState: EmotionalState,
    contextData: any,
    currentTraits: any
  ): Partial<any> {
    const text = messageContent.toLowerCase();
    const updates: any = {};

    // Openness to experience
    const opennessWords = ['new', 'different', 'creative', 'innovative', 'explore', 'discover'];
    const opennessScore = this.calculateIndicatorScore(text, opennessWords);
    if (opennessScore > 0.2) {
      updates.openness = Math.min(1, currentTraits.openness + 0.1);
    }

    // Conscientiousness
    const conscientiousWords = ['plan', 'organize', 'schedule', 'careful', 'thorough', 'complete'];
    const conscientiousScore = this.calculateIndicatorScore(text, conscientiousWords);
    if (conscientiousScore > 0.2) {
      updates.conscientiousness = Math.min(1, currentTraits.conscientiousness + 0.1);
    }

    // Extraversion
    if (emotionalState.energy > 0.6 && emotionalState.joy > 0.5) {
      updates.extraversion = Math.min(1, currentTraits.extraversion + 0.05);
    } else if (emotionalState.energy < 0.4) {
      updates.extraversion = Math.max(0, currentTraits.extraversion - 0.05);
    }

    return updates;
  }

  private updateTimingPatterns(profile: PsychologicalProfile, contextData: any): void {
    const patterns = profile.timingPatterns;
    
    // Track active hours
    const currentHour = new Date().getHours();
    if (!patterns.activeHours.includes(currentHour)) {
      patterns.activeHours.push(currentHour);
      if (patterns.activeHours.length > 24) {
        patterns.activeHours = patterns.activeHours.slice(-24);
      }
    }

    // Track response times
    patterns.responseLatency.push(contextData.responseTime);
    if (patterns.responseLatency.length > 100) {
      patterns.responseLatency = patterns.responseLatency.slice(-50);
    }

    // Track session duration
    patterns.sessionDurations.push(contextData.sessionDuration);
    if (patterns.sessionDurations.length > 50) {
      patterns.sessionDurations = patterns.sessionDurations.slice(-25);
    }

    patterns.messageFrequency = (patterns.messageFrequency + 1) / Math.max(1, patterns.sessionDurations.length);
  }

  private updateProgressTracking(
    messageContent: string,
    emotionalState: EmotionalState,
    contextData: any,
    currentProgress: any
  ): Partial<any> {
    const text = messageContent.toLowerCase();
    const updates: any = {};

    // Learning velocity (how quickly they engage with new concepts)
    const learningWords = ['understand', 'got it', 'makes sense', 'clear', 'learned'];
    const learningScore = this.calculateIndicatorScore(text, learningWords);
    if (learningScore > 0.2) {
      updates.learningVelocity = Math.min(1, currentProgress.learningVelocity + 0.05);
    }

    // Curiosity index
    const questionCount = (messageContent.match(/\?/g) || []).length;
    if (questionCount > 0) {
      updates.curiosityIndex = Math.min(1, currentProgress.curiosityIndex + (questionCount * 0.02));
    }

    // Creativity score
    const creativeWords = ['creative', 'imagine', 'design', 'innovative', 'unique', 'original'];
    const creativityScore = this.calculateIndicatorScore(text, creativeWords);
    if (creativityScore > 0.1 || emotionalState.creativity > 0.6) {
      updates.creativityScore = Math.min(1, currentProgress.creativityScore + 0.05);
    }

    return updates;
  }

  private calculateIndicatorScore(text: string, indicators: string[]): number {
    let score = 0;
    const words = text.split(/\s+/);
    
    indicators.forEach(indicator => {
      if (text.includes(indicator)) {
        // Weight by frequency and inverse length (shorter indicators are more specific)
        const frequency = text.split(indicator).length - 1;
        const weight = frequency * (1 / Math.sqrt(indicator.length));
        score += weight * 0.1;
      }
    });

    return Math.min(1, score);
  }

  private mergeBehaviorPatterns(existing: BehaviorPattern[], detected: BehaviorPattern[]): BehaviorPattern[] {
    const merged = [...existing];
    
    detected.forEach(pattern => {
      const existingIndex = merged.findIndex(p => p.id === pattern.id);
      if (existingIndex >= 0) {
        // Update existing pattern
        merged[existingIndex] = {
          ...merged[existingIndex],
          confidence: (merged[existingIndex].confidence + pattern.confidence) / 2,
          frequency: merged[existingIndex].frequency + 1,
          detectedAt: pattern.detectedAt
        };
      } else {
        // Add new pattern
        merged.push({
          ...pattern,
          frequency: 1
        });
      }
    });

    // Keep only the most recent 10 patterns
    return merged.sort((a, b) => b.detectedAt - a.detectedAt).slice(0, 10);
  }

  private storeAssessmentHistory(userId: string, assessment: MentalHealthIndicators): void {
    let history = this.assessmentHistory.get(userId) || [];
    
    history.push({
      timestamp: Date.now(),
      assessment: {
        stressLevel: assessment.stressLevel,
        anxietyLevel: assessment.anxietyLevel,
        depressionRisk: assessment.depressionRisk,
        socialConnection: assessment.socialConnection
      },
      confidence: 0.8
    });

    // Keep last 100 assessments
    if (history.length > 100) {
      history = history.slice(-100);
    }

    this.assessmentHistory.set(userId, history);
  }

  /**
   * Gets the current psychological profile for a user
   */
  getUserProfile(userId: string): PsychologicalProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Generates personalized recommendations based on psychological profile
   */
  generatePersonalizedRecommendations(userId: string): {
    learningRecommendations: string[];
    communicationAdjustments: string[];
    supportSuggestions: string[];
    interventionNeeded: boolean;
  } {
    const profile = this.getUserProfile(userId);
    if (!profile) {
      return {
        learningRecommendations: [],
        communicationAdjustments: [],
        supportSuggestions: [],
        interventionNeeded: false
      };
    }

    const learningRecommendations: string[] = [];
    const communicationAdjustments: string[] = [];
    const supportSuggestions: string[] = [];

    // Learning recommendations
    if (profile.learningPersonality.type === 'visual') {
      learningRecommendations.push('Use more visual explanations and diagrams');
      learningRecommendations.push('Provide step-by-step visual guides');
    } else if (profile.learningPersonality.type === 'auditory') {
      learningRecommendations.push('Use more verbal explanations');
      learningRecommendations.push('Encourage discussion and questions');
    }

    if (profile.learningPersonality.attentionSpan === 'short') {
      learningRecommendations.push('Break information into smaller chunks');
      learningRecommendations.push('Use frequent summaries and checkpoints');
    }

    // Communication adjustments
    if (profile.communicationProfile.formality === 'formal') {
      communicationAdjustments.push('Maintain professional tone');
      communicationAdjustments.push('Use structured responses');
    } else if (profile.communicationProfile.formality === 'casual') {
      communicationAdjustments.push('Use friendly, conversational tone');
      communicationAdjustments.push('Include casual expressions and humor');
    }

    if (profile.communicationProfile.emotionalExpression === 'expressive') {
      communicationAdjustments.push('Match emotional energy in responses');
      communicationAdjustments.push('Use emotive language and expressions');
    }

    // Support suggestions
    if (profile.mentalHealth.stressLevel > 0.6) {
      supportSuggestions.push('Offer stress management techniques');
      supportSuggestions.push('Provide calming, reassuring responses');
    }

    if (profile.mentalHealth.socialConnection < 0.4) {
      supportSuggestions.push('Encourage social interaction');
      supportSuggestions.push('Provide more personal, engaging responses');
    }

    if (profile.mentalHealth.motivationLevel < 0.4) {
      supportSuggestions.push('Use encouraging, motivating language');
      supportSuggestions.push('Celebrate small wins and progress');
    }

    return {
      learningRecommendations,
      communicationAdjustments,
      supportSuggestions,
      interventionNeeded: profile.mentalHealth.interventionLevel !== 'none'
    };
  }
}

// Global behavioral psychology system instance
export const behavioralPsychologySystem = new BehavioralPsychologySystem();

export type { MentalHealthIndicators, LearningPersonality, BehaviorPattern };