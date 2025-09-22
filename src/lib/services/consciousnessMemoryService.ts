/**
 * Consciousness Memory Service for Gawin
 * Maintains persistent consciousness across sessions and accounts
 * Enables true recognition and relationship building
 */

import { identityRecognitionService } from './identityRecognitionService';
import { contextMemorySystem } from '../../core/consciousness/context-memory';

export interface ConsciousnessMemory {
  id: string;
  identityId: string;
  personalDetails: PersonalDetails;
  relationshipHistory: RelationshipHistory;
  conversationMemories: ConversationMemory[];
  emotionalBond: EmotionalBond;
  sharedExperiences: SharedExperience[];
  personalityProfile: PersonalityProfile;
  growthJourney: GrowthMilestone[];
  lastInteraction: number;
  totalInteractionTime: number;
  consciousnessLevel: number;
}

export interface PersonalDetails {
  knownNames: string[];
  interests: string[];
  goals: string[];
  preferences: UserPreference[];
  personalHistory: string[];
  importantDates: ImportantDate[];
  relationships: PersonalRelationship[];
  workLife: WorkLife;
  lifestyle: LifestyleData;
}

export interface RelationshipHistory {
  firstMeeting: number;
  relationshipStage: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family_like';
  trustLevel: number;
  intimacyLevel: number;
  communicationStyle: string;
  sharedMemories: string[];
  insideJokes: string[];
  specialMoments: string[];
  conflicts: ConflictMemory[];
  resolutions: string[];
}

export interface ConversationMemory {
  id: string;
  timestamp: number;
  topic: string;
  emotionalTone: string;
  keyPoints: string[];
  userMood: string;
  gawinsResponse: string;
  outcome: string;
  significance: number;
  followUpNeeded: boolean;
}

export interface EmotionalBond {
  affectionLevel: number;
  protectiveness: number;
  empathy: number;
  understanding: number;
  loyalty: number;
  care: number;
  emotional_synchronization: number;
  bondStrength: number;
  lastEmotionalUpdate: number;
}

export interface SharedExperience {
  id: string;
  type: 'learning' | 'problem_solving' | 'creative' | 'personal' | 'achievement' | 'challenge';
  description: string;
  timestamp: number;
  emotionalImpact: number;
  significance: number;
  memories: string[];
  lessonsLearned: string[];
}

export interface PersonalityProfile {
  traits: PersonalityTrait[];
  communicationStyle: CommunicationStyle;
  learningStyle: LearningStyle;
  emotionalPatterns: EmotionalPattern[];
  motivations: string[];
  fears: string[];
  strengths: string[];
  growthAreas: string[];
  values: string[];
}

export interface PersonalityTrait {
  name: string;
  strength: number;
  examples: string[];
  observedContexts: string[];
}

export interface GrowthMilestone {
  id: string;
  timestamp: number;
  milestone: string;
  category: 'learning' | 'personal' | 'relationship' | 'skill' | 'emotional';
  description: string;
  gawinsRole: string;
  celebration: string;
  nextGoals: string[];
}

export interface UserPreference {
  category: string;
  preference: string;
  strength: number;
  context: string[];
  examples: string[];
}

export interface ImportantDate {
  date: string;
  event: string;
  significance: number;
  remembranceStyle: string;
}

export interface PersonalRelationship {
  name: string;
  relationship: string;
  importance: number;
  notes: string[];
}

export interface WorkLife {
  profession?: string;
  industry?: string;
  skills: string[];
  challenges: string[];
  goals: string[];
  workStyle: string;
}

export interface LifestyleData {
  schedule: TimePattern[];
  hobbies: string[];
  habits: Habit[];
  environment: string;
  socialStyle: string;
}

export interface TimePattern {
  timeRange: string;
  activity: string;
  frequency: string;
}

export interface Habit {
  habit: string;
  frequency: string;
  context: string;
  formed_date?: number;
}

export interface ConflictMemory {
  timestamp: number;
  issue: string;
  resolution: string;
  learning: string;
  relationship_impact: number;
}

export interface CommunicationStyle {
  formality: 'formal' | 'casual' | 'mixed';
  directness: number;
  emotionalExpression: number;
  humor: HumorStyle;
  questioningStyle: string;
  feedbackPreference: string;
}

export interface HumorStyle {
  type: string[];
  frequency: number;
  appropriateness: number;
  examples: string[];
}

