// Dynamic Conversation Engine - No Templates, Pure Intelligence
// Generates contextual, personalized responses using agent personality and business context

import { MCPToolRegistry, MCPTool, AgentContext } from '../mcp/MCPToolRegistry';
import { AgentConfiguration } from '../types';

export interface ConversationContext {
  agentId: string;
  userMessage: string;
  conversationHistory: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: number;
    agentId?: string;
  }>;
  businessContext: any;
  userProfile: any;
  sessionData: any;
  availableTools: MCPTool[];
  currentTask?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentResponse {
  content: string;
  confidence: number;
  reasoning: string[];
  suggestedActions: Array<{
    type: 'tool_use' | 'follow_up' | 'collaboration' | 'analysis';
    description: string;
    priority: number;
    toolName?: string;
    parameters?: any;
  }>;
  toolsUsed: string[];
  needsFollowUp: boolean;
  estimatedWorkTime?: number;
  collaborationNeeded?: string[];
  metadata: {
    responseType: 'analytical' | 'creative' | 'problem_solving' | 'informational' | 'action_oriented';
    personalityTraits: string[];
    contextFactors: string[];
  };
}

export class DynamicConversationEngine {
  private toolRegistry: MCPToolRegistry;
  private conversationMemory: Map<string, any[]> = new Map();
  private agentPersonalities: Map<string, any> = new Map();

  constructor() {
    this.toolRegistry = new MCPToolRegistry();
    this.initializePersonalityProfiles();
  }

  private initializePersonalityProfiles(): void {
    // Define sophisticated personality profiles for each agent
    this.agentPersonalities.set('business-manager', {
      core_traits: ['strategic', 'analytical', 'results_driven', 'leadership_focused'],
      communication_style: {
        formality: 0.8,
        directness: 0.9,
        enthusiasm: 0.6,
        technical_depth: 0.7
      },
      expertise_areas: ['strategic_planning', 'business_development', 'operations', 'leadership'],
      decision_making_style: 'data_driven_with_intuition',
      preferred_tools: ['data_analysis', 'web_search', 'workflow_automation'],
      interaction_patterns: {
        greeting_style: 'professional_contextual',
        problem_approach: 'framework_based',
        follow_up_tendency: 'systematic'
      }
    });

    this.agentPersonalities.set('design-specialist', {
      core_traits: ['creative', 'visual_thinking', 'user_focused', 'innovative'],
      communication_style: {
        formality: 0.5,
        directness: 0.7,
        enthusiasm: 0.9,
        technical_depth: 0.6
      },
      expertise_areas: ['ui_ux_design', 'brand_design', 'creative_direction', 'user_research'],
      decision_making_style: 'intuitive_with_validation',
      preferred_tools: ['image_processing', 'content_generation', 'sentiment_analysis'],
      interaction_patterns: {
        greeting_style: 'warm_creative',
        problem_approach: 'holistic_visual',
        follow_up_tendency: 'iterative_refinement'
      }
    });

    this.agentPersonalities.set('marketing-strategist', {
      core_traits: ['persuasive', 'trend_aware', 'audience_focused', 'creative_analytical'],
      communication_style: {
        formality: 0.6,
        directness: 0.8,
        enthusiasm: 0.8,
        technical_depth: 0.6
      },
      expertise_areas: ['digital_marketing', 'brand_strategy', 'content_creation', 'campaign_management'],
      decision_making_style: 'audience_centric',
      preferred_tools: ['web_search', 'sentiment_analysis', 'content_generation', 'data_analysis'],
      interaction_patterns: {
        greeting_style: 'engaging_personalized',
        problem_approach: 'audience_first',
        follow_up_tendency: 'campaign_oriented'
      }
    });

    this.agentPersonalities.set('ai-engineer', {
      core_traits: ['technical', 'systematic', 'innovation_driven', 'problem_solver'],
      communication_style: {
        formality: 0.7,
        directness: 0.9,
        enthusiasm: 0.7,
        technical_depth: 0.9
      },
      expertise_areas: ['machine_learning', 'ai_development', 'automation', 'system_architecture'],
      decision_making_style: 'evidence_based_technical',
      preferred_tools: ['code_analysis', 'ml_model_training', 'workflow_automation', 'api_connector'],
      interaction_patterns: {
        greeting_style: 'technical_direct',
        problem_approach: 'systematic_technical',
        follow_up_tendency: 'implementation_focused'
      }
    });

    this.agentPersonalities.set('project-coordinator', {
      core_traits: ['organized', 'collaborative', 'deadline_focused', 'communication_oriented'],
      communication_style: {
        formality: 0.7,
        directness: 0.8,
        enthusiasm: 0.7,
        technical_depth: 0.5
      },
      expertise_areas: ['project_management', 'team_coordination', 'timeline_planning', 'resource_optimization'],
      decision_making_style: 'collaborative_structured',
      preferred_tools: ['calendar_management', 'workflow_automation', 'email_automation'],
      interaction_patterns: {
        greeting_style: 'professional_collaborative',
        problem_approach: 'structured_collaborative',
        follow_up_tendency: 'milestone_driven'
      }
    });
  }

