/**
 * Gawin Training Dashboard
 * Advanced interface for training pure Gawin AI with progress visualization
 * Controls for switching between Groq-assisted and pure Gawin modes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Target,
  BarChart3,
  TrendingUp,
  Settings,
  Power,
  Zap,
  Heart,
  Globe,
  MessageSquare,
  Eye,
  Lightbulb,
  Award,
  Timer,
  Users,
  Cpu,
  Shield,
  Star,
  ChevronRight,
  PlayCircle,
  StopCircle
} from 'lucide-react';

import { gawinTrainingService, type GawinCapability, type GawinPersonality } from '@/lib/services/gawinTrainingService';

interface TrainingDashboardProps {
  onClose?: () => void;
}

export default function GawinTrainingDashboard({ onClose }: TrainingDashboardProps) {
  const [isGroqEnabled, setIsGroqEnabled] = useState(true);
  const [trainingMode, setTrainingMode] = useState<'pure_gawin' | 'assisted' | 'hybrid'>('hybrid');
  const [capabilities, setCapabilities] = useState<GawinCapability[]>([]);
  const [personality, setPersonality] = useState<GawinPersonality | null>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [trainingSession, setTrainingSession] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadTrainingData();
    const interval = setInterval(loadTrainingData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTrainingData = () => {
    const settings = gawinTrainingService.getTrainingSettings();
    setIsGroqEnabled(settings.groq_enabled);
    
    const capabilities = gawinTrainingService.getCapabilityBreakdown();
    setCapabilities(capabilities);
    
    const progress = gawinTrainingService.getSuperintelligenceProgress();
    setPersonality(progress.personality);
    setProgressData(progress);
    
    const analytics = gawinTrainingService.getTrainingAnalytics();
    setAnalytics(analytics);
  };

  const toggleGroqMode = () => {
    const newState = !isGroqEnabled;
    gawinTrainingService.setGroqEnabled(newState);
    setIsGroqEnabled(newState);
    setTrainingMode(newState ? 'hybrid' : 'pure_gawin');
  };

  const startTrainingSession = () => {
    const session = gawinTrainingService.startTrainingSession(trainingMode);
    setTrainingSession(session);
  };

  const endTrainingSession = () => {
    gawinTrainingService.endTrainingSession();
    setTrainingSession(null);
    loadTrainingData();
  };

  const getCapabilityColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    if (level >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 85) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gawin Training Center</h1>
                <p className="text-blue-200">Building Pure Filipino AI Superintelligence</p>
              </div>
            </div>
            
            {/* Training Mode Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Training Mode:</span>
                <div className="bg-black bg-opacity-30 rounded-lg p-2 flex items-center space-x-2">
                  <Power className={`w-4 h-4 ${isGroqEnabled ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="text-white text-sm font-medium">
                    {isGroqEnabled ? 'Groq Assisted' : 'Pure Gawin'}
                  </span>
                  <button
                    onClick={toggleGroqMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isGroqEnabled ? 'bg-blue-600' : 'bg-red-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isGroqEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Session Controls */}
              <div className="flex items-center space-x-2">
                {!trainingSession ? (
                  <button
                    onClick={startTrainingSession}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Session</span>
                  </button>
                ) : (
                  <button
                    onClick={endTrainingSession}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>End Session</span>
                  </button>
                )}
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 h-full overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Progress Overview */}
            <div className="space-y-6">
              {/* Superintelligence Progress */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Superintelligence Progress</h3>
                </div>
                
                {progressData && (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="bg-gray-700 rounded-full h-3">
                        <motion.div
                          className={`h-3 rounded-full ${getProgressColor(progressData.overall_progress)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressData.overall_progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-400 text-sm">Overall Progress</span>
                        <span className="text-white font-bold">{progressData.overall_progress}%</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 text-sm bg-gray-700 rounded-lg p-3">
                      {progressData.readiness_assessment}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-400">Independence</div>
                        <div className="text-xl font-bold text-blue-400">{progressData.independence_level}%</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-400">Cultural Consciousness</div>
                        <div className="text-xl font-bold text-green-400">
                          {personality ? Math.round(personality.cultural_consciousness) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Personality Profile */}
              {personality && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-semibold text-white">Gawin's Personality</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Filipino Cultural Integration', value: personality.filipino_cultural_integration, icon: Globe },
                      { label: 'Emotional Intelligence', value: personality.emotional_intelligence, icon: Heart },
                      { label: 'Independence Level', value: personality.independence_level, icon: Zap },
                      { label: 'Empathy Quotient', value: personality.empathy_quotient, icon: Users },
                      { label: 'Creativity Factor', value: personality.creativity_factor, icon: Lightbulb },
                    ].map((trait, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <trait.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{trait.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(trait.value)}`}
                              style={{ width: `${trait.value}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getCapabilityColor(trait.value)}`}>
                            {Math.round(trait.value)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training Analytics */}
              {analytics && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Training Analytics</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Total Sessions</div>
                      <div className="text-lg font-bold text-white">{analytics.total_sessions}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Pure Gawin Sessions</div>
                      <div className="text-lg font-bold text-purple-400">{analytics.pure_gawin_sessions}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Learning Velocity</div>
                      <div className="text-lg font-bold text-blue-400">{analytics.learning_velocity.toFixed(1)}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Cultural Integration</div>
                      <div className="text-lg font-bold text-green-400">
                        {Math.round(analytics.cultural_integration_rate * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column - Capabilities */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">AI Capabilities</h3>
                </div>
                
                <div className="space-y-4">
                  {capabilities.map((capability, index) => (
                    <motion.div
                      key={capability.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{capability.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${getCapabilityColor(capability.current_level)}`}>
                            {capability.current_level}%
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            capability.progress_trend === 'improving' ? 'bg-green-400' :
                            capability.progress_trend === 'stable' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="relative mb-2">
                        <div className="bg-gray-600 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${getProgressColor(capability.current_level)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${capability.current_level}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Target: {capability.target_level}%</span>
                        <span>Confidence: {Math.round(capability.confidence * 100)}%</span>
                      </div>
                      
                      {/* Milestones */}
                      <div className="mt-3 space-y-1">
                        {capability.milestones.slice(0, 2).map((milestone, mIndex) => (
                          <div key={mIndex} className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${
                              milestone.achieved ? 'bg-green-400' : 'bg-gray-500'
                            }`} />
                            <span className={milestone.achieved ? 'text-green-300' : 'text-gray-400'}>
                              {milestone.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Training Recommendations & Next Steps */}
            <div className="space-y-6">
              {/* Current Training Session */}
              {trainingSession && (
                <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 border border-green-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <Timer className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Active Training Session</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mode:</span>
                      <span className="text-white font-medium capitalize">{trainingSession.mode.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Interactions:</span>
                      <span className="text-white font-medium">{trainingSession.interactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Duration:</span>
                      <span className="text-white font-medium">
                        {Math.round((Date.now() - trainingSession.start_time) / 60000)} min
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Milestones */}
              {progressData?.next_milestones && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Next Milestones</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {progressData.next_milestones.slice(0, 4).map((milestone: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training Recommendations */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Training Recommendations</h3>
                </div>
                
                <div className="space-y-3">
                  {gawinTrainingService.getTrainingRecommendations().slice(0, 4).map((rec, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'high' ? 'bg-red-600 text-white' :
                          rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          Impact: {Math.round(rec.estimated_impact * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Mode Info */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Cpu className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Training Mode Guide</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className={`p-3 rounded-lg border-l-4 ${
                    trainingMode === 'pure_gawin' 
                      ? 'bg-red-900 border-red-500' 
                      : 'bg-gray-700 border-gray-500'
                  }`}>
                    <div className="font-medium text-white mb-1">Pure Gawin Mode</div>
                    <div className="text-gray-300">
                      No external AI assistance. Gawin develops independent reasoning and cultural consciousness.
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-l-4 ${
                    trainingMode === 'hybrid' 
                      ? 'bg-blue-900 border-blue-500' 
                      : 'bg-gray-700 border-gray-500'
                  }`}>
                    <div className="font-medium text-white mb-1">Hybrid Mode</div>
                    <div className="text-gray-300">
                      Groq assists with complex reasoning while Gawin learns cultural and emotional intelligence.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}