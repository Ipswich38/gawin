/**
 * Enhanced Affective Computing Service for Gawin
 * Provides advanced emotion recognition, empathy, and culturally-sensitive responses
 * Specifically enhanced for Filipino cultural context and emotional nuances
 */

export interface EmotionAnalysis {
  primary: string;
  secondary: string[];
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  culturalContext?: 'filipino' | 'western' | 'asian' | 'neutral';
  linguisticMarkers: string[];
}

export interface EmpathyResponse {
  empathyLevel: 'low' | 'medium' | 'high' | 'very_high';
  responseType: 'supportive' | 'encouraging' | 'validating' | 'solution_focused' | 'comforting';
  culturalAdaptation: string;
  suggestedTone: 'warm' | 'professional' | 'casual' | 'caring' | 'respectful';
  filipinoElements?: {
    kapamilya?: boolean; // family-oriented response
    pakikipagkunware?: boolean; // accommodation/harmony
    utangNaLoob?: boolean; // gratitude/debt of gratitude
    bayanihan?: boolean; // community spirit
    malasakit?: boolean; // compassionate care
  };
}

export interface EmotionalState {
  current: EmotionAnalysis;
  trend: 'improving' | 'declining' | 'stable';
  triggers: string[];
  coping_strategies: string[];
  support_needed: 'minimal' | 'moderate' | 'significant';
}

export interface CulturalContext {
  communicationStyle: 'direct' | 'indirect' | 'high_context' | 'low_context';
  faceConsiderations: boolean; // Saving face in Filipino culture
  hierarchyAwareness: boolean; // Respect for authority/age
  relationshipPriority: 'individual' | 'family' | 'community';
  religiousInfluence: boolean;
}

class AffectiveComputingService {
  private static instance: AffectiveComputingService;
  private emotionHistory: EmotionAnalysis[] = [];
  private culturalPatterns: Map<string, CulturalContext> = new Map();

  // Filipino emotion lexicon with cultural nuances
  private filipinoEmotionLexicon = {
    // Positive emotions
    masaya: { english: 'happy', intensity: 0.8, cultural_significance: 'community_joy' },
    kilig: { english: 'excited/thrilled', intensity: 0.9, cultural_significance: 'romantic_excitement' },
    proud: { english: 'proud', intensity: 0.7, cultural_significance: 'family_achievement' },
    grateful: { english: 'grateful', intensity: 0.8, cultural_significance: 'utang_na_loob' },
    
    // Negative emotions  
    nalulungkot: { english: 'sad', intensity: 0.6, cultural_significance: 'personal_grief' },
    galit: { english: 'angry', intensity: 0.8, cultural_significance: 'righteous_anger' },
    nahihiya: { english: 'embarrassed/shy', intensity: 0.5, cultural_significance: 'social_propriety' },
    worried: { english: 'worried', intensity: 0.6, cultural_significance: 'family_concern' },
    homesick: { english: 'homesick', intensity: 0.7, cultural_significance: 'ofw_longing' },
    
    // Complex Filipino emotions
    tampo: { english: 'silent_treatment/hurt', intensity: 0.6, cultural_significance: 'relationship_tension' },
    saya: { english: 'joy', intensity: 0.9, cultural_significance: 'collective_celebration' },
    lungkot: { english: 'melancholy', intensity: 0.5, cultural_significance: 'existential_sadness' },
    panghihinayang: { english: 'regret', intensity: 0.7, cultural_significance: 'missed_opportunity' }
  };

  // Filipino communication patterns
  private filipinoCommunicationPatterns = {
    indirectness: [
      'siguro', 'baka', 'parang', 'mukhang', 'hindi ko alam kung',
      'maybe', 'perhaps', 'i think', 'it seems like'
    ],
    politeness: [
      'po', 'opo', 'salamat', 'pasensya na', 'pakisuyo',
      'please', 'thank you', 'sorry', 'excuse me'
    ],
    emotional_intensifiers: [
      'sobrang', 'super', 'grabe', 'talaga', 'really',
      'very', 'extremely', 'so much'
    ],
    family_references: [
      'pamilya', 'family', 'magulang', 'parents', 'anak',
      'children', 'kapatid', 'siblings', 'lola', 'lolo'
    ]
  };

  static getInstance(): AffectiveComputingService {
    if (!AffectiveComputingService.instance) {
      AffectiveComputingService.instance = new AffectiveComputingService();
    }
    return AffectiveComputingService.instance;
  }