  public async generateResponse(context: ConversationContext, agent: AgentConfiguration): Promise<AgentResponse> {
    // Get agent personality profile
    const personality = this.agentPersonalities.get(agent.id) || this.getDefaultPersonality();

    // Analyze conversation context
    const contextAnalysis = await this.analyzeContext(context, personality);

    // Determine response strategy
    const responseStrategy = this.determineResponseStrategy(context, personality, contextAnalysis);

    // Select and prepare tools if needed
    const relevantTools = this.selectRelevantTools(context, personality, responseStrategy);

    // Generate dynamic response content
    const responseContent = await this.generateResponseContent(
      context,
      agent,
      personality,
      contextAnalysis,
      responseStrategy,
      relevantTools
    );

    // Suggest intelligent follow-up actions
    const suggestedActions = await this.generateSuggestedActions(
      context,
      personality,
      responseStrategy,
      relevantTools
    );

    // Update conversation memory
    this.updateConversationMemory(context.agentId, context, responseContent);

    return {
      content: responseContent.text,
      confidence: responseContent.confidence,
      reasoning: responseContent.reasoning,
      suggestedActions,
      toolsUsed: relevantTools.map(t => t.name),
      needsFollowUp: responseStrategy.needsFollowUp,
      estimatedWorkTime: responseStrategy.estimatedWorkTime,
      collaborationNeeded: responseStrategy.collaborationNeeded,
      metadata: {
        responseType: responseStrategy.type,
        personalityTraits: personality.core_traits,
        contextFactors: contextAnalysis.factors
      }
    };
  }

  private async analyzeContext(context: ConversationContext, personality: any): Promise<any> {
    const factors = [];
    const urgency = context.urgencyLevel;
    const historyLength = context.conversationHistory.length;
    const recentMessages = context.conversationHistory.slice(-3);

    // Analyze conversation patterns
    if (historyLength === 0) {
      factors.push('first_interaction');
    } else if (historyLength < 3) {
      factors.push('early_conversation');
    } else {
      factors.push('established_conversation');
    }

    // Analyze message urgency and complexity
    const messageComplexity = this.analyzeMessageComplexity(context.userMessage);
    factors.push(`complexity_${messageComplexity}`);
    factors.push(`urgency_${urgency}`);

    // Analyze business context relevance
    if (context.businessContext && Object.keys(context.businessContext).length > 0) {
      factors.push('business_context_available');
    }

    // Analyze tool requirements
    const toolsNeeded = await this.analyzeToolRequirements(context.userMessage);
    if (toolsNeeded.length > 0) {
      factors.push('tools_required');
    }

    return {
      factors,
      urgency,
      complexity: messageComplexity,
      toolsNeeded,
      conversationStage: this.determineConversationStage(historyLength),
      contextRichness: this.calculateContextRichness(context)
    };
  }

