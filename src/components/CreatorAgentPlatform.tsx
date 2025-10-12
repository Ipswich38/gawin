'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorAccessControl } from '@/lib/agents/security/CreatorAccessControl';
import { AgentOrchestrator } from '@/lib/agents/core/AgentOrchestrator';
import { AgentConfiguration, AgentTask, AgentResponse } from '@/lib/agents/types';
import { BusinessAgentOrchestrator } from '@/lib/agents/business/BusinessAgents';
import { RealTimeCollaborationEngine } from '@/lib/agents/collaboration/RealTimeCollaboration';
import { IntelligentDashboardManager, AdvancedAnalyticsEngine, AIInsight } from '@/lib/agents/dashboard/IntelligentDashboard';
import { MCPAgentFramework } from '@/lib/agents/core/MCPAgentFramework';

const CreatorAgentPlatform: React.FC = () => {
  // Core Systems
  const [accessControl] = useState(() => CreatorAccessControl.getInstance());
  const [orchestrator] = useState(() => new AgentOrchestrator());
  const [businessOrchestrator] = useState(() => new BusinessAgentOrchestrator());
  const [collaborationEngine] = useState(() => new RealTimeCollaborationEngine());
  const [dashboardManager] = useState(() => new IntelligentDashboardManager(new RealTimeCollaborationEngine()));
  const [analyticsEngine] = useState(() => new AdvancedAnalyticsEngine());

  // Authentication & Security
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [activationKey, setActivationKey] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'tasks' | 'collaboration' | 'intelligence' | 'analytics'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedCollaborationSession, setSelectedCollaborationSession] = useState<string | null>(null);

  // Data State
  const [agents, setAgents] = useState<AgentConfiguration[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [businessIntelligence, setBusinessIntelligence] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [collaborationSessions, setCollaborationSessions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Communication State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'agent', message: string, agentId?: string, timestamp: number, isTyping?: boolean, isError?: boolean}>>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializePlatform = async () => {
      console.log('🚀 Initializing Enhanced AI Agent Platform...');
      setIsInitializing(true);

      const checkAuth = () => {
        const hasAccess = accessControl.hasAgentPlatformAccess();
        setIsAuthenticated(hasAccess);

        if (hasAccess) {
          initializeAllSystems();
        } else if (accessControl.isCreatorAuthenticated()) {
          setShowActivation(true);
        }
      };

      checkAuth();

      // Periodic authentication check
      const authInterval = setInterval(checkAuth, 30000); // Every 30 seconds

      return () => clearInterval(authInterval);
    };

    initializePlatform();
  }, [accessControl]);

  const initializeAllSystems = async () => {
    try {
      console.log('🔧 Initializing MCP-powered business agents...');
      await businessOrchestrator.initializeAllAgents();

      console.log('📊 Loading dashboard data...');
      await loadDashboardData();

      console.log('🤝 Setting up collaboration channels...');
      await setupCollaboration();

      console.log('📈 Starting real-time analytics...');
      await startRealTimeAnalytics();

      console.log('🏠 Loading agent data...');
      loadAgentData();

      setIsInitializing(false);
      console.log('✅ Enhanced AI Agent Platform initialized successfully!');
    } catch (error) {
      console.error('❌ Platform initialization failed:', error);
      setIsInitializing(false);
    }
  };

  const loadAgentData = () => {
    setAgents(orchestrator.getActiveAgents());
    setTasks(orchestrator.getActiveTasks());
    setBusinessIntelligence(orchestrator.getBusinessIntelligence());
  };

  const loadDashboardData = async () => {
    try {
      const dashboardData = await dashboardManager.getDashboardData();
      setRealTimeMetrics(dashboardData.metrics);
      setAIInsights(dashboardData.insights);
      setSystemHealth(dashboardData.systemStatus);
      console.log('📊 Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    }
  };

  const setupCollaboration = async () => {
    try {
      // Initialize collaboration connections for all agents
      const allAgents = businessOrchestrator.getAllAgents();
      for (const [agentId] of allAgents) {
        collaborationEngine.initializeAgentConnection(agentId);
      }

      // Set up periodic collaboration stats update
      setInterval(async () => {
        const stats = collaborationEngine.getCollaborationStats();
        // Update collaboration UI state
        console.log('🔄 Collaboration stats updated:', stats);
      }, 10000); // Every 10 seconds

      console.log('🤝 Collaboration system ready');
    } catch (error) {
      console.error('❌ Collaboration setup failed:', error);
    }
  };

  const startRealTimeAnalytics = async () => {
    try {
      // Start real-time metrics collection
      setInterval(async () => {
        const currentMetrics = analyticsEngine.getCurrentMetrics();
        setRealTimeMetrics(currentMetrics);

        // Generate new insights periodically
        const newInsights = await analyticsEngine.generateInsights(
          agents,
          tasks,
          businessIntelligence || { clientProjects: [], businessMetrics: {}, resources: {} }
        );
        setAIInsights(newInsights);
      }, 15000); // Every 15 seconds

      console.log('📈 Real-time analytics started');
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  };

  const handleActivation = () => {
    if (accessControl.activateAgentPlatform(activationKey)) {
      setIsAuthenticated(true);
      setShowActivation(false);
      setActivationKey('');
      loadAgentData();
      accessControl.logSecurityEvent('platform_activated');
    } else {
      alert('Invalid activation key');
    }
  };

  const handleAgentChat = async (agentId: string, message: string) => {
    try {
      accessControl.requireCreatorAccess();

      // Add user message to chat
      const userMessage = {
        role: 'user' as const,
        message,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, userMessage]);

      // Clear input immediately for better UX
      setChatMessage('');

      // Show typing indicator
      const typingMessage = {
        role: 'agent' as const,
        message: 'Agent is processing your request with MCP tools...',
        agentId,
        timestamp: Date.now(),
        isTyping: true
      };
      setChatHistory(prev => [...prev, typingMessage]);

      // Get enhanced agent response with MCP integration
      const response = await orchestrator.getAgentResponse(agentId, message);

      // Remove typing indicator and add real response
      setChatHistory(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          role: 'agent' as const,
          message: response.message,
          agentId: response.agentId,
          timestamp: Date.now()
        }];
      });

      // Update agent performance metrics
      loadAgentData(); // Refresh agent data to show updated metrics

    } catch (error) {
      console.error('Enhanced chat error:', error);
      setChatHistory(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          role: 'agent' as const,
          message: 'I apologize, but I encountered an error processing your request. Please try again.',
          agentId,
          timestamp: Date.now(),
          isError: true
        }];
      });
    }
  };

  const createNewTask = async () => {
    try {
      // Create intelligent task with MCP-powered auto-completion
      const task: AgentTask = {
        id: `task-${Date.now()}`,
        title: 'MCP-Enhanced Business Task',
        description: 'AI-generated task based on current business context and real-time data analysis...',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
        requestedBy: 'creator-001',
        deliverables: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Use MCP-enhanced delegation
      const assignedAgentId = orchestrator.delegateTask(task);
      setTasks(orchestrator.getActiveTasks());

      // Log with enhanced context
      console.log(`🗂️ MCP-Enhanced task assigned to agent: ${assignedAgentId}`);

      // Trigger real-time analytics update
      await startRealTimeAnalytics();

    } catch (error) {
      console.error('❌ Task creation failed:', error);
    }
  };

  // Authentication barriers
  if (accessControl.isInLockdown()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-lg sm:text-2xl font-medium mb-4">🚨 System Lockdown</h1>
          <p className="text-sm sm:text-base text-gray-400">Platform temporarily unavailable</p>
        </div>
      </div>
    );
  }

  if (!accessControl.isCreatorAuthenticated()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-lg sm:text-2xl font-medium mb-4">🔒 Restricted Access</h1>
          <p className="text-sm sm:text-base text-gray-400">Creator account only</p>
        </div>
      </div>
    );
  }

  if (showActivation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border border-gray-800 p-6 sm:p-8 rounded-lg max-w-sm w-full"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg sm:text-2xl">🤖</span>
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-white mb-2">AI Agent Platform</h2>
            <p className="text-gray-400 text-sm">Enter activation key for MCP agents</p>
          </div>

          <input
            type="password"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
            placeholder="Activation Key"
            className="w-full px-4 py-3 bg-white/10 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white mb-4 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleActivation()}
          />

          <button
            onClick={handleActivation}
            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
          >
            Activate Platform
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Initializing MCP Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm sm:text-lg font-bold">🤖</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-medium text-white">AI Agent Platform</h1>
                <p className="text-gray-400 text-xs sm:text-sm">MCP-Powered Intelligence</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-medium text-white">Agents</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <p className="text-white font-medium text-xs sm:text-sm">Live</p>
                <p className="text-gray-400 text-xs">{agents.length} Active</p>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Navigation */}
      <div className="border-b border-gray-800 bg-black">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', shortLabel: 'Dash' },
              { id: 'agents', label: 'Agents', icon: '🤖', shortLabel: 'Agents' },
              { id: 'tasks', label: 'Tasks', icon: '📋', shortLabel: 'Tasks' },
              { id: 'collaboration', label: 'Collaboration', icon: '🤝', shortLabel: 'Collab' },
              { id: 'intelligence', label: 'Intelligence', icon: '🧠', shortLabel: 'Intel' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile-First Main Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Real-time MCP Status Bar */}
              <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs sm:text-sm font-medium">MCP Protocol Active</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{realTimeMetrics?.mcpConnections || 12} Tools</span>
                    <span>{realTimeMetrics?.mcpLatency || 45}ms</span>
                    <span className="text-green-400">99.9% Uptime</span>
                  </div>
                </div>
              </div>

              {/* Mobile-First MCP Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">MCP Agents</p>
                      <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.systemHealth?.activeAgents || agents.length}</p>
                      <p className="text-gray-400 text-xs">+5 specialist</p>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0">
                      <span className="text-xs sm:text-sm">🤖</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">Active Tasks</p>
                      <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.systemHealth?.totalTasks || tasks.length}</p>
                      <p className="text-gray-400 text-xs">{realTimeMetrics?.systemHealth?.completedTasks || 0} done</p>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0">
                      <span className="text-xs sm:text-sm">📋</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">Collaboration</p>
                      <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.collaborationMetrics?.activeSessions || 3}</p>
                      <p className="text-gray-400 text-xs">{realTimeMetrics?.collaborationMetrics?.messagesSent || 47} msgs</p>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0">
                      <span className="text-xs sm:text-sm">🤝</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">Business ROI</p>
                      <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.businessMetrics?.profitability ? (realTimeMetrics.businessMetrics.profitability * 100).toFixed(0) + '%' : '87%'}</p>
                      <p className="text-gray-400 text-xs">+12% month</p>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0">
                      <span className="text-xs sm:text-sm">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">AI Insights</p>
                      <p className="text-white text-lg sm:text-xl font-bold">{aiInsights?.length || 0}</p>
                      <p className="text-gray-400 text-xs">{aiInsights?.filter(i => i.severity === 'high').length || 0} priority</p>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0">
                      <span className="text-xs sm:text-sm">🧠</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-First AI Insights Panel */}
              {aiInsights && aiInsights.length > 0 && (
                <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-sm sm:text-lg font-medium">🧠 AI Insights</h3>
                    <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="p-3 sm:p-4 rounded-lg border border-gray-800 bg-black">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-xs sm:text-sm">{insight.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                                {(insight.confidence * 100).toFixed(0)}%
                              </span>
                              <span className="text-xs text-gray-400">
                                {insight.impact.category}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-white">
                              {insight.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile-First System Health */}
              {systemHealth && (
                <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white text-sm sm:text-lg font-medium mb-4">🔧 System Health</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-xs sm:text-sm">CPU</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${systemHealth.health?.cpu || 25}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium">{systemHealth.health?.cpu?.toFixed(0) || 25}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-xs sm:text-sm">Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${systemHealth.health?.memory || 35}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium">{systemHealth.health?.memory?.toFixed(0) || 35}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-xs sm:text-sm">Network</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${systemHealth.health?.network || 85}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium">{systemHealth.health?.network?.toFixed(0) || 85}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile-First Quick Actions with MCP Integration */}
              <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-white text-sm sm:text-lg font-medium mb-4">MCP-Powered Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={createNewTask}
                    className="p-3 sm:p-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Smart Task</span>
                  </button>
                  <button
                    onClick={async () => {
                      const report = await analyticsEngine.generateInsights(agents, tasks, businessIntelligence || { clientProjects: [], businessMetrics: {}, resources: {} });
                      console.log('📊 MCP-Generated Report:', report);
                    }}
                    className="p-3 sm:p-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    <span>📊</span>
                    <span>AI Report</span>
                  </button>
                  <button
                    onClick={async () => {
                      await loadDashboardData();
                      console.log('🔄 Real-time data refreshed');
                    }}
                    className="p-3 sm:p-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    <span>⚡</span>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg sm:text-2xl font-medium">AI Micro-Agents</h2>
                <button className="px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium">
                  Add Agent
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {agent.personality.name[0]}
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm sm:text-base">{agent.personality.name}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm">{agent.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${agent.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>

                    <p className="text-gray-400 text-xs sm:text-sm mb-4">{agent.personality.background}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Tasks</span>
                        <span className="text-white">{agent.performanceMetrics.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Success</span>
                        <span className="text-white">{(agent.performanceMetrics.successRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAgent(agent.id)}
                      className="w-full py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                    >
                      Chat with {agent.personality.name}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg sm:text-2xl font-medium">Active Tasks</h2>
                <button
                  onClick={createNewTask}
                  className="px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  New Task
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {tasks.length === 0 ? (
                  <div className="bg-black border border-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 text-sm">No active tasks. Create your first MCP-powered task!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm sm:text-base mb-1">{task.title}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Priority: {task.priority}</span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'collaboration' && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2 className="text-white text-lg sm:text-2xl font-medium">Agent Collaboration</h2>

              <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-white text-sm sm:text-lg font-medium mb-4">Real-time Collaboration Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.collaborationMetrics?.activeSessions || 3}</p>
                    <p className="text-gray-400 text-xs">Active Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.collaborationMetrics?.messagesSent || 47}</p>
                    <p className="text-gray-400 text-xs">Messages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-lg sm:text-xl font-bold">{realTimeMetrics?.collaborationMetrics?.tasksShared || 12}</p>
                    <p className="text-gray-400 text-xs">Shared Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-lg sm:text-xl font-bold">98%</p>
                    <p className="text-gray-400 text-xs">Sync Rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-white text-sm sm:text-lg font-medium mb-4">MCP Collaboration Network</h3>
                <div className="space-y-3">
                  {agents.slice(0, 3).map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {agent.personality.name[0]}
                        </div>
                        <div>
                          <p className="text-white text-xs sm:text-sm font-medium">{agent.personality.name}</p>
                          <p className="text-gray-400 text-xs">Collaborating on {Math.floor(Math.random() * 5) + 1} tasks</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'intelligence' && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2 className="text-white text-lg sm:text-2xl font-medium">Business Intelligence</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white text-sm sm:text-lg font-medium mb-4">📊 Performance Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Task Completion Rate</span>
                      <span className="text-white text-sm font-medium">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Agent Efficiency</span>
                      <span className="text-white text-sm font-medium">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">MCP Tool Usage</span>
                      <span className="text-white text-sm font-medium">156 calls/day</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white text-sm sm:text-lg font-medium mb-4">🚀 Business Growth</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Revenue Impact</span>
                      <span className="text-white text-sm font-medium">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Cost Reduction</span>
                      <span className="text-white text-sm font-medium">-18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Time Saved</span>
                      <span className="text-white text-sm font-medium">34 hrs/week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Business Insights */}
              {businessIntelligence && (
                <div className="bg-black border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white text-sm sm:text-lg font-medium mb-4">🧠 Real-time Business Context</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">{businessIntelligence.clientProjects?.length || 0}</p>
                      <p className="text-gray-400 text-xs">Active Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">{Object.keys(businessIntelligence.resources || {}).length}</p>
                      <p className="text-gray-400 text-xs">Available Resources</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">Live</p>
                      <p className="text-gray-400 text-xs">Data Status</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile-First Agent Chat Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-black border-t border-gray-800 sm:border sm:rounded-lg w-full sm:max-w-2xl h-[90vh] sm:max-h-[80vh] flex flex-col"
          >
            {/* Mobile-First Chat Header */}
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {agents.find(a => a.id === selectedAgent)?.personality.name[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm sm:text-base">{agents.find(a => a.id === selectedAgent)?.personality.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{agents.find(a => a.id === selectedAgent)?.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile-First Chat Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-3 sm:space-y-4">
                {chatHistory.filter(msg => !msg.agentId || msg.agentId === selectedAgent).map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile-First Chat Input */}
            <div className="p-4 sm:p-6 border-t border-gray-800">
              <div className="flex space-x-2 sm:space-x-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && chatMessage.trim() && handleAgentChat(selectedAgent, chatMessage)}
                />
                <button
                  onClick={() => chatMessage.trim() && handleAgentChat(selectedAgent, chatMessage)}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreatorAgentPlatform;