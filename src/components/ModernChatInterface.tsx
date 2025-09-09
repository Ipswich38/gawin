'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

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
      // Simulate AI response - replace with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generateMockResponse(messageText),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const responses = [
      `I'd be happy to help you with "${query}". Let me break this down step by step and provide you with a comprehensive explanation that's easy to understand.`,
      `Great question about "${query}"! This is a fascinating topic that connects to several key concepts. Let me walk you through the fundamentals.`,
      `To address your question about "${query}", I'll provide both the theoretical background and practical applications you might find useful.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
    <div className="h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 flex flex-col">
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
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
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

                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
                  >
                    {suggestionPrompts.map((prompt, index) => (
                      <motion.button
                        key={prompt.text}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => handleSend(prompt.text)}
                        className="group p-6 bg-gradient-to-br from-orange-50 to-stone-50 border-2 border-stone-200/50 rounded-2xl hover:border-stone-300/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">
                            {prompt.icon}
                          </div>
                          <h3 className="font-sans font-bold text-xs tracking-wider text-stone-700 mb-1 uppercase">
                            {prompt.text}
                          </h3>
                          <p className="text-xs text-stone-500 font-serif">
                            {prompt.category}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
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
        <div className="px-6 py-6 bg-white/80 backdrop-blur-sm border-t border-stone-200/50">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="w-full px-6 py-4 pr-16 bg-white border-2 border-stone-200/50 rounded-full resize-none focus:outline-none focus:border-stone-400/50 focus:shadow-lg transition-all duration-300 font-sans placeholder-stone-400"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-sm">
                  {isLoading ? '⋯' : '→'}
                </span>
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 px-3">
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
  );
}