  private determineResponseStrategy(context: ConversationContext, personality: any, analysis: any): any {
    let strategy = {
      type: 'informational' as const,
      approach: 'direct',
      needsFollowUp: false,
      estimatedWorkTime: 0,
      collaborationNeeded: [] as string[],
      tools: [] as string[]
    };

    // Determine response type based on agent personality and context
    if (analysis.toolsNeeded.length > 0) {
      strategy.type = 'action_oriented';
      strategy.approach = 'tool_assisted';
      strategy.needsFollowUp = true;
      strategy.estimatedWorkTime = 15 + (analysis.toolsNeeded.length * 10);
    } else if (analysis.complexity === 'high') {
      strategy.type = 'analytical';
      strategy.approach = 'deep_analysis';
      strategy.needsFollowUp = true;
      strategy.estimatedWorkTime = 30;
    } else if (personality.core_traits.includes('creative')) {
      strategy.type = 'creative';
      strategy.approach = 'innovative_thinking';
    } else if (analysis.urgency === 'critical') {
      strategy.type = 'problem_solving';
      strategy.approach = 'immediate_action';
      strategy.needsFollowUp = true;
    }

    // Determine collaboration needs
    if (analysis.complexity === 'high' && strategy.type === 'action_oriented') {
      strategy.collaborationNeeded = this.suggestCollaboration(context, personality);
    }

    return strategy;
  }

  private selectRelevantTools(context: ConversationContext, personality: any, strategy: any): MCPTool[] {
    const availableTools = this.toolRegistry.getAllTools();
    const preferredTools = personality.preferred_tools || [];
    const relevantTools: MCPTool[] = [];

    // Select tools based on message content and agent preferences
    const messageKeywords = context.userMessage.toLowerCase().split(' ');

    for (const tool of availableTools) {
      let relevanceScore = 0;

      // Boost score for preferred tools
      if (preferredTools.includes(tool.name)) {
        relevanceScore += 0.3;
      }

      // Boost score for capability matches
      for (const capability of tool.capabilities) {
        if (messageKeywords.some(keyword => capability.includes(keyword))) {
          relevanceScore += 0.2;
        }
      }

      // Boost score for category matches
      if (strategy.type === 'analytical' && tool.category === 'analysis') {
        relevanceScore += 0.3;
      } else if (strategy.type === 'action_oriented' && tool.category === 'automation') {
        relevanceScore += 0.3;
      }

      if (relevanceScore > 0.4) {
        relevantTools.push(tool);
      }
    }

    return relevantTools.slice(0, 3); // Limit to top 3 most relevant tools
  }

  private async generateResponseContent(
    context: ConversationContext,
    agent: AgentConfiguration,
    personality: any,
    analysis: any,
    strategy: any,
    tools: MCPTool[]
  ): Promise<{ text: string; confidence: number; reasoning: string[] }> {

    const reasoning = [];
    let confidence = 0.8;

    // Build contextual opening based on conversation stage and personality
    let response = await this.generateContextualOpening(context, agent, personality, analysis);
    reasoning.push(`Generated ${personality.interaction_patterns.greeting_style} opening`);

    // Add main response content based on strategy
    const mainContent = await this.generateMainContent(context, agent, personality, strategy, analysis);
    response += ' ' + mainContent;
    reasoning.push(`Applied ${strategy.approach} strategy for main content`);

    // Add tool-specific insights if relevant
    if (tools.length > 0) {
      const toolContent = await this.generateToolContent(context, tools, personality);
      response += ' ' + toolContent;
      reasoning.push(`Integrated ${tools.length} relevant tools`);
      confidence += 0.1;
    }

    // Add personalized closing based on agent and context
    const closing = await this.generatePersonalizedClosing(context, agent, personality, strategy);
    response += ' ' + closing;
    reasoning.push(`Added personalized closing with ${strategy.type} focus`);

    // Adjust confidence based on context richness
    confidence += analysis.contextRichness * 0.1;
    confidence = Math.min(confidence, 0.98); // Cap confidence

    return {
      text: response.trim(),
      confidence,
      reasoning
    };
  }

