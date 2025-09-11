'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MessageRenderer from './MessageRenderer';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Tab {
  id: string;
  type: 'general' | 'code' | 'quiz' | 'study' | 'creative';
  title: string;
  icon: string;
  color: string;
  isActive: boolean;
  messages: Message[];
  isLoading: boolean;
}

interface ModernChatInterfaceProps {
  user: { full_name?: string; email: string };
  onLogout: () => void;
  onBackToLanding: () => void;
}

const suggestionPrompts = [
  { text: "EXPLAIN CALCULUS", icon: "∫", category: "Math" },
  { text: "CODE REVIEW", icon: "</>" , category: "Programming"},
  { text: "ESSAY HELP", icon: "✒️", category: "Writing" },
  { text: "CHEMISTRY Q&A", icon: "⚗️", category: "Science" },
  { text: "STUDY PLAN", icon: "📚", category: "Planning" },
  { text: "LANGUAGE PRACTICE", icon: "🌍", category: "Languages" }
];


export default function ModernChatInterface({ user, onLogout, onBackToLanding }: ModernChatInterfaceProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'general-1',
      type: 'general',
      title: 'General Chat',
      icon: '💬',
      color: 'bg-stone-600',
      isActive: true,
      messages: [],
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('general-1');
  const [codeContent, setCodeContent] = useState('');
  const [showCodeWorkspace, setShowCodeWorkspace] = useState(false);
  const [activeStudyRoom, setActiveStudyRoom] = useState<'social' | 'group' | null>(null);
  const [studyMessages, setStudyMessages] = useState<{
    social: Message[];
    group: Message[];
  }>({
    social: [],
    group: []
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // This useEffect will be moved after activeTab declaration

  // Function to detect if a message is about coding
  const isCodeRelated = (text: string): boolean => {
    // Exclude quiz-related contexts
    if (text.toLowerCase().includes('quiz') || 
        text.toLowerCase().includes('flashcard') || 
        text.toLowerCase().includes('practice') ||
        text.toLowerCase().includes('exam') ||
        text.toLowerCase().includes('assessment')) {
      return false;
    }
    
    const codeKeywords = [
      'code', 'coding', 'program', 'programming', 'function', 'class', 'variable', 
      'javascript', 'python', 'react', 'typescript', 'css', 'html', 'debug', 
      'algorithm', 'api', 'database', 'sql', 'git', 'github', 'npm', 'yarn',
      'component', 'useState', 'useEffect', 'import', 'export', 'const', 'let',
      'if', 'else', 'for', 'while', 'array', 'object', 'json', 'async', 'await'
    ];
    return codeKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  // Function to detect if a message is about quizzes/tests
  const isQuizRelated = (text: string): boolean => {
    const quizKeywords = [
      'quiz', 'test', 'exam', 'assessment', 'question', 'questions', 'practice',
      'mcq', 'multiple choice', 'true false', 'fill blank', 'evaluate', 'grade',
      'score', 'flashcard', 'review questions', 'practice test', 'mock exam'
    ];
    return quizKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  // Function to detect if a message is about study/collaboration
  const isStudyRelated = (text: string): boolean => {
    const studyKeywords = [
      'study group', 'study with', 'collaborate', 'work together', 'peer', 'classmate',
      'study buddy', 'group study', 'study session', 'discuss', 'share notes',
      'study plan', 'schedule', 'study commons', 'library', 'group work'
    ];
    return studyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  // Tab management functions
  const createNewTab = (type: 'general' | 'code' | 'quiz' | 'study' | 'creative') => {
    const tabConfig = {
      general: { title: 'General Chat', icon: '💬', color: 'bg-stone-600', textColor: 'text-white' },
      code: { title: 'Code Workspace', icon: '⚡', color: 'bg-black', textColor: 'text-white' },
      quiz: { title: 'Exam Tryout', icon: '🎯', color: 'bg-gray-600', textColor: 'text-white' },
      study: { title: 'Study Buddy', icon: '👥', color: 'bg-orange-600', textColor: 'text-white' },
      creative: { title: 'Creative & Design', icon: '🎨', color: 'bg-teal-600', textColor: 'text-white' }
    };

    const newTabId = `${type}-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      type,
      title: tabConfig[type].title,
      icon: tabConfig[type].icon,
      color: tabConfig[type].color,
      isActive: false,
      messages: [],
      isLoading: false
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat([{ ...newTab, isActive: true }]));
    setActiveTabId(newTabId);
    setShowSuggestions(true);
  };

  const switchToTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })));
    setActiveTabId(tabId);
  };

  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = tabs.find(tab => tab.id === tabId)?.isActive;
    
    if (tabs.length === 1) return; // Don't close the last tab
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    if (isActiveTab) {
      const newActiveTabId = tabs[tabIndex > 0 ? tabIndex - 1 : tabIndex + 1]?.id;
      if (newActiveTabId) {
        setActiveTabId(newActiveTabId);
        setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === newActiveTabId })));
      }
    }
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);
  const activeTab = getActiveTab();

  // Generate dynamic, personalized greeting based on time and weather
  const generateDynamicGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Time-based greetings
    const timeGreetings = {
      morning: ["Good morning! I'm Gawin.", "Morning! I'm Gawin.", "Hello there! I'm Gawin."],
      afternoon: ["Good afternoon! I'm Gawin.", "Afternoon! I'm Gawin.", "Hey! I'm Gawin."],
      evening: ["Good evening! I'm Gawin.", "Evening! I'm Gawin.", "Hi there! I'm Gawin."],
      night: ["Hi! I'm Gawin.", "Hello! I'm Gawin.", "Hey there! I'm Gawin."]
    };

    // Weather-aware variations (simulated - in production you'd use a weather API)
    const weatherGreetings = [
      "Hi! I'm Gawin, ready to brighten your day with learning!",
      "Hello! I'm Gawin, here to help you learn something amazing!",
      "Hey! I'm Gawin, your AI learning companion!",
      "Greetings! I'm Gawin, excited to explore knowledge with you!",
      "Hi there! I'm Gawin, let's make today a learning adventure!",
      "Hello! I'm Gawin, ready to dive into some fascinating topics!"
    ];

    // Determine time period
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Randomly choose between time-based and weather-aware greetings
    const useWeatherGreeting = Math.random() > 0.6;
    
    if (useWeatherGreeting) {
      const randomWeatherGreeting = weatherGreetings[Math.floor(Math.random() * weatherGreetings.length)];
      return `${randomWeatherGreeting} What would you like to learn today?`;
    } else {
      const timeBasedGreetings = timeGreetings[timeOfDay];
      const randomTimeGreeting = timeBasedGreetings[Math.floor(Math.random() * timeBasedGreetings.length)];
      return `${randomTimeGreeting} What would you like to learn today?`;
    }
  };

  const handleSend = async (text: string, tabId?: string) => {
    const messageText = text.trim();
    if (!messageText) return;
    
    const targetTab = tabId ? tabs.find(t => t.id === tabId) : activeTab;
    if (!targetTab) return;

    // Check workspace-related queries and create appropriate tab
    const isCodingQuery = isCodeRelated(messageText);
    const isQuizQuery = isQuizRelated(messageText);
    const isStudyQuery = isStudyRelated(messageText);
    
    let currentActiveTab = targetTab;
    
    if (isCodingQuery && !tabs.some(tab => tab.type === 'code' && tab.isActive)) {
      createNewTab('code');
      setShowCodeWorkspace(true); // Show workspace when code-related query is detected
      // Get the newly created tab
      const codeTab = tabs.find(tab => tab.type === 'code');
      if (codeTab) currentActiveTab = codeTab;
    } else if (isCodingQuery && tabs.some(tab => tab.type === 'code' && tab.isActive)) {
      setShowCodeWorkspace(true); // Show workspace if already on code tab
    } else if (isQuizQuery && !tabs.some(tab => tab.type === 'quiz' && tab.isActive)) {
      createNewTab('quiz');
      const quizTab = tabs.find(tab => tab.type === 'quiz');
      if (quizTab) currentActiveTab = quizTab;
    } else if (isStudyQuery && !tabs.some(tab => tab.type === 'study' && tab.isActive)) {
      createNewTab('study');
      const studyTab = tabs.find(tab => tab.type === 'study');
      if (studyTab) currentActiveTab = studyTab;
    }

    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    // Update the active tab with the new message and loading state
    setTabs(prev => prev.map(tab => 
      tab.id === currentActiveTab.id 
        ? { 
            ...tab, 
            messages: [...tab.messages, newMessage], 
            isLoading: true 
          }
        : tab
    ));
    
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...currentActiveTab.messages,
            newMessage
          ].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: 'llama-3.1-70b-versatile',
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.choices?.[0]?.message?.content) {
        const aiResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.choices[0].message.content,
          timestamp: new Date().toISOString()
        };

        // Update the tab with the AI response and remove loading state
        setTabs(prev => prev.map(tab => 
          tab.id === currentActiveTab.id 
            ? { 
                ...tab, 
                messages: [...tab.messages, newMessage, aiResponse], 
                isLoading: false 
              }
            : tab
        ));
      } else {
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show error message to user
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      
      // Update the tab with the error message and remove loading state
      setTabs(prev => prev.map(tab => 
        tab.id === currentActiveTab.id 
          ? { 
              ...tab, 
              messages: [...tab.messages, newMessage, errorResponse], 
              isLoading: false 
            }
          : tab
      ));
    }
  };


  // Removed old handleKeyPress since we now use per-tab inputs

  const clearChat = () => {
    if (!activeTab) return;
    setTabs(prev => prev.map(tab => 
      tab.id === activeTab.id 
        ? { ...tab, messages: [], isLoading: false }
        : tab
    ));
    setShowSuggestions(true);
  };

  // Auto-scroll effect (moved after activeTab declaration)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeTab?.messages]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Side Panel */}
      <div className={`${isLeftPanelOpen ? 'w-80 md:w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-900/90 backdrop-blur-sm border-r border-gray-700/50 ${isLeftPanelOpen ? 'fixed md:relative' : ''} ${isLeftPanelOpen ? 'inset-y-0 left-0 z-40 md:z-auto' : ''}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">G</span>
            </div>
            <div>
              <h1 className="font-serif text-xl text-white">Gawin AI</h1>
              <p className="text-sm text-gray-400">Your Learning Assistant</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.full_name || 'User'}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={onBackToLanding}
                className="w-full p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Landing</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>⊗</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isLeftPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsLeftPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Toggle Button - Claude AI Style */}
      <button
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg border border-gray-600/50 backdrop-blur-sm transition-colors flex items-center justify-center touch-manipulation"
        aria-label={isLeftPanelOpen ? "Close sidebar" : "Open sidebar"}
      >
        <div className="w-4 h-4 flex gap-0.5">
          {/* Narrow column */}
          <div className="w-1 h-4 bg-gray-300 rounded-sm"></div>
          {/* Wide column */}
          <div className="w-2.5 h-4 bg-gray-300 rounded-sm"></div>
        </div>
      </button>

      {/* Main Browser Container */}
      <div className="flex-1 p-6">
        <div className="h-full bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Browser-like Tab Bar with Mobile Scrolling */}
          <div className="relative bg-gray-700/50 border-b border-gray-600/50">
            <div className="flex items-center px-4 py-2">
              {/* Left scroll arrow for mobile */}
              <button 
                id="scroll-left"
                className="block md:hidden flex-shrink-0 p-1 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-gray-200 transition-colors mr-2"
                onClick={() => {
                  const container = document.getElementById('tabs-container');
                  if (container) container.scrollLeft -= 200;
                }}
              >
                <span className="text-lg">←</span>
              </button>

              {/* Scrollable tabs container */}
              <div 
                id="tabs-container"
                className="flex items-center space-x-1 flex-1 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tabs.map((tab) => {
                  // Get color configuration for each tab type
                  const getTabColors = (type: string, isActive: boolean) => {
                    // Material 3 Dark Theme with Turquoise as primary color
                    if (type === 'general') {
                      return isActive 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                    }
                    if (type === 'code') {
                      return isActive 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                    }
                    if (type === 'study') {
                      return isActive 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                    }
                    if (type === 'quiz') {
                      return isActive 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                    }
                    if (type === 'creative') {
                      return isActive 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                    }
                    // Default fallback
                    return isActive 
                      ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600';
                  };

                  return (
                    <div
                      key={tab.id}
                      className={`
                        relative flex items-center space-x-2 px-4 py-2 rounded-t-xl text-sm cursor-pointer transition-all duration-200 flex-shrink-0 border-t border-l border-r
                        ${getTabColors(tab.type, tab.isActive)}
                        ${tab.isActive ? 'shadow-sm z-10' : ''}
                      `}
                      onClick={() => switchToTab(tab.id)}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span className="font-medium whitespace-nowrap max-w-24 sm:max-w-32 truncate">{tab.title}</span>
                      {tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                          }}
                          className="ml-2 opacity-70 hover:opacity-100 hover:bg-white/20 rounded-full p-1 transition-all"
                        >
                          <span className="text-xs">×</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right scroll arrow for mobile */}
              <button 
                id="scroll-right"
                className="block md:hidden flex-shrink-0 p-1 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-gray-200 transition-colors ml-2"
                onClick={() => {
                  const container = document.getElementById('tabs-container');
                  if (container) container.scrollLeft += 200;
                }}
              >
                <span className="text-lg">→</span>
              </button>
              
              {/* Add New Tab Button */}
              <div className="relative flex-shrink-0 ml-2">
                <button
                  onClick={() => {
                    const dropdown = document.getElementById('tab-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
                
                {/* Dropdown Menu */}
                <div 
                  id="tab-dropdown"
                  className="absolute top-10 right-0 hidden bg-gray-800 border border-gray-600 rounded-xl shadow-lg py-2 z-50 min-w-48"
                >
                  <button
                    onClick={() => {
                      createNewTab('general');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span>💬</span>
                    <span>General Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('code');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span>⚡</span>
                    <span>Code Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('study');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span>👥</span>
                    <span>Study Buddy</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('quiz');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span>🎯</span>
                    <span>Exam Tryout</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('creative');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span>🎨</span>
                    <span>Creative & Design</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Study Buddy - Messenger Interface */}
          {activeTab && activeTab.type === 'study' ? (
            <div className="flex-1 flex flex-col h-full bg-gray-900/20">
              {!activeStudyRoom ? (
                // Study Room Selection
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="text-center max-w-2xl px-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <h2 className="font-serif text-4xl text-white mb-4">
                          👥 Study Commons
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed">
                          Connect with fellow learners and collaborate on your studies
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {/* Social Learning Room */}
                        <motion.div
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setActiveStudyRoom('social')}
                          className="bg-gray-800/90 border border-gray-600/50 rounded-3xl p-8 cursor-pointer hover:border-gray-500/70 transition-all group"
                        >
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-gray-600/50 transition-colors">
                              <span className="text-3xl">🌟</span>
                            </div>
                            <h3 className="text-xl font-medium text-white">Social Learning</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              Open discussions, study tips, and collaborative learning with learners from different topics and subjects.
                            </p>
                            <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span>12 active learners</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Group Study Room */}
                        <motion.div
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setActiveStudyRoom('group')}
                          className="bg-gray-800/90 border border-gray-600/50 rounded-3xl p-8 cursor-pointer hover:border-gray-500/70 transition-all group"
                        >
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-gray-600/50 transition-colors">
                              <span className="text-3xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-medium text-white">Group Study</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              Focused study sessions with committed peers working on specific subjects or preparing for exams together.
                            </p>
                            <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span>5 active groups</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                // Messenger-style Chat Interface
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-gray-800/90 border-b border-gray-600/50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setActiveStudyRoom(null)}
                        className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors flex items-center justify-center"
                      >
                        <span className="text-gray-400">←</span>
                      </button>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                          <span className="text-xl">{activeStudyRoom === 'social' ? '🌟' : '🎯'}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {activeStudyRoom === 'social' ? '12 learners online' : '5 groups active'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    {studyMessages[activeStudyRoom].length === 0 ? (
                      <div className="text-center py-16">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-2xl">{activeStudyRoom === 'social' ? '🌟' : '🎯'}</span>
                          </div>
                          <h4 className="text-xl text-white">
                            Welcome to {activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}!
                          </h4>
                          <p className="text-gray-400 max-w-md mx-auto">
                            {activeStudyRoom === 'social' 
                              ? 'Start a conversation, share study tips, or ask questions about any subject.'
                              : 'Form study groups, collaborate on assignments, and prepare for exams together.'
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      studyMessages[activeStudyRoom].map((message, index) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'user' 
                              ? 'bg-teal-600 text-white' 
                              : 'bg-gray-700/50 text-white'
                          }`}>
                            <div className="font-sans leading-relaxed">
                              {message.content}
                            </div>
                            <div className="mt-2 text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder={`Message ${activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}...`}
                        className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500 placeholder-gray-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              const newMessage: Message = {
                                id: Date.now(),
                                role: 'user',
                                content: target.value.trim(),
                                timestamp: new Date().toISOString()
                              };
                              setStudyMessages(prev => ({
                                ...prev,
                                [activeStudyRoom!]: [...prev[activeStudyRoom!], newMessage]
                              }));
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button className="w-10 h-10 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center transition-colors">
                        <span className="text-white">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Regular Chat Area for other tabs
            <div className={`flex-1 flex flex-col h-full ${
              activeTab?.type === 'code' ? 'bg-gray-900/40' :
              activeTab?.type === 'quiz' ? 'bg-gray-900/40' :
              activeTab?.type === 'creative' ? 'bg-gray-900/40' :
              'bg-gray-900/20'
            }`}>
            {/* Main Chat with Integrated Workspaces */}
            <div className="w-full flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-6"
              >
          {activeTab && activeTab.messages.length === 0 && activeTab.type === 'general' ? (
            <div className="h-full flex items-center justify-center py-16">
              <div className="text-center max-w-2xl px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  {(() => {
                    const greeting = generateDynamicGreeting();
                    const parts = greeting.split('What would you like to learn today?');
                    return (
                      <>
                        <p className="text-xl text-gray-300 leading-relaxed">
                          {parts[0].trim()}
                        </p>
                        <h2 className="font-serif text-3xl text-white">
                          What would you like to learn today?
                        </h2>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
            </div>
          ) : activeTab && activeTab.messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeTab.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-6 shadow-xl border-0 rounded-2xl
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-teal-500/25' 
                      : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-gray-800/50 ring-1 ring-gray-600/50'
                    }
                    backdrop-blur-sm transition-all duration-200 hover:shadow-2xl
                    ${message.role === 'user' ? 'hover:shadow-teal-500/35' : 'hover:shadow-gray-800/60'}
                  `}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-stone max-w-none">
                        <MessageRenderer text={message.content} />
                      </div>
                    ) : (
                      <div className="font-sans leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    
                    <div className={`
                      mt-3 pt-3 border-t text-xs
                      ${message.role === 'user' 
                        ? 'border-white/20 text-white/70' 
                        : 'border-gray-500 text-gray-300'
                      }
                    `}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}


              {activeTab && activeTab.isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-600/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-gray-300 text-sm font-serif italic">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              {/* Show prompt to access workspace for empty code tabs */}
              {activeTab && activeTab.type === 'code' && !showCodeWorkspace && (
                <div className="h-full flex items-center justify-center py-16">
                  <div className="text-center max-w-2xl px-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-4"
                    >
                      <h2 className="font-serif text-3xl text-white mb-4">
                        ⚡ Code Workspace
                      </h2>
                      <p className="text-xl text-gray-300 leading-relaxed">
                        Ask me anything about programming, or share your code for analysis and debugging.
                      </p>
                      <button
                        onClick={() => setShowCodeWorkspace(true)}
                        className="mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-medium transition-colors shadow-lg"
                      >
                        Open Code Editor
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          )}
              </div>
            </div>

            {/* Always show specialized content for active tabs (both with and without messages) */}
            {/* Specialized Content for Active Tab */}
            {activeTab && activeTab.type === 'code' && showCodeWorkspace && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-3xl shadow-lg p-4 md:p-6 mb-6 max-h-96 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <h3 className="text-white font-medium text-lg">Code Workspace</h3>
                    </div>
                    <div className="bg-black/95 rounded-2xl border border-stone-700/50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-stone-700/50 bg-stone-900/50">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="ml-4 text-stone-400 text-sm font-mono">editor.js</span>
                        </div>
                      </div>
                      <textarea
                        value={codeContent}
                        onChange={(e) => setCodeContent(e.target.value)}
                        placeholder="// Write or paste your code here..."
                        className="w-full h-64 bg-transparent text-green-400 font-mono text-sm resize-none p-4 focus:outline-none placeholder-stone-500"
                        spellCheck={false}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleSend(`Review this code:\n\`\`\`\n${codeContent}\n\`\`\``, activeTab?.id)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
                        disabled={!codeContent.trim()}
                      >
                        Review Code
                      </button>
                      <button
                        onClick={() => handleSend(`Explain this code:\n\`\`\`\n${codeContent}\n\`\`\``, activeTab?.id)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
                        disabled={!codeContent.trim()}
                      >
                        Explain
                      </button>
                      <button
                        onClick={() => handleSend(`Debug this code:\n\`\`\`\n${codeContent}\n\`\`\``, activeTab?.id)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
                        disabled={!codeContent.trim()}
                      >
                        Debug
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Exam Tryout Tab - Mobile-First Quiz Generator */}
            {activeTab && activeTab.type === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 py-4"
              >
                <div className="max-w-md mx-auto space-y-4">
                  {/* Header */}
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-2xl font-semibold text-white">🎯 Quiz Generator</h2>
                    <p className="text-gray-400 text-sm">Create personalized quizzes instantly</p>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">What topic?</label>
                    <input
                      type="text"
                      placeholder="e.g., Math, History, Science..."
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500 placeholder-gray-500"
                    />
                  </div>

                  {/* Quick Settings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Questions</label>
                      <select className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Level</label>
                      <select className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Types */}
                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium">Question Types</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-2xl border border-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500" defaultChecked />
                        <span className="text-white text-sm">Multiple Choice</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-2xl border border-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500" />
                        <span className="text-white text-sm">True/False</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-2xl border border-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500" />
                        <span className="text-white text-sm">Short Answer</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => handleSend('Create a comprehensive quiz on [topic] with [number] multiple choice and written questions at [difficulty] level. Use current Philippine education standards and include recent developments in the field. Focus on critical thinking and practical application of concepts. Ensure questions test both theoretical knowledge and real-world understanding.', activeTab?.id)}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-colors shadow-lg mt-6"
                  >
                    Create Quiz
                  </button>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => handleSend('Design practice exercises and review questions for [topic] that help students master key concepts through repetition and varied problem-solving approaches. Include explanations for each answer.', activeTab?.id)}
                      className="py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-2xl transition-colors"
                    >
                      Practice Mode
                    </button>
                    <button
                      onClick={() => handleSend('Build interactive flashcards for [topic] with clear definitions, examples, and memory aids. Include both front-to-back and back-to-front review options for comprehensive learning.', activeTab?.id)}
                      className="py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-2xl transition-colors"
                    >
                      Flashcards
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Creative Tab - Unleash Creativity Space */}
            {activeTab && activeTab.type === 'creative' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-3xl shadow-lg p-8 mb-6">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <h3 className="text-white font-medium text-2xl">Creative Studio</h3>
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto">
                      <h4 className="text-3xl font-serif text-white mb-4">
                        🎨 Unleash Your Creativity
                      </h4>
                      <p className="text-lg text-gray-300 leading-relaxed">
                        Welcome to your creative sanctuary! This space is designed to inspire and amplify your imagination.
                      </p>
                      <p className="text-gray-400">
                        Whether you're crafting stories, brainstorming ideas, writing poetry, or creating visual concepts, 
                        I'm here to help bring your creative visions to life.
                      </p>
                      
                      <div className="bg-gradient-to-r from-teal-900/30 to-purple-900/30 border border-teal-700/50 rounded-2xl p-6 mt-8">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <span className="text-2xl">🖼️</span>
                          <h5 className="text-xl font-medium text-teal-100">Image Generation Powered by Pollinations AI</h5>
                        </div>
                        <p className="text-gray-300 text-center">
                          Describe any image you can imagine, and I'll create stunning visuals using advanced AI technology.
                        </p>
                      </div>

                      <div className="pt-6">
                        <p className="text-gray-400 text-sm">
                          ✨ Use the chat below to start your creative journey - ask for stories, poems, images, or any creative assistance!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* Per-Tab Input Area - Each tab has its own input */}
            {activeTab && (
              <div className="px-6 py-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-600/50">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <input
                      key={activeTab.id} // Force re-render for each tab
                      type="text"
                      defaultValue=""
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          handleSend(target.value, activeTab.id);
                          target.value = '';
                        }
                      }}
                      placeholder={`Ask me anything ${
                        activeTab.type === 'code' ? 'about programming...' :
                        activeTab.type === 'study' ? 'about studying...' :
                        activeTab.type === 'quiz' ? 'about assessments...' :
                        activeTab.type === 'creative' ? 'to unleash creativity...' :
                        'about your studies...'
                      }`}
                      className="w-full px-8 pr-16 bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all duration-300 font-sans placeholder-gray-400 text-lg resize-none overflow-hidden border border-gray-700 focus:border-teal-500"
                      style={{ 
                        height: '64px', 
                        minHeight: '64px', 
                        maxHeight: '64px', 
                        lineHeight: '32px',
                        borderRadius: '32px',
                        paddingTop: '16px',
                        paddingBottom: '16px'
                      }}
                      disabled={activeTab.isLoading}
                    />
                    
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        if (input.value.trim()) {
                          handleSend(input.value.trim(), activeTab.id);
                          input.value = '';
                        }
                      }}
                      disabled={activeTab.isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                    >
                      <span className="text-white text-xl">
                        {activeTab.isLoading ? '⋯' : '→'}
                      </span>
                    </button>
                  </div>
                  
                </div>
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </div>
  );
}