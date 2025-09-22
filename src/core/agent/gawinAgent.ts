/**
 * Gawin AI Agent - Core Autonomous Agent System
 * Transforms Gawin from reactive assistant to proactive autonomous agent
 *
 * Key Features:
 * - Autonomous planning and execution
 * - Multi-step task decomposition
 * - Intelligent tool orchestration
 * - Persistent goal management
 * - Self-reflection and learning
 * - Contextual decision making
 */

import { PlanningEngine } from './planning/planningEngine';
import { ToolOrchestrator } from './tools/toolOrchestrator';
import { GoalManager } from './goals/goalManager';
import { AgentMemory } from './memory/agentMemory';
import { ReflectionEngine } from './reflection/reflectionEngine';
import { ContextManager } from './context/contextManager';
import { ServiceIntegrator } from './integration/serviceIntegrator';
import {
  AgentGoal,
  AgentTask,
  AgentContext,
  AgentState,
  PerformanceMetrics,
  ToolExecutionResult,
  AgentPreferences
} from './types';

// Local interfaces specific to GawinAgent implementation
export interface AgentPlan {
  id: string;
  goalId: string;
  tasks: AgentTask[];
  strategy: 'sequential' | 'parallel' | 'hybrid';
  estimatedCompletion: Date;
  contingencies: AgentContingency[];
  confidence: number; // 0-1
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentContingency {
  condition: string;
  action: 'retry' | 'skip' | 'escalate' | 'alternative_plan';
  alternativePlan?: AgentPlan;
  escalationTarget?: string;
}

export class GawinAgent {
  private planningEngine: PlanningEngine;
  private toolOrchestrator: ToolOrchestrator;
  private goalManager: GoalManager;
  private memory: AgentMemory;
  private reflection: ReflectionEngine;
  private contextManager: ContextManager;
  private serviceIntegrator: ServiceIntegrator;
  private state: AgentState;
  private isActive: boolean = false;
  private executionLoop: NodeJS.Timeout | null = null;

  constructor(initialContext: AgentContext) {
    this.planningEngine = new PlanningEngine();
    this.toolOrchestrator = new ToolOrchestrator();
    this.goalManager = new GoalManager();
    this.memory = new AgentMemory();
    this.reflection = new ReflectionEngine();
    this.contextManager = new ContextManager(initialContext);
    this.serviceIntegrator = new ServiceIntegrator(this);

    this.state = {
      currentGoals: [],
      activeTasks: [],
      capabilities: this.initializeCapabilities(),
      performance: {
        tasksCompleted: 0,
        tasksSuccessful: 0,
        averageTaskDuration: 0,
        goalCompletionRate: 0,
        learningRate: 0.1,
        adaptationScore: 0.5,
        lastUpdated: new Date()
      },
      context: initialContext,
      preferences: {
        autonomy_level: 'semi_autonomous',
        risk_tolerance: 'moderate',
        learning_style: 'incremental',
        communication_frequency: 'regular',
        goal_setting: 'collaborative'
      }
    };

    this.initializeAgent();
  }

  /**
   * Initialize agent capabilities based on available services
   */
  private initializeCapabilities(): string[] {
    return [
      'natural_conversation',
      'multimodal_perception',
      'web_research',
      'document_analysis',
      'image_generation',
      'voice_synthesis',
      'speech_recognition',
      'language_translation',
      'code_analysis',
      'data_synthesis',
      'creative_writing',
      'academic_research',
      'fact_checking',
      'cultural_adaptation',
      'emotional_intelligence',
      'memory_management',
      'learning_adaptation',
      'tool_orchestration',
      'goal_planning',
      'self_reflection'
    ];
  }

  /**
   * Initialize the agent and start autonomous operation
   */
  private async initializeAgent(): Promise<void> {
    console.log('🤖 Initializing Gawin Agent...');

    // Load previous state if available
    await this.loadAgentState();

    // Initialize all subsystems
    // Note: Some subsystems don't require explicit initialization

    console.log('✅ Gawin Agent initialized successfully');
  }

