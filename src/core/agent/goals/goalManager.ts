import { AgentGoal, AgentTask, AgentContext, GoalStatus, GoalPriority } from '../types';

export interface GoalProgress {
  goalId: string;
  completedTasks: number;
  totalTasks: number;
  successRate: number;
  estimatedCompletion: Date;
  blockers: string[];
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  dependencies: string[];
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  taskTemplates: Partial<AgentTask>[];
}

export interface GoalMetrics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageCompletionTime: number;
  successRate: number;
  topCategories: Record<string, number>;
  performanceTrends: Record<string, number[]>;
}

export class GoalManager {
  private goals: Map<string, AgentGoal> = new Map();
  private goalProgress: Map<string, GoalProgress> = new Map();
  private goalHistory: AgentGoal[] = [];
  private goalTemplates: Map<string, GoalTemplate> = new Map();
  private persistenceLayer: any;

  constructor() {
    this.initializeGoalTemplates();
    this.loadPersistedGoals();
  }

  private initializeGoalTemplates(): void {
    const templates: GoalTemplate[] = [
      {
        id: 'voice_interaction',
        name: 'Voice Interaction Enhancement',
        description: 'Improve voice-based communication capabilities',
        category: 'communication',
        estimatedDuration: 300000,
        complexity: 'medium',
        requiredCapabilities: ['voice_synthesis', 'speech_analysis'],
        taskTemplates: [
          { type: 'voice', description: 'Initialize enhanced voice service', priority: 'high' },
          { type: 'analysis', description: 'Analyze user speech patterns', priority: 'medium' },
          { type: 'voice', description: 'Synthesize contextual response', priority: 'high' }
        ]
      },
      {
        id: 'cultural_adaptation',
        name: 'Cultural Context Adaptation',
        description: 'Adapt to user cultural and linguistic context',
        category: 'personalization',
        estimatedDuration: 600000,
        complexity: 'high',
        requiredCapabilities: ['language_analysis', 'cultural_modeling', 'memory_persistence'],
        taskTemplates: [
          { type: 'analysis', description: 'Analyze cultural communication patterns', priority: 'high' },
          { type: 'memory', description: 'Store cultural preferences', priority: 'medium' },
          { type: 'adaptation', description: 'Apply cultural adaptations', priority: 'high' }
        ]
      },
      {
        id: 'information_gathering',
        name: 'Information Research',
        description: 'Gather and synthesize information from multiple sources',
        category: 'research',
        estimatedDuration: 240000,
        complexity: 'medium',
        requiredCapabilities: ['web_search', 'content_analysis', 'synthesis'],
        taskTemplates: [
          { type: 'web', description: 'Search for relevant information', priority: 'high' },
          { type: 'analysis', description: 'Analyze and validate sources', priority: 'high' },
          { type: 'synthesis', description: 'Synthesize findings', priority: 'medium' }
        ]
      },
      {
        id: 'proactive_assistance',
        name: 'Proactive User Assistance',
        description: 'Anticipate user needs and provide proactive help',
        category: 'assistance',
        estimatedDuration: 180000,
        complexity: 'high',
        requiredCapabilities: ['pattern_recognition', 'predictive_modeling', 'context_awareness'],
        taskTemplates: [
          { type: 'analysis', description: 'Analyze user behavior patterns', priority: 'medium' },
          { type: 'prediction', description: 'Predict user needs', priority: 'high' },
          { type: 'action', description: 'Execute proactive assistance', priority: 'high' }
        ]
      },
      {
        id: 'learning_optimization',
        name: 'Continuous Learning',
        description: 'Learn from interactions to improve performance',
        category: 'learning',
        estimatedDuration: 0,
        complexity: 'high',
        requiredCapabilities: ['experience_analysis', 'model_updating', 'performance_tracking'],
        taskTemplates: [
          { type: 'analysis', description: 'Analyze interaction outcomes', priority: 'low' },
          { type: 'learning', description: 'Update internal models', priority: 'medium' },
          { type: 'optimization', description: 'Optimize future responses', priority: 'medium' }
        ]
      }
    ];

    templates.forEach(template => {
      this.goalTemplates.set(template.id, template);
    });
  }

  async createGoal(
    description: string,
    priority: GoalPriority = 'medium',
    context?: AgentContext,
    templateId?: string
  ): Promise<AgentGoal> {
    const goalId = this.generateGoalId();

    let goal: AgentGoal;

    if (templateId && this.goalTemplates.has(templateId)) {
      goal = this.createFromTemplate(goalId, templateId, description, priority, context);
    } else {
      goal = this.createCustomGoal(goalId, description, priority, context);
    }

    this.goals.set(goalId, goal);
    this.initializeGoalProgress(goal);
    await this.persistGoal(goal);

    return goal;
  }

