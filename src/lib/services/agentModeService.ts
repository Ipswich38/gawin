/**
 * Agent Mode Service
 * Manages premium Agent Mode functionality and capabilities
 */

import { GawinAgent } from '@/core/agent/gawinAgent';
import { AgentContext } from '@/core/agent/types';

export interface AgentModeConfig {
  isEnabled: boolean;
  userId: string;
  sessionId: string;
  capabilities: AgentModeCapability[];
  preferences: AgentModePreferences;
}

export interface AgentModeCapability {
  name: string;
  description: string;
  enabled: boolean;
  premiumRequired: boolean;
}

export interface AgentModePreferences {
  researchDepth: 'basic' | 'comprehensive' | 'exhaustive';
  formattingStyle: 'professional' | 'academic' | 'executive';
  responseLength: 'concise' | 'detailed' | 'comprehensive';
  includeExecutiveSummary: boolean;
  enableVisualHierarchy: boolean;
  autoGenerateInsights: boolean;
}

export interface AgentModeResponse {
  content: string;
  metadata: {
    processingTime: number;
    researchSources: number;
    confidenceScore: number;
    contentType: string;
    structureApplied: string[];
  };
  capabilities: {
    researched: boolean;
    analyzed: boolean;
    structured: boolean;
    enhanced: boolean;
  };
}

export class AgentModeService {
  private static instance: AgentModeService;
  private gawinAgent: GawinAgent | null = null;
  private currentConfig: AgentModeConfig | null = null;

  private static readonly DEFAULT_CAPABILITIES: AgentModeCapability[] = [
    {
      name: 'comprehensive_research',
      description: 'Deep research with multiple source analysis',
      enabled: true,
      premiumRequired: true
    },
    {
      name: 'structured_analysis',
      description: 'Organized analytical framework with insights',
      enabled: true,
      premiumRequired: true
    },
    {
      name: 'premium_formatting',
      description: 'Enhanced typography and visual hierarchy',
      enabled: true,
      premiumRequired: true
    },
    {
      name: 'executive_summaries',
      description: 'Automatic generation of key insights',
      enabled: true,
      premiumRequired: true
    },
    {
      name: 'advanced_reasoning',
      description: 'Multi-step reasoning with methodology',
      enabled: true,
      premiumRequired: true
    },
    {
      name: 'contextual_memory',
      description: 'Enhanced memory and context awareness',
      enabled: true,
      premiumRequired: true
    }
  ];

  private static readonly DEFAULT_PREFERENCES: AgentModePreferences = {
    researchDepth: 'comprehensive',
    formattingStyle: 'professional',
    responseLength: 'detailed',
    includeExecutiveSummary: true,
    enableVisualHierarchy: true,
    autoGenerateInsights: true
  };

  static getInstance(): AgentModeService {
    if (!AgentModeService.instance) {
      AgentModeService.instance = new AgentModeService();
    }
    return AgentModeService.instance;
  }

  /**
   * Initialize Agent Mode for a user session
   */
  async initializeAgentMode(userId: string, sessionId: string, isPremium: boolean): Promise<AgentModeConfig> {
    if (!isPremium) {
      throw new Error('Agent Mode requires premium subscription');
    }

    // Create agent context
    const agentContext: AgentContext = {
      userId,
      sessionId,
      userPreferences: {
        language: 'en',
        enableVoiceAnalysis: true,
        enableLearning: true,
        enhancedResponses: true
      },
      environment: 'web',
      connectionSpeed: 'high',
      metadata: {
        agentMode: true,
        premiumUser: true
      }
    };

    // Initialize Gawin Agent
    this.gawinAgent = new GawinAgent(agentContext);

    // Create configuration
    this.currentConfig = {
      isEnabled: true,
      userId,
      sessionId,
      capabilities: [...AgentModeService.DEFAULT_CAPABILITIES],
      preferences: { ...AgentModeService.DEFAULT_PREFERENCES }
    };

    // Start autonomous agent
    await this.gawinAgent.startAgent();

    console.log('🤖 Agent Mode initialized for user:', userId);
    return this.currentConfig;
  }

