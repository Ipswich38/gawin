'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { autonomousAgent } from '@/lib/agent/AutonomousAgentCore';
import type { Goal, ProactiveSuggestion } from '@/lib/agent/AutonomousAgentCore';

interface PlanStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
  dependencies?: string[];
}

interface AgentPlan {
  id: string;
  title: string;
  description: string;
  objective: string;
  steps: PlanStep[];
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: Date;
  progress: number;
}

export default function GAPMode() {
  const [plans, setPlans] = useState<AgentPlan[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AgentPlan | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [plans, currentPlan]);

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

  const generatePlan = async () => {
    if (!inputValue.trim() || isPlanning) return;

    const objective = inputValue.trim();
    setInputValue('');
    setIsPlanning(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    // Create new plan entry
    const newPlan: AgentPlan = {
      id: Date.now().toString(),
      title: objective.substring(0, 50) + (objective.length > 50 ? '...' : ''),
      description: objective,
      objective,
      steps: [],
      timeline: 'Analyzing...',
      priority: 'medium',
      status: 'draft',
      createdAt: new Date(),
      progress: 0
    };

    setCurrentPlan(newPlan);

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
        const completedPlan: AgentPlan = {
          ...newPlan,
          title: data.title,
          steps: data.steps,
          timeline: data.timeline,
          priority: data.priority,
          status: 'draft'
        };

        setCurrentPlan(null);
        setPlans(prev => [...prev, completedPlan]);
      } else {
        throw new Error(data.error || 'Planning failed');
      }
    } catch (error) {
      console.error('GAP Planning error:', error);
      const errorPlan: AgentPlan = {
        ...newPlan,
        title: 'Planning Error',
        steps: [{
          id: 'error',
          title: 'Planning Failed',
          description: 'An error occurred while generating the plan',
          status: 'pending',
          estimatedTime: 'Unknown'
        }],
        timeline: 'Error occurred',
        status: 'draft'
      };

      setCurrentPlan(null);
      setPlans(prev => [...prev, errorPlan]);
    } finally {
      setIsPlanning(false);
    }
  };

  const activatePlan = async (plan: AgentPlan) => {
    console.log('🚀 Activating plan:', plan.title);

    // Convert plan to autonomous goal
    try {
      await autonomousAgent.setGoal('default_user', plan.objective, plan.priority);

      // Update plan status
      const updatedPlans = plans.map(p =>
        p.id === plan.id ? { ...p, status: 'active' as const } : p
      );
      setPlans(updatedPlans);

      loadAgentData(); // Refresh agent data

      console.log('✅ Plan activated and converted to autonomous goal');
    } catch (error) {
      console.error('❌ Failed to activate plan:', error);
    }
  };

  const pausePlan = (planId: string) => {
    const updatedPlans = plans.map(p =>
      p.id === planId ? { ...p, status: 'paused' as const } : p
    );
    setPlans(updatedPlans);
  };

  const resumePlan = (planId: string) => {
    const updatedPlans = plans.map(p =>
      p.id === planId ? { ...p, status: 'active' as const } : p
    );
    setPlans(updatedPlans);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generatePlan();
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
            <p className="text-xs text-gray-400">Gawin Agent Planner</p>
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          AI-powered strategic planning
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {plans.length === 0 && !currentPlan ? (
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
                Gawin Agent Planner creates comprehensive, step-by-step plans for any objective.
                Simply describe what you want to accomplish, and I'll break it down into actionable steps.
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
                      {suggestions.length} proactive suggestion(s) available
                    </p>
                  )}
                </motion.div>
              )}

              {/* Completed Plans */}
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg mb-2">{plan.title}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(plan.priority)}`}>
                          {plan.priority}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {plan.timeline}
                        </span>
                      </div>
                    </div>

                    {/* Plan Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {plan.status === 'draft' && (
                        <button
                          onClick={() => activatePlan(plan)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
                        >
                          🚀 Activate
                        </button>
                      )}
                      {plan.status === 'active' && (
                        <button
                          onClick={() => pausePlan(plan.id)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors"
                        >
                          ⏸️ Pause
                        </button>
                      )}
                      {plan.status === 'paused' && (
                        <button
                          onClick={() => resumePlan(plan.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                        >
                          ▶️ Resume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plan Steps */}
                  {plan.steps.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-gray-300 font-medium text-sm">📋 Implementation Steps</h4>
                      {plan.steps.map((step, index) => (
                        <div key={step.id} className="flex gap-3 bg-gray-700/30 p-3 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white text-sm font-medium">{step.title}</h5>
                            <p className="text-gray-400 text-xs mt-1">{step.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                step.status === 'completed'
                                  ? 'bg-green-900/50 text-green-300'
                                  : step.status === 'in_progress'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {step.status.replace('_', ' ')}
                              </span>
                              <span className="text-gray-500 text-xs">
                                Est. {step.estimatedTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Current Plan in Progress */}
              {currentPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-purple-500/30"
                >
                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg mb-2">Plan Generation in Progress</h3>
                    <p className="text-purple-300 bg-purple-900/20 p-3 rounded-lg">{currentPlan.objective}</p>
                  </div>

                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Analyzing and creating strategic plan...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Planning Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end gap-3 bg-gray-800 rounded-full border border-purple-500/30 p-4 transition-all duration-200 hover:border-purple-500/50 focus-within:border-purple-500/70">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe your objective and I'll create a comprehensive plan..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none border-none min-h-[48px] leading-6 focus:outline-none focus:ring-0 focus:border-none"
            style={{
              height: '48px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            disabled={isPlanning}
          />
          <button
            onClick={generatePlan}
            disabled={isPlanning || !inputValue.trim()}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputValue.trim() && !isPlanning
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