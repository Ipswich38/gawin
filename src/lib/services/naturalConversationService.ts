/**
 * Natural Conversation Service
 * Provides contextually aware, natural conversation initiation and responses
 * Eliminates templated responses in favor of genuine, contextual intelligence
 */

import { groqService } from './groqService';
import { filipinoLanguageService } from './filipinoLanguageService';

export interface ConversationContext {
  userMessage: string;
  previousMessages: any[];
  emotionalTone: string;
  topics: string[];
  knowledgeLevel: string;
  timestamp: Date;
  userPreferences?: {
    language: 'english' | 'filipino' | 'taglish';
    formality: 'casual' | 'formal';
    depth: 'brief' | 'detailed';
  };
}

export interface NaturalResponse {
  content: string;
  reasoning: string;
  contextualAwareness: string[];
  followUpSuggestions: string[];
  emotionalResonance: number; // 0-100
}

class NaturalConversationService {
  /**
   * Generate a naturally contextual response that truly analyzes the user's message
   */
  async generateNaturalResponse(context: ConversationContext): Promise<NaturalResponse> {
    const isFirstMessage = context.previousMessages.length === 0;
    const userMessage = context.userMessage;
    
    // Deep analysis of user's actual message content and intent
    const messageAnalysis = await this.analyzeMessageDepth(userMessage, context);
    
    // Generate genuinely contextual response
    const response = await this.createContextualResponse(messageAnalysis, context, isFirstMessage);
    
    return response;
  }

  /**
   * Analyze the deep meaning and context of user's message
   */
  private async analyzeMessageDepth(message: string, context: ConversationContext): Promise<any> {
    const analysisPrompt = `
    Analyze this user message for genuine understanding and natural response generation:
    
    Message: "${message}"
    Previous topics: ${context.topics.join(', ') || 'None'}
    Emotional tone detected: ${context.emotionalTone}
    Knowledge level: ${context.knowledgeLevel}
    Is first message: ${context.previousMessages.length === 0}
    
    Provide JSON analysis:
    {
      "actualIntent": "What the user really wants/needs",
      "emotionalSubtext": "Underlying emotional state or needs",
      "topicDepth": "How deep/specific their question is",
      "contextualClues": ["specific details that show understanding"],
      "responseStyle": "How to naturally respond to this specific person/message",
      "knowledgeGaps": ["what they might need to understand"],
      "personalConnection": "How to make this response feel personal and relevant"
    }
    `;

    try {
      const response = await groqService.createChatCompletion({
        messages: [{ role: 'user', content: analysisPrompt }],
        action: 'analysis'
      });
      const analysis = response.choices?.[0]?.message?.content || '';
      return JSON.parse(analysis);
    } catch (error) {
      // Fallback to basic analysis
      return {
        actualIntent: "Seeking information or help",
        emotionalSubtext: "Neutral engagement", 
        topicDepth: "General inquiry",
        contextualClues: [message.substring(0, 50)],
        responseStyle: "Helpful and informative",
        knowledgeGaps: [],
        personalConnection: "Direct and relevant"
      };
    }
  }

  /**
   * Create a truly contextual response based on deep analysis
   */
  private async createContextualResponse(
    analysis: any, 
    context: ConversationContext, 
    isFirstMessage: boolean
  ): Promise<NaturalResponse> {
    
    const responsePrompt = `
    Generate a natural, contextually intelligent response based on this analysis:
    
    User's actual intent: ${analysis.actualIntent}
    Emotional subtext: ${analysis.emotionalSubtext}
    Message depth: ${analysis.topicDepth}
    Personal connection needed: ${analysis.personalConnection}
    Knowledge gaps: ${analysis.knowledgeGaps.join(', ')}
    
    Original message: "${context.userMessage}"
    Is first interaction: ${isFirstMessage}
    Previous topics: ${context.topics.join(', ') || 'None'}
    
    Create a response that:
    1. Shows you actually read and understood their specific message
    2. Responds to their actual intent, not just keywords
    3. Feels natural and conversational, not templated
    4. Builds genuine connection based on what they shared
    5. If it's a greeting, acknowledge their specific way of greeting
    6. If it's a question, show understanding of their specific situation
    7. Avoid starting with "Hello! I'm..." or other templated introductions
    8. Be genuinely helpful based on what they actually said
    
    Generate a natural response that demonstrates contextual understanding.
    Make it feel like you're having a real conversation with a real person.
    `;

    try {
      const response = await groqService.createChatCompletion({
        messages: [{ role: 'user', content: responsePrompt }],
        action: 'chat'
      });
      const content = response.choices?.[0]?.message?.content || '';
      
      // Extract contextual awareness and suggestions
      const contextualAwareness = this.extractContextualElements(context, analysis);
      const followUpSuggestions = await this.generateFollowUpSuggestions(context, analysis);
      
      return {
        content: content.trim(),
        reasoning: `Responded to: ${analysis.actualIntent}`,
        contextualAwareness,
        followUpSuggestions,
        emotionalResonance: this.calculateEmotionalResonance(context, analysis)
      };
      
    } catch (error) {
      console.error('Natural response generation failed:', error);
      
      // Intelligent fallback that still avoids templated responses
      return this.generateIntelligentFallback(context, analysis, isFirstMessage);
    }
  }

