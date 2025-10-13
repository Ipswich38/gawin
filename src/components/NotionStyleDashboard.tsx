'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  Search,
  BarChart3,
  Settings,
  Brain,
  Eye,
  Mic,
  Users,
  Plus,
  ArrowRight,
  Zap,
  Database,
  Activity,
  LogOut,
  User
} from 'lucide-react';
import MobileChatInterface from './MobileChatInterface';
import CreatorAgentPlatform from './CreatorAgentPlatform';
import CreatorDashboard from './CreatorDashboard';
import MCPStatusIndicator from './MCPStatusIndicator';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: 'gawin' | 'agents' | 'analytics' | 'settings';
  isAvailable: boolean;
  isPremium?: boolean;
}

interface NotionStyleDashboardProps {
  user: { full_name?: string; email: string; isCreator?: boolean; credits_remaining?: number };
  onLogout: () => void;
  onBackToLanding: () => void;
}

export default function NotionStyleDashboard({ user, onLogout, onBackToLanding }: NotionStyleDashboardProps) {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isCreator = user.isCreator || user.email === 'kreativloops@gmail.com';

  const dashboardCards: DashboardCard[] = [
    {
      id: 'gawin-chat',
      title: 'Gawin AI Chat',
      description: 'Your intelligent AI assistant for conversations, learning, and problem-solving',
      icon: MessageSquare,
      type: 'gawin',
      isAvailable: true
    },
    {
      id: 'agent-platform',
      title: 'AI Agent Platform',
      description: 'Advanced MCP-integrated agent orchestration and management system',
      icon: Bot,
      type: 'agents',
      isAvailable: isCreator,
      isPremium: true
    },
    {
      id: 'research-suite',
      title: 'Research Suite',
      description: 'Intelligent research tools with real-time analysis and insights',
      icon: Search,
      type: 'gawin',
      isAvailable: true
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and behavioral insights from your interactions',
      icon: BarChart3,
      type: 'analytics',
      isAvailable: isCreator,
      isPremium: true
    },
    {
      id: 'vision-ai',
      title: 'Vision AI',
      description: 'Advanced computer vision and image analysis capabilities',
      icon: Eye,
      type: 'gawin',
      isAvailable: true
    },
    {
      id: 'voice-control',
      title: 'Voice Control',
      description: 'Natural voice interaction and speech recognition system',
      icon: Mic,
      type: 'gawin',
      isAvailable: true
    }
  ];

  const filteredCards = dashboardCards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (cardId: string) => {
    setActiveView(cardId);
  };

  const handleBackToDashboard = () => {
    setActiveView(null);
  };

  // Render active view
  if (activeView) {
    switch (activeView) {
      case 'gawin-chat':
      case 'research-suite':
      case 'vision-ai':
      case 'voice-control':
        return (
          <MobileChatInterface
            user={user}
            onLogout={onLogout}
            onBackToLanding={handleBackToDashboard}
          />
        );
      case 'agent-platform':
        return (
          <div className="min-h-screen bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg font-medium text-gray-900">AI Agent Platform</h1>
              <div className="w-24" />
            </div>
            <CreatorAgentPlatform />
          </div>
        );
      case 'analytics-dashboard':
        return (
          <div className="min-h-screen bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg font-medium text-gray-900">Analytics Dashboard</h1>
              <div className="w-24" />
            </div>
            <CreatorDashboard onClose={handleBackToDashboard} />
          </div>
        );
      default:
        setActiveView(null);
        break;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Gawin</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <MCPStatusIndicator />
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.full_name || user.email}</span>
                {isCreator && (
                  <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded-full">Creator</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.full_name || user.email.split('@')[0]}
          </h2>
          <p className="text-gray-600">
            Choose from your available tools and features below.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`
                  relative group p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300
                  transition-all duration-200 cursor-pointer hover:shadow-sm
                  ${!card.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => card.isAvailable && handleCardClick(card.id)}
              >
                {/* Premium Badge */}
                {card.isPremium && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded-full">
                      <Zap className="w-3 h-3" />
                      Pro
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <card.icon className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-800">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Action Arrow */}
                {card.isAvailable && (
                  <div className="mt-4 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                )}

                {/* Unavailable Overlay */}
                {!card.isAvailable && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-500">
                      {card.isPremium ? 'Creator Access Required' : 'Coming Soon'}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
            <p className="text-gray-600">Try searching for something else.</p>
          </div>
        )}
      </main>
    </div>
  );
}