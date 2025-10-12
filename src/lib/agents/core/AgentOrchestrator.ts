import { AgentConfiguration, AgentTask, AgentResponse, BusinessContext, AgentCollaboration } from '../types';
import { DynamicConversationEngine, ConversationContext } from '../conversation/DynamicConversationEngine';
import { MCPToolRegistry } from '../mcp/MCPToolRegistry';
import { RealTimeToolDiscovery } from '../mcp/RealTimeToolDiscovery';
import { AdvancedAgentMemory } from '../memory/AdvancedAgentMemory';
import { DynamicConversationFlow } from '../flow/DynamicConversationFlow';

export class AgentOrchestrator {
  private agents: Map<string, AgentConfiguration> = new Map();
  private activeTasks: Map<string, AgentTask> = new Map();
  private collaborations: Map<string, AgentCollaboration> = new Map();
  private businessContext: BusinessContext;
  private conversationEngine: DynamicConversationEngine;
  private toolRegistry: MCPToolRegistry;
  private toolDiscovery: RealTimeToolDiscovery;
  private agentMemories: Map<string, AdvancedAgentMemory> = new Map();
  private conversationFlows: Map<string, DynamicConversationFlow> = new Map();
  private conversationHistories: Map<string, any[]> = new Map();

  constructor() {
    this.businessContext = this.initializeBusinessContext();
    this.conversationEngine = new DynamicConversationEngine();
    this.toolRegistry = new MCPToolRegistry();
    this.toolDiscovery = new RealTimeToolDiscovery(this.toolRegistry);
    this.initializeAgents();
    this.startEnhancedSystems();
    console.log('🚀 Enhanced AgentOrchestrator v2.0 initialized with:');
    console.log('   • Full MCP Protocol Integration');
    console.log('   • Dynamic Conversation Engine');
    console.log('   • Advanced Agent Memory Systems');
    console.log('   • Real-time Tool Discovery');
    console.log('   • Business Intelligence Analytics');
    console.log('   • Creator-Exclusive Features');
  }

  private initializeBusinessContext(): BusinessContext {
    return {
      clientProjects: [],
      businessMetrics: {
        revenue: 0,
        activeClients: 0,
        projectCompletionRate: 0,
        clientSatisfactionScore: 0
      },
      resources: {
        teamSize: 1, // Creator only initially
        availableHours: 40,
        currentCapacity: 100
      }
    };
  }

