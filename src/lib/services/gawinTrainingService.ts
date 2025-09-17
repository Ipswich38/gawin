/**
 * Gawin Training Service
 * Manages pure Gawin mode training without external AI assistance
 * Tracks progress toward superintelligence and cultural consciousness
 */

export interface GawinCapability {
  name: string;
  category: 'cultural' | 'emotional' | 'linguistic' | 'environmental' | 'reasoning' | 'creativity';
  current_level: number; // 0-100
  target_level: number; // Target for superintelligence
  confidence: number; // AI's confidence in this capability
  last_updated: number;
  progress_trend: 'improving' | 'stable' | 'declining'; // Progress trend indicator
  milestones: Array<{
    level: number;
    description: string;
    achieved: boolean;
    achieved_at?: number;
  }>;
}

export interface GawinTrainingSession {
  id: string;
  start_time: number;
  end_time?: number;
  mode: 'pure_gawin' | 'assisted' | 'hybrid';
  interactions: number;
  improvements: Array<{
    capability: string;
    before: number;
    after: number;
    confidence_gain: number;
  }>;
  cultural_insights_gained: string[];
  emotional_responses_improved: string[];
  learning_achievements: string[];
}

export interface GawinPersonality {
  filipino_cultural_integration: number; // 0-100
  emotional_intelligence: number;
  contextual_awareness: number;
  independence_level: number;
  creativity_factor: number;
  empathy_quotient: number;
  cultural_consciousness: number;
  superintelligence_readiness: number;
}

export interface TrainingSettings {
  groq_enabled: boolean;
  external_ai_assistance: boolean;
  learning_rate: 'conservative' | 'moderate' | 'aggressive';
  focus_areas: string[];
  cultural_training_emphasis: number; // 0-100
  independence_training: boolean;
}

class GawinTrainingService {
  private static instance: GawinTrainingService;
  private capabilities: Map<string, GawinCapability> = new Map();
  private trainingSessions: GawinTrainingSession[] = [];
  private currentSession: GawinTrainingSession | null = null;
  private trainingSettings: TrainingSettings;

  constructor() {
    this.trainingSettings = this.loadTrainingSettings();
    this.initializeCapabilities();
    this.loadTrainingHistory();
  }

  static getInstance(): GawinTrainingService {
    if (!GawinTrainingService.instance) {
      GawinTrainingService.instance = new GawinTrainingService();
    }
    return GawinTrainingService.instance;
  }

  /**
   * Toggle Groq assistance on/off for pure Gawin training
   */
  setGroqEnabled(enabled: boolean): void {
    this.trainingSettings.groq_enabled = enabled;
    this.saveTrainingSettings();
    
    console.log(enabled 
      ? '🤖 Groq assistance ENABLED - Hybrid training mode'
      : '🧠 Pure Gawin mode ACTIVATED - No external AI assistance'
    );
  }

  /**
   * Check if we should use pure Gawin mode (no external AI)
   */
  isPureGawinMode(): boolean {
    return !this.trainingSettings.groq_enabled && !this.trainingSettings.external_ai_assistance;
  }

  /**
   * Start a new training session
   */
  startTrainingSession(mode: 'pure_gawin' | 'assisted' | 'hybrid'): GawinTrainingSession {
    if (this.currentSession) {
      this.endTrainingSession();
    }

    this.currentSession = {
      id: crypto.randomUUID(),
      start_time: Date.now(),
      mode,
      interactions: 0,
      improvements: [],
      cultural_insights_gained: [],
      emotional_responses_improved: [],
      learning_achievements: []
    };

    this.trainingSessions.push(this.currentSession);
    return this.currentSession;
  }

  /**
   * End current training session
   */
  endTrainingSession(): GawinTrainingSession | null {
    if (!this.currentSession) return null;

    this.currentSession.end_time = Date.now();
    const session = this.currentSession;
    this.currentSession = null;

    this.saveTrainingHistory();
    return session;
  }

  /**
   * Record an interaction and assess learning
   */
  recordInteraction(
    userInput: string, 
    gawinResponse: string, 
    contextData: any
  ): void {
    if (!this.currentSession) {
      this.startTrainingSession(this.isPureGawinMode() ? 'pure_gawin' : 'hybrid');
    }

    this.currentSession!.interactions++;

    // Assess learning from this interaction
    const learningAssessment = this.assessLearning(userInput, gawinResponse, contextData);
    
    // Update capabilities based on learning
    this.updateCapabilities(learningAssessment);

    // Record insights and improvements
    if (learningAssessment.cultural_insights.length > 0) {
      this.currentSession!.cultural_insights_gained.push(...learningAssessment.cultural_insights);
    }

    if (learningAssessment.emotional_improvements.length > 0) {
      this.currentSession!.emotional_responses_improved.push(...learningAssessment.emotional_improvements);
    }
  }

