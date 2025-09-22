import { AgentGoal, AgentTask, AgentContext, ToolExecutionResult } from '../types';

export interface ReflectionEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'failure' | 'optimization' | 'learning' | 'adaptation';
  context: ReflectionContext;
  insights: string[];
  actionItems: ActionItem[];
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export interface ReflectionContext {
  goalId?: string;
  taskId?: string;
  toolsUsed: string[];
  executionTime: number;
  userContext: AgentContext;
  outcome: 'success' | 'partial' | 'failure';
  metrics: Record<string, any>;
}

export interface ActionItem {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'performance' | 'capability' | 'behavior' | 'strategy';
  estimatedImpact: number;
  implemented: boolean;
  targetDate?: Date;
}

export interface LearningPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  successRate: number;
  contexts: string[];
  adaptations: string[];
  confidence: number;
}

export interface PerformanceInsight {
  category: string;
  trend: 'improving' | 'stable' | 'declining';
  value: number;
  previousValue: number;
  recommendations: string[];
  timeframe: string;
}

export class ReflectionEngine {
  private reflectionHistory: ReflectionEntry[] = [];
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private actionItems: Map<string, ActionItem> = new Map();
  private performanceMetrics: Map<string, any[]> = new Map();
  private adaptationStrategies: Map<string, any> = new Map();

  constructor() {
    this.initializeBasePatterns();
  }

  private initializeBasePatterns(): void {
    const basePatterns: LearningPattern[] = [
      {
        id: 'voice_interaction_optimization',
        name: 'Voice Interaction Optimization',
        description: 'Patterns in optimizing voice-based interactions',
        frequency: 0,
        successRate: 0,
        contexts: ['voice_requests', 'emotional_responses'],
        adaptations: [],
        confidence: 0.5
      },
      {
        id: 'cultural_adaptation_learning',
        name: 'Cultural Adaptation Learning',
        description: 'Learning patterns for cultural context adaptation',
        frequency: 0,
        successRate: 0,
        contexts: ['tagalog_interactions', 'cultural_references'],
        adaptations: [],
        confidence: 0.5
      },
      {
        id: 'tool_selection_improvement',
        name: 'Tool Selection Improvement',
        description: 'Patterns in effective tool selection and orchestration',
        frequency: 0,
        successRate: 0,
        contexts: ['multi_tool_tasks', 'complex_goals'],
        adaptations: [],
        confidence: 0.5
      },
      {
        id: 'goal_decomposition_refinement',
        name: 'Goal Decomposition Refinement',
        description: 'Learning better ways to break down complex goals',
        frequency: 0,
        successRate: 0,
        contexts: ['complex_goals', 'multi_step_tasks'],
        adaptations: [],
        confidence: 0.5
      }
    ];

    basePatterns.forEach(pattern => {
      this.learningPatterns.set(pattern.id, pattern);
    });
  }

  async reflectOnGoalCompletion(
    goal: AgentGoal,
    executionResults: ToolExecutionResult[],
    context: AgentContext
  ): Promise<ReflectionEntry> {
    const reflectionContext: ReflectionContext = {
      goalId: goal.id,
      toolsUsed: executionResults.map(r => r.toolName),
      executionTime: this.calculateTotalExecutionTime(executionResults),
      userContext: context,
      outcome: this.determineOutcome(goal, executionResults),
      metrics: this.extractMetrics(goal, executionResults)
    };

    const insights = await this.generateInsights(goal, executionResults, reflectionContext);
    const actionItems = await this.generateActionItems(insights, reflectionContext);

    const reflection: ReflectionEntry = {
      id: this.generateReflectionId(),
      timestamp: new Date(),
      type: reflectionContext.outcome === 'success' ? 'success' : 'failure',
      context: reflectionContext,
      insights,
      actionItems,
      confidence: this.calculateReflectionConfidence(insights, reflectionContext),
      impact: this.assessImpact(insights, actionItems)
    };

    this.reflectionHistory.push(reflection);
    await this.processReflectionLearning(reflection);
    await this.updateLearningPatterns(reflection);

    return reflection;
  }