  /**
   * Analyze emotions in text with cultural context awareness
   */
  analyzeEmotions(text: string, culturalContext: 'filipino' | 'neutral' = 'neutral'): EmotionAnalysis {
    const lowercaseText = text.toLowerCase();
    const emotions = this.detectEmotions(lowercaseText, culturalContext);
    const linguisticMarkers = this.extractLinguisticMarkers(lowercaseText, culturalContext);
    
    const analysis: EmotionAnalysis = {
      primary: emotions.primary,
      secondary: emotions.secondary,
      intensity: emotions.intensity,
      confidence: emotions.confidence,
      culturalContext,
      linguisticMarkers
    };

    // Store in emotion history for trend analysis
    this.emotionHistory.push(analysis);
    if (this.emotionHistory.length > 50) {
      this.emotionHistory = this.emotionHistory.slice(-50);
    }

    return analysis;
  }

  /**
   * Generate empathetic response based on emotion analysis
   */
  generateEmpathyResponse(emotionAnalysis: EmotionAnalysis, conversationContext?: string): EmpathyResponse {
    const empathyLevel = this.determineEmpathyLevel(emotionAnalysis);
    const responseType = this.determineResponseType(emotionAnalysis);
    const culturalAdaptation = this.generateCulturalAdaptation(emotionAnalysis);
    const suggestedTone = this.determineTone(emotionAnalysis);
    const filipinoElements = this.identifyFilipinoElements(emotionAnalysis, conversationContext);

    return {
      empathyLevel,
      responseType,
      culturalAdaptation,
      suggestedTone,
      filipinoElements
    };
  }

  /**
   * Get current emotional state with trend analysis
   */
  getEmotionalState(): EmotionalState {
    if (this.emotionHistory.length === 0) {
      return {
        current: {
          primary: 'neutral',
          secondary: [],
          intensity: 0.5,
          confidence: 0.5,
          linguisticMarkers: []
        },
        trend: 'stable',
        triggers: [],
        coping_strategies: [],
        support_needed: 'minimal'
      };
    }

    const current = this.emotionHistory[this.emotionHistory.length - 1];
    const trend = this.analyzeTrend();
    const triggers = this.identifyTriggers();
    const coping_strategies = this.suggestCopingStrategies(current);
    const support_needed = this.assessSupportNeeded(current);

    return {
      current,
      trend,
      triggers,
      coping_strategies,
      support_needed
    };
  }

  /**
   * Generate culturally appropriate empathetic responses
   */
  generateCulturallyAdaptedResponse(
    emotionAnalysis: EmotionAnalysis, 
    empathyResponse: EmpathyResponse
  ): string[] {
    const responses: string[] = [];

    if (emotionAnalysis.culturalContext === 'filipino') {
      // Filipino-specific empathetic responses
      if (empathyResponse.filipinoElements?.malasakit) {
        responses.push("Naiintindihan ko ang nararamdaman mo. I'm here to support you through this.");
      }
      
      if (empathyResponse.filipinoElements?.kapamilya) {
        responses.push("Remember, you're not alone in this - we face challenges together as a family.");
      }
      
      if (empathyResponse.filipinoElements?.bayanihan) {
        responses.push("This reminds me of the Filipino spirit of bayanihan - we help each other through difficult times.");
      }

      // Emotion-specific Filipino responses
      if (emotionAnalysis.primary === 'homesick') {
        responses.push("Ang hirap ng malayo sa pamilya. Your feelings are completely valid - family connections are precious.");
      }
      
      if (emotionAnalysis.primary === 'nahihiya') {
        responses.push("It's okay to feel shy or embarrassed - these feelings show your thoughtfulness for others.");
      }
      
      if (emotionAnalysis.primary === 'tampo') {
        responses.push("I can sense you might be feeling hurt. Sometimes silent feelings speak the loudest.");
      }
    }

    // Universal empathetic responses adapted for cultural context
    switch (emotionAnalysis.primary) {
      case 'sad':
      case 'nalulungkot':
        responses.push("I'm sorry you're going through this difficult time. Your feelings matter, and it's important to acknowledge them.");
        break;
        
      case 'angry':
      case 'galit':
        responses.push("I can understand why you'd feel frustrated about this. Sometimes anger shows us what's important to us.");
        break;
        
      case 'worried':
        responses.push("Worry shows how much you care. Let's think through this together and find some clarity.");
        break;
        
      case 'happy':
      case 'masaya':
        responses.push("It's wonderful to hear the joy in your words! These positive moments are so important.");
        break;
    }

    return responses;
  }

