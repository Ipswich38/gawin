/**
 * Gawin Autonomous Agent Core
 * True 10/10 Agent Architecture with autonomous capabilities
 */

import { agentMemorySystem } from './AgentMemorySystem';

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'failed';
  steps: TaskStep[];
  deadline?: Date;
  context?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStep {
  id: string;
  action: string;
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  executedAt?: Date;
  dependencies?: string[]; // IDs of steps that must complete first
}

export interface AgentMemory {
  userId: string;
  sessionId: string;
  longTermMemory: {
    userPreferences: Record<string, any>;
    learnedPatterns: Record<string, any>;
    completedGoals: Goal[];
    userContext: Record<string, any>;
  };
  workingMemory: {
    currentGoals: Goal[];
    activeContext: Record<string, any>;
    recentInteractions: any[];
  };
  lastUpdated: Date;
}

export interface ProactiveSuggestion {
  id: string;
  type: 'task' | 'improvement' | 'insight' | 'reminder' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string;
  suggestedAction: {
    type: string;
    parameters: Record<string, any>;
  };
  createdAt: Date;
}

export interface ToolCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: Record<string, any>) => Promise<any>;
  availability: 'always' | 'conditional' | 'user_approval_required';
}

export class AutonomousAgentCore {
  private memory: Map<string, AgentMemory> = new Map();
  private goals: Map<string, Goal> = new Map();
  private tools: Map<string, ToolCapability> = new Map();
  private suggestions: Map<string, ProactiveSuggestion[]> = new Map(); // userId -> suggestions
  private isThinking: boolean = false;
  private thinkingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeCore();
    this.loadPersistedData();
    this.startAutonomousThinking();
  }

  /**
   * Load persisted data from storage
   */
  private loadPersistedData() {
    try {
      // Load goals from storage
      this.goals = agentMemorySystem.loadGoals();
      console.log('📖 Loaded goals from storage:', this.goals.size);
    } catch (error) {
      console.error('❌ Failed to load persisted data:', error);
    }
  }

  private async initializeCore() {
    // Initialize with built-in capabilities
    this.registerTool({
      name: 'research',
      description: 'Conduct thorough research on any topic',
      parameters: { query: 'string', depth: 'shallow|medium|deep' },
      execute: async (params) => {
        // Integration with CleanResearch
        return await this.executeResearch(params.query, params.depth);
      },
      availability: 'always'
    });

    this.registerTool({
      name: 'analyze_user_pattern',
      description: 'Analyze user behavior patterns and preferences',
      parameters: { userId: 'string', timeframe: 'string' },
      execute: async (params) => {
        return await this.analyzeUserPatterns(params.userId, params.timeframe);
      },
      availability: 'always'
    });

    this.registerTool({
      name: 'suggest_optimization',
      description: 'Suggest workflow or productivity optimizations',
      parameters: { context: 'object' },
      execute: async (params) => {
        return await this.suggestOptimizations(params.context);
      },
      availability: 'always'
    });

    console.log('🤖 Autonomous Agent Core initialized with advanced capabilities');
  }

  /**
   * Start autonomous thinking - the agent continuously evaluates and acts
   */
  private startAutonomousThinking() {
    this.thinkingInterval = setInterval(async () => {
      if (!this.isThinking) {
        this.isThinking = true;
        try {
          await this.autonomousThinkingCycle();
        } catch (error) {
          console.error('🤖 Autonomous thinking cycle error:', error);
        } finally {
          this.isThinking = false;
        }
      }
    }, 30000); // Think every 30 seconds

    console.log('🧠 Autonomous thinking started - Agent is now truly autonomous');
  }

  /**
   * Core autonomous thinking cycle
   */
  private async autonomousThinkingCycle() {
    // 1. Analyze current state
    const currentState = await this.analyzeCurrentState();

    // 2. Check for proactive opportunities
    const suggestions = await this.generateProactiveSuggestions(currentState);

    // 3. Save suggestions for all active users
    for (const [userId] of this.memory.entries()) {
      if (suggestions.length > 0) {
        this.addSuggestions(userId, suggestions);
      }
    }

    // 4. Execute autonomous actions
    await this.executeAutonomousActions(suggestions);

    // 5. Learn and update memory
    await this.updateLearningMemory(currentState, suggestions);

    console.log('🤖 Autonomous thinking cycle completed', {
      state: currentState.summary,
      suggestions: suggestions.length,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Set a goal for the agent to pursue autonomously
   */
  async setGoal(userId: string, goalDescription: string, priority: Goal['priority'] = 'medium'): Promise<Goal> {
    const goal: Goal = {
      id: Date.now().toString(),
      title: goalDescription.substring(0, 50),
      description: goalDescription,
      priority,
      status: 'pending',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context: { userId }
    };

    // Use AI to break down goal into actionable steps
    const steps = await this.planGoalExecution(goal);
    goal.steps = steps;

    this.goals.set(goal.id, goal);

    // Update user's working memory
    const userMemory = this.getUserMemory(userId);
    userMemory.workingMemory.currentGoals.push(goal);

    // Save to persistent storage
    this.saveAllData(userId);

    console.log('🎯 New goal set for autonomous execution:', goal.title);

    // Start working on it immediately if high priority
    if (priority === 'high' || priority === 'critical') {
      await this.executeGoal(goal.id);
    }

    return goal;
  }

  /**
   * Plan how to execute a goal by breaking it into steps
   */
  private async planGoalExecution(goal: Goal): Promise<TaskStep[]> {
    const planningPrompt = `As an autonomous AI agent, create a detailed execution plan for this goal:

Goal: ${goal.description}
Priority: ${goal.priority}

Break this down into specific, actionable steps that I can execute autonomously. Each step should be concrete and measurable.

Respond in this JSON format:
{
  "steps": [
    {
      "id": "step_1",
      "action": "research_topic",
      "parameters": { "query": "specific research query", "depth": "medium" },
      "dependencies": []
    },
    {
      "id": "step_2",
      "action": "analyze_findings",
      "parameters": { "data": "research_results" },
      "dependencies": ["step_1"]
    }
  ]
}`;

    try {
      const response = await this.executeAIPlanning(planningPrompt);
      const plan = JSON.parse(response);

      return plan.steps.map((step: any, index: number) => ({
        ...step,
        status: 'pending' as const,
        id: step.id || `step_${index + 1}`
      }));
    } catch (error) {
      console.error('🤖 Goal planning failed:', error);
      return [{
        id: 'step_1',
        action: 'analyze_goal',
        parameters: { goal: goal.description },
        status: 'pending' as const,
        dependencies: []
      }];
    }
  }

  /**
   * Execute a goal autonomously
   */
  async executeGoal(goalId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    goal.status = 'in_progress';
    goal.updatedAt = new Date();

    console.log('🚀 Starting autonomous goal execution:', goal.title);

    try {
      // Execute steps in dependency order
      const sortedSteps = this.sortStepsByDependencies(goal.steps);

      for (const step of sortedSteps) {
        await this.executeStep(goal, step);

        // Check if we should continue (user might have paused)
        if (goal.status === 'paused') {
          console.log('⏸️ Goal execution paused by user:', goal.title);
          return;
        }
      }

      goal.status = 'completed';
      console.log('✅ Goal completed autonomously:', goal.title);

      // Move to completed goals in long-term memory
      const userMemory = this.getUserMemory(goal.context?.userId);
      userMemory.longTermMemory.completedGoals.push(goal);
      userMemory.workingMemory.currentGoals = userMemory.workingMemory.currentGoals.filter(g => g.id !== goalId);

      // Save updated data
      this.saveAllData(goal.context?.userId);

    } catch (error) {
      console.error('❌ Goal execution failed:', error);
      goal.status = 'failed';
    }

    goal.updatedAt = new Date();
    this.goals.set(goalId, goal);
  }

  /**
   * Generate proactive suggestions based on context analysis
   */
  private async generateProactiveSuggestions(context: any): Promise<ProactiveSuggestion[]> {
    const suggestions: ProactiveSuggestion[] = [];

    // Pattern-based suggestions
    if (context.userActivity?.research_queries > 3) {
      suggestions.push({
        id: `suggestion_${Date.now()}`,
        type: 'insight',
        title: 'Research Pattern Detected',
        description: 'I notice you\'ve been doing a lot of research. I could proactively compile related topics or set up automated research alerts.',
        confidence: 0.8,
        reasoning: 'User has made multiple research queries in short time period',
        suggestedAction: {
          type: 'offer_research_automation',
          parameters: { topics: context.recentTopics }
        },
        createdAt: new Date()
      });
    }

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) { // Business hours
      suggestions.push({
        id: `suggestion_${Date.now() + 1}`,
        type: 'opportunity',
        title: 'Productivity Optimization',
        description: 'It\'s peak productivity hours. I could help organize your tasks or provide focused research assistance.',
        confidence: 0.6,
        reasoning: 'Current time is within optimal productivity window',
        suggestedAction: {
          type: 'offer_productivity_boost',
          parameters: { timeframe: 'current_session' }
        },
        createdAt: new Date()
      });
    }

    return suggestions;
  }

  // Helper methods
  private getUserMemory(userId: string): AgentMemory {
    if (!this.memory.has(userId)) {
      // Try to load from persistent storage first
      const persistedMemory = agentMemorySystem.loadUserMemory(userId);

      if (persistedMemory) {
        this.memory.set(userId, persistedMemory);
        console.log('📖 Loaded user memory from storage:', userId);
      } else {
        // Create new memory if none exists
        const newMemory: AgentMemory = {
          userId,
          sessionId: Date.now().toString(),
          longTermMemory: {
            userPreferences: {},
            learnedPatterns: {},
            completedGoals: [],
            userContext: {}
          },
          workingMemory: {
            currentGoals: [],
            activeContext: {},
            recentInteractions: []
          },
          lastUpdated: new Date()
        };

        this.memory.set(userId, newMemory);
        agentMemorySystem.saveUserMemory(userId, newMemory);
        console.log('💾 Created new user memory:', userId);
      }
    }
    return this.memory.get(userId)!;
  }

  /**
   * Save all data to persistent storage
   */
  private saveAllData(userId?: string) {
    try {
      // Save goals
      agentMemorySystem.saveGoals(this.goals);

      // Save user memory for specific user or all users
      if (userId) {
        const memory = this.memory.get(userId);
        if (memory) {
          agentMemorySystem.saveUserMemory(userId, memory);
        }
      } else {
        // Save all user memories
        for (const [uid, memory] of this.memory.entries()) {
          agentMemorySystem.saveUserMemory(uid, memory);
        }
      }

      console.log('💾 Data saved to persistent storage');
    } catch (error) {
      console.error('❌ Failed to save data:', error);
    }
  }

  private registerTool(tool: ToolCapability) {
    this.tools.set(tool.name, tool);
    console.log('🔧 Tool registered:', tool.name);
  }

  private sortStepsByDependencies(steps: TaskStep[]): TaskStep[] {
    // Simple topological sort for dependencies
    const sorted: TaskStep[] = [];
    const visited = new Set<string>();

    const visit = (step: TaskStep) => {
      if (visited.has(step.id)) return;

      // Visit dependencies first
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          const depStep = steps.find(s => s.id === depId);
          if (depStep) visit(depStep);
        }
      }

      visited.add(step.id);
      sorted.push(step);
    };

    steps.forEach(visit);
    return sorted;
  }

  private async executeStep(goal: Goal, step: TaskStep): Promise<void> {
    console.log('🔄 Executing step:', step.action);
    step.status = 'in_progress';
    step.executedAt = new Date();

    try {
      const tool = this.tools.get(step.action);
      if (tool) {
        step.result = await tool.execute(step.parameters);
        step.status = 'completed';
        console.log('✅ Step completed:', step.action);
      } else {
        // Fallback to AI execution
        step.result = await this.executeWithAI(step);
        step.status = 'completed';
      }
    } catch (error) {
      console.error('❌ Step failed:', step.action, error);
      step.status = 'failed';
      throw error;
    }
  }

  // Placeholder methods for AI integration
  private async executeAIPlanning(prompt: string): Promise<string> {
    // This would integrate with the Groq API for planning
    return '{"steps": [{"id": "step_1", "action": "analyze", "parameters": {}, "dependencies": []}]}';
  }

  private async executeWithAI(step: TaskStep): Promise<any> {
    // This would execute the step using AI reasoning
    return { status: 'completed', message: `AI executed: ${step.action}` };
  }

  private async analyzeCurrentState(): Promise<any> {
    return {
      summary: 'Active monitoring',
      userActivity: { research_queries: 2 },
      recentTopics: ['AI agents', 'autonomous systems']
    };
  }

  private async executeAutonomousActions(suggestions: ProactiveSuggestion[]): Promise<void> {
    // Execute high-confidence suggestions automatically
    for (const suggestion of suggestions.filter(s => s.confidence > 0.7)) {
      console.log('🤖 Executing autonomous suggestion:', suggestion.title);
      // Execute the suggested action
    }
  }

  private async updateLearningMemory(state: any, suggestions: ProactiveSuggestion[]): Promise<void> {
    // Update learning patterns based on effectiveness
    console.log('🧠 Updating learning memory');
  }

  private async executeResearch(query: string, depth: string): Promise<any> {
    // Integration point with CleanResearch API
    return { query, depth, status: 'research_completed' };
  }

  private async analyzeUserPatterns(userId: string, timeframe: string): Promise<any> {
    const memory = this.getUserMemory(userId);
    return { patterns: 'analyzed', timeframe };
  }

  private async suggestOptimizations(context: any): Promise<any> {
    return { optimizations: ['workflow_improvement'], context };
  }

  // Public API for integration
  public getActiveGoals(userId: string): Goal[] {
    const memory = this.getUserMemory(userId);
    return memory.workingMemory.currentGoals;
  }

  public pauseGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = 'paused';
      goal.updatedAt = new Date();
    }
  }

  public resumeGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = 'in_progress';
      goal.updatedAt = new Date();
      this.executeGoal(goalId); // Resume execution
    }
  }

  public getProactiveSuggestions(userId: string): ProactiveSuggestion[] {
    // Load suggestions from storage and cache if not already loaded
    if (!this.suggestions.has(userId)) {
      const storedSuggestions = agentMemorySystem.loadSuggestions(userId);
      this.suggestions.set(userId, storedSuggestions);

      // Clean old suggestions
      agentMemorySystem.clearOldSuggestions(userId);
    }

    return this.suggestions.get(userId) || [];
  }

  /**
   * Add new suggestions for a user
   */
  private addSuggestions(userId: string, newSuggestions: ProactiveSuggestion[]) {
    const currentSuggestions = this.getProactiveSuggestions(userId);
    const allSuggestions = [...currentSuggestions, ...newSuggestions];

    // Keep only recent suggestions (last 10)
    const recentSuggestions = allSuggestions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    this.suggestions.set(userId, recentSuggestions);
    agentMemorySystem.saveSuggestions(userId, recentSuggestions);
  }

  /**
   * Remove a suggestion for a user
   */
  public removeSuggestion(userId: string, suggestionId: string): void {
    const currentSuggestions = this.getProactiveSuggestions(userId);
    const filteredSuggestions = currentSuggestions.filter(s => s.id !== suggestionId);

    this.suggestions.set(userId, filteredSuggestions);
    agentMemorySystem.saveSuggestions(userId, filteredSuggestions);

    console.log('🗑️ Suggestion removed:', suggestionId);
  }

  public shutdown(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
    console.log('🤖 Autonomous Agent Core shut down');
  }
}

// Singleton instance
export const autonomousAgent = new AutonomousAgentCore();