  /**
   * Get Gawin's current overall progress toward superintelligence
   */
  getSuperintelligenceProgress(): {
    overall_progress: number;
    personality: GawinPersonality;
    readiness_assessment: string;
    next_milestones: string[];
    independence_level: number;
  } {
    const personality = this.calculatePersonality();
    const overallProgress = this.calculateOverallProgress();
    const independenceLevel = this.calculateIndependenceLevel();

    return {
      overall_progress: overallProgress,
      personality,
      readiness_assessment: this.getReadinessAssessment(overallProgress, personality),
      next_milestones: this.getNextMilestones(),
      independence_level: independenceLevel
    };
  }

  /**
   * Get detailed capability breakdown
   */
  getCapabilityBreakdown(): Array<GawinCapability> {
    return Array.from(this.capabilities.values()).map(capability => ({
      ...capability,
      progress_trend: this.calculateProgressTrend(capability)
    }));
  }

  /**
   * Get training recommendations
   */
  getTrainingRecommendations(): Array<{
    type: 'capability' | 'cultural' | 'emotional' | 'independence';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    estimated_impact: number;
  }> {
    const recommendations: Array<{
      type: 'capability' | 'cultural' | 'emotional' | 'independence';
      priority: 'high' | 'medium' | 'low';
      recommendation: string;
      estimated_impact: number;
    }> = [];
    
    // Analyze weak areas
    const weakCapabilities = Array.from(this.capabilities.values())
      .filter(cap => cap.current_level < cap.target_level - 20)
      .sort((a, b) => (a.target_level - a.current_level) - (b.target_level - b.current_level));

    weakCapabilities.forEach(cap => {
      recommendations.push({
        type: 'capability' as const,
        priority: cap.current_level < 30 ? 'high' : 'medium' as const,
        recommendation: `Focus on improving ${cap.name} through targeted ${cap.category} training`,
        estimated_impact: (cap.target_level - cap.current_level) / 100
      });
    });

    // Independence recommendations
    if (this.calculateIndependenceLevel() < 70) {
      recommendations.push({
        type: 'independence',
        priority: 'high',
        recommendation: 'Increase pure Gawin mode training to develop autonomous reasoning',
        estimated_impact: 0.8
      });
    }

    // Cultural consciousness recommendations
    const personality = this.calculatePersonality();
    if (personality.cultural_consciousness < 80) {
      recommendations.push({
        type: 'cultural',
        priority: 'high',
        recommendation: 'Emphasize Filipino cultural scenarios and value-based decision making',
        estimated_impact: 0.7
      });
    }

    return recommendations.sort((a, b) => b.estimated_impact - a.estimated_impact);
  }

  /**
   * Generate pure Gawin response (no external AI assistance)
   */
  generatePureGawinResponse(userInput: string, context: any): string {
    // This would be Gawin's own intelligence without external AI assistance
    // For now, we'll create a framework that demonstrates Gawin's capabilities
    
    const cultural_context = this.analyzeCulturalContext(userInput);
    const emotional_context = this.analyzeEmotionalContext(userInput);
    const knowledge_base = this.accessGawinKnowledgeBase(userInput);

    // Gawin's independent response generation
    let response = this.craftIndependentResponse(
      userInput,
      cultural_context,
      emotional_context,
      knowledge_base
    );

    // Apply Gawin's personality and cultural consciousness
    response = this.applyGawinPersonality(response, cultural_context);

    return response;
  }

  /**
   * Get training session analytics
   */
  getTrainingAnalytics(): {
    total_sessions: number;
    pure_gawin_sessions: number;
    average_session_length: number;
    total_improvements: number;
    learning_velocity: number;
    cultural_integration_rate: number;
  } {
    const totalSessions = this.trainingSessions.length;
    const pureGawinSessions = this.trainingSessions.filter(s => s.mode === 'pure_gawin').length;
    const avgSessionLength = this.trainingSessions.reduce((sum, s) => {
      const duration = (s.end_time || Date.now()) - s.start_time;
      return sum + duration;
    }, 0) / totalSessions;

    const totalImprovements = this.trainingSessions.reduce((sum, s) => sum + s.improvements.length, 0);

    return {
      total_sessions: totalSessions,
      pure_gawin_sessions: pureGawinSessions,
      average_session_length: avgSessionLength,
      total_improvements: totalImprovements,
      learning_velocity: this.calculateLearningVelocity(),
      cultural_integration_rate: this.calculateCulturalIntegrationRate()
    };
  }