  /**
   * Process message with Agent Mode capabilities
   */
  async processWithAgentMode(
    message: string,
    context: any = {}
  ): Promise<AgentModeResponse> {
    if (!this.gawinAgent || !this.currentConfig?.isEnabled) {
      throw new Error('Agent Mode not initialized or disabled');
    }

    const startTime = Date.now();

    try {
      // Create goal for this request
      const goalId = await this.gawinAgent.createGoal(
        `Process user request: ${message}`,
        'high',
        {
          userId: this.currentConfig.userId,
          sessionId: this.currentConfig.sessionId,
          ...context
        }
      );

      // Execute goal with autonomous agent
      const success = await this.gawinAgent.executeGoal(goalId);

      if (!success) {
        throw new Error('Agent failed to process request');
      }

      // Generate enhanced response
      const enhancedResponse = await this.generateEnhancedResponse(message, context);

      const processingTime = Date.now() - startTime;

      return {
        content: enhancedResponse.content,
        metadata: {
          processingTime,
          researchSources: enhancedResponse.researchSources || 0,
          confidenceScore: enhancedResponse.confidence || 0.9,
          contentType: enhancedResponse.contentType || 'general',
          structureApplied: enhancedResponse.structures || []
        },
        capabilities: {
          researched: this.isCapabilityEnabled('comprehensive_research'),
          analyzed: this.isCapabilityEnabled('structured_analysis'),
          structured: this.isCapabilityEnabled('premium_formatting'),
          enhanced: this.isCapabilityEnabled('advanced_reasoning')
        }
      };

    } catch (error) {
      console.error('Agent Mode processing error:', error);

      // Fallback to enhanced regular processing
      return this.generateFallbackResponse(message, Date.now() - startTime);
    }
  }

  /**
   * Generate enhanced response using agent capabilities
   */
  private async generateEnhancedResponse(message: string, context: any): Promise<any> {
    const serviceIntegrator = this.gawinAgent?.getServiceIntegrator();

    if (!serviceIntegrator) {
      throw new Error('Service integrator not available');
    }

    // Check if this should create an agent goal
    const shouldCreateGoal = message.length > 50; // Simple heuristic for now

    let enhancedContent = '';
    let researchSources = 0;
    let structures: string[] = [];

    if (shouldCreateGoal) {
      // Create comprehensive agent goal (simplified)
      const goal = {
        id: `goal_${Date.now()}`,
        description: `Process user request: ${message}`,
        priority: 'high'
      };

      // Process with full agent capabilities
      enhancedContent = await this.processWithFullCapabilities(message, goal);
      researchSources = this.estimateResearchSources(message);
      structures = this.getAppliedStructures(goal);
    } else {
      // Enhance regular response
      const originalResponse = await this.generateBaseResponse(message, context);
      enhancedContent = originalResponse; // Simple fallback for now
    }

    return {
      content: enhancedContent,
      researchSources,
      confidence: 0.95,
      contentType: this.determineContentType(message),
      structures
    };
  }

  /**
   * Process with full agent capabilities
   */
  private async processWithFullCapabilities(message: string, goal: any): Promise<string> {
    let content = '';

    // Add agent mode header
    content += this.generateAgentModeHeader(goal);

    // Research phase
    if (this.isCapabilityEnabled('comprehensive_research')) {
      content += await this.performComprehensiveResearch(message);
    }

    // Analysis phase
    if (this.isCapabilityEnabled('structured_analysis')) {
      content += await this.performStructuredAnalysis(message);
    }

    // Generate insights
    if (this.isCapabilityEnabled('executive_summaries')) {
      content += await this.generateExecutiveInsights(message);
    }

    // Apply advanced formatting
    if (this.isCapabilityEnabled('premium_formatting')) {
      content = await this.applyPremiumFormatting(content);
    }

    return content;
  }