  /**
   * Generate intelligent fallback response
   */
  private generateIntelligentFallback(
    context: ConversationContext,
    analysis: any,
    isFirstMessage: boolean
  ): NaturalResponse {
    
    const message = context.userMessage;
    let response = '';
    
    // Analyze the actual content for intelligent response
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      const specificGreeting = this.extractSpecificGreeting(message);
      response = `${specificGreeting} What brings you here today? I'm curious about what you'd like to explore or discuss.`;
    } else if (message.includes('?')) {
      response = `That's an interesting question about ${this.extractQuestionTopic(message)}. Let me think about this with you...`;
    } else if (message.toLowerCase().includes('help')) {
      const helpContext = this.extractHelpContext(message);
      response = `I can see you're looking for help with ${helpContext}. Let's work through this together.`;
    } else if (context.topics.length > 0) {
      response = `I notice you're interested in ${context.topics[0]}. Based on what you've shared, let me help you with that.`;
    } else {
      // Respond to the actual content they provided
      const keyPhrase = this.extractKeyPhrase(message);
      response = `I see you're mentioning ${keyPhrase}. Tell me more about what you're thinking or what you'd like to understand better.`;
    }

    return {
      content: response,
      reasoning: 'Intelligent fallback based on message content',
      contextualAwareness: [message.substring(0, 50)],
      followUpSuggestions: ['What specific aspect interests you most?'],
      emotionalResonance: 70
    };
  }

  /**
   * Extract contextual elements for awareness
   */
  private extractContextualElements(context: ConversationContext, analysis: any): string[] {
    const elements = [];
    
    if (analysis.contextualClues) {
      elements.push(...analysis.contextualClues);
    }
    
    if (context.topics.length > 0) {
      elements.push(`Previous discussion about ${context.topics.join(', ')}`);
    }
    
    if (context.emotionalTone !== 'neutral') {
      elements.push(`Emotional tone: ${context.emotionalTone}`);
    }
    
    return elements;
  }

  /**
   * Generate contextual follow-up suggestions
   */
  private async generateFollowUpSuggestions(context: ConversationContext, analysis: any): Promise<string[]> {
    const suggestions = [];
    
    if (analysis.knowledgeGaps && analysis.knowledgeGaps.length > 0) {
      suggestions.push(`Want to explore ${analysis.knowledgeGaps[0]} in more detail?`);
    }
    
    if (context.topics.length > 0) {
      suggestions.push(`How does this connect to ${context.topics[0]}?`);
    }
    
    suggestions.push('What specific aspect would you like to dive deeper into?');
    
    return suggestions;
  }

  /**
   * Calculate emotional resonance score
   */
  private calculateEmotionalResonance(context: ConversationContext, analysis: any): number {
    let score = 50; // Base score
    
    // Increase for emotional awareness
    if (analysis.emotionalSubtext && analysis.emotionalSubtext !== 'Neutral engagement') {
      score += 20;
    }
    
    // Increase for contextual connection
    if (context.topics.length > 0) {
      score += 15;
    }
    
    // Increase for personal connection
    if (analysis.personalConnection && analysis.personalConnection !== 'Direct and relevant') {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  // Helper methods for intelligent fallback
  private extractSpecificGreeting(message: string): string {
    if (message.toLowerCase().includes('good morning')) return 'Good morning!';
    if (message.toLowerCase().includes('good afternoon')) return 'Good afternoon!';
    if (message.toLowerCase().includes('good evening')) return 'Good evening!';
    if (message.toLowerCase().includes('hey')) return 'Hey there!';
    if (message.toLowerCase().includes('hi')) return 'Hi!';
    return 'Hello!';
  }

  private extractQuestionTopic(message: string): string {
    // Extract the main topic from a question
    const words = message.toLowerCase().split(' ');
    const topicWords = words.filter(word => 
      word.length > 3 && 
      !['what', 'how', 'why', 'when', 'where', 'which', 'does', 'can', 'will'].includes(word)
    );
    
    return topicWords.slice(0, 2).join(' ') || 'this topic';
  }

  private extractHelpContext(message: string): string {
    // Find what they need help with
    const helpIndex = message.toLowerCase().indexOf('help');
    if (helpIndex === -1) return 'this';
    
    const afterHelp = message.substring(helpIndex + 4).trim();
    const firstFewWords = afterHelp.split(' ').slice(0, 3).join(' ');
    
    return firstFewWords || 'this';
  }

  private extractKeyPhrase(message: string): string {
    // Extract the most significant phrase from the message
    const words = message.split(' ');
    const meaningfulWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'but', 'for', 'with', 'from', 'that', 'this', 'they', 'have', 'been'].includes(word.toLowerCase())
    );
    
    return meaningfulWords.slice(0, 2).join(' ') || 'what you mentioned';
  }

  /**
   * Enhance response with Filipino language context if needed
   */
  async enhanceWithFilipino(response: NaturalResponse, context: ConversationContext): Promise<NaturalResponse> {
    const languageDetection = filipinoLanguageService.detectLanguage(context.userMessage);
    
    if (languageDetection.primary === 'filipino' || languageDetection.primary === 'tagalog') {
      // Generate natural Tagalog response
      const tagalogResponse = filipinoLanguageService.generateTagalogResearchResponse(
        response.content, 
        'general'
      );
      
      return {
        ...response,
        content: tagalogResponse
      };
    } else if (languageDetection.mixedLanguage) {
      // Generate natural Taglish
      const taglishResponse = filipinoLanguageService.generateNaturalTaglish(
        response.content, 
        0.3 // Casual formality for natural conversation
      );
      
      return {
        ...response,
        content: taglishResponse
      };
    }
    
    return response;
  }
}

export const naturalConversationService = new NaturalConversationService();
export default naturalConversationService;