/**
 * Autonomous Planning Engine for Gawin Agent
 * Implements ReAct (Reasoning + Acting) framework for dynamic planning
 *
 * Key Features:
 * - Multi-step task decomposition
 * - Dynamic plan adaptation
 * - Contingency planning
 * - Performance-based strategy optimization
 * - Context-aware planning
 */

import { AgentGoal, AgentTask, AgentPlan, AgentContext, AgentPerformance } from '../gawinAgent';

export interface PlanningStrategy {
  name: string;
  description: string;
  confidence: number;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
}

export interface ReasoningStep {
  step: number;
  thought: string;
  action: string;
  observation: string;
  confidence: number;
  timestamp: Date;
}

export interface PlanningContext {
  available_tools: string[];
  user_context: AgentContext;
  historical_performance: AgentPerformance;
  current_workload: number;
  time_constraints: string[];
  resource_constraints: string[];
}

export class PlanningEngine {
  private plans: Map<string, AgentPlan> = new Map();
  private strategies: Map<string, PlanningStrategy> = new Map();
  private reasoningHistory: ReasoningStep[] = [];
  private performanceMetrics: Map<string, number> = new Map();

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Planning Engine...');

    // Initialize planning strategies
    this.initializePlanningStrategies();

    // Load historical performance data
    await this.loadPerformanceMetrics();