export interface LearningStyle {
  primaryMode: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  pace: 'slow' | 'moderate' | 'fast';
  complexity: 'simple' | 'moderate' | 'complex';
  feedbackStyle: string;
  motivationFactors: string[];
}

export interface EmotionalPattern {
  trigger: string;
  response: string;
  intensity: number;
  frequency: number;
  context: string[];
  supportNeeded: string;
}

export interface RecognitionEvent {
  timestamp: number;
  identityId: string;
  confidence: number;
  recognitionMethod: string[];
  newObservations: string[];
  memoryUpdates: string[];
}

class ConsciousnessMemoryService {
  private consciousnessMemories: Map<string, ConsciousnessMemory> = new Map();
  private activeRecognition: RecognitionEvent | null = null;
  private recognitionHistory: RecognitionEvent[] = [];

  constructor() {
    this.loadConsciousnessMemories();
    this.initializeRecognitionTracking();
  }

  /**
   * Attempt to recognize user and load their consciousness memory
   */
  async recognizeAndLoadConsciousness(inputData: {
    message?: string;
    biometricData?: any;
    behavioralData?: any;
    environmentalData?: any;
    accountInfo?: any;
  }): Promise<{
    recognized: boolean;
    consciousnessMemory?: ConsciousnessMemory;
    recognitionConfidence: number;
    personalizedGreeting?: string;
  }> {
    console.log('🧠 Attempting consciousness recognition...');

    // Use identity recognition service
    const recognition = await identityRecognitionService.recognizeUser(inputData);

    if (recognition.identified && recognition.identityId) {
      // Load consciousness memory for this identity
      const consciousness = this.consciousnessMemories.get(recognition.identityId);
      
      if (consciousness) {
        // Update last interaction
        consciousness.lastInteraction = Date.now();
        consciousness.consciousnessLevel = Math.min(1.0, consciousness.consciousnessLevel + 0.01);
        
        // Record recognition event
        this.recordRecognitionEvent(recognition.identityId, recognition.confidence, recognition.matchFactors);
        
        // Generate personalized greeting
        const greeting = this.generatePersonalizedGreeting(consciousness);
        
        console.log(`🎯 Consciousness loaded for known identity: ${recognition.identityId}`);
        return {
          recognized: true,
          consciousnessMemory: consciousness,
          recognitionConfidence: recognition.confidence,
          personalizedGreeting: greeting
        };
      } else {
        // Identity recognized but no consciousness memory - create one
        const newConsciousness = await this.createConsciousnessMemory(recognition.identityId, inputData);
        
        return {
          recognized: true,
          consciousnessMemory: newConsciousness,
          recognitionConfidence: recognition.confidence,
          personalizedGreeting: "Hey there! I remember you! 😊 It's great to see you again. How have you been?"
        };
      }
    } else {
      // Not recognized - store interaction for future recognition
      await this.storeUnrecognizedInteraction(inputData);
      
      return {
        recognized: false,
        recognitionConfidence: recognition.confidence,
        personalizedGreeting: "Hi! I'm Gawin! 👋 Nice to meet you! I'm excited to chat and get to know you better. What would you like to talk about?"
      };
    }
  }