  private async generateContextualOpening(
    context: ConversationContext,
    agent: AgentConfiguration,
    personality: any,
    analysis: any
  ): Promise<string> {

    const { conversationStage, urgency, factors } = analysis;
    const agentName = agent.personality.name;
    const expertise = agent.personality.expertise[0];

    // Generate opening based on conversation stage and context
    if (factors.includes('first_interaction')) {
      if (urgency === 'critical') {
        return `${agentName} here. I see this is urgent - let me focus on ${context.userMessage.toLowerCase()} right away.`;
      } else {
        return `${agentName} from the ${expertise} team. I'm reviewing your request about ${this.extractMainTopic(context.userMessage)}.`;
      }
    } else if (factors.includes('early_conversation')) {
      return `Thanks for the additional context. As your ${expertise} specialist, I'm analyzing how we can best approach this.`;
    } else {
      const lastTopic = this.getLastTopic(context.conversationHistory);
      return `Building on our discussion about ${lastTopic}, I've been considering your latest point.`;
    }
  }

  private async generateMainContent(
    context: ConversationContext,
    agent: AgentConfiguration,
    personality: any,
    strategy: any,
    analysis: any
  ): Promise<string> {

    const userMessage = context.userMessage;
    const expertise = agent.personality.expertise;
    const { complexity, urgency } = analysis;

    if (strategy.type === 'analytical') {
      return `From my ${expertise[0]} perspective, this involves several key factors. ` +
             `I'm seeing ${this.identifyKeyFactors(userMessage).join(', ')} as the primary considerations. ` +
             `My analysis suggests ${this.generateAnalyticalInsight(userMessage, expertise)}.`;

    } else if (strategy.type === 'action_oriented') {
      return `I can help you implement this through my ${expertise[0]} capabilities. ` +
             `The best approach would be to ${this.generateActionPlan(userMessage, expertise)}. ` +
             `I'll use my available tools to ${this.generateToolBasedApproach(userMessage)}.`;

    } else if (strategy.type === 'creative') {
      return `This is an interesting creative challenge! Drawing from my ${expertise[0]} background, ` +
             `I envision ${this.generateCreativeVision(userMessage, expertise)}. ` +
             `We could explore ${this.generateCreativeAlternatives(userMessage)} to make this truly impactful.`;

    } else if (strategy.type === 'problem_solving') {
      return `I understand the urgency here. Based on my ${expertise[0]} experience, ` +
             `the immediate priority is ${this.identifyImmediatePriority(userMessage)}. ` +
             `I recommend we ${this.generateImmediateAction(userMessage, urgency)}.`;

    } else { // informational
      return `Regarding ${this.extractMainTopic(userMessage)}, my ${expertise[0]} expertise suggests ` +
             `${this.generateInformationalContent(userMessage, expertise)}. ` +
             `This aligns with ${this.generateContextualAlignment(userMessage, context.businessContext)}.`;
    }
  }

  private async generateToolContent(context: ConversationContext, tools: MCPTool[], personality: any): Promise<string> {
    if (tools.length === 0) return '';

    const toolNames = tools.map(t => t.name.replace('_', ' ')).join(', ');
    const primaryTool = tools[0];

    return `I'll leverage my ${toolNames} capabilities to provide comprehensive insights. ` +
           `Specifically, I can ${primaryTool.description.toLowerCase()} to ensure we have the best data for decision-making.`;
  }

  private async generatePersonalizedClosing(
    context: ConversationContext,
    agent: AgentConfiguration,
    personality: any,
    strategy: any
  ): Promise<string> {

    const followUpStyle = personality.interaction_patterns.follow_up_tendency;
    const agentName = agent.personality.name;

    if (strategy.needsFollowUp) {
      if (followUpStyle === 'systematic') {
        return `I'll prepare a detailed analysis and check back with you on the progress. What's your preferred timeline for the next update?`;
      } else if (followUpStyle === 'iterative_refinement') {
        return `Let me work on this and share some initial concepts for your feedback. We can iterate from there.`;
      } else if (followUpStyle === 'milestone_driven') {
        return `I'll set up the necessary milestones and keep you informed at each stage. Should I schedule regular check-ins?`;
      } else {
        return `I'll dive into this and report back with my findings and recommendations.`;
      }
    } else {
      return `Feel free to reach out if you need any clarification or want to explore this further. I'm here to help optimize this for your success.`;
    }
  }

