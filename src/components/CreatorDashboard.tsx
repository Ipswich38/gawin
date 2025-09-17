'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Play, 
  Search, 
  BarChart3, 
  Upload, 
  Download, 
  Settings, 
  Brain, 
  Eye, 
  Mic, 
  FileText,
  Image,
  Video,
  Music,
  Database,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Heart,
  Zap
} from 'lucide-react';

// Import components
import { CreatorTrainingInterface } from './CreatorTrainingInterface';
import IntelligentResearchInterface from './IntelligentResearchInterface';
import EnhancedPlayground from './EnhancedPlayground';
import BehavioralAnalyticsDashboard from './BehavioralAnalyticsDashboard';
import { conversationHistoryService, type ConversationHistory } from '@/lib/services/conversationHistoryService';

interface UsageAnalytics {
  totalConversations: number;
  totalMessages: number;
  averageSessionDuration: number;
  topEmotions: Array<{ emotion: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  dailyUsage: Array<{ date: string; count: number }>;
  behavioralPatterns: Array<{
    pattern: string;
    frequency: number;
    insight: string;
  }>;
}

interface CreatorDashboardProps {
  onClose: () => void;
}

export default function CreatorDashboard({ onClose }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load conversation history from localStorage or API
      const history = loadConversationHistory();
      setConversationHistory(history);
      
      // Generate analytics
      const analyticsData = generateAnalytics(history);
      setAnalytics(analyticsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const loadConversationHistory = (): ConversationHistory[] => {
    return conversationHistoryService.getHistory();
  };

  const generateAnalytics = (history: ConversationHistory[]): UsageAnalytics => {
    const totalConversations = history.length;
    const totalMessages = history.reduce((sum, conv) => sum + conv.messages.length, 0);
    const averageSessionDuration = history.length > 0 
      ? history.reduce((sum, conv) => sum + conv.duration, 0) / history.length 
      : 0;

    // Emotion analysis
    const emotionCounts = new Map<string, number>();
    history.forEach(conv => {
      conv.emotions.forEach(emotion => {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      });
    });
    const topEmotions = Array.from(emotionCounts.entries())
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Topic analysis
    const topicCounts = new Map<string, number>();
    history.forEach(conv => {
      conv.topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });
    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily usage (last 7 days)
    const dailyUsage = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const count = history.filter(conv => {
        const convDate = new Date(conv.timestamp).toISOString().split('T')[0];
        return convDate === date;
      }).length;
      return { date, count };
    }).reverse();

    // Behavioral patterns (mock analysis)
    const behavioralPatterns = [
      { pattern: 'Evening conversations', frequency: 0.7, insight: 'Most active between 6-9 PM' },
      { pattern: 'Research-focused sessions', frequency: 0.4, insight: 'Frequently asks for detailed analysis' },
      { pattern: 'Creative problem solving', frequency: 0.6, insight: 'Prefers collaborative approach' }
    ];

    return {
      totalConversations,
      totalMessages,
      averageSessionDuration,
      topEmotions,
      topTopics,
      dailyUsage,
      behavioralPatterns
    };
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Conversations</p>
              <p className="text-white text-3xl font-bold">{analytics?.totalConversations || 0}</p>
            </div>
            <MessageSquare className="text-blue-400" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Total Messages</p>
              <p className="text-white text-3xl font-bold">{analytics?.totalMessages || 0}</p>
            </div>
            <Brain className="text-green-400" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Avg Session Duration</p>
              <p className="text-white text-3xl font-bold">
                {analytics ? formatDuration(analytics.averageSessionDuration) : '0:00'}
              </p>
            </div>
            <Clock className="text-purple-400" size={32} />
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
              <p className="text-orange-400 text-sm font-medium">Gawin's Growth</p>
              <p className="text-white text-3xl font-bold">
                {analytics ? Math.round(analytics.totalMessages / 10) : 0}%
              </p>
            </div>
            <TrendingUp className="text-orange-400" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Recent Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <MessageSquare size={20} />
          <span>Recent Conversations</span>
        </h3>
        
        <div className="space-y-3">
          {conversationHistory.slice(0, 5).map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{conversation.summary}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(conversation.timestamp).toLocaleString()} • {formatDuration(conversation.duration)}
                </p>
                <div className="flex space-x-2 mt-2">
                  {conversation.emotions.slice(0, 3).map((emotion, i) => (
                    <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-gray-400">
                <MessageSquare size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Conversation History</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              const data = conversationHistoryService.exportHistory('txt');
              const blob = new Blob([data], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `gawin-conversations-${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {conversationHistory.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{conversation.summary}</h3>
                <p className="text-gray-400 text-sm">
                  {new Date(conversation.timestamp).toLocaleString()} • {conversation.messages.length} messages • {formatDuration(conversation.duration)}
                </p>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Download size={16} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {conversation.messages.slice(0, 3).map((message, msgIndex) => (
                <div key={msgIndex} className={`p-3 rounded-xl ${
                  message.role === 'user' 
                    ? 'bg-blue-500/20 text-blue-100' 
                    : 'bg-gray-700/50 text-gray-100'
                }`}>
                  <p className="text-sm">{message.content.substring(0, 200)}...</p>
                </div>
              ))}
              {conversation.messages.length > 3 && (
                <p className="text-gray-400 text-sm text-center">
                  +{conversation.messages.length - 3} more messages
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {conversation.topics.map((topic, i) => (
                <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'history', label: 'Conversations', icon: MessageSquare },
    { id: 'playground', label: 'Playground', icon: Play },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading creator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-gray-400 mt-1">Comprehensive control center for Gawin AI</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-700/50"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700/50 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600/80 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderOverview()}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderHistory()}
              </motion.div>
            )}

            {activeTab === 'playground' && (
              <motion.div
                key="playground"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <EnhancedPlayground />
              </motion.div>
            )}

            {activeTab === 'research' && (
              <motion.div
                key="research"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <IntelligentResearchInterface />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BehavioralAnalyticsDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}