  /**
   * Provide emotional support recommendations
   */
  getEmotionalSupportRecommendations(emotionalState: EmotionalState): Array<{
    category: string;
    recommendation: string;
    cultural_relevance: number;
  }> {
    const recommendations = [];

    // Cultural support strategies
    if (emotionalState.current.culturalContext === 'filipino') {
      recommendations.push({
        category: 'family_connection',
        recommendation: 'Consider reaching out to family members - Filipino families are often the strongest source of emotional support',
        cultural_relevance: 0.9
      });

      recommendations.push({
        category: 'community_support',
        recommendation: 'Connect with your local Filipino community or church for additional support and understanding',
        cultural_relevance: 0.8
      });
    }

    // General emotional support
    if (emotionalState.support_needed === 'significant') {
      recommendations.push({
        category: 'professional_help',
        recommendation: 'Consider speaking with a counselor or therapist who understands your cultural background',
        cultural_relevance: 0.7
      });
    }

    // Emotion-specific recommendations
    switch (emotionalState.current.primary) {
      case 'homesick':
        recommendations.push({
          category: 'connection',
          recommendation: 'Schedule regular video calls with family and maintain Filipino traditions in your current location',
          cultural_relevance: 0.9
        });
        break;
        
      case 'stressed':
        recommendations.push({
          category: 'stress_management',
          recommendation: 'Try Filipino relaxation techniques like listening to OPM music or preparing comfort food from home',
          cultural_relevance: 0.8
        });
        break;
    }

    return recommendations;
  }