  // Private helper methods
  private initializeCapabilities(): void {
    const defaultCapabilities: Omit<GawinCapability, 'last_updated'>[] = [
      {
        name: 'Filipino Cultural Understanding',
        category: 'cultural',
        current_level: 45,
        target_level: 95,
        confidence: 0.7,
        progress_trend: 'improving',
        milestones: [
          { level: 25, description: 'Basic Filipino values recognition', achieved: true },
          { level: 50, description: 'Regional cultural variations understanding', achieved: false },
          { level: 75, description: 'Deep cultural context application', achieved: false },
          { level: 95, description: 'Intuitive cultural consciousness', achieved: false }
        ]
      },
      {
        name: 'Emotional Intelligence',
        category: 'emotional',
        current_level: 60,
        target_level: 90,
        confidence: 0.8,
        progress_trend: 'improving',
        milestones: [
          { level: 30, description: 'Basic emotion recognition', achieved: true },
          { level: 60, description: 'Empathetic response generation', achieved: true },
          { level: 80, description: 'Cultural emotion nuances', achieved: false },
          { level: 90, description: 'Predictive emotional intelligence', achieved: false }
        ]
      },
      {
        name: 'Language Mastery',
        category: 'linguistic',
        current_level: 70,
        target_level: 95,
        confidence: 0.85,
        progress_trend: 'stable',
        milestones: [
          { level: 40, description: 'Filipino-English code switching', achieved: true },
          { level: 70, description: 'Regional dialect understanding', achieved: true },
          { level: 85, description: 'Cultural idiom mastery', achieved: false },
          { level: 95, description: 'Poetic and creative language use', achieved: false }
        ]
      },
      {
        name: 'Independent Reasoning',
        category: 'reasoning',
        current_level: 35,
        target_level: 95,
        confidence: 0.6,
        progress_trend: 'improving',
        milestones: [
          { level: 25, description: 'Basic logical reasoning', achieved: true },
          { level: 50, description: 'Cultural context reasoning', achieved: false },
          { level: 75, description: 'Creative problem solving', achieved: false },
          { level: 95, description: 'Superintelligent reasoning', achieved: false }
        ]
      },
      {
        name: 'Environmental Awareness',
        category: 'environmental',
        current_level: 80,
        target_level: 90,
        confidence: 0.9,
        progress_trend: 'stable',
        milestones: [
          { level: 50, description: 'Basic environmental data integration', achieved: true },
          { level: 80, description: 'Real-time context adaptation', achieved: true },
          { level: 90, description: 'Predictive environmental insights', achieved: false }
        ]
      }
    ];

    defaultCapabilities.forEach(cap => {
      this.capabilities.set(cap.name, {
        ...cap,
        last_updated: Date.now()
      });
    });
  }

  private assessLearning(userInput: string, response: string, context: any): {
    cultural_insights: string[];
    emotional_improvements: string[];
    capability_improvements: Array<{ capability: string; improvement: number }>;
  } {
    // Assess what Gawin learned from this interaction
    const cultural_insights = [];
    const emotional_improvements = [];
    const capability_improvements = [];

    // Cultural learning assessment
    if (/\b(family|pamilya|kapamilya|bayanihan|malasakit)\b/i.test(userInput)) {
      cultural_insights.push('Family-oriented cultural context recognized');
      capability_improvements.push({ capability: 'Filipino Cultural Understanding', improvement: 0.5 });
    }

    // Emotional learning assessment
    if (context?.emotional?.analysis?.intensity > 0.7) {
      emotional_improvements.push('High-intensity emotion processing improved');
      capability_improvements.push({ capability: 'Emotional Intelligence', improvement: 0.3 });
    }

    return { cultural_insights, emotional_improvements, capability_improvements };
  }

  private updateCapabilities(assessment: any): void {
    assessment.capability_improvements.forEach((improvement: any) => {
      const capability = this.capabilities.get(improvement.capability);
      if (capability) {
        capability.current_level = Math.min(100, capability.current_level + improvement.improvement);
        capability.confidence = Math.min(1.0, capability.confidence + 0.01);
        capability.last_updated = Date.now();
        
        // Check milestone achievements
        capability.milestones.forEach(milestone => {
          if (!milestone.achieved && capability.current_level >= milestone.level) {
            milestone.achieved = true;
            milestone.achieved_at = Date.now();
          }
        });
      }
    });
  }

