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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'general-1',
      type: 'general',
      title: 'General Chat',
      icon: '💬',
      color: 'bg-stone-600',
      isActive: true
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('general-1');
  const [codeContent, setCodeContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to detect if a message is about coding
  const isCodeRelated = (text: string): boolean => {
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
      general: { title: 'General Chat', icon: '💬', color: 'bg-stone-600' },
      code: { title: 'Code Workspace', icon: '⚡', color: 'bg-black' },
      quiz: { title: 'Exam Tryout', icon: '🎯', color: 'bg-blue-600' },
      study: { title: 'Study Buddy', icon: '👥', color: 'bg-green-600' },
      creative: { title: 'Creative & Design', icon: '🎨', color: 'bg-purple-600' }
    };

    const newTabId = `${type}-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      type,
      title: tabConfig[type].title,
      icon: tabConfig[type].icon,
      color: tabConfig[type].color,
      isActive: false
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat([{ ...newTab, isActive: true }]));
    setActiveTabId(newTabId);
    setMessages([]);
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

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Check workspace-related queries and create appropriate tab
    const isCodingQuery = isCodeRelated(messageText);
    const isQuizQuery = isQuizRelated(messageText);
    const isStudyQuery = isStudyRelated(messageText);
    
    if (isCodingQuery && !tabs.some(tab => tab.type === 'code' && tab.isActive)) {
      createNewTab('code');
    } else if (isQuizQuery && !tabs.some(tab => tab.type === 'quiz' && tab.isActive)) {
      createNewTab('quiz');
    } else if (isStudyQuery && !tabs.some(tab => tab.type === 'study' && tab.isActive)) {
      createNewTab('study');
    }

    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages,
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

        setMessages(prev => [...prev, aiResponse]);
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
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-stone-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToLanding}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <span className="text-stone-600">←</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <h1 className="font-serif text-lg text-stone-900">Gawin AI</h1>
                <p className="text-xs text-stone-500">Your Learning Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-stone-800">{user.full_name || 'User'}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-stone-600 to-zinc-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Browser-like Container */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white/80 backdrop-blur-sm border border-stone-300/50 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Browser-like Tab Bar */}
          <div className="flex items-center bg-stone-100/50 border-b border-stone-200/50 px-4 py-2">
            <div className="flex items-center space-x-1 flex-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2 rounded-t-xl text-sm cursor-pointer transition-all duration-200
                    ${tab.isActive 
                      ? 'bg-white text-stone-800 border-t border-l border-r border-stone-200 shadow-sm' 
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }
                  `}
                  onClick={() => switchToTab(tab.id)}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="font-medium max-w-32 truncate">{tab.title}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full p-1 transition-colors"
                    >
                      <span className="text-xs">×</span>
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add New Tab Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    const dropdown = document.getElementById('tab-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
                
                {/* Dropdown Menu */}
                <div 
                  id="tab-dropdown"
                  className="absolute top-10 left-0 hidden bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50 min-w-48"
                >
                  <button
                    onClick={() => {
                      createNewTab('general');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center space-x-3 text-stone-700 hover:text-stone-900"
                  >
                    <span>💬</span>
                    <span>General Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('code');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center space-x-3 text-stone-700 hover:text-stone-900"
                  >
                    <span>⚡</span>
                    <span>Code Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('study');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center space-x-3 text-stone-700 hover:text-stone-900"
                  >
                    <span>👥</span>
                    <span>Study Buddy</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('quiz');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center space-x-3 text-stone-700 hover:text-stone-900"
                  >
                    <span>🎯</span>
                    <span>Exam Tryout</span>
                  </button>
                  <button
                    onClick={() => {
                      createNewTab('creative');
                      document.getElementById('tab-dropdown')?.classList.add('hidden');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center space-x-3 text-stone-700 hover:text-stone-900"
                  >
                    <span>🎨</span>
                    <span>Creative & Design</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Main Chat with Integrated Workspaces */}
            <div className="w-full flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-6"
              >
          {messages.length === 0 && activeTab?.type === 'general' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-serif text-3xl text-stone-800 mb-4">
                    What would you like to learn today?
                  </h2>
                  <p className="text-stone-600 mb-8">
                    Ask me anything about mathematics, science, programming, writing, or any subject you're studying.
                  </p>

                </motion.div>

              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] p-6 rounded-2xl shadow-sm border-2
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-br from-stone-800 to-zinc-800 text-white border-stone-700' 
                      : 'bg-gradient-to-br from-white to-stone-50 text-stone-800 border-stone-200/50'
                    }
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
                        : 'border-stone-200 text-stone-500'
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

              {/* Always show specialized content for active tabs (both with and without messages) */}

              {/* Specialized Content for Active Tab */}
              {activeTab && activeTab.type === 'code' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6 max-h-96 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <h3 className="text-stone-800 font-medium text-lg">Code Workspace</h3>
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setInput(`Review this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          disabled={!codeContent.trim()}
                        >
                          Review Code
                        </button>
                        <button
                          onClick={() => setInput(`Explain this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                          className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          disabled={!codeContent.trim()}
                        >
                          Explain
                        </button>
                        <button
                          onClick={() => setInput(`Debug this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                          className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          disabled={!codeContent.trim()}
                        >
                          Debug
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Study Buddy Tab - Messenger-style with Rooms */}
              {activeTab && activeTab.type === 'study' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h3 className="text-stone-800 font-medium text-lg">Study Commons</h3>
                      </div>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-medium transition-colors">
                        Create Room
                      </button>
                    </div>
                    
                    {/* Study Rooms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">Math Study Group</h4>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">3 active</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">Calculus problem solving session</p>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                          Join Room
                        </button>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-800">CS Study Hall</h4>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">5 active</span>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">Data structures & algorithms</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                          Join Room
                        </button>
                      </div>
                    </div>

                    {/* Quick Study Actions */}
                    <div className="mt-4 pt-4 border-t border-stone-200/50">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setInput('Start a study session for [subject]')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Start Study Session
                        </button>
                        <button
                          onClick={() => setInput('Find study buddies for [topic]')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Find Study Buddy
                        </button>
                        <button
                          onClick={() => setInput('Create study notes for [subject]')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Create Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Exam Tryout Tab - Quiz & Assessment Generator */}
              {activeTab && activeTab.type === 'quiz' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-stone-800 font-medium text-lg">Exam Tryout</h3>
                      </div>

                      {/* Quiz Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-stone-700 text-sm font-medium mb-2">Quiz Topic</label>
                            <input
                              type="text"
                              placeholder="Enter the topic for your quiz..."
                              className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder-stone-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 text-sm font-medium mb-2">Questions</label>
                              <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                <option value="5">5 Questions</option>
                                <option value="10">10 Questions</option>
                                <option value="15">15 Questions</option>
                                <option value="20">20 Questions</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 text-sm font-medium mb-2">Difficulty</label>
                              <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-stone-700 text-sm font-medium mb-2">Question Types</label>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-stone-400 text-blue-600" defaultChecked />
                                <span className="text-stone-700 text-sm">Multiple Choice</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-stone-400 text-blue-600" />
                                <span className="text-stone-700 text-sm">True/False</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-stone-400 text-blue-600" />
                                <span className="text-stone-700 text-sm">Short Answer</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Quiz Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => setInput('Generate a quiz about [topic] with [number] questions at [difficulty] level')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Generate Quiz
                        </button>
                        <button
                          onClick={() => setInput('Create practice questions for studying [topic]')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Practice Mode
                        </button>
                        <button
                          onClick={() => setInput('Make flashcards for [topic]')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Flashcards
                        </button>
                        <button
                          onClick={() => setInput('Create a mock exam for [subject]')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Mock Exam
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Creative Tab - Image Generation & Creative Content */}
              {activeTab && activeTab.type === 'creative' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h3 className="text-stone-800 font-medium text-lg">Creative Studio</h3>
                      </div>

                      {/* Image Generation Section */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
                        <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                          <span className="mr-2">🎨</span>
                          Image Generation
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Describe the image you want to create..."
                            className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 placeholder-stone-500"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                              Realistic
                            </button>
                            <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                              Artistic
                            </button>
                            <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                              Cartoon
                            </button>
                            <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                              Abstract
                            </button>
                          </div>
                          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                            Generate Image
                          </button>
                        </div>
                      </div>

                      {/* Creative Writing Section */}
                      <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 rounded-2xl p-4">
                        <h4 className="font-medium text-pink-800 mb-3 flex items-center">
                          <span className="mr-2">✍️</span>
                          Creative Writing
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setInput('Write a creative story about [topic]')}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Story Generator
                          </button>
                          <button
                            onClick={() => setInput('Create a poem about [theme]')}
                            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Poetry
                          </button>
                          <button
                            onClick={() => setInput('Help me brainstorm ideas for [project]')}
                            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Brainstorm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] p-6 bg-gradient-to-br from-white to-stone-50 border-2 border-stone-200/50 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-stone-600 text-sm font-serif italic">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              {/* No messages - show specialized workspace content immediately */}
            </div>
          )}
              </div>
            </div>

            {/* Always show specialized content for active tabs (both with and without messages) */}
            {/* Specialized Content for Active Tab */}
            {activeTab && activeTab.type === 'code' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6 max-h-96 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <h3 className="text-stone-800 font-medium text-lg">Code Workspace</h3>
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setInput(`Review this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        disabled={!codeContent.trim()}
                      >
                        Review Code
                      </button>
                      <button
                        onClick={() => setInput(`Explain this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                        className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        disabled={!codeContent.trim()}
                      >
                        Explain
                      </button>
                      <button
                        onClick={() => setInput(`Debug this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                        className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        disabled={!codeContent.trim()}
                      >
                        Debug
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Study Buddy Tab - Messenger-style with Rooms */}
            {activeTab && activeTab.type === 'study' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="text-stone-800 font-medium text-lg">Study Commons</h3>
                    </div>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-medium transition-colors">
                      Create Room
                    </button>
                  </div>
                  
                  {/* Study Rooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">Math Study Group</h4>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">3 active</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">Calculus problem solving session</p>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                        Join Room
                      </button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">CS Study Hall</h4>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">5 active</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">Data structures & algorithms</p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                        Join Room
                      </button>
                    </div>
                  </div>

                  {/* Quick Study Actions */}
                  <div className="mt-4 pt-4 border-t border-stone-200/50">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setInput('Start a study session for [subject]')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Start Study Session
                      </button>
                      <button
                        onClick={() => setInput('Find study buddies for [topic]')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Find Study Buddy
                      </button>
                      <button
                        onClick={() => setInput('Create study notes for [subject]')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Create Notes
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Exam Tryout Tab - Quiz & Assessment Generator */}
            {activeTab && activeTab.type === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="text-stone-800 font-medium text-lg">Exam Tryout</h3>
                    </div>

                    {/* Quiz Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-2">Quiz Topic</label>
                          <input
                            type="text"
                            placeholder="Enter the topic for your quiz..."
                            className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder-stone-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-700 text-sm font-medium mb-2">Questions</label>
                            <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                              <option value="5">5 Questions</option>
                              <option value="10">10 Questions</option>
                              <option value="15">15 Questions</option>
                              <option value="20">20 Questions</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-stone-700 text-sm font-medium mb-2">Difficulty</label>
                            <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-2">Question Types</label>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-stone-400 text-blue-600" defaultChecked />
                              <span className="text-stone-700 text-sm">Multiple Choice</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-stone-400 text-blue-600" />
                              <span className="text-stone-700 text-sm">True/False</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-stone-400 text-blue-600" />
                              <span className="text-stone-700 text-sm">Short Answer</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Quiz Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => setInput('Generate a quiz about [topic] with [number] questions at [difficulty] level')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Generate Quiz
                      </button>
                      <button
                        onClick={() => setInput('Create practice questions for studying [topic]')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Practice Mode
                      </button>
                      <button
                        onClick={() => setInput('Make flashcards for [topic]')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Flashcards
                      </button>
                      <button
                        onClick={() => setInput('Create a mock exam for [subject]')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                      >
                        Mock Exam
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Creative Tab - Image Generation & Creative Content */}
            {activeTab && activeTab.type === 'creative' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-4 lg:px-6"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h3 className="text-stone-800 font-medium text-lg">Creative Studio</h3>
                    </div>

                    {/* Image Generation Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
                      <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                        <span className="mr-2">🎨</span>
                        Image Generation
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Describe the image you want to create..."
                          className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 placeholder-stone-500"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                            Realistic
                          </button>
                          <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                            Artistic
                          </button>
                          <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                            Cartoon
                          </button>
                          <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition-colors">
                            Abstract
                          </button>
                        </div>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                          Generate Image
                        </button>
                      </div>
                    </div>

                    {/* Creative Writing Section */}
                    <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 rounded-2xl p-4">
                      <h4 className="font-medium text-pink-800 mb-3 flex items-center">
                        <span className="mr-2">✍️</span>
                        Creative Writing
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setInput('Write a creative story about [topic]')}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Story Generator
                        </button>
                        <button
                          onClick={() => setInput('Create a poem about [theme]')}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Poetry
                        </button>
                        <button
                          onClick={() => setInput('Help me brainstorm ideas for [project]')}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                        >
                          Brainstorm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* Input Area */}
            <div className="px-6 py-6 bg-white/60 backdrop-blur-sm border-t border-stone-200/30">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    className="w-full px-8 pr-16 bg-stone-800 text-white focus:outline-none focus:ring-4 focus:ring-stone-600/30 transition-all duration-300 font-sans placeholder-stone-400 text-lg resize-none overflow-hidden"
                    style={{ 
                      height: '64px', 
                      minHeight: '64px', 
                      maxHeight: '64px', 
                      lineHeight: '32px',
                      borderRadius: '32px',
                      paddingTop: '16px',
                      paddingBottom: '16px'
                    }}
                    disabled={isLoading}
                  />
                  
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-500 hover:bg-teal-600 disabled:bg-stone-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-xl">
                      {isLoading ? '⋯' : '→'}
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4 px-4">
                  <p className="text-xs text-stone-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-stone-500">
                    <span>Powered by AI Orchestrator</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}