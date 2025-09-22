import { AgentTask, AgentContext, ToolExecutionResult } from '../types';

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: 'voice' | 'memory' | 'web' | 'file' | 'analysis' | 'communication' | 'system';
  complexity: 'low' | 'medium' | 'high';
  latency: 'fast' | 'medium' | 'slow';
  reliability: number;
  dependencies?: string[];
}

export interface ToolChain {
  id: string;
  tools: Tool[];
  estimatedDuration: number;
  successProbability: number;
  fallbackChains?: ToolChain[];
}

export interface ToolSelection {
  tool: Tool;
  confidence: number;
  reasoning: string;
  alternativesConsidered: Tool[];
}

export interface ExecutionStrategy {
  type: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  tools: Tool[];
  conditions?: Record<string, any>;
  optimizations: string[];
}

export class ToolOrchestrator {
  private availableTools: Map<string, Tool> = new Map();
  private executionHistory: ToolExecutionResult[] = [];
  private performanceMetrics: Map<string, any> = new Map();
  private contextualPreferences: Map<string, any> = new Map();

  constructor() {
    this.initializeTools();
  }

  private initializeTools(): void {
    const coreTools: Tool[] = [
      {
        name: 'enhanced_voice_service',
        description: 'Advanced voice synthesis with emotional intelligence and cloning',
        parameters: { text: 'string', emotions: 'array', priority: 'string' },
        category: 'voice',
        complexity: 'high',
        latency: 'medium',
        reliability: 0.92
      },
      {
        name: 'tagalog_speech_analysis',
        description: 'Analyze and adapt to Tagalog speech patterns and cultural context',
        parameters: { audioData: 'buffer', userId: 'string', context: 'object' },
        category: 'analysis',
        complexity: 'high',
        latency: 'medium',
        reliability: 0.88
      },
      {
        name: 'location_service',
        description: 'Get and persist user location with intelligent caching',
        parameters: { userId: 'string', forceRefresh: 'boolean' },
        category: 'system',
        complexity: 'medium',
        latency: 'fast',
        reliability: 0.95
      },
      {
        name: 'conversation_engine',
        description: 'Process and generate contextual conversations',
        parameters: { message: 'string', context: 'object', userId: 'string' },
        category: 'communication',
        complexity: 'high',
        latency: 'medium',
        reliability: 0.90
      },
      {
        name: 'memory_service',
        description: 'Store and retrieve contextual memories and patterns',
        parameters: { userId: 'string', data: 'object', type: 'string' },
        category: 'memory',
        complexity: 'medium',
        latency: 'fast',
        reliability: 0.94
      },
      {
        name: 'web_search',
        description: 'Search and analyze web content for information gathering',
        parameters: { query: 'string', filters: 'object', depth: 'number' },
        category: 'web',
        complexity: 'medium',
        latency: 'slow',
        reliability: 0.85
      },
      {
        name: 'file_manager',
        description: 'Read, write, and manage files with intelligent organization',
        parameters: { path: 'string', operation: 'string', data: 'any' },
        category: 'file',
        complexity: 'low',
        latency: 'fast',
        reliability: 0.98
      }
    ];

    coreTools.forEach(tool => {
      this.availableTools.set(tool.name, tool);
    });
  }

  async selectOptimalTools(task: AgentTask, context: AgentContext): Promise<ToolSelection[]> {
    const candidateTools = this.identifyCandidateTools(task);
    const rankedTools = await this.rankToolsByFitness(candidateTools, task, context);
    const optimizedSelection = this.optimizeToolSelection(rankedTools, task);

    return optimizedSelection.map(tool => ({
      tool,
      confidence: this.calculateConfidence(tool, task, context),
      reasoning: this.generateSelectionReasoning(tool, task),
      alternativesConsidered: rankedTools.filter(t => t.name !== tool.name).slice(0, 3)
    }));
  }

  async createExecutionStrategy(tools: Tool[], task: AgentTask, context: AgentContext): Promise<ExecutionStrategy> {
    const dependencies = this.analyzeDependencies(tools);
    const parallelGroups = this.identifyParallelizableGroups(tools, dependencies);
    const conditionalBranches = this.identifyConditionalBranches(tools, task);

    let strategyType: ExecutionStrategy['type'] = 'sequential';
    if (parallelGroups.length > 1) {
      strategyType = conditionalBranches.length > 0 ? 'hybrid' : 'parallel';
    } else if (conditionalBranches.length > 0) {
      strategyType = 'conditional';
    }

    const optimizations = this.generateOptimizations(tools, task, context);

    return {
      type: strategyType,
      tools,
      conditions: conditionalBranches.length > 0 ? this.buildConditions(conditionalBranches) : undefined,
      optimizations
    };
  }