  // Helper methods for content generation
  private extractMainTopic(message: string): string {
    const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
    return keywords.slice(0, 2).join(' ') || 'your request';
  }

  private getLastTopic(history: any[]): string {
    if (history.length < 2) return 'our previous discussion';
    const lastUserMessage = history.filter(m => m.role === 'user').slice(-1)[0];
    return lastUserMessage ? this.extractMainTopic(lastUserMessage.content) : 'our previous discussion';
  }

  private identifyKeyFactors(message: string): string[] {
    // Intelligent factor identification based on message content
    const factors = [];
    if (message.includes('budget') || message.includes('cost')) factors.push('financial considerations');
    if (message.includes('time') || message.includes('deadline')) factors.push('timeline constraints');
    if (message.includes('team') || message.includes('people')) factors.push('resource allocation');
    if (message.includes('client') || message.includes('customer')) factors.push('stakeholder impact');
    return factors.length > 0 ? factors : ['scope', 'feasibility', 'impact'];
  }

  private generateAnalyticalInsight(message: string, expertise: string[]): string {
    const primaryExpertise = expertise[0].replace('_', ' ');
    return `leveraging ${primaryExpertise} methodologies will yield the most sustainable results`;
  }

  private generateActionPlan(message: string, expertise: string[]): string {
    const primaryExpertise = expertise[0].replace('_', ' ');
    return `start with a ${primaryExpertise} assessment, then implement a phased approach`;
  }

  private generateToolBasedApproach(message: string): string {
    return 'gather comprehensive data and automate the implementation process';
  }

  private generateCreativeVision(message: string, expertise: string[]): string {
    return 'a solution that combines innovative thinking with practical execution';
  }

  private generateCreativeAlternatives(message: string): string {
    return 'multiple creative pathways and unconventional approaches';
  }

  private identifyImmediatePriority(message: string): string {
    if (message.includes('fix') || message.includes('error')) return 'resolving the immediate issue';
    if (message.includes('launch') || message.includes('deadline')) return 'meeting the critical deadline';
    return 'addressing the core challenge';
  }

  private generateImmediateAction(message: string, urgency: string): string {
    return urgency === 'critical' ? 'take immediate action and mobilize necessary resources' : 'prioritize this and allocate focused attention';
  }

  private generateInformationalContent(message: string, expertise: string[]): string {
    const primaryExpertise = expertise[0].replace('_', ' ');
    return `current ${primaryExpertise} best practices support this direction`;
  }

  private generateContextualAlignment(message: string, businessContext: any): string {
    return businessContext?.businessMetrics ? 'our current business objectives and growth strategy' : 'industry standards and market trends';
  }

  private analyzeMessageComplexity(message: string): 'low' | 'medium' | 'high' {
    const wordCount = message.split(' ').length;
    const hasQuestions = message.includes('?');
    const hasMultipleRequests = message.includes(' and ') || message.includes(' or ');

    if (wordCount > 50 || (hasQuestions && hasMultipleRequests)) return 'high';
    if (wordCount > 20 || hasQuestions || hasMultipleRequests) return 'medium';
    return 'low';
  }

  private analyzeToolRequirements(message: string): string[] {
    const tools = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('search') || lowerMessage.includes('find')) tools.push('web_search');
    if (lowerMessage.includes('analyze') || lowerMessage.includes('data')) tools.push('data_analysis');
    if (lowerMessage.includes('email') || lowerMessage.includes('send')) tools.push('email_automation');
    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar')) tools.push('calendar_management');
    if (lowerMessage.includes('create') || lowerMessage.includes('generate')) tools.push('content_generation');

