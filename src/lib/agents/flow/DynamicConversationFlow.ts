// Dynamic Conversation Flow System
// Intelligent conversation orchestration with context-aware state management

import { AdvancedAgentMemory, MemoryEntry, ContextSnapshot } from '../memory/AdvancedAgentMemory';
import { DynamicConversationEngine } from '../conversation/DynamicConversationEngine';
import { MCPToolRegistry } from '../mcp/MCPToolRegistry';
import { RealTimeToolDiscovery } from '../mcp/RealTimeToolDiscovery';

export interface ConversationState {
  id: string;
  agentId: string;
  phase: 'initiation' | 'exploration' | 'analysis' | 'action' | 'synthesis' | 'closure';
  topic: string;
  complexity: 'low' | 'medium' | 'high' | 'expert';
  userIntent: 'information' | 'problem_solving' | 'creative' | 'analysis' | 'task_completion';
  confidence: number;
  nextPossibleStates: string[];
  contextVariables: Record<string, any>;
  toolsInUse: string[];
  collaborationActive: boolean;
  timestamp: number;
}

export interface FlowTransition {
  from: string;
  to: string;
  trigger: 'user_input' | 'tool_completion' | 'time_based' | 'confidence_threshold' | 'complexity_change';
  condition: (state: ConversationState, context: any) => boolean;
  action?: (state: ConversationState, context: any) => Promise<void>;
  priority: number;
}

export interface ConversationGoal {
  id: string;
  description: string;
  type: 'immediate' | 'session' | 'long_term';
  priority: number;
  progress: number; // 0-100
  subGoals: string[];
  completionCriteria: string[];
  deadline?: number;
}

export class DynamicConversationFlow {
  private agentId: string;
  private memory: AdvancedAgentMemory;
  private conversationEngine: DynamicConversationEngine;
  private toolRegistry: MCPToolRegistry;
  private toolDiscovery: RealTimeToolDiscovery;

  private currentState: ConversationState;
  private stateHistory: ConversationState[] = [];
  private flowTransitions: Map<string, FlowTransition[]> = new Map();
  private activeGoals: Map<string, ConversationGoal> = new Map();
  private adaptationRules: Map<string, Function> = new Map();

  constructor(
    agentId: string,
    memory: AdvancedAgentMemory,
    conversationEngine: DynamicConversationEngine,
    toolRegistry: MCPToolRegistry,
    toolDiscovery: RealTimeToolDiscovery
  ) {
    this.agentId = agentId;
    this.memory = memory;
    this.conversationEngine = conversationEngine;
    this.toolRegistry = toolRegistry;
    this.toolDiscovery = toolDiscovery;

    this.initializeFlowSystem();
    console.log(`🌊 Dynamic conversation flow initialized for agent: ${agentId}`);
  }

  private initializeFlowSystem(): void {
    // Initialize starting state
    this.currentState = {
      id: `state_${Date.now()}`,
      agentId: this.agentId,
      phase: 'initiation',
      topic: 'general',
      complexity: 'low',
      userIntent: 'information',
      confidence: 0.8,
      nextPossibleStates: ['exploration', 'analysis'],
      contextVariables: {},
      toolsInUse: [],
      collaborationActive: false,
      timestamp: Date.now()
    };

    this.setupFlowTransitions();
    this.setupAdaptationRules();
    this.setupDefaultGoals();
  }

