/**
 * Proactive Intelligence Engine - AI That Anticipates and Assists
 * Implements predictive assistance and workflow optimization
 * Part of the Gawin AI Autonomous Intelligence Architecture
 */

import { ChatMessage } from '../types';
import { advancedMemoryService } from './advancedMemoryService';

interface ProactiveSuggestion {
  id: string;
  type: 'next_step' | 'resource' | 'workflow' | 'reminder' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
  expires?: Date;
}

interface WorkflowPattern {
  id: string;
  name: string;
  steps: WorkflowStep[];
  frequency: number;
  successRate: number;
  averageDuration: number;
  lastUsed: Date;
  improvements: string[];
}

interface WorkflowStep {
  order: number;
  action: string;
  description: string;
  averageTime: number;
  successRate: number;
  commonIssues: string[];
  optimizations: string[];
}

interface PredictiveContext {
  currentGoal: string;
  timeContext: TimeContext;
  userState: UserState;
  environmentContext: EnvironmentContext;
  taskHistory: TaskHistoryItem[];
}

interface TimeContext {
  hour: number;
  dayOfWeek: number;
  isWorkingHours: boolean;
  timeZone: string;
  season: string;
}

interface UserState {
  energyLevel: 'low' | 'medium' | 'high';
  focusLevel: 'distracted' | 'normal' | 'focused';
  mood: 'frustrated' | 'neutral' | 'motivated' | 'excited';
  workload: 'light' | 'normal' | 'heavy' | 'overwhelming';
}

interface EnvironmentContext {
  location: string;
  weather: string;
  networkQuality: 'poor' | 'good' | 'excellent';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface TaskHistoryItem {
  task: string;
  startTime: Date;
  duration: number;
  outcome: 'completed' | 'abandoned' | 'paused';
  satisfaction: number;
}

class ProactiveIntelligenceEngine {
  private activeSuggestions: Map<string, ProactiveSuggestion> = new Map();
  private workflowPatterns: Map<string, WorkflowPattern> = new Map();
  private userGoals: Map<string, string[]> = new Map();
  private contextHistory: PredictiveContext[] = [];
  
  // Main proactive analysis method
  async analyzeAndSuggest(
    currentMessage: ChatMessage,
    conversationHistory: ChatMessage[],
    userContext?: Partial<PredictiveContext>
  ): Promise<ProactiveSuggestion[]> {
    
    const context = await this.buildPredictiveContext(currentMessage, conversationHistory, userContext);
    const suggestions: ProactiveSuggestion[] = [];
    
    // Generate different types of suggestions
    suggestions.push(...this.generateNextStepSuggestions(context));
    suggestions.push(...this.generateResourceSuggestions(context));
    suggestions.push(...this.generateWorkflowSuggestions(context));
    suggestions.push(...this.generateReminderSuggestions(context));
    suggestions.push(...this.generateOptimizationSuggestions(context));
    
    // Score and rank suggestions
    const rankedSuggestions = this.rankSuggestions(suggestions, context);
    
    // Store active suggestions
    rankedSuggestions.forEach(suggestion => {
      this.activeSuggestions.set(suggestion.id, suggestion);
    });
    
    return rankedSuggestions.slice(0, 5); // Return top 5 suggestions
  }
  
  // Generate next step suggestions based on conversation flow
  private generateNextStepSuggestions(context: PredictiveContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Analyze current goal and suggest logical next steps
    if (context.currentGoal.includes('coding') || context.currentGoal.includes('programming')) {
      suggestions.push({
        id: `next_step_${Date.now()}_1`,
        type: 'next_step',
        priority: 'high',
        title: 'Test Your Code',
        description: 'Based on your coding discussion, shall we test the implementation?',
        action: 'run_tests',
        confidence: 0.8,
        reasoning: 'User has been discussing code implementation',
        timestamp: new Date()
      });
      
      if (context.userState.focusLevel === 'focused') {
        suggestions.push({
          id: `next_step_${Date.now()}_2`,
          type: 'next_step',
          priority: 'medium',
          title: 'Optimize Performance',
          description: 'While you\'re focused, want to optimize the code performance?',
          action: 'optimize_code',
          confidence: 0.7,
          reasoning: 'User is in focused state, good time for optimization',
          timestamp: new Date()
        });
      }
    }
    
    if (context.currentGoal.includes('design') || context.currentGoal.includes('UI')) {
      suggestions.push({
        id: `next_step_${Date.now()}_3`,
        type: 'next_step',
        priority: 'medium',
        title: 'Accessibility Check',
        description: 'Let\'s ensure your design is accessible to all users',
        action: 'accessibility_audit',
        confidence: 0.9,
        reasoning: 'Design discussions should include accessibility considerations',
        timestamp: new Date()
      });
    }
    
    return suggestions;
  }
  