  async reflectOnTaskExecution(
    task: AgentTask,
    result: ToolExecutionResult,
    context: AgentContext
  ): Promise<ReflectionEntry> {
    const reflectionContext: ReflectionContext = {
      taskId: task.id,
      toolsUsed: [result.toolName],
      executionTime: result.executionTime || 0,
      userContext: context,
      outcome: result.success ? 'success' : 'failure',
      metrics: {
        confidence: result.confidence,
        executionTime: result.executionTime,
        toolCategory: result.metadata?.category
      }
    };

    const insights = await this.generateTaskInsights(task, result, reflectionContext);
    const actionItems = await this.generateActionItems(insights, reflectionContext);

    const reflection: ReflectionEntry = {
      id: this.generateReflectionId(),
      timestamp: new Date(),
      type: result.success ? 'success' : 'failure',
      context: reflectionContext,
      insights,
      actionItems,
      confidence: this.calculateReflectionConfidence(insights, reflectionContext),
      impact: this.assessImpact(insights, actionItems)
    };

    this.reflectionHistory.push(reflection);
    await this.processReflectionLearning(reflection);

    return reflection;
  }

  async performPeriodicReflection(): Promise<ReflectionEntry> {
    const recentHistory = this.getRecentReflections(24 * 60 * 60 * 1000); // Last 24 hours
    const performanceMetrics = this.calculatePerformanceMetrics(recentHistory);
    const trends = this.identifyTrends(performanceMetrics);

    const reflectionContext: ReflectionContext = {
      toolsUsed: this.extractUniqueTools(recentHistory),
      executionTime: this.calculateAverageExecutionTime(recentHistory),
      userContext: this.aggregateUserContext(recentHistory),
      outcome: this.determineOverallOutcome(recentHistory),
      metrics: performanceMetrics
    };

    const insights = await this.generatePeriodicInsights(trends, performanceMetrics, recentHistory);
    const actionItems = await this.generateActionItems(insights, reflectionContext);

    const reflection: ReflectionEntry = {
      id: this.generateReflectionId(),
      timestamp: new Date(),
      type: 'optimization',
      context: reflectionContext,
      insights,
      actionItems,
      confidence: 0.8,
      impact: 'medium'
    };

    this.reflectionHistory.push(reflection);
    await this.processReflectionLearning(reflection);

    return reflection;
  }

  private async generateInsights(
    goal: AgentGoal,
    results: ToolExecutionResult[],
    context: ReflectionContext
  ): Promise<string[]> {
    const insights: string[] = [];

    // Goal completion analysis
    if (context.outcome === 'success') {
      insights.push(`Successfully completed goal "${goal.description}" using ${results.length} tools`);

      const fastExecutions = results.filter(r => (r.executionTime || 0) < 1000);
      if (fastExecutions.length > results.length * 0.7) {
        insights.push('Achieved efficient execution with most tools responding quickly');
      }

      const highConfidenceResults = results.filter(r => (r.confidence || 0) > 0.8);
      if (highConfidenceResults.length > results.length * 0.6) {
        insights.push('High confidence levels indicate good tool-task matching');
      }
    } else {
      insights.push(`Goal completion challenges identified in "${goal.description}"`);

      const failedTools = results.filter(r => !r.success);
      if (failedTools.length > 0) {
        insights.push(`Tool failures detected: ${failedTools.map(r => r.toolName).join(', ')}`);
      }
    }

    // Tool performance analysis
    const toolPerformance = this.analyzeToolPerformance(results);
    if (toolPerformance.bestPerformer) {
      insights.push(`Best performing tool: ${toolPerformance.bestPerformer} (${toolPerformance.bestScore}% success)`);
    }

    // Execution time analysis
    if (context.executionTime > (goal.estimatedDuration || 180000)) {
      insights.push('Execution took longer than estimated - consider optimization');
    } else {
      insights.push('Execution completed within expected timeframe');
    }

    // Context-specific insights
    if (context.userContext.userPreferences?.language === 'tagalog') {
      const tagalogTools = results.filter(r => r.toolName.includes('tagalog'));
      if (tagalogTools.length > 0) {
        insights.push('Successfully utilized Tagalog-specific capabilities');
      }
    }

    return insights;
  }