  private setupFlowTransitions(): void {
    // Initiation -> Exploration
    this.addTransition({
      from: 'initiation',
      to: 'exploration',
      trigger: 'user_input',
      condition: (state, context) => context.userMessage && context.userMessage.length > 10,
      priority: 8
    });

    // Exploration -> Analysis
    this.addTransition({
      from: 'exploration',
      to: 'analysis',
      trigger: 'complexity_change',
      condition: (state, context) => state.complexity === 'high' || context.requiresDeepAnalysis,
      priority: 9
    });

    // Analysis -> Action
    this.addTransition({
      from: 'analysis',
      to: 'action',
      trigger: 'tool_completion',
      condition: (state, context) => state.toolsInUse.length > 0 || context.actionRequired,
      priority: 8
    });

    // Action -> Synthesis
    this.addTransition({
      from: 'action',
      to: 'synthesis',
      trigger: 'tool_completion',
      condition: (state, context) => context.toolsCompleted || state.confidence > 0.85,
      priority: 7
    });

    // Synthesis -> Closure
    this.addTransition({
      from: 'synthesis',
      to: 'closure',
      trigger: 'confidence_threshold',
      condition: (state, context) => state.confidence > 0.9 && context.userSatisfied,
      priority: 6
    });

    // Universal transitions
    this.addTransition({
      from: '*',
      to: 'exploration',
      trigger: 'user_input',
      condition: (state, context) => context.topicChange || context.newQuestion,
      priority: 5
    });

    console.log(`⚡ Configured ${this.getTotalTransitions()} conversation flow transitions`);
  }

  private setupAdaptationRules(): void {
    // Complexity adaptation
    this.adaptationRules.set('complexity_adjustment', async (state: ConversationState, context: any) => {
      const userMessage = context.userMessage || '';
      const technicalTerms = this.countTechnicalTerms(userMessage);
      const questionDepth = this.assessQuestionDepth(userMessage);

      if (technicalTerms > 3 || questionDepth > 0.7) {
        state.complexity = 'high';
      } else if (technicalTerms > 1 || questionDepth > 0.4) {
        state.complexity = 'medium';
      } else {
        state.complexity = 'low';
      }
    });

    // Intent detection adaptation
    this.adaptationRules.set('intent_detection', async (state: ConversationState, context: any) => {
      const userMessage = context.userMessage?.toLowerCase() || '';

      if (userMessage.includes('how to') || userMessage.includes('explain') || userMessage.includes('what is')) {
        state.userIntent = 'information';
      } else if (userMessage.includes('solve') || userMessage.includes('fix') || userMessage.includes('help with')) {
        state.userIntent = 'problem_solving';
      } else if (userMessage.includes('create') || userMessage.includes('design') || userMessage.includes('brainstorm')) {
        state.userIntent = 'creative';
      } else if (userMessage.includes('analyze') || userMessage.includes('compare') || userMessage.includes('evaluate')) {
        state.userIntent = 'analysis';
      } else if (userMessage.includes('do this') || userMessage.includes('implement') || userMessage.includes('execute')) {
        state.userIntent = 'task_completion';
      }
    });

    // Tool selection adaptation
    this.adaptationRules.set('tool_selection', async (state: ConversationState, context: any) => {
      const availableTools = this.toolRegistry.getAllTools();
      const relevantTools = availableTools.filter(tool =>
        this.isToolRelevant(tool, state, context)
      );

      state.toolsInUse = relevantTools.slice(0, 3).map(tool => tool.name);
    });

    console.log(`🧠 Configured ${this.adaptationRules.size} adaptation rules`);
  }

  private setupDefaultGoals(): void {
    this.addGoal({
      id: 'user_satisfaction',
      description: 'Maintain high user satisfaction throughout the conversation',
      type: 'session',
      priority: 9,
      progress: 0,
      subGoals: ['understand_intent', 'provide_value', 'maintain_engagement'],
      completionCriteria: ['positive_feedback', 'goal_achievement', 'natural_closure']
    });

    this.addGoal({
      id: 'knowledge_application',
      description: 'Effectively apply agent knowledge and tools to help the user',
      type: 'session',
      priority: 8,
      progress: 0,
      subGoals: ['tool_utilization', 'knowledge_synthesis', 'practical_solutions'],
      completionCriteria: ['successful_tool_use', 'relevant_information', 'actionable_outcomes']
    });

    this.addGoal({
      id: 'continuous_learning',
      description: 'Learn from each interaction to improve future conversations',
      type: 'long_term',
      priority: 7,
      progress: 0,
      subGoals: ['pattern_recognition', 'adaptation', 'memory_consolidation'],
      completionCriteria: ['insight_generation', 'behavior_adaptation', 'knowledge_retention']
    });
  }

