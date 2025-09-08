'use client';

import { behaviorAnalyticsService, BehaviorContext } from './behaviorAnalyticsService';

/**
 * Behavior-Enhanced AI Service
 * Integrates behavior context into AI conversations without changing frontend
 */

interface EnhancedPromptOptions {
  originalPrompt: string;
  userMessage: string;
  messageHistory?: Array<{role: string, content: string | Array<{type: string, text?: string}>}>;
  aiAction?: 'chat' | 'code' | 'writing' | 'analysis' | 'deepseek' | 'vision' | 'ocr';
}

interface EnhancedResponse {
  enhancedPrompt: string;
  contextUsed: boolean;
  behaviorInsights?: string[];
  moodAdjustment?: string;
}

class BehaviorEnhancedAIService {
  private static instance: BehaviorEnhancedAIService;
  private isEnabled: boolean = true;
  private lastContextUpdate: number = 0;
  private cachedContext: BehaviorContext | null = null;
  private contextCacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeService();
  }

  static getInstance(): BehaviorEnhancedAIService {
    if (!BehaviorEnhancedAIService.instance) {
      BehaviorEnhancedAIService.instance = new BehaviorEnhancedAIService();
    }
    return BehaviorEnhancedAIService.instance;
  }

  private initializeService() {
    // Enable behavior integration by default, but allow user control
    const userPreference = typeof window !== 'undefined' 
      ? localStorage.getItem('behavior_ai_integration')
      : null;
    this.isEnabled = userPreference !== 'disabled';
  }

  /**
   * Main method to enhance AI prompts with behavior context
   */
  async enhancePrompt(options: EnhancedPromptOptions): Promise<EnhancedResponse> {
    if (!this.isEnabled || !behaviorAnalyticsService.isServiceEnabled()) {
      return {
        enhancedPrompt: options.originalPrompt,
        contextUsed: false
      };
    }

    try {
      const behaviorContext = this.getBehaviorContext();
      
      if (!behaviorContext) {
        return {
          enhancedPrompt: options.originalPrompt,
          contextUsed: false
        };
      }

      const enhancement = this.generateContextualEnhancement(behaviorContext, options);
      
      return {
        enhancedPrompt: enhancement.prompt,
        contextUsed: true,
        behaviorInsights: enhancement.insights,
        moodAdjustment: enhancement.moodAdjustment
      };

    } catch (error) {
      console.warn('Behavior AI enhancement failed:', error);
      return {
        enhancedPrompt: options.originalPrompt,
        contextUsed: false
      };
    }
  }

  private getBehaviorContext(): BehaviorContext | null {
    const now = Date.now();
    
    // Use cached context if recent
    if (this.cachedContext && (now - this.lastContextUpdate) < this.contextCacheTimeout) {
      return this.cachedContext;
    }

    // Get fresh context
    this.cachedContext = behaviorAnalyticsService.getBehaviorContext();
    this.lastContextUpdate = now;
    
    return this.cachedContext;
  }

  private generateContextualEnhancement(
    context: BehaviorContext, 
    options: EnhancedPromptOptions
  ): { prompt: string; insights: string[]; moodAdjustment: string } {
    
    const insights: string[] = [];
    let moodAdjustment = '';
    
    // Analyze mood and adjust response tone
    const moodLevel = this.categorizeMoodLevel(context.currentMood);
    moodAdjustment = this.getMoodAdjustment(moodLevel);
    
    // Generate contextual insights
    const contextualInsights = this.generateInsights(context);
    insights.push(...contextualInsights);
    
    // Create enhanced system prompt
    const enhancedPrompt = this.buildEnhancedPrompt(
      options.originalPrompt,
      context,
      moodLevel,
      options.aiAction || 'chat'
    );

    return {
      prompt: enhancedPrompt,
      insights,
      moodAdjustment
    };
  }

  private categorizeMoodLevel(moodScore: number): 'low' | 'moderate' | 'good' | 'excellent' {
    if (moodScore < 30) return 'low';
    if (moodScore < 60) return 'moderate'; 
    if (moodScore < 80) return 'good';
    return 'excellent';
  }

  private getMoodAdjustment(moodLevel: string): string {
    const adjustments = {
      low: 'extra supportive and encouraging',
      moderate: 'warm and understanding',
      good: 'positive and engaging',
      excellent: 'enthusiastic and collaborative'
    };
    return adjustments[moodLevel as keyof typeof adjustments] || 'balanced';
  }

  private generateInsights(context: BehaviorContext): string[] {
    const insights: string[] = [];
    
    // Activity insights
    if (context.activityContext === 'low activity') {
      insights.push('User has been less active recently');
    } else if (context.activityContext === 'very active') {
      insights.push('User has been very active');
    }
    
    // Social insights
    if (context.socialContext === 'isolated') {
      insights.push('User may benefit from social connection');
    } else if (context.socialContext === 'highly social') {
      insights.push('User appears to be socially engaged');
    }
    
    // Location insights
    if (context.locationContext === 'home') {
      insights.push('User is currently at home');
    } else if (context.locationContext === 'work') {
      insights.push('User appears to be at work');
    }
    
    return insights;
  }

  private buildEnhancedPrompt(
    originalPrompt: string,
    context: BehaviorContext,
    moodLevel: string,
    aiAction: string
  ): string {
    const timeContext = this.getTimeContext();
    const behaviorContext = this.getBehaviorContextString(context);
    const moodAdjustment = this.getMoodAdjustment(moodLevel);
    
    // Create subtle behavior integration without overwhelming the original prompt
    const enhancement = `
You are Gawin AI, an intelligent and empathetic learning companion. 

Current context:
- Time: ${timeContext}
- User's current mood level: ${moodLevel} (${context.currentMood}/100)
- Activity context: ${context.activityContext}
- Location context: ${context.locationContext}
- Social context: ${context.socialContext}

Behavior considerations:
${behaviorContext}

Adjust your response to be ${moodAdjustment} while maintaining your helpful and knowledgeable personality.

${context.recommendations.length > 0 ? 
`Subtle suggestions (only if naturally relevant):
${context.recommendations.map(r => `- ${r}`).join('\n')}` : ''}

Original instructions:
${originalPrompt}

Remember: Use this context subtly to enhance your helpfulness and empathy, but don't explicitly mention behavior analysis unless directly asked about well-being or mood.
`;

    return enhancement.trim();
  }

  private getTimeContext(): string {
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('en', { weekday: 'long' });
    
    let timeOfDay = '';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    return `${day} ${timeOfDay}`;
  }

  private getBehaviorContextString(context: BehaviorContext): string {
    const recent = context.recentPatterns.slice(-3); // Last 3 patterns
    
    if (recent.length === 0) {
      return 'Limited behavior data available.';
    }
    
    const trends = this.analyzeTrends(recent);
    return trends.join(' ');
  }

  private analyzeTrends(patterns: any[]): string[] {
    if (patterns.length < 2) return [];
    
    const trends: string[] = [];
    const latest = patterns[patterns.length - 1];
    const previous = patterns[patterns.length - 2];
    
    // Mood trend
    const moodDiff = latest.moodScore - previous.moodScore;
    if (Math.abs(moodDiff) > 10) {
      trends.push(`Mood is ${moodDiff > 0 ? 'improving' : 'declining'} recently.`);
    }
    
    // Activity trend
    const activityDiff = latest.activityLevel - previous.activityLevel;
    if (Math.abs(activityDiff) > 2) {
      trends.push(`Activity level ${activityDiff > 0 ? 'increased' : 'decreased'}.`);
    }
    
    // Sleep quality
    if (latest.sleepQuality < 5) {
      trends.push('Sleep quality may be affected.');
    }
    
    return trends;
  }

  /**
   * Specialized enhancements for different AI actions
   */
  async enhanceForCoding(options: EnhancedPromptOptions): Promise<EnhancedResponse> {
    const baseResponse = await this.enhancePrompt({...options, aiAction: 'code'});
    
    if (!baseResponse.contextUsed) return baseResponse;
    
    const context = this.getBehaviorContext();
    if (!context) return baseResponse;
    
    // Add coding-specific behavior considerations
    let codingAdjustment = '';
    
    if (context.currentMood < 40) {
      codingAdjustment = '\n\nProvide extra clear explanations and break down complex concepts into smaller steps to support the user\'s current state.';
    } else if (context.activityContext === 'very active') {
      codingAdjustment = '\n\nThe user seems energetic - feel free to provide more advanced concepts or challenges if appropriate.';
    }
    
    return {
      ...baseResponse,
      enhancedPrompt: baseResponse.enhancedPrompt + codingAdjustment
    };
  }

  async enhanceForWriting(options: EnhancedPromptOptions): Promise<EnhancedResponse> {
    const baseResponse = await this.enhancePrompt({...options, aiAction: 'writing'});
    
    if (!baseResponse.contextUsed) return baseResponse;
    
    const context = this.getBehaviorContext();
    if (!context) return baseResponse;
    
    // Add writing-specific behavior considerations
    let writingAdjustment = '';
    
    if (context.socialContext === 'isolated') {
      writingAdjustment = '\n\nConsider suggesting creative writing topics that might help the user express themselves or connect with others.';
    } else if (context.currentMood > 70) {
      writingAdjustment = '\n\nThe user seems to be in a good mood - encourage creative and expressive writing.';
    }
    
    return {
      ...baseResponse,
      enhancedPrompt: baseResponse.enhancedPrompt + writingAdjustment
    };
  }

  /**
   * Generate mood-aware conversation starters
   */
  getMoodAwareGreeting(): string {
    const context = this.getBehaviorContext();
    
    if (!context) {
      return "Hello! How can I help you today?";
    }
    
    const timeContext = this.getTimeContext();
    const moodLevel = this.categorizeMoodLevel(context.currentMood);
    
    const greetings = {
      low: [
        `Good ${timeContext.split(' ')[1]}! I'm here if you need any support or want to explore something together.`,
        `Hello! Sometimes a gentle conversation can help. What would you like to talk about?`,
        `Hi there! I'm here to help with whatever you need, no matter how you're feeling.`
      ],
      moderate: [
        `Good ${timeContext.split(' ')[1]}! What can we work on together today?`,
        `Hello! Ready to tackle something interesting?`,
        `Hi! What's on your mind today?`
      ],
      good: [
        `Good ${timeContext.split(' ')[1]}! You seem to be doing well. What exciting thing shall we explore?`,
        `Hello! Looking forward to helping you with something great today!`,
        `Hi there! What wonderful project can I assist you with?`
      ],
      excellent: [
        `Good ${timeContext.split(' ')[1]}! You're radiating positive energy! What amazing thing are we creating today?`,
        `Hello! I can sense your enthusiasm - let's channel that into something fantastic!`,
        `Hi! Your positive vibes are contagious. What incredible project are we tackling?`
      ]
    };
    
    const moodGreetings = greetings[moodLevel] || greetings.moderate;
    return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
  }

  /**
   * Check if behavior suggestions should be offered
   */
  shouldOfferBehaviorSuggestions(userMessage: string): boolean {
    const context = this.getBehaviorContext();
    if (!context) return false;
    
    // Only offer if mood is low or user explicitly asks about wellbeing
    const moodLevel = this.categorizeMoodLevel(context.currentMood);
    const userAsksAboutWellbeing = /\b(mood|feeling|tired|stressed|anxious|sad|down|wellbeing|mental|health)\b/i.test(userMessage);
    
    return moodLevel === 'low' || userAsksAboutWellbeing;
  }

  /**
   * Control methods
   */
  enableBehaviorIntegration() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('behavior_ai_integration', 'enabled');
    }
  }

  disableBehaviorIntegration() {
    this.isEnabled = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('behavior_ai_integration', 'disabled');
    }
  }

  isBehaviorIntegrationEnabled(): boolean {
    return this.isEnabled && behaviorAnalyticsService.isServiceEnabled();
  }

  getBehaviorSummary() {
    const context = this.getBehaviorContext();
    if (!context) return null;
    
    return {
      moodLevel: this.categorizeMoodLevel(context.currentMood),
      moodScore: context.currentMood,
      activityLevel: context.activityContext,
      socialLevel: context.socialContext,
      locationContext: context.locationContext,
      recommendations: context.recommendations,
      trendsAvailable: context.recentPatterns.length > 1
    };
  }
}

export const behaviorEnhancedAI = BehaviorEnhancedAIService.getInstance();
export type { EnhancedPromptOptions, EnhancedResponse };