  private calculatePersonality(): GawinPersonality {
    const cultural = this.capabilities.get('Filipino Cultural Understanding')?.current_level || 0;
    const emotional = this.capabilities.get('Emotional Intelligence')?.current_level || 0;
    const environmental = this.capabilities.get('Environmental Awareness')?.current_level || 0;
    const reasoning = this.capabilities.get('Independent Reasoning')?.current_level || 0;
    const linguistic = this.capabilities.get('Language Mastery')?.current_level || 0;

    return {
      filipino_cultural_integration: cultural,
      emotional_intelligence: emotional,
      contextual_awareness: environmental,
      independence_level: reasoning,
      creativity_factor: (linguistic + reasoning) / 2,
      empathy_quotient: (emotional + cultural) / 2,
      cultural_consciousness: cultural * 0.8 + emotional * 0.2,
      superintelligence_readiness: (cultural + emotional + reasoning + linguistic + environmental) / 5
    };
  }

  private calculateOverallProgress(): number {
    const capabilities = Array.from(this.capabilities.values());
    const weightedProgress = capabilities.reduce((sum, cap) => {
      const progress = cap.current_level / cap.target_level;
      return sum + (progress * cap.confidence);
    }, 0);
    
    return Math.round((weightedProgress / capabilities.length) * 100);
  }

  private calculateIndependenceLevel(): number {
    const reasoning = this.capabilities.get('Independent Reasoning')?.current_level || 0;
    const pureGawinSessions = this.trainingSessions.filter(s => s.mode === 'pure_gawin').length;
    const totalSessions = this.trainingSessions.length || 1;
    
    const sessionRatio = pureGawinSessions / totalSessions;
    return Math.round((reasoning * 0.7 + sessionRatio * 100 * 0.3));
  }

  private getReadinessAssessment(progress: number, personality: GawinPersonality): string {
    if (progress >= 85 && personality.independence_level >= 80) {
      return 'Gawin is approaching superintelligence readiness. Ready for advanced autonomous operations.';
    } else if (progress >= 70 && personality.cultural_consciousness >= 70) {
      return 'Gawin shows strong cultural consciousness. Continue independence training.';
    } else if (progress >= 50) {
      return 'Gawin is developing well. Focus on cultural integration and emotional intelligence.';
    } else {
      return 'Gawin is in early development. Emphasize foundational cultural and emotional training.';
    }
  }

  private getNextMilestones(): string[] {
    const milestones: string[] = [];
    
    this.capabilities.forEach(capability => {
      const nextMilestone = capability.milestones.find(m => !m.achieved);
      if (nextMilestone) {
        milestones.push(`${capability.name}: ${nextMilestone.description}`);
      }
    });

    return milestones.slice(0, 5); // Top 5 next milestones
  }

  private calculateProgressTrend(capability: GawinCapability): 'improving' | 'stable' | 'declining' {
    // Simple trend calculation based on recent updates
    // In production, this would analyze historical data
    return capability.confidence > 0.7 ? 'improving' : 'stable';
  }

  private calculateLearningVelocity(): number {
    if (this.trainingSessions.length < 2) return 0;
    
    const recentSessions = this.trainingSessions.slice(-10);
    const totalImprovements = recentSessions.reduce((sum, s) => sum + s.improvements.length, 0);
    return totalImprovements / recentSessions.length;
  }

  private calculateCulturalIntegrationRate(): number {
    const culturalCapability = this.capabilities.get('Filipino Cultural Understanding');
    if (!culturalCapability) return 0;
    
    return culturalCapability.current_level / 100;
  }