  // === PUBLIC API ===

  public async processUserInput(
    userMessage: string,
    context: Record<string, any> = {}
  ): Promise<{
    response: string;
    newState: ConversationState;
    recommendedActions: string[];
    confidenceScore: number;
  }> {
    console.log(`🎯 Processing user input in ${this.currentState.phase} phase`);

    // Apply adaptation rules
    await this.applyAdaptationRules({ ...context, userMessage });

    // Check for state transitions
    const newState = await this.checkStateTransitions({ ...context, userMessage });

    // Update memory with current context
    await this.updateMemoryContext(userMessage, context);

    // Generate contextual response using conversation engine
    const conversationContext = {
      agentId: this.agentId,
      userMessage,
      conversationHistory: await this.getConversationHistory(),
      businessContext: context.businessContext || {},
      userProfile: context.userProfile || {},
      sessionData: { ...context, currentState: this.currentState },
      availableTools: this.toolRegistry.getAllTools(),
      currentTask: this.getCurrentTask(),
      urgencyLevel: this.determineUrgency(userMessage, context)
    };

    const agent = context.agent || { personality: { name: 'Assistant', expertise: ['general'] } };
    const response = await this.conversationEngine.generateResponse(conversationContext, agent);

    // Update goals progress
    await this.updateGoalsProgress(response, context);

    // Store context snapshot
    await this.storeContextSnapshot(newState, response, context);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(newState, response);

    return {
      response: response.content,
      newState,
      recommendedActions: recommendations,
      confidenceScore: response.confidence
    };
  }

  private async applyAdaptationRules(context: any): Promise<void> {
    for (const [ruleName, rule] of this.adaptationRules.entries()) {
      try {
        await rule(this.currentState, context);
      } catch (error) {
        console.error(`Adaptation rule failed: ${ruleName}`, error);
      }
    }
  }

  private async checkStateTransitions(context: any): Promise<ConversationState> {
    const currentPhase = this.currentState.phase;
    const possibleTransitions = this.flowTransitions.get(currentPhase) || [];
    const universalTransitions = this.flowTransitions.get('*') || [];

    const allTransitions = [...possibleTransitions, ...universalTransitions]
      .sort((a, b) => b.priority - a.priority);

    for (const transition of allTransitions) {
      if (transition.condition(this.currentState, context)) {
        const newState: ConversationState = {
          ...this.currentState,
          id: `state_${Date.now()}`,
          phase: transition.to as any,
          timestamp: Date.now(),
          nextPossibleStates: this.calculateNextStates(transition.to)
        };

        // Execute transition action if defined
        if (transition.action) {
          await transition.action(newState, context);
        }

        // Update state history
        this.stateHistory.push(this.currentState);
        this.currentState = newState;

        console.log(`🔄 State transition: ${currentPhase} -> ${transition.to}`);
        break;
      }
    }

    return this.currentState;
  }

  private calculateNextStates(currentPhase: string): string[] {
    const transitions = this.flowTransitions.get(currentPhase) || [];
    return transitions.map(t => t.to);
  }

  private async updateMemoryContext(userMessage: string, context: any): Promise<void> {
    // Store interaction in memory
    await this.memory.storeMemory(
      `User: ${userMessage}`,
      'interaction',
      this.calculateInteractionImportance(userMessage, context),
      ['conversation', 'user_input', this.currentState.phase],
      {
        state: this.currentState,
        context,
        timestamp: Date.now()
      }
    );

    // Store context variables if significant
    if (this.currentState.complexity === 'high') {
      await this.memory.storeMemory(
        `Complex interaction context: ${JSON.stringify(this.currentState.contextVariables)}`,
        'context',
        7,
        ['context', 'complex', this.currentState.topic],
        { state: this.currentState }
      );
    }
  }

