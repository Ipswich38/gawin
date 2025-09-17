'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Clock, 
  TrendingUp, 
  Users, 
  Eye, 
  Smartphone,
  Globe,
  Cookie,
  Database,
  Shield,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Heart
} from 'lucide-react';

interface BehavioralPattern {
  type: string;
  frequency: number;
  confidence: number;
  description: string;
  timestamp: number;
}

interface MobileUsageData {
  screenTime: number;
  appUsage: Array<{ app: string; time: number; category: string }>;
  interactionPatterns: Array<{ pattern: string; frequency: number }>;
  emotionalStates: Array<{ state: string; duration: number; triggers: string[] }>;
  conversationTriggers: Array<{ trigger: string; frequency: number; context: string }>;
}

interface PsychologicalProfile {
  personalityTraits: Array<{ trait: string; score: number; confidence: number }>;
  cognitivePatterns: Array<{ pattern: string; strength: number; description: string }>;
  communicationStyle: Array<{ style: string; percentage: number }>;
  learningPreferences: Array<{ preference: string; score: number }>;
  emotionalIntelligence: {
    selfAwareness: number;
    empathy: number;
    socialSkills: number;
    emotionalRegulation: number;
  };
}

export default function BehavioralAnalyticsDashboard() {
  const [behavioralPatterns, setBehavioralPatterns] = useState<BehavioralPattern[]>([]);
  const [mobileUsage, setMobileUsage] = useState<MobileUsageData | null>(null);
  const [psychProfile, setPsychProfile] = useState<PsychologicalProfile | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    generateMockAnalytics();
  }, []);

  const generateMockAnalytics = () => {
    // Generate behavioral patterns
    const patterns: BehavioralPattern[] = [
      {
        type: 'Evening Engagement',
        frequency: 0.78,
        confidence: 0.92,
        description: 'Increased conversational activity between 7-10 PM',
        timestamp: Date.now() - 86400000
      },
      {
        type: 'Research-Driven Sessions',
        frequency: 0.65,
        confidence: 0.87,
        description: 'Tendency to ask follow-up questions and seek detailed explanations',
        timestamp: Date.now() - 172800000
      },
      {
        type: 'Creative Problem Solving',
        frequency: 0.73,
        confidence: 0.84,
        description: 'Prefers collaborative brainstorming over direct instruction',
        timestamp: Date.now() - 259200000
      },
      {
        type: 'Technical Focus',
        frequency: 0.82,
        confidence: 0.95,
        description: 'Heavy emphasis on coding, development, and technical topics',
        timestamp: Date.now() - 345600000
      }
    ];

    // Generate mobile usage data
    const usage: MobileUsageData = {
      screenTime: 8.5,
      appUsage: [
        { app: 'Gawin AI', time: 2.3, category: 'Productivity' },
        { app: 'Code Editor', time: 1.8, category: 'Development' },
        { app: 'Browser', time: 1.4, category: 'Research' },
        { app: 'Terminal', time: 0.9, category: 'Development' },
        { app: 'Communication', time: 0.7, category: 'Social' }
      ],
      interactionPatterns: [
        { pattern: 'Quick burst sessions', frequency: 0.68 },
        { pattern: 'Deep focus periods', frequency: 0.45 },
        { pattern: 'Multi-tasking', frequency: 0.72 },
        { pattern: 'Context switching', frequency: 0.58 }
      ],
      emotionalStates: [
        { state: 'Focused', duration: 180, triggers: ['coding tasks', 'problem solving'] },
        { state: 'Curious', duration: 145, triggers: ['new technologies', 'learning'] },
        { state: 'Creative', duration: 95, triggers: ['brainstorming', 'design'] },
        { state: 'Analytical', duration: 210, triggers: ['debugging', 'optimization'] }
      ],
      conversationTriggers: [
        { trigger: 'Technical challenges', frequency: 0.84, context: 'Seeks detailed solutions' },
        { trigger: 'Learning new concepts', frequency: 0.76, context: 'Prefers step-by-step guidance' },
        { trigger: 'Code optimization', frequency: 0.71, context: 'Values efficiency improvements' },
        { trigger: 'Creative ideation', frequency: 0.63, context: 'Enjoys collaborative thinking' }
      ]
    };

    // Generate psychological profile
    const profile: PsychologicalProfile = {
      personalityTraits: [
        { trait: 'Openness to Experience', score: 87, confidence: 0.91 },
        { trait: 'Conscientiousness', score: 82, confidence: 0.88 },
        { trait: 'Analytical Thinking', score: 91, confidence: 0.94 },
        { trait: 'Creative Problem Solving', score: 79, confidence: 0.85 },
        { trait: 'Technical Curiosity', score: 95, confidence: 0.97 }
      ],
      cognitivePatterns: [
        { pattern: 'Systems Thinking', strength: 0.89, description: 'Views problems holistically' },
        { pattern: 'Pattern Recognition', strength: 0.84, description: 'Quickly identifies recurring themes' },
        { pattern: 'Abstract Reasoning', strength: 0.76, description: 'Comfortable with complex concepts' },
        { pattern: 'Sequential Processing', strength: 0.82, description: 'Prefers structured approaches' }
      ],
      communicationStyle: [
        { style: 'Direct & Concise', percentage: 45 },
        { style: 'Collaborative', percentage: 30 },
        { style: 'Analytical', percentage: 25 }
      ],
      learningPreferences: [
        { preference: 'Hands-on Practice', score: 92 },
        { preference: 'Visual Examples', score: 78 },
        { preference: 'Conceptual Frameworks', score: 85 },
        { preference: 'Peer Interaction', score: 67 }
      ],
      emotionalIntelligence: {
        selfAwareness: 78,
        empathy: 72,
        socialSkills: 69,
        emotionalRegulation: 81
      }
    };

    setBehavioralPatterns(patterns);
    setMobileUsage(usage);
    setPsychProfile(profile);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Behavioral Patterns</p>
              <p className="text-white text-3xl font-bold">{behavioralPatterns.length}</p>
            </div>
            <Brain className="text-purple-400" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Daily Screen Time</p>
              <p className="text-white text-3xl font-bold">{mobileUsage?.screenTime || 0}h</p>
            </div>
            <Smartphone className="text-blue-400" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Pattern Confidence</p>
              <p className="text-white text-3xl font-bold">
                {behavioralPatterns.length > 0 
                  ? Math.round(behavioralPatterns.reduce((sum, p) => sum + p.confidence, 0) / behavioralPatterns.length * 100)
                  : 0}%
              </p>
            </div>
            <Target className="text-green-400" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Emotional States</p>
              <p className="text-white text-3xl font-bold">{mobileUsage?.emotionalStates.length || 0}</p>
            </div>
            <Heart className="text-orange-400" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Behavioral Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Activity size={20} />
          <span>Identified Behavioral Patterns</span>
        </h3>
        
        <div className="space-y-4">
          {behavioralPatterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl"
            >
              <div className="flex-1">
                <h4 className="text-white font-medium">{pattern.type}</h4>
                <p className="text-gray-400 text-sm">{pattern.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-blue-400">Frequency:</span>
                    <div className="w-20 h-2 bg-gray-600 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${pattern.frequency * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(pattern.frequency * 100)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-400">Confidence:</span>
                    <span className="text-xs text-gray-400">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
              <Zap className="text-yellow-400" size={20} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderMobileUsage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mobile Usage Analysis</h2>
      
      {/* App Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">App Usage Breakdown</h3>
          <div className="space-y-3">
            {mobileUsage?.appUsage.map((app, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-white font-medium">{app.app}</span>
                  <span className="text-gray-400 text-sm">({app.category})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${(app.time / (mobileUsage?.screenTime || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{app.time}h</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Interaction Patterns</h3>
          <div className="space-y-4">
            {mobileUsage?.interactionPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white font-medium">{pattern.pattern}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${pattern.frequency * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{Math.round(pattern.frequency * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Emotional States */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Emotional State Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mobileUsage?.emotionalStates.map((state, index) => (
            <div key={index} className="p-4 bg-gray-700/50 rounded-xl">
              <h4 className="text-white font-medium mb-2">{state.state}</h4>
              <p className="text-2xl font-bold text-blue-400 mb-2">{state.duration}min</p>
              <div className="space-y-1">
                {state.triggers.map((trigger, i) => (
                  <span key={i} className="inline-block text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full mr-1">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderPsychProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Psychological Profile</h2>
      
      {/* Personality Traits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Personality Traits</h3>
        <div className="space-y-4">
          {psychProfile?.personalityTraits.map((trait, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white font-medium">{trait.trait}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 h-3 bg-gray-600 rounded-full">
                  <div 
                    className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
                <span className="text-white text-sm w-8">{trait.score}%</span>
                <span className="text-gray-400 text-xs">±{Math.round((1 - trait.confidence) * 10)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emotional Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Emotional Intelligence</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {psychProfile && Object.entries(psychProfile.emotionalIntelligence).map(([key, value], index) => (
            <div key={key} className="text-center p-4 bg-gray-700/30 rounded-xl">
              <div className="text-2xl font-bold text-orange-400 mb-2">{value}%</div>
              <div className="text-sm text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Communication Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Communication Style</h3>
          <div className="space-y-3">
            {psychProfile?.communicationStyle.map((style, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white font-medium">{style.style}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${style.percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{style.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Learning Preferences</h3>
          <div className="space-y-3">
            {psychProfile?.learningPreferences.map((pref, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white font-medium">{pref.preference}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-teal-500 rounded-full"
                      style={{ width: `${pref.score}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{pref.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'mobile', label: 'Mobile Usage', icon: Smartphone },
    { id: 'psychology', label: 'Psychology', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Behavioral Analytics
          </h2>
          <p className="text-gray-400">
            Advanced psychological and behavioral pattern analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Shield size={12} />
            <span>Privacy Protected</span>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-2 border-b border-gray-700/50">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                activeSection === section.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <IconComponent size={16} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="min-h-96">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'mobile' && renderMobileUsage()}
        {activeSection === 'psychology' && renderPsychProfile()}
      </div>
    </div>
  );
}