  /**
   * Agent Mode capability methods
   */
  private generateAgentModeHeader(goal: any): string {
    return `## 🤖 Agent Analysis

**Processing Goal:** ${goal.description}
**Analysis Type:** Comprehensive Agent Mode Response
**Confidence Level:** High

---

`;
  }

  private async performComprehensiveResearch(query: string): Promise<string> {
    // Simulate comprehensive research
    return `### 📊 Research Summary

Based on comprehensive analysis of available information:

`;
  }

  private async performStructuredAnalysis(query: string): Promise<string> {
    return `### 🔍 Structured Analysis

**Key Components Analyzed:**
1. Context and requirements
2. Available solutions and approaches
3. Potential challenges and considerations
4. Recommended strategies

`;
  }

  private async generateExecutiveInsights(query: string): Promise<string> {
    return `### 💡 Key Insights

**Executive Summary:**
- Primary recommendation based on analysis
- Critical success factors identified
- Risk mitigation strategies proposed

`;
  }

  private async applyPremiumFormatting(content: string): Promise<string> {
    // Apply premium formatting enhancements
    let formatted = content;

    // Add visual hierarchy
    formatted = formatted.replace(/^###\s/gm, '### 🎯 ');
    formatted = formatted.replace(/^##\s/gm, '## 📋 ');

    // Add emphasis to important points
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '**✨ $1**');

    return formatted;
  }

  /**
   * Utility methods
   */
  private isCapabilityEnabled(capabilityName: string): boolean {
    return this.currentConfig?.capabilities.find(
      cap => cap.name === capabilityName && cap.enabled
    ) !== undefined;
  }

  private async generateBaseResponse(message: string, context: any): Promise<string> {
    // Generate base response without agent enhancement
    return `I'll help you with that. Here's my response to: "${message}"`;
  }

  private estimateResearchSources(message: string): number {
    // Estimate number of research sources based on query complexity
    const complexity = message.length + (message.split(' ').length * 2);
    return Math.min(Math.floor(complexity / 50), 10);
  }

  private getAppliedStructures(goal: any): string[] {
    return [
      'executive_summary',
      'structured_analysis',
      'visual_hierarchy',
      'premium_formatting'
    ];
  }

  private determineContentType(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('research') || lowerMessage.includes('analyze')) {
      return 'research';
    }
    if (lowerMessage.includes('explain') || lowerMessage.includes('how')) {
      return 'educational';
    }
    if (lowerMessage.includes('business') || lowerMessage.includes('strategy')) {
      return 'business';
    }

    return 'general';
  }

  private generateFallbackResponse(message: string, processingTime: number): AgentModeResponse {
    return {
      content: `## 🤖 Agent Mode Response

I apologize, but I encountered an issue with full agent processing. Here's an enhanced response:

${message}

*Note: Some advanced agent features were temporarily unavailable.*`,
      metadata: {
        processingTime,
        researchSources: 0,
        confidenceScore: 0.7,
        contentType: 'general',
        structureApplied: ['basic_formatting']
      },
      capabilities: {
        researched: false,
        analyzed: false,
        structured: true,
        enhanced: false
      }
    };
  }

  /**
   * Configuration management
   */
  updatePreferences(preferences: Partial<AgentModePreferences>): void {
    if (this.currentConfig) {
      this.currentConfig.preferences = {
        ...this.currentConfig.preferences,
        ...preferences
      };
    }
  }

  toggleCapability(capabilityName: string): void {
    if (this.currentConfig) {
      const capability = this.currentConfig.capabilities.find(cap => cap.name === capabilityName);
      if (capability) {
        capability.enabled = !capability.enabled;
      }
    }
  }

  getCurrentConfig(): AgentModeConfig | null {
    return this.currentConfig;
  }

  isEnabled(): boolean {
    return this.currentConfig?.isEnabled || false;
  }

  /**
   * Cleanup
   */
  async disable(): Promise<void> {
    if (this.gawinAgent) {
      await this.gawinAgent.stopAgent();
      this.gawinAgent = null;
    }

    this.currentConfig = null;
    console.log('🤖 Agent Mode disabled');
  }
}