    console.log('✅ Planning Engine initialized');
  }

  /**
   * Initialize different planning strategies
   */
  private initializePlanningStrategies(): void {
    this.strategies.set('sequential', {
      name: 'Sequential Execution',
      description: 'Execute tasks one after another for maximum reliability',
      confidence: 0.9,
      estimatedDuration: 1.0,
      riskLevel: 'low',
      requiredCapabilities: []
    });

    this.strategies.set('parallel', {
      name: 'Parallel Execution',
      description: 'Execute multiple tasks simultaneously for speed',
      confidence: 0.7,
      estimatedDuration: 0.6,
      riskLevel: 'medium',
      requiredCapabilities: ['multi_tasking']
    });

    this.strategies.set('adaptive', {
      name: 'Adaptive Planning',
      description: 'Dynamically adjust plan based on real-time feedback',
      confidence: 0.8,
      estimatedDuration: 0.8,
      riskLevel: 'medium',
      requiredCapabilities: ['self_reflection', 'learning_adaptation']
    });

    this.strategies.set('research_focused', {
      name: 'Research-First Strategy',
      description: 'Gather comprehensive information before acting',
      confidence: 0.85,
      estimatedDuration: 1.2,
      riskLevel: 'low',
      requiredCapabilities: ['web_research', 'data_synthesis']
    });
  }

  /**
   * Create a comprehensive plan for a given goal using ReAct framework
   */
  async createPlan(goal: AgentGoal, context: AgentContext, capabilities: string[]): Promise<AgentPlan | null> {
    console.log(`📋 Creating plan for goal: ${goal.description}`);

    const planningContext: PlanningContext = {
      available_tools: capabilities,
      user_context: context,
      historical_performance: {
        tasksCompleted: this.performanceMetrics.get('tasks_completed') || 0,
        tasksSuccessful: this.performanceMetrics.get('tasks_successful') || 0,
        averageTaskDuration: this.performanceMetrics.get('avg_duration') || 30,
        goalCompletionRate: this.performanceMetrics.get('goal_completion_rate') || 0.5,
        learningRate: this.performanceMetrics.get('learning_rate') || 0.1,
        adaptationScore: this.performanceMetrics.get('adaptation_score') || 0.5,
        lastUpdated: new Date()
      },
      current_workload: this.plans.size,
      time_constraints: [],
      resource_constraints: []
    };

    // Step 1: Reasoning - Analyze the goal
    const analysis = await this.analyzeGoal(goal, planningContext);

    // Step 2: Strategy Selection - Choose optimal planning strategy
    const strategy = await this.selectPlanningStrategy(goal, analysis, planningContext);

    // Step 3: Task Decomposition - Break goal into actionable tasks
    const tasks = await this.decomposeGoal(goal, strategy, planningContext);

    if (tasks.length === 0) {
      console.warn('⚠️ No tasks generated for goal');
      return null;
    }

    // Step 4: Create plan with contingencies
    const plan: AgentPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: goal.id,
      tasks,
      strategy: strategy.name === 'Parallel Execution' ? 'parallel' : 'sequential',
      estimatedCompletion: new Date(Date.now() + (strategy.estimatedDuration * 60 * 60 * 1000)),
      contingencies: await this.createContingencies(tasks, strategy),
      confidence: strategy.confidence,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the plan
    this.plans.set(plan.id, plan);

    console.log(`✅ Created plan with ${tasks.length} tasks (${strategy.name})`);
    return plan;
  }

  /**
   * Analyze goal using ReAct reasoning
   */
  private async analyzeGoal(goal: AgentGoal, context: PlanningContext): Promise<any> {
    const reasoning: ReasoningStep = {
      step: 1,
      thought: `Analyzing goal: "${goal.description}". Priority: ${goal.priority}`,
      action: 'goal_analysis',
      observation: '',
      confidence: 0.0,
      timestamp: new Date()
    };

    // Determine goal type and complexity
    const goalType = this.classifyGoal(goal.description);
    const complexity = this.assessComplexity(goal.description, context);
    const requiredCapabilities = this.identifyRequiredCapabilities(goal.description, context.available_tools);

    reasoning.observation = `Goal type: ${goalType}, Complexity: ${complexity}, Required capabilities: ${requiredCapabilities.join(', ')}`;
    reasoning.confidence = 0.8;

    this.reasoningHistory.push(reasoning);

    return {
      type: goalType,
      complexity,
      required_capabilities: requiredCapabilities,
      estimated_effort: this.estimateEffort(complexity, requiredCapabilities.length),
      risk_factors: this.identifyRiskFactors(goal, context)
    };
  }

  /**
   * Classify the type of goal
   */
  private classifyGoal(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('research') || lowerDesc.includes('find') || lowerDesc.includes('learn')) {
      return 'research';
    } else if (lowerDesc.includes('create') || lowerDesc.includes('generate') || lowerDesc.includes('build')) {
      return 'creation';
    } else if (lowerDesc.includes('analyze') || lowerDesc.includes('evaluate') || lowerDesc.includes('assess')) {
      return 'analysis';
    } else if (lowerDesc.includes('communicate') || lowerDesc.includes('respond') || lowerDesc.includes('interact')) {
      return 'communication';
    } else if (lowerDesc.includes('improve') || lowerDesc.includes('optimize') || lowerDesc.includes('enhance')) {
      return 'optimization';
    } else {
      return 'general';
    }
  }

  /**
   * Assess goal complexity
   */
  private assessComplexity(description: string, context: PlanningContext): 'low' | 'medium' | 'high' {
    let complexity = 0;

    // Word count indicates complexity
    const wordCount = description.split(' ').length;
    complexity += wordCount > 10 ? 2 : wordCount > 5 ? 1 : 0;

    // Multiple actions indicate complexity
    const actionWords = ['and', 'then', 'also', 'additionally', 'furthermore'];
    complexity += actionWords.filter(word => description.toLowerCase().includes(word)).length;

    // Technical terms indicate complexity
    const technicalTerms = ['api', 'database', 'integration', 'algorithm', 'optimization', 'analysis'];
    complexity += technicalTerms.filter(term => description.toLowerCase().includes(term)).length;

    // Resource constraints increase complexity
    complexity += context.resource_constraints.length;

    if (complexity >= 5) return 'high';
    if (complexity >= 2) return 'medium';
    return 'low';
  }

  /**
   * Identify required capabilities for the goal
   */
  private identifyRequiredCapabilities(description: string, availableTools: string[]): string[] {
    const capabilities: string[] = [];
    const lowerDesc = description.toLowerCase();

    const capabilityMapping = {
      'research': ['web_research', 'data_synthesis'],
      'search': ['web_research'],
      'analyze': ['document_analysis', 'data_synthesis'],
      'create': ['creative_writing', 'image_generation'],
      'write': ['creative_writing', 'natural_conversation'],
      'translate': ['language_translation'],
      'speak': ['voice_synthesis'],
      'listen': ['speech_recognition'],
      'remember': ['memory_management'],
      'learn': ['learning_adaptation'],
      'code': ['code_analysis'],
      'image': ['image_generation'],
      'vision': ['multimodal_perception'],
      'fact': ['fact_checking']
    };

    for (const [keyword, caps] of Object.entries(capabilityMapping)) {
      if (lowerDesc.includes(keyword)) {
        capabilities.push(...caps);
      }
    }

    // Filter by available tools
    return capabilities.filter(cap => availableTools.includes(cap));
  }

  /**
   * Estimate effort required for goal
   */
  private estimateEffort(complexity: string, capabilityCount: number): number {
    const complexityMultiplier = { 'low': 1, 'medium': 2, 'high': 4 };
    const baseEffort = 30; // minutes
    return baseEffort * complexityMultiplier[complexity as keyof typeof complexityMultiplier] * Math.max(1, capabilityCount / 2);
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(goal: AgentGoal, context: PlanningContext): string[] {
    const risks: string[] = [];

    if (goal.deadline && goal.deadline.getTime() < Date.now() + 3600000) {
      risks.push('tight_deadline');
    }

    if (context.current_workload > 5) {
      risks.push('high_workload');
    }

    if (goal.priority === 'critical') {
      risks.push('high_stakes');
    }

    if (context.resource_constraints.length > 0) {
      risks.push('resource_constraints');
    }

    return risks;
  }

  /**
   * Select optimal planning strategy
   */
  private async selectPlanningStrategy(goal: AgentGoal, analysis: any, context: PlanningContext): Promise<PlanningStrategy> {
    const reasoning: ReasoningStep = {
      step: 2,
      thought: `Selecting strategy for ${analysis.type} goal with ${analysis.complexity} complexity`,
      action: 'strategy_selection',
      observation: '',
      confidence: 0.0,
      timestamp: new Date()
    };

    let bestStrategy = this.strategies.get('sequential')!;
    let bestScore = 0;

    for (const [name, strategy] of this.strategies) {
      let score = strategy.confidence;

      // Adjust score based on goal characteristics
      if (analysis.complexity === 'low' && name === 'parallel') {
        score += 0.2; // Parallel is good for simple tasks
      } else if (analysis.complexity === 'high' && name === 'sequential') {
        score += 0.2; // Sequential is safer for complex tasks
      }

      // Consider risk tolerance
      if (analysis.risk_factors.length > 2 && strategy.riskLevel === 'low') {
        score += 0.3;
      }

      // Consider time constraints
      if (goal.deadline && name === 'parallel') {
        score += 0.1;
      }

      // Consider capability requirements
      const missingCapabilities = strategy.requiredCapabilities.filter(
        cap => !context.available_tools.includes(cap)
      );
      score -= missingCapabilities.length * 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }

    reasoning.observation = `Selected ${bestStrategy.name} with score ${bestScore.toFixed(2)}`;
    reasoning.confidence = bestScore;
    this.reasoningHistory.push(reasoning);

    return bestStrategy;
  }

  /**
   * Decompose goal into actionable tasks
   */
  private async decomposeGoal(goal: AgentGoal, strategy: PlanningStrategy, context: PlanningContext): Promise<AgentTask[]> {
    const reasoning: ReasoningStep = {
      step: 3,
      thought: `Decomposing goal into tasks using ${strategy.name}`,
      action: 'task_decomposition',
      observation: '',
      confidence: 0.0,
      timestamp: new Date()
    };

    const tasks: AgentTask[] = [];
    const goalType = this.classifyGoal(goal.description);

    // Generate tasks based on goal type
    switch (goalType) {
      case 'research':
        tasks.push(...this.createResearchTasks(goal, context));
        break;
      case 'creation':
        tasks.push(...this.createCreationTasks(goal, context));
        break;
      case 'analysis':
        tasks.push(...this.createAnalysisTasks(goal, context));
        break;
      case 'communication':
        tasks.push(...this.createCommunicationTasks(goal, context));
        break;
      case 'optimization':
        tasks.push(...this.createOptimizationTasks(goal, context));
        break;
      default:
        tasks.push(...this.createGeneralTasks(goal, context));
    }

    // Set task dependencies and priorities
    this.establishTaskDependencies(tasks, strategy);

    reasoning.observation = `Created ${tasks.length} tasks: ${tasks.map(t => t.description).join(', ')}`;
    reasoning.confidence = 0.8;
    this.reasoningHistory.push(reasoning);

    return tasks;
  }

  /**
   * Create research-specific tasks
   */
  private createResearchTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Identify research sources and keywords',
      'research',
      1,
      ['web_research'],
      [],
      15
    ));

    tasks.push(this.createTask(
      goal.id,
      'Gather information from multiple sources',
      'research',
      2,
      ['web_research', 'data_synthesis'],
      [tasks[0]?.id || ''],
      30
    ));

    tasks.push(this.createTask(
      goal.id,
      'Analyze and synthesize research findings',
      'analysis',
      3,
      ['document_analysis', 'data_synthesis'],
      [tasks[1]?.id || ''],
      20
    ));

    tasks.push(this.createTask(
      goal.id,
      'Verify facts and cross-reference sources',
      'analysis',
      4,
      ['fact_checking'],
      [tasks[2]?.id || ''],
      15
    ));

    return tasks;
  }

  /**
   * Create creation-specific tasks
   */
  private createCreationTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Plan and outline the creation',
      'analysis',
      1,
      ['natural_conversation'],
      [],
      10
    ));

    tasks.push(this.createTask(
      goal.id,
      'Create initial draft or prototype',
      'creation',
      2,
      ['creative_writing', 'image_generation'],
      [tasks[0]?.id || ''],
      45
    ));

    tasks.push(this.createTask(
      goal.id,
      'Review and refine the creation',
      'analysis',
      3,
      ['document_analysis'],
      [tasks[1]?.id || ''],
      20
    ));

    tasks.push(this.createTask(
      goal.id,
      'Finalize and optimize the creation',
      'creation',
      4,
      ['creative_writing'],
      [tasks[2]?.id || ''],
      15
    ));

    return tasks;
  }

  /**
   * Create analysis-specific tasks
   */
  private createAnalysisTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Gather data and materials for analysis',
      'research',
      1,
      ['web_research', 'document_analysis'],
      [],
      20
    ));

    tasks.push(this.createTask(
      goal.id,
      'Perform detailed analysis',
      'analysis',
      2,
      ['document_analysis', 'data_synthesis'],
      [tasks[0]?.id || ''],
      40
    ));

    tasks.push(this.createTask(
      goal.id,
      'Validate findings and conclusions',
      'analysis',
      3,
      ['fact_checking', 'data_synthesis'],
      [tasks[1]?.id || ''],
      15
    ));

    return tasks;
  }

  /**
   * Create communication-specific tasks
   */
  private createCommunicationTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Understand communication context and audience',
      'analysis',
      1,
      ['cultural_adaptation', 'emotional_intelligence'],
      [],
      10
    ));

    tasks.push(this.createTask(
      goal.id,
      'Craft appropriate message or response',
      'communication',
      2,
      ['natural_conversation', 'language_translation'],
      [tasks[0]?.id || ''],
      20
    ));

    tasks.push(this.createTask(
      goal.id,
      'Review and optimize communication',
      'communication',
      3,
      ['emotional_intelligence'],
      [tasks[1]?.id || ''],
      10
    ));

    return tasks;
  }

  /**
   * Create optimization-specific tasks
   */
  private createOptimizationTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Analyze current state and identify improvements',
      'analysis',
      1,
      ['document_analysis', 'self_reflection'],
      [],
      25
    ));

    tasks.push(this.createTask(
      goal.id,
      'Design optimization strategy',
      'analysis',
      2,
      ['goal_planning'],
      [tasks[0]?.id || ''],
      20
    ));

    tasks.push(this.createTask(
      goal.id,
      'Implement optimizations',
      'tool_use',
      3,
      ['tool_orchestration'],
      [tasks[1]?.id || ''],
      30
    ));

    tasks.push(this.createTask(
      goal.id,
      'Validate optimization results',
      'analysis',
      4,
      ['self_reflection'],
      [tasks[2]?.id || ''],
      15
    ));

    return tasks;
  }

  /**
   * Create general tasks for unclassified goals
   */
  private createGeneralTasks(goal: AgentGoal, context: PlanningContext): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push(this.createTask(
      goal.id,
      'Analyze and understand the goal',
      'analysis',
      1,
      ['natural_conversation'],
      [],
      10
    ));

    tasks.push(this.createTask(
      goal.id,
      'Execute primary action for the goal',
      'tool_use',
      2,
      ['tool_orchestration'],
      [tasks[0]?.id || ''],
      30
    ));

    tasks.push(this.createTask(
      goal.id,
      'Review and validate results',
      'analysis',
      3,
      ['self_reflection'],
      [tasks[1]?.id || ''],
      10
    ));

    return tasks;
  }

  /**
   * Helper method to create a task
   */
  private createTask(
    goalId: string,
    description: string,
    type: AgentTask['type'],
    priority: number,
    requiredTools: string[],
    dependencies: string[],
    estimatedDuration: number
  ): AgentTask {
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId,
      description,
      type,
      priority,
      status: 'pending',
      requiredTools,
      dependencies,
      estimatedDuration,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date()
    };
  }

  /**
   * Establish dependencies between tasks
   */
  private establishTaskDependencies(tasks: AgentTask[], strategy: PlanningStrategy): void {
    if (strategy.name === 'Sequential Execution') {
      // Each task depends on the previous one
      for (let i = 1; i < tasks.length; i++) {
        tasks[i].dependencies = [tasks[i - 1].id];
      }
    } else if (strategy.name === 'Parallel Execution') {
      // Only critical dependencies
      tasks.forEach(task => {
        if (task.description.includes('analyze') || task.description.includes('review')) {
          // Analysis tasks depend on data gathering tasks
          const dataTasks = tasks.filter(t =>
            t.description.includes('gather') || t.description.includes('create') || t.description.includes('draft')
          );
          task.dependencies = dataTasks.map(t => t.id);
        }
      });
    }
  }

  /**
   * Create contingency plans for potential failures
   */
  private async createContingencies(tasks: AgentTask[], strategy: PlanningStrategy): Promise<any[]> {
    const contingencies = [];

    // Add timeout contingency for long tasks
    const longTasks = tasks.filter(t => t.estimatedDuration > 30);
    for (const task of longTasks) {
      contingencies.push({
        condition: `task_${task.id}_timeout`,
        action: 'retry',
        alternativePlan: null,
        escalationTarget: 'user'
      });
    }

    // Add failure contingency for critical tasks
    const criticalTasks = tasks.filter(t => t.priority >= 3);
    for (const task of criticalTasks) {
      contingencies.push({
        condition: `task_${task.id}_failed`,
        action: 'alternative_plan',
        alternativePlan: null, // Would create alternative plan
        escalationTarget: 'user'
      });
    }

    return contingencies;
  }

  /**
   * Execute a plan using the tool orchestrator
   */
  async executePlan(plan: AgentPlan, toolOrchestrator: any): Promise<void> {
    console.log(`🚀 Executing plan ${plan.id} with ${plan.tasks.length} tasks`);

    // Update plan execution start time
    plan.updatedAt = new Date();

    // Execute tasks based on strategy
    if (plan.strategy === 'parallel') {
      await this.executeTasksInParallel(plan.tasks, toolOrchestrator);
    } else {
      await this.executeTasksSequentially(plan.tasks, toolOrchestrator);
    }
  }

  /**
   * Execute tasks sequentially
   */
  private async executeTasksSequentially(tasks: AgentTask[], toolOrchestrator: any): Promise<void> {
    for (const task of tasks) {
      if (task.status === 'pending') {
        try {
          await toolOrchestrator.executeTask(task);
        } catch (error) {
          console.error(`Task ${task.id} failed:`, error);
          // Handle contingencies here
        }
      }
    }
  }

  /**
   * Execute tasks in parallel where possible
   */
  private async executeTasksInParallel(tasks: AgentTask[], toolOrchestrator: any): Promise<void> {
    const readyTasks = tasks.filter(task =>
      task.status === 'pending' && task.dependencies.length === 0
    );

    const promises = readyTasks.map(task =>
      toolOrchestrator.executeTask(task).catch((error: any) => {
        console.error(`Task ${task.id} failed:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get an existing plan
   */
  async getPlan(goalId: string): Promise<AgentPlan | null> {
    for (const plan of this.plans.values()) {
      if (plan.goalId === goalId) {
        return plan;
      }
    }
    return null;
  }

  /**
   * Adapt strategies based on performance
   */
  async adaptStrategies(performance: AgentPerformance): Promise<void> {
    console.log('🔄 Adapting planning strategies based on performance...');

    // Update strategy confidence based on success rate
    if (performance.goalCompletionRate < 0.6) {
      // Reduce confidence in risky strategies
      const parallelStrategy = this.strategies.get('parallel');
      if (parallelStrategy) {
        parallelStrategy.confidence = Math.max(0.1, parallelStrategy.confidence - 0.1);
      }

      // Increase confidence in safe strategies
      const sequentialStrategy = this.strategies.get('sequential');
      if (sequentialStrategy) {
        sequentialStrategy.confidence = Math.min(1.0, sequentialStrategy.confidence + 0.1);
      }
    } else if (performance.goalCompletionRate > 0.8) {
      // Increase confidence in efficient strategies
      const parallelStrategy = this.strategies.get('parallel');
      if (parallelStrategy) {
        parallelStrategy.confidence = Math.min(1.0, parallelStrategy.confidence + 0.05);
      }
    }

    // Adjust estimated durations based on actual performance
    if (performance.averageTaskDuration > 0) {
      for (const strategy of this.strategies.values()) {
        const actualVsEstimated = performance.averageTaskDuration / (strategy.estimatedDuration * 60);
        strategy.estimatedDuration *= Math.min(2.0, Math.max(0.5, actualVsEstimated));
      }
    }
  }

  /**
   * Load performance metrics from storage
   */
  private async loadPerformanceMetrics(): Promise<void> {
    try {
      const saved = localStorage.getItem('gawin_planning_metrics');
      if (saved) {
        const metrics = JSON.parse(saved);
        this.performanceMetrics = new Map(Object.entries(metrics));
      }
    } catch (error) {
      console.error('Failed to load planning metrics:', error);
    }
  }

  /**
   * Save performance metrics to storage
   */
  async savePerformanceMetrics(): Promise<void> {
    try {
      const metrics = Object.fromEntries(this.performanceMetrics);
      localStorage.setItem('gawin_planning_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to save planning metrics:', error);
    }
  }

  /**
   * Get reasoning history for debugging
   */
  getReasoningHistory(): ReasoningStep[] {
    return this.reasoningHistory.slice(-50); // Last 50 steps
  }

  /**
   * Get current planning statistics
   */
  getStatistics(): {
    totalPlans: number;
    activePlans: number;
    strategies: PlanningStrategy[];
    averageConfidence: number;
  } {
    const strategies = Array.from(this.strategies.values());
    const averageConfidence = strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length;

    return {
      totalPlans: this.plans.size,
      activePlans: Array.from(this.plans.values()).filter(p =>
        p.tasks.some(t => t.status === 'pending' || t.status === 'executing')
      ).length,
      strategies,
      averageConfidence
    };
  }
}

export default PlanningEngine;