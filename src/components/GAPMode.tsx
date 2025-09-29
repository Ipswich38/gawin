'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { autonomousAgent } from '@/lib/agent/AutonomousAgentCore';
import type { Goal, ProactiveSuggestion } from '@/lib/agent/AutonomousAgentCore';

interface GAPResult {
  id: string;
  title: string;
  objective: string;
  methodology: string;
  content: string;
  keyPoints: string[];
  actionItems: string[];
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: Date;
}

export default function GAPMode() {
  const [results, setResults] = useState<GAPResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<GAPResult | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [results, currentAnalysis]);

  useEffect(() => {
    loadAgentData();
    // Refresh data periodically
    const interval = setInterval(loadAgentData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAgentData = () => {
    const goals = autonomousAgent.getActiveGoals('default_user');
    const agentSuggestions = autonomousAgent.getProactiveSuggestions('default_user');

    setActiveGoals(goals);
    setSuggestions(agentSuggestions);
  };

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 48;
      const maxHeight = 144;
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const convertToGoal = async (result: GAPResult) => {
    console.log('🎯 Converting GAP result to autonomous goal:', result.title);

    try {
      await autonomousAgent.setGoal('default_user', `Execute: ${result.objective}`, result.priority);

      const updatedResults = results.map(r =>
        r.id === result.id ? { ...r, status: 'active' as const } : r
      );
      setResults(updatedResults);

      loadAgentData();
      console.log('✅ GAP result converted to autonomous goal successfully');
    } catch (error) {
      console.error('❌ Failed to convert GAP result to goal:', error);
    }
  };

  const executeGAP = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const objective = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    // Create new analysis entry
    const newAnalysis: GAPResult = {
      id: Date.now().toString(),
      title: 'Comprehensive Analysis in Progress',
      objective,
      methodology: 'GAP Strategic Analysis',
      content: 'Processing your request using GAP methodology...',
      keyPoints: [],
      actionItems: [],
      timeline: 'Processing...',
      priority: 'medium',
      status: 'draft',
      createdAt: new Date()
    };

    setCurrentAnalysis(newAnalysis);

    try {
      const response = await fetch('/api/gap-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objective: objective
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const completedAnalysis: GAPResult = {
          ...newAnalysis,
          title: data.title,
          methodology: data.methodology,
          content: data.content,
          keyPoints: data.keyPoints,
          actionItems: data.actionItems,
          timeline: data.timeline,
          priority: data.priority,
          status: 'draft'
        };

        setCurrentAnalysis(null);
        setResults(prev => [...prev, completedAnalysis]);
      } else {
        throw new Error(data.error || 'GAP analysis failed');
      }
    } catch (error) {
      console.error('GAP Analysis error:', error);
      const errorAnalysis: GAPResult = {
        ...newAnalysis,
        title: 'Analysis Error',
        content: 'An error occurred while conducting the GAP analysis. Please try again.',
        keyPoints: ['Technical error encountered'],
        actionItems: ['Retry the analysis request'],
        timeline: 'Error occurred'
      };

      setCurrentAnalysis(null);
      setResults(prev => [...prev, errorAnalysis]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeGAP();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'low': return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      case 'draft': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* GAP Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎯</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">GAP Mode</h2>
            <p className="text-xs text-gray-400">Gawin Agent Planner - Comprehensive Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          {activeGoals.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{activeGoals.length} goal(s) active</span>
            </div>
          )}
          <span>Strategic & comprehensive</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {results.length === 0 && !currentAnalysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-white text-lg font-medium mb-2">
                Welcome to GAP Mode!
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Gawin Agent Planner delivers comprehensive, actionable analysis using strategic methodology.
                Describe what you need accomplished, and I'll provide thorough, immediately usable results.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Agent Integration Status */}
              {(activeGoals.length > 0 || suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 rounded-xl p-4 border border-green-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-400">🤖</span>
                    <h4 className="text-green-400 font-medium">Agent Integration Active</h4>
                  </div>
                  {activeGoals.length > 0 && (
                    <p className="text-gray-300 text-sm">
                      {activeGoals.length} autonomous goal(s) running in background
                    </p>
                  )}
                  {suggestions.length > 0 && (
                    <p className="text-gray-300 text-sm">
                      {suggestions.length} strategic insight(s) available
                    </p>
                  )}
                </motion.div>
              )}

              {/* Completed Analysis Results */}
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  {/* Result Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg mb-2">{result.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{result.objective}</p>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(result.priority)}`}>
                          {result.priority}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timeline}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => convertToGoal(result)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                        title="Convert to autonomous goal"
                      >
                        🤖 Activate
                      </button>
                    </div>
                  </div>

                  {/* Methodology */}
                  {result.methodology && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">🔍 Methodology</h4>
                      <p className="text-gray-400 text-sm">{result.methodology}</p>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="mb-4">
                    <h4 className="text-gray-300 font-medium mb-3">📋 Comprehensive Analysis</h4>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                        {result.content}
                      </pre>
                    </div>
                  </div>

                  {/* Key Points */}
                  {result.keyPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">🎯 Key Points</h4>
                      <ul className="space-y-1">
                        {result.keyPoints.map((point, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {result.actionItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">⚡ Action Items</h4>
                      <ul className="space-y-1">
                        {result.actionItems.map((action, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                    Analysis completed at {result.createdAt.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}

              {/* Current Analysis in Progress */}
              {currentAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-purple-500/30"
                >
                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg mb-2">GAP Analysis in Progress</h3>
                    <p className="text-purple-300 bg-purple-900/20 p-3 rounded-lg">{currentAnalysis.objective}</p>
                  </div>

                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Conducting comprehensive strategic analysis...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* GAP Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end gap-3 bg-gray-800 rounded-full border border-purple-500/30 p-4 transition-all duration-200 hover:border-purple-500/50 focus-within:border-purple-500/70">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you need comprehensive analysis for. I'll deliver complete, actionable results..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none border-none min-h-[48px] leading-6 focus:outline-none focus:ring-0 focus:border-none"
            style={{
              height: '48px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            disabled={isProcessing}
          />
          <button
            onClick={executeGAP}
            disabled={isProcessing || !inputValue.trim()}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputValue.trim() && !isProcessing
                ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">🎯</span>
          </button>
        </div>
      </div>
    </div>
  );
}