  // Private helper methods
  private detectEmotions(text: string, culturalContext: string): {
    primary: string;
    secondary: string[];
    intensity: number;
    confidence: number;
  } {
    const emotionScores: Map<string, number> = new Map();

    // Check for Filipino emotional expressions
    if (culturalContext === 'filipino') {
      Object.entries(this.filipinoEmotionLexicon).forEach(([filipino, data]) => {
        if (text.includes(filipino) || text.includes(data.english)) {
          emotionScores.set(data.english, data.intensity);
        }
      });
    }

    // Basic emotion detection patterns
    const emotionPatterns = {
      happy: /happy|joy|excited|glad|pleased|cheerful|elated|content/gi,
      sad: /sad|depressed|down|unhappy|miserable|gloomy|melancholy/gi,
      angry: /angry|mad|furious|irritated|annoyed|frustrated|rage/gi,
      fear: /afraid|scared|terrified|anxious|worried|nervous|panic/gi,
      love: /love|adore|cherish|affection|care|devoted/gi,
      surprise: /surprised|amazed|shocked|astonished|stunned/gi
    };

    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        const score = matches.length * 0.3 + (emotionScores.get(emotion) || 0);
        emotionScores.set(emotion, score);
      }
    });

    // Sort emotions by score
    const sortedEmotions = Array.from(emotionScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const primary = sortedEmotions[0]?.[0] || 'neutral';
    const secondary = sortedEmotions.slice(1, 3).map(([emotion]) => emotion);
    const intensity = Math.min(sortedEmotions[0]?.[1] || 0.5, 1.0);
    const confidence = emotionScores.size > 0 ? 0.8 : 0.3;

    return { primary, secondary, intensity, confidence };
  }

  private extractLinguisticMarkers(text: string, culturalContext: string): string[] {
    const markers: string[] = [];

    if (culturalContext === 'filipino') {
      // Check for Filipino linguistic patterns
      Object.entries(this.filipinoCommunicationPatterns).forEach(([type, patterns]) => {
        patterns.forEach(pattern => {
          if (text.includes(pattern.toLowerCase())) {
            markers.push(`${type}: ${pattern}`);
          }
        });
      });
    }

    // Universal linguistic markers
    if (/[!]{2,}/.test(text)) markers.push('high_intensity_punctuation');
    if (/[.]{3,}/.test(text)) markers.push('hesitation_or_trailing_thought');
    if (/[?]{2,}/.test(text)) markers.push('confusion_or_uncertainty');
    if (text.includes('...')) markers.push('pause_or_contemplation');

    return markers;
  }

  private determineEmpathyLevel(emotionAnalysis: EmotionAnalysis): 'low' | 'medium' | 'high' | 'very_high' {
    if (emotionAnalysis.intensity > 0.8) return 'very_high';
    if (emotionAnalysis.intensity > 0.6) return 'high';
    if (emotionAnalysis.intensity > 0.4) return 'medium';
    return 'low';
  }

  private determineResponseType(emotionAnalysis: EmotionAnalysis): 'supportive' | 'encouraging' | 'validating' | 'solution_focused' | 'comforting' {
    const negativeEmotions = ['sad', 'angry', 'fear', 'nalulungkot', 'galit'];
    const positiveEmotions = ['happy', 'love', 'masaya', 'kilig'];

    if (negativeEmotions.includes(emotionAnalysis.primary)) {
      return emotionAnalysis.intensity > 0.7 ? 'comforting' : 'supportive';
    }
    
    if (positiveEmotions.includes(emotionAnalysis.primary)) {
      return 'encouraging';
    }

    return 'validating';
  }

  private generateCulturalAdaptation(emotionAnalysis: EmotionAnalysis): string {
    if (emotionAnalysis.culturalContext === 'filipino') {
      return "Incorporating Filipino values of malasakit (compassionate care) and pakikipagkunware (accommodation)";
    }
    return "Using culturally neutral empathetic communication";
  }

  private determineTone(emotionAnalysis: EmotionAnalysis): 'warm' | 'professional' | 'casual' | 'caring' | 'respectful' {
    if (emotionAnalysis.intensity > 0.7) return 'caring';
    if (emotionAnalysis.culturalContext === 'filipino') return 'warm';
    return 'respectful';
  }

  private identifyFilipinoElements(emotionAnalysis: EmotionAnalysis, context?: string): EmpathyResponse['filipinoElements'] {
    if (emotionAnalysis.culturalContext !== 'filipino') return undefined;

    const elements: EmpathyResponse['filipinoElements'] = {};
    const text = context?.toLowerCase() || '';

    // Detect Filipino cultural elements based on context
    if (text.includes('family') || text.includes('pamilya')) {
      elements.kapamilya = true;
    }
    
    if (emotionAnalysis.primary === 'sad' || emotionAnalysis.primary === 'worried') {
      elements.malasakit = true;
    }
    
    if (text.includes('help') || text.includes('support') || text.includes('community')) {
      elements.bayanihan = true;
    }

    return Object.keys(elements).length > 0 ? elements : undefined;
  }

  private analyzeTrend(): 'improving' | 'declining' | 'stable' {
    if (this.emotionHistory.length < 3) return 'stable';

    const recent = this.emotionHistory.slice(-3);
    const intensities = recent.map(e => e.intensity);
    
    const isImproving = intensities.every((val, i) => i === 0 || val >= intensities[i - 1]);
    const isDeclining = intensities.every((val, i) => i === 0 || val <= intensities[i - 1]);

    if (isImproving) return 'improving';
    if (isDeclining) return 'declining';
    return 'stable';
  }

  private identifyTriggers(): string[] {
    // Analyze emotion history to identify potential triggers
    const triggers: string[] = [];
    
    // This would be enhanced with more sophisticated pattern recognition
    const recentNegative = this.emotionHistory.slice(-5).filter(e => 
      ['sad', 'angry', 'fear', 'nalulungkot', 'galit'].includes(e.primary)
    );

    if (recentNegative.length > 2) {
      triggers.push('recurring_stress_pattern');
    }

    return triggers;
  }

  private suggestCopingStrategies(emotionAnalysis: EmotionAnalysis): string[] {
    const strategies: string[] = [];

    switch (emotionAnalysis.primary) {
      case 'sad':
      case 'nalulungkot':
        strategies.push('Express your feelings through journaling or talking to trusted friends');
        strategies.push('Engage in activities that bring you comfort');
        break;
        
      case 'angry':
      case 'galit':
        strategies.push('Take deep breaths and count to ten before responding');
        strategies.push('Channel energy into physical activity or creative expression');
        break;
        
      case 'worried':
        strategies.push('Break down problems into manageable steps');
        strategies.push('Practice mindfulness or meditation techniques');
        break;
    }

    if (emotionAnalysis.culturalContext === 'filipino') {
      strategies.push('Connect with family or Filipino community for support');
      strategies.push('Consider traditional Filipino wellness practices');
    }

    return strategies;
  }

  private assessSupportNeeded(emotionAnalysis: EmotionAnalysis): 'minimal' | 'moderate' | 'significant' {
    if (emotionAnalysis.intensity > 0.8) return 'significant';
    if (emotionAnalysis.intensity > 0.6) return 'moderate';
    return 'minimal';
  }
}

export const affectiveComputingService = AffectiveComputingService.getInstance();