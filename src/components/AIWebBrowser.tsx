/**
 * AI Web Browser Component
 * Modern AI-powered web browsing experience inspired by:
 * - Perplexity Comet Browser (2025) 
 * - Manus AI browsing capabilities
 * - Anthropic's effective agent patterns
 * 
 * Features:
 * - Autonomous AI web browsing
 * - Transparent reasoning and task execution
 * - Session-based browsing with memory
 * - Real-time progress tracking
 * - Consciousness integration
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { webBrowsingAgent } from '@/lib/agents/webBrowsingAgent';
import type { AgentTask, BrowsingSession, BrowsingFinding } from '@/lib/agents/webBrowsingAgent';
import { intelligentWebScrapingService, type RealTimeSearchResult, type WebSynthesisResult } from '@/lib/services/intelligentWebScrapingService';

interface AIWebBrowserProps {
  userEmail: string;
  onResult?: (result: string) => void;
  onProgress?: (progress: string) => void;
}

export default function AIWebBrowser({ userEmail, onResult, onProgress }: AIWebBrowserProps) {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [goal, setGoal] = useState('');
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [findings, setFindings] = useState<BrowsingFinding[]>([]);
  const [reasoning, setReasoning] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const executionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Enhanced intelligent web browsing with real-time AI synthesis
   */
  const startIntelligentBrowsing = async (sessionId: string, goal: string) => {
    try {
      setProgress('🧠 Starting intelligent web analysis...');
      
      const searchOptions = {
        academicFocus: goal.toLowerCase().includes('research') || goal.toLowerCase().includes('study'),
        realTimeMode: true,
        maxSources: 15,
        includeVisualContent: true,
        synthesisType: 'comprehensive' as const
      };

      // Perform intelligent comprehensive search
      const searchResults = await intelligentWebScrapingService.intelligentComprehensiveSearch(
        goal,
        searchOptions
      );

      setProgress('🎯 Processing intelligent insights...');
      
      // Extract and display intelligent findings
      if (searchResults.length > 0) {
        const intelligentFindings: BrowsingFinding[] = searchResults.flatMap(result => 
          result.sources.map(source => ({
            id: `intelligent-${source.url}`,
            type: 'insight' as const,
            content: `${source.title}\n\n${source.summary}\n\nKey Points:\n${source.keyPoints.map(p => `• ${p}`).join('\n')}`,
            relevance: source.relevanceScore,
            source: source.url,
            timestamp: Date.now()
          }))
        );

        // Update findings with intelligent results
        setFindings(prev => [...intelligentFindings, ...prev]);
        
        // Create intelligent synthesis report
        if (searchResults.length > 0 && searchResults[0].synthesizedInsights) {
          const synthesis = searchResults[0].synthesizedInsights;
          const intelligentSummary = `
🧠 **Intelligent Web Synthesis**

**Key Findings:**
${synthesis.mainThemes.map(theme => `• ${theme}`).join('\n')}

**Expert Consensus:**
${synthesis.consensus.map(point => `• ${point}`).join('\n')}

**Emerging Trends:**
${synthesis.emergingTrends.map(trend => `• ${trend}`).join('\n')}

**Quality Assessment:**
• Sources analyzed: ${intelligentFindings.length}
• High credibility sources: ${intelligentFindings.filter(f => f.relevance > 0.8).length}
• Real-time data integration: ✅

**Search Quality:** ${Math.round(searchResults[0].searchQuality * 100)}%
          `;
          
          setSessionSummary(intelligentSummary);
          
          if (onResult) {
            onResult(intelligentSummary);
          }
        }
      }
      
      setProgress('✨ Intelligent analysis complete - continuing with agent browsing...');
      
    } catch (error) {
      console.error('Intelligent browsing failed:', error);
      setProgress('⚠️ Intelligent analysis encountered issues - proceeding with standard browsing...');
    }
  };

  /**
   * Start a new AI browsing session
   */
  const startBrowsing = async () => {
    if (!goal.trim()) {
      alert('Please describe what you want to find or research.');
      return;
    }

    try {
      setIsActive(true);
      setIsExecuting(true);
      setTasks([]);
      setFindings([]);
      setSessionSummary('');
      
      // Start new session with the web browsing agent
      const sessionId = await webBrowsingAgent.startSession(
        userEmail,
        goal.trim(),
        query.trim() || undefined
      );
      
      setCurrentSession(sessionId);
      setReasoning(`🎯 **Goal**: ${goal}\n\n🤖 **AI Agent**: Starting intelligent web browsing session...`);
      
      if (onProgress) {
        onProgress(`Started AI browsing session for: ${goal}`);
      }
      
      // Enhanced: Start intelligent web browsing with real-time synthesis
      await startIntelligentBrowsing(sessionId, goal.trim());
      
      // Start task execution loop
      startTaskExecution(sessionId);
      startProgressUpdates(sessionId);
      
    } catch (error) {
      console.error('Failed to start browsing session:', error);
      setProgress('❌ Failed to start browsing session');
      setIsExecuting(false);
      setIsActive(false);
    }
  };

  /**
   * Start the task execution loop
   */
  const startTaskExecution = (sessionId: string) => {
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
    }
    
    executionIntervalRef.current = setInterval(async () => {
      try {
        const task = await webBrowsingAgent.executeNextTask(sessionId);
        
        if (task) {
          // Update UI with task progress
          await updateSessionData(sessionId);
          
          if (task.reasoning) {
            setReasoning(prev => prev + `\n\n💭 **Reasoning**: ${task.reasoning}`);
          }
          
          if (task.status === 'completed' && task.result) {
            const progressMsg = `✅ Completed: ${task.description}`;
            setProgress(prev => prev + '\n' + progressMsg);
            
            if (onProgress) {
              onProgress(progressMsg);
            }
          } else if (task.status === 'failed') {
            const errorMsg = `❌ Failed: ${task.description}`;
            setProgress(prev => prev + '\n' + errorMsg);
            
            if (onProgress) {
              onProgress(errorMsg);
            }
          }
        } else {
          // No more pending tasks - finish session
          await finishSession(sessionId);
        }
        
      } catch (error) {
        console.error('Task execution error:', error);
        setProgress(prev => prev + '\n❌ Task execution error');
      }
    }, 2000); // Execute every 2 seconds
  };

  /**
   * Start progress updates
   */
  const startProgressUpdates = (sessionId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(async () => {
      await updateSessionData(sessionId);
    }, 1000); // Update every second
  };

  /**
   * Update session data from the agent
   */
  const updateSessionData = async (sessionId: string) => {
    try {
      const summary = await webBrowsingAgent.getSessionSummary(sessionId);
      
      // Get full session data for UI updates
      const sessions = webBrowsingAgent.getUserSessions(userEmail);
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        setTasks([...session.tasks]);
        setFindings([...session.findings]);
      }
      
    } catch (error) {
      console.error('Failed to update session data:', error);
    }
  };

  /**
   * Finish the browsing session
   */
  const finishSession = async (sessionId: string) => {
    try {
      const summary = await webBrowsingAgent.getSessionSummary(sessionId);
      
      setSessionSummary(summary.summary || 'Browsing session completed.');
      setIsExecuting(false);
      
      // Generate final result
      const resultMessage = `🎯 **Browsing Complete**\n\n${summary.summary || 'No specific findings to report.'}\n\n📊 **Session Stats**: ${summary.completedTasks}/${summary.totalTasks} tasks completed, ${summary.findings.length} findings discovered.`;
      
      if (onResult) {
        onResult(resultMessage);
      }
      
      if (onProgress) {
        onProgress('Browsing session completed successfully');
      }
      
      await webBrowsingAgent.endSession(sessionId);
      
    } catch (error) {
      console.error('Failed to finish session:', error);
    } finally {
      // Clean up intervals
      if (executionIntervalRef.current) {
        clearInterval(executionIntervalRef.current);
        executionIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  /**
   * Stop current session
   */
  const stopBrowsing = async () => {
    if (currentSession) {
      await finishSession(currentSession);
    }
    
    setIsActive(false);
    setCurrentSession(null);
  };

  /**
   * Clear session data
   */
  const clearSession = () => {
    setGoal('');
    setQuery('');
    setTasks([]);
    setFindings([]);
    setReasoning('');
    setProgress('');
    setSessionSummary('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (executionIntervalRef.current) {
        clearInterval(executionIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {!isActive ? (
        // Browsing Setup Interface
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h1 className="text-3xl font-bold">AI Web Browser</h1>
              <p className="text-gray-400">
                Powered by autonomous AI agents • Transparent reasoning • Session memory
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you want to research or find? *
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Example: Find the latest developments in AI web browsing technology, compare different AI models' capabilities, research market trends..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial search query (optional)
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="AI web browsing 2025"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-500"
                />
              </div>

              <button
                onClick={startBrowsing}
                disabled={!goal.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                🚀 Start AI Browsing
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: '🤖',
                  title: 'Autonomous Agents',
                  description: 'AI agents browse and analyze content independently'
                },
                {
                  icon: '💭',
                  title: 'Transparent Reasoning',
                  description: 'See exactly how the AI thinks and makes decisions'
                },
                {
                  icon: '🧠',
                  title: 'Session Memory',
                  description: 'Maintains context across multiple web interactions'
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Active Browsing Interface
        <div className="flex-1 flex flex-col">
          {/* Session Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🌐</span>
                </div>
                <div>
                  <h2 className="font-semibold text-white">AI Browsing Session</h2>
                  <p className="text-sm text-gray-400">Goal: {goal}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isExecuting && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-300">Working...</span>
                  </div>
                )}
                <button
                  onClick={stopBrowsing}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Panel - Tasks & Reasoning */}
            <div className="w-1/2 border-r border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white">Agent Reasoning & Tasks</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Reasoning */}
                {reasoning && (
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{reasoning}</div>
                  </div>
                )}

                {/* Tasks */}
                <div className="space-y-2">
                  {tasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border ${
                        task.status === 'completed' ? 'border-green-600/30 bg-green-600/10' :
                        task.status === 'in_progress' ? 'border-blue-600/30 bg-blue-600/10' :
                        task.status === 'failed' ? 'border-red-600/30 bg-red-600/10' :
                        'border-gray-600/30 bg-gray-600/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                          task.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></span>
                        <span className="text-sm font-medium text-white capitalize">{task.type}</span>
                        <span className="text-xs text-gray-400">{task.priority}</span>
                      </div>
                      <p className="text-sm text-gray-300">{task.description}</p>
                      {task.reasoning && (
                        <p className="text-xs text-gray-400 mt-1 italic">{task.reasoning}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Findings & Progress */}
            <div className="w-1/2 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white">Findings & Progress</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Progress Log */}
                {progress && (
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-2">Progress Log</h4>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{progress}</div>
                  </div>
                )}

                {/* Findings */}
                {findings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Key Findings</h4>
                    {findings
                      .sort((a, b) => b.relevance - a.relevance)
                      .slice(0, 10)
                      .map((finding, idx) => (
                        <motion.div
                          key={finding.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400 capitalize">{finding.type}</span>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                finding.relevance > 0.8 ? 'bg-green-500' :
                                finding.relevance > 0.6 ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-xs text-gray-500">{Math.round(finding.relevance * 100)}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">{finding.content}</p>
                          <p className="text-xs text-gray-500 mt-1">Source: {finding.source}</p>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Session Summary */}
                {sessionSummary && (
                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-300 mb-2">📋 Session Summary</h4>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{sessionSummary}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isActive && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearSession}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}