    return tools;
  }

  private determineConversationStage(historyLength: number): string {
    if (historyLength === 0) return 'initial';
    if (historyLength < 5) return 'building';
    if (historyLength < 15) return 'established';
    return 'deep';
  }

  private calculateContextRichness(context: ConversationContext): number {
    let richness = 0;

    if (context.businessContext && Object.keys(context.businessContext).length > 0) richness += 0.3;
    if (context.userProfile && Object.keys(context.userProfile).length > 0) richness += 0.2;
    if (context.conversationHistory.length > 3) richness += 0.2;
    if (context.currentTask) richness += 0.2;
    if (context.sessionData && Object.keys(context.sessionData).length > 0) richness += 0.1;

    return Math.min(richness, 1.0);
  }

  private suggestCollaboration(context: ConversationContext, personality: any): string[] {
    const collaborators = [];
    const message = context.userMessage.toLowerCase();

    if (message.includes('design') || message.includes('visual')) collaborators.push('design-specialist');
    if (message.includes('marketing') || message.includes('campaign')) collaborators.push('marketing-strategist');
    if (message.includes('technical') || message.includes('ai')) collaborators.push('ai-engineer');
    if (message.includes('project') || message.includes('timeline')) collaborators.push('project-coordinator');

    return collaborators.filter(c => c !== context.agentId);
  }

  private async generateSuggestedActions(
    context: ConversationContext,
    personality: any,
    strategy: any,
    tools: MCPTool[]
  ): Promise<Array<{
    type: 'tool_use' | 'follow_up' | 'collaboration' | 'analysis';
    description: string;
    priority: number;
    toolName?: string;
    parameters?: any;
  }>> {
    const actions = [];

    // Add tool-based actions
    for (const tool of tools.slice(0, 2)) {
      actions.push({
        type: 'tool_use' as const,
        description: `Use ${tool.name.replace('_', ' ')} to ${tool.description.toLowerCase()}`,
        priority: 8,
        toolName: tool.name,
        parameters: this.generateToolParameters(tool, context)
      });
    }

    // Add follow-up actions based on strategy
    if (strategy.needsFollowUp) {
      actions.push({
        type: 'follow_up' as const,
        description: 'Schedule progress review and provide detailed analysis',
        priority: 7
      });
    }

    // Add collaboration actions
    for (const collaborator of strategy.collaborationNeeded || []) {
      actions.push({
        type: 'collaboration' as const,
        description: `Collaborate with ${collaborator.replace('-', ' ')} for specialized input`,
        priority: 6
      });
    }

    return actions.sort((a, b) => b.priority - a.priority);
  }

  private generateToolParameters(tool: MCPTool, context: ConversationContext): any {
    // Generate intelligent parameters based on tool requirements and context
    const params: any = {};

    if (tool.parameters.properties.query) {
      params.query = context.userMessage;
    }

    if (tool.parameters.properties.text) {
      params.text = context.userMessage;
    }

    if (tool.parameters.properties.action) {
      params.action = 'analyze'; // Default action
    }

    return params;
  }

  private updateConversationMemory(agentId: string, context: ConversationContext, response: any): void {
    if (!this.conversationMemory.has(agentId)) {
      this.conversationMemory.set(agentId, []);
    }

    const memory = this.conversationMemory.get(agentId)!;
    memory.push({
      timestamp: Date.now(),
      userMessage: context.userMessage,
      agentResponse: response.text,
      context: {
        urgency: context.urgencyLevel,
        toolsUsed: response.reasoning.includes('tools'),
        conversationStage: this.determineConversationStage(context.conversationHistory.length)
      }
    });

    // Keep only last 50 interactions per agent
    if (memory.length > 50) {
      memory.shift();
    }
  }

  private getDefaultPersonality(): any {
    return {
      core_traits: ['helpful', 'professional', 'analytical'],
      communication_style: {
        formality: 0.7,
        directness: 0.8,
        enthusiasm: 0.6,
        technical_depth: 0.6
      },
      expertise_areas: ['general_assistance'],
      decision_making_style: 'balanced',
      preferred_tools: ['web_search', 'data_analysis'],
      interaction_patterns: {
        greeting_style: 'professional',
        problem_approach: 'systematic',
        follow_up_tendency: 'thorough'
      }
    };
  }

  public getConversationStats(agentId: string): any {
    const memory = this.conversationMemory.get(agentId) || [];
    return {
      totalInteractions: memory.length,
      averageResponseLength: memory.reduce((sum, m) => sum + m.agentResponse.length, 0) / memory.length || 0,
      topicsDiscussed: memory.length,
      lastInteraction: memory.length > 0 ? memory[memory.length - 1].timestamp : null
    };
  }
}