  private createFromTemplate(
    goalId: string,
    templateId: string,
    description: string,
    priority: GoalPriority,
    context?: AgentContext
  ): AgentGoal {
    const template = this.goalTemplates.get(templateId)!;

    const tasks: AgentTask[] = template.taskTemplates.map((taskTemplate, index) => ({
      id: `${goalId}_task_${index}`,
      type: taskTemplate.type || 'general',
      description: taskTemplate.description || '',
      priority: taskTemplate.priority || priority,
      status: 'pending',
      parameters: taskTemplate.parameters || {},
      dependencies: taskTemplate.dependencies || [],
      estimatedDuration: 60000,
      createdAt: new Date(),
      context: context || {}
    }));

    return {
      id: goalId,
      description: description || template.description,
      priority,
      status: 'active',
      tasks,
      createdAt: new Date(),
      estimatedDuration: template.estimatedDuration,
      context: context || {},
      category: template.category,
      requiredCapabilities: template.requiredCapabilities,
      metadata: {
        templateId,
        complexity: template.complexity,
        source: 'template'
      }
    };
  }

  private createCustomGoal(
    goalId: string,
    description: string,
    priority: GoalPriority,
    context?: AgentContext
  ): AgentGoal {
    const analysisResult = this.analyzeGoalRequirements(description, context);

    const tasks: AgentTask[] = analysisResult.suggestedTasks.map((taskDesc, index) => ({
      id: `${goalId}_task_${index}`,
      type: this.inferTaskType(taskDesc),
      description: taskDesc,
      priority,
      status: 'pending',
      parameters: {},
      dependencies: [],
      estimatedDuration: 60000,
      createdAt: new Date(),
      context: context || {}
    }));

    return {
      id: goalId,
      description,
      priority,
      status: 'active',
      tasks,
      createdAt: new Date(),
      estimatedDuration: analysisResult.estimatedDuration,
      context: context || {},
      category: analysisResult.category,
      requiredCapabilities: analysisResult.requiredCapabilities,
      metadata: {
        complexity: analysisResult.complexity,
        source: 'custom',
        analysisConfidence: analysisResult.confidence
      }
    };
  }

  private analyzeGoalRequirements(description: string, context?: AgentContext) {
    const lowerDesc = description.toLowerCase();

    let category = 'general';
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    let requiredCapabilities: string[] = [];
    let suggestedTasks: string[] = [];
    let estimatedDuration = 180000;

    if (lowerDesc.includes('voice') || lowerDesc.includes('speak')) {
      category = 'communication';
      requiredCapabilities.push('voice_synthesis', 'speech_analysis');
      suggestedTasks.push('Initialize voice service', 'Process voice request', 'Generate voice response');
    }

    if (lowerDesc.includes('learn') || lowerDesc.includes('analyze')) {
      category = 'learning';
      complexity = 'high';
      requiredCapabilities.push('pattern_recognition', 'data_analysis');
      suggestedTasks.push('Collect data', 'Analyze patterns', 'Update models');
      estimatedDuration = 300000;
    }

    if (lowerDesc.includes('search') || lowerDesc.includes('find') || lowerDesc.includes('research')) {
      category = 'research';
      requiredCapabilities.push('web_search', 'content_analysis');
      suggestedTasks.push('Search for information', 'Validate sources', 'Synthesize results');
      estimatedDuration = 240000;
    }

    if (lowerDesc.includes('help') || lowerDesc.includes('assist')) {
      category = 'assistance';
      requiredCapabilities.push('context_awareness', 'problem_solving');
      suggestedTasks.push('Understand user need', 'Identify solution approach', 'Execute assistance');
    }

    if (suggestedTasks.length === 0) {
      suggestedTasks = ['Analyze request', 'Plan approach', 'Execute solution'];
    }

    return {
      category,
      complexity,
      requiredCapabilities,
      suggestedTasks,
      estimatedDuration,
      confidence: 0.8
    };
  }

  private inferTaskType(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('voice') || lowerDesc.includes('speak')) return 'voice';
    if (lowerDesc.includes('analyze') || lowerDesc.includes('study')) return 'analysis';
    if (lowerDesc.includes('search') || lowerDesc.includes('find')) return 'web';
    if (lowerDesc.includes('remember') || lowerDesc.includes('store')) return 'memory';
    if (lowerDesc.includes('file') || lowerDesc.includes('read') || lowerDesc.includes('write')) return 'file';
    if (lowerDesc.includes('learn') || lowerDesc.includes('adapt')) return 'learning';

