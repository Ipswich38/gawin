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

const quickActions = [
  { text: "Summarize this", icon: "📝" },
  { text: "Explain simply", icon: "💡" },
  { text: "Step by step", icon: "📋" },
  { text: "Practice quiz", icon: "❓" }
];

export default function ModernChatInterface({ user, onLogout, onBackToLanding }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showCodeWorkspace, setShowCodeWorkspace] = useState(false);
  const [showQuizWorkspace, setShowQuizWorkspace] = useState(false);
  const [showStudyWorkspace, setShowStudyWorkspace] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState<'code' | 'quiz' | 'study' | null>(null);
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

  // Workspace control functions
  const openWorkspace = (type: 'code' | 'quiz' | 'study') => {
    // Close all workspaces first
    setShowCodeWorkspace(false);
    setShowQuizWorkspace(false);
    setShowStudyWorkspace(false);
    
    // Open the requested workspace
    if (type === 'code') setShowCodeWorkspace(true);
    if (type === 'quiz') setShowQuizWorkspace(true);
    if (type === 'study') setShowStudyWorkspace(true);
    
    setCurrentWorkspace(type);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Check workspace-related queries
    const isCodingQuery = isCodeRelated(messageText);
    const isQuizQuery = isQuizRelated(messageText);
    const isStudyQuery = isStudyRelated(messageText);
    
    if (isCodingQuery && !showCodeWorkspace) openWorkspace('code');
    else if (isQuizQuery && !showQuizWorkspace) openWorkspace('quiz');
    else if (isStudyQuery && !showStudyWorkspace) openWorkspace('study');

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
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
              >
                New Chat
              </button>
            )}
            
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

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Main Chat with Integrated Workspaces */}
        <div className="w-full flex flex-col">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-6"
          >
          {messages.length === 0 ? (
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
          ) : (
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

              {/* Integrated Workspace Cards */}
              {(showCodeWorkspace || showQuizWorkspace || showStudyWorkspace) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  {/* Workspace Tab Bar - Perplexity/Opera AI Inspired */}
                  <div className="mb-4 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-1.5 shadow-lg">
                      <div className="flex space-x-1">
                        {showCodeWorkspace && (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-black/90 text-white rounded-xl text-sm font-medium shadow-sm">
                            <span className="text-teal-400">&lt;/&gt;</span>
                            <span>Code Workspace</span>
                            <button 
                              onClick={() => {setShowCodeWorkspace(false); setCurrentWorkspace(null);}}
                              className="ml-1 text-white/70 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        {showQuizWorkspace && (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm">
                            <span className="text-blue-200">🎯</span>
                            <span>Exam Tryout</span>
                            <button 
                              onClick={() => {setShowQuizWorkspace(false); setCurrentWorkspace(null);}}
                              className="ml-1 text-white/70 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        {showStudyWorkspace && (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium shadow-sm">
                            <span className="text-green-200">👥</span>
                            <span>Study Buddy</span>
                            <button 
                              onClick={() => {setShowStudyWorkspace(false); setCurrentWorkspace(null);}}
                              className="ml-1 text-white/70 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Workspace Content Card */}
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-lg p-6 mb-6">
                    {/* Code Workspace Content */}
                    {showCodeWorkspace && (
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
                    )}

                    {/* Quiz Workspace Content */}
                    {showQuizWorkspace && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h3 className="text-stone-800 font-medium text-lg">Exam Tryout</h3>
                        </div>
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
                        </div>
                      </div>
                    )}

                    {/* Study Workspace Content */}
                    {showStudyWorkspace && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h3 className="text-stone-800 font-medium text-lg">Study Buddy</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-stone-700 text-sm font-medium mb-2">Study Session Topic</label>
                              <input
                                type="text"
                                placeholder="What are you studying today..."
                                className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 placeholder-stone-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-stone-700 text-sm font-medium mb-2">Study Method</label>
                                <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400">
                                  <option value="group">Group Discussion</option>
                                  <option value="review">Note Review</option>
                                  <option value="practice">Practice Problems</option>
                                  <option value="explain">Teach & Explain</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-stone-700 text-sm font-medium mb-2">Duration</label>
                                <select className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400">
                                  <option value="25">25 minutes</option>
                                  <option value="45">45 minutes</option>
                                  <option value="60">1 hour</option>
                                  <option value="90">1.5 hours</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-stone-700 text-sm font-medium mb-2">Study Goals</label>
                              <textarea
                                placeholder="What do you want to achieve in this study session?"
                                rows={3}
                                className="w-full bg-white/80 border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 placeholder-stone-500 resize-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-green-800 text-sm font-medium">Study Timer</span>
                                <span className="text-green-600 text-xl font-mono">00:00:00</span>
                              </div>
                              <div className="flex space-x-2">
                                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                                  Start
                                </button>
                                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                                  Break
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => setInput('Help me create a study plan for [subject]')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Study Plan
                          </button>
                          <button
                            onClick={() => setInput('Explain [topic] in simple terms')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Simplify
                          </button>
                          <button
                            onClick={() => setInput('Give me practice problems for [subject]')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors shadow-sm"
                          >
                            Practice
                          </button>
                        </div>
                      </div>
                    )}
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
          )}
        </div>

        {/* Quick Actions Bar */}
        {messages.length > 0 && (
          <div className="px-6 py-3 border-t border-stone-200/50 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-3">
              {quickActions.map((action) => (
                <button
                  key={action.text}
                  onClick={() => handleSend(action.text)}
                  className="flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-sm text-stone-600 transition-colors"
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-6 bg-white/60 backdrop-blur-sm border-t border-stone-200/30">
          <div className="max-w-4xl mx-auto">
            {/* Workspace Chips - Above Input */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button
                onClick={() => openWorkspace('code')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  currentWorkspace === 'code' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span className={currentWorkspace === 'code' ? 'text-teal-400' : 'text-stone-500'}>&lt;/&gt;</span>
                <span>Code</span>
              </button>
              <button
                onClick={() => openWorkspace('study')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  currentWorkspace === 'study' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span className={currentWorkspace === 'study' ? 'text-green-200' : 'text-stone-500'}>👥</span>
                <span>Study Buddy</span>
              </button>
              <button
                onClick={() => openWorkspace('quiz')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  currentWorkspace === 'quiz' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span className={currentWorkspace === 'quiz' ? 'text-blue-200' : 'text-stone-500'}>🎯</span>
                <span>Exam Tryout</span>
              </button>
            </div>
            
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="w-full px-8 pr-16 bg-stone-800 text-white rounded-full focus:outline-none focus:ring-4 focus:ring-stone-600/30 transition-all duration-300 font-sans placeholder-stone-400 text-lg resize-none overflow-hidden"
                style={{ height: '64px', minHeight: '64px', maxHeight: '64px', lineHeight: '64px' }}
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
  );
}