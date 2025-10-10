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
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'agent', message: string, agentId?: string, timestamp: number}>>([]);
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

      // Get agent response
      const response = await orchestrator.getAgentResponse(agentId, message);

      // Add agent response to chat
      const agentMessage = {
        role: 'agent' as const,
        message: response.message,
        agentId: response.agentId,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, agentMessage]);

      setChatMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to communicate with agent');
    }
  };

  const createNewTask = () => {
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      title: 'New Business Task',
      description: 'Define task requirements...',
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      requestedBy: 'creator-001',
      deliverables: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const assignedAgentId = orchestrator.delegateTask(task);
    setTasks(orchestrator.getActiveTasks());

    console.log(`Task assigned to agent: ${assignedAgentId}`);
  };

  // Authentication barriers
  if (accessControl.isInLockdown()) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">🚨 System Lockdown</h1>
          <p>AI Agent Platform is temporarily unavailable</p>
        </div>
      </div>
    );
  }

  if (!accessControl.isCreatorAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">🔒 Restricted Access</h1>
          <p>This platform is exclusively for the creator account</p>
        </div>
      </div>
    );
  }

  if (showActivation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Agent Platform</h2>
            <p className="text-gray-400">Enter activation key to access your business micro-agents</p>
          </div>

          <input
            type="password"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
            placeholder="Activation Key"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleActivation()}
          />

          <button
            onClick={handleActivation}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Activate Platform
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Initializing AI Agent Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/20 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Agent Platform</h1>
                <p className="text-gray-400 text-sm">Kreativ Loops Business Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">Creator Mode Active</p>
                <p className="text-gray-400 text-xs">{agents.length} Active Agents</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-700 bg-black/10">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'agents', label: 'Agents', icon: '🤖' },
              { id: 'tasks', label: 'Tasks', icon: '📋' },
              { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
              { id: 'intelligence', label: 'BI', icon: '🧠' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Enhanced Dashboard Overview with Real-time MCP Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">MCP Agents</p>
                      <p className="text-white text-2xl font-bold">{realTimeMetrics?.systemHealth?.activeAgents || agents.length}</p>
                      <p className="text-blue-300 text-xs">+5 specialist agents</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                      🤖
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">Active Tasks</p>
                      <p className="text-white text-2xl font-bold">{realTimeMetrics?.systemHealth?.totalTasks || tasks.length}</p>
                      <p className="text-green-300 text-xs">{realTimeMetrics?.systemHealth?.completedTasks || 0} completed</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                      📋
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Collaboration</p>
                      <p className="text-white text-2xl font-bold">{realTimeMetrics?.collaborationMetrics?.activeSessions || 3}</p>
                      <p className="text-purple-300 text-xs">{realTimeMetrics?.collaborationMetrics?.messagesSent || 47} messages</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                      🤝
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Business ROI</p>
                      <p className="text-white text-2xl font-bold">{realTimeMetrics?.businessMetrics?.profitability ? (realTimeMetrics.businessMetrics.profitability * 100).toFixed(0) + '%' : '87%'}</p>
                      <p className="text-orange-300 text-xs">+12% this month</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center">
                      💰
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-xl p-6 border border-teal-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-400 text-sm font-medium">AI Insights</p>
                      <p className="text-white text-2xl font-bold">{aiInsights?.length || 0}</p>
                      <p className="text-teal-300 text-xs">{aiInsights?.filter(i => i.severity === 'high').length || 0} high priority</p>
                    </div>
                    <div className="w-12 h-12 bg-teal-500/30 rounded-xl flex items-center justify-center">
                      🧠
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights Panel */}
              {aiInsights && aiInsights.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-lg font-semibold">🧠 AI-Powered Insights</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Real-time</span>
                  </div>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                        insight.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
                        insight.severity === 'high' ? 'bg-orange-500/10 border-orange-500' :
                        insight.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                        'bg-blue-500/10 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                            <p className="text-gray-300 text-xs mt-1">{insight.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                              </span>
                              <span className="text-xs text-gray-400">
                                Impact: {insight.impact.category}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              insight.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              insight.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {insight.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Health Monitor */}
              {systemHealth && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-white text-lg font-semibold mb-4">🔧 System Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-gray-300 text-sm">CPU Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${systemHealth.health?.cpu || 25}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-medium">{systemHealth.health?.cpu?.toFixed(0) || 25}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-gray-300 text-sm">Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${systemHealth.health?.memory || 35}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-medium">{systemHealth.health?.memory?.toFixed(0) || 35}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-gray-300 text-sm">Network</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${systemHealth.health?.network || 85}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-medium">{systemHealth.health?.network?.toFixed(0) || 85}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={createNewTask}
                    className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Create New Task
                  </button>
                  <button className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200">
                    Generate Report
                  </button>
                  <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200">
                    Analyze Performance
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
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white text-2xl font-bold">AI Micro-Agents</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Agent
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {agent.personality.name[0]}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{agent.personality.name}</h3>
                          <p className="text-gray-400 text-sm">{agent.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${agent.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{agent.personality.background}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tasks Completed</span>
                        <span className="text-white">{agent.performanceMetrics.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-green-400">{(agent.performanceMetrics.successRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAgent(agent.id)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Chat with {agent.personality.name}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Add more tabs as needed */}
        </AnimatePresence>
      </div>

      {/* Agent Chat Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {agents.find(a => a.id === selectedAgent)?.personality.name[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{agents.find(a => a.id === selectedAgent)?.personality.name}</h3>
                    <p className="text-gray-400 text-sm">{agents.find(a => a.id === selectedAgent)?.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {chatHistory.filter(msg => !msg.agentId || msg.agentId === selectedAgent).map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && chatMessage.trim() && handleAgentChat(selectedAgent, chatMessage)}
                />
                <button
                  onClick={() => chatMessage.trim() && handleAgentChat(selectedAgent, chatMessage)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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