/**
 * Core Types for Gawin AI Agent System
 */

// Core agent context
export interface AgentContext {
  userId: string;
  sessionId: string;
  userPreferences?: {
    language?: string;
    enableVoiceAnalysis?: boolean;
    enableLearning?: boolean;
    enhancedResponses?: boolean;
  };
  environment?: string;
  connectionSpeed?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  conversationHistory?: any[];
  metadata?: Record<string, any>;
}

// Goal-related types
export type GoalStatus = 'pending' | 'active' | 'in_progress' | 'completed' | 'failed' | 'paused';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentGoal {
  id: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
  tasks: AgentTask[];
  createdAt: Date;
  lastUpdated?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  context: AgentContext;
  category?: string;
  requiredCapabilities?: string[];
  metadata?: Record<string, any>;
}

// Task-related types
export interface AgentTask {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  parameters: Record<string, any>;
  dependencies: string[];
  estimatedDuration: number;
  createdAt: Date;
  lastUpdated?: Date;
  completedAt?: Date;
  context: AgentContext;
  result?: any;
  error?: string;
}

// Plan-related types
export interface AgentPlan {
  id: string;
  goalId: string;
  strategy: any; // Will be defined by ExecutionStrategy
  tasks: AgentTask[];
  estimatedDuration: number;
  createdAt: Date;
  confidence: number;
  contingencyPlans?: AgentPlan[];
}

// Tool execution results
export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime?: number;
  confidence?: number;
  critical?: boolean;
  metadata?: Record<string, any>;
}

// Memory-related types
export interface MemoryEntry {
  id: string;
  type: string;
  content: any;
  timestamp: Date;
  importance: number;
  tags: string[];
  userId: string;
  context: Record<string, any>;
}

// Agent state management
export interface AgentState {
  currentGoals: AgentGoal[];
  activeTasks: AgentTask[];
  capabilities: string[];
  performance: PerformanceMetrics;
  context: AgentContext;
  preferences: AgentPreferences;
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  tasksSuccessful: number;
  averageTaskDuration: number;
  goalCompletionRate: number;
  learningRate: number;
  adaptationScore: number;
  lastUpdated: Date;
}

export interface AgentPreferences {
  autonomy_level: 'manual' | 'semi_autonomous' | 'fully_autonomous';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  learning_style: 'incremental' | 'batch' | 'adaptive';
  communication_frequency: 'minimal' | 'regular' | 'frequent';
  goal_setting: 'user_driven' | 'collaborative' | 'agent_suggested';
}

// Capability-related types
export interface AgentCapability {
  name: string;
  description: string;
  reliability: number;
  performance: Record<string, number>;
  serviceName: string;
  provider: string;
}

// Planning context
export interface PlanningContext {
  goal: AgentGoal;
  availableCapabilities: string[];
  currentContext: AgentContext;
  constraints: PlanningConstraints;
  pastPerformance: PerformanceMetrics;
}

export interface PlanningConstraints {
  maxDuration?: number;
  maxComplexity?: number;
  requiredReliability?: number;
  preferredTools?: string[];
  avoidedTools?: string[];
  resourceLimits?: Record<string, any>;
}

// Learning and adaptation
export interface LearningData {
  patterns: Record<string, any>;
  experiences: MemoryEntry[];
  adaptations: AdaptationRecord[];
  performance: PerformanceMetrics;
}

export interface AdaptationRecord {
  id: string;
  type: string;
  trigger: string;
  adaptation: string;
  result: string;
  timestamp: Date;
  effectiveness: number;
}

// Cultural adaptation
export interface CulturalContext {
  language: string;
  region: string;
  customs: string[];
  communicationStyle: string;
  preferences: Record<string, any>;
}

// Voice and speech
export interface VoiceContext {
  emotion: string;
  tone: string;
  speed: number;
  pitch: number;
  language: string;
  accent?: string;
  culturalAdaptations?: string[];
}

// Error handling
export interface AgentError {
  code: string;
  message: string;
  context: AgentContext;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

// Integration events
export interface IntegrationEvent {
  id: string;
  type: string;
  serviceName: string;
  timestamp: Date;
  details: Record<string, any>;
  impact: 'low' | 'medium' | 'high';
}

// Service health
export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastCheck: Date;
  metrics: Record<string, number>;
  issues: string[];
}