  private async updateGoalsProgress(response: any, context: any): Promise<void> {
    for (const [goalId, goal] of this.activeGoals.entries()) {
      const previousProgress = goal.progress;

      // Simple progress calculation based on response quality and user interaction
      if (response.confidence > 0.8) {
        goal.progress = Math.min(100, goal.progress + 10);
      }

      if (response.toolsUsed && response.toolsUsed.length > 0) {
        goal.progress = Math.min(100, goal.progress + 5);
      }

      if (goal.progress !== previousProgress) {
        console.log(`📈 Goal progress updated: ${goalId} (${previousProgress}% -> ${goal.progress}%)`);
      }
    }
  }

  private async storeContextSnapshot(
    state: ConversationState,
    response: any,
    context: any
  ): Promise<void> {
    const snapshot: ContextSnapshot = {
      id: `snapshot_${Date.now()}`,
      agentId: this.agentId,
      timestamp: Date.now(),
      conversationContext: {
        topic: state.topic,
        sentiment: context.sentiment || 'neutral',
        complexity: this.complexityToNumber(state.complexity),
        userIntent: state.userIntent,
        conversationStage: state.phase
      },
      businessContext: {
        currentProjects: context.businessContext?.currentProjects || [],
        priorities: Object.keys(this.activeGoals),
        constraints: context.constraints || {},
        goals: Array.from(this.activeGoals.keys())
      },
      performanceMetrics: {
        responseQuality: response.confidence * 10,
        userSatisfaction: this.estimateUserSatisfaction(context),
        taskSuccess: this.calculateTaskSuccess(),
        toolEffectiveness: this.calculateToolEffectiveness(response.toolsUsed || [])
      },
      learnings: response.reasoning || [],
      adaptations: this.getRecentAdaptations()
    };

    await this.memory.storeContextSnapshot(snapshot);
  }

  // === HELPER METHODS ===

  private addTransition(transition: FlowTransition): void {
    if (!this.flowTransitions.has(transition.from)) {
      this.flowTransitions.set(transition.from, []);
    }
    this.flowTransitions.get(transition.from)!.push(transition);
  }

  private addGoal(goal: ConversationGoal): void {
    this.activeGoals.set(goal.id, goal);
  }

  private getTotalTransitions(): number {
    return Array.from(this.flowTransitions.values())
      .reduce((total, transitions) => total + transitions.length, 0);
  }

  private countTechnicalTerms(text: string): number {
    const technicalTerms = [
      'algorithm', 'api', 'database', 'framework', 'implementation', 'optimization',
      'architecture', 'deployment', 'integration', 'scalability', 'performance',
      'machine learning', 'artificial intelligence', 'neural network', 'deep learning'
    ];

    const words = text.toLowerCase().split(/\W+/);
    return words.filter(word => technicalTerms.includes(word)).length;
  }

  private assessQuestionDepth(text: string): number {
    let depth = 0;

    if (text.includes('why') || text.includes('how')) depth += 0.3;
    if (text.includes('what if') || text.includes('suppose')) depth += 0.4;
    if (text.includes('compare') || text.includes('analyze')) depth += 0.5;
    if (text.includes('implications') || text.includes('consequences')) depth += 0.6;

    return Math.min(depth, 1.0);
  }

  private isToolRelevant(tool: any, state: ConversationState, context: any): boolean {
    const userMessage = context.userMessage?.toLowerCase() || '';

    // Check if tool category matches user intent
    const intentToolMap = {
      'analysis': ['analysis', 'data'],
      'creative': ['ai', 'media'],
      'problem_solving': ['automation', 'development'],
      'information': ['web', 'search'],
      'task_completion': ['automation', 'file']
    };

    const relevantCategories = intentToolMap[state.userIntent] || [];
    if (relevantCategories.includes(tool.category)) return true;

    // Check if tool capabilities match message content
    return tool.capabilities.some((cap: string) =>
      userMessage.includes(cap.replace('_', ' ')) ||
      cap.split('_').some((word: string) => userMessage.includes(word))
    );
  }

