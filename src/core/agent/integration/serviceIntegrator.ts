import { GawinAgent } from '../gawinAgent';
import { AgentGoal, AgentContext } from '../types';

export interface ServiceIntegration {
  serviceName: string;
  initialized: boolean;
  capabilities: string[];
  healthStatus: 'healthy' | 'degraded' | 'offline';
  lastHealthCheck: Date;
  integrationVersion: string;
}

export interface IntegrationEvent {
  id: string;
  timestamp: Date;
  type: 'initialization' | 'health_check' | 'capability_update' | 'error';
  serviceName: string;
  details: Record<string, any>;
  impact: 'low' | 'medium' | 'high';
}

export class ServiceIntegrator {
  private agent: GawinAgent;
  private integrations: Map<string, ServiceIntegration> = new Map();
  private eventHistory: IntegrationEvent[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(agent: GawinAgent) {
    this.agent = agent;
    this.initializeIntegrations();
  }

  private async initializeIntegrations(): Promise<void> {
    const coreServices = [
      'enhancedVoiceService',
      'tagalogSpeechAnalysisService',
      'locationService',
      'conversationEngine',
      'memoryService'
    ];

    for (const serviceName of coreServices) {
      await this.integrateService(serviceName);
    }

    this.startHealthMonitoring();
  }

  private async integrateService(serviceName: string): Promise<void> {
    try {
      const capabilities = await this.discoverServiceCapabilities(serviceName);

      const integration: ServiceIntegration = {
        serviceName,
        initialized: true,
        capabilities,
        healthStatus: 'healthy',
        lastHealthCheck: new Date(),
        integrationVersion: '1.0.0'
      };

      this.integrations.set(serviceName, integration);

      this.logIntegrationEvent({
        type: 'initialization',
        serviceName,
        details: { capabilities, status: 'success' },
        impact: 'medium'
      });

      // Register service capabilities with agent
      await this.registerCapabilitiesWithAgent(serviceName, capabilities);

    } catch (error) {
      this.logIntegrationEvent({
        type: 'error',
        serviceName,
        details: { error: error instanceof Error ? error.message : String(error) },
        impact: 'high'
      });
    }
  }

  private async discoverServiceCapabilities(serviceName: string): Promise<string[]> {
    const capabilityMap: Record<string, string[]> = {
      enhancedVoiceService: [
        'text_to_speech',
        'emotional_synthesis',
        'voice_cloning',
        'multilingual_support',
        'real_time_audio_processing'
      ],
      tagalogSpeechAnalysisService: [
        'tagalog_speech_recognition',
        'cultural_context_analysis',
        'code_switching_detection',
        'emotion_analysis',
        'pronunciation_assessment'
      ],
      locationService: [
        'geolocation_detection',
        'location_caching',
        'privacy_compliance',
        'context_awareness'
      ],
      conversationEngine: [
        'natural_language_processing',
        'context_management',
        'response_generation',
        'conversation_flow_control'
      ],
      memoryService: [
        'persistent_storage',
        'context_retrieval',
        'pattern_recognition',
        'user_preference_learning'
      ]
    };

    return capabilityMap[serviceName] || ['basic_functionality'];
  }

  private async registerCapabilitiesWithAgent(serviceName: string, capabilities: string[]): Promise<void> {
    // Integration with agent's capability system
    capabilities.forEach(capability => {
      this.agent.registerCapability(capability, {
        serviceName,
        provider: serviceName,
        reliability: this.calculateServiceReliability(serviceName),
        performance: this.getServicePerformanceMetrics(serviceName)
      });
    });
  }

  private calculateServiceReliability(serviceName: string): number {
    const integration = this.integrations.get(serviceName);
    if (!integration) return 0.5;

    // Base reliability scores for different services
    const baseReliability: Record<string, number> = {
      enhancedVoiceService: 0.92,
      tagalogSpeechAnalysisService: 0.88,
      locationService: 0.95,
      conversationEngine: 0.90,
      memoryService: 0.94
    };

    let reliability = baseReliability[serviceName] || 0.8;

    // Adjust based on health status
    switch (integration.healthStatus) {
      case 'healthy':
        break;
      case 'degraded':
        reliability *= 0.7;
        break;
      case 'offline':
        reliability = 0;
        break;
    }

    return reliability;
  }

  private getServicePerformanceMetrics(serviceName: string): Record<string, number> {
    // Performance metrics for different services
    const performanceMap: Record<string, Record<string, number>> = {
      enhancedVoiceService: {
        avgResponseTime: 1200,
        throughput: 5,
        errorRate: 0.08
      },
      tagalogSpeechAnalysisService: {
        avgResponseTime: 2000,
        throughput: 3,
        errorRate: 0.12
      },
      locationService: {
        avgResponseTime: 500,
        throughput: 10,
        errorRate: 0.05
      },
      conversationEngine: {
        avgResponseTime: 1500,
        throughput: 4,
        errorRate: 0.10
      },
      memoryService: {
        avgResponseTime: 300,
        throughput: 15,
        errorRate: 0.02
      }
    };

    return performanceMap[serviceName] || {
      avgResponseTime: 1000,
      throughput: 5,
      errorRate: 0.10
    };
  }

  async createAgentGoalFromUserRequest(userMessage: string, context: AgentContext): Promise<AgentGoal | null> {
    try {
      // Analyze user message to determine if it requires agent intervention
      const requiresAgent = await this.analyzeAgentRequirement(userMessage, context);

      if (!requiresAgent) {
        return null;
      }

      // Determine goal type and template
      const goalTemplate = this.determineGoalTemplate(userMessage, context);

      // Create goal using agent's goal manager
      const goal = await this.agent.createGoal(
        this.extractGoalDescription(userMessage),
        this.determineGoalPriority(userMessage, context),
        context,
        goalTemplate
      );

      this.logIntegrationEvent({
        type: 'capability_update',
        serviceName: 'agent_integration',
        details: {
          action: 'goal_created',
          goalId: goal.id,
          template: goalTemplate,
          userMessage: userMessage.substring(0, 100)
        },
        impact: 'medium'
      });

      return goal;

    } catch (error) {
      this.logIntegrationEvent({
        type: 'error',
        serviceName: 'agent_integration',
        details: {
          action: 'goal_creation_failed',
          error: error instanceof Error ? error.message : String(error),
          userMessage: userMessage.substring(0, 100)
        },
        impact: 'high'
      });

      return null;
    }
  }

  private async analyzeAgentRequirement(userMessage: string, context: AgentContext): Promise<boolean> {
    const agentTriggers = [
      'learn', 'analyze', 'research', 'find out', 'investigate',
      'help me understand', 'figure out', 'solve', 'plan',
      'optimize', 'improve', 'enhance', 'adapt', 'remember',
      'track', 'monitor', 'watch', 'observe', 'study'
    ];

    const lowerMessage = userMessage.toLowerCase();

    // Check for explicit agent triggers
    const hasAgentTrigger = agentTriggers.some(trigger => lowerMessage.includes(trigger));

    // Check for complex requests (multiple steps, conditional logic)
    const hasComplexity = lowerMessage.includes('if') ||
                         lowerMessage.includes('when') ||
                         lowerMessage.includes('after') ||
                         lowerMessage.split(' ').length > 10;

    // Check for learning/adaptation requests
    const hasLearningAspect = lowerMessage.includes('learn') ||
                             lowerMessage.includes('adapt') ||
                             lowerMessage.includes('improve') ||
                             (context.userPreferences?.enableLearning || false);

    return hasAgentTrigger || hasComplexity || hasLearningAspect;
  }

  private determineGoalTemplate(userMessage: string, context: AgentContext): string | undefined {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('voice') || lowerMessage.includes('speak') || lowerMessage.includes('say')) {
      return 'voice_interaction';
    }

    if (lowerMessage.includes('tagalog') || lowerMessage.includes('filipino') ||
        context.userPreferences?.language === 'tagalog') {
      return 'cultural_adaptation';
    }

    if (lowerMessage.includes('search') || lowerMessage.includes('find') ||
        lowerMessage.includes('research') || lowerMessage.includes('look up')) {
      return 'information_gathering';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('assist') ||
        lowerMessage.includes('support')) {
      return 'proactive_assistance';
    }

    if (lowerMessage.includes('learn') || lowerMessage.includes('adapt') ||
        lowerMessage.includes('improve') || lowerMessage.includes('optimize')) {
      return 'learning_optimization';
    }

    return undefined; // Will create custom goal
  }