  // Generate resource suggestions
  private generateResourceSuggestions(context: PredictiveContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Time-based resource suggestions
    if (context.timeContext.hour < 12 && context.userState.energyLevel === 'high') {
      suggestions.push({
        id: `resource_${Date.now()}_1`,
        type: 'resource',
        priority: 'low',
        title: 'Morning Learning Resources',
        description: 'Perfect time for learning new concepts. Want some advanced tutorials?',
        action: 'suggest_learning',
        confidence: 0.6,
        reasoning: 'High energy morning hours are optimal for learning',
        timestamp: new Date()
      });
    }
    
    // Context-based resource suggestions
    if (context.currentGoal.includes('database')) {
      suggestions.push({
        id: `resource_${Date.now()}_2`,
        type: 'resource',
        priority: 'medium',
        title: 'Database Best Practices',
        description: 'I have some excellent database optimization resources',
        action: 'share_database_resources',
        confidence: 0.8,
        reasoning: 'User is working with databases',
        timestamp: new Date()
      });
    }
    
    return suggestions;
  }
  
  // Generate workflow optimization suggestions
  private generateWorkflowSuggestions(context: PredictiveContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Analyze task patterns and suggest improvements
    const recentTasks = context.taskHistory.slice(-5);
    const repetitiveTasks = this.findRepetitiveTasks(recentTasks);
    
    if (repetitiveTasks.length > 0) {
      suggestions.push({
        id: `workflow_${Date.now()}_1`,
        type: 'workflow',
        priority: 'medium',
        title: 'Automate Repetitive Tasks',
        description: `I noticed you often ${repetitiveTasks[0]}. Want to create a workflow?`,
        action: 'create_workflow',
        confidence: 0.7,
        reasoning: 'Detected repetitive task pattern',
        timestamp: new Date()
      });
    }
    
    // Suggest workflow improvements based on success rates
    const inefficientPatterns = Array.from(this.workflowPatterns.values())
      .filter(pattern => pattern.successRate < 0.7);
    
    if (inefficientPatterns.length > 0) {
      suggestions.push({
        id: `workflow_${Date.now()}_2`,
        type: 'workflow',
        priority: 'high',
        title: 'Improve Workflow Efficiency',
        description: `Your ${inefficientPatterns[0].name} workflow could be optimized`,
        action: 'optimize_workflow',
        confidence: 0.8,
        reasoning: 'Low success rate detected in workflow pattern',
        timestamp: new Date()
      });
    }
    
    return suggestions;
  }
  
  // Generate intelligent reminders
  private generateReminderSuggestions(context: PredictiveContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Time-based reminders
    if (context.timeContext.hour === 17 && context.timeContext.isWorkingHours) {
      suggestions.push({
        id: `reminder_${Date.now()}_1`,
        type: 'reminder',
        priority: 'low',
        title: 'End of Day Review',
        description: 'Time to review what you\'ve accomplished today?',
        action: 'daily_review',
        confidence: 0.6,
        reasoning: 'End of working hours',
        timestamp: new Date(),
        expires: new Date(Date.now() + 30 * 60 * 1000) // Expires in 30 minutes
      });
    }
    
    // Context-based reminders
    if (context.userState.workload === 'heavy' && context.userState.focusLevel === 'distracted') {
      suggestions.push({
        id: `reminder_${Date.now()}_2`,
        type: 'reminder',
        priority: 'medium',
        title: 'Take a Break',
        description: 'You seem overwhelmed. A short break might help refresh your focus',
        action: 'suggest_break',
        confidence: 0.7,
        reasoning: 'Heavy workload with distracted focus indicates need for break',
        timestamp: new Date()
      });
    }
    
    return suggestions;
  }
  
  // Generate optimization suggestions
  private generateOptimizationSuggestions(context: PredictiveContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Performance optimization based on environment
    if (context.environmentContext.networkQuality === 'poor') {
      suggestions.push({
        id: `optimization_${Date.now()}_1`,
        type: 'optimization',
        priority: 'high',
        title: 'Optimize for Slow Network',
        description: 'I can help optimize your app for better performance on slow connections',
        action: 'network_optimization',
        confidence: 0.9,
        reasoning: 'Poor network quality detected',
        timestamp: new Date()
      });
    }
    
    // Device-specific optimizations
    if (context.environmentContext.deviceType === 'mobile' && context.currentGoal.includes('UI')) {
      suggestions.push({
        id: `optimization_${Date.now()}_2`,
        type: 'optimization',
        priority: 'medium',
        title: 'Mobile-First Optimization',
        description: 'Let\'s ensure your UI works perfectly on mobile devices',
        action: 'mobile_optimization',
        confidence: 0.8,
        reasoning: 'Mobile device with UI-related goals',
        timestamp: new Date()
      });
    }
    
    return suggestions;
  }
  
