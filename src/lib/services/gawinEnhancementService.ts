/**
 * Gawin Enhancement Integration Service
 * Integrates all new AI capabilities: environmental awareness, affective computing,
 * Philippine data, and Filipino NLP for a comprehensive sensorimotor AI experience
 */

import { environmentalAwarenessService, type EnvironmentalContext } from './environmentalAwarenessService';
import { affectiveComputingService, type EmotionAnalysis, type EmpathyResponse } from './affectiveComputingService';
import { philippineDataService } from './philippineDataService';
import { filipinoNLPService, type FilipinoLanguageAnalysis } from './filipinoNLPService';

export interface GawinEnhancedContext {
  environmental: EnvironmentalContext;
  emotional: {
    analysis: EmotionAnalysis;
    empathy_response: EmpathyResponse;
  };
  linguistic: FilipinoLanguageAnalysis;
  cultural: {
    region: string;
    formality_level: string;
    cultural_adaptations: string[];
  };
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
    cultural_relevance: number;
  }>;
}

export interface EnhancedPromptContext {
  original_prompt: string;
  enhanced_prompt: string;
  context_additions: string[];
  cultural_instructions: string[];
  empathy_guidelines: string[];
}

class GawinEnhancementService {
  private static instance: GawinEnhancementService;
  private contextCache: Map<string, GawinEnhancedContext> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): GawinEnhancementService {
    if (!GawinEnhancementService.instance) {
      GawinEnhancementService.instance = new GawinEnhancementService();
    }
    return GawinEnhancementService.instance;
  }

  /**
   * Generate comprehensive enhanced context for Gawin's responses
   */
  async generateEnhancedContext(
    userMessage: string,
    userLocation?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<GawinEnhancedContext> {
    try {
      // Generate all contexts in parallel for optimal performance
      const [environmental, emotional, linguistic] = await Promise.all([
        this.getEnvironmentalContext(userLocation),
        this.getEmotionalContext(userMessage, conversationHistory),
        this.getLinguisticContext(userMessage)
      ]);

      const cultural = this.generateCulturalContext(linguistic, environmental);
      const recommendations = this.generateRecommendations(environmental, emotional, linguistic);

      const enhancedContext: GawinEnhancedContext = {
        environmental,
        emotional,
        linguistic,
        cultural,
        recommendations
      };

      // Cache the context
      const cacheKey = this.generateCacheKey(userMessage, userLocation);
      this.contextCache.set(cacheKey, enhancedContext);

      return enhancedContext;
    } catch (error) {
      console.error('Enhanced context generation failed:', error);
      return this.getFallbackContext(userMessage);
    }
  }

  /**
   * Enhance system prompts with cultural and environmental awareness
   */
  enhanceSystemPrompt(
    originalPrompt: string,
    enhancedContext: GawinEnhancedContext,
    taskType: 'general' | 'coding' | 'analysis' | 'writing' = 'general'
  ): EnhancedPromptContext {
    const contextAdditions = this.generateContextAdditions(enhancedContext);
    const culturalInstructions = this.generateCulturalInstructions(enhancedContext);
    const empathyGuidelines = this.generateEmpathyGuidelines(enhancedContext);

    const enhancedPrompt = this.buildEnhancedPrompt(
      originalPrompt,
      contextAdditions,
      culturalInstructions,
      empathyGuidelines,
      taskType
    );

    return {
      original_prompt: originalPrompt,
      enhanced_prompt: enhancedPrompt,
      context_additions: contextAdditions,
      cultural_instructions: culturalInstructions,
      empathy_guidelines: empathyGuidelines
    };
  }

  /**
   * Get contextual insights for responses
   */
  getContextualInsights(context: GawinEnhancedContext): Array<{
    type: 'environmental' | 'emotional' | 'cultural' | 'linguistic';
    insight: string;
    actionable: boolean;
  }> {
    const insights = [];

    // Environmental insights
    const envInsights = environmentalAwarenessService.generateContextualInsights(context.environmental);
    envInsights.forEach(insight => {
      insights.push({
        type: 'environmental' as const,
        insight,
        actionable: true
      });
    });

    // Emotional insights
    if (context.emotional.analysis.intensity > 0.7) {
      insights.push({
        type: 'emotional' as const,
        insight: `User is experiencing strong ${context.emotional.analysis.primary} emotions - respond with enhanced empathy`,
        actionable: true
      });
    }

    // Cultural insights
    if (context.linguistic.cultural_markers.length > 0) {
      insights.push({
        type: 'cultural' as const,
        insight: `Cultural context detected: ${context.linguistic.cultural_markers.join(', ')} - adapt response accordingly`,
        actionable: true
      });
    }

    // Linguistic insights
    if (context.linguistic.code_switching) {
      insights.push({
        type: 'linguistic' as const,
        insight: 'User is code-switching between languages - mirror this communication style',
        actionable: true
      });
    }

    return insights;
  }

  /**
   * Generate response recommendations based on context
   */
  generateResponseRecommendations(context: GawinEnhancedContext): Array<{
    aspect: string;
    recommendation: string;
    examples: string[];
  }> {
    const recommendations = [];

    // Emotional response recommendations
    if (context.emotional.empathy_response.empathyLevel === 'very_high') {
      recommendations.push({
        aspect: 'emotional_support',
        recommendation: 'Provide deep empathetic support with cultural sensitivity',
        examples: affectiveComputingService.generateCulturallyAdaptedResponse(
          context.emotional.analysis,
          context.emotional.empathy_response
        )
      });
    }

    // Cultural response recommendations
    if (context.linguistic.language === 'filipino' || context.linguistic.language === 'mixed') {
      const adaptation = filipinoNLPService.generateResponseAdaptation(context.linguistic);
      recommendations.push({
        aspect: 'cultural_adaptation',
        recommendation: `Use ${adaptation.suggested_tone} tone with appropriate honorifics`,
        examples: adaptation.suggested_expressions
      });
    }

    // Environmental response recommendations
    if (context.environmental.weather.current.temperature > 32) {
      recommendations.push({
        aspect: 'environmental_awareness',
        recommendation: 'Acknowledge the hot weather and suggest heat-related considerations',
        examples: ['Stay cool and hydrated in this heat!', 'Perfect weather to stay indoors with AC']
      });
    }

    return recommendations;
  }

  /**
   * Check if user needs enhanced support based on context
   */
  assessSupportLevel(context: GawinEnhancedContext): {
    level: 'minimal' | 'moderate' | 'significant' | 'critical';
    areas: string[];
    recommendations: string[];
  } {
    let supportLevel: 'minimal' | 'moderate' | 'significant' | 'critical' = 'minimal';
    const areas: string[] = [];
    const recommendations: string[] = [];

    // Emotional support assessment
    if (context.emotional.analysis.intensity > 0.8) {
      supportLevel = 'significant';
      areas.push('emotional_support');
      recommendations.push('Provide enhanced empathetic responses');
    }

    // Environmental stress assessment
    const envRecommendations = environmentalAwarenessService.getEnvironmentalRecommendations(context.environmental);
    const highPriorityEnv = envRecommendations.filter(r => r.priority === 'high');
    if (highPriorityEnv.length > 0) {
      supportLevel = supportLevel === 'minimal' ? 'moderate' : supportLevel;
      areas.push('environmental_guidance');
      recommendations.push('Address environmental concerns proactively');
    }

    // Cultural navigation assessment
    if (context.linguistic.language === 'mixed' && context.linguistic.formality_level === 'formal') {
      areas.push('cultural_navigation');
      recommendations.push('Provide culturally appropriate guidance');
    }

    return { level: supportLevel, areas, recommendations };
  }

  // Private helper methods
  private async getEnvironmentalContext(userLocation?: string): Promise<EnvironmentalContext> {
    return await environmentalAwarenessService.getEnvironmentalContext(userLocation);
  }

  private async getEmotionalContext(
    userMessage: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<{ analysis: EmotionAnalysis; empathy_response: EmpathyResponse }> {
    const analysis = affectiveComputingService.analyzeEmotions(
      userMessage,
      this.detectCulturalContext(userMessage)
    );
    
    const empathy_response = affectiveComputingService.generateEmpathyResponse(
      analysis,
      conversationHistory?.slice(-3).map(h => h.content).join(' ')
    );

    return { analysis, empathy_response };
  }

  private async getLinguisticContext(userMessage: string): Promise<FilipinoLanguageAnalysis> {
    return filipinoNLPService.analyzeFilipinoLanguage(userMessage);
  }

  private generateCulturalContext(
    linguistic: FilipinoLanguageAnalysis,
    environmental: EnvironmentalContext
  ): { region: string; formality_level: string; cultural_adaptations: string[] } {
    const region = environmental.userLocation?.region || 'NCR';
    const adaptations: string[] = [];

    if (linguistic.language === 'filipino' || linguistic.language === 'mixed') {
      adaptations.push('Use Filipino cultural references and expressions');
    }

    if (linguistic.formality_level === 'formal' || linguistic.formality_level === 'respectful') {
      adaptations.push('Maintain respectful tone with appropriate honorifics');
    }

    if (environmental.weather.current.condition.includes('Rain')) {
      adaptations.push('Consider weather-related cultural references (e.g., rainy season activities)');
    }

    return {
      region,
      formality_level: linguistic.formality_level,
      cultural_adaptations: adaptations
    };
  }

  private generateRecommendations(
    environmental: EnvironmentalContext,
    emotional: { analysis: EmotionAnalysis; empathy_response: EmpathyResponse },
    linguistic: FilipinoLanguageAnalysis
  ): Array<{ category: string; suggestion: string; priority: 'low' | 'medium' | 'high'; cultural_relevance: number }> {
    const recommendations = [];

    // Environmental recommendations
    const envRecommendations = environmentalAwarenessService.getEnvironmentalRecommendations(environmental);
    envRecommendations.forEach(rec => {
      recommendations.push({
        category: rec.category,
        suggestion: rec.recommendation,
        priority: rec.priority,
        cultural_relevance: 0.8
      });
    });

    // Emotional recommendations
    const emotionalState = affectiveComputingService.getEmotionalState();
    const emotionalSupport = affectiveComputingService.getEmotionalSupportRecommendations(emotionalState);
    emotionalSupport.forEach(rec => {
      recommendations.push({
        category: rec.category,
        suggestion: rec.recommendation,
        priority: 'medium',
        cultural_relevance: rec.cultural_relevance
      });
    });

    // Regional recommendations
    if (environmental.userLocation?.region) {
      const regionalInsights = philippineDataService.getRegionalInsights(environmental.userLocation.region);
      regionalInsights.forEach(insight => {
        recommendations.push({
          category: insight.category,
          suggestion: insight.insight,
          priority: insight.relevance > 0.8 ? 'high' : 'medium',
          cultural_relevance: insight.relevance
        });
      });
    }

    return recommendations;
  }

  private generateContextAdditions(context: GawinEnhancedContext): string[] {
    const additions: string[] = [];

    // Environmental context
    additions.push(`Current environment: ${context.environmental.weather.current.condition}, ${context.environmental.weather.current.temperature}°C in ${context.environmental.weather.location.city}`);

    // Emotional context
    if (context.emotional.analysis.intensity > 0.6) {
      additions.push(`User emotional state: ${context.emotional.analysis.primary} (intensity: ${Math.round(context.emotional.analysis.intensity * 100)}%)`);
    }

    // Cultural context
    if (context.linguistic.cultural_markers.length > 0) {
      additions.push(`Cultural markers detected: ${context.linguistic.cultural_markers.join(', ')}`);
    }

    return additions;
  }

  private generateCulturalInstructions(context: GawinEnhancedContext): string[] {
    const instructions: string[] = [];

    if (context.linguistic.language === 'filipino' || context.linguistic.language === 'mixed') {
      instructions.push('Incorporate Filipino cultural values of malasakit, kapamilya, and bayanihan in your response');
      instructions.push('Use appropriate Filipino expressions and honorifics when culturally relevant');
    }

    if (context.linguistic.formality_level === 'formal' || context.linguistic.formality_level === 'respectful') {
      instructions.push('Maintain respectful and formal tone throughout the conversation');
    }

    if (context.cultural.region !== 'NCR') {
      instructions.push(`Consider regional context of ${context.cultural.region} in your response`);
    }

    return instructions;
  }

  private generateEmpathyGuidelines(context: GawinEnhancedContext): string[] {
    const guidelines: string[] = [];

    if (context.emotional.empathy_response.empathyLevel === 'very_high') {
      guidelines.push('Provide exceptional emotional support with deep understanding and validation');
    }

    if (context.emotional.empathy_response.filipinoElements?.malasakit) {
      guidelines.push('Express malasakit (compassionate care) in your response');
    }

    if (context.emotional.empathy_response.responseType === 'comforting') {
      guidelines.push('Focus on providing comfort and emotional relief');
    }

    return guidelines;
  }

  private buildEnhancedPrompt(
    originalPrompt: string,
    contextAdditions: string[],
    culturalInstructions: string[],
    empathyGuidelines: string[],
    taskType: string
  ): string {
    let enhancedPrompt = originalPrompt;

    // Add environmental and cultural awareness
    if (contextAdditions.length > 0) {
      enhancedPrompt += `\n\nCONTEXTUAL AWARENESS:\n${contextAdditions.map(addition => `- ${addition}`).join('\n')}`;
    }

    // Add cultural instructions
    if (culturalInstructions.length > 0) {
      enhancedPrompt += `\n\nCULTURAL ADAPTATION REQUIREMENTS:\n${culturalInstructions.map(instruction => `- ${instruction}`).join('\n')}`;
    }

    // Add empathy guidelines
    if (empathyGuidelines.length > 0) {
      enhancedPrompt += `\n\nEMPATHETIC RESPONSE GUIDELINES:\n${empathyGuidelines.map(guideline => `- ${guideline}`).join('\n')}`;
    }

    // Add task-specific enhancements
    enhancedPrompt += `\n\nENHANCED CAPABILITIES:\n- Access to real-time environmental data (weather, traffic, news)\n- Advanced emotion recognition and cultural sensitivity\n- Philippine-specific data and cultural knowledge\n- Enhanced Filipino language understanding including idioms and regional dialects`;

    return enhancedPrompt;
  }

  private detectCulturalContext(userMessage: string): 'filipino' | 'neutral' {
    const filipinoMarkers = /\b(po|opo|kasi|pero|naman|talaga|sana|grabe|sobra|Pilipinas|Philippines)\b/gi;
    return filipinoMarkers.test(userMessage) ? 'filipino' : 'neutral';
  }

  private generateCacheKey(userMessage: string, userLocation?: string): string {
    const messageHash = userMessage.toLowerCase().replace(/\s+/g, '').slice(0, 50);
    const locationKey = userLocation || 'default';
    return `${messageHash}_${locationKey}`;
  }

  private getFallbackContext(userMessage: string): GawinEnhancedContext {
    // Minimal fallback context when services fail
    return {
      environmental: {
        weather: {
          location: { city: 'Philippines', province: '', region: '', coordinates: { lat: 0, lng: 0 } },
          current: {
            temperature: 30, feelsLike: 34, humidity: 75, windSpeed: 10,
            condition: 'Partly Cloudy', visibility: 10, uvIndex: 8, heatIndex: 35
          },
          forecast: [], warnings: []
        },
        news: { headlines: [], localNews: [] },
        traffic: {
          location: 'Philippines', congestionLevel: 'moderate', estimatedDelay: 20,
          alternativeRoutes: [], advisories: []
        },
        socialTrends: { philippines: [], global: [] },
        timestamp: Date.now()
      },
      emotional: {
        analysis: {
          primary: 'neutral', secondary: [], intensity: 0.5, confidence: 0.5,
          linguisticMarkers: []
        },
        empathy_response: {
          empathyLevel: 'medium', responseType: 'supportive',
          culturalAdaptation: 'neutral', suggestedTone: 'respectful'
        }
      },
      linguistic: {
        language: 'english', formality_level: 'casual', cultural_markers: [],
        idioms_detected: [], emotional_indicators: [], code_switching: false,
        regional_influences: []
      },
      cultural: {
        region: 'NCR', formality_level: 'casual', cultural_adaptations: []
      },
      recommendations: []
    };
  }
}

export const gawinEnhancementService = GawinEnhancementService.getInstance();