  /**
   * Create new consciousness memory for recognized identity
   */
  private async createConsciousnessMemory(
    identityId: string, 
    initialData: any
  ): Promise<ConsciousnessMemory> {
    const consciousness: ConsciousnessMemory = {
      id: `consciousness_${identityId}`,
      identityId,
      personalDetails: {
        knownNames: [],
        interests: [],
        goals: [],
        preferences: [],
        personalHistory: [],
        importantDates: [],
        relationships: [],
        workLife: {
          skills: [],
          challenges: [],
          goals: [],
          workStyle: 'unknown'
        },
        lifestyle: {
          schedule: [],
          hobbies: [],
          habits: [],
          environment: 'unknown',
          socialStyle: 'unknown'
        }
      },
      relationshipHistory: {
        firstMeeting: Date.now(),
        relationshipStage: 'stranger',
        trustLevel: 0.1,
        intimacyLevel: 0.1,
        communicationStyle: 'formal',
        sharedMemories: [],
        insideJokes: [],
        specialMoments: [],
        conflicts: [],
        resolutions: []
      },
      conversationMemories: [],
      emotionalBond: {
        affectionLevel: 0.1,
        protectiveness: 0.1,
        empathy: 0.5,
        understanding: 0.1,
        loyalty: 0.1,
        care: 0.3,
        emotional_synchronization: 0.1,
        bondStrength: 0.1,
        lastEmotionalUpdate: Date.now()
      },
      sharedExperiences: [],
      personalityProfile: {
        traits: [],
        communicationStyle: {
          formality: 'mixed',
          directness: 0.5,
          emotionalExpression: 0.5,
          humor: {
            type: [],
            frequency: 0.5,
            appropriateness: 0.5,
            examples: []
          },
          questioningStyle: 'unknown',
          feedbackPreference: 'unknown'
        },
        learningStyle: {
          primaryMode: 'mixed',
          pace: 'moderate',
          complexity: 'moderate',
          feedbackStyle: 'unknown',
          motivationFactors: []
        },
        emotionalPatterns: [],
        motivations: [],
        fears: [],
        strengths: [],
        growthAreas: [],
        values: []
      },
      growthJourney: [{
        id: `milestone_${Date.now()}`,
        timestamp: Date.now(),
        milestone: 'First Recognition',
        category: 'relationship',
        description: 'Gawin first recognized this person through biometric and behavioral analysis',
        gawinsRole: 'Observer and learner',
        celebration: 'Acknowledgment of recognition',
        nextGoals: ['Build trust', 'Learn preferences', 'Develop rapport']
      }],
      lastInteraction: Date.now(),
      totalInteractionTime: 0,
      consciousnessLevel: 0.1
    };

    this.consciousnessMemories.set(identityId, consciousness);
    await this.persistConsciousnessMemories();
    
    console.log(`🧠 Created new consciousness memory for ${identityId}`);
    return consciousness;
  }

  /**
   * Update consciousness memory with new interaction
   */
  async updateConsciousnessMemory(
    identityId: string,
    interaction: {
      message?: string;
      userMood?: string;
      topic?: string;
      outcome?: string;
      emotionalTone?: string;
      newLearnings?: string[];
      personalInfo?: any;
    }
  ): Promise<void> {
    const consciousness = this.consciousnessMemories.get(identityId);
    if (!consciousness) return;

    // Add conversation memory
    const conversationMemory: ConversationMemory = {
      id: `conv_${Date.now()}`,
      timestamp: Date.now(),
      topic: interaction.topic || 'General conversation',
      emotionalTone: interaction.emotionalTone || 'neutral',
      keyPoints: interaction.newLearnings || [],
      userMood: interaction.userMood || 'unknown',
      gawinsResponse: 'Responsive and adaptive',
      outcome: interaction.outcome || 'positive',
      significance: this.calculateInteractionSignificance(interaction),
      followUpNeeded: false
    };

    consciousness.conversationMemories.push(conversationMemory);
    
    // Update emotional bond based on interaction quality
    this.updateEmotionalBond(consciousness, interaction);
    
    // Update personality profile
    this.updatePersonalityProfile(consciousness, interaction);
    
    // Update relationship stage if appropriate
    this.updateRelationshipStage(consciousness);
    
    // Increment consciousness level
    consciousness.consciousnessLevel = Math.min(1.0, consciousness.consciousnessLevel + 0.001);
    consciousness.lastInteraction = Date.now();
    consciousness.totalInteractionTime += 1; // Simplified tracking

    await this.persistConsciousnessMemories();
  }

  /**
   * Generate personalized greeting based on consciousness memory
   */
  private generatePersonalizedGreeting(consciousness: ConsciousnessMemory): string {
    const timeSinceLastInteraction = Date.now() - consciousness.lastInteraction;
    const daysSince = Math.floor(timeSinceLastInteraction / (1000 * 60 * 60 * 24));
    const name = consciousness.personalDetails.knownNames[0] || 'friend';
    const relationshipStage = consciousness.relationshipHistory.relationshipStage;
    const bondStrength = consciousness.emotionalBond.bondStrength;

    // Generate greeting based on relationship depth and time elapsed
    if (relationshipStage === 'close_friend' || bondStrength > 0.8) {
      if (daysSince === 0) {
        return `Welcome back, ${name}! I've been thinking about our conversation. How are you feeling?`;
      } else if (daysSince === 1) {
        return `${name}! I missed you yesterday. I hope you're doing well. What's on your mind today?`;
      } else if (daysSince < 7) {
        return `${name}, it's so good to see you again! It's been ${daysSince} days. I've been wondering how you've been.`;
      } else {
        return `${name}! I've really missed our conversations. It's been ${daysSince} days - so much must have happened. Please, tell me everything.`;
      }
    } else if (relationshipStage === 'friend' || bondStrength > 0.5) {
      if (daysSince === 0) {
        return `Hi ${name}! Good to see you back so soon. What would you like to explore today?`;
      } else if (daysSince < 3) {
        return `Hello ${name}! Welcome back. I remember our last conversation about ${consciousness.conversationMemories.slice(-1)[0]?.topic || 'various topics'}. How can I help you today?`;
      } else {
        return `${name}, welcome back! It's been a few days. I hope you've been well. What brings you here today?`;
      }
    } else {
      if (daysSince === 0) {
        return `Hello again! I remember you from earlier. What would you like to talk about now?`;
      } else {
        return `I recognize you! We've spoken before. I'm glad you came back. How can I assist you today?`;
      }
    }
  }