  // Build comprehensive predictive context
  private async buildPredictiveContext(
    currentMessage: ChatMessage,
    conversationHistory: ChatMessage[],
    userContext?: Partial<PredictiveContext>
  ): Promise<PredictiveContext> {
    
    const now = new Date();
    const goal = this.extractCurrentGoal(currentMessage.content, conversationHistory);
    
    const context: PredictiveContext = {
      currentGoal: goal,
      timeContext: {
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        isWorkingHours: this.isWorkingHours(now),
        timeZone: 'Asia/Manila', // Default for Filipino users
        season: this.getCurrentSeason(now)
      },
      userState: {
        energyLevel: this.assessEnergyLevel(conversationHistory),
        focusLevel: this.assessFocusLevel(conversationHistory),
        mood: this.assessMood(conversationHistory),
        workload: this.assessWorkload(conversationHistory)
      },
      environmentContext: {
        location: 'Philippines', // Default
        weather: 'unknown',
        networkQuality: 'good', // Default assumption
        deviceType: this.detectDeviceType()
      },
      taskHistory: this.getRecentTaskHistory()
    };
    
    // Merge with user-provided context
    if (userContext) {
      Object.assign(context, userContext);
    }
    
    // Store context for learning
    this.contextHistory.push(context);
    if (this.contextHistory.length > 100) {
      this.contextHistory.shift(); // Keep only recent history
    }
    
    return context;
  }
  
