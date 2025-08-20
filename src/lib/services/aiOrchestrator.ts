// Advanced AI Orchestrator Service
// Enhances task assignment efficiency with intelligent routing and optimization

export interface TaskRequest {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'reasoning' | 'vision' | 'ocr' | 'transcription';
  prompt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: number; // 1-10 scale
  estimatedDuration: number; // milliseconds
  requiredCapabilities: string[];
  context?: any;
  deadline?: Date;
  userId?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'specialist' | 'generalist' | 'hybrid';
  capabilities: string[];
  currentLoad: number; // 0-100 percentage
  maxConcurrentTasks: number;
  currentTasks: TaskRequest[];
  performance: AgentPerformance;
  availability: 'available' | 'busy' | 'offline';
  costPerTask: number;
  qualityScore: number; // 0-1
  averageResponseTime: number;
}

export interface AgentPerformance {
  tasksCompleted: number;
  averageQuality: number;
  averageSpeed: number;
  successRate: number;
  userSatisfactionScore: number;
  lastUpdated: Date;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignmentTime: Date;
  estimatedCompletion: Date;
  confidence: number;
  reasoning: string;
  fallbackAgents: string[];
}

export interface OrchestrationMetrics {
  totalTasksAssigned: number;
  averageAssignmentTime: number;
  taskSuccessRate: number;
  resourceUtilization: number;
  costEfficiency: number;
  userSatisfactionScore: number;
  systemThroughput: number;
}

class AIOrchestrator {
  private agents: Map<string, AIAgent> = new Map();
  private taskQueue: TaskRequest[] = [];
  private activeAssignments: Map<string, TaskAssignment> = new Map();
  private completedTasks: TaskRequest[] = [];
  private metrics: OrchestrationMetrics;
  private learningData: Map<string, any> = new Map();

  constructor() {
    console.log('🎯 Advanced AI Orchestrator initializing...');
    this.initializeAgents();
    this.metrics = this.initializeMetrics();
    this.startPerformanceMonitoring();
    console.log('✅ AI Orchestrator ready with enhanced task assignment');
  }

