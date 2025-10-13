// Core AI Agent Types and Interfaces

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'creation' | 'communication' | 'automation' | 'research' | 'planning';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface AgentPersonality {
  name: string;
  expertise: string[];
  communicationStyle: 'professional' | 'creative' | 'analytical' | 'friendly' | 'direct';
  background: string;
  specializations: string[];
}

export interface AgentMemory {
  shortTerm: Array<{
    timestamp: number;
    context: string;
    importance: number;
  }>;
  longTerm: Array<{
    id: string;
    knowledge: string;
    context: string;
    confidence: number;
    lastAccessed: number;
  }>;
  projectHistory: Array<{
    projectId: string;
    title: string;
    role: string;
    outcomes: string[];
    lessons: string[];
  }>;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  assignedTo: string; // agent ID
  requestedBy: string; // user or agent ID
  deadline?: number;
  dependencies?: string[]; // other task IDs
  deliverables: Array<{
    type: 'document' | 'analysis' | 'design' | 'code' | 'strategy' | 'report';
    description: string;
    completed: boolean;
    url?: string;
  }>;
  collaboration?: {
    involvedAgents: string[];
    communicationHistory: Array<{
      from: string;
      to: string;
      message: string;
      timestamp: number;
    }>;
  };
  createdAt: number;
  updatedAt: number;
}

export interface BusinessContext {
  clientProjects: Array<{
    id: string;
    name: string;
    type: 'design' | 'marketing' | 'ai_solution' | 'consulting';
    status: 'proposal' | 'active' | 'completed' | 'on_hold';
    client: {
      name: string;
      industry: string;
      requirements: string[];
    };
    timeline: {
      start: number;
      end: number;
      milestones: Array<{
        name: string;
        date: number;
        completed: boolean;
      }>;
    };
    budget: {
      total: number;
      spent: number;
      remaining: number;
    };
  }>;
  businessMetrics: {
    revenue: number;
    activeClients: number;
    projectCompletionRate: number;
    clientSatisfactionScore: number;
  };
  resources: {
    teamSize: number;
    availableHours: number;
    currentCapacity: number;
  };
}

export interface AgentConfiguration {
  id: string;
  name: string;
  type: 'business_manager' | 'design_specialist' | 'marketing_strategist' | 'ai_engineer' | 'client_liaison' | 'project_coordinator' | 'financial_analyst' | 'research_specialist';
  personality: AgentPersonality;
  capabilities: AgentCapability[];
  memory: AgentMemory;
  isActive: boolean;
  lastActive: number;
  performanceMetrics: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    clientFeedbackScore: number;
  };
  collaborationPreferences: {
    preferredPartners: string[]; // agent IDs
    communicationStyle: string;
    workingHours: {
      start: number; // hour of day
      end: number;
    };
  };
}

export interface AgentResponse {
  agentId: string;
  message: string;
  confidence: number;
  suggestedActions?: Array<{
    type: 'task' | 'meeting' | 'research' | 'decision';
    description: string;
    priority: number;
  }>;
  attachments?: Array<{
    type: 'document' | 'image' | 'link' | 'data';
    title: string;
    url: string;
    description?: string;
  }>;
  needsFollowUp: boolean;
  estimatedWorkTime?: number; // in minutes
  reasoning?: string[]; // AI reasoning steps
  toolsUsed?: string[]; // MCP tools utilized
  metadata?: {
    responseType: 'analytical' | 'creative' | 'problem_solving' | 'informational' | 'action_oriented';
    personalityTraits: string[];
    contextFactors: string[];
  };
}

export interface AgentCollaboration {
  id: string;
  title: string;
  participants: string[]; // agent IDs
  objective: string;
  currentPhase: string;
  sharedContext: Record<string, any>;
  decisions: Array<{
    decision: string;
    madeBy: string;
    timestamp: number;
    rationale: string;
  }>;
  outcomes: string[];
}

export interface CreatorBusinessIntelligence {
  dashboardMetrics: {
    totalRevenue: number;
    monthlyGrowth: number;
    activeProjects: number;
    clientRetentionRate: number;
    averageProjectValue: number;
    profitMargin: number;
  };
  marketAnalysis: {
    industryTrends: string[];
    competitorInsights: string[];
    opportunityAreas: string[];
    threatAssessment: string[];
  };
  recommendations: Array<{
    category: 'growth' | 'efficiency' | 'quality' | 'innovation';
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

// Production Agent Execution Engine Types
export interface AgentExecutionContext {
  userId: string;
  workflowId: string;
  executionId: string;
  organizationId?: string;
  credits: number;
}

export interface AgentInput {
  type: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface AgentOutput {
  type: string;
  data: any;
  metadata?: Record<string, any>;
  error?: string;
}

export interface AgentIntegration {
  id: string;
  name: string;
  type: 'mcp' | 'api' | 'webhook';
  config: Record<string, any>;
  isEnabled: boolean;
}

export interface ExecutableAgent {
  id: string;
  name: string;
  type: string;
  version: string;
  config: any;
  capabilities: AgentCapability[];
  integrations: AgentIntegration[];
}

export interface AgentExecutionResult {
  success: boolean;
  output?: AgentOutput;
  error?: string;
  duration: number;
  creditsUsed: number;
  logs: string[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    agentId: string;
    config: Record<string, any>;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  data?: Record<string, any>;
}

export interface ExecutableWorkflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings: Record<string, any>;
}

export interface WorkflowExecutionResult {
  success: boolean;
  outputs: Record<string, AgentOutput>;
  errors: Record<string, string>;
  totalDuration: number;
  totalCreditsUsed: number;
  executionLog: string[];
}