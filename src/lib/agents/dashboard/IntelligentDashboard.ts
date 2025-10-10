// Intelligent Agent Management Dashboard
// Advanced analytics and real-time monitoring with AI insights

import { AgentConfiguration, AgentTask, BusinessContext, CreatorBusinessIntelligence } from '../types';
import { RealTimeCollaborationEngine } from '../collaboration/RealTimeCollaboration';

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'heatmap' | 'timeline' | 'ai_insight';
  title: string;
  description?: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  data?: any;
  lastUpdated: number;
  refreshInterval?: number; // in milliseconds
}

// Real-time Metrics
export interface RealTimeMetrics {
  agentPerformance: Record<string, {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    currentWorkload: number;
    efficiency: number;
  }>;
  systemHealth: {
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    systemUptime: number;
  };
  businessMetrics: {
    revenue: number;
    clientSatisfaction: number;
    projectCompletionRate: number;
    resourceUtilization: number;
    profitability: number;
  };
  collaborationMetrics: {
    activeSessions: number;
    messagesSent: number;
    decisionsRequested: number;
    knowledgeShared: number;
  };
}

// AI-Powered Insights
export interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'anomaly' | 'recommendation' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  suggestedActions: string[];
  impact: {
    category: 'performance' | 'cost' | 'quality' | 'timeline';
    estimatedValue: number;
    timeframe: string;
  };
  timestamp: number;
  isRead: boolean;
}

// Advanced Analytics Engine
export class AdvancedAnalyticsEngine {
  private metrics: RealTimeMetrics;
  private insights: AIInsight[] = [];
  private historicalData: Map<string, any[]> = new Map();

  constructor() {
    this.metrics = this.initializeMetrics();
    this.startRealTimeAnalysis();
  }