  private extractGoalDescription(userMessage: string): string {
    // Clean and extract meaningful goal description
    let description = userMessage.trim();

    // Remove common conversational starters
    const starters = ['can you', 'please', 'could you', 'would you', 'i want', 'i need'];
    starters.forEach(starter => {
      const pattern = new RegExp(`^${starter}\\s+`, 'i');
      description = description.replace(pattern, '');
    });

    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);

    // Ensure it ends with a period if it doesn't have punctuation
    if (!/[.!?]$/.test(description)) {
      description += '.';
    }

    return description;
  }

  private determineGoalPriority(userMessage: string, context: AgentContext): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = userMessage.toLowerCase();

    // Critical indicators
    if (lowerMessage.includes('urgent') || lowerMessage.includes('immediately') ||
        lowerMessage.includes('asap') || lowerMessage.includes('critical')) {
      return 'critical';
    }

    // High priority indicators
    if (lowerMessage.includes('important') || lowerMessage.includes('quickly') ||
        lowerMessage.includes('soon') || lowerMessage.includes('priority')) {
      return 'high';
    }

    // Low priority indicators
    if (lowerMessage.includes('when you have time') || lowerMessage.includes('eventually') ||
        lowerMessage.includes('no rush') || lowerMessage.includes('later')) {
      return 'low';
    }

    return 'medium'; // Default priority
  }

  async delegateToAgent(goal: AgentGoal): Promise<boolean> {
    try {
      const success = await this.agent.executeGoal(goal.id);

      this.logIntegrationEvent({
        type: 'capability_update',
        serviceName: 'agent_delegation',
        details: {
          action: 'goal_delegated',
          goalId: goal.id,
          success,
          description: goal.description
        },
        impact: success ? 'medium' : 'high'
      });

      return success;

    } catch (error) {
      this.logIntegrationEvent({
        type: 'error',
        serviceName: 'agent_delegation',
        details: {
          action: 'delegation_failed',
          goalId: goal.id,
          error: error instanceof Error ? error.message : String(error)
        },
        impact: 'high'
      });

      return false;
    }
  }

  async enhanceResponseWithAgent(
    originalResponse: string,
    userMessage: string,
    context: AgentContext
  ): Promise<string> {
    try {
      // Check if agent can enhance the response
      const canEnhance = await this.canAgentEnhanceResponse(originalResponse, userMessage, context);

      if (!canEnhance) {
        return originalResponse;
      }

      // Create a learning/optimization goal for response enhancement
      const enhancementGoal = await this.agent.createGoal(
        `Enhance response quality for: ${userMessage.substring(0, 50)}...`,
        'low',
        context,
        'learning_optimization'
      );

      // Let agent provide enhancement suggestions
      const enhancement = await this.agent.getResponseEnhancement(
        originalResponse,
        userMessage,
        context
      );

      if (enhancement && enhancement.length > originalResponse.length * 0.1) {
        this.logIntegrationEvent({
          type: 'capability_update',
          serviceName: 'response_enhancement',
          details: {
            action: 'response_enhanced',
            originalLength: originalResponse.length,
            enhancedLength: enhancement.length,
            improvementType: 'agent_enhancement'
          },
          impact: 'low'
        });

        return enhancement;
      }

      return originalResponse;

    } catch (error) {
      this.logIntegrationEvent({
        type: 'error',
        serviceName: 'response_enhancement',
        details: {
          action: 'enhancement_failed',
          error: error instanceof Error ? error.message : String(error)
        },
        impact: 'low'
      });

      return originalResponse;
    }
  }

  private async canAgentEnhanceResponse(
    response: string,
    userMessage: string,
    context: AgentContext
  ): Promise<boolean> {
    // Agent can enhance if:
    // 1. Response is relatively short and could benefit from more detail
    // 2. User is asking for learning/educational content
    // 3. Cultural adaptation could improve the response
    // 4. User preferences indicate they want enhanced responses

    const isShortResponse = response.length < 200;
    const isLearningQuery = userMessage.toLowerCase().includes('learn') ||
                           userMessage.toLowerCase().includes('explain') ||
                           userMessage.toLowerCase().includes('how') ||
                           userMessage.toLowerCase().includes('why');
    const needsCulturalAdaptation = context.userPreferences?.language === 'tagalog' &&
                                   !response.toLowerCase().includes('tagalog');
    const userWantsEnhancement = context.userPreferences?.enhancedResponses !== false;

    return (isShortResponse || isLearningQuery || needsCulturalAdaptation) && userWantsEnhancement;
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 60000); // Check every minute
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, integration] of this.integrations) {
      try {
        const isHealthy = await this.checkServiceHealth(serviceName);
        const previousStatus = integration.healthStatus;

        integration.healthStatus = isHealthy ? 'healthy' : 'degraded';
        integration.lastHealthCheck = new Date();

        if (previousStatus !== integration.healthStatus) {
          this.logIntegrationEvent({
            type: 'health_check',
            serviceName,
            details: {
              previousStatus,
              currentStatus: integration.healthStatus,
              timestamp: new Date().toISOString()
            },
            impact: (integration.healthStatus === 'healthy' || integration.healthStatus === 'degraded') ?
                   (integration.healthStatus === 'degraded' ? 'medium' : 'low') : 'high'
          });

          // Update agent's capability reliability
          await this.updateCapabilityReliability(serviceName, integration.healthStatus);
        }

      } catch (error) {
        integration.healthStatus = 'offline';
        this.logIntegrationEvent({
          type: 'error',
          serviceName,
          details: {
            action: 'health_check_failed',
            error: error instanceof Error ? error.message : String(error)
          },
          impact: 'high'
        });
      }
    }
  }

  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    // Simulate health checks for different services
    try {
      switch (serviceName) {
        case 'enhancedVoiceService':
          return this.checkVoiceServiceHealth();
        case 'tagalogSpeechAnalysisService':
          return this.checkTagalogServiceHealth();
        case 'locationService':
          return this.checkLocationServiceHealth();
        case 'conversationEngine':
          return this.checkConversationEngineHealth();
        case 'memoryService':
          return this.checkMemoryServiceHealth();
        default:
          return true;
      }
    } catch {
      return false;
    }
  }

  private async checkVoiceServiceHealth(): Promise<boolean> {
    // Check if ElevenLabs API key is available and service is responsive
    return process.env.ELEVENLABS_API_KEY !== undefined;
  }

  private async checkTagalogServiceHealth(): Promise<boolean> {
    // Check if Tagalog analysis service is operational
    return true; // Assume healthy for now
  }

  private async checkLocationServiceHealth(): Promise<boolean> {
    // Check if location service can provide location data
    return true; // Assume healthy for now
  }

  private async checkConversationEngineHealth(): Promise<boolean> {
    // Check if conversation engine is responsive
    return true; // Assume healthy for now
  }

  private async checkMemoryServiceHealth(): Promise<boolean> {
    // Check if memory service can store/retrieve data
    return true; // Assume healthy for now
  }

  private async updateCapabilityReliability(serviceName: string, healthStatus: string): Promise<void> {
    const newReliability = this.calculateServiceReliability(serviceName);
    const integration = this.integrations.get(serviceName);

    if (integration) {
      // Update agent's capability registry
      integration.capabilities.forEach(capability => {
        this.agent.updateCapabilityReliability(capability, newReliability);
      });
    }
  }

  private logIntegrationEvent(event: Partial<IntegrationEvent>): void {
    const fullEvent: IntegrationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: event.type || 'capability_update',
      serviceName: event.serviceName || 'unknown',
      details: event.details || {},
      impact: event.impact || 'low'
    };

    this.eventHistory.push(fullEvent);

    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory.splice(0, this.eventHistory.length - 1000);
    }
  }

  getIntegrationStatus(): Record<string, any> {
    const integrations = Array.from(this.integrations.values());

    return {
      totalIntegrations: integrations.length,
      healthyServices: integrations.filter(i => i.healthStatus === 'healthy').length,
      degradedServices: integrations.filter(i => i.healthStatus === 'degraded').length,
      offlineServices: integrations.filter(i => i.healthStatus === 'offline').length,
      totalCapabilities: integrations.reduce((sum, i) => sum + i.capabilities.length, 0),
      recentEvents: this.eventHistory.slice(-10),
      lastHealthCheck: new Date()
    };
  }

  getServiceCapabilities(): Record<string, string[]> {
    const capabilities: Record<string, string[]> = {};

    this.integrations.forEach((integration, serviceName) => {
      capabilities[serviceName] = integration.capabilities;
    });

    return capabilities;
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.logIntegrationEvent({
      type: 'capability_update',
      serviceName: 'service_integrator',
      details: { action: 'shutdown', timestamp: new Date().toISOString() },
      impact: 'medium'
    });
  }
}

export const createServiceIntegrator = (agent: GawinAgent): ServiceIntegrator => {
  return new ServiceIntegrator(agent);
};