  private async getConversationHistory(): Promise<any[]> {
    const recentInteractions = await this.memory.retrieveMemoryByType('interaction', 10);
    return recentInteractions.map(memory => ({
      role: memory.content.startsWith('User:') ? 'user' : 'agent',
      content: memory.content,
      timestamp: memory.timestamp
    }));
  }

  private getCurrentTask(): string | undefined {
    const taskGoals = Array.from(this.activeGoals.values())
      .filter(goal => goal.type === 'immediate')
      .sort((a, b) => b.priority - a.priority);

    return taskGoals.length > 0 ? taskGoals[0].description : undefined;
  }

  private determineUrgency(message: string, context: any): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const importantKeywords = ['important', 'priority', 'soon', 'deadline'];

    const lowerMessage = message.toLowerCase();

    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'critical';
    }

    if (importantKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    }

    if (this.currentState.complexity === 'high') {
      return 'medium';
    }

    return 'low';
  }

  private calculateInteractionImportance(message: string, context: any): number {
    let importance = 5; // Base importance

    if (this.currentState.complexity === 'high') importance += 2;
    if (this.currentState.userIntent === 'problem_solving') importance += 1;
    if (message.length > 100) importance += 1;
    if (context.businessContext) importance += 1;

    return Math.min(10, importance);
  }

  private complexityToNumber(complexity: string): number {
    const map = { low: 3, medium: 6, high: 9, expert: 10 };
    return map[complexity as keyof typeof map] || 5;
  }

  private estimateUserSatisfaction(context: any): number {
    // Simple heuristic - in practice would use sentiment analysis
    let satisfaction = 7; // Neutral baseline

    if (context.userFeedback === 'positive') satisfaction += 2;
    if (context.userFeedback === 'negative') satisfaction -= 2;
    if (this.currentState.confidence > 0.8) satisfaction += 1;

    return Math.max(1, Math.min(10, satisfaction));
  }

  private calculateTaskSuccess(): number {
    const completedGoals = Array.from(this.activeGoals.values())
      .filter(goal => goal.progress >= 100);

    const totalGoals = this.activeGoals.size;
    return totalGoals > 0 ? (completedGoals.length / totalGoals) * 10 : 5;
  }

  private calculateToolEffectiveness(toolsUsed: string[]): Record<string, number> {
    const effectiveness: Record<string, number> = {};

    for (const toolName of toolsUsed) {
      // Mock effectiveness calculation
      effectiveness[toolName] = 7 + Math.random() * 2;
    }

    return effectiveness;
  }

  private getRecentAdaptations(): string[] {
    return Array.from(this.adaptationRules.keys()).slice(0, 3);
  }

  private async generateRecommendations(state: ConversationState, response: any): Promise<string[]> {
    const recommendations = [];

    if (state.complexity === 'high' && !state.collaborationActive) {
      recommendations.push('Consider collaborating with specialized agents');
    }

    if (response.confidence < 0.7) {
      recommendations.push('Gather more information or clarify requirements');
    }

    if (state.toolsInUse.length === 0 && state.userIntent === 'analysis') {
      recommendations.push('Consider using analysis tools for better insights');
    }

    return recommendations;
  }

  // === PUBLIC GETTERS ===

  public getCurrentState(): ConversationState {
    return { ...this.currentState };
  }

  public getStateHistory(): ConversationState[] {
    return [...this.stateHistory];
  }

  public getActiveGoals(): ConversationGoal[] {
    return Array.from(this.activeGoals.values());
  }

  public getFlowStats(): any {
    return {
      currentPhase: this.currentState.phase,
      stateChanges: this.stateHistory.length,
      activeGoals: this.activeGoals.size,
      totalTransitions: this.getTotalTransitions(),
      complexity: this.currentState.complexity,
      confidence: this.currentState.confidence,
      toolsInUse: this.currentState.toolsInUse.length
    };
  }
}