  private async generateTaskInsights(
    task: AgentTask,
    result: ToolExecutionResult,
    context: ReflectionContext
  ): Promise<string[]> {
    const insights: string[] = [];

    if (result.success) {
      insights.push(`Task "${task.description}" completed successfully with ${result.toolName}`);

      if ((result.confidence || 0) > 0.9) {
        insights.push('High confidence result indicates excellent tool-task alignment');
      }

      if ((result.executionTime || 0) < (task.estimatedDuration || 60000)) {
        insights.push('Task completed faster than estimated');
      }
    } else {
      insights.push(`Task "${task.description}" failed: ${result.error}`);

      if (result.critical) {
        insights.push('Critical task failure requires immediate attention');
      }
    }

    // Task type specific insights
    switch (task.type) {
      case 'voice':
        if (result.success) {
          insights.push('Voice interaction completed - monitor user satisfaction');
        }
        break;
      case 'analysis':
        if (result.metadata?.category === 'analysis') {
          insights.push('Analysis task utilized appropriate analytical tools');
        }
        break;
    }

    return insights;
  }

  private async generatePeriodicInsights(
    trends: Record<string, any>,
    metrics: Record<string, any>,
    history: ReflectionEntry[]
  ): Promise<string[]> {
    const insights: string[] = [];

    // Success rate trends
    if (trends.successRate && trends.successRate.trend === 'improving') {
      insights.push(`Success rate improving: ${(trends.successRate.current * 100).toFixed(1)}%`);
    } else if (trends.successRate && trends.successRate.trend === 'declining') {
      insights.push(`Success rate declining: ${(trends.successRate.current * 100).toFixed(1)}% - investigation needed`);
    }

    // Execution time trends
    if (trends.executionTime && trends.executionTime.trend === 'improving') {
      insights.push('Execution times improving - optimization strategies working');
    }

    // Tool usage patterns
    const toolUsage = this.analyzeToolUsagePatterns(history);
    insights.push(`Most utilized tool category: ${toolUsage.topCategory} (${toolUsage.usage}% of executions)`);

    // Learning progress
    const learningProgress = this.assessLearningProgress();
    if (learningProgress.improvingPatterns > 0) {
      insights.push(`${learningProgress.improvingPatterns} learning patterns showing improvement`);
    }

    return insights;
  }