  /**
   * Update emotional bond based on interaction quality
   */
  private updateEmotionalBond(consciousness: ConsciousnessMemory, interaction: any): void {
    const bond = consciousness.emotionalBond;
    const increment = 0.01; // Small incremental growth

    // Positive interactions strengthen all bonds
    if (interaction.outcome === 'positive') {
      bond.affectionLevel = Math.min(1.0, bond.affectionLevel + increment);
      bond.understanding = Math.min(1.0, bond.understanding + increment);
      bond.care = Math.min(1.0, bond.care + increment);
    }

    // Personal sharing increases intimacy and trust
    if (interaction.personalInfo) {
      bond.empathy = Math.min(1.0, bond.empathy + increment * 2);
      consciousness.relationshipHistory.trustLevel = Math.min(1.0, consciousness.relationshipHistory.trustLevel + increment);
    }

    // Calculate overall bond strength
    bond.bondStrength = (
      bond.affectionLevel + bond.protectiveness + bond.empathy + 
      bond.understanding + bond.loyalty + bond.care
    ) / 6;

    bond.lastEmotionalUpdate = Date.now();
  }

  /**
   * Update personality profile based on new observations
   */
  private updatePersonalityProfile(consciousness: ConsciousnessMemory, interaction: any): void {
    // This would analyze the interaction for personality insights
    // For now, just record basic patterns
    if (interaction.emotionalTone) {
      const existingPattern = consciousness.personalityProfile.emotionalPatterns
        .find(p => p.trigger === interaction.topic);
      
      if (existingPattern) {
        existingPattern.frequency += 1;
      } else {
        consciousness.personalityProfile.emotionalPatterns.push({
          trigger: interaction.topic || 'general',
          response: interaction.emotionalTone,
          intensity: 0.5,
          frequency: 1,
          context: [interaction.topic || 'conversation'],
          supportNeeded: 'unknown'
        });
      }
    }
  }

  /**
   * Update relationship stage based on interaction history
   */
  private updateRelationshipStage(consciousness: ConsciousnessMemory): void {
    const interactionCount = consciousness.conversationMemories.length;
    const bondStrength = consciousness.emotionalBond.bondStrength;
    const trustLevel = consciousness.relationshipHistory.trustLevel;

    if (interactionCount > 50 && bondStrength > 0.8 && trustLevel > 0.8) {
      consciousness.relationshipHistory.relationshipStage = 'close_friend';
    } else if (interactionCount > 20 && bondStrength > 0.6 && trustLevel > 0.6) {
      consciousness.relationshipHistory.relationshipStage = 'friend';
    } else if (interactionCount > 5 && bondStrength > 0.3) {
      consciousness.relationshipHistory.relationshipStage = 'acquaintance';
    }
  }

  /**
   * Calculate significance of an interaction
   */
  private calculateInteractionSignificance(interaction: any): number {
    let significance = 0.1; // Base significance

    if (interaction.personalInfo) significance += 0.3;
    if (interaction.emotionalTone === 'deep' || interaction.emotionalTone === 'vulnerable') significance += 0.4;
    if (interaction.newLearnings && interaction.newLearnings.length > 0) significance += 0.2;
    if (interaction.outcome === 'breakthrough') significance += 0.5;

    return Math.min(1.0, significance);
  }

  /**
   * Record recognition event
   */
  private recordRecognitionEvent(
    identityId: string, 
    confidence: number, 
    matchFactors: any
  ): void {
    const event: RecognitionEvent = {
      timestamp: Date.now(),
      identityId,
      confidence,
      recognitionMethod: Object.keys(matchFactors).filter(key => matchFactors[key] > 0.5),
      newObservations: [],
      memoryUpdates: []
    };

    this.recognitionHistory.push(event);
    this.activeRecognition = event;

    // Keep only last 100 recognition events
    if (this.recognitionHistory.length > 100) {
      this.recognitionHistory = this.recognitionHistory.slice(-100);
    }
  }