  // Generate AI-powered insights
  async generateInsights(
    agentData: AgentConfiguration[],
    taskData: AgentTask[],
    businessContext: BusinessContext
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Performance optimization insights
    const performanceInsights = await this.analyzePerformancePatterns(agentData, taskData);
    insights.push(...performanceInsights);

    // Workload distribution insights
    const workloadInsights = await this.analyzeWorkloadDistribution(agentData, taskData);
    insights.push(...workloadInsights);

    // Business opportunity insights
    const businessInsights = await this.analyzeBusinessOpportunities(businessContext);
    insights.push(...businessInsights);

    // Predictive insights
    const predictiveInsights = await this.generatePredictiveInsights(taskData);
    insights.push(...predictiveInsights);

    // Sort by severity and confidence
    insights.sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return (severityWeight[b.severity] * b.confidence) - (severityWeight[a.severity] * a.confidence);
    });

    this.insights = insights;
    return insights.slice(0, 10); // Return top 10 insights
  }

  // Real-time anomaly detection
  async detectAnomalies(currentMetrics: RealTimeMetrics): Promise<AIInsight[]> {
    const anomalies: AIInsight[] = [];

    // Check for performance anomalies
    for (const [agentId, performance] of Object.entries(currentMetrics.agentPerformance)) {
      if (performance.successRate < 0.8) {
        anomalies.push({
          id: `anomaly_${Date.now()}_${agentId}`,
          type: 'anomaly',
          severity: performance.successRate < 0.5 ? 'critical' : 'high',
          title: `Low Success Rate Detected: ${agentId}`,
          description: `Agent ${agentId} has a success rate of ${(performance.successRate * 100).toFixed(1)}%, which is below the expected threshold.`,
          confidence: 0.85,
          evidence: [
            `Success rate: ${(performance.successRate * 100).toFixed(1)}%`,
            `Tasks completed: ${performance.tasksCompleted}`,
            `Average response time: ${performance.averageResponseTime}s`
          ],
          suggestedActions: [
            'Review recent task assignments for complexity mismatch',
            'Check agent configuration and capabilities',
            'Consider additional training or optimization',
            'Redistribute workload temporarily'
          ],
          impact: {
            category: 'performance',
            estimatedValue: performance.tasksCompleted * 0.2, // Estimated productivity loss
            timeframe: 'immediate'
          },
          timestamp: Date.now(),
          isRead: false
        });
      }

      if (performance.averageResponseTime > 10) {
        anomalies.push({
          id: `anomaly_${Date.now()}_response_${agentId}`,
          type: 'anomaly',
          severity: 'medium',
          title: `Slow Response Time: ${agentId}`,
          description: `Agent ${agentId} is responding slower than expected (${performance.averageResponseTime}s average).`,
          confidence: 0.75,
          evidence: [
            `Average response time: ${performance.averageResponseTime}s`,
            `Current workload: ${performance.currentWorkload} tasks`
          ],
          suggestedActions: [
            'Check system resources and performance',
            'Review current task complexity',
            'Consider workload rebalancing'
          ],
          impact: {
            category: 'performance',
            estimatedValue: 15, // Minutes saved per task
            timeframe: 'short_term'
          },
          timestamp: Date.now(),
          isRead: false
        });
      }
    }

    return anomalies;
  }

  // Predictive analytics
  async predictFuturePerformance(
    agentId: string,
    timeframe: 'day' | 'week' | 'month'
  ): Promise<any> {
    const historical = this.historicalData.get(agentId) || [];

    if (historical.length < 10) {
      return {
        prediction: 'insufficient_data',
        confidence: 0,
        trend: 'unknown'
      };
    }

    // Simple trend analysis (in production, use more sophisticated ML models)
    const recentPerformance = historical.slice(-10);
    const trend = this.calculateTrend(recentPerformance.map(d => d.successRate));

    const prediction = {
      successRate: this.extrapolateTrend(recentPerformance.map(d => d.successRate), timeframe),
      responseTime: this.extrapolateTrend(recentPerformance.map(d => d.responseTime), timeframe),
      efficiency: this.extrapolateTrend(recentPerformance.map(d => d.efficiency), timeframe),
      trend: trend > 0.05 ? 'improving' : trend < -0.05 ? 'declining' : 'stable',
      confidence: Math.min(0.9, historical.length / 50) // Higher confidence with more data
    };

    return prediction;
  }

  // Resource optimization recommendations
  async generateOptimizationRecommendations(
    currentMetrics: RealTimeMetrics
  ): Promise<AIInsight[]> {
    const recommendations: AIInsight[] = [];

    // Workload balancing
    const workloads = Object.values(currentMetrics.agentPerformance).map(p => p.currentWorkload);
    const maxWorkload = Math.max(...workloads);
    const minWorkload = Math.min(...workloads);

    if (maxWorkload - minWorkload > 5) {
      recommendations.push({
        id: `opt_workload_${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Workload Imbalance Detected',
        description: 'Significant workload imbalance detected between agents. Rebalancing could improve overall efficiency.',
        confidence: 0.8,
        evidence: [
          `Maximum workload: ${maxWorkload} tasks`,
          `Minimum workload: ${minWorkload} tasks`,
          `Imbalance ratio: ${(maxWorkload / (minWorkload || 1)).toFixed(2)}`
        ],
        suggestedActions: [
          'Redistribute tasks from overloaded agents',
          'Analyze task complexity and agent capabilities',
          'Implement dynamic load balancing',
          'Consider agent specialization optimization'
        ],
        impact: {
          category: 'performance',
          estimatedValue: 20, // Percentage efficiency improvement
          timeframe: 'short_term'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    // Resource utilization
    if (currentMetrics.businessMetrics.resourceUtilization < 0.7) {
      recommendations.push({
        id: `opt_utilization_${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Low Resource Utilization',
        description: 'System resources are underutilized. Consider scaling up operations or optimizing resource allocation.',
        confidence: 0.75,
        evidence: [
          `Resource utilization: ${(currentMetrics.businessMetrics.resourceUtilization * 100).toFixed(1)}%`,
          `Active agents: ${currentMetrics.systemHealth.activeAgents}`,
          `Total tasks: ${currentMetrics.systemHealth.totalTasks}`
        ],
        suggestedActions: [
          'Take on additional client projects',
          'Expand service offerings',
          'Optimize agent scheduling',
          'Consider system scaling opportunities'
        ],
        impact: {
          category: 'cost',
          estimatedValue: 30, // Percentage revenue increase potential
          timeframe: 'medium_term'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    return recommendations;
  }

  // Update metrics in real-time
  updateMetrics(newMetrics: Partial<RealTimeMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics };

    // Store historical data
    const timestamp = Date.now();
    for (const [agentId, performance] of Object.entries(newMetrics.agentPerformance || {})) {
      if (!this.historicalData.has(agentId)) {
        this.historicalData.set(agentId, []);
      }

      this.historicalData.get(agentId)!.push({
        timestamp,
        ...performance
      });

      // Keep only last 1000 data points
      const agentHistory = this.historicalData.get(agentId)!;
      if (agentHistory.length > 1000) {
        agentHistory.splice(0, agentHistory.length - 1000);
      }
    }
  }

  getCurrentMetrics(): RealTimeMetrics {
    return this.metrics;
  }

  getInsights(): AIInsight[] {
    return this.insights;
  }

  // Private helper methods
  private initializeMetrics(): RealTimeMetrics {
    return {
      agentPerformance: {},
      systemHealth: {
        activeAgents: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageTaskTime: 0,
        systemUptime: 0
      },
      businessMetrics: {
        revenue: 0,
        clientSatisfaction: 0,
        projectCompletionRate: 0,
        resourceUtilization: 0,
        profitability: 0
      },
      collaborationMetrics: {
        activeSessions: 0,
        messagesSent: 0,
        decisionsRequested: 0,
        knowledgeShared: 0
      }
    };
  }

  private startRealTimeAnalysis(): void {
    // Simulate real-time analysis updates
    setInterval(() => {
      this.detectAnomalies(this.metrics).then(anomalies => {
        if (anomalies.length > 0) {
          this.insights.push(...anomalies);
          console.log(`🔍 Detected ${anomalies.length} new anomalies`);
        }
      });
    }, 30000); // Every 30 seconds
  }

  private async analyzePerformancePatterns(
    agentData: AgentConfiguration[],
    taskData: AgentTask[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze task completion patterns
    const completedTasks = taskData.filter(t => t.status === 'completed');
    const avgCompletionTime = completedTasks.reduce((sum, task) => {
      return sum + (task.updatedAt - task.createdAt);
    }, 0) / completedTasks.length;

    if (avgCompletionTime > 86400000) { // > 1 day
      insights.push({
        id: `perf_completion_${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Task Completion Time Could Be Improved',
        description: 'Average task completion time is longer than optimal. Consider workflow optimization.',
        confidence: 0.7,
        evidence: [
          `Average completion time: ${Math.round(avgCompletionTime / 3600000)} hours`,
          `Completed tasks analyzed: ${completedTasks.length}`
        ],
        suggestedActions: [
          'Review task complexity and scope',
          'Optimize agent workflows',
          'Consider task decomposition',
          'Implement parallel processing where possible'
        ],
        impact: {
          category: 'timeline',
          estimatedValue: 25, // Percentage time reduction potential
          timeframe: 'medium_term'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async analyzeWorkloadDistribution(
    agentData: AgentConfiguration[],
    taskData: AgentTask[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Calculate task distribution
    const tasksByAgent = new Map<string, number>();
    taskData.forEach(task => {
      const count = tasksByAgent.get(task.assignedTo) || 0;
      tasksByAgent.set(task.assignedTo, count + 1);
    });

    const taskCounts = Array.from(tasksByAgent.values());
    const avgTasks = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length;
    const maxTasks = Math.max(...taskCounts);

    if (maxTasks > avgTasks * 1.5) {
      insights.push({
        id: `workload_dist_${Date.now()}`,
        type: 'recommendation',
        severity: 'medium',
        title: 'Uneven Task Distribution Detected',
        description: 'Some agents are handling significantly more tasks than others.',
        confidence: 0.8,
        evidence: [
          `Average tasks per agent: ${avgTasks.toFixed(1)}`,
          `Maximum tasks for single agent: ${maxTasks}`,
          `Distribution variance: ${((maxTasks / avgTasks) * 100).toFixed(1)}%`
        ],
        suggestedActions: [
          'Redistribute tasks more evenly',
          'Analyze agent capabilities and specializations',
          'Implement dynamic load balancing',
          'Consider expanding team capacity'
        ],
        impact: {
          category: 'performance',
          estimatedValue: 15, // Percentage efficiency improvement
          timeframe: 'short_term'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async analyzeBusinessOpportunities(
    businessContext: BusinessContext
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze client satisfaction trends
    if (businessContext.businessMetrics.clientSatisfactionScore > 4.5) {
      insights.push({
        id: `biz_satisfaction_${Date.now()}`,
        type: 'recommendation',
        severity: 'low',
        title: 'High Client Satisfaction - Expansion Opportunity',
        description: 'Excellent client satisfaction scores present an opportunity for business expansion.',
        confidence: 0.85,
        evidence: [
          `Client satisfaction: ${businessContext.businessMetrics.clientSatisfactionScore}/5.0`,
          `Active clients: ${businessContext.businessMetrics.activeClients}`,
          `Project completion rate: ${(businessContext.businessMetrics.projectCompletionRate * 100).toFixed(1)}%`
        ],
        suggestedActions: [
          'Launch referral program',
          'Expand service offerings',
          'Increase marketing efforts',
          'Consider premium service tiers'
        ],
        impact: {
          category: 'cost',
          estimatedValue: 25, // Percentage revenue increase potential
          timeframe: 'medium_term'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async generatePredictiveInsights(taskData: AgentTask[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Predict potential bottlenecks
    const urgentTasks = taskData.filter(t => t.priority === 'urgent' && t.status === 'pending');
    if (urgentTasks.length > 5) {
      insights.push({
        id: `pred_bottleneck_${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Potential Bottleneck Predicted',
        description: 'High number of urgent pending tasks may create delivery bottlenecks.',
        confidence: 0.75,
        evidence: [
          `Urgent pending tasks: ${urgentTasks.length}`,
          `Total pending tasks: ${taskData.filter(t => t.status === 'pending').length}`
        ],
        suggestedActions: [
          'Prioritize urgent task allocation',
          'Consider temporary resource reallocation',
          'Communicate potential delays proactively',
          'Implement expedited processing workflow'
        ],
        impact: {
          category: 'timeline',
          estimatedValue: urgentTasks.length * 2, // Hours of potential delay
          timeframe: 'immediate'
        },
        timestamp: Date.now(),
        isRead: false
      });
    }

    return insights;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private extrapolateTrend(values: number[], timeframe: string): number {
    if (values.length < 2) return values[0] || 0;

    const trend = this.calculateTrend(values);
    const lastValue = values[values.length - 1];

    const multiplier = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    return Math.max(0, lastValue + (trend * multiplier));
  }
}

// Intelligent Dashboard Manager
export class IntelligentDashboardManager {
  private analyticsEngine: AdvancedAnalyticsEngine;
  private collaborationEngine: RealTimeCollaborationEngine;
  private widgets: DashboardWidget[] = [];
  private customLayouts: Map<string, DashboardWidget[]> = new Map();

  constructor(collaborationEngine: RealTimeCollaborationEngine) {
    this.analyticsEngine = new AdvancedAnalyticsEngine();
    this.collaborationEngine = collaborationEngine;
    this.initializeDefaultWidgets();
  }

  // Create personalized dashboard
  async createPersonalizedDashboard(
    userId: string,
    preferences: {
      focusAreas: string[];
      updateFrequency: 'realtime' | 'minute' | 'hour';
      complexity: 'simple' | 'detailed' | 'expert';
    }
  ): Promise<DashboardWidget[]> {
    const widgets: DashboardWidget[] = [];

    // Core performance widget
    widgets.push({
      id: 'agent_performance',
      type: 'chart',
      title: 'Agent Performance Overview',
      position: { x: 0, y: 0, width: 6, height: 4 },
      config: {
        chartType: 'line',
        metrics: ['successRate', 'responseTime', 'efficiency'],
        timeRange: '24h'
      },
      lastUpdated: Date.now(),
      refreshInterval: this.getRefreshInterval(preferences.updateFrequency)
    });

    // Business metrics widget
    if (preferences.focusAreas.includes('business')) {
      widgets.push({
        id: 'business_metrics',
        type: 'metric',
        title: 'Business Intelligence',
        position: { x: 6, y: 0, width: 6, height: 2 },
        config: {
          metrics: ['revenue', 'clientSatisfaction', 'profitability'],
          format: 'cards'
        },
        lastUpdated: Date.now(),
        refreshInterval: this.getRefreshInterval(preferences.updateFrequency)
      });
    }

    // AI insights widget
    widgets.push({
      id: 'ai_insights',
      type: 'ai_insight',
      title: 'AI-Powered Insights',
      position: { x: 0, y: 4, width: 12, height: 3 },
      config: {
        maxInsights: preferences.complexity === 'simple' ? 3 : 10,
        severityFilter: preferences.complexity === 'simple' ? ['high', 'critical'] : 'all'
      },
      lastUpdated: Date.now(),
      refreshInterval: this.getRefreshInterval(preferences.updateFrequency)
    });

    // Collaboration activity
    if (preferences.focusAreas.includes('collaboration')) {
      widgets.push({
        id: 'collaboration_activity',
        type: 'timeline',
        title: 'Recent Collaboration Activity',
        position: { x: 0, y: 7, width: 8, height: 3 },
        config: {
          showAgentMessages: true,
          showDecisions: true,
          timeRange: '1h'
        },
        lastUpdated: Date.now(),
        refreshInterval: this.getRefreshInterval(preferences.updateFrequency)
      });
    }

    this.customLayouts.set(userId, widgets);
    return widgets;
  }

  // Get real-time dashboard data
  async getDashboardData(): Promise<{
    metrics: RealTimeMetrics;
    insights: AIInsight[];
    collaborationStats: any;
    systemStatus: any;
  }> {
    const metrics = this.analyticsEngine.getCurrentMetrics();
    const insights = this.analyticsEngine.getInsights();
    const collaborationStats = this.collaborationEngine.getCollaborationStats();

    const systemStatus = {
      status: 'healthy',
      uptime: Date.now() - 1640995200000, // Since system start
      version: '2.0.0',
      lastUpdate: Date.now(),
      health: {
        cpu: Math.random() * 30 + 20, // Mock CPU usage
        memory: Math.random() * 40 + 30, // Mock memory usage
        network: Math.random() * 20 + 80 // Mock network performance
      }
    };

    return {
      metrics,
      insights,
      collaborationStats,
      systemStatus
    };
  }

  // Update widget data
  async updateWidgetData(widgetId: string): Promise<DashboardWidget | null> {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (!widget) return null;

    switch (widget.type) {
      case 'chart':
        widget.data = await this.generateChartData(widget.config);
        break;
      case 'metric':
        widget.data = await this.generateMetricData(widget.config);
        break;
      case 'ai_insight':
        widget.data = await this.generateInsightData(widget.config);
        break;
      case 'timeline':
        widget.data = await this.generateTimelineData(widget.config);
        break;
    }

    widget.lastUpdated = Date.now();
    return widget;
  }

  // Export dashboard configuration
  exportDashboardConfig(userId: string): any {
    const layout = this.customLayouts.get(userId) || this.widgets;
    return {
      version: '2.0',
      userId,
      widgets: layout,
      exportedAt: Date.now()
    };
  }

  // Import dashboard configuration
  importDashboardConfig(config: any): boolean {
    try {
      if (config.version === '2.0' && config.widgets) {
        this.customLayouts.set(config.userId, config.widgets);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import dashboard config:', error);
      return false;
    }
  }

  // Private helper methods
  private initializeDefaultWidgets(): void {
    this.widgets = [
      {
        id: 'system_overview',
        type: 'metric',
        title: 'System Overview',
        position: { x: 0, y: 0, width: 12, height: 2 },
        config: { showAll: true },
        lastUpdated: Date.now(),
        refreshInterval: 60000
      },
      {
        id: 'agent_performance_chart',
        type: 'chart',
        title: 'Agent Performance Trends',
        position: { x: 0, y: 2, width: 8, height: 4 },
        config: { chartType: 'line', timeRange: '24h' },
        lastUpdated: Date.now(),
        refreshInterval: 30000
      },
      {
        id: 'task_distribution',
        type: 'chart',
        title: 'Task Distribution',
        position: { x: 8, y: 2, width: 4, height: 4 },
        config: { chartType: 'pie' },
        lastUpdated: Date.now(),
        refreshInterval: 60000
      }
    ];
  }

  private getRefreshInterval(frequency: string): number {
    switch (frequency) {
      case 'realtime': return 5000;   // 5 seconds
      case 'minute': return 60000;    // 1 minute
      case 'hour': return 3600000;    // 1 hour
      default: return 30000;          // 30 seconds
    }
  }

  private async generateChartData(config: any): Promise<any> {
    // Generate mock chart data based on configuration
    const now = Date.now();
    const timeRange = config.timeRange === '24h' ? 24 : 1;
    const dataPoints = [];

    for (let i = timeRange; i >= 0; i--) {
      const timestamp = now - (i * 3600000); // Hours ago
      dataPoints.push({
        timestamp,
        successRate: Math.random() * 0.3 + 0.7,
        responseTime: Math.random() * 5 + 2,
        efficiency: Math.random() * 0.4 + 0.6
      });
    }

    return {
      chartType: config.chartType,
      data: dataPoints,
      generated: now
    };
  }

  private async generateMetricData(config: any): Promise<any> {
    const metrics = this.analyticsEngine.getCurrentMetrics();

    return {
      metrics: [
        { label: 'Active Agents', value: metrics.systemHealth.activeAgents, trend: '+5%' },
        { label: 'Completed Tasks', value: metrics.systemHealth.completedTasks, trend: '+12%' },
        { label: 'Success Rate', value: '94.2%', trend: '+2.1%' },
        { label: 'Avg Response Time', value: '3.4s', trend: '-0.8s' }
      ],
      generated: Date.now()
    };
  }

  private async generateInsightData(config: any): Promise<any> {
    const insights = this.analyticsEngine.getInsights();
    const filteredInsights = config.severityFilter === 'all'
      ? insights
      : insights.filter(i => config.severityFilter.includes(i.severity));

    return {
      insights: filteredInsights.slice(0, config.maxInsights || 10),
      generated: Date.now()
    };
  }

  private async generateTimelineData(config: any): Promise<any> {
    const events = [
      { time: Date.now() - 300000, type: 'collaboration', message: 'New collaboration session started' },
      { time: Date.now() - 600000, type: 'task', message: 'High priority task completed by Marketing Agent' },
      { time: Date.now() - 900000, type: 'decision', message: 'Collaborative decision reached on project timeline' },
      { time: Date.now() - 1200000, type: 'insight', message: 'AI detected optimization opportunity' }
    ];

    return {
      events: events.slice(0, 10),
      generated: Date.now()
    };
  }
}