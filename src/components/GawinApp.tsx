'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  Search,
  MessageSquare,
  Eye,
  Mic,
  Settings,
  Users,
  BarChart3,
  Zap,
  Plus,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Workflow,
  Sparkles,
  Database,
  Globe,
  Code,
  Image as ImageIcon,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { NotionCard, NotionButton, NotionInput, NotionModal, NotionTag } from './ui/NotionUI';
import AgentWorkflowBuilder from './AgentWorkflowBuilder';
import AgentMarketplace from './AgentMarketplace';
import MCPStatusIndicator from './MCPStatusIndicator';

interface User {
  full_name?: string;
  email: string;
  isCreator?: boolean;
  credits_remaining?: number;
}

interface AppSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  isAvailable: boolean;
  isPremium?: boolean;
  component?: React.ComponentType<any>;
}

interface GawinAppProps {
  user: User;
  onLogout: () => void;
}

const GawinApp: React.FC<GawinAppProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(0);

  const isCreator = user.isCreator || user.email === 'kreativloops@gmail.com';

  const appSections: AppSection[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'Overview and quick access',
      icon: Home,
      color: 'gray',
      isAvailable: true
    },
    {
      id: 'chat',
      title: 'AI Chat',
      description: 'Intelligent conversation assistant',
      icon: MessageSquare,
      color: 'blue',
      isAvailable: true
    },
    {
      id: 'workflows',
      title: 'Agent Workflows',
      description: 'Visual agent automation builder',
      icon: Workflow,
      color: 'purple',
      isAvailable: true,
      component: AgentWorkflowBuilder
    },
    {
      id: 'research',
      title: 'Research Suite',
      description: 'Advanced research and analysis',
      icon: Search,
      color: 'green',
      isAvailable: true
    },
    {
      id: 'vision',
      title: 'Vision AI',
      description: 'Image analysis and computer vision',
      icon: Eye,
      color: 'indigo',
      isAvailable: true
    },
    {
      id: 'voice',
      title: 'Voice AI',
      description: 'Speech recognition and synthesis',
      icon: Mic,
      color: 'orange',
      isAvailable: true
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Usage insights and metrics',
      icon: BarChart3,
      color: 'cyan',
      isAvailable: isCreator,
      isPremium: true
    },
    {
      id: 'agents',
      title: 'Agent Platform',
      description: 'MCP-integrated agent management',
      icon: Brain,
      color: 'pink',
      isAvailable: isCreator,
      isPremium: true
    },
    {
      id: 'marketplace',
      title: 'Agent Marketplace',
      description: 'Discover and install AI agents',
      icon: Users,
      color: 'emerald',
      isAvailable: true,
      component: AgentMarketplace
    }
  ];

  const quickActions = [
    { id: 'new-chat', title: 'New Chat', icon: Plus, action: () => setActiveSection('chat') },
    { id: 'new-workflow', title: 'New Workflow', icon: Workflow, action: () => setActiveSection('workflows') },
    { id: 'browse-agents', title: 'Browse Agents', icon: Users, action: () => setActiveSection('marketplace') },
    { id: 'analyze-image', title: 'Analyze Image', icon: Eye, action: () => setActiveSection('vision') }
  ];

  const recentActivities = [
    { id: '1', type: 'chat', title: 'Discussion about AI ethics', time: '2 minutes ago' },
    { id: '2', type: 'workflow', title: 'Content Generation Pipeline', time: '15 minutes ago' },
    { id: '3', type: 'research', title: 'Market Analysis Report', time: '1 hour ago' },
    { id: '4', type: 'vision', title: 'Product Image Analysis', time: '2 hours ago' }
  ];

  const renderHomeContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name || user.email.split('@')[0]}
          </h1>
          <p className="text-gray-600">
            Ready to build something amazing with AI agents?
          </p>
        </div>
        {isCreator && (
          <NotionTag color="purple" className="px-3 py-1">
            <Sparkles className="w-4 h-4 mr-1" />
            Creator Access
          </NotionTag>
        )}
      </div>

      {/* Quick Actions */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <NotionButton
              key={action.id}
              variant="ghost"
              className="flex-col h-24 justify-center"
              onClick={action.action}
            >
              <action.icon className="w-6 h-6 mb-2" />
              <span className="text-sm">{action.title}</span>
            </NotionButton>
          ))}
        </div>
      </NotionCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NotionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{user.credits_remaining || 100}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </NotionCard>

        <NotionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Workflow className="w-8 h-8 text-purple-500" />
          </div>
        </NotionCard>

        <NotionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">127</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </NotionCard>
      </div>

      {/* Recent Activity */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {activity.type === 'chat' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                {activity.type === 'workflow' && <Workflow className="w-5 h-5 text-purple-600" />}
                {activity.type === 'research' && <Search className="w-5 h-5 text-green-600" />}
                {activity.type === 'vision' && <Eye className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </NotionCard>
    </div>
  );

  const renderSectionContent = () => {
    const section = appSections.find(s => s.id === activeSection);

    if (activeSection === 'home') {
      return renderHomeContent();
    }

    if (section?.component) {
      const Component = section.component;
      return <Component />;
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {section?.icon && <section.icon className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{section?.title}</h3>
          <p className="text-gray-600 mb-4">{section?.description}</p>
          <NotionButton variant="secondary">Coming Soon</NotionButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-gray-900">Gawin</h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {appSections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ x: 4 }}
                onClick={() => section.isAvailable && setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                  ${activeSection === section.id
                    ? 'bg-gray-900 text-white'
                    : section.isAvailable
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
                disabled={!section.isAvailable}
              >
                <section.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium">{section.title}</span>
                      {section.isPremium && (
                        <NotionTag color="purple" className="text-xs px-1 py-0.5">
                          Pro
                        </NotionTag>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <MCPStatusIndicator />
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 mt-3">
            <NotionButton
              variant="ghost"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              className={!sidebarOpen ? "w-full" : ""}
            >
              {sidebarOpen ? 'Settings' : ''}
            </NotionButton>
            <NotionButton
              variant="ghost"
              size="sm"
              icon={<LogOut className="w-4 h-4" />}
              onClick={onLogout}
              className={!sidebarOpen ? "w-full" : ""}
            >
              {sidebarOpen ? 'Logout' : ''}
            </NotionButton>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NotionButton
                variant="ghost"
                size="sm"
                icon={sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <h2 className="text-xl font-semibold text-gray-900">
                {appSections.find(s => s.id === activeSection)?.title || 'Gawin'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <NotionInput
                value=""
                onChange={() => {}}
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
                className="w-64"
              />

              <NotionButton
                variant="ghost"
                size="sm"
                icon={<Bell className="w-4 h-4" />}
                className="relative"
              >
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}

              </NotionButton>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default GawinApp;