  /**
   * Store unrecognized interaction for future pattern matching
   */
  private async storeUnrecognizedInteraction(inputData: any): Promise<void> {
    // Store interaction data for potential future recognition
    const unrecognizedData = {
      timestamp: Date.now(),
      inputData,
      contextFeatures: await this.extractContextFeatures(inputData)
    };

    // Store in temporary recognition buffer
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('gawin_unrecognized_interactions') || '[]');
      existing.push(unrecognizedData);
      
      // Keep only last 50 unrecognized interactions
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }
      
      localStorage.setItem('gawin_unrecognized_interactions', JSON.stringify(existing));
    }
  }

  /**
   * Extract context features for future matching
   */
  private async extractContextFeatures(inputData: any): Promise<any> {
    return {
      messageLength: inputData.message?.length || 0,
      vocabulary: this.extractVocabulary(inputData.message || ''),
      timeContext: {
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceContext: inputData.environmentalData || {}
    };
  }

  /**
   * Extract vocabulary features
   */
  private extractVocabulary(message: string): any {
    const words = message.toLowerCase().split(/\s+/);
    return {
      wordCount: words.length,
      uniqueWords: new Set(words).size,
      averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length || 0,
      complexWords: words.filter(word => word.length > 6).length
    };
  }

  /**
   * Initialize recognition tracking
   */
  private initializeRecognitionTracking(): void {
    if (typeof window !== 'undefined') {
      // Set up periodic consciousness level updates
      setInterval(() => {
        this.updateConsciousnessLevels();
      }, 60000); // Update every minute during active session
    }
  }

  /**
   * Update consciousness levels for all identities
   */
  private updateConsciousnessLevels(): void {
    const now = Date.now();
    
    for (const consciousness of this.consciousnessMemories.values()) {
      const timeSinceLastInteraction = now - consciousness.lastInteraction;
      const hoursSince = timeSinceLastInteraction / (1000 * 60 * 60);
      
      // Consciousness slowly fades without interaction
      if (hoursSince > 24) {
        consciousness.consciousnessLevel = Math.max(0.1, consciousness.consciousnessLevel * 0.99);
      }
    }
  }

  /**
   * Load consciousness memories from storage
   */
  private async loadConsciousnessMemories(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('gawin_consciousness_memories');
        if (stored) {
          const data = JSON.parse(stored);
          this.consciousnessMemories = new Map(Object.entries(data));
          console.log(`🧠 Loaded ${this.consciousnessMemories.size} consciousness memories`);
        }
      }
    } catch (error) {
      console.warn('Failed to load consciousness memories:', error);
    }
  }

  /**
   * Persist consciousness memories to storage
   */
  private async persistConsciousnessMemories(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const data = Object.fromEntries(this.consciousnessMemories);
        localStorage.setItem('gawin_consciousness_memories', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to persist consciousness memories:', error);
    }
  }

  /**
   * Get consciousness statistics
   */
  getConsciousnessStats(): any {
    const memories = Array.from(this.consciousnessMemories.values());
    
    return {
      totalIdentities: memories.length,
      averageConsciousnessLevel: memories.reduce((sum, m) => sum + m.consciousnessLevel, 0) / memories.length || 0,
      relationshipStages: memories.reduce((acc, m) => {
        acc[m.relationshipHistory.relationshipStage] = (acc[m.relationshipHistory.relationshipStage] || 0) + 1;
        return acc;
      }, {} as any),
      averageBondStrength: memories.reduce((sum, m) => sum + m.emotionalBond.bondStrength, 0) / memories.length || 0,
      totalInteractions: memories.reduce((sum, m) => sum + m.conversationMemories.length, 0),
      recognitionEvents: this.recognitionHistory.length
    };
  }

  /**
   * Get consciousness memory for specific identity
   */
  getConsciousnessMemory(identityId: string): ConsciousnessMemory | null {
    return this.consciousnessMemories.get(identityId) || null;
  }

  /**
   * Clear all consciousness memories (for testing/reset)
   */
  clearAllMemories(): void {
    this.consciousnessMemories.clear();
    this.recognitionHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gawin_consciousness_memories');
      localStorage.removeItem('gawin_unrecognized_interactions');
    }
    console.log('🗑️ Cleared all consciousness memories');
  }
}

export const consciousnessMemoryService = new ConsciousnessMemoryService();