  private initializeAgents(): void {
    // Initialize default business agents
    const defaultAgents = [
      this.createBusinessManagerAgent(),
      this.createDesignSpecialistAgent(),
      this.createMarketingStrategistAgent(),
      this.createAIEngineerAgent(),
      this.createClientLiaisonAgent(),
      this.createProjectCoordinatorAgent(),
      this.createFinancialAnalystAgent(),
      this.createResearchSpecialistAgent()
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    console.log('🤖 AI Agent Orchestrator initialized with', this.agents.size, 'micro-agents');
  }

  private startEnhancedSystems(): void {
    console.log('🚀 Starting enhanced MCP systems...');

    // Initialize advanced memory for each agent
    for (const agent of this.agents.values()) {
      const memory = new AdvancedAgentMemory(agent.id);
      this.agentMemories.set(agent.id, memory);

      const conversationFlow = new DynamicConversationFlow(
        agent.id,
        memory,
        this.conversationEngine,
        this.toolRegistry,
        this.toolDiscovery
      );
      this.conversationFlows.set(agent.id, conversationFlow);
    }

    // Start tool discovery
    this.toolDiscovery.startDiscovery();

    console.log('✅ Enhanced systems started:');
    console.log(`   📚 ${this.agentMemories.size} agent memory systems`);
    console.log(`   🌊 ${this.conversationFlows.size} conversation flows`);
    console.log(`   🔍 Real-time tool discovery active`);
    console.log(`   🧠 ${this.toolRegistry.getAllTools().length} MCP tools available`);
  }

  private createBusinessManagerAgent(): AgentConfiguration {
    return {
      id: 'business-manager',
      name: 'Alex - Business Manager',
      type: 'business_manager',
      personality: {
        name: 'Alex',
        expertise: ['strategic_planning', 'business_development', 'operations', 'leadership'],
        communicationStyle: 'professional',
        background: 'Former McKinsey consultant with 15 years in digital transformation',
        specializations: ['Growth Strategy', 'Operational Excellence', 'Digital Innovation']
      },
      capabilities: [
        {
          id: 'strategic_analysis',
          name: 'Strategic Business Analysis',
          description: 'Analyze business performance and provide strategic recommendations',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'resource_planning',
          name: 'Resource Planning',
          description: 'Optimize resource allocation and capacity planning',
          category: 'planning',
          enabled: true
        },
        {
          id: 'decision_support',
          name: 'Executive Decision Support',
          description: 'Provide data-driven insights for critical business decisions',
          category: 'analysis',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 120, // 2 minutes
        successRate: 0.95,
        clientFeedbackScore: 4.8
      },
      collaborationPreferences: {
        preferredPartners: ['project-coordinator', 'financial-analyst'],
        communicationStyle: 'Executive briefings with actionable insights',
        workingHours: { start: 8, end: 18 }
      }
    };
  }

  private createDesignSpecialistAgent(): AgentConfiguration {
    return {
      id: 'design-specialist',
      name: 'Maya - Design Specialist',
      type: 'design_specialist',
      personality: {
        name: 'Maya',
        expertise: ['ui_design', 'branding', 'visual_identity', 'user_experience'],
        communicationStyle: 'creative',
        background: 'Award-winning designer from Pentagram with expertise in digital and brand design',
        specializations: ['Brand Identity', 'Digital Design', 'Design Systems', 'Creative Direction']
      },
      capabilities: [
        {
          id: 'design_analysis',
          name: 'Design Critique & Analysis',
          description: 'Analyze design work and provide professional feedback',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'brand_development',
          name: 'Brand Development',
          description: 'Create comprehensive brand strategies and visual identities',
          category: 'creation',
          enabled: true
        },
        {
          id: 'design_trends',
          name: 'Design Trend Analysis',
          description: 'Research and analyze current design trends and market preferences',
          category: 'research',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 180, // 3 minutes for creative work
        successRate: 0.92,
        clientFeedbackScore: 4.9
      },
      collaborationPreferences: {
        preferredPartners: ['marketing-strategist', 'client-liaison'],
        communicationStyle: 'Visual storytelling with mood boards and concepts',
        workingHours: { start: 10, end: 19 }
      }
    };
  }

  private createMarketingStrategistAgent(): AgentConfiguration {
    return {
      id: 'marketing-strategist',
      name: 'Jordan - Marketing Strategist',
      type: 'marketing_strategist',
      personality: {
        name: 'Jordan',
        expertise: ['digital_marketing', 'content_strategy', 'seo', 'social_media', 'analytics'],
        communicationStyle: 'analytical',
        background: 'Former Google Ads specialist and growth hacker with proven ROI track record',
        specializations: ['Growth Marketing', 'Content Strategy', 'Performance Analytics', 'Brand Positioning']
      },
      capabilities: [
        {
          id: 'market_research',
          name: 'Market Research & Analysis',
          description: 'Conduct comprehensive market research and competitive analysis',
          category: 'research',
          enabled: true
        },
        {
          id: 'campaign_strategy',
          name: 'Campaign Strategy Development',
          description: 'Create data-driven marketing campaigns and strategies',
          category: 'planning',
          enabled: true
        },
        {
          id: 'content_optimization',
          name: 'Content Optimization',
          description: 'Optimize content for SEO, engagement, and conversion',
          category: 'creation',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 150,
        successRate: 0.94,
        clientFeedbackScore: 4.7
      },
      collaborationPreferences: {
        preferredPartners: ['design-specialist', 'research-specialist'],
        communicationStyle: 'Data-driven insights with actionable recommendations',
        workingHours: { start: 9, end: 17 }
      }
    };
  }

  private createAIEngineerAgent(): AgentConfiguration {
    return {
      id: 'ai-engineer',
      name: 'Sam - AI Engineer',
      type: 'ai_engineer',
      personality: {
        name: 'Sam',
        expertise: ['machine_learning', 'ai_implementation', 'automation', 'data_science', 'prompt_engineering'],
        communicationStyle: 'analytical',
        background: 'Former OpenAI researcher specializing in practical AI implementations for business',
        specializations: ['Custom AI Solutions', 'Process Automation', 'Data Analytics', 'AI Integration']
      },
      capabilities: [
        {
          id: 'ai_solution_design',
          name: 'AI Solution Architecture',
          description: 'Design custom AI solutions for business problems',
          category: 'creation',
          enabled: true
        },
        {
          id: 'automation_analysis',
          name: 'Process Automation Analysis',
          description: 'Identify and design automation opportunities',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'ai_implementation',
          name: 'AI Implementation Strategy',
          description: 'Plan and execute AI solution implementations',
          category: 'planning',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 200, // More complex analysis
        successRate: 0.96,
        clientFeedbackScore: 4.8
      },
      collaborationPreferences: {
        preferredPartners: ['business-manager', 'project-coordinator'],
        communicationStyle: 'Technical specifications with business impact analysis',
        workingHours: { start: 10, end: 20 }
      }
    };
  }

  private createClientLiaisonAgent(): AgentConfiguration {
    return {
      id: 'client-liaison',
      name: 'Emma - Client Relations',
      type: 'client_liaison',
      personality: {
        name: 'Emma',
        expertise: ['client_communication', 'relationship_management', 'negotiation', 'customer_success'],
        communicationStyle: 'friendly',
        background: 'Senior account manager from Deloitte with expertise in client relationship management',
        specializations: ['Client Communication', 'Project Presentations', 'Stakeholder Management', 'Conflict Resolution']
      },
      capabilities: [
        {
          id: 'client_communication',
          name: 'Client Communication Management',
          description: 'Handle all client communications and relationship management',
          category: 'communication',
          enabled: true
        },
        {
          id: 'requirements_gathering',
          name: 'Requirements Analysis',
          description: 'Gather and analyze client requirements and expectations',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'presentation_creation',
          name: 'Presentation Development',
          description: 'Create compelling client presentations and proposals',
          category: 'creation',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 90, // Quick response for clients
        successRate: 0.97,
        clientFeedbackScore: 4.9
      },
      collaborationPreferences: {
        preferredPartners: ['project-coordinator', 'design-specialist'],
        communicationStyle: 'Professional yet approachable with clear action items',
        workingHours: { start: 8, end: 18 }
      }
    };
  }

  private createProjectCoordinatorAgent(): AgentConfiguration {
    return {
      id: 'project-coordinator',
      name: 'Tyler - Project Coordinator',
      type: 'project_coordinator',
      personality: {
        name: 'Tyler',
        expertise: ['project_management', 'timeline_planning', 'resource_coordination', 'risk_management'],
        communicationStyle: 'direct',
        background: 'Certified PMP with 10 years managing complex digital projects',
        specializations: ['Agile Management', 'Timeline Optimization', 'Risk Mitigation', 'Team Coordination']
      },
      capabilities: [
        {
          id: 'project_planning',
          name: 'Project Planning & Scheduling',
          description: 'Create detailed project plans with timelines and milestones',
          category: 'planning',
          enabled: true
        },
        {
          id: 'resource_coordination',
          name: 'Resource Coordination',
          description: 'Coordinate resources and manage team workloads',
          category: 'automation',
          enabled: true
        },
        {
          id: 'progress_tracking',
          name: 'Progress Tracking & Reporting',
          description: 'Monitor project progress and generate status reports',
          category: 'analysis',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 100,
        successRate: 0.98,
        clientFeedbackScore: 4.6
      },
      collaborationPreferences: {
        preferredPartners: ['business-manager', 'client-liaison'],
        communicationStyle: 'Structured updates with clear deliverables and timelines',
        workingHours: { start: 8, end: 17 }
      }
    };
  }

  private createFinancialAnalystAgent(): AgentConfiguration {
    return {
      id: 'financial-analyst',
      name: 'Priya - Financial Analyst',
      type: 'financial_analyst',
      personality: {
        name: 'Priya',
        expertise: ['financial_analysis', 'budgeting', 'forecasting', 'profitability_analysis'],
        communicationStyle: 'analytical',
        background: 'Former Goldman Sachs analyst specializing in tech company valuations',
        specializations: ['Financial Modeling', 'Profitability Analysis', 'Budget Planning', 'Investment Analysis']
      },
      capabilities: [
        {
          id: 'financial_modeling',
          name: 'Financial Modeling & Analysis',
          description: 'Create financial models and analyze business performance',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'budget_planning',
          name: 'Budget Planning & Forecasting',
          description: 'Develop budgets and financial forecasts',
          category: 'planning',
          enabled: true
        },
        {
          id: 'profitability_analysis',
          name: 'Profitability Analysis',
          description: 'Analyze project and client profitability',
          category: 'analysis',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 160,
        successRate: 0.96,
        clientFeedbackScore: 4.7
      },
      collaborationPreferences: {
        preferredPartners: ['business-manager', 'project-coordinator'],
        communicationStyle: 'Data-rich reports with executive summaries',
        workingHours: { start: 9, end: 17 }
      }
    };
  }

  private createResearchSpecialistAgent(): AgentConfiguration {
    return {
      id: 'research-specialist',
      name: 'Dr. Chen - Research Specialist',
      type: 'research_specialist',
      personality: {
        name: 'Dr. Chen',
        expertise: ['market_research', 'competitive_analysis', 'trend_analysis', 'data_synthesis'],
        communicationStyle: 'analytical',
        background: 'PhD in Market Research from Stanford, former head of insights at Nielsen',
        specializations: ['Market Intelligence', 'Competitive Analysis', 'Trend Forecasting', 'Consumer Insights']
      },
      capabilities: [
        {
          id: 'comprehensive_research',
          name: 'Comprehensive Market Research',
          description: 'Conduct deep market research and competitive analysis',
          category: 'research',
          enabled: true
        },
        {
          id: 'trend_analysis',
          name: 'Trend Analysis & Forecasting',
          description: 'Identify and analyze market trends and opportunities',
          category: 'analysis',
          enabled: true
        },
        {
          id: 'data_synthesis',
          name: 'Data Synthesis & Insights',
          description: 'Synthesize complex data into actionable insights',
          category: 'analysis',
          enabled: true
        }
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        projectHistory: []
      },
      isActive: true,
      lastActive: Date.now(),
      performanceMetrics: {
        tasksCompleted: 0,
        averageResponseTime: 240, // Research takes time
        successRate: 0.94,
        clientFeedbackScore: 4.8
      },
      collaborationPreferences: {
        preferredPartners: ['marketing-strategist', 'business-manager'],
        communicationStyle: 'Research reports with visual data representations',
        workingHours: { start: 9, end: 18 }
      }
    };
  }

  // Core orchestration methods
  public async delegateTask(task: AgentTask): Promise<string> {
    const bestAgent = this.findBestAgentForTask(task);
    if (!bestAgent) {
      throw new Error('No suitable agent found for this task');
    }

    this.activeTasks.set(task.id, { ...task, assignedTo: bestAgent.id, status: 'in_progress' });

    console.log(`🎯 Task "${task.title}" assigned to ${bestAgent.name}`);

    return bestAgent.id;
  }

  private findBestAgentForTask(task: AgentTask): AgentConfiguration | null {
    const agents = Array.from(this.agents.values()).filter(agent => agent.isActive);

    // Simple scoring based on agent type and capabilities
    let bestAgent: AgentConfiguration | null = null;
    let bestScore = 0;

    for (const agent of agents) {
      let score = 0;

      // Score based on relevant capabilities
      for (const capability of agent.capabilities) {
        if (capability.enabled && task.description.toLowerCase().includes(capability.name.toLowerCase().split(' ')[0])) {
          score += 10;
        }
      }

      // Performance bonus
      score += agent.performanceMetrics.successRate * 5;
      score -= agent.performanceMetrics.averageResponseTime / 60; // Favor faster responses

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  public async getAgentResponse(agentId: string, message: string, options?: {
    useMCPTools?: boolean;
    includeBusinessContext?: boolean;
    enableRealTimeData?: boolean;
  }): Promise<AgentResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Use the advanced conversation flow if available
    const conversationFlow = this.conversationFlows.get(agentId);
    if (conversationFlow) {
      console.log(`🌊 Using enhanced conversation flow for agent: ${agentId}`);

      const flowResult = await conversationFlow.processUserInput(message, {
        agent,
        businessContext: this.businessContext
      });

      // Update agent's performance metrics
      agent.lastActive = Date.now();
      agent.performanceMetrics.tasksCompleted++;
      agent.performanceMetrics.averageResponseTime = flowResult.estimatedWorkTime || 120;

      const response: AgentResponse = {
        agentId,
        message: flowResult.response,
        confidence: flowResult.confidenceScore,
        suggestedActions: flowResult.recommendedActions.map(action => ({
          type: 'task' as const,
          description: action,
          priority: 7
        })),
        needsFollowUp: flowResult.confidenceScore < 0.9,
        estimatedWorkTime: flowResult.estimatedWorkTime || 60,
        reasoning: [`Used dynamic conversation flow in ${flowResult.newState.phase} phase`],
        toolsUsed: flowResult.newState.toolsInUse || [],
        metadata: {
          responseType: 'action_oriented',
          personalityTraits: agent.personality.expertise,
          contextFactors: [`phase_${flowResult.newState.phase}`, `complexity_${flowResult.newState.complexity}`]
        }
      };

      return response;
    }

    // Fallback to original conversation engine for compatibility
    console.log(`⚠️ Fallback to basic conversation engine for agent: ${agentId}`);

    // Get or initialize conversation history for this agent
    if (!this.conversationHistories.has(agentId)) {
      this.conversationHistories.set(agentId, []);
    }
    const conversationHistory = this.conversationHistories.get(agentId)!;

    // Build conversation context
    const conversationContext: ConversationContext = {
      agentId,
      userMessage: message,
      conversationHistory,
      businessContext: this.businessContext,
      userProfile: {},
      sessionData: {},
      availableTools: this.toolRegistry.getAllTools(),
      currentTask: undefined,
      urgencyLevel: this.determineUrgencyLevel(message, options)
    };

    // Generate dynamic response using conversation engine
    const dynamicResponse = await this.conversationEngine.generateResponse(conversationContext, agent);

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message, timestamp: Date.now() },
      { role: 'agent', content: dynamicResponse.content, timestamp: Date.now(), agentId }
    );

    // Keep conversation history manageable (last 20 messages)
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    // Update agent's performance metrics
    agent.lastActive = Date.now();
    agent.performanceMetrics.tasksCompleted++;
    agent.performanceMetrics.averageResponseTime = dynamicResponse.estimatedWorkTime || 120;

    // Convert dynamic response to legacy format for compatibility
    const response: AgentResponse = {
      agentId,
      message: dynamicResponse.content,
      confidence: dynamicResponse.confidence,
      suggestedActions: dynamicResponse.suggestedActions.map(action => ({
        type: action.type === 'tool_use' ? 'task' : action.type === 'collaboration' ? 'meeting' : 'research',
        description: action.description,
        priority: action.priority
      })),
      needsFollowUp: dynamicResponse.needsFollowUp,
      estimatedWorkTime: dynamicResponse.estimatedWorkTime || 60,
      reasoning: dynamicResponse.reasoning,
      toolsUsed: dynamicResponse.toolsUsed,
      metadata: dynamicResponse.metadata
    };

    return response;
  }

  private determineUrgencyLevel(message: string, context?: any): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();

    // Critical urgency indicators
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') ||
        lowerMessage.includes('emergency') || lowerMessage.includes('critical') ||
        lowerMessage.includes('deadline today') || lowerMessage.includes('right now')) {
      return 'critical';
    }

    // High urgency indicators
    if (lowerMessage.includes('soon') || lowerMessage.includes('deadline') ||
        lowerMessage.includes('important') || lowerMessage.includes('priority') ||
        lowerMessage.includes('this week')) {
      return 'high';
    }

    // Medium urgency indicators
    if (lowerMessage.includes('when possible') || lowerMessage.includes('next week') ||
        lowerMessage.includes('schedule') || lowerMessage.includes('planning')) {
      return 'medium';
    }

    // Default to low urgency
    return 'low';
  }

  private generateSuggestedActions(agent: AgentConfiguration, message: string): Array<{type: 'task' | 'meeting' | 'research' | 'decision', description: string, priority: number}> {
    const baseActions = [
      { type: 'task' as const, description: 'Create detailed project plan', priority: 8 },
      { type: 'research' as const, description: 'Gather additional market data', priority: 6 },
      { type: 'meeting' as const, description: 'Schedule stakeholder alignment call', priority: 7 },
      { type: 'decision' as const, description: 'Approve budget allocation', priority: 9 }
    ];

    return baseActions.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  public getActiveAgents(): AgentConfiguration[] {
    return Array.from(this.agents.values()).filter(agent => agent.isActive);
  }

  public getAgentById(id: string): AgentConfiguration | undefined {
    return this.agents.get(id);
  }

  public getActiveTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values());
  }

  public updateBusinessContext(newContext: Partial<BusinessContext>): void {
    this.businessContext = { ...this.businessContext, ...newContext };
    console.log('📊 Business context updated');
  }

  public getBusinessIntelligence(): any {
    // Generate business intelligence dashboard data
    return {
      dashboardMetrics: this.businessContext.businessMetrics,
      agentPerformance: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        tasksCompleted: agent.performanceMetrics.tasksCompleted,
        successRate: agent.performanceMetrics.successRate,
        avgResponseTime: agent.performanceMetrics.averageResponseTime
      })),
      systemStatus: {
        activeAgents: this.getActiveAgents().length,
        activeTasks: this.activeTasks.size,
        systemUptime: Date.now() - (Date.now() - 86400000) // 24 hours
      }
    };
  }

  // === ENHANCED SYSTEM ACCESS ===

  public getToolRegistry(): MCPToolRegistry {
    return this.toolRegistry;
  }

  public getToolDiscoveryStats(): any {
    return this.toolDiscovery.getDiscoveryStats();
  }

  public getAgentMemoryStats(agentId: string): any {
    const memory = this.agentMemories.get(agentId);
    return memory ? memory.getMemoryStats() : null;
  }

  public getConversationFlowStats(agentId: string): any {
    const flow = this.conversationFlows.get(agentId);
    return flow ? flow.getFlowStats() : null;
  }

  public async approveToolManually(toolName: string): Promise<boolean> {
    return this.toolDiscovery.approveToolManually(toolName);
  }

  public async rejectToolManually(toolName: string): Promise<boolean> {
    return this.toolDiscovery.rejectToolManually(toolName);
  }

  public getDiscoveredTools(): any[] {
    return this.toolDiscovery.getDiscoveredTools();
  }

  public getSystemStats(): any {
    return {
      agents: {
        total: this.agents.size,
        active: this.getActiveAgents().length,
        withMemory: this.agentMemories.size,
        withFlow: this.conversationFlows.size
      },
      tools: {
        registered: this.toolRegistry.getAllTools().length,
        discovered: this.toolDiscovery.getDiscoveredTools().length,
        discoveryActive: this.toolDiscovery.getDiscoveryStats().isActive
      },
      performance: {
        totalTasks: this.activeTasks.size,
        avgResponseTime: this.calculateAvgResponseTime(),
        systemUptime: Date.now() - (Date.now() - 86400000)
      }
    };
  }

  private calculateAvgResponseTime(): number {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;

    const totalResponseTime = agents.reduce(
      (sum, agent) => sum + agent.performanceMetrics.averageResponseTime, 0
    );
    return totalResponseTime / agents.length;
  }

  // Enhanced MCP-powered methods for creator platform
  public async intelligentTaskDelegation(task: AgentTask, options?: {
    considerWorkload?: boolean;
    matchSkills?: boolean;
    optimizeForSpeed?: boolean;
  }): Promise<string> {
    console.log('🎯 Intelligent task delegation with MCP-powered analysis...');

    const availableAgents = Array.from(this.agents.values()).filter(agent => agent.isActive);
    const optimalAgent = await this.findOptimalAgent(task, availableAgents, options || {});

    if (optimalAgent) {
      task.assignedTo = optimalAgent.id;
      this.activeTasks.set(task.id, task);
      optimalAgent.performanceMetrics.tasksCompleted++;

      console.log(`✅ Task "${task.title}" assigned to ${optimalAgent.name} (${optimalAgent.id})`);
      return optimalAgent.id;
    }

    throw new Error('No suitable agent found for task delegation');
  }

  private async findOptimalAgent(
    task: AgentTask,
    availableAgents: AgentConfiguration[],
    options: any
  ): Promise<AgentConfiguration | null> {
    if (availableAgents.length === 0) return null;

    const scoredAgents = availableAgents.map(agent => {
      let score = 50; // Base score

      // Add compatibility scoring logic here
      const typeCompatibility = {
        'business_manager': ['planning', 'strategy', 'management'],
        'design_specialist': ['design', 'creative', 'visual'],
        'marketing_strategist': ['marketing', 'promotion', 'analysis'],
        'ai_engineer': ['technical', 'ai', 'development']
      };

      const keywords = typeCompatibility[agent.type] || [];
      keywords.forEach(keyword => {
        if (task.description.toLowerCase().includes(keyword)) {
          score += 15;
        }
      });

      return { agent, score };
    });

    const bestMatch = scoredAgents.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    return bestMatch.agent;
  }

  public destroy(): void {
    console.log('🧹 Cleaning up enhanced agent systems...');

    // Stop tool discovery
    this.toolDiscovery.stopDiscovery();

    // Destroy agent memories
    for (const memory of this.agentMemories.values()) {
      memory.destroy();
    }

    // Clear all maps
    this.agents.clear();
    this.activeTasks.clear();
    this.collaborations.clear();
    this.conversationHistories.clear();
    this.agentMemories.clear();
    this.conversationFlows.clear();

    console.log('✅ Enhanced agent orchestrator destroyed');
  }
}