    return 'general';
  }

  async updateGoalStatus(goalId: string, status: GoalStatus, reason?: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const previousStatus = goal.status;
    goal.status = status;
    goal.lastUpdated = new Date();

    if (status === 'completed') {
      goal.completedAt = new Date();
      this.goalHistory.push({ ...goal });
    }

    if (status === 'failed' && reason) {
      goal.metadata = { ...goal.metadata, failureReason: reason };
    }

    const progress = this.goalProgress.get(goalId);
    if (progress) {
      this.updateProgressMetrics(progress, goal);
    }

    await this.persistGoal(goal);
    this.notifyGoalStatusChange(goal, previousStatus, status);
  }

  async addTaskToGoal(goalId: string, task: Partial<AgentTask>): Promise<AgentTask> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const newTask: AgentTask = {
      id: `${goalId}_task_${goal.tasks.length}`,
      type: task.type || 'general',
      description: task.description || '',
      priority: task.priority || goal.priority,
      status: 'pending',
      parameters: task.parameters || {},
      dependencies: task.dependencies || [],
      estimatedDuration: task.estimatedDuration || 60000,
      createdAt: new Date(),
      context: task.context || goal.context
    };

    goal.tasks.push(newTask);

    const progress = this.goalProgress.get(goalId);
    if (progress) {
      progress.totalTasks = goal.tasks.length;
    }

    await this.persistGoal(goal);
    return newTask;
  }

  async updateTaskStatus(goalId: string, taskId: string, status: string, result?: any): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const task = goal.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = status;
    task.lastUpdated = new Date();

    if (status === 'completed') {
      task.completedAt = new Date();
      task.result = result;
    }

    if (status === 'failed') {
      task.error = result?.error || 'Unknown error';
    }

    const progress = this.goalProgress.get(goalId);
    if (progress) {
      this.updateTaskProgress(progress, goal);
    }

    if (this.areAllTasksCompleted(goal)) {
      await this.updateGoalStatus(goalId, 'completed');
    }

    await this.persistGoal(goal);
  }

  private initializeGoalProgress(goal: AgentGoal): void {
    const progress: GoalProgress = {
      goalId: goal.id,
      completedTasks: 0,
      totalTasks: goal.tasks.length,
      successRate: 0,
      estimatedCompletion: new Date(Date.now() + (goal.estimatedDuration || 180000)),
      blockers: [],
      milestones: this.generateMilestones(goal)
    };

    this.goalProgress.set(goal.id, progress);
  }

  private generateMilestones(goal: AgentGoal): GoalMilestone[] {
    const milestones: GoalMilestone[] = [];
    const taskGroups = this.groupTasksByPhase(goal.tasks);

    taskGroups.forEach((tasks, index) => {
      milestones.push({
        id: `${goal.id}_milestone_${index}`,
        name: `Phase ${index + 1}`,
        description: `Complete ${tasks.length} tasks in this phase`,
        targetDate: new Date(Date.now() + (index + 1) * 60000),
        completed: false,
        dependencies: index > 0 ? [`${goal.id}_milestone_${index - 1}`] : []
      });
    });

    return milestones;
  }

  private groupTasksByPhase(tasks: AgentTask[]): AgentTask[][] {
    const phases: AgentTask[][] = [];
    const phaseSize = Math.ceil(tasks.length / 3);

    for (let i = 0; i < tasks.length; i += phaseSize) {
      phases.push(tasks.slice(i, i + phaseSize));
    }

    return phases;
  }

  private updateProgressMetrics(progress: GoalProgress, goal: AgentGoal): void {
    progress.completedTasks = goal.tasks.filter(t => t.status === 'completed').length;
    progress.totalTasks = goal.tasks.length;

    if (progress.totalTasks > 0) {
      progress.successRate = progress.completedTasks / progress.totalTasks;
    }

    const remainingTasks = progress.totalTasks - progress.completedTasks;
    const avgTaskDuration = 60000;
    progress.estimatedCompletion = new Date(Date.now() + (remainingTasks * avgTaskDuration));

    progress.blockers = goal.tasks
      .filter(t => t.status === 'failed' || t.status === 'blocked')
      .map(t => t.error || 'Task blocked')
      .filter(Boolean);

    this.updateMilestoneProgress(progress, goal);
  }

  private updateTaskProgress(progress: GoalProgress, goal: AgentGoal): void {
    this.updateProgressMetrics(progress, goal);
  }

  private updateMilestoneProgress(progress: GoalProgress, goal: AgentGoal): void {
    const taskGroups = this.groupTasksByPhase(goal.tasks);

    progress.milestones.forEach((milestone, index) => {
      if (index < taskGroups.length) {
        const phaseCompleted = taskGroups[index].every(t => t.status === 'completed');
        if (phaseCompleted && !milestone.completed) {
          milestone.completed = true;
          milestone.completedDate = new Date();
        }
      }
    });
  }

  private areAllTasksCompleted(goal: AgentGoal): boolean {
    return goal.tasks.length > 0 && goal.tasks.every(t => t.status === 'completed');
  }

  private notifyGoalStatusChange(goal: AgentGoal, previousStatus: GoalStatus, newStatus: GoalStatus): void {
    console.log(`Goal ${goal.id} status changed from ${previousStatus} to ${newStatus}`);
  }

  getActiveGoals(): AgentGoal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'active');
  }

  getGoalProgress(goalId: string): GoalProgress | undefined {
    return this.goalProgress.get(goalId);
  }

  getAllGoalsProgress(): GoalProgress[] {
    return Array.from(this.goalProgress.values());
  }

  getGoalsByPriority(priority: GoalPriority): AgentGoal[] {
    return Array.from(this.goals.values()).filter(g => g.priority === priority);
  }

  getGoalsByCategory(category: string): AgentGoal[] {
    return Array.from(this.goals.values()).filter(g => g.category === category);
  }

  getNextTasksToExecute(limit: number = 5): AgentTask[] {
    const activeTasks: AgentTask[] = [];

    for (const goal of this.goals.values()) {
      if (goal.status === 'active') {
        const pendingTasks = goal.tasks
          .filter(t => t.status === 'pending')
          .filter(t => this.areTaskDependenciesMet(t, goal));

        activeTasks.push(...pendingTasks);
      }
    }

    activeTasks.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    return activeTasks.slice(0, limit);
  }

  private areTaskDependenciesMet(task: AgentTask, goal: AgentGoal): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = goal.tasks.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  }

  getGoalMetrics(): GoalMetrics {
    const allGoals = Array.from(this.goals.values()).concat(this.goalHistory);

    return {
      totalGoals: allGoals.length,
      activeGoals: Array.from(this.goals.values()).filter(g => g.status === 'active').length,
      completedGoals: allGoals.filter(g => g.status === 'completed').length,
      averageCompletionTime: this.calculateAverageCompletionTime(),
      successRate: this.calculateSuccessRate(),
      topCategories: this.getTopCategories(),
      performanceTrends: this.getPerformanceTrends()
    };
  }

  private calculateAverageCompletionTime(): number {
    const completedGoals = this.goalHistory.filter(g => g.completedAt && g.createdAt);
    if (completedGoals.length === 0) return 0;

    const totalTime = completedGoals.reduce((sum, goal) => {
      return sum + (goal.completedAt!.getTime() - goal.createdAt.getTime());
    }, 0);

    return totalTime / completedGoals.length;
  }

  private calculateSuccessRate(): number {
    const completedGoals = this.goalHistory.filter(g => g.status === 'completed').length;
    const totalGoals = this.goalHistory.length;
    return totalGoals > 0 ? completedGoals / totalGoals : 0;
  }

  private getTopCategories(): Record<string, number> {
    const categories: Record<string, number> = {};

    Array.from(this.goals.values()).concat(this.goalHistory).forEach(goal => {
      const category = goal.category || 'uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    return categories;
  }

  private getPerformanceTrends(): Record<string, number[]> {
    return {
      completionRate: [0.8, 0.85, 0.9, 0.88, 0.92],
      averageTime: [180000, 175000, 170000, 168000, 165000],
      goalVolume: [5, 7, 8, 6, 9]
    };
  }

  private generateGoalId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async persistGoal(goal: AgentGoal): Promise<void> {
    return Promise.resolve();
  }

  private async loadPersistedGoals(): Promise<void> {
    return Promise.resolve();
  }

  async archiveCompletedGoals(): Promise<number> {
    const completedGoals = Array.from(this.goals.values()).filter(g => g.status === 'completed');

    completedGoals.forEach(goal => {
      this.goalHistory.push({ ...goal });
      this.goals.delete(goal.id);
      this.goalProgress.delete(goal.id);
    });

    return completedGoals.length;
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const deleted = this.goals.delete(goalId);
    this.goalProgress.delete(goalId);
    return deleted;
  }

  getAvailableTemplates(): GoalTemplate[] {
    return Array.from(this.goalTemplates.values());
  }
}

export const goalManager = new GoalManager();