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
  const [showCodeWorkspace, setShowCodeWorkspace] = useState(false);
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

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Check if this is a coding-related query
    const isCodingQuery = isCodeRelated(messageText);
    if (isCodingQuery && !showCodeWorkspace) {
      setShowCodeWorkspace(true);
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
      <div className="flex-1 overflow-hidden flex">
        {/* Main Chat */}
        <div className={`${showCodeWorkspace ? 'flex-1' : 'w-full'} flex flex-col`}>
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
                className="w-full px-8 py-6 pr-16 bg-stone-800 text-white rounded-full focus:outline-none focus:ring-4 focus:ring-stone-600/30 transition-all duration-300 font-sans placeholder-stone-400 text-lg h-16"
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

        {/* Code Workspace Panel */}
        {showCodeWorkspace && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-stone-200/50 bg-black/95 flex flex-col"
          >
            {/* Code Workspace Header */}
            <div className="px-4 py-3 border-b border-stone-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-teal-400 text-lg">&lt;/&gt;</span>
                <h3 className="text-white font-mono text-sm">Code Workspace</h3>
              </div>
              <button
                onClick={() => setShowCodeWorkspace(false)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 p-4">
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Write or paste your code here..."
                className="w-full h-full bg-transparent text-green-400 font-mono text-sm resize-none border border-stone-700 rounded-lg p-4 focus:outline-none focus:border-teal-500 placeholder-stone-500"
                spellCheck={false}
              />
            </div>

            {/* Code Actions */}
            <div className="px-4 py-3 border-t border-stone-700/50">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInput(`Review this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded font-mono transition-colors"
                  disabled={!codeContent.trim()}
                >
                  Review Code
                </button>
                <button
                  onClick={() => setInput(`Explain this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                  className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded font-mono transition-colors"
                  disabled={!codeContent.trim()}
                >
                  Explain
                </button>
                <button
                  onClick={() => setInput(`Debug this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                  className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded font-mono transition-colors"
                  disabled={!codeContent.trim()}
                >
                  Debug
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}