  private async generateActionItems(
    insights: string[],
    context: ReflectionContext
  ): Promise<ActionItem[]> {
    const actionItems: ActionItem[] = [];

    insights.forEach(insight => {
      if (insight.includes('tool failures')) {
        actionItems.push({
          id: this.generateActionItemId(),
          description: 'Investigate and improve failing tool reliability',
          priority: 'high',
          category: 'performance',
          estimatedImpact: 0.8,
          implemented: false,
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }

      if (insight.includes('longer than estimated')) {
        actionItems.push({
          id: this.generateActionItemId(),
          description: 'Optimize execution time estimation algorithms',
          priority: 'medium',
          category: 'strategy',
          estimatedImpact: 0.6,
          implemented: false
        });
      }

      if (insight.includes('declining')) {
        actionItems.push({
          id: this.generateActionItemId(),
          description: 'Analyze root causes of performance decline',
          priority: 'high',
          category: 'performance',
          estimatedImpact: 0.9,
          implemented: false,
          targetDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
        });
      }

      if (insight.includes('High confidence')) {
        actionItems.push({
          id: this.generateActionItemId(),
          description: 'Document and replicate successful patterns',
          priority: 'low',
          category: 'capability',
          estimatedImpact: 0.4,
          implemented: false
        });
      }
    });

    return actionItems;
  }

  private async processReflectionLearning(reflection: ReflectionEntry): Promise<void> {
    // Store action items for implementation
    reflection.actionItems.forEach(item => {
      this.actionItems.set(item.id, item);
    });

    // Update performance metrics
    this.updatePerformanceHistory(reflection);

    // Identify new learning opportunities
    await this.identifyLearningOpportunities(reflection);

    // Update adaptation strategies
    await this.updateAdaptationStrategies(reflection);
  }

  private async updateLearningPatterns(reflection: ReflectionEntry): Promise<void> {
    for (const pattern of this.learningPatterns.values()) {
      const relevance = this.calculatePatternRelevance(pattern, reflection);

      if (relevance > 0.5) {
        pattern.frequency++;

        if (reflection.context.outcome === 'success') {
          pattern.successRate = (pattern.successRate + 1) / pattern.frequency;
        } else {
          pattern.successRate = pattern.successRate * (pattern.frequency - 1) / pattern.frequency;
        }

        // Update adaptations based on insights
        reflection.insights.forEach(insight => {
          if (!pattern.adaptations.includes(insight)) {
            pattern.adaptations.push(insight);
          }
        });

        pattern.confidence = Math.min(pattern.confidence + 0.1, 1.0);
      }
    }
  }

  private calculatePatternRelevance(pattern: LearningPattern, reflection: ReflectionEntry): number {
    let relevance = 0;

    // Check context matches
    const contextMatches = pattern.contexts.filter(context =>
      reflection.context.toolsUsed.some(tool => tool.includes(context)) ||
      reflection.insights.some(insight => insight.toLowerCase().includes(context))
    );

    relevance += contextMatches.length / pattern.contexts.length * 0.6;

    // Check tool alignment
    if (pattern.id.includes('voice') && reflection.context.toolsUsed.some(t => t.includes('voice'))) {
      relevance += 0.3;
    }

    if (pattern.id.includes('cultural') && reflection.context.toolsUsed.some(t => t.includes('tagalog'))) {
      relevance += 0.3;
    }

    return Math.min(relevance, 1.0);
  }

  private calculateTotalExecutionTime(results: ToolExecutionResult[]): number {
    return results.reduce((total, result) => total + (result.executionTime || 0), 0);
  }

  private determineOutcome(goal: AgentGoal, results: ToolExecutionResult[]): 'success' | 'partial' | 'failure' {
    const successfulResults = results.filter(r => r.success);

    if (successfulResults.length === results.length) {
      return 'success';
    } else if (successfulResults.length > 0) {
      return 'partial';
    } else {
      return 'failure';
    }
  }

  private extractMetrics(goal: AgentGoal, results: ToolExecutionResult[]): Record<string, any> {
    return {
      totalTools: results.length,
      successfulTools: results.filter(r => r.success).length,
      averageConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length,
      totalExecutionTime: this.calculateTotalExecutionTime(results),
      goalComplexity: goal.metadata?.complexity || 'medium',
      taskCount: goal.tasks.length
    };
  }

  private analyzeToolPerformance(results: ToolExecutionResult[]): any {
    const performance: Record<string, { success: number; total: number }> = {};

    results.forEach(result => {
      if (!performance[result.toolName]) {
        performance[result.toolName] = { success: 0, total: 0 };
      }
      performance[result.toolName].total++;
      if (result.success) {
        performance[result.toolName].success++;
      }
    });

    let bestPerformer = '';
    let bestScore = 0;

    Object.entries(performance).forEach(([tool, stats]) => {
      const score = (stats.success / stats.total) * 100;
      if (score > bestScore) {
        bestScore = score;
        bestPerformer = tool;
      }
    });

    return { bestPerformer, bestScore: bestScore.toFixed(1) };
  }

  private calculateReflectionConfidence(insights: string[], context: ReflectionContext): number {
    let confidence = 0.5;

    // More insights increase confidence
    confidence += Math.min(insights.length * 0.1, 0.3);

    // Successful outcomes increase confidence
    if (context.outcome === 'success') {
      confidence += 0.2;
    }

    // High tool confidence increases reflection confidence
    if (context.metrics.averageConfidence > 0.8) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private assessImpact(insights: string[], actionItems: ActionItem[]): 'low' | 'medium' | 'high' {
    const highImpactItems = actionItems.filter(item => item.estimatedImpact > 0.7);
    const criticalInsights = insights.filter(insight =>
      insight.includes('failure') || insight.includes('critical') || insight.includes('declining')
    );

    if (highImpactItems.length > 0 || criticalInsights.length > 0) {
      return 'high';
    }

    if (actionItems.length > 2 || insights.length > 3) {
      return 'medium';
    }

    return 'low';
  }

  getRecentReflections(timeWindow: number): ReflectionEntry[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.reflectionHistory.filter(r => r.timestamp > cutoff);
  }

  getLearningPatterns(): LearningPattern[] {
    return Array.from(this.learningPatterns.values());
  }

  getPendingActionItems(): ActionItem[] {
    return Array.from(this.actionItems.values()).filter(item => !item.implemented);
  }

  getPerformanceInsights(): PerformanceInsight[] {
    const recentMetrics = this.getRecentPerformanceMetrics();
    return this.generatePerformanceInsights(recentMetrics);
  }

  private getRecentPerformanceMetrics(): Record<string, any> {
    const recent = this.getRecentReflections(24 * 60 * 60 * 1000);
    return this.calculatePerformanceMetrics(recent);
  }

  private calculatePerformanceMetrics(reflections: ReflectionEntry[]): Record<string, any> {
    if (reflections.length === 0) {
      return {};
    }

    const successRate = reflections.filter(r => r.context.outcome === 'success').length / reflections.length;
    const avgExecutionTime = reflections.reduce((sum, r) => sum + r.context.executionTime, 0) / reflections.length;
    const avgConfidence = reflections.reduce((sum, r) => sum + r.confidence, 0) / reflections.length;

    return {
      successRate,
      avgExecutionTime,
      avgConfidence,
      totalReflections: reflections.length,
      highImpactReflections: reflections.filter(r => r.impact === 'high').length
    };
  }

  private identifyTrends(current: Record<string, any>): Record<string, any> {
    const previous = this.getPreviousMetrics();
    const trends: Record<string, any> = {};

    Object.keys(current).forEach(key => {
      if (previous[key] !== undefined) {
        const change = current[key] - previous[key];
        trends[key] = {
          current: current[key],
          previous: previous[key],
          change,
          trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
        };
      }
    });

    return trends;
  }

  private getPreviousMetrics(): Record<string, any> {
    const previousPeriod = this.reflectionHistory.filter(r =>
      r.timestamp > new Date(Date.now() - 48 * 60 * 60 * 1000) &&
      r.timestamp <= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return this.calculatePerformanceMetrics(previousPeriod);
  }

  private extractUniqueTools(reflections: ReflectionEntry[]): string[] {
    const tools = new Set<string>();
    reflections.forEach(r => r.context.toolsUsed.forEach(tool => tools.add(tool)));
    return Array.from(tools);
  }

  private calculateAverageExecutionTime(reflections: ReflectionEntry[]): number {
    if (reflections.length === 0) return 0;
    return reflections.reduce((sum, r) => sum + r.context.executionTime, 0) / reflections.length;
  }

  private aggregateUserContext(reflections: ReflectionEntry[]): AgentContext {
    // Aggregate user context from recent reflections
    return reflections.length > 0 ? reflections[0].context.userContext : {
      userId: 'default',
      sessionId: 'default'
    };
  }

  private determineOverallOutcome(reflections: ReflectionEntry[]): 'success' | 'partial' | 'failure' {
    const successes = reflections.filter(r => r.context.outcome === 'success').length;
    const total = reflections.length;

    if (successes / total > 0.8) return 'success';
    if (successes / total > 0.3) return 'partial';
    return 'failure';
  }

  private analyzeToolUsagePatterns(reflections: ReflectionEntry[]): any {
    const toolCategories: Record<string, number> = {};
    let totalUsage = 0;

    reflections.forEach(r => {
      r.context.toolsUsed.forEach(tool => {
        const category = this.getToolCategory(tool);
        toolCategories[category] = (toolCategories[category] || 0) + 1;
        totalUsage++;
      });
    });

    const topCategory = Object.entries(toolCategories)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      topCategory: topCategory ? topCategory[0] : 'unknown',
      usage: topCategory ? ((topCategory[1] / totalUsage) * 100).toFixed(1) : '0'
    };
  }

  private getToolCategory(toolName: string): string {
    if (toolName.includes('voice')) return 'voice';
    if (toolName.includes('tagalog') || toolName.includes('analysis')) return 'analysis';
    if (toolName.includes('location')) return 'system';
    if (toolName.includes('conversation')) return 'communication';
    if (toolName.includes('memory')) return 'memory';
    if (toolName.includes('web')) return 'web';
    if (toolName.includes('file')) return 'file';
    return 'general';
  }

  private assessLearningProgress(): any {
    const patterns = Array.from(this.learningPatterns.values());
    const improvingPatterns = patterns.filter(p => p.successRate > 0.7 && p.frequency > 5);

    return {
      totalPatterns: patterns.length,
      improvingPatterns: improvingPatterns.length,
      averageConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    };
  }

  private updatePerformanceHistory(reflection: ReflectionEntry): void {
    const key = 'overall_performance';
    const history = this.performanceMetrics.get(key) || [];

    history.push({
      timestamp: reflection.timestamp,
      outcome: reflection.context.outcome,
      confidence: reflection.confidence,
      executionTime: reflection.context.executionTime,
      impact: reflection.impact
    });

    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.performanceMetrics.set(key, history);
  }

  private async identifyLearningOpportunities(reflection: ReflectionEntry): Promise<void> {
    // Identify patterns that could be learned from this reflection
    const opportunities: string[] = [];

    if (reflection.context.outcome === 'failure') {
      opportunities.push('failure_pattern_analysis');
    }

    if (reflection.context.executionTime > 10000) {
      opportunities.push('performance_optimization');
    }

    if (reflection.insights.some(i => i.includes('cultural') || i.includes('tagalog'))) {
      opportunities.push('cultural_adaptation_learning');
    }

    // Process opportunities (placeholder for future implementation)
  }

  private async updateAdaptationStrategies(reflection: ReflectionEntry): Promise<void> {
    // Update adaptation strategies based on reflection insights
    reflection.actionItems.forEach(item => {
      if (item.category === 'strategy') {
        this.adaptationStrategies.set(item.id, {
          description: item.description,
          priority: item.priority,
          impact: item.estimatedImpact,
          context: reflection.context
        });
      }
    });
  }

  private generatePerformanceInsights(metrics: Record<string, any>): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Success rate insight
    insights.push({
      category: 'Success Rate',
      trend: 'stable',
      value: metrics.successRate || 0,
      previousValue: 0,
      recommendations: ['Monitor task completion patterns'],
      timeframe: '24h'
    });

    // Execution time insight
    insights.push({
      category: 'Execution Time',
      trend: 'stable',
      value: metrics.avgExecutionTime || 0,
      previousValue: 0,
      recommendations: ['Optimize tool selection'],
      timeframe: '24h'
    });

    return insights;
  }

  private generateReflectionId(): string {
    return `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionItemId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async implementActionItem(itemId: string): Promise<boolean> {
    const item = this.actionItems.get(itemId);
    if (!item) return false;

    item.implemented = true;
    item.targetDate = new Date();

    return true;
  }

  async applyImprovement(improvement: any): Promise<void> {
    try {
      console.log('📈 Applying improvement:', improvement);

      // Create action item for this improvement
      const actionItemId = `improvement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const actionItem: ActionItem = {
        id: actionItemId,
        description: improvement.description || `Apply improvement: ${improvement.type}`,
        priority: improvement.priority || 'medium',
        category: 'performance',
        estimatedImpact: 5,
        implemented: false
      };

      this.actionItems.set(actionItemId, actionItem);

      // Immediately try to implement if it's a high priority improvement
      if (improvement.priority === 'high') {
        await this.implementActionItem(actionItemId);
      }
    } catch (error) {
      console.error('❌ Failed to apply improvement:', error);
    }
  }

  getReflectionSummary(): Record<string, any> {
    const recent = this.getRecentReflections(24 * 60 * 60 * 1000);

    return {
      totalReflections: this.reflectionHistory.length,
      recentReflections: recent.length,
      learningPatterns: this.learningPatterns.size,
      pendingActionItems: this.getPendingActionItems().length,
      averageConfidence: recent.reduce((sum, r) => sum + r.confidence, 0) / (recent.length || 1),
      performanceMetrics: this.getRecentPerformanceMetrics()
    };
  }
}

export const reflectionEngine = new ReflectionEngine();