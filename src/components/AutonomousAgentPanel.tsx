'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { autonomousAgent } from '@/lib/agent/AutonomousAgentCore';
import type { Goal, ProactiveSuggestion } from '@/lib/agent/AutonomousAgentCore';

interface Props {
  userId: string;
  isVisible: boolean;
  onToggle: () => void;
}

export default function AutonomousAgentPanel({ userId, isVisible, onToggle }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadAgentData();

      // Refresh data periodically
      const interval = setInterval(loadAgentData, 10000);
      return () => clearInterval(interval);
    }
  }, [isVisible, userId]);

  const loadAgentData = () => {
    const activeGoals = autonomousAgent.getActiveGoals(userId);
    const currentSuggestions = autonomousAgent.getProactiveSuggestions(userId);

    setGoals(activeGoals);
    setSuggestions(currentSuggestions);
  };

  const handleSetGoal = async () => {
    if (!newGoal.trim()) return;

    setIsThinking(true);
    try {
      await autonomousAgent.setGoal(userId, newGoal.trim(), 'medium');
      setNewGoal('');
      loadAgentData(); // Refresh the UI
    } catch (error) {
      console.error('Failed to set goal:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handlePauseGoal = (goalId: string) => {
    autonomousAgent.pauseGoal(goalId);
    loadAgentData();
  };

  const handleResumeGoal = (goalId: string) => {
    autonomousAgent.resumeGoal(goalId);
    loadAgentData();
  };

  const handleAcceptSuggestion = async (suggestion: ProactiveSuggestion) => {
    console.log('🤖 Accepting suggestion:', suggestion.title);

    // Convert suggestion to a goal
    try {
      await autonomousAgent.setGoal(userId, suggestion.title, 'medium');

      // Remove the suggestion from the list
      autonomousAgent.removeSuggestion(userId, suggestion.id);

      loadAgentData(); // Refresh the UI

      console.log('✅ Suggestion accepted and converted to goal');
    } catch (error) {
      console.error('❌ Failed to accept suggestion:', error);
    }
  };

  const handleDismissSuggestion = (suggestion: ProactiveSuggestion) => {
    console.log('🗑️ Dismissing suggestion:', suggestion.title);

    // Remove the suggestion from the list
    autonomousAgent.removeSuggestion(userId, suggestion.id);

    loadAgentData(); // Refresh the UI

    console.log('✅ Suggestion dismissed');
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        title="Open Autonomous Agent"
      >
        <div className="relative">
          🤖
          {/* Thinking indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">Autonomous Agent</h2>
            <p className="text-xs text-gray-400">10/10 Agent System</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status Indicator */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Agent Active & Thinking</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Continuously analyzing, planning, and executing tasks autonomously
          </p>
        </div>

        {/* Goal Setting */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">🎯 Set New Goal</h3>
          <div className="space-y-2">
            <textarea
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Describe what you want me to accomplish autonomously..."
              className="w-full bg-gray-800 text-white text-sm p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleSetGoal}
              disabled={!newGoal.trim() || isThinking}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                newGoal.trim() && !isThinking
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isThinking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  Planning...
                </div>
              ) : (
                'Set Autonomous Goal'
              )}
            </button>
          </div>
        </div>

        {/* Active Goals */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">🎯 Active Goals ({goals.length})</h3>

          {goals.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              No active goals. Set one above to see autonomous execution in action!
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">{goal.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">{goal.description}</p>

                      {/* Status */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          goal.status === 'in_progress'
                            ? 'bg-blue-900/50 text-blue-300'
                            : goal.status === 'completed'
                            ? 'bg-green-900/50 text-green-300'
                            : goal.status === 'paused'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          goal.priority === 'critical'
                            ? 'bg-red-900/50 text-red-300'
                            : goal.priority === 'high'
                            ? 'bg-orange-900/50 text-orange-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {goal.priority}
                        </span>
                      </div>

                      {/* Progress */}
                      {goal.steps.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {goal.steps.filter(s => s.status === 'completed').length} / {goal.steps.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${(goal.steps.filter(s => s.status === 'completed').length / goal.steps.length) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 ml-2">
                      {goal.status === 'in_progress' && (
                        <button
                          onClick={() => handlePauseGoal(goal.id)}
                          className="p-1 text-yellow-400 hover:text-yellow-300 text-xs"
                          title="Pause goal"
                        >
                          ⏸️
                        </button>
                      )}
                      {goal.status === 'paused' && (
                        <button
                          onClick={() => handleResumeGoal(goal.id)}
                          className="p-1 text-green-400 hover:text-green-300 text-xs"
                          title="Resume goal"
                        >
                          ▶️
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Proactive Suggestions */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">💡 Proactive Insights ({suggestions.length})</h3>

          {suggestions.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Agent is analyzing patterns to provide proactive suggestions...
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs mt-0.5">
                      {suggestion.type === 'insight' ? '🔍' :
                       suggestion.type === 'opportunity' ? '⚡' :
                       suggestion.type === 'improvement' ? '🔧' : '💡'}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-blue-300 text-sm font-medium">{suggestion.title}</h4>
                      <p className="text-gray-300 text-xs mt-1">{suggestion.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-blue-400 text-xs">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDismissSuggestion(suggestion)}
                            className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 rounded border border-gray-500/30 hover:border-gray-500/50 transition-colors hover:bg-gray-500/10"
                            title="Dismiss suggestion"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30 hover:border-blue-500/50 transition-colors hover:bg-blue-500/10"
                            title="Accept and create goal"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Capabilities */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">🛠️ Agent Capabilities</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Autonomous Research', status: 'active' },
              { name: 'Pattern Analysis', status: 'active' },
              { name: 'Goal Planning', status: 'active' },
              { name: 'Proactive Insights', status: 'active' },
              { name: 'Task Execution', status: 'active' },
              { name: 'Learning Loop', status: 'active' }
            ].map((capability) => (
              <div key={capability.name} className="bg-gray-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-xs">{capability.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">
          🤖 True Autonomous Agent • Always Learning & Improving
        </p>
      </div>
    </motion.div>
  );
}