  async executeToolChain(strategy: ExecutionStrategy, task: AgentTask, context: AgentContext): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];
    const startTime = Date.now();

    try {
      switch (strategy.type) {
        case 'sequential':
          for (const tool of strategy.tools) {
            const result = await this.executeTool(tool, task, context);
            results.push(result);
            if (!result.success && result.critical) {
              break;
            }
          }
          break;

        case 'parallel':
          const parallelResults = await Promise.allSettled(
            strategy.tools.map(tool => this.executeTool(tool, task, context))
          );
          results.push(...parallelResults.map(r =>
            r.status === 'fulfilled' ? r.value : this.createErrorResult(r.reason)
          ));
          break;

        case 'conditional':
          results.push(...await this.executeConditionalStrategy(strategy, task, context));
          break;

        case 'hybrid':
          results.push(...await this.executeHybridStrategy(strategy, task, context));
          break;
      }

      this.updatePerformanceMetrics(strategy, results, Date.now() - startTime);
      return results;

    } catch (error) {
      const errorResult = this.createErrorResult(error);
      results.push(errorResult);
      return results;
    }
  }

  private identifyCandidateTools(task: AgentTask): Tool[] {
    const candidates: Tool[] = [];
    const taskKeywords = this.extractTaskKeywords(task);

    for (const tool of this.availableTools.values()) {
      const relevanceScore = this.calculateRelevanceScore(tool, taskKeywords, task);
      if (relevanceScore > 0.3) {
        candidates.push(tool);
      }
    }

    return candidates.sort((a, b) =>
      this.calculateRelevanceScore(b, taskKeywords, task) -
      this.calculateRelevanceScore(a, taskKeywords, task)
    );
  }

  private async rankToolsByFitness(tools: Tool[], task: AgentTask, context: AgentContext): Promise<Tool[]> {
    const rankedTools = tools.map(tool => ({
      tool,
      fitness: this.calculateFitnessScore(tool, task, context)
    }));

    rankedTools.sort((a, b) => b.fitness - a.fitness);
    return rankedTools.map(r => r.tool);
  }

  private optimizeToolSelection(rankedTools: Tool[], task: AgentTask): Tool[] {
    const optimized: Tool[] = [];
    const usedCategories = new Set<string>();
    const maxComplexity = this.getMaxComplexityForTask(task);
    let totalComplexity = 0;

    for (const tool of rankedTools) {
      const toolComplexity = this.getComplexityScore(tool);

      if (totalComplexity + toolComplexity <= maxComplexity &&
          this.shouldIncludeTool(tool, usedCategories, task)) {
        optimized.push(tool);
        usedCategories.add(tool.category);
        totalComplexity += toolComplexity;
      }

      if (optimized.length >= 5) break;
    }

    return optimized;
  }

  private calculateConfidence(tool: Tool, task: AgentTask, context: AgentContext): number {
    const relevanceScore = this.calculateRelevanceScore(tool, this.extractTaskKeywords(task), task);
    const reliabilityScore = tool.reliability;
    const contextScore = this.calculateContextualFit(tool, context);
    const historyScore = this.getHistoricalPerformance(tool.name);

    return (relevanceScore * 0.3 + reliabilityScore * 0.3 + contextScore * 0.2 + historyScore * 0.2);
  }

  private generateSelectionReasoning(tool: Tool, task: AgentTask): string {
    const reasons: string[] = [];

    if (tool.reliability > 0.9) {
      reasons.push('high reliability track record');
    }

    if (tool.complexity === 'low' && task.priority === 'high') {
      reasons.push('low complexity ensures fast execution');
    }

    if (tool.category === 'voice' && task.description.includes('speak')) {
      reasons.push('specialized voice capabilities match task requirements');
    }

    if (tool.latency === 'fast') {
      reasons.push('optimized for quick response');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'general compatibility with task requirements';
  }

  private async executeTool(tool: Tool, task: AgentTask, context: AgentContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (tool.name) {
        case 'enhanced_voice_service':
          result = await this.executeVoiceService(tool, task, context);
          break;
        case 'tagalog_speech_analysis':
          result = await this.executeTagalogAnalysis(tool, task, context);
          break;
        case 'location_service':
          result = await this.executeLocationService(tool, task, context);
          break;
        case 'conversation_engine':
          result = await this.executeConversationEngine(tool, task, context);
          break;
        case 'memory_service':
          result = await this.executeMemoryService(tool, task, context);
          break;
        case 'web_search':
          result = await this.executeWebSearch(tool, task, context);
          break;
        case 'file_manager':
          result = await this.executeFileManager(tool, task, context);
          break;
        default:
          throw new Error(`Unknown tool: ${tool.name}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        toolName: tool.name,
        success: true,
        result,
        executionTime,
        confidence: this.calculateConfidence(tool, task, context),
        metadata: {
          category: tool.category,
          complexity: tool.complexity,
          latency: tool.latency
        }
      };

    } catch (error) {
      return {
        toolName: tool.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        confidence: 0,
        critical: tool.category === 'system' || task.priority === 'critical'
      };
    }
  }

  private async executeVoiceService(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    const { enhancedVoiceService } = await import('../../../lib/services/enhancedVoiceService');
    return enhancedVoiceService.speak(task.parameters.text || task.description, {
      priority: task.priority === 'critical' ? 'high' : 'normal',
      emotions: task.parameters.emotions || ['neutral']
    });
  }

  private async executeTagalogAnalysis(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    const { TagalogSpeechAnalysisService } = await import('../../../lib/services/tagalogSpeechAnalysisService');
    const service = new TagalogSpeechAnalysisService();
    return service.startListening(context.userId);
  }

  private async executeLocationService(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    const { locationService } = await import('../../../lib/services/locationService');
    return locationService.getCurrentLocation();
  }

  private async executeConversationEngine(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    const { conversationEngine } = await import('../../../lib/services/conversationEngine');
    return conversationEngine.processMessage(
      task.parameters.message || task.description,
      context
    );
  }

  private async executeMemoryService(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    return {
      stored: true,
      memoryId: `mem_${Date.now()}`,
      data: task.parameters.data
    };
  }

  private async executeWebSearch(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    return {
      results: [],
      query: task.parameters.query,
      timestamp: new Date().toISOString()
    };
  }

  private async executeFileManager(tool: Tool, task: AgentTask, context: AgentContext): Promise<any> {
    return {
      operation: task.parameters.operation,
      path: task.parameters.path,
      success: true
    };
  }

  private async executeConditionalStrategy(strategy: ExecutionStrategy, task: AgentTask, context: AgentContext): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];

    for (const tool of strategy.tools) {
      if (this.evaluateConditions(strategy.conditions || {}, context, results)) {
        const result = await this.executeTool(tool, task, context);
        results.push(result);

        if (!result.success && result.critical) {
          break;
        }
      }
    }

    return results;
  }

  private async executeHybridStrategy(strategy: ExecutionStrategy, task: AgentTask, context: AgentContext): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];
    const parallelGroups = this.identifyParallelizableGroups(strategy.tools, this.analyzeDependencies(strategy.tools));

    for (const group of parallelGroups) {
      if (group.length === 1) {
        const result = await this.executeTool(group[0], task, context);
        results.push(result);
      } else {
        const parallelResults = await Promise.allSettled(
          group.map(tool => this.executeTool(tool, task, context))
        );
        results.push(...parallelResults.map(r =>
          r.status === 'fulfilled' ? r.value : this.createErrorResult(r.reason)
        ));
      }
    }

    return results;
  }

  private extractTaskKeywords(task: AgentTask): string[] {
    const text = `${task.description} ${task.type} ${Object.values(task.parameters || {}).join(' ')}`;
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  }

  private calculateRelevanceScore(tool: Tool, keywords: string[], task: AgentTask): number {
    const toolText = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
    const matchingKeywords = keywords.filter(keyword => toolText.includes(keyword));

    let score = matchingKeywords.length / keywords.length;

    if (task.type === 'voice' && tool.category === 'voice') score += 0.3;
    if (task.type === 'analysis' && tool.category === 'analysis') score += 0.3;
    if (task.priority === 'critical' && tool.reliability > 0.9) score += 0.2;

    return Math.min(score, 1.0);
  }

  private calculateFitnessScore(tool: Tool, task: AgentTask, context: AgentContext): number {
    const relevance = this.calculateRelevanceScore(tool, this.extractTaskKeywords(task), task);
    const reliability = tool.reliability;
    const performance = this.getHistoricalPerformance(tool.name);
    const contextFit = this.calculateContextualFit(tool, context);

    return (relevance * 0.4 + reliability * 0.3 + performance * 0.2 + contextFit * 0.1);
  }

  private calculateContextualFit(tool: Tool, context: AgentContext): number {
    let score = 0.5;

    if (context.userPreferences?.language === 'tagalog' && tool.name === 'tagalog_speech_analysis') {
      score += 0.4;
    }

    if (context.environment === 'mobile' && tool.latency === 'fast') {
      score += 0.2;
    }

    if (context.connectionSpeed === 'slow' && tool.category !== 'web') {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private getHistoricalPerformance(toolName: string): number {
    const metrics = this.performanceMetrics.get(toolName);
    if (!metrics) return 0.7;

    const successRate = metrics.successes / (metrics.successes + metrics.failures);
    const avgResponseTime = metrics.totalTime / metrics.executions;

    return (successRate * 0.7 + (1 - Math.min(avgResponseTime / 1000, 1)) * 0.3);
  }

  private getMaxComplexityForTask(task: AgentTask): number {
    switch (task.priority) {
      case 'critical': return 15;
      case 'high': return 12;
      case 'medium': return 8;
      case 'low': return 5;
      default: return 8;
    }
  }

  private getComplexityScore(tool: Tool): number {
    switch (tool.complexity) {
      case 'low': return 1;
      case 'medium': return 3;
      case 'high': return 5;
      default: return 3;
    }
  }

  private shouldIncludeTool(tool: Tool, usedCategories: Set<string>, task: AgentTask): boolean {
    if (usedCategories.has(tool.category) && tool.category !== 'system') {
      return false;
    }

    if (task.type === 'voice' && tool.category !== 'voice' && tool.category !== 'system') {
      return false;
    }

    return true;
  }

  private analyzeDependencies(tools: Tool[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    tools.forEach(tool => {
      if (tool.dependencies) {
        dependencies.set(tool.name, tool.dependencies);
      } else {
        dependencies.set(tool.name, []);
      }
    });

    return dependencies;
  }

  private identifyParallelizableGroups(tools: Tool[], dependencies: Map<string, string[]>): Tool[][] {
    const groups: Tool[][] = [];
    const processed = new Set<string>();

    for (const tool of tools) {
      if (processed.has(tool.name)) continue;

      const deps = dependencies.get(tool.name) || [];
      const canParallelize = deps.every(dep => !tools.find(t => t.name === dep));

      if (canParallelize) {
        const parallelGroup = tools.filter(t => {
          const tDeps = dependencies.get(t.name) || [];
          return !processed.has(t.name) && tDeps.every(dep => !tools.find(tool => tool.name === dep));
        });

        groups.push(parallelGroup);
        parallelGroup.forEach(t => processed.add(t.name));
      } else {
        groups.push([tool]);
        processed.add(tool.name);
      }
    }

    return groups;
  }

  private identifyConditionalBranches(tools: Tool[], task: AgentTask): any[] {
    const branches: any[] = [];

    if (tools.some(t => t.category === 'voice') && tools.some(t => t.category === 'analysis')) {
      branches.push({
        condition: 'voice_analysis_needed',
        tools: tools.filter(t => t.category === 'voice' || t.category === 'analysis')
      });
    }

    return branches;
  }

  private buildConditions(branches: any[]): Record<string, any> {
    const conditions: Record<string, any> = {};

    branches.forEach(branch => {
      conditions[branch.condition] = {
        type: 'runtime',
        evaluator: branch.condition
      };
    });

    return conditions;
  }

  private generateOptimizations(tools: Tool[], task: AgentTask, context: AgentContext): string[] {
    const optimizations: string[] = [];

    if (tools.every(t => t.latency === 'fast')) {
      optimizations.push('parallel_execution');
    }

    if (tools.some(t => t.category === 'memory')) {
      optimizations.push('memory_caching');
    }

    if (context.connectionSpeed === 'slow') {
      optimizations.push('compression');
    }

    if (task.priority === 'critical') {
      optimizations.push('priority_queue');
    }

    return optimizations;
  }

  private evaluateConditions(conditions: Record<string, any>, context: AgentContext, results: ToolExecutionResult[]): boolean {
    return Object.keys(conditions).every(condition => {
      switch (condition) {
        case 'voice_analysis_needed':
          return context.userPreferences?.enableVoiceAnalysis !== false;
        default:
          return true;
      }
    });
  }

  private createErrorResult(error: any): ToolExecutionResult {
    return {
      toolName: 'unknown',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: 0,
      confidence: 0,
      critical: true
    };
  }

  private updatePerformanceMetrics(strategy: ExecutionStrategy, results: ToolExecutionResult[], totalTime: number): void {
    results.forEach(result => {
      const current = this.performanceMetrics.get(result.toolName) || {
        successes: 0,
        failures: 0,
        totalTime: 0,
        executions: 0
      };

      if (result.success) {
        current.successes++;
      } else {
        current.failures++;
      }

      current.totalTime += result.executionTime || 0;
      current.executions++;

      this.performanceMetrics.set(result.toolName, current);
    });
  }

  getPerformanceInsights(): Record<string, any> {
    const insights: Record<string, any> = {};

    this.performanceMetrics.forEach((metrics, toolName) => {
      const successRate = metrics.successes / (metrics.successes + metrics.failures);
      const avgTime = metrics.totalTime / metrics.executions;

      insights[toolName] = {
        successRate: Math.round(successRate * 100),
        averageExecutionTime: Math.round(avgTime),
        totalExecutions: metrics.executions,
        reliability: successRate > 0.9 ? 'high' : successRate > 0.7 ? 'medium' : 'low'
      };
    });

    return insights;
  }
}

export const toolOrchestrator = new ToolOrchestrator();