  // Initialize AI Agents with specialized capabilities
  private initializeAgents() {
    const agents: AIAgent[] = [
      {
        id: 'hunyuan-video-specialist',
        name: 'HunyuanVideo Specialist',
        type: 'specialist',
        capabilities: ['video-generation', 'cinematic-quality', 'long-duration'],
        currentLoad: 0,
        maxConcurrentTasks: 2,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.42,
        qualityScore: 0.95,
        averageResponseTime: 138000 // 138 seconds
      },
      {
        id: 'mochi-video-specialist',
        name: 'Mochi Video Specialist',
        type: 'specialist',
        capabilities: ['video-generation', 'high-fidelity', 'prompt-adherence'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.35,
        qualityScore: 0.90,
        averageResponseTime: 300000 // 5 minutes
      },
      {
        id: 'image-generation-specialist',
        name: 'Image Generation Specialist',
        type: 'specialist',
        capabilities: ['image-generation', 'artistic-style', 'high-resolution'],
        currentLoad: 0,
        maxConcurrentTasks: 5,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.05,
        qualityScore: 0.88,
        averageResponseTime: 5000 // 5 seconds
      },
      {
        id: 'reasoning-specialist',
        name: 'Advanced Reasoning Specialist',
        type: 'specialist',
        capabilities: ['complex-reasoning', 'multi-step-analysis', 'problem-solving'],
        currentLoad: 0,
        maxConcurrentTasks: 8,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.08,
        qualityScore: 0.92,
        averageResponseTime: 15000 // 15 seconds
      },
      {
        id: 'text-processing-generalist',
        name: 'Text Processing Generalist',
        type: 'generalist',
        capabilities: ['text-generation', 'conversation', 'summarization', 'translation'],
        currentLoad: 0,
        maxConcurrentTasks: 10,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.02,
        qualityScore: 0.85,
        averageResponseTime: 3000 // 3 seconds
      },
      {
        id: 'vision-specialist',
        name: 'Computer Vision Specialist',
        type: 'specialist',
        capabilities: ['image-analysis', 'ocr', 'object-detection', 'scene-understanding'],
        currentLoad: 0,
        maxConcurrentTasks: 6,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.04,
        qualityScore: 0.89,
        averageResponseTime: 8000 // 8 seconds
      },
      {
        id: 'audio-specialist',
        name: 'Audio Processing Specialist',
        type: 'specialist',
        capabilities: ['audio-generation', 'speech-synthesis', 'music-creation', 'transcription'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        currentTasks: [],
        performance: this.createDefaultPerformance(),
        availability: 'available',
        costPerTask: 0.06,
        qualityScore: 0.87,
        averageResponseTime: 12000 // 12 seconds
      }
    ];

    agents.forEach(agent => this.agents.set(agent.id, agent));
    console.log(`🤖 Initialized ${agents.length} AI agents for orchestration`);
  }

  private createDefaultPerformance(): AgentPerformance {
    return {
      tasksCompleted: 0,
      averageQuality: 0.85,
      averageSpeed: 1.0,
      successRate: 0.95,
      userSatisfactionScore: 0.88,
      lastUpdated: new Date()
    };
  }

  private initializeMetrics(): OrchestrationMetrics {
    return {
      totalTasksAssigned: 0,
      averageAssignmentTime: 0,
      taskSuccessRate: 0.95,
      resourceUtilization: 0,
      costEfficiency: 0.92,
      userSatisfactionScore: 0.89,
      systemThroughput: 0
    };
  }

  // Enhanced Task Assignment Algorithm
  async assignTask(taskRequest: TaskRequest): Promise<TaskAssignment> {
    const startTime = Date.now();
    console.log(`🎯 Orchestrating task assignment for: ${taskRequest.type} - "${taskRequest.prompt.substring(0, 50)}..."`);
    
    // Phase 1: Capability Matching
    const capableAgents = this.findCapableAgents(taskRequest);
    if (capableAgents.length === 0) {
      throw new Error(`No agents available for task type: ${taskRequest.type}`);
    }

    // Phase 2: Intelligent Scoring
    const scoredAgents = this.scoreAgents(capableAgents, taskRequest);
    
    // Phase 3: Load Balancing and Optimization
    const optimalAgent = this.selectOptimalAgent(scoredAgents, taskRequest);
    
    // Phase 4: Create Assignment
    const assignment = this.createAssignment(taskRequest, optimalAgent, startTime);
    
    // Phase 5: Update System State
    this.updateAgentLoad(optimalAgent.id, taskRequest);
    this.activeAssignments.set(taskRequest.id, assignment);
    this.updateMetrics();
    
    console.log(`✅ Task assigned to ${optimalAgent.name} (confidence: ${Math.round(assignment.confidence * 100)}%)`);
    
    return assignment;
  }

  private findCapableAgents(task: TaskRequest): AIAgent[] {
    const typeCapabilityMap: { [key: string]: string[] } = {
      'video': ['video-generation'],
      'image': ['image-generation'],
      'text': ['text-generation', 'conversation'],
      'reasoning': ['complex-reasoning', 'problem-solving'],
      'vision': ['image-analysis', 'ocr'],
      'audio': ['audio-generation', 'speech-synthesis'],
      'transcription': ['transcription', 'audio-generation'],
      'ocr': ['ocr', 'image-analysis']
    };

    const requiredCapabilities = typeCapabilityMap[task.type] || [];
    
    return Array.from(this.agents.values()).filter(agent => {
      // Check availability
      if (agent.availability !== 'available') return false;
      
      // Check load capacity
      if (agent.currentTasks.length >= agent.maxConcurrentTasks) return false;
      
      // Check capability match
      return requiredCapabilities.some(cap => agent.capabilities.includes(cap)) ||
             task.requiredCapabilities.some(cap => agent.capabilities.includes(cap));
    });
  }

  private scoreAgents(agents: AIAgent[], task: TaskRequest): Array<{agent: AIAgent, score: number}> {
    return agents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, task)
    })).sort((a, b) => b.score - a.score);
  }

  private calculateAgentScore(agent: AIAgent, task: TaskRequest): number {
    const weights = {
      qualityScore: 0.25,
      availability: 0.20,
      cost: 0.15,
      speed: 0.15,
      capability: 0.15,
      load: 0.10
    };

    // Quality Score (0-1)
    const qualityScore = agent.qualityScore * weights.qualityScore;
    
    // Availability Score (based on current load)
    const availabilityScore = (1 - agent.currentLoad / 100) * weights.availability;
    
    // Cost Efficiency Score (lower cost = higher score)
    const maxCost = 1.0; // Normalize against max expected cost
    const costScore = (1 - agent.costPerTask / maxCost) * weights.cost;
    
    // Speed Score (faster = higher score)
    const maxTime = 600000; // 10 minutes max
    const speedScore = (1 - agent.averageResponseTime / maxTime) * weights.speed;
    
    // Capability Match Score
    const taskCaps = task.requiredCapabilities || [];
    const capabilityMatches = taskCaps.filter(cap => agent.capabilities.includes(cap)).length;
    const capabilityScore = (capabilityMatches / Math.max(taskCaps.length, 1)) * weights.capability;
    
    // Load Balance Score
    const loadScore = (1 - agent.currentTasks.length / agent.maxConcurrentTasks) * weights.load;
    
    // Task-specific bonuses
    let bonus = 0;
    if (task.priority === 'critical') bonus += 0.1;
    if (task.complexity > 7 && agent.type === 'specialist') bonus += 0.05;
    if (task.type === 'video' && agent.capabilities.includes('video-generation')) bonus += 0.1;
    
    const totalScore = qualityScore + availabilityScore + costScore + speedScore + capabilityScore + loadScore + bonus;
    
    console.log(`📊 Agent ${agent.name} score: ${totalScore.toFixed(3)} (Q:${qualityScore.toFixed(2)} A:${availabilityScore.toFixed(2)} C:${costScore.toFixed(2)} S:${speedScore.toFixed(2)})`);
    
    return Math.min(totalScore, 1.0); // Cap at 1.0
  }

  private selectOptimalAgent(scoredAgents: Array<{agent: AIAgent, score: number}>, task: TaskRequest): AIAgent {
    // Advanced selection with load balancing
    const topAgents = scoredAgents.slice(0, Math.min(3, scoredAgents.length));
    
    // If we have a clear winner (score difference > 0.2), use it
    if (topAgents.length > 1 && topAgents[0].score - topAgents[1].score > 0.2) {
      return topAgents[0].agent;
    }
    
    // Otherwise, consider load balancing among top performers
    const loadBalancedAgent = topAgents.reduce((best, current) => {
      const bestLoad = best.agent.currentLoad;
      const currentLoad = current.agent.currentLoad;
      
      // Prefer agents with lower load if scores are close
      if (Math.abs(best.score - current.score) < 0.1 && currentLoad < bestLoad) {
        return current;
      }
      return best;
    });
    
    return loadBalancedAgent.agent;
  }

  private createAssignment(task: TaskRequest, agent: AIAgent, startTime: number): TaskAssignment {
    const estimatedCompletion = new Date(Date.now() + agent.averageResponseTime);
    const confidence = this.calculateAssignmentConfidence(agent, task);
    const fallbackAgents = this.getFallbackAgents(agent, task);
    
    return {
      taskId: task.id,
      agentId: agent.id,
      assignmentTime: new Date(),
      estimatedCompletion,
      confidence,
      reasoning: this.generateAssignmentReasoning(agent, task, confidence),
      fallbackAgents: fallbackAgents.map(a => a.id)
    };
  }

  private calculateAssignmentConfidence(agent: AIAgent, task: TaskRequest): number {
    let confidence = agent.performance.successRate;
    
    // Boost confidence for capability matches
    const capabilityMatches = task.requiredCapabilities?.filter(cap => 
      agent.capabilities.includes(cap)).length || 0;
    if (capabilityMatches > 0) {
      confidence += 0.1 * capabilityMatches;
    }
    
    // Reduce confidence for high load
    if (agent.currentLoad > 80) {
      confidence -= 0.15;
    }
    
    // Boost confidence for specialist agents on matching tasks
    if (agent.type === 'specialist' && task.complexity > 6) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.99);
  }

  private generateAssignmentReasoning(agent: AIAgent, task: TaskRequest, confidence: number): string {
    const reasons = [];
    
    if (agent.qualityScore > 0.9) {
      reasons.push("high quality score");
    }
    
    if (agent.currentLoad < 50) {
      reasons.push("low current load");
    }
    
    if (agent.capabilities.some(cap => task.requiredCapabilities?.includes(cap))) {
      reasons.push("perfect capability match");
    }
    
    if (agent.type === 'specialist') {
      reasons.push("specialized expertise");
    }
    
    if (confidence > 0.9) {
      reasons.push("high confidence prediction");
    }
    
    return `Selected based on: ${reasons.join(", ")}`;
  }

  private getFallbackAgents(primaryAgent: AIAgent, task: TaskRequest): AIAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => 
        agent.id !== primaryAgent.id && 
        agent.availability === 'available' &&
        this.findCapableAgents(task).includes(agent)
      )
      .sort((a, b) => this.calculateAgentScore(b, task) - this.calculateAgentScore(a, task))
      .slice(0, 2);
  }

  private updateAgentLoad(agentId: string, task: TaskRequest) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentTasks.push(task);
      agent.currentLoad = (agent.currentTasks.length / agent.maxConcurrentTasks) * 100;
      
      if (agent.currentLoad >= 100) {
        agent.availability = 'busy';
      }
    }
  }

  // Task Completion Handling
  async completeTask(taskId: string, success: boolean, quality: number, actualDuration: number) {
    const assignment = this.activeAssignments.get(taskId);
    if (!assignment) return;
    
    const agent = this.agents.get(assignment.agentId);
    if (!agent) return;
    
    // Update agent performance
    this.updateAgentPerformance(agent, success, quality, actualDuration);
    
    // Remove task from agent's current tasks
    agent.currentTasks = agent.currentTasks.filter(t => t.id !== taskId);
    agent.currentLoad = (agent.currentTasks.length / agent.maxConcurrentTasks) * 100;
    
    if (agent.availability === 'busy' && agent.currentLoad < 100) {
      agent.availability = 'available';
    }
    
    // Learn from this assignment
    this.recordLearningData(assignment, success, quality, actualDuration);
    
    this.activeAssignments.delete(taskId);
    this.updateMetrics();
    
    console.log(`📈 Task ${taskId} completed. Agent ${agent.name} performance updated.`);
  }

  private updateAgentPerformance(agent: AIAgent, success: boolean, quality: number, actualDuration: number) {
    const perf = agent.performance;
    
    // Update success rate
    const totalTasks = perf.tasksCompleted + 1;
    perf.successRate = (perf.successRate * perf.tasksCompleted + (success ? 1 : 0)) / totalTasks;
    
    // Update average quality
    if (success) {
      perf.averageQuality = (perf.averageQuality * perf.tasksCompleted + quality) / totalTasks;
    }
    
    // Update average response time
    agent.averageResponseTime = (agent.averageResponseTime * perf.tasksCompleted + actualDuration) / totalTasks;
    
    perf.tasksCompleted = totalTasks;
    perf.lastUpdated = new Date();
    
    // Update agent's overall quality score based on recent performance
    agent.qualityScore = Math.min(0.99, perf.averageQuality * perf.successRate);
  }

  private recordLearningData(assignment: TaskAssignment, success: boolean, quality: number, duration: number) {
    const learningEntry = {
      taskType: assignment.taskId,
      agentId: assignment.agentId,
      success,
      quality,
      estimatedDuration: (assignment.estimatedCompletion instanceof Date ? assignment.estimatedCompletion : new Date(assignment.estimatedCompletion)).getTime() - (assignment.assignmentTime instanceof Date ? assignment.assignmentTime : new Date(assignment.assignmentTime)).getTime(),
      actualDuration: duration,
      confidence: assignment.confidence,
      timestamp: new Date()
    };
    
    this.learningData.set(`${assignment.taskId}_${Date.now()}`, learningEntry);
    
    // Keep only recent learning data (last 1000 entries)
    if (this.learningData.size > 1000) {
      const oldestKey = Array.from(this.learningData.keys())[0];
      this.learningData.delete(oldestKey);
    }
  }

  // Real-time Monitoring and Optimization
  private startPerformanceMonitoring() {
    setInterval(() => {
      this.optimizeAgentDistribution();
      this.updateSystemMetrics();
      this.logOrchestrationStatus();
    }, 30000); // Every 30 seconds
  }

  private optimizeAgentDistribution() {
    // Identify overloaded agents
    const overloadedAgents = Array.from(this.agents.values())
      .filter(agent => agent.currentLoad > 85);
    
    // Redistribute tasks if needed
    overloadedAgents.forEach(agent => {
      if (agent.currentTasks.length > 1) {
        const lowPriorityTasks = agent.currentTasks
          .filter(task => task.priority === 'low' || task.priority === 'medium')
          .slice(0, 1);
        
        lowPriorityTasks.forEach(task => {
          this.reassignTask(task, agent.id);
        });
      }
    });
  }

  private async reassignTask(task: TaskRequest, currentAgentId: string) {
    const capableAgents = this.findCapableAgents(task)
      .filter(agent => agent.id !== currentAgentId && agent.currentLoad < 70);
    
    if (capableAgents.length > 0) {
      const newAgent = capableAgents[0];
      
      // Remove from current agent
      const currentAgent = this.agents.get(currentAgentId);
      if (currentAgent) {
        currentAgent.currentTasks = currentAgent.currentTasks.filter(t => t.id !== task.id);
        currentAgent.currentLoad = (currentAgent.currentTasks.length / currentAgent.maxConcurrentTasks) * 100;
      }
      
      // Assign to new agent
      this.updateAgentLoad(newAgent.id, task);
      
      console.log(`🔄 Reassigned task ${task.id} from ${currentAgentId} to ${newAgent.id}`);
    }
  }

  private updateSystemMetrics() {
    const totalAgents = this.agents.size;
    const busyAgents = Array.from(this.agents.values()).filter(a => a.availability === 'busy').length;
    
    this.metrics.resourceUtilization = busyAgents / totalAgents;
    this.metrics.systemThroughput = this.completedTasks.length;
  }

  private updateMetrics() {
    this.metrics.totalTasksAssigned++;
    // Additional metrics updates would go here
  }

  private logOrchestrationStatus() {
    const activeAgents = Array.from(this.agents.values()).filter(a => a.currentLoad > 0);
    const totalActiveTasks = activeAgents.reduce((sum, agent) => sum + agent.currentTasks.length, 0);
    
    console.log(`🎯 Orchestration Status: ${totalActiveTasks} active tasks across ${activeAgents.length} agents`);
    console.log(`📊 Resource Utilization: ${Math.round(this.metrics.resourceUtilization * 100)}%`);
  }

  // Public API Methods
  getAgentStatus(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  getSystemMetrics(): OrchestrationMetrics {
    return { ...this.metrics };
  }

  getActiveAssignments(): TaskAssignment[] {
    return Array.from(this.activeAssignments.values());
  }

  async predictOptimalAgent(taskRequest: TaskRequest): Promise<{agentId: string, confidence: number}> {
    const capableAgents = this.findCapableAgents(taskRequest);
    const scoredAgents = this.scoreAgents(capableAgents, taskRequest);
    const optimal = this.selectOptimalAgent(scoredAgents, taskRequest);
    const confidence = this.calculateAssignmentConfidence(optimal, taskRequest);
    
    return {
      agentId: optimal.id,
      confidence
    };
  }

  // Emergency override for critical tasks
  async assignCriticalTask(taskRequest: TaskRequest): Promise<TaskAssignment> {
    taskRequest.priority = 'critical';
    
    // Find the best available agent, even if overloaded
    const allAgents = Array.from(this.agents.values())
      .filter(agent => agent.availability !== 'offline');
    
    if (allAgents.length === 0) {
      throw new Error('No agents available for critical task');
    }
    
    const scoredAgents = this.scoreAgents(allAgents, taskRequest);
    const bestAgent = scoredAgents[0].agent;
    
    // Force assignment even if overloaded
    const assignment = this.createAssignment(taskRequest, bestAgent, Date.now());
    this.updateAgentLoad(bestAgent.id, taskRequest);
    this.activeAssignments.set(taskRequest.id, assignment);
    
    console.log(`🚨 CRITICAL TASK assigned to ${bestAgent.name} (forced assignment)`);
    
    return assignment;
  }
}

// Export singleton instance
export const aiOrchestrator = new AIOrchestrator();