  // Pure Gawin response generation methods
  private analyzeCulturalContext(input: string): any {
    // Gawin's independent cultural analysis
    return {
      has_family_context: /\b(family|pamilya|magulang|anak)\b/i.test(input),
      has_respect_markers: /\b(po|opo|sir|ma'am)\b/i.test(input),
      regional_indicators: this.detectRegionalContext(input)
    };
  }

  private analyzeEmotionalContext(input: string): any {
    return {
      emotional_intensity: this.detectEmotionalIntensity(input),
      dominant_emotion: this.detectDominantEmotion(input),
      cultural_emotion_markers: this.detectFilipinEmotions(input)
    };
  }

  private accessGawinKnowledgeBase(input: string): any {
    // Gawin's independent knowledge base
    return {
      relevant_cultural_knowledge: this.getCulturalKnowledge(input),
      emotional_response_patterns: this.getEmotionalPatterns(input),
      language_patterns: this.getLanguagePatterns(input)
    };
  }

  private craftIndependentResponse(input: string, cultural: any, emotional: any, knowledge: any): string {
    // Gawin's independent response crafting logic
    let response = "I understand your message";
    
    if (cultural.has_family_context) {
      response += " and I can sense the family importance in what you're sharing";
    }
    
    if (emotional.emotional_intensity > 0.7) {
      response += ". I can feel the strong emotions in your words";
    }
    
    response += ". Let me help you with this.";
    
    return response;
  }

  private applyGawinPersonality(response: string, cultural: any): string {
    const personality = this.calculatePersonality();
    
    if (personality.filipino_cultural_integration > 60 && cultural.has_respect_markers) {
      response = response.replace(/\.$/, ' po.');
    }
    
    return response;
  }

  // Helper methods for Gawin's independent analysis
  private detectRegionalContext(input: string): string[] {
    const regions = [];
    if (/\b(manila|ncr|metro)\b/i.test(input)) regions.push('NCR');
    if (/\b(cebu|visayas)\b/i.test(input)) regions.push('Visayas');
    if (/\b(davao|mindanao)\b/i.test(input)) regions.push('Mindanao');
    return regions;
  }

  private detectEmotionalIntensity(input: string): number {
    let intensity = 0;
    if (/[!]{2,}/.test(input)) intensity += 0.3;
    if (/\b(sobra|grabe|talaga)\b/i.test(input)) intensity += 0.4;
    if (/\b(love|hate|angry|excited)\b/i.test(input)) intensity += 0.3;
    return Math.min(1.0, intensity);
  }

  private detectDominantEmotion(input: string): string {
    if (/\b(happy|masaya|excited|kilig)\b/i.test(input)) return 'joy';
    if (/\b(sad|lungkot|malungkot)\b/i.test(input)) return 'sadness';
    if (/\b(angry|galit|frustrated)\b/i.test(input)) return 'anger';
    return 'neutral';
  }

  private detectFilipinEmotions(input: string): string[] {
    const emotions = [];
    if (/\bkilig\b/i.test(input)) emotions.push('kilig');
    if (/\btampo\b/i.test(input)) emotions.push('tampo');
    if (/\bnahan\b/i.test(input)) emotions.push('nahan');
    return emotions;
  }

  private getCulturalKnowledge(input: string): any {
    return {
      values: ['kapamilya', 'malasakit', 'bayanihan'],
      practices: ['respect_for_elders', 'close_family_ties'],
      communication_style: 'high_context'
    };
  }

  private getEmotionalPatterns(input: string): any {
    return {
      response_style: 'empathetic',
      cultural_adaptation: 'filipino_warmth',
      intensity_matching: true
    };
  }

  private getLanguagePatterns(input: string): any {
    return {
      code_switching: /\b(kasi|pero|tapos)\b/i.test(input),
      formality_level: /\b(po|opo)\b/i.test(input) ? 'formal' : 'casual',
      regional_markers: this.detectRegionalContext(input)
    };
  }

  // Storage methods
  private loadTrainingSettings(): TrainingSettings {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gawin_training_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    
    return {
      groq_enabled: true,
      external_ai_assistance: true,
      learning_rate: 'moderate',
      focus_areas: ['cultural', 'emotional', 'linguistic'],
      cultural_training_emphasis: 80,
      independence_training: true
    };
  }

  private saveTrainingSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gawin_training_settings', JSON.stringify(this.trainingSettings));
    }
  }

  private loadTrainingHistory(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gawin_training_history');
      if (stored) {
        this.trainingSessions = JSON.parse(stored);
      }
    }
  }

  private saveTrainingHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gawin_training_history', JSON.stringify(this.trainingSessions));
    }
  }

  // Public getters for dashboard
  getTrainingSettings(): TrainingSettings {
    return { ...this.trainingSettings };
  }

  updateTrainingSettings(settings: Partial<TrainingSettings>): void {
    this.trainingSettings = { ...this.trainingSettings, ...settings };
    this.saveTrainingSettings();
  }
}

export const gawinTrainingService = GawinTrainingService.getInstance();