  /**
   * Start autonomous agent execution
   */
  async startAgent(): Promise<void> {
    if (this.isActive) {
      console.log('⚠️ Agent is already active');
      return;
    }

    this.isActive = true;
    console.log('🚀 Starting Gawin Agent autonomous execution...');

    // Start the main execution loop
    this.executionLoop = setInterval(async () => {
      await this.executionCycle();
    }, 5000); // Execute every 5 seconds

    // Initial execution
    await this.executionCycle();
  }

  /**
   * Stop autonomous agent execution
   */
  async stopAgent(): Promise<void> {
    if (!this.isActive) {
      console.log('⚠️ Agent is not active');
      return;
    }

    this.isActive = false;

    if (this.executionLoop) {
      clearInterval(this.executionLoop);
      this.executionLoop = null;
    }

    // Save current state
    await this.saveAgentState();

    console.log('🛑 Gawin Agent stopped');
  }

  /**
   * Main execution cycle - the heart of autonomous operation
   */
  private async executionCycle(): Promise<void> {
    try {
      // Update context
      await this.contextManager.updateContext({}, 'execution_cycle');
      this.state.context = this.contextManager.getCurrentContext();

      // 1. Goal Management
      await this.manageGoals();

      // 2. Plan Execution
      await this.executePlans();

      // 3. Task Processing
      await this.processTasks();

      // 4. Self-Reflection
      await this.performSelfReflection();

      // 5. Learning and Adaptation
      await this.performLearning();

      // 6. State Persistence
      await this.saveAgentState();

    } catch (error) {
      console.error('❌ Error in agent execution cycle:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Manage goals - evaluate, prioritize, and create new goals
   */
  private async manageGoals(): Promise<void> {
    // Check for completed goals
    const completedGoals = this.state.currentGoals.filter(g => g.status === 'completed');
    if (completedGoals.length > 0) {
      console.log(`✅ Completed ${completedGoals.length} goals`);
      await this.goalManager.archiveCompletedGoals();
    }

    // Evaluate goal priorities based on context
    // Goal prioritization is handled internally by the goal manager

    // Check if we need new goals (proactive goal generation)
    if (this.state.preferences.goal_setting !== 'user_driven') {
      // Proactive goal suggestion is handled internally
    }

    // Remove completed goals from active list
    this.state.currentGoals = this.state.currentGoals.filter(g => g.status !== 'completed');
  }

  /**
   * Execute existing plans and create new ones as needed
   */
  private async executePlans(): Promise<void> {
    // Get goals that need planning
    const goalsNeedingPlans = this.state.currentGoals.filter(goal =>
      goal.status === 'pending' || goal.status === 'in_progress'
    );

    for (const goal of goalsNeedingPlans) {
      // Check if we have a plan for this goal
      let plan = await this.planningEngine.getPlan(goal.id);

      if (!plan) {
        // Create new plan
        console.log(`📋 Creating plan for goal: ${goal.description}`);
        plan = await this.planningEngine.createPlan(goal, this.state.context, this.state.capabilities);

        if (plan) {
          console.log(`✅ Created plan with ${plan.tasks.length} tasks`);
        }
      }

      if (plan) {
        // Execute plan
        await this.planningEngine.executePlan(plan, this.toolOrchestrator);

        // Update goal status
        const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = plan.tasks.length;
        const progress = (completedTasks / totalTasks) * 100;

        if (progress >= 100) {
          goal.status = 'completed';
          goal.lastUpdated = new Date();
        } else if (progress > 0) {
          goal.status = 'in_progress';
          goal.lastUpdated = new Date();
        }
      }
    }
  }

  /**
   * Process individual tasks
   */
  private async processTasks(): Promise<void> {
    // Get active tasks that are ready to execute
    const readyTasks = this.state.activeTasks.filter(task =>
      task.status === 'pending' && this.areTaskDependenciesMet(task)
    );

    // Execute tasks based on strategy (parallel, sequential, etc.)
    for (const task of readyTasks.slice(0, 3)) { // Limit concurrent tasks
      try {
        console.log(`⚡ Executing task: ${task.description}`);
        task.status = 'executing';

        const tools = await this.toolOrchestrator.selectOptimalTools(task, this.state.context);
        const strategy = await this.toolOrchestrator.createExecutionStrategy(tools.map(t => t.tool), task, this.state.context);
        const result = await this.toolOrchestrator.executeToolChain(strategy, task, this.state.context);

        task.result = result;
        task.status = 'completed';
        task.completedAt = new Date();
        // Task duration tracking would be handled externally

        this.state.performance.tasksCompleted++;
        this.state.performance.tasksSuccessful++;

        console.log(`✅ Task completed: ${task.description}`);

      } catch (error) {
        console.error(`❌ Task failed: ${task.description}`, error);
        task.error = error instanceof Error ? error.message : String(error);
        // Retry logic would be handled externally
        task.status = 'failed';
      }
    }

    // Remove completed tasks
    this.state.activeTasks = this.state.activeTasks.filter(task =>
      task.status !== 'completed' && task.status !== 'failed'
    );
  }

  /**
   * Check if task dependencies are met
   */
  private areTaskDependenciesMet(task: AgentTask): boolean {
    return task.dependencies.every(depId =>
      this.state.activeTasks.find(t => t.id === depId)?.status === 'completed'
    );
  }

  /**
   * Perform self-reflection and analysis
   */
  private async performSelfReflection(): Promise<void> {
    const insights = await this.reflection.performPeriodicReflection();

    console.log('🤔 Self-reflection completed:', insights.insights.length, 'insights generated');

    // Process action items from reflection
    const actionItems = insights.actionItems;
    if (actionItems.length > 0) {
      console.log('💡 Generated', actionItems.length, 'action items for improvement');
    }
  }

  /**
   * Perform learning and adaptation
   */
  private async performLearning(): Promise<void> {
    // Update performance metrics
    const completedTasks = this.state.performance.tasksCompleted;
    const successfulTasks = this.state.performance.tasksSuccessful;

    this.state.performance.goalCompletionRate = completedTasks > 0 ? successfulTasks / completedTasks : 0;
    this.state.performance.lastUpdated = new Date();

    // Learn from recent experiences
    const recentTasks = this.state.activeTasks.filter(task =>
      task.completedAt && (Date.now() - task.completedAt.getTime()) < 3600000 // Last hour
    );

    if (recentTasks.length > 0) {
      // Store experiences in memory for learning

      // Adapt strategies based on performance
      if (this.state.performance.goalCompletionRate < 0.7) {
        await this.adaptStrategies();
      }
    }
  }

  /**
   * Apply improvement suggestions
   */
  private async applyImprovements(suggestions: string[]): Promise<void> {
    for (const suggestion of suggestions) {
      try {
        await this.reflection.applyImprovement({ description: suggestion, type: 'general' });
        console.log(`✅ Applied improvement: ${suggestion}`);
      } catch (error) {
        console.error(`❌ Failed to apply improvement: ${suggestion}`, error);
      }
    }
  }

  /**
   * Adapt strategies based on performance
   */
  private async adaptStrategies(): Promise<void> {
    console.log('🔄 Adapting strategies based on performance...');

    // Adjust risk tolerance
    if (this.state.performance.goalCompletionRate < 0.5) {
      this.state.preferences.risk_tolerance = 'conservative';
    } else if (this.state.performance.goalCompletionRate > 0.8) {
      this.state.preferences.risk_tolerance = 'moderate';
    }

    // Adjust learning rate
    this.state.performance.learningRate = Math.min(0.3, this.state.performance.learningRate * 1.1);

    // Update planning strategies
    await this.planningEngine.adaptStrategies(this.state.performance);
  }

  /**
   * Handle execution errors
   */
  private async handleExecutionError(error: any): Promise<void> {
    console.error('🚨 Agent execution error:', error);

    // Store error for learning
    await this.memory.storeError(error, this.state.context);

    // Reduce autonomy temporarily if too many errors
    const recentErrors = await this.memory.getRecentErrors(this.state.context.userId);
    if (recentErrors.length > 5) {
      this.state.preferences.autonomy_level = 'manual';
      console.log('⚠️ Reduced autonomy level due to repeated errors');
    }
  }

  /**
   * Public method to add a new goal
   */
  async addGoal(description: string, priority: AgentGoal['priority'] = 'medium'): Promise<string> {
    const goal: AgentGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description,
      priority,
      status: 'pending',
      tasks: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      estimatedDuration: 180000,
      context: this.state.context,
      requiredCapabilities: [],
      metadata: {}
    };

    this.state.currentGoals.push(goal);
    console.log(`🎯 Added new goal: ${description}`);

    return goal.id;
  }

  /**
   * Public method to get agent status
   */
  getStatus(): {
    isActive: boolean;
    currentGoals: number;
    activeTasks: number;
    performance: PerformanceMetrics;
    capabilities: string[];
  } {
    return {
      isActive: this.isActive,
      currentGoals: this.state.currentGoals.length,
      activeTasks: this.state.activeTasks.length,
      performance: this.state.performance,
      capabilities: this.state.capabilities
    };
  }

  /**
   * Public method to update preferences
   */
  updatePreferences(preferences: Partial<AgentPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    console.log('⚙️ Updated agent preferences');
  }

  /**
   * Save agent state to persistent storage
   */
  private async saveAgentState(): Promise<void> {
    try {
      const stateData = {
        state: this.state,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('gawin_agent_state', JSON.stringify(stateData));
    } catch (error) {
      console.error('Failed to save agent state:', error);
    }
  }

  /**
   * Load agent state from persistent storage
   */
  private async loadAgentState(): Promise<void> {
    try {
      const saved = localStorage.getItem('gawin_agent_state');
      if (saved) {
        const stateData = JSON.parse(saved);
        this.state = { ...this.state, ...stateData.state };
        console.log('📂 Loaded previous agent state');
      }
    } catch (error) {
      console.error('Failed to load agent state:', error);
    }
  }

  // Service Integration Methods
  registerCapability(name: string, details: any): void {
    if (!this.state.capabilities.includes(name)) {
      this.state.capabilities.push(name);
    }
  }

  updateCapabilityReliability(name: string, reliability: number): void {
    // Update internal capability tracking
  }

  async createGoal(description: string, priority: any, context: AgentContext, templateId?: string): Promise<any> {
    return this.goalManager.createGoal(description, priority, context, templateId);
  }

  async executeGoal(goalId: string): Promise<boolean> {
    try {
      const goal = this.goalManager.getActiveGoals().find(g => g.id === goalId);
      if (!goal) return false;

      const plan = await this.planningEngine.createPlan(goal, this.state.context, this.state.capabilities);
      if (!plan) return false;

      // Execute the plan's first task as an example
      const executionStrategy = await this.toolOrchestrator.createExecutionStrategy([], goal.tasks[0], this.state.context);
      const results = await this.toolOrchestrator.executeToolChain(executionStrategy, goal.tasks[0], this.state.context);

      await this.goalManager.updateGoalStatus(goalId, 'completed');
      return true;
    } catch {
      return false;
    }
  }

  async getResponseEnhancement(original: string, userMessage: string, context: AgentContext): Promise<string | null> {
    // Analyze if response can be enhanced
    if (original.length < 100 && userMessage.toLowerCase().includes('explain')) {
      return `${original}\n\nLet me provide more context: This relates to how we can better understand and adapt to your needs through continuous learning and cultural awareness.`;
    }
    return null;
  }

  // Service Integrator Access
  getServiceIntegrator(): ServiceIntegrator {
    return this.serviceIntegrator;
  }
}

export default GawinAgent;