  // Rank suggestions by relevance and confidence
  private rankSuggestions(suggestions: ProactiveSuggestion[], context: PredictiveContext): ProactiveSuggestion[] {
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        score: this.calculateSuggestionScore(suggestion, context)
      }))
      .sort((a, b) => (b as any).score - (a as any).score)
      .filter(suggestion => suggestion.confidence > 0.5); // Filter low-confidence suggestions
  }
  
  private calculateSuggestionScore(suggestion: ProactiveSuggestion, context: PredictiveContext): number {
    let score = suggestion.confidence;
    
    // Priority weight
    const priorityWeights = { urgent: 1.5, high: 1.2, medium: 1.0, low: 0.8 };
    score *= priorityWeights[suggestion.priority];
    
    // Time relevance
    if (suggestion.type === 'reminder' && context.timeContext.isWorkingHours) {
      score *= 1.2;
    }
    
    // User state relevance
    if (suggestion.type === 'optimization' && context.userState.workload === 'heavy') {
      score *= 1.3;
    }
    
    if (suggestion.action === 'suggest_break' && context.userState.focusLevel === 'distracted') {
      score *= 1.4;
    }
    
    // Context relevance
    if (suggestion.type === 'next_step' && context.userState.focusLevel === 'focused') {
      score *= 1.1;
    }
    
    return score;
  }
  
  // Helper methods for context analysis
  private extractCurrentGoal(currentMessage: string, history: ChatMessage[]): string {
    // Simple goal extraction - can be enhanced with NLP
    const goalKeywords = {
      'coding': ['code', 'programming', 'function', 'algorithm', 'debug'],
      'design': ['design', 'UI', 'interface', 'layout', 'visual'],
      'database': ['database', 'query', 'table', 'data', 'sql'],
      'learning': ['learn', 'understand', 'explain', 'tutorial', 'how'],
      'optimization': ['optimize', 'performance', 'speed', 'efficiency'],
      'testing': ['test', 'testing', 'bug', 'error', 'debug']
    };
    
    const content = currentMessage.toLowerCase();
    for (const [goal, keywords] of Object.entries(goalKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return goal;
      }
    }
    
    return 'general';
  }
  
  private isWorkingHours(time: Date): boolean {
    const hour = time.getHours();
    const day = time.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }
  
  private getCurrentSeason(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 12 || month <= 2) return 'dry';
    if (month >= 6 && month <= 11) return 'wet';
    return 'transition';
  }
  
  private assessEnergyLevel(history: ChatMessage[]): 'low' | 'medium' | 'high' {
    const recent = history.slice(-3);
    const enthusiasm = recent.some(msg => 
      msg.content.includes('!') || 
      msg.content.toLowerCase().includes('excited') ||
      msg.content.toLowerCase().includes('awesome')
    );
    
    const fatigue = recent.some(msg =>
      msg.content.toLowerCase().includes('tired') ||
      msg.content.toLowerCase().includes('exhausted') ||
      msg.content.toLowerCase().includes('overwhelmed')
    );
    
    if (enthusiasm && !fatigue) return 'high';
    if (fatigue) return 'low';
    return 'medium';
  }
  
  private assessFocusLevel(history: ChatMessage[]): 'distracted' | 'normal' | 'focused' {
    const recent = history.slice(-5);
    
    const focusIndicators = recent.filter(msg => 
      msg.content.length > 100 && // Detailed messages
      !msg.content.includes('?') // Not questions
    ).length;
    
    const distractionIndicators = recent.filter(msg =>
      msg.content.length < 20 || // Very short messages
      msg.content.split('?').length > 2 // Multiple questions
    ).length;
    
    if (focusIndicators > distractionIndicators && focusIndicators > 2) return 'focused';
    if (distractionIndicators > focusIndicators) return 'distracted';
    return 'normal';
  }
  
  private assessMood(history: ChatMessage[]): 'frustrated' | 'neutral' | 'motivated' | 'excited' {
    const recent = history.slice(-3);
    const content = recent.map(msg => msg.content.toLowerCase()).join(' ');
    
    const positiveWords = ['great', 'awesome', 'perfect', 'love', 'excellent', 'amazing'];
    const negativeWords = ['problem', 'issue', 'stuck', 'frustrated', 'difficult', 'error'];
    const excitedWords = ['excited', 'can\'t wait', 'amazing', 'incredible'];
    const motivatedWords = ['let\'s do', 'ready to', 'want to build', 'let\'s create'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    const excitedCount = excitedWords.filter(word => content.includes(word)).length;
    const motivatedCount = motivatedWords.filter(word => content.includes(word)).length;
    
    if (excitedCount > 0) return 'excited';
    if (motivatedCount > 0) return 'motivated';
    if (negativeCount > positiveCount) return 'frustrated';
    return 'neutral';
  }
  
  private assessWorkload(history: ChatMessage[]): 'light' | 'normal' | 'heavy' | 'overwhelming' {
    const recent = history.slice(-10);
    const complexRequests = recent.filter(msg => 
      msg.content.length > 200 || 
      msg.content.split(',').length > 3 ||
      msg.content.toLowerCase().includes('multiple') ||
      msg.content.toLowerCase().includes('also')
    ).length;
    
    if (complexRequests > 7) return 'overwhelming';
    if (complexRequests > 4) return 'heavy';
    if (complexRequests > 1) return 'normal';
    return 'light';
  }
  
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    // In a real implementation, this would use user agent or screen size
    // For now, default to desktop
    return 'desktop';
  }
  
  private getRecentTaskHistory(): TaskHistoryItem[] {
    // In a real implementation, this would get from persistent storage
    return [];
  }
  
  private findRepetitiveTasks(tasks: TaskHistoryItem[]): string[] {
    const taskCounts = new Map<string, number>();
    
    tasks.forEach(task => {
      const count = taskCounts.get(task.task) || 0;
      taskCounts.set(task.task, count + 1);
    });
    
    return Array.from(taskCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([task, _]) => task);
  }
  
  // Public methods for integration
  getSuggestionById(id: string): ProactiveSuggestion | undefined {
    return this.activeSuggestions.get(id);
  }
  
  dismissSuggestion(id: string): void {
    this.activeSuggestions.delete(id);
  }
  
  acceptSuggestion(id: string): void {
    const suggestion = this.activeSuggestions.get(id);
    if (suggestion) {
      // Record successful suggestion for learning
      console.log(`Suggestion accepted: ${suggestion.title}`);
      this.activeSuggestions.delete(id);
    }
  }
  
  getActiveSuggestions(): ProactiveSuggestion[] {
    return Array.from(this.activeSuggestions.values())
      .filter(suggestion => !suggestion.expires || suggestion.expires > new Date());
  }
  
  clearExpiredSuggestions(): void {
    const now = new Date();
    for (const [id, suggestion] of this.activeSuggestions.entries()) {
      if (suggestion.expires && suggestion.expires < now) {
        this.activeSuggestions.delete(id);
      }
    }
  }
}

// Create singleton instance
export const proactiveIntelligence = new ProactiveIntelligenceEngine();
export default proactiveIntelligence;